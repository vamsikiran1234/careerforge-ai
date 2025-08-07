const jwt = require('jsonwebtoken');
const { createResponse } = require('../utils/helpers');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json(
      createResponse('error', 'Access token is required', {
        errorCode: 'TOKEN_MISSING'
      })
    );
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      
      let message = 'Invalid or expired token';
      let errorCode = 'TOKEN_INVALID';
      
      if (err.name === 'TokenExpiredError') {
        message = 'Token has expired';
        errorCode = 'TOKEN_EXPIRED';
      } else if (err.name === 'JsonWebTokenError') {
        message = 'Malformed token';
        errorCode = 'TOKEN_MALFORMED';
      }
      
      return res.status(403).json(
        createResponse('error', message, {
          errorCode
        })
      );
    }

    // Add user info to request object
    req.user = user;
    next();
  });
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

module.exports = {
  authenticateToken,
  optionalAuth,
};
