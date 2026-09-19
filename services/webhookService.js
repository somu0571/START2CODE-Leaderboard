const { db } = require('../config/firebase');
const repoConfig = require('../config/repo');
const { validateRepository, isBotUser, buildContributionId } = require('../utils/github');
const pointsService = require('./pointsService');
const contributorService = require('./contributorService');
const contributionService = require('./contributionService');
const auditService = require('./auditService');

const WEBHOOK_COLLECTION = 'webhookEvents';

async function isDuplicateDelivery(deliveryId) {
  if (!deliveryId) return false;
  const doc = await db.collection(WEBHOOK_COLLECTION).doc(deliveryId).get();
  return doc.exists;
}

async function logWebhookEvent(deliveryId, eventData) {
  const ref = db.collection(WEBHOOK_COLLECTION).doc(deliveryId || `manual_${Date.now()}`);
  await ref.set({
    deliveryId,
    event: eventData.event,
    action: eventData.action,
    prNumber: eventData.prNumber || null,
    repository: eventData.repository || '',
    signatureValid: eventData.signatureValid,
    outcome: eventData.outcome,
    payloadSummary: eventData.payloadSummary || {},
    receivedAt: new Date()
  });
}

async function processMergedPR(payload, deliveryId) {
  const pr = payload.pull_request;
  const repo = payload.repository;
  const user = pr.user;

  if (isBotUser(user)) {
    return { status: 'skipped', message: 'Bot user' };
  }

  const existing = await contributionService.findByRepoAndPR(repo.full_name, pr.number);
  if (existing) {
    return { status: 'duplicate', message: 'Already recorded' };
  }

  const contributor = await contributorService.createOrUpdate({
    githubId: user.id,
    githubUsername: user.login,
    displayName: user.login,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url
  });

  const prLabels = (pr.labels || []).map(l => l.name);
  const { totalPoints, labelBreakdown } = await pointsService.calculateContributionPoints(prLabels);

  const requireApproval = process.env.REQUIRE_APPROVAL_LABEL === 'true';
  const approvalLabel = (process.env.APPROVAL_LABEL || 'S2C approved').toLowerCase();
  const hasApproval = prLabels.some(l => l.toLowerCase() === approvalLabel);

  let status = 'awarded';
  let awardedPoints = totalPoints;

  if (requireApproval && !hasApproval) {
    status = 'pending-approval';
    awardedPoints = 0;
  }

  const maxPRsPerDay = parseInt(process.env.MAX_PRS_PER_DAY || '5', 10);
  const todayCount = await contributionService.countTodayPRs(user.id);
  const flagged = todayCount >= maxPRsPerDay;

  const contribution = await contributionService.create({
    githubUsername: user.login,
    githubId: user.id,
    prNumber: pr.number,
    prTitle: pr.title,
    prUrl: pr.html_url,
    prBody: pr.body,
    repository: repo.full_name,
    labels: labelBreakdown,
    totalPoints: awardedPoints,
    status,
    flagged,
    mergedAt: new Date(pr.merged_at),
    mergedBy: pr.merged_by?.login || '',
    additions: pr.additions || 0,
    deletions: pr.deletions || 0,
    changedFiles: pr.changed_files || 0,
    deliveryId
  });

  await contributorService.updateAggregates(user.id);

  return {
    status: 'recorded',
    contribution: contribution.id,
    points: awardedPoints,
    labels: labelBreakdown,
    flagged,
    contributionStatus: status
  };
}

async function processLabelEvent(payload, action) {
  const pr = payload.pull_request;
  const repo = payload.repository;
  const label = payload.label;

  if (!pr.merged) return { status: 'skipped', message: 'PR not merged' };

  const requireApproval = process.env.REQUIRE_APPROVAL_LABEL === 'true';
  if (!requireApproval) return { status: 'skipped', message: 'Approval gate disabled' };

  const approvalLabel = (process.env.APPROVAL_LABEL || 'S2C approved').toLowerCase();
  if (label.name.toLowerCase() !== approvalLabel) {
    return { status: 'skipped', message: 'Not the approval label' };
  }

  const contributionId = buildContributionId(repo.full_name, pr.number);
  const existing = await contributionService.findById(contributionId);

  if (!existing) {
    return { status: 'skipped', message: 'Contribution not found' };
  }

  if (action === 'labeled' && existing.status === 'pending-approval') {
    const prLabels = (pr.labels || []).map(l => l.name);
    const { totalPoints, labelBreakdown } = await pointsService.calculateContributionPoints(prLabels);

    await contributionService.updateContribution(contributionId, {
      status: 'awarded',
      totalPoints,
      labels: labelBreakdown
    });

    await contributorService.updateAggregates(existing.githubId);

    return { status: 'approved', points: totalPoints };
  }

  if (action === 'unlabeled' && existing.status === 'awarded') {
    await contributionService.updateStatus(contributionId, 'pending-approval', {
      totalPoints: 0
    });

    await contributorService.updateAggregates(existing.githubId);

    return { status: 'unapproved' };
  }

  return { status: 'no-change' };
}

