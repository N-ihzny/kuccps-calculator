const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const helpers = {
    // JWT helpers
    jwt: {
        generateToken: (payload, expiresIn = '7d') => {
            const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';
            return jwt.sign(payload, secret, { expiresIn });
        },

        verifyToken: (token) => {
            try {
                const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';
                const decoded = jwt.verify(token, secret);
                return {
                    valid: true,
                    decoded
                };
            } catch (error) {
                return {
                    valid: false,
                    error: error.message
                };
            }
        }
    },

    // Generate random string
    generateRandomString: (length = 10) => {
        return crypto.randomBytes(length).toString('hex').substring(0, length);
    },

    // Generate transaction reference
    generateTransactionReference: () => {
        const timestamp = Date.now();
        const random = helpers.generateRandomString(8).toUpperCase();
        return `TXN_${timestamp}_${random}`;
    },

    // Format date
    formatDate: (date, format = 'medium') => {
        const d = new Date(date);
        
        const options = {
            short: { month: 'numeric', day: 'numeric', year: '2-digit' },
            medium: { month: 'short', day: 'numeric', year: 'numeric' },
            long: { month: 'long', day: 'numeric', year: 'numeric' },
            full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
        };

        return new Intl.DateTimeFormat('en-KE', options[format]).format(d);
    },

    // Format currency
    formatCurrency: (amount, currency = 'KES') => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Paginate results
    paginate: (data, page = 1, limit = 10) => {
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const results = {};

        if (endIndex < data.length) {
            results.next = {
                page: page + 1,
                limit: limit
            };
        }

        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            };
        }

        results.results = data.slice(startIndex, endIndex);
        results.total = data.length;
        results.page = page;
        results.limit = limit;
        results.totalPages = Math.ceil(data.length / limit);

        return results;
    },

    // Sleep function
    sleep: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Extract token from header
    extractToken: (authHeader) => {
        if (!authHeader) return null;
        
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            return parts[1];
        }
        
        return null;
    },

    // Sanitize user object
    sanitizeUser: (user) => {
        const sanitized = { ...user };
        delete sanitized.password;
        return sanitized;
    },

    // Get client IP
    getClientIp: (req) => {
        return req.headers['x-forwarded-for'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               req.connection.socket?.remoteAddress;
    },

    // Generate random OTP
    generateOTP: (length = 6) => {
        return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
    }
};

module.exports = helpers;
