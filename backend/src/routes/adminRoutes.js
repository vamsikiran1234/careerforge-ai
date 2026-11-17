const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.use(isAdmin);

// GET /api/v1/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        mentorProfile: true,
        careerSessions: true,
        quizSessions: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedUsers = users.map(user => {
      let role = 'STUDENT';
      try {
        const roles = JSON.parse(user.roles || '[]');
        if (roles.includes('ADMIN')) role = 'ADMIN';
        else if (roles.includes('MENTOR') || user.mentorProfile) role = 'MENTOR';
      } catch (e) {
        if (user.mentorProfile) role = 'MENTOR';
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: role,
        isBanned: user.bio && user.bio.includes('[BANNED]') ? true : false,
        createdAt: user.createdAt,
        _count: {
          connections: user.mentorProfile?.totalConnections || 0,
          sessions: user.careerSessions?.length || 0,
          reviews: 0
        }
      };
    });

    res.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});

// PUT /api/v1/admin/users/:id/ban
router.put('/users/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let bio = user.bio || '';
    if (isBanned) {
      if (!bio.includes('[BANNED]')) bio = '[BANNED] ' + bio;
    } else {
      bio = bio.replace('[BANNED] ', '').replace('[BANNED]', '');
    }

    await prisma.user.update({
      where: { id },
      data: { bio }
    });

    res.json({
      success: true,
      message: isBanned ? 'User banned successfully' : 'User unbanned successfully'
    });
  } catch (error) {
    console.error('Error toggling ban status:', error);
    res.status(500).json({ success: false, message: 'Failed to update user status', error: error.message });
  }
});

// GET /api/v1/admin/activities
router.get('/activities', async (req, res) => {
  try {
    const [recentUsers, recentSessions, recentMessages] = await Promise.all([
      prisma.user.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      prisma.careerSession.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: true } }),
      prisma.chatMessage.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
    ]);

    const activities = [];

    recentUsers.forEach(u => {
      activities.push({
        id: 'user-' + u.id,
        type: 'USER',
        user: u.name,
        action: 'registered as a new user',
        timestamp: u.createdAt,
        details: u.email
      });
    });

    recentSessions.forEach(s => {
      activities.push({
        id: 'session-' + s.id,
        type: 'SESSION',
        user: s.user?.name || 'User',
        action: 'started career session: ' + (s.title || 'Career Chat'),
        timestamp: s.createdAt,
        details: s.id
      });
    });

    recentMessages.forEach(m => {
      activities.push({
        id: 'msg-' + m.id,
        type: 'MESSAGE',
        user: 'User ' + m.senderId.substring(0, 6),
        action: 'sent a message in mentorship room',
        timestamp: m.createdAt,
        details: m.content ? m.content.substring(0, 30) : ''
      });
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: activities.slice(0, 15)
    });
  } catch (error) {
    console.error('Error fetching admin activities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activities', error: error.message });
  }
});

// GET /api/v1/admin/activity-stats
router.get('/activity-stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeUsers, todayMessages, todaySessions, todaySignups] = await Promise.all([
      prisma.user.count(),
      prisma.chatMessage.count({ where: { createdAt: { gte: today } } }),
      prisma.mentorSession.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: today } } })
    ]);

    res.json({
      success: true,
      data: {
        activeUsers,
        todayMessages,
        todaySessions,
        todaySignups
      }
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity stats', error: error.message });
  }
});

module.exports = router;

