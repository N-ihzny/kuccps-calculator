const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const {
    validatePaymentInit,
    validatePaymentVerify,
    validateExistingPayment
} = require('../middleware/validation');

// Public routes
router.post('/verify-existing', validateExistingPayment, (req, res) => paymentController.verifyExistingPayment(req, res));
router.post('/verify', validatePaymentVerify, (req, res) => paymentController.verifyPayment(req, res));

// Protected routes - accept both token AND X-User-ID
router.post('/initialize', validatePaymentInit, (req, res, next) => {
    try {
        const userId = req.body.userId || req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User ID required'
            });
        }
        if (!req.body.userId && userId) {
            req.body.userId = userId;
        }
        next();
    } catch (error) {
        next(error);
    }
}, (req, res) => paymentController.initializePayment(req, res));

router.get('/user/:userId', (req, res, next) => {
    try {
        const userId = req.params.userId || req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User ID required'
            });
        }
        if (!req.params.userId && userId) {
            req.params.userId = userId;
        }
        next();
    } catch (error) {
        next(error);
    }
}, (req, res) => paymentController.getUserTransactions(req, res));

router.get('/status/:userId', (req, res, next) => {
    try {
        const userId = req.params.userId || req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User ID required'
            });
        }
        if (!req.params.userId && userId) {
            req.params.userId = userId;
        }
        next();
    } catch (error) {
        next(error);
    }
}, (req, res) => paymentController.getPaymentStatus(req, res));

module.exports = router;
