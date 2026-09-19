const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/leaderboardController');
const { apiLimiter } = require('../middleware/rateLimit');
const { validatePagination } = require('../middleware/validation');

router.get('/leaderboard', apiLimiter, validatePagination, ctrl.getLeaderboard);
router.get('/leaderboard/:username', apiLimiter, ctrl.getContributor);
router.get('/contributions', apiLimiter, ctrl.getContributions);
router.get('/contributions/:username', apiLimiter, ctrl.getContributions);
router.get('/stats', apiLimiter, ctrl.getStats);
router.get('/event', ctrl.getEvent);
router.get('/repo', apiLimiter, ctrl.getRepo);
router.get('/point-rules', apiLimiter, ctrl.getPointRules);

module.exports = router;
