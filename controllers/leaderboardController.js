const leaderboardService = require('../services/leaderboardService');
const contributionService = require('../services/contributionService');
const statsService = require('../services/statsService');
const githubService = require('../services/githubService');
const pointsService = require('../services/pointsService');
const eventConfig = require('../config/event');
const repoConfig = require('../config/repo');
const { parsePaginationParams, parseSearchParam } = require('../utils/validation');

async function getLeaderboard(req, res) {
  try {
    const { page, limit } = parsePaginationParams(req.query);
    const search = parseSearchParam(req.query);
    const result = await leaderboardService.getLeaderboard({ page, limit, search });
    res.json(result);
  } catch (err) {
    console.error('Leaderboard error:', err.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

async function getContributor(req, res) {
  try {
    const detail = await leaderboardService.getContributorDetail(req.params.username);
    if (!detail) {
      return res.status(404).json({ error: 'Contributor not found' });
    }
    res.json(detail);
  } catch (err) {
    console.error('Contributor error:', err.message);
    res.status(500).json({ error: 'Failed to fetch contributor' });
  }
}

async function getContributions(req, res) {
  try {
    if (req.params.username) {
      const contributions = await contributionService.getByUsername(req.params.username);
      return res.json({ contributions });
    }
    const contributions = await contributionService.getAll({ limit: 100 });
    res.json({ contributions });
  } catch (err) {
    console.error('Contributions error:', err.message);
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
}

async function getStats(req, res) {
  try {
    const stats = await statsService.getStats();
    res.json(stats);
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

async function getEvent(req, res) {
  res.json(eventConfig);
}

async function getRepo(req, res) {
  try {
    const [info, languages] = await Promise.all([
      githubService.getRepoInfo(),
      githubService.getRepoLanguages()
    ]);
    res.json({ ...info, languages, ...repoConfig });
  } catch (err) {
    console.error('Repo error:', err.message);
    res.json({
      fullName: repoConfig.fullName,
      htmlUrl: repoConfig.url,
      description: repoConfig.description,
      error: 'GitHub API unavailable'
    });
  }
}

async function getPointRules(req, res) {
  try {
    const rules = await pointsService.getActiveRules();
    res.json({ rules });
  } catch (err) {
    console.error('Point rules error:', err.message);
    res.status(500).json({ error: 'Failed to fetch point rules' });
  }
}

module.exports = {
  getLeaderboard,
  getContributor,
  getContributions,
  getStats,
  getEvent,
  getRepo,
  getPointRules
};
