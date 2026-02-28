const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Public routes
router.post('/verify-existing', (req, res) => {
    paymentController.verifyExistingPayment(req, res);
});

router.post('/verify', (req, res) => {
    paymentController.verifyPayment(req, res);
});

// Payment initialization
router.post('/initialize', (req, res) => {
    // Get userId from body or header
    const userId = req.body.userId || req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'User ID required'
        });
    }
    req.body.userId = userId;
    paymentController.initializePayment(req, res);
});

// Get payment status
router.get('/status/:userId', (req, res) => {
    const userId = req.params.userId || req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'User ID required'
        });
    }
    req.params.userId = userId;
    paymentController.getPaymentStatus(req, res);
});

// Get user transactions
router.get('/user/:userId', (req, res) => {
    const userId = req.params.userId || req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'User ID required'
        });
    }
    req.params.userId = userId;
    paymentController.getUserTransactions(req, res);
});

module.exports = router;
