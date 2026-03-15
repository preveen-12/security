const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const OTP = require('../models/OTP');
const User = require('../models/User');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const testFlow = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const testEmail = 'testflow@example.com';

        // 1. Clear any existing records for this email
        await User.deleteOne({ email: testEmail });
        await OTP.deleteOne({ email: testEmail });

        console.log('--- Registering new user ---');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', {
                name: 'Test Flow User',
                email: testEmail,
                password: 'password123'
            });
            console.log('Registration Response:', res.status, res.data);
        } catch (err) {
            console.error('Registration failed:', err.response?.data || err.message);
        }

        // 2. Check DB
        const userCount = await User.countDocuments({ email: testEmail });
        const otpRecord = await OTP.findOne({ email: testEmail });

        console.log(`User collection count for ${testEmail}: ${userCount}`);
        console.log(`OTP collection count for ${testEmail}: ${otpRecord ? 1 : 0}`);

        if (userCount === 0 && otpRecord) {
            console.log('SUCCESS: Registration stored in OTP model, not User model.');
        } else {
            console.error('FAILURE: Unexpected storage behavior.');
        }

        console.log('--- Verifying OTP ---');
        try {
            const verifyRes = await axios.post('http://localhost:5000/api/auth/verify-otp', {
                email: testEmail,
                otp: otpRecord.otp
            });
            console.log('Verify Response:', verifyRes.status, verifyRes.data);
        } catch (err) {
            console.error('Verification failed:', err.response?.data || err.message);
        }

        // 3. Check DB again
        const finalUser = await User.findOne({ email: testEmail });
        const finalOtpCount = await OTP.countDocuments({ email: testEmail });

        console.log(`Final User count: ${finalUser ? 1 : 0}`);
        console.log(`Final OTP count: ${finalOtpCount}`);

        if (finalUser && finalUser.isVerified && finalOtpCount === 0) {
            console.log('SUCCESS: User moved to User collection and marked verified. OTP removed.');
        } else {
            console.error('FAILURE: Verification did not update DB appropriately.');
        }

        // Cleanup
        await User.deleteOne({ email: testEmail });
        process.exit(0);
    } catch (err) {
        console.error('Test error:', err);
        process.exit(1);
    }
};

testFlow();
