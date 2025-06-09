const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// GET routes
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);

// POST routes
router.post('/', jobController.createJob);

module.exports = router;