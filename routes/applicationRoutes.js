// routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { isJobSeeker, isEmployer } = require('../middleware/roleMiddleware');

// Apply for job (job seeker only)
router.post('/apply/:id', isAuthenticated, isJobSeeker, applicationController.applyForJob);

// View applications for a job (employer only)
router.get('/job/:id', isAuthenticated, isEmployer, applicationController.listJobApplications);

// Update application status (employer only)
router.post('/status/:applicationId', isAuthenticated, isEmployer, applicationController.updateApplicationStatus);

module.exports = router;