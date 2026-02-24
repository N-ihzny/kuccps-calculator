const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institutionController');

// Public routes
router.get('/', institutionController.getAllInstitutions);
router.get('/types', institutionController.getInstitutionTypes);
router.get('/search', institutionController.searchInstitutions);
router.get('/type/:type', institutionController.getInstitutionsByType);
router.get('/:id', institutionController.getInstitutionById);
router.get('/:id/courses', institutionController.getInstitutionCourses);
router.get('/:id/stats', institutionController.getInstitutionStats);

module.exports = router;