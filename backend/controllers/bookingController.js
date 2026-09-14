const Booking = require('../models/Booking');
const Parking = require('../models/Parking');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { parkingId, bookingDate, startTime, endTime } = req.body;

    if (!parkingId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    // 1. Check if the parking location exists
    const parking = await Parking.findById(parkingId);
    if (!parking) {
      return res.status(404).json({ success: false, error: 'Parking spot not found' });
    }

    // 2. Check if availableSlots > 0
    if (parking.availableSlots <= 0) {
      return res.status(400).json({ success: false, error: 'Parking is currently full' });
    }

    // 3. Create the booking
    const bookingId = 'SP-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const booking = await Booking.create({
      bookingId,
      user: req.user.id, // from auth middleware
      parking: parkingId,
      bookingDate,
      startTime,
      endTime,
      status: 'confirmed', // immediately confirm for simplicity
    });

    // 4. Decrease availableSlots by 1
    parking.availableSlots -= 1;
    if (parking.availableSlots === 0) {
      parking.status = 'full';
    }
    await parking.save();

    // Broadcast update
    const io = req.app.get('io');
    if (io) {
      io.emit('parking_updated', {
        parkingId: parking._id,
        availableSlots: parking.availableSlots,
        totalSlots: parking.totalSlots,
        name: parking.name
      });
    }

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('parking', 'name location');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('parking', 'name location pricePerHour');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Ensure booking belongs to user or user is admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to view this booking' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // 1. Verify the booking belongs to the logged-in user
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to cancel this booking' });
    }

    // 2. Prevent cancelling an already cancelled booking
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Booking is already cancelled' });
    }

    // 3. Change booking status to cancelled
    booking.status = 'cancelled';
    await booking.save();

    // 4. Increase availableSlots by 1
    const parking = await Parking.findById(booking.parking);
    if (parking) {
      parking.availableSlots += 1;
      if (parking.status === 'full' && parking.availableSlots > 0) {
        parking.status = 'active';
      }
      await parking.save();

      // Broadcast update
      const io = req.app.get('io');
      if (io) {
        io.emit('parking_updated', {
          parkingId: parking._id,
          availableSlots: parking.availableSlots,
          totalSlots: parking.totalSlots,
          name: parking.name
        });
      }
    }

    res.status(200).json({ success: true, data: booking, message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user', 'name email').populate('parking', 'name location');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings,
};
