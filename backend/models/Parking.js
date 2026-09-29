const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a parking name'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    description: {
      type: String,
    },
    totalSlots: {
      type: Number,
      required: [true, 'Please specify total slots'],
    },
    availableSlots: {
      type: Number,
      required: true,
      default: function() { return this.totalSlots; }
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Please specify price per hour'],
    },
    openingTime: {
      type: String,
      required: true,
    },
    closingTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'full'],
      default: 'active',
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    hasEVCharging: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

module.exports = mongoose.model('Parking', parkingSchema);
