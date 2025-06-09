const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

// POST routes
router.post('/', userController.createUser);

module.exports = router;