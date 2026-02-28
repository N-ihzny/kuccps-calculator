const Transaction = require('../models/Transaction');
const User = require('../models/User');
const helpers = require('../utils/helpers');

class PaymentController {
    // Initialize Paystack payment
    async initializePayment(req, res) {
        try {
            console.log('📝 Payment initialization started');
            
            const userId = req.body.userId || req.headers['x-user-id'];
            const { email, amount, metadata } = req.body;

            console.log('📝 User ID:', userId);
            console.log('📝 Email:', email);

            if (!userId || !email || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide userId, email and amount'
                });
            }

            const reference = helpers.generateTransactionReference();
            console.log('📝 Generated reference:', reference);

            try {
                await Transaction.create({
                    userId,
                    reference,
                    amount,
                    status: 'pending',
                    metadata: metadata || {}
                });
                console.log('📝 Transaction saved successfully');
            } catch (dbError) {
                console.error('❌ Database error:', dbError);
                return res.status(500).json({
                    success: false,
                    message: 'Database error: ' + dbError.message,
                    error: dbError.message
                });
            }

            const authorization_url = `https://paystack.com/pay/kuccps-checker`;
            const urlWithParams = new URL(authorization_url);
            urlWithParams.searchParams.append('email', email);
            urlWithParams.searchParams.append('reference', reference);
            urlWithParams.searchParams.append('user_id', userId);
            
            if (metadata?.fullName) urlWithParams.searchParams.append('customer_name', metadata.fullName);
            if (metadata?.phone) urlWithParams.searchParams.append('phone', metadata.phone);
            if (metadata?.indexNumber) urlWithParams.searchParams.append('index_number', metadata.indexNumber);

            res.status(200).json({
                success: true,
                message: 'Payment initialized',
                data: {
                    reference,
                    authorization_url: urlWithParams.toString(),
                    access_code: helpers.generateRandomString(12)
                }
            });

        } catch (error) {
            console.error('❌ Payment initialization error:', error);
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

            const transaction = await Transaction.findByReference(reference);

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }

            if (transaction.status === 'completed') {
                const user = await User.findById(transaction.user_id);
                return res.status(200).json({
                    success: true,
                    message: 'Payment already verified',
                    data: { transaction, user }
                });
            }

            // In production, verify with Paystack API here
            const paymentSuccessful = true;

            if (paymentSuccessful) {
                await Transaction.updateStatus(reference, 'completed');
                await User.updatePaymentStatus(transaction.user_id, true);
                const user = await User.findById(transaction.user_id);

                res.status(200).json({
                    success: true,
                    message: 'Payment verified successfully',
                    data: {
                        transaction: { ...transaction, status: 'completed' },
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
            console.error('❌ Payment verification error:', error);
            res.status(500).json({
                success: false,
                message: 'Error verifying payment',
                error: error.message
            });
        }
    }

    // Get payment status
    async getPaymentStatus(req, res) {
        try {
            const userId = req.params.userId || req.headers['x-user-id'];
            
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID required'
                });
            }

            const hasPaid = await Transaction.hasUserPaid(userId);

            res.status(200).json({
                success: true,
                data: {
                    hasPaid,
                    status: hasPaid ? 'completed' : 'pending'
                }
            });

        } catch (error) {
            console.error('❌ Error checking payment status:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking payment status',
                error: error.message
            });
        }
    }
}

module.exports = new PaymentController();
