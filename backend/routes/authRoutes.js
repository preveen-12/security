const express = require('express');
const router = express.Router();
const { registerUser, verifyOtp, loginUser, resendOtp, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