async function resyncPR(prNumber, adminEmail) {
  const githubService = require('./githubService');
  const prData = await githubService.getPRDetails(prNumber);

  if (!prData) {
    throw new Error(`PR #${prNumber} not found on GitHub`);
  }

  if (!prData.merged) {
    throw new Error(`PR #${prNumber} is not merged`);
  }

  const contributionId = buildContributionId(repoConfig.fullName, prNumber);
  const existing = await contributionService.findById(contributionId);

  await contributorService.createOrUpdate({
    githubId: prData.user.id,
    githubUsername: prData.user.login,
    displayName: prData.user.login,
    avatarUrl: prData.user.avatarUrl,
    profileUrl: prData.user.htmlUrl
  });

  const prLabels = prData.labels.map(l => l.name);
  const { totalPoints, labelBreakdown } = await pointsService.calculateContributionPoints(prLabels);

  const requireApproval = process.env.REQUIRE_APPROVAL_LABEL === 'true';
  const approvalLabel = (process.env.APPROVAL_LABEL || 'S2C approved').toLowerCase();
  const hasApproval = prLabels.some(l => l.toLowerCase() === approvalLabel);

  let status = 'awarded';
  let awardedPoints = totalPoints;
  if (requireApproval && !hasApproval) {
    status = 'pending-approval';
    awardedPoints = 0;
  }

  if (existing) {
    const previousValue = {
      labels: existing.labels,
      status: existing.status
    };

    await contributionService.updateContribution(contributionId, {
      prTitle: prData.title,
      prBody: (prData.body || '').slice(0, 2000),
      labels: labelBreakdown,
      status,
      mergedBy: prData.mergedBy || '',
      additions: prData.additions || 0,
      deletions: prData.deletions || 0,
      changedFiles: prData.changedFiles || 0
    });

    await auditService.log({
      adminUserId: adminEmail,
      action: 'resync',
      targetType: 'contribution',
      targetId: contributionId,
      previousValue,
      newValue: { labels: labelBreakdown, status },
      reason: `Manual resync of PR #${prNumber}`
    });
  } else {
    await contributionService.create({
      githubUsername: prData.user.login,
      githubId: prData.user.id,
      prNumber: prData.number,
      prTitle: prData.title,
      prUrl: prData.htmlUrl,
      prBody: prData.body,
      repository: repoConfig.fullName,
      labels: labelBreakdown,
      totalPoints: awardedPoints,
      status,
      flagged: false,
      mergedAt: new Date(prData.mergedAt),
      mergedBy: prData.mergedBy || '',
      additions: prData.additions || 0,
      deletions: prData.deletions || 0,
      changedFiles: prData.changedFiles || 0,
      deliveryId: `resync_${Date.now()}`
    });

    await auditService.log({
      adminUserId: adminEmail,
      action: 'resync_create',
      targetType: 'contribution',
      targetId: contributionId,
      previousValue: null,
      newValue: { totalPoints: awardedPoints, status },
      reason: `Manual resync created contribution for PR #${prNumber}`
    });
  }

  await contributorService.updateAggregates(prData.user.id);

  return { status: 'resynced', contributionId, points: awardedPoints };
}

async function getWebhookEvents(limit = 50) {
  const snapshot = await db.collection(WEBHOOK_COLLECTION)
    .orderBy('receivedAt', 'desc')
    .limit(limit)
    .get();

  const events = [];
  snapshot.forEach(doc => {
    events.push({ id: doc.id, ...doc.data() });
  });
  return events;
}

module.exports = {
  isDuplicateDelivery,
  logWebhookEvent,
  processMergedPR,
  processLabelEvent,
  resyncPR,
  getWebhookEvents
};
