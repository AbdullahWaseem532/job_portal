const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// GET routes
router.get('/', notificationController.getAllNotifications);
router.get('/user/:userId', notificationController.getNotificationsByUser);

// POST routes
router.post('/', notificationController.createNotification);

module.exports = router;