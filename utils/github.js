const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  if (!signature || !secret) return false;
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

function validateRepository(payload, owner, name) {
  const repo = payload.repository;
  if (!repo) return false;
  return repo.full_name === `${owner}/${name}`;
}

function buildPrUrl(owner, name, prNumber) {
  return `https://github.com/${owner}/${name}/pull/${prNumber}`;
}

function buildContributionId(repoFullName, prNumber) {
  return `${repoFullName.replace('/', '_')}_${prNumber}`;
}

function isBotUser(user) {
  if (!user) return false;
  return user.type === 'Bot' || (user.login && user.login.endsWith('[bot]'));
}

module.exports = {
  verifyWebhookSignature,
  validateRepository,
  buildPrUrl,
  buildContributionId,
  isBotUser
};
