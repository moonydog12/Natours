const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },

  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },

  photo: {
    type: String,
  },

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],

    // 確認密碼相同(只在新增使用者時作用!)
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same!',
    },
  },

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  // 當密碼被更動過才執行這個 middleware
  if (!this.isModified('password')) {
    return next();
  }

  // 密碼加密(with cost of 12)
  this.password = await bcrypt.hash(this.password, 12);

  // 僅確認密碼輸入相同，不需存入資料庫(刪除欄位資料)
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    // 表示在 issue JWT 後有更改過密碼
    return JWTimeStamp < changedTimestamp;
  }

  // 表示密碼沒被更改過
  return false;
};

// 隨機生成驗證token(允許更改密碼)
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  // 加密後的token存在DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // 未加密token傳給user
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
