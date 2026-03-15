const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, sendMobileOtp, verifyMobileOtp } = require('../controllers/profileController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/profile', protect, getProfile);
router.post('/profile/update', protect, updateProfile);
router.post('/profile/send-otp', protect, sendMobileOtp);
router.post('/profile/verify-otp', protect, verifyMobileOtp);

module.exports = router;
