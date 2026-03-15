const { sendOTP, sendResetPasswordEmail } = require('../utils/emailService');

const runTests = async () => {
    const testEmail = 'securityplatform328@gmail.com';

    console.log('--- Starting Email Template Tests ---');
    console.log(`Target Email: ${testEmail}\n`);

    // Test 1: OTP Email
    console.log('Sending Test OTP Email...');
    const otpSuccess = await sendOTP(testEmail, '849201');
    console.log(`OTP Email Status: ${otpSuccess ? 'SUCCESS' : 'FAILED'}\n`);

    // Test 2: Password Reset Email
    console.log('Sending Test Password Reset Email...');
    const resetSuccess = await sendResetPasswordEmail(testEmail, 'http://localhost:5173/reset-password/test-token-12345');
    console.log(`Password Reset Email Status: ${resetSuccess ? 'SUCCESS' : 'FAILED'}\n`);

    console.log('--- Email Tests Completed ---');
    process.exit(0);
};

runTests();
