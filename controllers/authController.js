const { promisify } = require('util');
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
    passwordChangedAt: req.body.passwordChangedAt,
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
  // 1.確認 email & password 存在
  if (!email || !password) {
    return next(new AppError('Please provide email & password!', 400));
  }

  // 2.確認 email & password 正確
  const user = await User.findOne({ email }).select('+password');
  const isPasswordCorrect = await user.correctPassword(password, user.password);
  const IncorrectLogin = !user || !isPasswordCorrect;

  if (IncorrectLogin) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3.通過以上檢查，回傳 token 給 client
  const token = createSignToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

// 保護路由 middleware
const protect = catchAsync(async (req, res, next) => {
  let token;
  const isValidToken =
    req.headers.authorization && req.headers.authorization.startsWith('Bearer');
  // 1.確認jwt token
  if (isValidToken) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in!Please log in to get access.', 401)
    );
  }

  // 2.驗證token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3.確認使用者存在(解密資料的userId 跟 資料庫的userID 會完全相同)
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does not exist', 401)
    );
  }

  // 4.確認使用者是否在接收token後有變更過密碼
  const isPasswordChanged = currentUser.changedPasswordAfter(decoded.iat);
  if (isPasswordChanged) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // 提供使用路由的權限
  req.user = currentUser; // 把資料加到 request，讓後續 middleware可以使用
  next();
});

// 權限限制
const restrictTo =
  (...roles) =>
  (req, res, next) => {
    const isPermitted = roles.includes(req.user.role);
    if (!isPermitted) {
      return next(
        new AppError("You don't have permission to perform this action", 403)
      );
    }

    next();
  };

module.exports = {
  signUp,
  login,
  protect,
  restrictTo,
};
