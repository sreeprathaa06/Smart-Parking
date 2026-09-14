const express = require('express');
const {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings,
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes here are protected (require user to be logged in)
router.use(protect);

router.route('/')
  .post(createBooking)
  .get(admin, getAllBookings); // Only admin can get all bookings

router.route('/my')
  .get(getMyBookings);

router.route('/:id')
  .get(getBooking);

router.route('/:id/cancel')
  .put(cancelBooking);

module.exports = router;
