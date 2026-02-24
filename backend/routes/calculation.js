const express = require('express');
const router = express.Router();
const calculationController = require('../controllers/calculationController');
const { verifyToken, requirePayment } = require('../middleware/auth');
const { validateGrades } = require('../middleware/validation');

// All calculation routes require authentication and payment
router.use(verifyToken);
router.use(requirePayment);

router.post('/eligibility', validateGrades, calculationController.calculateEligibility);
router.post('/cluster-points', validateGrades, calculationController.calculateClusterPoints);
router.post('/compare', calculationController.compareCourses);
router.post('/recommendations', validateGrades, calculationController.getRecommendations);

module.exports = router;