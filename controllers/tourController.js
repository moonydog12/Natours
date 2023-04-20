const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

const checkID = (req, res, next, val) => {
  if (req.params.id * 1 > tours.length) {
    // 如果有錯誤，就讓 function 在這裡中斷 (回傳一個 response)
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

// Create a checkBody middleware
const checkBody = (req, res, next) => {
  // 檢查 req body 包含特定 property
  const { name, price } = req.body;
  if (!name || !price) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'Missing name or price' });
  }
  next();
};

// Handlers
const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'successful',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const tour = tours.find((tour) => tour.id === id);

  res.status(200).json({
    status: 'successful',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  res.status(200).json({
    status: 'successful',
    data: '<Updated data here>',
  });
};

const deleteTour = (req, res) => {
  res.status(204).json({
    status: 'successful',
    data: 'delete successfully',
  });
};

module.exports = {
  getAllTours,
  getTour,
  updateTour,
  createTour,
  deleteTour,
  checkID,
  checkBody,
};
