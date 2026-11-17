const app = require('./app');
const { initializeSocket } = require('./config/socket');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Pre-warm database connection at server startup for instant <50ms first-request response
connectDB().catch((err) => {
  console.warn('⚠️ Non-fatal DB pre-warm warning (will retry on first request):', err.message);
});

const server = app.listen(PORT, () => {
  console.log(`🚀 CareerForge AI server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔄 Backend server running on port ${PORT}`);
});

// Initialize Socket.io
initializeSocket(server);
console.log(`🔌 Socket.io initialized and ready for real-time connections`);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

module.exports = server;
