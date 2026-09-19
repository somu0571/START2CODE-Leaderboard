const { db } = require('../config/firebase');

const COLLECTION = 'contributors';

async function getLeaderboard(options = {}) {
  const { page = 1, limit = 20, search = null } = options;

  if (!db) {
    return {
      contributors: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 1
      }
    };
  }

  let query = db.collection(COLLECTION)
    .orderBy('totalPoints', 'desc')
    .orderBy('mergedPRs', 'desc')
    .orderBy('firstContributionAt', 'asc');

  const snapshot = await query.get();
  let contributors = [];
  snapshot.forEach(doc => {
    contributors.push({ id: doc.id, ...doc.data() });
  });

  if (search) {
    const searchLower = search.toLowerCase();
    contributors = contributors.filter(c =>
      (c.githubUsername && c.githubUsername.includes(searchLower)) ||
      (c.displayName && c.displayName.toLowerCase().includes(searchLower))
    );
  }

  contributors = contributors.filter(c => c.mergedPRs > 0 || c.totalPoints > 0);

  const total = contributors.length;
  let currentRank = 0;
  let previousPoints = null;
  let previousPRs = null;

  contributors = contributors.map((c, index) => {
    if (c.totalPoints !== previousPoints || c.mergedPRs !== previousPRs) {
      currentRank = index + 1;
    }
    previousPoints = c.totalPoints;
    previousPRs = c.mergedPRs;

    return {
      rank: currentRank,
      githubUsername: c.githubUsername,
      displayName: c.displayName,
      avatarUrl: c.avatarUrl,
      profileUrl: c.profileUrl,
      totalPoints: c.totalPoints,
      mergedPRs: c.mergedPRs,
      lastContributionAt: c.lastContributionAt,
      badges: c.badges || []
    };
  });

  const start = (page - 1) * limit;
  const paginated = contributors.slice(start, start + limit);

  return {
    contributors: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function getTopContributors(count = 3) {
  const result = await getLeaderboard({ page: 1, limit: count });
  return result.contributors;
}

async function getContributorDetail(username) {
  const contributorService = require('./contributorService');
  const contributionService = require('./contributionService');

  const contributor = await contributorService.findByUsername(username);
  if (!contributor) return null;

  const contributions = await contributionService.getByUsername(username);

  const leaderboard = await getLeaderboard({ page: 1, limit: 1000 });
  const ranked = leaderboard.contributors.find(
    c => c.githubUsername === username.toLowerCase()
  );

  return {
    ...contributor,
    rank: ranked ? ranked.rank : null,
    contributions
  };
}

module.exports = { getLeaderboard, getTopContributors, getContributorDetail };
