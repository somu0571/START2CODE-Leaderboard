const { verifyWebhookSignature, validateRepository } = require('../utils/github');
const repoConfig = require('../config/repo');

function captureRawBody(req, res, buf) {
  req.rawBody = buf;
}

function verifyWebhook(req, res, next) {
  const signature = req.headers['x-hub-signature-256'];
  const deliveryId = req.headers['x-github-delivery'];
  const event = req.headers['x-github-event'];

  if (!signature) {
    return res.status(401).json({ error: 'Missing signature' });
  }

  if (!req.rawBody) {
    return res.status(400).json({ error: 'Missing request body' });
  }

  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    console.error('GITHUB_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const valid = verifyWebhookSignature(req.rawBody, signature, secret);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  if (event !== 'ping' && !validateRepository(req.body, repoConfig.owner, repoConfig.name)) {
    return res.status(403).json({ error: 'Repository not allowed' });
  }

  req.webhookDeliveryId = deliveryId;
  req.webhookEvent = event;
  next();
}

module.exports = { verifyWebhook, captureRawBody };
