const express = require('express');
const router = express.Router();

// Simple webhook handler - no controller needed for now
router.post('/paystack', express.raw({ type: 'application/json' }), (req, res) => {
    console.log('✅ Webhook received from Paystack');
    
    try {
        // Parse the raw body
        const event = JSON.parse(req.body);
        console.log('Event type:', event.event);
        
        // You can process the event here later
        if (event.event === 'charge.success') {
            console.log('✅ Payment successful for reference:', event.data.reference);
            // TODO: Update transaction status in database
        }
        
        // Always return 200 to acknowledge receipt
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('❌ Webhook error:', error);
        // Still return 200 to prevent Paystack from retrying
        res.status(200).json({ received: true });
    }
});

// M-Pesa webhook (if using M-Pesa)
router.post('/mpesa', (req, res) => {
    console.log('✅ M-Pesa webhook received');
    res.status(200).json({ received: true });
});

module.exports = router;
