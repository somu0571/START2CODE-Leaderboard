const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pageController');

router.get('/', ctrl.home);
router.get('/contributor/:username', ctrl.contributorPage);
router.get('/contributors', ctrl.contributorsPage);
router.get('/about', ctrl.aboutPage);
router.get('/project', ctrl.projectPage);
router.get('/scoring', ctrl.scoringPage);

module.exports = router;
