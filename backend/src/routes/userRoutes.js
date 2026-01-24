// User routes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const { prisma } = require('../config/database');
const { createResponse } = require('../utils/helpers');

// Get user profile (authenticated)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json(
        createResponse('error', 'User not found')
      );
    }

    // Parse roles JSON string to array
    const userData = {
      ...user,
      roles: JSON.parse(user.roles),
    };

    res.status(200).json(
      createResponse('success', 'User profile retrieved successfully', userData)
    );
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(
      createResponse('error', 'Failed to retrieve user profile')
    );
  }
});

// Update user profile (authenticated)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, bio, avatar } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    updateData.updatedAt = new Date();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(
      createResponse('success', 'Profile updated successfully', { user: updatedUser })
    );
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(
      createResponse('error', 'Failed to update profile')
    );
  }
});

// Delete user account (authenticated)
router.delete('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json(
      createResponse('success', 'Account deleted successfully')
    );
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json(
      createResponse('error', 'Failed to delete account')
    );
  }
});

module.exports = router;
