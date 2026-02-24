const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');
const {
    validatePaymentInit,
    validatePaymentVerify,
    validateExistingPayment
} = require('../middleware/validation');

// Public routes
router.post('/verify-existing', validateExistingPayment, paymentController.verifyExistingPayment);
router.post('/verify', validatePaymentVerify, paymentController.verifyPayment);

// Protected routes
router.post('/initialize', verifyToken, validatePaymentInit, paymentController.initializePayment);
router.get('/user/:userId', verifyToken, paymentController.getUserTransactions);
router.get('/status/:userId', verifyToken, paymentController.getPaymentStatus);

module.exports = router;