require('dotenv').config();
const mongoose = require('mongoose');
const Parking = require('../models/Parking');
const Booking = require('../models/Booking');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartpark');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const parkings = [
  {
    name: 'KSRCE Main Parking',
    location: 'KSR College of Engineering, Tiruchengode',
    totalSlots: 50,
    availableSlots: 32,
    pricePerHour: 20,
    openingTime: '08:00',
    closingTime: '18:00',
    description: 'Main parking area for staff and visitors near the administrative block.',
    coordinates: { lat: 11.3615, lng: 77.8285 },
    hasEVCharging: true
  },
  {
    name: 'KSRCE Student Parking',
    location: 'Tiruchengode',
    totalSlots: 40,
    availableSlots: 18,
    pricePerHour: 15,
    openingTime: '08:00',
    closingTime: '18:00',
    description: 'Dedicated student parking near the main gate.',
    coordinates: { lat: 11.3600, lng: 77.8270 },
    hasEVCharging: false
  },
  {
    name: 'Salem Central Parking',
    location: 'Salem, Tamil Nadu',
    totalSlots: 60,
    availableSlots: 27,
    pricePerHour: 30,
    openingTime: '00:00',
    closingTime: '23:59',
    description: '24/7 central parking area in the heart of Salem city.',
    coordinates: { lat: 11.6643, lng: 78.1460 },
    hasEVCharging: true
  },
  {
    name: 'Salem Junction Parking',
    location: 'Salem Railway Junction',
    totalSlots: 45,
    availableSlots: 12,
    pricePerHour: 25,
    openingTime: '00:00',
    closingTime: '23:59',
    description: 'Railway station parking with high security.',
    coordinates: { lat: 11.6750, lng: 78.1320 },
    hasEVCharging: false
  },
  {
    name: 'Coimbatore Central Parking',
    location: 'Coimbatore, Tamil Nadu',
    totalSlots: 80,
    availableSlots: 41,
    pricePerHour: 30,
    openingTime: '06:00',
    closingTime: '22:00',
    description: 'Large parking facility near Coimbatore market.',
    coordinates: { lat: 11.0168, lng: 76.9558 },
    hasEVCharging: true
  },
  {
    name: 'Chennai Central Parking',
    location: 'Chennai Central',
    totalSlots: 100,
    availableSlots: 56,
    pricePerHour: 40,
    openingTime: '00:00',
    closingTime: '23:59',
    description: 'Multi-level car parking at Chennai Central station.',
    coordinates: { lat: 13.0827, lng: 80.2707 },
    hasEVCharging: true
  },
  {
    name: 'Bengaluru City Parking',
    location: 'Bengaluru',
    totalSlots: 120,
    availableSlots: 73,
    pricePerHour: 50,
    openingTime: '05:00',
    closingTime: '23:00',
    description: 'Premium parking area in Bengaluru city center.',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    hasEVCharging: true
  },
  {
    name: 'Erode City Parking',
    location: 'Erode, Tamil Nadu',
    totalSlots: 55,
    availableSlots: 29,
    pricePerHour: 20,
    openingTime: '07:00',
    closingTime: '21:00',
    description: 'Convenient parking near Erode bus stand.',
    coordinates: { lat: 11.3410, lng: 77.7172 },
    hasEVCharging: false
  }
];

const seedData = async () => {
  try {
    await connectDB();

    // To avoid orphans, we could optionally clear bookings, but let's just clear parking for now to avoid breaking existing users too much if possible.
    // However, since parking IDs will change, existing bookings might break. It's better to clear bookings too in a demo reset.
    await Parking.deleteMany();
    await Booking.deleteMany();
    
    console.log('Existing parking and booking data cleared!');

    await Parking.insertMany(parkings);
    
    console.log('Demo Parking Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
