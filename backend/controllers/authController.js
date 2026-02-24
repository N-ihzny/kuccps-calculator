const { pool } = require('../config/database');
const User = require('../models/User');
const jwtHelper = require('../utils/helpers').jwt;
const bcrypt = require('bcryptjs');

class AuthController {
    // Register new user
    async register(req, res) {
        try {
            const { fullName, email, phone, password, indexNumber, examYear, schoolName, county } = req.body;

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User already exists with this email'
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const userId = await User.create({
                fullName,
                email,
                phone,
                password: hashedPassword,
                indexNumber,
                examYear,
                schoolName,
                county
            });

            // Get created user
            const user = await User.findById(userId);

            // Generate token
            const token = jwtHelper.generateToken({ id: user.id, email: user.email });

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: { user, token }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Error registering user',
                error: error.message
            });
        }
    }

    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Remove password from response
            delete user.password;

            // Generate token
            const token = jwtHelper.generateToken({ id: user.id, email: user.email });

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: { user, token }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Error logging in',
                error: error.message
            });
        }
    }

    // Social login (Google/Apple/Facebook)
    async socialLogin(req, res) {
        try {
            const { provider, email, fullName, phone } = req.body;

            // Check if user exists
            let user = await User.findByEmail(email);

            if (!user) {
                // Create new user
                const userId = await User.create({
                    fullName,
                    email,
                    phone,
                    password: 'SOCIAL_AUTH',
                    authProvider: provider
                });
                user = await User.findById(userId);
            }

            // Remove password from response
            delete user.password;

            // Generate token
            const token = jwtHelper.generateToken({ id: user.id, email: user.email });

            res.status(200).json({
                success: true,
                message: 'Social login successful',
                data: { user, token }
            });

        } catch (error) {
            console.error('Social login error:', error);
            res.status(500).json({
                success: false,
                message: 'Error with social login',
                error: error.message
            });
        }
    }

    // Verify token
    async verifyToken(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }

            const decoded = jwtHelper.verifyToken(token);
            if (!decoded.valid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }

            const user = await User.findById(decoded.decoded.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            delete user.password;

            res.status(200).json({
                success: true,
                data: { user }
            });

        } catch (error) {
            console.error('Token verification error:', error);
            res.status(500).json({
                success: false,
                message: 'Error verifying token',
                error: error.message
            });
        }
    }

    // Change password
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            await User.updatePassword(userId, hashedPassword);

            res.status(200).json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Error changing password',
                error: error.message
            });
        }
    }

    // Request password reset
    async requestPasswordReset(req, res) {
        try {
            const { email } = req.body;

            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Generate reset token
            const resetToken = jwtHelper.generateToken(
                { id: user.id, purpose: 'password_reset' },
                '1h'
            );

            // In production, send email with reset link
            // await emailService.sendPasswordResetEmail(email, resetToken);

            res.status(200).json({
                success: true,
                message: 'Password reset email sent',
                data: { resetToken } // Remove in production
            });

        } catch (error) {
            console.error('Password reset request error:', error);
            res.status(500).json({
                success: false,
                message: 'Error requesting password reset',
                error: error.message
            });
        }
    }

    // Reset password
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            const decoded = jwtHelper.verifyToken(token);
            if (!decoded.valid || decoded.decoded.purpose !== 'password_reset') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired reset token'
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await User.updatePassword(decoded.decoded.id, hashedPassword);

            res.status(200).json({
                success: true,
                message: 'Password reset successful'
            });

        } catch (error) {
            console.error('Password reset error:', error);
            res.status(500).json({
                success: false,
                message: 'Error resetting password',
                error: error.message
            });
        }
    }
}

module.exports = new AuthController();