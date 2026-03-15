const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    isVerified: { // Email verification
        type: Boolean,
        default: false,
    },
    profilePicUrl: {
        type: String,
        default: '',
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer Not to Say'],
    },
    mobileNumber: {
        type: String,
    },
    isMobileVerified: {
        type: Boolean,
        default: false,
    },
    mobileOtp: {
        type: String,
    },
    mobileOtpExpiry: {
        type: Date,
    },
    address: {
        area: String,
        city: String,
        state: String,
        country: String,
        pincode: String,
    },
    otp: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
