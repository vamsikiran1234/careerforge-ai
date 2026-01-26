const nodemailer = require('nodemailer');
const { Resend } = require('resend');

class EmailService {
  constructor() {
    this.transporter = null;
    this.resend = null;
    this.isReady = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Check if Resend is configured
    if (process.env.EMAIL_SERVICE === 'resend' && process.env.RESEND_API_KEY) {
      console.log('📧 Initializing Resend for email sending...');
      this.resend = new Resend(process.env.RESEND_API_KEY);
      this.isReady = true;
      console.log('✅ Resend configured successfully');
      return;
    }
    
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
      // Ensure service is ready
      if (!this.isReady) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      
      // Use Resend if configured
      if (this.resend) {
        console.log('📧 Attempting to send email via Resend...');
        console.log('   From:', 'onboarding@resend.dev');
        console.log('   To:', email);
        
        const { data, error } = await this.resend.emails.send({
          from: 'onboarding@resend.dev',
          to: [email],
          subject: 'Password Reset Request - CareerForge AI',
          html: this.generatePasswordResetEmailTemplate(userName, resetUrl, resetToken, email),
        });

        if (error) {
          console.error('❌ Resend error object:', JSON.stringify(error, null, 2));
          console.error('❌ Resend error.message:', error.message);
          console.error('❌ Resend error.name:', error.name);
          throw new Error(`Resend error: ${error.message || JSON.stringify(error)}`);
        }

        console.log('📧 Password reset email sent successfully via Resend');
        console.log(`   To: ${email}`);
        console.log(`   Message ID: ${data.id}`);

        return {
          success: true,
          messageId: data.id,
          resetUrl,
        };
      }
      
      // Fallback to Gmail/SMTP
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'CareerForge AI <onboarding@resend.dev>',
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
      
      // Use Resend if configured
      if (this.resend) {
        const htmlContent = `
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
        `;

        const { data, error } = await this.resend.emails.send({
          from: 'onboarding@resend.dev',
          to: [email],
          subject: 'Verify Your Mentor Profile - CareerForge AI',
          html: htmlContent,
        });

        if (error) {
          console.error('❌ Resend error:', error);
          throw new Error(`Resend error: ${JSON.stringify(error)}`);
        }

        console.log('📧 Mentor verification email sent successfully via Resend');
        console.log(`   To: ${email}`);
        console.log(`   🔗 Verification URL: ${verificationUrl}`);
        console.log(`   Message ID: ${data.id}`);

        return {
          success: true,
          messageId: data.id,
          verificationUrl,
        };
      }
      
      // Fallback to Gmail/SMTP
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'CareerForge AI <onboarding@resend.dev>',
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

  async sendConnectionRequestEmail(mentorEmail, mentorName, studentName, message) {
    try {
      const subject = 'New Mentorship Connection Request - CareerForge AI';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Connection Request</h2>
          <p>Hi ${mentorName},</p>
          <p>You have received a new mentorship connection request from <strong>${studentName}</strong>.</p>
          ${message ? `
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #374151;"><strong>Student's Message:</strong></p>
              <p style="margin: 10px 0 0 0; color: #374151;">${message}</p>
            </div>
          ` : ''}
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/mentor/connections" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Connection Request
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Please review and respond to this request in your mentor dashboard.
          </p>
        </div>
      `;

      const result = await this.sendEmail(mentorEmail, subject, html);
      console.log('Connection request email sent to:', mentorEmail);
      return result;
    } catch (error) {
      console.error('Error sending connection request email:', error);
      throw error;
    }
  }

  async sendConnectionAcceptedEmail(studentEmail, studentName, mentorName) {
    try {
      const subject = 'Connection Request Accepted - CareerForge AI';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Connection Accepted!</h2>
          <p>Hi ${studentName},</p>
          <p><strong>${mentorName}</strong> has accepted your mentorship connection request!</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/connections" 
               style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Connection
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            You can now start messaging and scheduling sessions with your mentor.
          </p>
        </div>
      `;

      const result = await this.sendEmail(studentEmail, subject, html);
      console.log('Connection accepted email sent to:', studentEmail);
      return result;
    } catch (error) {
      console.error('Error sending connection accepted email:', error);
      throw error;
    }
  }

  async sendConnectionRejectedEmail(studentEmail, studentName, mentorName) {
    try {
      const subject = 'Connection Request Update - CareerForge AI';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6b7280;">Connection Request Update</h2>
          <p>Hi ${studentName},</p>
          <p>${mentorName} is unable to accept your mentorship connection request at this time.</p>
          <p style="color: #666;">
            Don't be discouraged! There are many other mentors who would love to help you on your journey.
          </p>
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/app/mentors" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Find Other Mentors
            </a>
          </div>
        </div>
      `;

      const result = await this.sendEmail(studentEmail, subject, html);
      console.log('Connection rejected email sent to:', studentEmail);
      return result;
    } catch (error) {
      console.error('Error sending connection rejected email:', error);
      throw error;
    }
  }

  async sendMentorApprovalEmail(email, userName) {
    try {
      const subject = 'Mentor Application Approved - CareerForge AI';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Congratulations, ${userName}!</h2>
          <p>Your mentor application has been approved by our team.</p>
          <p>You can now start connecting with students and help them achieve their career goals.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/mentor/dashboard" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Mentor Dashboard
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Thank you for joining our mentorship platform!
          </p>
        </div>
      `;

      const result = await this.sendEmail(email, subject, html);
      console.log('Mentor approval email sent to:', email);
      return result;
    } catch (error) {
      console.error('Error sending mentor approval email:', error);
      throw error;
    }
  }

  async sendMentorRejectionEmail(email, userName, reason) {
    try {
      const subject = 'Mentor Application Update - CareerForge AI';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Mentor Application Status</h2>
          <p>Dear ${userName},</p>
          <p>Thank you for your interest in becoming a mentor on CareerForge AI.</p>
          <p>Unfortunately, we are unable to approve your application at this time.</p>
          ${reason ? `
            <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong></p>
              <p style="margin: 10px 0 0 0; color: #991b1b;">${reason}</p>
            </div>
          ` : ''}
          <p>If you believe this was an error or would like to reapply in the future, please contact our support team.</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br/>
            The CareerForge AI Team
          </p>
        </div>
      `;

      const result = await this.sendEmail(email, subject, html);
      console.log('Mentor rejection email sent to:', email);
      return result;
    } catch (error) {
      console.error('Error sending mentor rejection email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();