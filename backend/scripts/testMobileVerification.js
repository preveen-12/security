const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const testMobileFlow = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const testEmail = 'mobiletest@example.com';
        await User.deleteOne({ email: testEmail });

        // Create a verified user to test profile updates
        const user = await User.create({
            name: 'Mobile Test User',
            email: testEmail,
            password: 'hashedpassword',
            isVerified: true
        });

        console.log('--- Requesting Mobile OTP ---');
        // We simulate how the frontend gets auth first; let's login
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: testEmail,
            password: 'password' // We bypass this by signing token manually, or we can just create a token.
        }).catch(e => e);
        // Wait, easier to generate a token explicitly for the script
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const newMobile = '1234567890';
        try {
            const sendOtpRes = await axios.post('http://localhost:5000/api/users/profile/send-otp', {
                mobileNumber: newMobile
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Send OTP Response:', sendOtpRes.status, sendOtpRes.data);
        } catch (err) {
            console.error('Send OTP failed:', err.response?.data || err.message);
        }

        // Fetch user manually from DB to grab the OTP directly to verify the verify route
        const updatedUser = await User.findById(user._id);
        const otp = updatedUser.mobileOtp;

        console.log(`Generated OTP in DB: ${otp}`);

        console.log('--- Verifying Mobile OTP ---');
        try {
            const verifyRes = await axios.post('http://localhost:5000/api/users/profile/verify-otp', {
                otp: otp
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Verify Response:', verifyRes.status, verifyRes.data);
        } catch (err) {
            console.error('Verification failed:', err.response?.data || err.message);
        }

        // Check DB for success
        const finalUser = await User.findById(user._id);
        if (finalUser.isMobileVerified && finalUser.mobileNumber === newMobile && !finalUser.mobileOtp) {
            console.log('SUCCESS: Mobile number updated and verified successfully.');
        } else {
            console.error('FAILURE: Mobile number verification did not reflect in DB.');
        }

        // Cleanup
        await User.deleteOne({ email: testEmail });
        process.exit(0);
    } catch (err) {
        console.error('Test error:', err);
        process.exit(1);
    }
};

testMobileFlow();
