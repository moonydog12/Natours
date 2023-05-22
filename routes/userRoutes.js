const express = require('express');

const router = express.Router();

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const {
  signUp,
  login,
  forgetPassword,
  resetPassword,
} = require('../controllers/authController');

router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgetPassword', forgetPassword);
router.post('/resetPassword', resetPassword);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
