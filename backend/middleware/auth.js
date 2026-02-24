const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const helpers = require('../utils/helpers');

// Verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = helpers.jwt.verifyToken(token);

        if (!decoded.valid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                error: decoded.error
            });
        }

        // Check if user still exists
        const [users] = await pool.query(
            'SELECT id, email, role, payment_status FROM users WHERE id = ?',
            [decoded.decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = users[0];
        next();

    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying token',
            error: error.message
        });
    }
};

// Check if user has paid
const requirePayment = async (req, res, next) => {
    try {
        if (!req.user.payment_status) {
            return res.status(403).json({
                success: false,
                message: 'Payment required to access this resource'
            });
        }
        next();

    } catch (error) {
        console.error('Payment check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking payment status',
            error: error.message
        });
    }
};

// Check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        next();

    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking admin status',
            error: error.message
        });
    }
};

// Optional auth (doesn't require token, but adds user if present)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (token) {
            const decoded = helpers.jwt.verifyToken(token);
            if (decoded.valid) {
                const [users] = await pool.query(
                    'SELECT id, email, role, payment_status FROM users WHERE id = ?',
                    [decoded.decoded.id]
                );
                if (users.length > 0) {
                    req.user = users[0];
                }
            }
        }
        next();

    } catch (error) {
        // Just continue without user
        next();
    }
};

module.exports = {
    verifyToken,
    requirePayment,
    isAdmin,
    optionalAuth
};