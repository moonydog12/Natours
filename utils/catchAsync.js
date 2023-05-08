// 包裝非同步function
// 若抓到error,將error作為參數傳入next fn，統一由全域 error controller處理(不必再重複寫 try catch)
const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => next(err));
};

module.exports = catchAsync;
