const { pool } = require('../config/database');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const helpers = require('../utils/helpers');

class PaymentController {
    // Initialize Paystack payment
    async initializePayment(req, res) {
        try {
            const { userId, email, amount, metadata } = req.body;

            if (!userId || !email || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide userId, email and amount'
                });
            }

            // Generate transaction reference
            const reference = helpers.generateTransactionReference();

            // Save pending transaction
            await Transaction.create({
                userId,
                reference,
                amount,
                status: 'pending',
                metadata: metadata || {}
            });

            // In production, integrate with Paystack API here
            // For now, return the reference and Paystack URL

            res.status(200).json({
                success: true,
                message: 'Payment initialized',
                data: {
                    reference,
                    authorization_url: `https://paystack.shop/pay/8gkdge-pmq?email=${email}&reference=${reference}`,
                    access_code: helpers.generateRandomString(12)
                }
            });

        } catch (error) {
            console.error('Payment initialization error:', error);
            res.status(500).json({
                success: false,
                message: 'Error initializing payment',
                error: error.message
            });
        }
    }

    // Verify Paystack payment
    async verifyPayment(req, res) {
        try {
            const { reference } = req.body;

            if (!reference) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide transaction reference'
                });
            }

            // Find transaction
            const transaction = await Transaction.findByReference(reference);

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }

            // In production, verify with Paystack API here
            // For demo, assume payment is successful
            const paymentSuccessful = true;

            if (paymentSuccessful) {
                // Update transaction status
                await Transaction.updateStatus(reference, 'completed');

                // Update user payment status
                await User.updatePaymentStatus(transaction.user_id, true);

                // Get updated user
                const user = await User.findById(transaction.user_id);

                res.status(200).json({
                    success: true,
                    message: 'Payment verified successfully',
                    data: {
                        transaction: {
                            ...transaction,
                            status: 'completed'
                        },
                        user
                    }
                });
            } else {
                await Transaction.updateStatus(reference, 'failed');

                res.status(400).json({
                    success: false,
                    message: 'Payment verification failed'
                });
            }

        } catch (error) {
            console.error('Payment verification error:', error);
            res.status(500).json({
                success: false,
                message: 'Error verifying payment',
                error: error.message
            });
        }
    }

    // Get user transactions
    async getUserTransactions(req, res) {
        try {
            const { userId } = req.params;

            const transactions = await Transaction.findByUserId(userId);

            res.status(200).json({
                success: true,
                data: transactions
            });

        } catch (error) {
            console.error('Error fetching transactions:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching transactions',
                error: error.message
            });
        }
    }

    // Verify existing payment (for Already Paid page)
    async verifyExistingPayment(req, res) {
        try {
            const { indexNumber, email, phone } = req.body;

            if (!indexNumber || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide index number and email'
                });
            }

            // Find user
            const user = await User.findByIndexNumber(indexNumber);

            if (!user || user.email !== email) {
                return res.status(404).json({
                    success: false,
                    message: 'No user found with these details'
                });
            }

            // Find completed transaction
            const transaction = await Transaction.getLatestSuccessful(user.id);

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'No completed payment found for this user'
                });
            }

            // Remove password from response
            delete user.password;

            res.status(200).json({
                success: true,
                message: 'Payment found',
                data: {
                    user,
                    transaction
                }
            });

        } catch (error) {
            console.error('Error verifying existing payment:', error);
            res.status(500).json({
                success: false,
                message: 'Error verifying payment',
                error: error.message
            });
        }
    }

    // Handle Paystack webhook
    async handleWebhook(req, res) {
        try {
            // In production, verify webhook signature
            const event = req.body;

            if (event.event === 'charge.success') {
                const { reference } = event.data;

                // Update transaction status
                await Transaction.updateStatus(reference, 'completed');

                // Get transaction to find user
                const transaction = await Transaction.findByReference(reference);
                
                if (transaction) {
                    // Update user payment status
                    await User.updatePaymentStatus(transaction.user_id, true);
                }
            }

            res.status(200).json({ received: true });

        } catch (error) {
            console.error('Webhook error:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing webhook',
                error: error.message
            });
        }
    }

    // Get payment status
    async getPaymentStatus(req, res) {
        try {
            const { userId } = req.params;

            const hasPaid = await Transaction.hasUserPaid(userId);

            res.status(200).json({
                success: true,
                data: {
                    hasPaid,
                    status: hasPaid ? 'completed' : 'pending'
                }
            });

        } catch (error) {
            console.error('Error checking payment status:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking payment status',
                error: error.message
            });
        }
    }
}

module.exports = new PaymentController();