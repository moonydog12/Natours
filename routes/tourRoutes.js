const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  deleteTour,
  updateTour,
  checkID,
  checkBody,
} = require('../controllers/tourController');

const router = express.Router();

// Param middleware
router.param('id', checkID);

router.route('/').get(getAllTours).post(checkBody, createTour);
router.route('/:id').get(getTour).delete(deleteTour).patch(updateTour);

module.exports = router;
