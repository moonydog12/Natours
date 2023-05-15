const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const createSignToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    // 只存必要欄位(防止一般使用者註冊為管理員身分)
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = createSignToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 確認 email & password 存在
  if (!email || !password) {
    return next(new AppError('Please provide email & password!', 400));
  }

  // 確認 email & password 正確
  const user = await User.findOne({ email }).select('+password');
  const isPasswordCorrect = await user.correctPassword(password, user.password);
  const IncorrectLogin = !user || !isPasswordCorrect;

  if (IncorrectLogin) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 通過以上檢查，回傳 token 給 client
  const token = createSignToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

module.exports = {
  signUp,
  login,
};
