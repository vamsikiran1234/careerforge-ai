const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const formatDate = date => {
  return new Date(date).toISOString();
};

const sanitizeInput = input => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

const createResponse = (status, message, data = null) => {
  const response = { status, message };
  if (data) response.data = data;
  return response;
};

module.exports = {
  asyncHandler,
  generateId,
  formatDate,
  sanitizeInput,
  createResponse,
};
