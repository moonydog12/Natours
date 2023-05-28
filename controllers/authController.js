const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const createSignToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = createSignToken(user._id);

  // 透過 Cookie 傳送 JWT
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // 只允許http方式(client端不能修改 cookie)
  };

  if (process.env.NODE_ENV === 'production') {
    // 只允許透過 https
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);

  // remove password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    // 只存必要欄位(防止一般使用者註冊為管理員身分)
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  createSendToken(newUser, 201, res);
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
  createSendToken(user, 200, res);
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

const forgetPassword = catchAsync(async (req, res, next) => {
  // 1.根據 post data 的 email 取得 user data
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }

  // 2.製造一個隨機token(method定義在 model)
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3.傳到user email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password,please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token(valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  /* 1.透過token取得使用者資料
      要再加密一次才能比較，因為存在資料庫的是加密過的token
  */
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });

  // 2.如果token沒過期，且user存在資料庫，重設密碼
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3.更新 user changedPasswordAt欄位資料
  // 4.登入使用者(送JWT)
  createSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  // 1.取得使用者資料
  const user = await User.findById(req.user.id).select('+password');

  // 2.檢查 Post 得到的密碼是正確的
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  // 3.通過檢查，更新密碼
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  /* 不能用User.findByIdANdUpdate在有關於密碼相關欄位，
  validator無法作用，因為 this 指不到當前該筆document
   */
  await user.save();

  // 4.登入使用者，送JWT
  createSendToken(user, 200, res);
});

module.exports = {
  signUp,
  login,
  protect,
  restrictTo,
  forgetPassword,
  resetPassword,
  updatePassword,
};
