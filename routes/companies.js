const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// GET routes
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);

// POST routes
router.post('/', companyController.createCompany);

module.exports = router;