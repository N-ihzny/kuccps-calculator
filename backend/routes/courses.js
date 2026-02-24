const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { optionalAuth } = require('../middleware/auth');
const { validateCourseFilters } = require('../middleware/validation');

// Public routes
router.get('/', validateCourseFilters, courseController.getCourses);
router.get('/program/:programType', courseController.getCoursesByProgram);
router.get('/:id', courseController.getCourseById);

module.exports = router;