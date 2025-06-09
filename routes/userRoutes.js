// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { isAdmin, isJobSeeker } = require('../middleware/roleMiddleware');

// Dashboard routes
router.get('/dashboard/user', isAuthenticated, isJobSeeker, userController.getUserDashboard);
router.get('/dashboard/admin', isAuthenticated, isAdmin, userController.getAdminDashboard);

module.exports = router;