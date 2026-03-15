const User = require('../models/User');
const { sendMobileUpdateOTP } = require('../utils/emailService');

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error retrieving profile' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { gender, address, profilePicUrl } = req.body;

        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (gender) user.gender = gender;
        if (address) user.address = address;
        if (profilePicUrl) user.profilePicUrl = profilePicUrl;

        // If mobile number is updated, we strictly require re-verification.
        if (req.body.mobileNumber && req.body.mobileNumber !== user.mobileNumber) {
            user.mobileNumber = req.body.mobileNumber;
            user.isMobileVerified = false;
        }

        await user.save();

        // Return updated user object without password
        const updatedUser = await User.findById(req.user.id).select('-password');
        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error updating profile' });
    }
};

// --- SIMULATED SMS MFA FLOW ---
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendMobileOtp = async (req, res) => {
    try {
        const { mobileNumber } = req.body;
        if (!mobileNumber) return res.status(400).json({ message: 'Mobile number is required' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = generateOTP();
        user.mobileNumber = mobileNumber; // Sync the requested number temporarily
        user.mobileOtp = otp;
        user.mobileOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // 🚨 MOCK TWILIO SMS DISPATCH REPLACED WITH EMAIL OTP 🚨
        const emailSent = await sendMobileUpdateOTP(user.email, mobileNumber, otp);
        if (!emailSent) {
            return res.status(500).json({ message: 'Failed to send OTP to registered email address.' });
        }

        res.status(200).json({ message: 'OTP sent to your registered email address successfully.' });
    } catch (error) {
        console.error('Error sending mobile OTP:', error);
        res.status(500).json({ message: 'Server error dispatching SMS' });
    }
};

const verifyMobileOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.isMobileVerified) {
            return res.status(400).json({ message: 'Mobile is already verified' });
        }

        if (user.mobileOtp !== otp || user.mobileOtpExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isMobileVerified = true;
        user.mobileOtp = undefined;
        user.mobileOtpExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Mobile number verified successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during mobile verification' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    sendMobileOtp,
    verifyMobileOtp
};
