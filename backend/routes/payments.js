const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');
const {
    validatePaymentInit,
    validatePaymentVerify,
    validateExistingPayment
} = require('../middleware/validation');

// Public routes (no auth required)
router.post('/verify-existing', validateExistingPayment, paymentController.verifyExistingPayment);
router.post('/verify', validatePaymentVerify, paymentController.verifyPayment);

// Modified routes - accept BOTH token AND X-User-ID
router.post('/initialize', validatePaymentInit, async (req, res, next) => {
    try {
        // Check for userId in body OR header
        const userId = req.body.userId || req.headers['x-user-id'];
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User ID required. Please login again.'
            });
        }
        
        // Add userId to body if it came from header
        if (!req.body.userId && userId) {
            req.body.userId = userId;
        }
        
        next();
    } catch (error) {
        next(error);
    }
}, paymentController.initializePayment);

router.get('/user/:userId', async (req, res, next) => {
    try {
        const userId = req.params.userId || req.headers['x-user-id'];
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User ID required'
            });
        }
        
        // Override params with header if needed
        if (!req.params.userId && userId) {
            req.params.userId = userId;
        }
        
        next();
    } catch (error) {
        next(error);
    }
}, paymentController.getUserTransactions);

router.get('/status/:userId', async (req, res, next) => {
    try {
        const userId = req.params.userId || req.headers['x-user-id'];
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User ID required'
            });
        }
        
        // Override params with header if needed
        if (!req.params.userId && userId) {
            req.params.userId = userId;
        }
        
        next();
    } catch (error) {
        next(error);
    }
}, paymentController.getPaymentStatus);

module.exports = router;
