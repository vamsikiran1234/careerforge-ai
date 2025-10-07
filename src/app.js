const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

// Constants
const RATE_LIMIT_WINDOW_MS = 900000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // Maximum requests per window
const HTTP_STATUS_OK = 200;

// Import routes
const chatRoutes = require('./routes/chatRoutes');
const quizRoutes = require('./routes/quizRoutes');
// const mentorRoutes = require('./routes/mentorRoutes'); // OLD SYSTEM - REMOVED
const mentorshipRoutes = require('./routes/mentorshipRoutes'); // NEW MENTORSHIP PLATFORM
const mentorChatRoutes = require('./routes/mentorChatRoutes'); // MENTOR CHAT SYSTEM (Phase 3)
const mentorSessionRoutes = require('./routes/mentorSessionRoutes'); // MENTOR SESSION BOOKING (Phase 4)
const reviewRoutes = require('./routes/reviewRoutes'); // MENTOR REVIEW SYSTEM (Phase 5)
const notificationRoutes = require('./routes/notificationRoutes'); // NOTIFICATION SYSTEM (Phase 6)
const analyticsRoutes = require('./routes/analyticsRoutes'); // ANALYTICS SYSTEM (Phase 7)
const dashboardRoutes = require('./routes/dashboardRoutes'); // USER DASHBOARD (Phase 8)
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const reactionRoutes = require('./routes/reactionRoutes');
const shareRoutes = require('./routes/shareRoutes');
const testRoutes = require('./routes/testRoutes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - updated to include Vite dev server
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || RATE_LIMIT_WINDOW_MS,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(HTTP_STATUS_OK).json({
    status: 'success',
    message: 'CareerForge AI API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/quiz', quizRoutes);
// app.use('/api/v1/mentors', mentorRoutes); // OLD SYSTEM - REMOVED (will be replaced with new system)
app.use('/api/v1/mentorship', mentorshipRoutes); // NEW MENTORSHIP PLATFORM
app.use('/api/v1/mentor-chat', mentorChatRoutes); // MENTOR CHAT SYSTEM (Phase 3)
app.use('/api/v1/sessions', mentorSessionRoutes); // MENTOR SESSION BOOKING (Phase 4)
app.use('/api/v1/reviews', reviewRoutes); // MENTOR REVIEW SYSTEM (Phase 5)
app.use('/api/v1/notifications', notificationRoutes); // NOTIFICATION SYSTEM (Phase 6)
app.use('/api/v1/analytics', analyticsRoutes); // ANALYTICS SYSTEM (Phase 7)
app.use('/api/v1/dashboard', dashboardRoutes); // USER DASHBOARD (Phase 8)
app.use('/api/v1/reactions', reactionRoutes);
app.use('/api/v1/share', shareRoutes);
app.use('/api/v1/test', testRoutes);

// API Documentation routes
const docsRoutes = require('./routes/docsRoutes');
app.use('/api/v1/docs', docsRoutes);
app.use('/api/v1/users', userRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
