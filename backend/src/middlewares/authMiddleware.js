const jwt = require('jsonwebtoken');
const { createResponse } = require('../utils/helpers');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('Auth Debug:', {
    url: req.path,
    authHeader: authHeader?.substring(0, 50) + '...',
    token: token?.substring(0, 30) + '...',
    hasToken: !!token
  });

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

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(
      createResponse('error', 'Authentication required', {
        errorCode: 'AUTH_REQUIRED'
      })
    );
  }

  // Check if user has ADMIN role in their roles array
  const userRoles = req.user.roles || [];
  if (!userRoles.includes('ADMIN')) {
    return res.status(403).json(
      createResponse('error', 'Admin access required', {
        errorCode: 'ADMIN_ONLY',
        userRoles: userRoles
      })
    );
  }

  next();
};

// Middleware to check if user has a specific role
const hasRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(
      createResponse('error', 'Authentication required', {
        errorCode: 'AUTH_REQUIRED'
      })
    );
  }

  const userRoles = req.user.roles || [];
  if (!userRoles.includes(role)) {
    return res.status(403).json(
      createResponse('error', `${role} role required`, {
        errorCode: 'INSUFFICIENT_PERMISSIONS',
        requiredRole: role,
        userRoles: userRoles
      })
    );
  }

  next();
};

// Middleware to check if user has any of the specified roles
const hasAnyRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(
      createResponse('error', 'Authentication required', {
        errorCode: 'AUTH_REQUIRED'
      })
    );
  }

  const userRoles = req.user.roles || [];
  const hasRole = roles.some(role => userRoles.includes(role));
  
  if (!hasRole) {
    return res.status(403).json(
      createResponse('error', `One of these roles required: ${roles.join(', ')}`, {
        errorCode: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRoles: userRoles
      })
    );
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  isAdmin,
  hasRole,
  hasAnyRole,
};
