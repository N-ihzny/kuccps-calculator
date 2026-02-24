const validators = require('../utils/validators');

// Validate registration
const validateRegistration = (req, res, next) => {
    const { fullName, email, phone, password, indexNumber } = req.body;
    const errors = [];

    if (!fullName || fullName.length < 3) {
        errors.push('Full name must be at least 3 characters');
    }

    if (!email || !validators.email(email)) {
        errors.push('Please provide a valid email address');
    }

    if (!phone || !validators.phone(phone)) {
        errors.push('Please provide a valid Kenyan phone number');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    if (indexNumber && !validators.indexNumber(indexNumber)) {
        errors.push('Please provide a valid KCSE index number (format: 1234/567890)');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
};

// Validate login
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || !validators.email(email)) {
        errors.push('Please provide a valid email address');
    }

    if (!password) {
        errors.push('Please provide your password');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
};

// Validate grades
const validateGrades = (req, res, next) => {
    const { grades } = req.body;
    
    if (!grades || typeof grades !== 'object') {
        return res.status(400).json({
            success: false,
            message: 'Grades must be an object'
        });
    }

    const errors = [];
    const validGrades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E', ''];

    for (const [subject, grade] of Object.entries(grades)) {
        if (grade && !validGrades.includes(grade)) {
            errors.push(`Invalid grade "${grade}" for subject "${subject}"`);
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
};

// Validate payment initialization
const validatePaymentInit = (req, res, next) => {
    const { userId, email, amount } = req.body;
    const errors = [];

    if (!userId) {
        errors.push('User ID is required');
    }

    if (!email || !validators.email(email)) {
        errors.push('Valid email is required');
    }

    if (!amount || amount < 1 || isNaN(amount)) {
        errors.push('Valid amount is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
};

// Validate payment verification
const validatePaymentVerify = (req, res, next) => {
    const { reference } = req.body;

    if (!reference) {
        return res.status(400).json({
            success: false,
            message: 'Transaction reference is required'
        });
    }

    next();
};

// Validate existing payment check
const validateExistingPayment = (req, res, next) => {
    const { indexNumber, email } = req.body;
    const errors = [];

    if (!indexNumber) {
        errors.push('Index number is required');
    } else if (!validators.indexNumber(indexNumber)) {
        errors.push('Invalid index number format');
    }

    if (!email) {
        errors.push('Email is required');
    } else if (!validators.email(email)) {
        errors.push('Invalid email format');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
};

// Validate course filters
const validateCourseFilters = (req, res, next) => {
    const { limit, offset } = req.query;

    if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
        return res.status(400).json({
            success: false,
            message: 'Limit must be a number between 1 and 100'
        });
    }

    if (offset && (isNaN(offset) || offset < 0)) {
        return res.status(400).json({
            success: false,
            message: 'Offset must be a positive number'
        });
    }

    next();
};

// Validate password change
const validatePasswordChange = (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const errors = [];

    if (!currentPassword) {
        errors.push('Current password is required');
    }

    if (!newPassword) {
        errors.push('New password is required');
    } else if (newPassword.length < 6) {
        errors.push('New password must be at least 6 characters');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
};

// Validate email for password reset
const validateResetEmail = (req, res, next) => {
    const { email } = req.body;

    if (!email || !validators.email(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address'
        });
    }

    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateGrades,
    validatePaymentInit,
    validatePaymentVerify,
    validateExistingPayment,
    validateCourseFilters,
    validatePasswordChange,
    validateResetEmail
};