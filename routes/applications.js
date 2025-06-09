const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

// GET routes
router.get('/', applicationController.getAllApplications);
router.get('/:id', applicationController.getApplicationById);
router.get('/user/:userId', applicationController.getApplicationsByUser);

// POST routes
router.post('/', applicationController.createApplication);

// PUT routes
router.put('/:id/status', applicationController.updateApplicationStatus);

module.exports = router;