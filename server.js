const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('Unhandled Exception! Shutting down...');
  console.log(err.name, err.message);

  // 結束程式
  process.exit(1);
});

const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successfully');
  });

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// 處理 Unhandled promise rejection
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection! Shutting down...');
  console.log(err.name, err.message);

  // 結束程式
  server.close(() => {
    process.exit(1);
  });
});
