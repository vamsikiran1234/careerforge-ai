const { PrismaClient } = require('@prisma/client');
const { emitToRoom } = require('../config/socket');

const prisma = new PrismaClient();

/**
 * Get all chat rooms for current user
 * Returns list of rooms with last message and unread count
 */
const getChatRooms = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all connections for this user (either as student or mentor)
    const connections = await prisma.mentorConnection.findMany({
      where: {
        AND: [
          { status: 'ACCEPTED' },
          {
            OR: [
              { studentId: userId },
              { mentor: { userId: userId } },
            ],
          },
        ],
      },
      include: {
        mentor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        chatRoom: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    // Get all student user details
    const studentIds = connections.map(conn => conn.studentId);
    const students = await prisma.user.findMany({
      where: { id: { in: studentIds } },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Create a map for quick student lookup
    const studentMap = {};
    students.forEach(student => {
      studentMap[student.id] = student;
    });

    // Format response with chat room data
    const rooms = connections
      .filter(conn => conn.chatRoom) // Only include connections with chat rooms
      .map(conn => {
        const isStudent = conn.studentId === userId;
        const student = studentMap[conn.studentId];
        
        const otherUser = isStudent
          ? { id: conn.mentor.user.id, name: conn.mentor.user.name, email: conn.mentor.user.email }
          : { id: student?.id, name: student?.name, email: student?.email };

        const unreadCount = isStudent
          ? conn.chatRoom.unreadCountStudent
          : conn.chatRoom.unreadCountMentor;

        return {
          id: conn.chatRoom.id,
          connectionId: conn.id,
          otherUser,
          lastMessage: conn.chatRoom.messages[0] || null,
          unreadCount,
          lastActivity: conn.chatRoom.lastActivity,
          isActive: conn.chatRoom.isActive,
        };
      })
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

    res.json({
      success: true,
      data: rooms,
      message: 'Chat rooms retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat rooms',
      error: error.message,
    });
  }
};

/**
 * Get messages for a specific chat room
 * Supports pagination
 */
const getChatMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user has access to this room
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        connection: {
          include: {
            mentor: true,
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found',
      });
    }

    // Check if user is part of this connection
    const hasAccess =
      room.connection.studentId === userId ||
      room.connection.mentor.userId === userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this chat room',
      });
    }

    // Get messages with pagination
    const [messages, totalCount] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { roomId: roomId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.chatMessage.count({
        where: { roomId: roomId },
      }),
    ]);

    // Get sender details for all messages
    const senderIds = [...new Set(messages.map(msg => msg.senderId))];
    const senders = await prisma.user.findMany({
      where: { id: { in: senderIds } },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Create sender map
    const senderMap = {};
    senders.forEach(sender => {
      senderMap[sender.id] = sender;
    });

    // Attach sender details to messages
    const messagesWithSender = messages.map(msg => ({
      ...msg,
      sender: senderMap[msg.senderId],
    }));

    res.json({
      success: true,
      data: {
        messages: messagesWithSender.reverse(), // Reverse to show oldest first
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
      message: 'Messages retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message,
    });
  }
};

/**
 * Send a new message
 * Message is saved to database and emitted via Socket.io
 */
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { roomId } = req.params;
    const { content, messageType = 'TEXT', fileUrl, fileName } = req.body;

    if (!content && !fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Message content or file is required',
      });
    }

    // Verify user has access to this room
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        connection: {
          include: {
            mentor: true,
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found',
      });
    }

    const hasAccess =
      room.connection.studentId === userId ||
      room.connection.mentor.userId === userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this chat room',
      });
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        roomId: roomId,
        senderId: userId,
        content: content || '',
        messageType,
      },
    });

    // Get sender details
    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    // Attach sender to message
    const messageWithSender = {
      ...message,
      sender,
    };

    // Update room's last activity and increment unread count
    const isStudent = room.connection.studentId === userId;
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: {
        lastActivity: new Date(),
        ...(isStudent
          ? { unreadCountMentor: { increment: 1 } }
          : { unreadCountStudent: { increment: 1 } }),
      },
    });

    // Emit message via Socket.io
    emitToRoom(roomId, 'new-message', messageWithSender);

    res.json({
      success: true,
      data: messageWithSender,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

/**
 * Mark messages as read
 * Resets unread count for current user
 */
const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { roomId } = req.params;

    // Verify user has access to this room
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        connection: {
          include: {
            mentor: true,
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found',
      });
    }

    const hasAccess =
      room.connection.studentId === userId ||
      room.connection.mentor.userId === userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this chat room',
      });
    }

    // Update unread count
    const isStudent = room.connection.studentId === userId;
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: {
        ...(isStudent
          ? { unreadCountStudent: 0 }
          : { unreadCountMentor: 0 }),
      },
    });

    // Mark all messages from other user as read
    const messagesUpdated = await prisma.chatMessage.updateMany({
      where: {
        roomId: roomId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // Emit read receipt via Socket.io
    emitToRoom(roomId, 'messages-read', {
      userId,
      roomId: roomId,
      count: messagesUpdated.count,
    });

    res.json({
      success: true,
      data: { messagesMarkedRead: messagesUpdated.count },
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message,
    });
  }
};

/**
 * Upload file to chat
 * Handles file upload for images, documents, etc.
 */
const uploadChatFile = async (req, res) => {
  try {
    // This endpoint will handle file uploads
    // For now, we'll use local storage
    // In production, upload to Cloudinary or S3
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // File URL (adjust based on your upload configuration)
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        url: fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message,
    });
  }
};

module.exports = {
  getChatRooms,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  uploadChatFile,
};
