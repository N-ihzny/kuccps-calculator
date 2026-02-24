const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { verifyToken } = require('../middleware/auth');
const { validateGrades } = require('../middleware/validation');

// All grade routes require authentication
router.use(verifyToken);

router.post('/', validateGrades, gradeController.saveGrades);
router.get('/user/:userId', gradeController.getUserGrades);
router.get('/latest/:userId', gradeController.getLatestGrades);
router.put('/:id', validateGrades, gradeController.updateGrades);
router.delete('/:id', gradeController.deleteGrades);
router.post('/validate', gradeController.validateGrades);

module.exports = router;