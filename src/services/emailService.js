const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isReady = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Check if Gmail credentials are configured
    if (process.env.EMAIL_SERVICE === 'gmail' && process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
      console.log('📧 Initializing Gmail SMTP for real email sending...');
      console.log(`   Email User: ${process.env.EMAIL_USER}`);
      console.log(`   App Password length: ${process.env.EMAIL_APP_PASSWORD.length} characters`);
      
      // Validate App Password format
      if (process.env.EMAIL_APP_PASSWORD.includes(' ')) {
        console.error('❌ ERROR: Gmail App Password contains spaces. Please remove all spaces.');
        console.error('   Expected format: 16 characters without spaces');
        throw new Error('Invalid Gmail App Password format - remove spaces');
      }
      
      if (process.env.EMAIL_APP_PASSWORD.length !== 16) {
        console.error('❌ ERROR: Gmail App Password should be exactly 16 characters');
        console.error(`   Current length: ${process.env.EMAIL_APP_PASSWORD.length}`);
      }
      
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password
        },
      });
      
      this.isReady = true;
      console.log('✅ Gmail SMTP configured successfully');
      console.log(`   Sending from: ${process.env.EMAIL_USER}`);
      
    } else {
      // Fallback to simulated email service for development
      console.log('📧 Using simulated email service (Gmail not configured)...');
      
      // Create a simple fake transporter for testing
      this.transporter = {
        sendMail: async (mailOptions) => {
          console.log('\n📧 SIMULATED EMAIL SEND:');
          console.log('   To:', mailOptions.to);
          console.log('   Subject:', mailOptions.subject);
          
          // Extract reset URL from HTML content
          const resetUrlMatch = mailOptions.html.match(/href="([^"]*reset-password[^"]*)"/);
          const resetUrl = resetUrlMatch ? resetUrlMatch[1] : 'URL not found';
          
          console.log('   🔗 Reset URL:', resetUrl);
          console.log('   ✅ Email simulated successfully!\n');
          
          return {
            messageId: 'fake-message-id-' + Date.now(),
            response: 'Email simulated successfully',
            resetUrl: resetUrl
          };
        }
      };
      
      this.isReady = true;
      console.log('✅ Email service ready (simulation mode)');
    }
  }

  async sendPasswordResetEmail(email, resetToken, userName) {
    try {
      // Ensure transporter is ready
      if (!this.isReady) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'CareerForge AI <noreply@careerforge.ai>',
        to: email,
        subject: 'Password Reset Request - CareerForge AI',
        html: this.generatePasswordResetEmailTemplate(userName, resetUrl, resetToken, email),
        text: this.generatePasswordResetEmailText(userName, resetUrl),
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('📧 Password reset email sent successfully');
      console.log(`   To: ${email}`);
      console.log(`   Message ID: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
        resetUrl: info.resetUrl || resetUrl, // For development testing
      };
      
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      console.error('   Error details:', {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      });
      
      // Provide more specific error messages
      if (error.code === 'EAUTH') {
        throw new Error('Gmail authentication failed - check your email and app password');
      } else if (error.code === 'ENOTFOUND') {
        throw new Error('Network error - unable to connect to Gmail servers');
      } else if (error.responseCode === 535) {
        throw new Error('Invalid Gmail credentials - verify your app password');
      }
      
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  generatePasswordResetEmailTemplate(userName, resetUrl, resetToken, email) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - CareerForge AI</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button:hover { background: #5a6fd8; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .token { background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 14px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Password Reset Request</h1>
                <p>CareerForge AI</p>
            </div>
            <div class="content">
                <h2>Hello ${userName}!</h2>
                <p>We received a request to reset your password for your CareerForge AI account.</p>
                
                <p>Click the button below to reset your password:</p>
                
                <a href="${resetUrl}" class="button">Reset My Password</a>
                
                <div class="warning">
                    <strong>⚠️ Important Security Information:</strong>
                    <ul>
                        <li>This link will expire in <strong>1 hour</strong></li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Your password won't change until you create a new one</li>
                    </ul>
                </div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <div class="token">${resetUrl}</div>
                
                <p><strong>For development testing, your reset token is:</strong></p>
                <div class="token">${resetToken}</div>
                
                <p>If you have any questions, please contact our support team.</p>
                
                <p>Best regards,<br>The CareerForge AI Team</p>
            </div>
            <div class="footer">
                <p>This email was sent to ${email}</p>
                <p>CareerForge AI - Your AI-Powered Career Companion</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generatePasswordResetEmailText(userName, resetUrl) {
    return `
Hello ${userName}!

We received a request to reset your password for your CareerForge AI account.

To reset your password, please visit the following link:
${resetUrl}

IMPORTANT:
- This link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- Your password won't change until you create a new one

If you have any questions, please contact our support team.

Best regards,
The CareerForge AI Team
    `;
  }

  // Test email functionality
  async testEmailService() {
    try {
      const testEmail = process.env.TEST_EMAIL || 'test@example.com';
      const result = await this.sendPasswordResetEmail(
        testEmail,
        'test-token-123',
        'Test User'
      );
      
      console.log('✅ Email service test successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Email service test failed:', error);
      throw error;
    }
  }

  async sendMentorVerificationEmail(email, verificationToken, userName) {
    try {
      if (!this.isReady) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/mentorship/verify/${verificationToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'CareerForge AI <noreply@careerforge.ai>',
        to: email,
        subject: 'Verify Your Mentor Profile - CareerForge AI',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🎓 Welcome to CareerForge Mentorship!</h2>
            <p>Hi ${userName},</p>
            <p>Thank you for registering as a mentor. Please verify your email to activate your profile.</p>
            <div style="margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                ✓ Verify Email Address
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              ⏰ This link expires in 24 hours<br/>
              📝 After verification, admin will review your profile<br/>
              🔔 You'll be notified once approved
            </p>
            <p style="color: #999; font-size: 12px;">
              Link: <a href="${verificationUrl}">${verificationUrl}</a>
            </p>
          </div>
        `,
        text: `
Hi ${userName}!

Thank you for registering as a mentor on CareerForge AI.

Verify your email: ${verificationUrl}

This link expires in 24 hours.
After verification, your profile will be reviewed by admin.

Best regards,
CareerForge AI Team
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('📧 Mentor verification email sent successfully');
      console.log(`   To: ${email}`);
      console.log(`   🔗 Verification URL: ${verificationUrl}`);
      console.log(`   Message ID: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
        verificationUrl,
      };
      
    } catch (error) {
      console.error('❌ Error sending mentor verification email:', error);
      console.error('   For development, use this URL:', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/mentorship/verify/${verificationToken}`);
      throw error;
    }
  }
}

module.exports = new EmailService();