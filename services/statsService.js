const { db } = require('../config/firebase');
const { getCurrentMarathonDay, getDaysRemaining, getMarathonTotalDays } = require('../utils/dates');

async function getStats() {
  if (!db) {
    return {
      totalContributors: 0,
      totalMergedPRs: 0,
      totalPointsAwarded: 0,
      avgPointsPerPR: 0,
      mostUsedLabel: null,
      currentMarathonDay: getCurrentMarathonDay(),
      daysRemaining: getDaysRemaining(),
      totalMarathonDays: getMarathonTotalDays()
    };
  }

  const contributorsSnap = await db.collection('contributors')
    .where('mergedPRs', '>', 0)
    .get();
  const totalContributors = contributorsSnap.size;

  const contributionsSnap = await db.collection('contributions')
    .where('status', '==', 'awarded')
    .get();
  const totalMergedPRs = contributionsSnap.size;

  let totalPointsAwarded = 0;
  let labelCounts = {};
  contributionsSnap.forEach(doc => {
    const data = doc.data();
    totalPointsAwarded += data.totalPoints || 0;
    if (data.labels) {
      data.labels.forEach(l => {
        if (l.points > 0) {
          labelCounts[l.name] = (labelCounts[l.name] || 0) + 1;
        }
      });
    }
  });

  const avgPointsPerPR = totalMergedPRs > 0
    ? Math.round((totalPointsAwarded / totalMergedPRs) * 10) / 10
    : 0;

  let mostUsedLabel = null;
  let maxCount = 0;
  for (const [label, count] of Object.entries(labelCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostUsedLabel = label;
    }
  }

  return {
    totalContributors,
    totalMergedPRs,
    totalPointsAwarded,
    avgPointsPerPR,
    mostUsedLabel,
    currentMarathonDay: getCurrentMarathonDay(),
    daysRemaining: getDaysRemaining(),
    totalMarathonDays: getMarathonTotalDays()
  };
}

module.exports = { getStats };
