const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/database');
const { createResponse } = require('../utils/helpers');
const router = express.Router();

// Helper function to generate JWT token
const generateToken = (userId, email, roles) => {
  return jwt.sign(
    { 
      userId, 
      email,
      roles: roles || ['STUDENT'] // Default to STUDENT if no roles provided
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// Register endpoint
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
], async (req, res) => {
  try {
    console.log('Registration attempt:', { email: req.body.email, name: req.body.name });
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json(
        createResponse('error', 'Validation failed', {
          errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
        })
      );
    }

    const { name, email, password } = req.body;

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json(
        createResponse('error', 'User already exists with this email')
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Determine roles based on email (admin users get both STUDENT and ADMIN roles)
    const adminEmails = ['vamsikiran198@gmail.com', 'admin@careerforge.ai'];
    const assignedRoles = adminEmails.includes(email.toLowerCase()) 
      ? '["STUDENT","ADMIN"]' 
      : '["STUDENT"]';

    // Create new user in database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roles: assignedRoles,
      }
    });

    console.log('User registered successfully:', email, 'User ID:', newUser.id);

    // Return user data (without password)
    const userRoles = JSON.parse(newUser.roles); // Parse JSON string to array
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      roles: userRoles, // Include roles in response
      avatar: newUser.avatar,
      bio: newUser.bio,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    res.status(201).json(
      createResponse('success', 'User registered successfully. Please log in.', {
        user: userResponse,
      })
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(
      createResponse('error', 'Internal server error during registration', 
        process.env.NODE_ENV === 'development' ? { error: error.message } : null
      )
    );
  }
});

// Login endpoint
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Login validation errors:', errors.array());
      return res.status(400).json(
        createResponse('error', 'Validation failed', {
          errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
        })
      );
    }

    const { email, password } = req.body;

    // Find user by email in database
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json(
        createResponse('error', 'Invalid email or password')
      );
    }

    console.log('User found, checking password for:', email);
    console.log('Stored password hash:', user.password ? 'Present' : 'Missing');
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json(
        createResponse('error', 'Invalid email or password')
      );
    }

    // Generate token with user roles
    const userRoles = JSON.parse(user.roles); // Parse JSON string to array
    const token = generateToken(user.id, user.email, userRoles);

    // Return user data (without password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: userRoles, // Include roles in response
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    console.log('Login successful for user:', email);
    res.status(200).json(
      createResponse('success', 'Login successful', {
        user: userResponse,
        token,
      })
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(
      createResponse('error', 'Internal server error during login',
        process.env.NODE_ENV === 'development' ? { error: error.message } : null
      )
    );
  }
});

// Get current user endpoint (for token validation)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json(
        createResponse('error', 'No token provided')
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json(
        createResponse('error', 'Invalid token')
      );
    }

    // Return user data (without password)
    const userRoles = JSON.parse(user.roles); // Parse JSON string to array
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: userRoles, // Include roles in response
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json(
      createResponse('success', 'User data retrieved successfully', userResponse)
    );
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json(
      createResponse('error', 'Invalid token')
    );
  }
});

// Forgot Password endpoint
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required'),
], async (req, res) => {
  try {
    console.log('Forgot password request:', { email: req.body.email });
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Forgot password validation errors:', errors.array());
      return res.status(400).json(
        createResponse('error', 'Validation failed', {
          errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
        })
      );
    }

    const { email } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      // For security, don't reveal if email exists or not
      console.log('User not found for forgot password:', email);
      return res.status(200).json(
        createResponse('success', 'If your email is registered, you will receive a password reset link.')
      );
    }

    // Generate reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token and expiry
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      }
    });

    // Send password reset email
    try {
      const emailService = require('../services/emailService');
      const emailResult = await emailService.sendPasswordResetEmail(
        email,
        resetToken,
        user.name
      );

      console.log('Password reset email sent successfully:', emailResult);
      
      res.status(200).json(
        createResponse('success', 'Password reset email sent successfully. Please check your email.', {
          emailSent: true,
          previewUrl: emailResult.previewUrl // For development testing
        })
      );
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      
      // Clear the reset token if email sending failed
      await prisma.user.update({
        where: { email },
        data: {
          resetPasswordToken: null,
          resetPasswordExpires: null,
        }
      });
      
      res.status(500).json(
        createResponse('error', 'Failed to send password reset email. Please try again later.')
      );
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json(
      createResponse('error', 'Internal server error during password reset request',
        process.env.NODE_ENV === 'development' ? { error: error.message } : null
      )
    );
  }
});

// Reset Password endpoint
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
], async (req, res) => {
  try {
    console.log('Reset password request:', { token: req.body.token?.substring(0, 10) + '...' });
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Reset password validation errors:', errors.array());
      return res.status(400).json(
        createResponse('error', 'Validation failed', {
          errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
        })
      );
    }

    const { token, password } = req.body;

    // Find user by reset token and check if token hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date() // Token must not be expired
        }
      }
    });
    
    if (!user) {
      console.log('Invalid or expired reset token:', token.substring(0, 10) + '...');
      return res.status(400).json(
        createResponse('error', 'Invalid or expired reset token.')
      );
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user with new password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        updatedAt: new Date(),
      }
    });

    console.log('Password reset successfully for user:', user.email);

    res.status(200).json(
      createResponse('success', 'Password reset successfully. You can now log in with your new password.')
    );
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json(
      createResponse('error', 'Internal server error during password reset',
        process.env.NODE_ENV === 'development' ? { error: error.message } : null
      )
    );
  }
});

module.exports = router;
