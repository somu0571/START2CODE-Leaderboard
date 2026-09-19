const { db } = require('../config/firebase');

const COLLECTION = 'contributors';

async function findByGitHubId(githubId) {
  const ref = db.collection(COLLECTION).doc(String(githubId));
  const doc = await ref.get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function findByUsername(username) {
  const snapshot = await db.collection(COLLECTION)
    .where('githubUsername', '==', username.toLowerCase())
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function createOrUpdate(userData) {
  const ref = db.collection(COLLECTION).doc(String(userData.githubId));
  const doc = await ref.get();
  const now = new Date();

  if (doc.exists) {
    const updates = {
      githubUsername: userData.githubUsername.toLowerCase(),
      displayName: userData.displayName || userData.githubUsername,
      avatarUrl: userData.avatarUrl,
      profileUrl: userData.profileUrl,
      updatedAt: now
    };
    await ref.update(updates);
    return { id: ref.id, ...doc.data(), ...updates, isNew: false };
  }

  const newContributor = {
    githubId: userData.githubId,
    githubUsername: userData.githubUsername.toLowerCase(),
    displayName: userData.displayName || userData.githubUsername,
    avatarUrl: userData.avatarUrl,
    profileUrl: userData.profileUrl,
    totalPoints: 0,
    mergedPRs: 0,
    manualAdjustment: 0,
    badges: [],
    firstContributionAt: null,
    lastContributionAt: null,
    createdAt: now,
    updatedAt: now
  };

  await ref.set(newContributor);
  return { id: ref.id, ...newContributor, isNew: true };
}

async function updateAggregates(githubId) {
  const contribSnapshot = await db.collection('contributions')
    .where('githubId', '==', githubId)
    .where('status', '==', 'awarded')
    .where('countsTowardsMarathon', '==', true)
    .get();

  let totalPoints = 0;
  let mergedPRs = 0;
  let firstContributionAt = null;
  let lastContributionAt = null;

  contribSnapshot.forEach(doc => {
    const data = doc.data();
    totalPoints += data.totalPoints || 0;
    mergedPRs++;
    const mergedAt = data.mergedAt?.toDate ? data.mergedAt.toDate() : new Date(data.mergedAt);
    if (!firstContributionAt || mergedAt < firstContributionAt) {
      firstContributionAt = mergedAt;
    }
    if (!lastContributionAt || mergedAt > lastContributionAt) {
      lastContributionAt = mergedAt;
    }
  });

  const ref = db.collection(COLLECTION).doc(String(githubId));
  const doc = await ref.get();
  const manualAdj = doc.exists ? (doc.data().manualAdjustment || 0) : 0;

  await ref.update({
    totalPoints: totalPoints + manualAdj,
    mergedPRs,
    firstContributionAt,
    lastContributionAt,
    updatedAt: new Date()
  });

  return { totalPoints: totalPoints + manualAdj, mergedPRs };
}

async function adjustManual(githubId, adjustment, reason) {
  const ref = db.collection(COLLECTION).doc(String(githubId));
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Contributor not found');

  const current = doc.data();
  const oldAdjustment = current.manualAdjustment || 0;
  const newAdjustment = oldAdjustment + adjustment;

  await ref.update({
    manualAdjustment: newAdjustment,
    totalPoints: (current.totalPoints - oldAdjustment) + newAdjustment,
    updatedAt: new Date()
  });

  return {
    previousValue: { manualAdjustment: oldAdjustment },
    newValue: { manualAdjustment: newAdjustment, adjustmentApplied: adjustment, reason }
  };
}

module.exports = {
  findByGitHubId,
  findByUsername,
  createOrUpdate,
  updateAggregates,
  adjustManual
};
