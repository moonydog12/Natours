const express = require('express');
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({
  // 允許使用其他 route 的網址參數
  mergeParams: true,
});

router
  .route('/')
  .get(getAllReviews)
  .get(getReview)
  .post(protect, restrictTo('user'), setTourUserIds, createReview);

router.route('/:id').get(getReview).delete(deleteReview).patch(updateReview);

module.exports = router;
