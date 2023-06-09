const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

const getOverview = catchAsync(async (req, res) => {
  // Get tour data from collection
  const tours = await Tour.find();

  // Build template

  // Render the template using tour data

  res.status(200).render('overview', {
    tours,
  });
});

const getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'Test',
  });
};

module.exports = { getOverview, getTour };
