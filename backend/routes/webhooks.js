const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Paystack webhook (no auth required)
router.post('/paystack', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// M-Pesa webhook (if using M-Pesa)
router.post('/mpesa', paymentController.handleWebhook);

module.exports = router;