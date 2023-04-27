const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  deleteTour,
  updateTour,
  aliasTopTours,
} = require('../controllers/tourController');

const router = express.Router();

// Param middleware
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).delete(deleteTour).patch(updateTour);

module.exports = router;
