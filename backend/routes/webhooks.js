const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Paystack webhook
router.post('/paystack', express.raw({ type: 'application/json' }), (req, res) => {
    paymentController.handleWebhook(req, res);
});

// M-Pesa webhook
router.post('/mpesa', (req, res) => {
    res.status(200).json({ received: true });
});

module.exports = router;
