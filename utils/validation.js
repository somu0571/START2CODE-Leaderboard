function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, 1000);
}

function parsePaginationParams(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 20;
  if (limit > 100) limit = 100;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function parseSearchParam(query) {
  const search = query.search;
  if (!search || typeof search !== 'string') return null;
  return search.trim().toLowerCase().slice(0, 100);
}

function isValidGitHubId(id) {
  const num = Number(id);
  return Number.isInteger(num) && num > 0;
}

module.exports = { sanitizeString, parsePaginationParams, parseSearchParam, isValidGitHubId };
