require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Parking = require('./models/Parking');
const connectDB = require('./config/db');
const parkingRoutes = require('./routes/parkingRoutes');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/parking', parkingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartPark backend is healthy' });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Attach io to the app so controllers can use it (e.g. for bookings)
app.set('io', io);

// Simulation Loop: Run every 10 seconds
setInterval(async () => {
  try {
    const parkings = await Parking.find();
    if (parkings.length === 0) return;

    // Pick a random parking spot
    const randomIndex = Math.floor(Math.random() * parkings.length);
    const parking = parkings[randomIndex];

    // Randomly decide if a car enters or leaves
    const carEnters = Math.random() > 0.5;

    let updated = false;
    if (carEnters && parking.availableSlots > 0) {
      parking.availableSlots -= 1;
      updated = true;
    } else if (!carEnters && parking.availableSlots < parking.totalSlots) {
      parking.availableSlots += 1;
      updated = true;
    }

    if (updated) {
      await parking.save();
      // Broadcast the update to all connected frontend clients
      io.emit('parking_updated', {
        parkingId: parking._id,
        availableSlots: parking.availableSlots,
        totalSlots: parking.totalSlots,
        name: parking.name
      });
      // console.log(`Simulation: ${carEnters ? 'Car entered' : 'Car left'} ${parking.name}. Slots: ${parking.availableSlots}`);
    }
  } catch (error) {
    console.error('Simulation error:', error.message);
  }
}, 10000);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with WebSockets enabled`);
});
