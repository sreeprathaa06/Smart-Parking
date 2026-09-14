const Parking = require('../models/Parking');

// @desc    Get all parking spots
// @route   GET /api/parking
// @access  Public
const getParkings = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const parkings = await Parking.find(query);
    res.status(200).json({ success: true, count: parkings.length, data: parkings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get single parking spot
// @route   GET /api/parking/:id
// @access  Public
const getParking = async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);

    if (!parking) {
      return res.status(404).json({ success: false, error: 'Parking spot not found' });
    }

    res.status(200).json({ success: true, data: parking });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Parking spot not found' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create new parking spot
// @route   POST /api/parking
// @access  Public (for dev)
const createParking = async (req, res) => {
  try {
    // Basic validation
    const { name, location, totalSlots, pricePerHour, openingTime, closingTime } = req.body;
    if (!name || !location || !totalSlots || !pricePerHour || !openingTime || !closingTime) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    const parking = await Parking.create(req.body);
    res.status(201).json({ success: true, data: parking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update parking spot
// @route   PUT /api/parking/:id
// @access  Public (for dev)
const updateParking = async (req, res) => {
  try {
    let parking = await Parking.findById(req.params.id);

    if (!parking) {
      return res.status(404).json({ success: false, error: 'Parking spot not found' });
    }

    parking = await Parking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: parking });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Parking spot not found' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete parking spot
// @route   DELETE /api/parking/:id
// @access  Public (for dev)
const deleteParking = async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);

    if (!parking) {
      return res.status(404).json({ success: false, error: 'Parking spot not found' });
    }

    await parking.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, error: 'Parking spot not found' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  getParkings,
  getParking,
  createParking,
  updateParking,
  deleteParking
};
