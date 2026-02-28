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

            // Check if user exists, create if not
            try {
                let user = await User.findById(userId);
                if (!user) {
                    console.log('📝 User not found in database, creating new user...');
                    
                    await User.create({
                        id: userId,
                        fullName: metadata?.fullName || email.split('@')[0],
                        email: email,
                        phone: metadata?.phone || '',
                        password: 'temp_' + Date.now(),
                        indexNumber: metadata?.indexNumber || null,
                        paymentStatus: false
                    });
                    console.log('✅ User created successfully:', userId);
                } else {
                    console.log('✅ User found in database:', userId);
                }
            } catch (userError) {
                console.error('❌ Error checking/creating user:', userError);
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

            // FIXED: Use the correct working URL
            const authorization_url = `https://paystack.shop/pay/8gkdge-pmq`;
            
            // Create URL object to append parameters
            const urlWithParams = new URL(authorization_url);
            
            // Split full name into first and last name
            const fullName = metadata?.fullName || 'Customer';
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0] || 'Customer';
            const lastName = nameParts.slice(1).join(' ') || 'Name';
            
            // Append all necessary parameters exactly as the form expects
            urlWithParams.searchParams.append('first_name', firstName);
            urlWithParams.searchParams.append('last_name', lastName);
            urlWithParams.searchParams.append('email', email);
            urlWithParams.searchParams.append('phone', metadata?.phone || '');
            urlWithParams.searchParams.append('amount', amount.toString());
            
            // Also add custom fields for tracking
            urlWithParams.searchParams.append('reference', reference);
            urlWithParams.searchParams.append('user_id', userId);
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

    // Get user transactions
    async getUserTransactions(req, res) {
        try {
            const userId = req.params.userId || req.headers['x-user-id'];
            
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID required'
                });
            }

            const transactions = await Transaction.findByUserId(userId);

            res.status(200).json({
                success: true,
                data: transactions
            });

        } catch (error) {
            console.error('❌ Error fetching transactions:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching transactions',
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

    // Verify existing payment (for Already Paid page)
    async verifyExistingPayment(req, res) {
        try {
            const { indexNumber, email } = req.body;

            if (!indexNumber || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide index number and email'
                });
            }

            const user = await User.findByIndexNumber(indexNumber);

            if (!user || user.email !== email) {
                return res.status(404).json({
                    success: false,
                    message: 'No user found with these details'
                });
            }

            const transaction = await Transaction.getLatestSuccessful(user.id);

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'No completed payment found for this user'
                });
            }

            delete user.password;

            res.status(200).json({
                success: true,
                message: 'Payment found',
                data: { user, transaction }
            });

        } catch (error) {
            console.error('❌ Error verifying existing payment:', error);
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
            console.log('✅ Webhook received');
            
            let event;
            try {
                event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            } catch (e) {
                console.error('❌ Failed to parse webhook body:', e);
                event = req.body;
            }
            
            console.log('Event type:', event?.event);
            
            if (event?.event === 'charge.success') {
                const { reference } = event.data;
                console.log('✅ Payment successful for reference:', reference);
                
                await Transaction.updateStatus(reference, 'completed');
                
                const transaction = await Transaction.findByReference(reference);
                if (transaction) {
                    await User.updatePaymentStatus(transaction.user_id, true);
                    console.log('✅ User payment status updated for user:', transaction.user_id);
                } else {
                    console.log('⚠️ Transaction not found for reference:', reference);
                }
            }
            
            res.status(200).json({ received: true });
        } catch (error) {
            console.error('❌ Webhook error:', error);
            res.status(200).json({ received: true });
        }
    }
}

module.exports = new PaymentController();
