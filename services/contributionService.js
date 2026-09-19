const { db } = require('../config/firebase');
const { buildContributionId } = require('../utils/github');
const { isWithinMarathonWindow, shouldEnforceMarathonWindow } = require('../utils/dates');

const COLLECTION = 'contributions';

async function findByRepoAndPR(repository, prNumber) {
  const docId = buildContributionId(repository, prNumber);
  const ref = db.collection(COLLECTION).doc(docId);
  const doc = await ref.get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function findById(id) {
  const ref = db.collection(COLLECTION).doc(id);
  const doc = await ref.get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function create(data) {
  const docId = buildContributionId(data.repository, data.prNumber);

  const enforceWindow = shouldEnforceMarathonWindow();
  const withinWindow = isWithinMarathonWindow(data.mergedAt);
  const countsTowardsMarathon = !enforceWindow || withinWindow;

  const now = new Date();
  const contribution = {
    githubUsername: data.githubUsername.toLowerCase(),
    githubId: data.githubId,
    prNumber: data.prNumber,
    prTitle: data.prTitle,
    prUrl: data.prUrl,
    prBody: (data.prBody || '').slice(0, 2000),
    repository: data.repository,
    labels: data.labels || [],
    totalPoints: data.totalPoints || 0,
    status: data.status || 'awarded',
    countsTowardsMarathon,
    flagged: data.flagged || false,
    mergedAt: data.mergedAt,
    mergedBy: data.mergedBy || '',
    additions: data.additions || 0,
    deletions: data.deletions || 0,
    changedFiles: data.changedFiles || 0,
    deliveryId: data.deliveryId || '',
    createdAt: now,
    updatedAt: now
  };

  await db.collection(COLLECTION).doc(docId).set(contribution);
  return { id: docId, ...contribution };
}

async function updateStatus(id, status, updates = {}) {
  const ref = db.collection(COLLECTION).doc(id);
  await ref.update({
    status,
    ...updates,
    updatedAt: new Date()
  });
}

async function updateContribution(id, updates) {
  const ref = db.collection(COLLECTION).doc(id);
  await ref.update({
    ...updates,
    updatedAt: new Date()
  });
}

async function getByUsername(username) {
  const snapshot = await db.collection(COLLECTION)
    .where('githubUsername', '==', username.toLowerCase())
    .orderBy('mergedAt', 'desc')
    .get();

  const contributions = [];
  snapshot.forEach(doc => {
    contributions.push({ id: doc.id, ...doc.data() });
  });
  return contributions;
}

async function getAll(options = {}) {
  let query = db.collection(COLLECTION).orderBy('mergedAt', 'desc');

  if (options.status) {
    query = db.collection(COLLECTION)
      .where('status', '==', options.status)
      .orderBy('mergedAt', 'desc');
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const snapshot = await query.get();
  const contributions = [];
  snapshot.forEach(doc => {
    contributions.push({ id: doc.id, ...doc.data() });
  });
  return contributions;
}

async function countTodayPRs(githubId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const snapshot = await db.collection(COLLECTION)
    .where('githubId', '==', githubId)
    .where('createdAt', '>=', today)
    .where('createdAt', '<', tomorrow)
    .get();

  return snapshot.size;
}

module.exports = {
  findByRepoAndPR,
  findById,
  create,
  updateStatus,
  updateContribution,
  getByUsername,
  getAll,
  countTodayPRs
};
