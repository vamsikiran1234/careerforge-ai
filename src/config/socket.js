const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

/**
 * Initialize Socket.io server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.io instance
 */
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // JWT Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      return next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection Handler
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Join user's personal room (for targeted messages)
    socket.join(`user:${socket.userId}`);

    // Join Chat Room
    socket.on('join-room', async (roomId) => {
      try {
        // TODO: Verify user has access to this room (check MentorConnection)
        socket.join(`room:${roomId}`);
        console.log(`📥 User ${socket.userId} joined room ${roomId}`);
        
        // Notify others in the room
        socket.to(`room:${roomId}`).emit('user-joined', {
          userId: socket.userId,
          roomId,
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave Chat Room
    socket.on('leave-room', (roomId) => {
      socket.leave(`room:${roomId}`);
      console.log(`📤 User ${socket.userId} left room ${roomId}`);
      
      // Notify others in the room
      socket.to(`room:${roomId}`).emit('user-left', {
        userId: socket.userId,
        roomId,
      });
    });

    // Send Message
    socket.on('send-message', async (data) => {
      const { roomId, content, messageType } = data;
      
      try {
        // Message will be saved to database via HTTP API
        // Socket.io just broadcasts the message in real-time
        
        // Emit to all users in the room (including sender for confirmation)
        io.to(`room:${roomId}`).emit('new-message', {
          roomId,
          content,
          messageType,
          senderId: socket.userId,
          createdAt: new Date().toISOString(),
        });
        
        console.log(`💬 Message sent in room ${roomId} by user ${socket.userId}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing Indicator
    socket.on('typing-start', (data) => {
      const { roomId } = data;
      socket.to(`room:${roomId}`).emit('user-typing', {
        userId: socket.userId,
        roomId,
      });
    });

    socket.on('typing-stop', (data) => {
      const { roomId } = data;
      socket.to(`room:${roomId}`).emit('user-stop-typing', {
        userId: socket.userId,
        roomId,
      });
    });

    // Message Read Receipt
    socket.on('mark-read', (data) => {
      const { roomId, messageIds } = data;
      socket.to(`room:${roomId}`).emit('messages-read', {
        userId: socket.userId,
        roomId,
        messageIds,
      });
    });

    // Disconnect Handler
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

/**
 * Get Socket.io instance
 * @returns {Object} Socket.io instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Emit event to specific user
 * @param {Number} userId - User ID
 * @param {String} event - Event name
 * @param {Object} data - Event data
 */
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Emit event to specific room
 * @param {Number} roomId - Room ID
 * @param {String} event - Event name
 * @param {Object} data - Event data
 */
const emitToRoom = (roomId, event, data) => {
  if (io) {
    io.to(`room:${roomId}`).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToRoom,
};
