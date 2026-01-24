// User controller
const { asyncHandler } = require('../utils/helpers');

const userController = {
  register: asyncHandler(async (req, res) => {
    res.json({ message: 'User registration controller - to be implemented' });
  }),
  
  login: asyncHandler(async (req, res) => {
    res.json({ message: 'User login controller - to be implemented' });
  }),
};

module.exports = userController;
