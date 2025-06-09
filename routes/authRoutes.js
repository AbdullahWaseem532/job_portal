// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated, isNotAuthenticated } = require('../middleware/authMiddleware');

// Login routes
router.get('/login', isNotAuthenticated, authController.getLogin);
router.post('/login', isNotAuthenticated, authController.postLogin);

// Registration routes
router.get('/register', isNotAuthenticated, authController.getUserRegister);
router.post('/register', isNotAuthenticated, authController.postUserRegister);

router.get('/register-company', isNotAuthenticated, authController.getCompanyRegister);
router.post('/register-company', isNotAuthenticated, authController.postCompanyRegister);

// Logout route
router.get('/logout', isAuthenticated, authController.logout);

module.exports = router;