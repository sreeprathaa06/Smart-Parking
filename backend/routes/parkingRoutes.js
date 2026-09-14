const express = require('express');
const {
  getParkings,
  getParking,
  createParking,
  updateParking,
  deleteParking,
} = require('../controllers/parkingController');

const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getParkings)
  .post(protect, admin, createParking);


router.route('/:id')
  .get(getParking)
  .put(protect, admin, updateParking)
  .delete(protect, admin, deleteParking);

module.exports = router;
