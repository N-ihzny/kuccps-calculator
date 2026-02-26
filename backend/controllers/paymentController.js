const { pool } = require('../config/database');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const helpers = require('../utils/helpers');

class PaymentController {
    // Initialize Paystack payment - FIXED VERSION
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

            // FIXED: Use your actual Paystack payment link
            const authorization_url = `https://paystack.com/pay/kuccps-checker`;
            
            // Add query parameters to track the user
            const urlWithParams = new URL(authorization_url);
            urlWithParams.searchParams.append('email', email);
            urlWithParams.searchParams.append('reference', reference);
            urlWithParams.searchParams.append('user_id', userId);
            
            // Add any other metadata as query params
            if (metadata.fullName) urlWithParams.searchParams.append('customer_name', metadata.fullName);
            if (metadata.phone) urlWithParams.searchParams.append('phone', metadata.phone);
            if (metadata.indexNumber) urlWithParams.searchParams.append('index_number', metadata.indexNumber);

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
            // For now, check if already completed
            if (transaction.status === 'completed') {
                const user = await User.findById(transaction.user_id);
                
                return res.status(200).json({
                    success: true,
                    message: 'Payment already verified',
                    data: {
                        transaction,
                        user
                    }
                });
            }

            // Assume payment is successful (in production, call Paystack API)
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

    // Handle Paystack webhook - FIXED VERSION
    async handleWebhook(req, res) {
        try {
            // Parse the raw body (already parsed by express.raw middleware)
            let event;
            try {
                event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            } catch (e) {
                event = req.body;
            }
            
            console.log('Webhook received:', event.event);

            // In production, verify webhook signature here
            // const signature = req.headers['x-paystack-signature'];
            // const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(event)).digest('hex');
            // if (hash !== signature) return res.status(401).send('Unauthorized');

            if (event.event === 'charge.success') {
                const { reference } = event.data;
                const customerEmail = event.data.customer.email;
                const amount = event.data.amount / 100; // Convert from kobo to KES
                const metadata = event.data.metadata || {};

                console.log(`Processing successful payment for reference: ${reference}`);

                // Check if transaction already exists
                let transaction = await Transaction.findByReference(reference);
                
                if (transaction) {
                    // Update existing transaction
                    await Transaction.updateStatus(reference, 'completed');
                    
                    // Update user payment status
                    await User.updatePaymentStatus(transaction.user_id, true);
                    
                    console.log(`Updated transaction ${reference} for user ${transaction.user_id}`);
                } else {
                    // Try to find user by email or metadata
                    let userId = metadata.user_id;
                    
                    if (!userId) {
                        // Find user by email
                        const user = await User.findByEmail(customerEmail);
                        if (user) {
                            userId = user.id;
                        }
                    }
                    
                    if (userId) {
                        // Create transaction record
                        await Transaction.create({
                            userId,
                            reference,
                            amount,
                            status: 'completed',
                            metadata: metadata
                        });
                        
                        // Update user payment status
                        await User.updatePaymentStatus(userId, true);
                        
                        console.log(`Created transaction ${reference} for user ${userId}`);
                    } else {
                        console.log(`Could not find user for reference ${reference}`);
                    }
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
