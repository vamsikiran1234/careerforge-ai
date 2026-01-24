const jwt = require('jsonwebtoken');

/**
 * Generate a test JWT token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
function generateTestToken(payload = {}) {
  const defaultPayload = {
    userId: 'user123',
    email: 'test@example.com',
    role: 'STUDENT',
    ...payload,
  };

  return jwt.sign(defaultPayload, process.env.JWT_SECRET || 'test-secret-key', {
    expiresIn: '1h',
  });
}

/**
 * Generate a test mentor JWT token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
function generateMentorTestToken(payload = {}) {
  return generateTestToken({
    userId: 'mentor123',
    email: 'mentor@example.com',
    role: 'MENTOR',
    ...payload,
  });
}

/**
 * Generate a test admin JWT token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
function generateAdminTestToken(payload = {}) {
  return generateTestToken({
    userId: 'admin123',
    email: 'admin@example.com',
    role: 'ADMIN',
    ...payload,
  });
}

module.exports = {
  generateTestToken,
  generateMentorTestToken,
  generateAdminTestToken,
};
