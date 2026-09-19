const pointsService = require('../services/pointsService');
const contributionService = require('../services/contributionService');
const contributorService = require('../services/contributorService');
const webhookService = require('../services/webhookService');
const auditService = require('../services/auditService');
const leaderboardService = require('../services/leaderboardService');
const statsService = require('../services/statsService');
const eventConfig = require('../config/event');
const { formatDate, formatRelativeTime } = require('../utils/dates');

async function loginPage(req, res) {
  res.render('admin/login', {
    title: 'Admin Login - START2CODE',
    event: eventConfig,
    firebaseConfig: {
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.FIREBASE_APP_ID || ''
    }
  });
}

async function dashboard(req, res) {
  try {
    const [stats, recentContributions, recentLogs] = await Promise.all([
      statsService.getStats().catch(() => null),
      contributionService.getAll({ limit: 10 }).catch(() => []),
      auditService.getLogs(10).catch(() => [])
    ]);
    res.render('admin/dashboard', {
      title: 'Admin Dashboard - START2CODE',
      event: eventConfig,
      stats,
      recentContributions,
      recentLogs,
      formatDate,
      formatRelativeTime
    });
  } catch (err) {
    console.error('Admin dashboard error:', err.message);
    res.status(500).render('error', { title: 'Error', statusCode: 500, message: 'Dashboard failed to load.' });
  }
}

async function getContributors(req, res) {
  try {
    const result = await leaderboardService.getLeaderboard({ page: 1, limit: 200 });
    res.render('admin/contributors', {
      title: 'Manage Contributors - START2CODE',
      event: eventConfig,
      contributors: result.contributors,
      formatDate,
      formatRelativeTime
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getContributions(req, res) {
  try {
    const contributions = await contributionService.getAll({ limit: 200 });
    res.render('admin/contributions', {
      title: 'Manage Contributions - START2CODE',
      event: eventConfig,
      contributions,
      formatDate,
      formatRelativeTime
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getPointRules(req, res) {
  try {
    const rules = await pointsService.getAllRules();
    res.render('admin/point-rules', {
      title: 'Point Rules - START2CODE',
      event: eventConfig,
      rules,
      formatDate
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updatePointRule(req, res) {
  try {
    const { label, points, description, active } = req.body;
    const adminEmail = req.user.email || req.user.uid;

    const { previousValue, newValue } = await pointsService.updateRule(label, {
      points: parseInt(points, 10),
      description,
      active: active !== false && active !== 'false'
    }, adminEmail);

    await auditService.log({
      adminUserId: adminEmail,
      action: 'update_point_rule',
      targetType: 'pointRule',
      targetId: label,
      previousValue,
      newValue,
      reason: `Updated point rule for ${label}`
    });

    res.json({ success: true, rule: newValue });
  } catch (err) {
    console.error('Update point rule error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function adjustContribution(req, res) {
  try {
    const { id } = req.params;
    const { adjustment, reason } = req.body;
    const adminEmail = req.user.email || req.user.uid;

    const contribution = await contributionService.findById(id);
    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    const result = await contributorService.adjustManual(
      contribution.githubId,
      parseInt(adjustment, 10),
      reason
    );

    await auditService.log({
      adminUserId: adminEmail,
      action: 'manual_adjustment',
      targetType: 'contributor',
      targetId: String(contribution.githubId),
      previousValue: result.previousValue,
      newValue: result.newValue,
      reason
    });

    res.json({ success: true, ...result.newValue });
  } catch (err) {
    console.error('Adjustment error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function approveContribution(req, res) {
  try {
    const { id } = req.params;
    const adminEmail = req.user.email || req.user.uid;

    const contribution = await contributionService.findById(id);
    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    if (contribution.status === 'awarded') {
      return res.json({ message: 'Already awarded' });
    }

    const prLabels = (contribution.labels || []).map(l => l.name);
    const { totalPoints, labelBreakdown } = await pointsService.calculateContributionPoints(prLabels);

    await contributionService.updateContribution(id, {
      status: 'awarded',
      totalPoints,
      labels: labelBreakdown
    });

    await contributorService.updateAggregates(contribution.githubId);

    await auditService.log({
      adminUserId: adminEmail,
      action: 'approve_contribution',
      targetType: 'contribution',
      targetId: id,
      previousValue: { status: contribution.status, totalPoints: contribution.totalPoints },
      newValue: { status: 'awarded', totalPoints },
      reason: 'Admin approved contribution'
    });

    res.json({ success: true, totalPoints });
  } catch (err) {
    console.error('Approve error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function rejectContribution(req, res) {
  try {
    const { id } = req.params;
    const adminEmail = req.user.email || req.user.uid;
    const { reason } = req.body;

    const contribution = await contributionService.findById(id);
    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    await contributionService.updateStatus(id, 'rejected');
    await contributorService.updateAggregates(contribution.githubId);

    await auditService.log({
      adminUserId: adminEmail,
      action: 'reject_contribution',
      targetType: 'contribution',
      targetId: id,
      previousValue: { status: contribution.status, totalPoints: contribution.totalPoints },
      newValue: { status: 'rejected' },
      reason: reason || 'Admin rejected contribution'
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Reject error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function resyncContribution(req, res) {
  try {
    const { prNumber } = req.body;
    const adminEmail = req.user.email || req.user.uid;
    const result = await webhookService.resyncPR(parseInt(prNumber, 10), adminEmail);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Resync error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

async function getWebhookEvents(req, res) {
  try {
    const events = await webhookService.getWebhookEvents(100);
    res.render('admin/webhook-events', {
      title: 'Webhook Events - START2CODE',
      event: eventConfig,
      webhookEvents: events,
      formatDate,
      formatRelativeTime
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAuditLogs(req, res) {
  try {
    const logs = await auditService.getLogs(100);
    res.render('admin/audit-logs', {
      title: 'Audit Logs - START2CODE',
      event: eventConfig,
      logs,
      formatDate,
      formatRelativeTime
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function exportContributors(req, res) {
  try {
    const result = await leaderboardService.getLeaderboard({ page: 1, limit: 10000 });
    const rows = [['Rank', 'Username', 'Display Name', 'Total Points', 'Merged PRs', 'Last Contribution']];
    result.contributors.forEach(c => {
      rows.push([c.rank, c.githubUsername, c.displayName, c.totalPoints, c.mergedPRs, c.lastContributionAt || '']);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contributors.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function exportContributions(req, res) {
  try {
    const contributions = await contributionService.getAll({ limit: 10000 });
    const rows = [['PR Number', 'Username', 'Title', 'Points', 'Status', 'Labels', 'Merged At', 'Repository']];
    contributions.forEach(c => {
      const labels = (c.labels || []).map(l => `${l.name}(${l.points})`).join('; ');
      rows.push([c.prNumber, c.githubUsername, c.prTitle, c.totalPoints, c.status, labels, c.mergedAt || '', c.repository]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contributions.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  loginPage,
  dashboard,
  getContributors,
  getContributions,
  getPointRules,
  updatePointRule,
  adjustContribution,
  approveContribution,
  rejectContribution,
  resyncContribution,
  getWebhookEvents,
  getAuditLogs,
  exportContributors,
  exportContributions
};
