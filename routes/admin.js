const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/adminAuth');
const { adminLimiter, loginLimiter } = require('../middleware/rateLimit');
const { validatePointRule, validateAdjustment, validateResync } = require('../middleware/validation');

router.get('/login', loginLimiter, ctrl.loginPage);

router.get('/dashboard', requireAdmin, adminLimiter, ctrl.dashboard);
router.get('/contributors', requireAdmin, adminLimiter, ctrl.getContributors);
router.get('/contributions', requireAdmin, adminLimiter, ctrl.getContributions);

router.get('/point-rules', requireAdmin, adminLimiter, ctrl.getPointRules);
router.post('/point-rules', requireAdmin, adminLimiter, validatePointRule, ctrl.updatePointRule);

router.post('/contributions/:id/adjust', requireAdmin, adminLimiter, validateAdjustment, ctrl.adjustContribution);
router.post('/contributions/:id/approve', requireAdmin, adminLimiter, ctrl.approveContribution);
router.post('/contributions/:id/reject', requireAdmin, adminLimiter, ctrl.rejectContribution);
router.post('/contributions/:id/resync', requireAdmin, adminLimiter, ctrl.resyncContribution);

router.post('/resync', requireAdmin, adminLimiter, validateResync, ctrl.resyncContribution);

router.get('/webhook-events', requireAdmin, adminLimiter, ctrl.getWebhookEvents);
router.get('/audit-logs', requireAdmin, adminLimiter, ctrl.getAuditLogs);

router.get('/export/contributors', requireAdmin, ctrl.exportContributors);
router.get('/export/contributions', requireAdmin, ctrl.exportContributions);

module.exports = router;
