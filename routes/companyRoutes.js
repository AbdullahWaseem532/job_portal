// routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { isEmployer } = require('../middleware/roleMiddleware');

// Dashboard route
router.get('/dashboard/company', isAuthenticated, isEmployer, companyController.getCompanyDashboard);

module.exports = router;