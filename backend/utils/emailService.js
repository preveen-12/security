const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.error('Failed to connect to email service:', error);
    } else {
        console.log('Gmail Service Ready to send emails.');
    }
});

const buildCyberAlertEmail = ({ title, message, otpCode = null, linkUrl = null, linkText = null }) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>APT-Project Pro Security</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0E14; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #FFFFFF; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0B0E14; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Email Container Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #12141D; border: 1px solid #E6E6FA; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);">
          <!-- Header -->
          <tr>
            <td align="center" style="background-color: #1A0B2E; padding: 35px 20px; border-bottom: 1px solid rgba(230, 230, 250, 0.1);">
              <!-- Glowing 'P' Logo -->
              <table border="0" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  <td align="center" valign="middle" style="width: 56px; height: 56px; background-color: #1A0B2E; border: 2px solid #8A2BE2; border-radius: 50%; font-size: 26px; font-weight: bold; color: #E6E6FA; line-height: 56px; box-shadow: 0 0 20px rgba(138, 43, 226, 0.4);">
                    P
                  </td>
                </tr>
              </table>
              <h1 style="color: #E6E6FA; margin: 20px 0 0 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">APT-Project Pro</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td align="center" style="padding: 40px 30px;">
              <h2 style="color: #FFFFFF; font-size: 20px; font-weight: 500; margin: 0 0 15px 0;">${title}</h2>
              <p style="color: #E6E6FA; font-size: 15px; line-height: 1.6; margin: 0 0 35px 0; opacity: 0.9;">
                ${message}
              </p>
              
              ${otpCode ? `
              <!-- OTP Display Box -->
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto 35px auto;">
                <tr>
                  <td align="center" style="background-color: rgba(230, 230, 250, 0.05); border: 2px dashed #E6E6FA; border-radius: 8px; padding: 20px 40px;">
                    <div style="font-size: 36px; font-weight: 700; color: #E6E6FA; letter-spacing: 12px; margin: 0;">
                      ${otpCode}
                    </div>
                  </td>
                </tr>
              </table>
              ` : ''}

              ${linkUrl ? `
              <!-- Action Button -->
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 6px; background: linear-gradient(135deg, #4B0082, #8A2BE2);">
                    <a href="${linkUrl}" target="_blank" style="font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none; padding: 16px 36px; border-radius: 6px; display: inline-block;">${linkText || 'Verify Now'}</a>
                  </td>
                </tr>
              </table>
              ` : ''}

              ${otpCode ? `
              <p style="color: #A0A0C0; font-size: 13px; margin: 30px 0 0 0;">
                This code will expire in 10 minutes.
              </p>
              ` : ''}
              ${linkUrl ? `
              <p style="color: #A0A0C0; font-size: 13px; margin: 30px 0 0 0;">
                This link will expire in 1 hour.
              </p>
              ` : ''}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #080A0F; padding: 25px 30px; border-top: 1px solid rgba(230, 230, 250, 0.05);">
              <p style="color: #8080A0; font-size: 12px; line-height: 1.6; margin: 0;">
                This is a security-related email for your APT-Project Pro account. If you did not request this, please ignore this email.
              </p>
              <p style="color: #505070; font-size: 11px; margin: 15px 0 0 0;">
                &copy; ${new Date().getFullYear()} APT-Project. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const sendOTP = async (email, otp) => {
    try {
        let info = await transporter.sendMail({
            from: `"APT-Project Pro" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your OTP for APT-Project Pro Registration",
            text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
            html: buildCyberAlertEmail({
                title: "Authentication Required",
                message: "You have requested an action that requires security verification. Please use the One-Time Password (OTP) below to proceed securely.",
                otpCode: otp
            })
        });

        console.log("Message sent to: %s", info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending OTP:', error);
        return false;
    }
};

const sendMobileUpdateOTP = async (email, mobileNumber, otp) => {
    try {
        let info = await transporter.sendMail({
            from: `"APT-Project Pro" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Mobile Number Update Verification",
            text: `Your OTP to verify the new mobile number (${mobileNumber}) is: ${otp}. It is valid for 10 minutes.`,
            html: buildCyberAlertEmail({
                title: "Mobile Update Request",
                message: `You have requested to update your mobile number to <b>${mobileNumber}</b>. Please use the One-Time Password (OTP) below to verify this change.`,
                otpCode: otp
            })
        });

        console.log("Mobile update OTP sent to: %s", info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending Mobile Update OTP:', error);
        return false;
    }
};

const sendResetPasswordEmail = async (email, resetUrl) => {
    try {
        let info = await transporter.sendMail({
            from: `"APT-Project Pro" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password Reset Request",
            text: `You requested a password reset. Please go to this link to reset your password: \n\n ${resetUrl} \n\n This link is valid for 1 hour.`,
            html: buildCyberAlertEmail({
                title: "Password Reset Request",
                message: "We received a request to reset the password associated with your account. Click the button below to proceed securely.",
                linkUrl: resetUrl,
                linkText: "Reset Password"
            })
        });

        console.log("Password reset email sent to: %s", info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending Password Reset email:', error);
        return false;
    }
};

module.exports = { sendOTP, sendMobileUpdateOTP, sendResetPasswordEmail };
