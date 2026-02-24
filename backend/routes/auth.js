const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const {
    validateRegistration,
    validateLogin,
    validatePasswordChange,
    validateResetEmail
} = require('../middleware/validation');

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/social-login', authController.socialLogin);
router.post('/verify-token', authController.verifyToken);
router.post('/request-password-reset', validateResetEmail, authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.post('/change-password', verifyToken, validatePasswordChange, authController.changePassword);

module.exports = router;