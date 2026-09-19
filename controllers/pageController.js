const leaderboardService = require('../services/leaderboardService');
const statsService = require('../services/statsService');
const githubService = require('../services/githubService');
const pointsService = require('../services/pointsService');
const eventConfig = require('../config/event');
const repoConfig = require('../config/repo');
const { formatDate, formatRelativeTime, getDaysRemaining, getCurrentMarathonDay, getMarathonTotalDays } = require('../utils/dates');

async function home(req, res) {
  try {
    const [stats, topContributors, leaderboard, repoInfo, languages, issues] = await Promise.all([
      statsService.getStats().catch(() => null),
      leaderboardService.getTopContributors(3).catch(() => []),
      leaderboardService.getLeaderboard({ page: 1, limit: 10 }).catch(() => ({ contributors: [], pagination: {} })),
      githubService.getRepoInfo().catch(() => null),
      githubService.getRepoLanguages().catch(() => ({})),
      githubService.getOpenIssues('', 6).catch(() => [])
    ]);

    res.render('index', {
      title: 'START2CODE - Live Leaderboard',
      event: eventConfig,
      repo: repoConfig,
      stats,
      topContributors,
      leaderboard,
      repoInfo,
      languages,
      issues,
      formatDate,
      formatRelativeTime,
      daysRemaining: getDaysRemaining(),
      currentDay: getCurrentMarathonDay(),
      totalDays: getMarathonTotalDays()
    });
  } catch (err) {
    console.error('Home page error:', err.message);
    res.render('index', {
      title: 'START2CODE - Live Leaderboard',
      event: eventConfig,
      repo: repoConfig,
      stats: null,
      topContributors: [],
      leaderboard: { contributors: [], pagination: {} },
      repoInfo: null,
      languages: {},
      issues: [],
      formatDate,
      formatRelativeTime,
      daysRemaining: getDaysRemaining(),
      currentDay: getCurrentMarathonDay(),
      totalDays: getMarathonTotalDays()
    });
  }
}

async function contributorPage(req, res) {
  try {
    const detail = await leaderboardService.getContributorDetail(req.params.username);
    if (!detail) {
      return res.status(404).render('error', {
        title: 'Contributor Not Found',
        statusCode: 404,
        message: 'This contributor does not exist.'
      });
    }
    res.render('contributor', {
      title: `${detail.displayName || detail.githubUsername} - START2CODE`,
      contributor: detail,
      event: eventConfig,
      formatDate,
      formatRelativeTime
    });
  } catch (err) {
    console.error('Contributor page error:', err.message);
    res.status(500).render('error', { title: 'Error', statusCode: 500, message: 'Failed to load contributor.' });
  }
}

async function contributorsPage(req, res) {
  try {
    const leaderboard = await leaderboardService.getLeaderboard({ page: 1, limit: 100 });
    res.render('contributors', {
      title: 'Contributors - START2CODE',
      leaderboard,
      event: eventConfig,
      formatDate,
      formatRelativeTime
    });
  } catch (err) {
    console.error('Contributors page error:', err.message);
    res.render('contributors', {
      title: 'Contributors - START2CODE',
      leaderboard: { contributors: [], pagination: {} },
      event: eventConfig,
      formatDate,
      formatRelativeTime
    });
  }
}

async function aboutPage(req, res) {
  res.render('about', {
    title: 'About - START2CODE',
    event: eventConfig,
    repo: repoConfig,
    formatDate
  });
}

async function projectPage(req, res) {
  try {
    const [repoInfo, languages] = await Promise.all([
      githubService.getRepoInfo().catch(() => null),
      githubService.getRepoLanguages().catch(() => ({}))
    ]);
    res.render('project', {
      title: 'InternPilot - START2CODE',
      event: eventConfig,
      repo: repoConfig,
      repoInfo,
      languages,
      formatDate,
      formatRelativeTime
    });
  } catch (err) {
    res.render('project', {
      title: 'InternPilot - START2CODE',
      event: eventConfig,
      repo: repoConfig,
      repoInfo: null,
      languages: {},
      formatDate,
      formatRelativeTime
    });
  }
}

async function scoringPage(req, res) {
  try {
    const rules = await pointsService.getActiveRules();
    res.render('scoring', {
      title: 'Scoring System - START2CODE',
      event: eventConfig,
      rules,
      formatDate
    });
  } catch (err) {
    res.render('scoring', {
      title: 'Scoring System - START2CODE',
      event: eventConfig,
      rules: pointsService.DEFAULT_RULES,
      formatDate
    });
  }
}

module.exports = { home, contributorPage, contributorsPage, aboutPage, projectPage, scoringPage };
