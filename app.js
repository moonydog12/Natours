const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;

// use Middleware
app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'successful',
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  const id = parseInt(req.params.id);
  const tour = tours.find((tour) => tour.id === id);

  if (tour) {
    res.status(200).json({
      status: 'successful',
      data: {
        tour,
      },
    });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
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
  if (req.params.id * 1 > tours.length - 1) {
    return res.status(404).json({
      status: 'fail',
      data: {
        tour: 'Invalid ID',
      },
    });
  }

  res.status(200).json({
    status: 'successful',
    data: '<Updated data here>',
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length - 1) {
    return res.status(404).json({
      status: 'fail',
      data: {
        tour: 'Invalid ID',
      },
    });
  }

  res.status(204).json({
    status: 'successful',
    data: 'delete successfully',
  });
};

app.get('/api/v1/tours', getAllTours);

// route that accept variable
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours').get(getAllTours).post(createTour);
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .delete(deleteTour)
  .patch(updateTour);

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
