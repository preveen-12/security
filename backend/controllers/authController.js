const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOTP, sendResetPasswordEmail } = require('../utils/emailService');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = generateOTP();

        const otpRecord = await OTP.findOneAndUpdate(
            { email },
            { name, email, password: hashedPassword, otp },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (otpRecord) {
            // Send OTP email
            console.log(`[TESTING] Generated OTP for ${email}: ${otp}`);
            await sendOTP(email, otp);
            res.status(201).json({
                message: 'User registered. Please check your email for the OTP to verify your account.',
                email: email
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const otpRecord = await OTP.findOne({ email });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // OTP matches, we can now create the actual User document
        const user = await User.create({
            name: otpRecord.name,
            email: otpRecord.email,
            password: otpRecord.password,
            isVerified: true,
        });

        // Delete the temporary OTP record
        await OTP.deleteOne({ email });

        res.status(200).json({ message: 'Account verified successfully. You can now log in.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during OTP verification' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Account not verified. Please verify using the OTP sent to your email.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user is already verified
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) {
            return res.status(404).json({ message: 'User not found or OTP expired, please register again' });
        }

        // Generate a new OTP and expiry
        const newOtp = generateOTP();
        otpRecord.otp = newOtp;
        otpRecord.createdAt = Date.now(); // Reset TTL

        await otpRecord.save();
        console.log(`[TESTING] Resent OTP for ${email}: ${newOtp}`);
        await sendOTP(email, newOtp);

        res.status(200).json({ message: 'A new OTP has been sent to your email.' });
    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({ message: 'Server error while resending OTP' });
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to resetPasswordToken field
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        // Create reset URL
        // Using localhost for development as per user request
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        try {
            const emailSent = await sendResetPasswordEmail(user.email, resetUrl);
            if (!emailSent) {
                // If email service returns false (failed to send)
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                await user.save();
                return res.status(500).json({ message: 'Email could not be sent due to a network or configuration error' });
            }
            res.status(200).json({ message: 'Password reset link sent to email' });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            console.error('Email sending exception:', error);
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const resetToken = req.params.token;
        const { password } = req.body;

        // Hash token from URL
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    verifyOtp,
    loginUser,
    resendOtp,
    forgotPassword,
    resetPassword,
};
