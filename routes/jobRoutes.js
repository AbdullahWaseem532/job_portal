// routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { isEmployer } = require('../middleware/roleMiddleware');

// Job listings
router.get('/', jobController.listJobs);
router.get('/:id', jobController.getJobDetails);

// Job creation (employer only)
router.get('/create/new', isAuthenticated, isEmployer, jobController.getCreateJob);
router.post('/create', isAuthenticated, isEmployer, jobController.postCreateJob);

module.exports = router;