const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // 操作類型錯誤:回傳錯誤訊息給客戶端
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // 程式類型錯誤或其他錯誤:不洩漏機敏資訊到客戶端
  else {
    // 1)log錯誤
    console.error('Error 🐶', err);

    // 2)回傳中立資訊
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

// 全域錯誤 handler
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 根據環境變數決定回傳資料格式
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  }
};
