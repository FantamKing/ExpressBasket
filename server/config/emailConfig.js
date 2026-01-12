const nodemailer = require('nodemailer');
const axios = require('axios');

// ============ BREVO HTTP API (for Password Reset - works on Render!) ============
// Render blocks SMTP ports (25, 465, 587), so we use Brevo's HTTP API instead
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// ============ GMAIL SMTP (for Broadcast Emails - local development only) ============
const gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000
});

// Verify Gmail connection (for local development)
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    gmailTransporter.verify((error, success) => {
        if (error) {
            console.error('⚠️ Gmail SMTP error:', error.message);
        } else {
            console.log('✅ Gmail SMTP ready (for broadcast emails)');
        }
    });
}

// Check Brevo API key
if (process.env.BREVO_API_KEY) {
    console.log('✅ Brevo HTTP API configured (for password reset)');
} else {
    console.warn('⚠️ BREVO_API_KEY not set - password reset emails disabled');
}

// Email sender addresses
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'expressbasket.help@gmail.com';
const BREVO_FROM_NAME = 'Express Basket';
const GMAIL_FROM = process.env.EMAIL_USER || 'expressbasket.help@gmail.com';

// ============ PASSWORD RESET (via Brevo HTTP API) ============
const sendPasswordResetEmail = async (email, resetToken, userName) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    if (!process.env.BREVO_API_KEY) {
        return { success: false, error: 'Email service not configured. Please set BREVO_API_KEY.' };
    }

    const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🛒 Express Basket</h1>
                    <p>Password Reset Request</p>
                </div>
                <div class="content">
                    <p>Hello <strong>${userName}</strong>,</p>
                    
                    <p>You requested to reset your password. Click the button below to proceed:</p>
                    
                    <div style="text-align: center;">
                        <a href="${resetUrl}" class="button">Reset Password</a>
                    </div>
                    
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">
                        ${resetUrl}
                    </p>
                    
                    <div class="warning">
                        <strong>⚠️ Important:</strong>
                        <ul>
                            <li>This link will expire in <strong>1 hour</strong></li>
                            <li>If you didn't request this, please ignore this email</li>
                            <li>Your password won't change until you create a new one</li>
                        </ul>
                    </div>
                    
                    <p>Best regards,<br><strong>Express Basket Team</strong></p>
                </div>
                <div class="footer">
                    <p>This is an automated email. Please do not reply.</p>
                    <p>&copy; 2025 Express Basket. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        console.log('📧 Attempting to send password reset email to:', email);
        console.log('📧 Using Brevo HTTP API (bypasses SMTP port blocking)');
        console.log('📧 Reset URL:', resetUrl);

        const response = await axios.post(
            BREVO_API_URL,
            {
                sender: {
                    name: BREVO_FROM_NAME,
                    email: BREVO_FROM_EMAIL
                },
                to: [
                    {
                        email: email,
                        name: userName
                    }
                ],
                subject: 'Password Reset Request - Express Basket',
                htmlContent: emailContent
            },
            {
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.BREVO_API_KEY,
                    'content-type': 'application/json'
                },
                timeout: 30000
            }
        );

        console.log('✅ Password reset email sent successfully!');
        console.log('📧 Message ID:', response.data.messageId);

        return { success: true, messageId: response.data.messageId };
    } catch (error) {
        console.error('❌ Brevo API error:', error.response?.data || error.message);

        let errorMessage = 'Failed to send email. ';
        if (error.response?.status === 401) {
            errorMessage += 'Authentication failed. Check BREVO_API_KEY.';
        } else if (error.response?.data?.message) {
            errorMessage += error.response.data.message;
        } else if (error.code === 'ECONNABORTED') {
            errorMessage += 'Request timeout. Please try again.';
        } else {
            errorMessage += error.message || 'Unknown error occurred.';
        }

        return { success: false, error: errorMessage, details: error.response?.data || error.message };
    }
};

// ============ BROADCAST EMAILS (via Gmail SMTP) ============
const sendBroadcastEmail = async (email, userName, subject, message) => {
    const mailOptions = {
        from: `Express Basket <${GMAIL_FROM}>`,
        to: email,
        subject: `${subject} - Express Basket`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🛒 Express Basket</h1>
                        <p>System Notification</p>
                    </div>
                    <div class="content">
                        <p>Hello <strong>${userName}</strong>,</p>
                        
                        <div class="message-box">
                            <h3 style="margin-top: 0; color: #667eea;">${subject}</h3>
                            <p style="white-space: pre-wrap; margin: 0;">${message}</p>
                        </div>
                        
                        <div class="warning">
                            <strong>📢 Important Notice:</strong>
                            <p style="margin: 5px 0 0;">This is an official system notification from Express Basket. Please read it carefully.</p>
                        </div>
                        
                        <p>Best regards,<br><strong>Express Basket Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email. Please do not reply.</p>
                        <p>&copy; 2025 Express Basket. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        console.log('📧 Sending broadcast email via Gmail to:', email);
        const info = await gmailTransporter.sendMail(mailOptions);
        console.log('✅ Broadcast email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Gmail SMTP error for ${email}:`, error.message);

        let errorMessage = 'Failed to send broadcast email. ';
        if (error.code === 'ETIMEDOUT') {
            errorMessage += 'Connection timeout - Gmail SMTP may be blocked on this server.';
        } else if (error.code === 'EAUTH') {
            errorMessage += 'Authentication failed. Check EMAIL_USER and EMAIL_PASSWORD.';
        } else {
            errorMessage += error.message;
        }

        return { success: false, error: errorMessage };
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendBroadcastEmail
};
