const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// GET routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// POST routes
router.post('/', categoryController.createCategory);

module.exports = router;