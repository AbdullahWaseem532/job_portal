const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');

// GET routes
router.get('/', skillController.getAllSkills);
router.get('/:id', skillController.getSkillById);

// POST routes
router.post('/', skillController.createSkill);

module.exports = router;