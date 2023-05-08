const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Mounting the router
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

// 處理所有未被定義的路由
app.all('*', (req, res, next) => {
  // 如果 next fn帶參數，express會把它當作錯誤，其他的 middleware 會被省略，跳到處理錯誤的 middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 全域 error controller
app.use(globalErrorHandler);

module.exports = app;
