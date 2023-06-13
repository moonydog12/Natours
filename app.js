/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

// 設定模板
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

/* Global Middleware */

// cors
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// 設定 security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Development log in
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 限制同一IP的 request
const limiter = rateLimit({
  // 100 requests from the same IP in 1 hr
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization 防止 NoSQL query 注入攻擊(過濾掉NoSQL運算子 ex. $)
app.use(mongoSanitize());

// Data sanitization 防止 XSS 攻擊
app.use(xss());

// 防止 http參數汙染(parameter pollution)
app.use(
  // 參數白名單
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routers
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);

// 處理所有未被定義的路由
app.all('*', (req, res, next) => {
  // 如果 next fn帶參數，express會把它當作錯誤，其他的 middleware 會被省略，跳到處理錯誤的 middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 全域 error controller
app.use(globalErrorHandler);

module.exports = app;
