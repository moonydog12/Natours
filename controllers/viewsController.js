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

const getTour = catchAsync(async (req, res) => {
  // get the data for the requested tour(including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'reviews rating user',
  });

  // Build template

  // Render template using data
  res.status(200).render('tour', {
    tour,
  });
});

module.exports = { getOverview, getTour };
