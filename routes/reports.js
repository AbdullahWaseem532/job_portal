const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/job-stats', reportController.getJobStats);
router.get('/company-stats', reportController.getCompanyStats);

module.exports = router;