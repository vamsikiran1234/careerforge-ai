const { createResponse } = require('../utils/helpers');

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  try {
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
        createResponse('error', 'Admin access required. You do not have permission to access this resource.', {
          errorCode: 'FORBIDDEN',
          requiredRole: 'ADMIN',
          userRoles: userRoles
        })
      );
    }

    // User is admin, proceed
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json(
      createResponse('error', 'Server error during authorization check', {
        errorCode: 'SERVER_ERROR'
      })
    );
  }
};

module.exports = {
  isAdmin,
};
