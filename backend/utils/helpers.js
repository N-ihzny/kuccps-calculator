const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const helpers = {
    jwt: {
        generateToken: (payload, expiresIn = '7d') => {
            const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';
            return jwt.sign(payload, secret, { expiresIn });
        },

        verifyToken: (token) => {
            try {
                const secret = process.env.JWT_SECRET || 'your_jwt_secret_key';
                const decoded = jwt.verify(token, secret);
                return { valid: true, decoded };
            } catch (error) {
                return { valid: false, error: error.message };
            }
        }
    },

    generateRandomString: (length = 10) => {
        return crypto.randomBytes(length).toString('hex').substring(0, length);
    },

    generateTransactionReference: () => {
        const timestamp = Date.now();
        const random = helpers.generateRandomString(8).toUpperCase();
        return `TXN_${timestamp}_${random}`;
    },

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

    formatCurrency: (amount, currency = 'KES') => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    paginate: (data, page = 1, limit = 10) => {
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const results = {};

        if (endIndex < data.length) {
            results.next = { page: page + 1, limit: limit };
        }
        if (startIndex > 0) {
            results.previous = { page: page - 1, limit: limit };
        }

        results.results = data.slice(startIndex, endIndex);
        results.total = data.length;
        results.page = page;
        results.limit = limit;
        results.totalPages = Math.ceil(data.length / limit);

        return results;
    },

    sleep: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    extractToken: (authHeader) => {
        if (!authHeader) return null;
        const parts = authHeader.split(' ');
        return parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;
    },

    sanitizeUser: (user) => {
        const sanitized = { ...user };
        delete sanitized.password;
        return sanitized;
    },

    getClientIp: (req) => {
        return req.headers['x-forwarded-for'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress;
    },

    generateOTP: (length = 6) => {
        return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
    }
};

module.exports = helpers;
