# Instructions for Gmail App Password Setup

## 🚨 IMPORTANT: Gmail App Password Required

To send real emails to your Gmail account, you need to set up a Gmail App Password:

### Steps:

1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification (if not already enabled)
3. Go to: https://myaccount.google.com/apppasswords
4. Select "Mail" → "Other (Custom name)"
5. Enter: "CareerForge AI"
6. Copy the generated 16-character password
7. Update the .env file with your App Password

### Update .env file:
Replace this line in .env:
EMAIL_APP_PASSWORD=your-gmail-app-password

With:
EMAIL_APP_PASSWORD=your-actual-16-char-password

### Example .env configuration:
EMAIL_SERVICE=gmail
EMAIL_USER=vamsikiran198@gmail.com
EMAIL_APP_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=CareerForge AI <vamsikiran198@gmail.com>

## Security Notes:
- App passwords are more secure than regular passwords
- Only works with 2-factor authentication enabled
- Can be revoked anytime from Google Account settings