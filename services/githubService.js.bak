const { Octokit } = require('@octokit/rest');
const repoConfig = require('../config/repo');

let octokit = null;

function getOctokit() {
  if (!octokit) {
    octokit = new Octokit({
      auth: repoConfig.token || undefined,
      userAgent: 'START2CODE/1.0'
    });
  }
  return octokit;
}

const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

async function getRepoInfo() {
  const cached = getCached('repoInfo');
  if (cached) return cached;

  try {
    const { data } = await getOctokit().repos.get({
      owner: repoConfig.owner,
      repo: repoConfig.name
    });

    const info = {
      fullName: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      watchers: data.subscribers_count,
      openIssues: data.open_issues_count,
      language: data.language,
      license: data.license?.spdx_id || null,
      updatedAt: data.updated_at,
      pushedAt: data.pushed_at,
      htmlUrl: data.html_url,
      topics: data.topics || []
    };

    setCache('repoInfo', info);
    return info;
  } catch (err) {
    const fallback = getCached('repoInfo_fallback');
    if (fallback) return fallback;
    throw err;
  }
}

async function getRepoLanguages() {
  const cached = getCached('repoLanguages');
  if (cached) return cached;

  try {
    const { data } = await getOctokit().repos.listLanguages({
      owner: repoConfig.owner,
      repo: repoConfig.name
    });
    setCache('repoLanguages', data);
    return data;
  } catch {
    return getCached('repoLanguages_fallback') || {};
  }
}

async function getOpenIssues(labels = '', perPage = 10) {
  const cacheKey = `issues_${labels}_${perPage}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const params = {
      owner: repoConfig.owner,
      repo: repoConfig.name,
      state: 'open',
      per_page: perPage,
      sort: 'created',
      direction: 'desc'
    };
    if (labels) params.labels = labels;

    const { data } = await getOctokit().issues.listForRepo(params);
    const issues = data
      .filter(i => !i.pull_request)
      .map(i => ({
        number: i.number,
        title: i.title,
        labels: i.labels.map(l => ({ name: l.name, color: l.color })),
        createdAt: i.created_at,
        user: { login: i.user.login, avatarUrl: i.user.avatar_url },
        htmlUrl: i.html_url,
        comments: i.comments
      }));

    setCache(cacheKey, issues);
    return issues;
  } catch {
    return [];
  }
}

async function getRecentMergedPRs(perPage = 10) {
  const cached = getCached('recentPRs');
  if (cached) return cached;

  try {
    const { data } = await getOctokit().pulls.list({
      owner: repoConfig.owner,
      repo: repoConfig.name,
      state: 'closed',
      sort: 'updated',
      direction: 'desc',
      per_page: perPage
    });

    const merged = data
      .filter(pr => pr.merged_at)
      .map(pr => ({
        number: pr.number,
        title: pr.title,
        user: { login: pr.user.login, avatarUrl: pr.user.avatar_url },
        mergedAt: pr.merged_at,
        labels: pr.labels.map(l => ({ name: l.name, color: l.color })),
        htmlUrl: pr.html_url,
        additions: pr.additions,
        deletions: pr.deletions,
        changedFiles: pr.changed_files
      }));

    setCache('recentPRs', merged);
    return merged;
  } catch {
    return [];
  }
}

async function getPRDetails(prNumber) {
  try {
    const { data } = await getOctokit().pulls.get({
      owner: repoConfig.owner,
      repo: repoConfig.name,
      pull_number: prNumber
    });
    return {
      number: data.number,
      title: data.title,
      body: data.body || '',
      state: data.state,
      merged: data.merged,
      mergedAt: data.merged_at,
      mergedBy: data.merged_by?.login || null,
      user: {
        login: data.user.login,
        id: data.user.id,
        avatarUrl: data.user.avatar_url,
        htmlUrl: data.user.html_url,
        type: data.user.type
      },
      labels: data.labels.map(l => ({ name: l.name, color: l.color })),
      additions: data.additions,
      deletions: data.deletions,
      changedFiles: data.changed_files,
      htmlUrl: data.html_url
    };
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

async function getAllIssuesByLabel(label) {
  const cacheKey = `issues_label_${label}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await getOctokit().issues.listForRepo({
      owner: repoConfig.owner,
      repo: repoConfig.name,
      state: 'open',
      labels: label,
      per_page: 30
    });
    const issues = data.filter(i => !i.pull_request);
    setCache(cacheKey, issues);
    return issues;
  } catch {
    return [];
  }
}

module.exports = {
  getRepoInfo,
  getRepoLanguages,
  getOpenIssues,
  getRecentMergedPRs,
  getPRDetails,
  getAllIssuesByLabel
};
