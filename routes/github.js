const express = require('express');
const router = express.Router();
const { handleWebhook } = require('../controllers/githubController');
const { verifyWebhook } = require('../middleware/webhook');
const { webhookLimiter } = require('../middleware/rateLimit');

router.post('/webhook', webhookLimiter, verifyWebhook, handleWebhook);

module.exports = router;
