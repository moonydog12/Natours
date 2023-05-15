const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

// Users
const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // 回傳結果
  res.status(200).json({
    status: 'successful',
    results: users.length,
    data: {
      users,
    },
  });
});

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

module.exports = { getAllUsers, getUser, createUser, updateUser, deleteUser };
