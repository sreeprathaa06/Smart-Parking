# SmartPark - Smart Parking Availability Finder
👉 [View SmartPark Live](https://smartpark-app-w8f7.onrender.com/)

> A full-stack web application designed to help users find and reserve parking spaces effortlessly, while providing administrators with a powerful dashboard to manage parking locations and real-time availability.

## 📋 Project Overview
SmartPark solves the common urban problem of finding parking by digitizing parking space availability. The platform enables users to discover parking spaces in their city, check real-time availability, and secure a spot in advance.

## 🎯 Problem Statement
Urban areas suffer from severe traffic congestion, much of which is caused by drivers circling to find parking. Traditional parking lots lack digital visibility, meaning drivers cannot know if a lot is full until they arrive. This leads to wasted time, increased fuel consumption, and higher carbon emissions.

## 🚀 Objectives
- **Visibility:** Provide a unified platform where drivers can see all managed parking spaces in one place.
- **Real-Time Data:** Display live availability of parking slots using WebSocket technology.
- **Convenience:** Allow users to reserve a parking spot before arriving, guaranteeing availability.
- **Management:** Equip parking operators with an admin dashboard to easily add, edit, and track their parking lots and bookings.

## ✨ Features
### For Users:
- **Location Search:** Find parking locations using a dynamic search bar.
- **Real-Time Availability:** See live slot updates without refreshing the page.
- **Secure Booking:** Reserve parking slots with generated tracking IDs (e.g., `SP-4X9K2`).
- **Booking Management:** View past and upcoming reservations, and cancel bookings if plans change.
- **Authentication:** Secure user registration and login system with JWT.

### For Administrators:
- **Admin Dashboard:** A protected route accessible only to authorized administrators.
- **Inventory Management:** Add new parking locations, update pricing, and edit details.
- **Slot Tracking:** Manually update total and available slots.
- **Analytics:** View total areas, slots, and system-wide bookings at a glance.

## 🛠️ Technology Stack
### Frontend
- **React.js (Vite)** - Fast, modern UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **Socket.io-client** - Real-time bidirectional event-based communication
- **Vanilla CSS** - Custom, responsive, modern styling

### Backend
- **Node.js & Express.js** - Scalable backend infrastructure
- **MongoDB (Mongoose)** - NoSQL database for flexible data storage
- **JWT (JSON Web Tokens)** - Secure authentication mechanism
- **Bcrypt.js** - Password hashing
- **Socket.io** - Real-time websocket server

## 🏗️ System Architecture
The application follows a standard Client-Server MERN architecture. The React frontend communicates with the Express backend via RESTful APIs for standard operations (CRUD), and utilizes WebSockets (Socket.io) to push real-time availability changes from the backend to connected clients.

## 📁 Folder Structure
```text
smart-parking/
├── backend/
│   ├── config/         # Database connection logic
│   ├── controllers/    # API endpoint logic (auth, booking, parking)
│   ├── middleware/     # JWT authentication & admin verification
│   ├── models/         # Mongoose schemas (User, Parking, Booking)
│   ├── routes/         # Express route definitions
│   ├── seed/           # Database seeding scripts for demo data
│   ├── server.js       # Main backend entry point
│   └── .env.example    # Example environment variables
└── frontend/
    ├── src/
    │   ├── components/ # Reusable UI components (Navbar, Cards, Loading)
    │   ├── context/    # React Context for global state (AuthContext)
    │   ├── pages/      # Page components (Home, Dashboard, Login, etc.)
    │   ├── services/   # Axios API configurations and Socket.io setup
    │   ├── App.jsx     # Main React application component
    │   └── index.css   # Global styling and design system
    └── index.html      # Main HTML template
```

## 🗄️ Database Design
- **User Collection:** `_id`, `name`, `email`, `password` (hashed), `role` (user/admin).
- **Parking Collection:** `_id`, `name`, `location`, `totalSlots`, `availableSlots`, `pricePerHour`, `openingTime`, `closingTime`, `description`.
- **Booking Collection:** `_id`, `bookingId` (custom), `user` (ref), `parking` (ref), `bookingDate`, `startTime`, `endTime`, `status`.

## 🔌 API Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Authenticate user & get token | Public |
| GET | `/api/auth/me` | Get current user profile | Private |
| GET | `/api/parking` | Get all parking areas (supports `?search=`) | Public |
| POST | `/api/parking` | Create a new parking area | Admin |
| GET | `/api/parking/:id` | Get specific parking details | Public |
| PUT | `/api/parking/:id` | Update parking details | Admin |
| DELETE | `/api/parking/:id` | Remove a parking area | Admin |
| POST | `/api/bookings` | Create a new reservation | Private |
| GET | `/api/bookings/my` | Get current user's bookings | Private |
| PUT | `/api/bookings/:id/cancel` | Cancel a booking | Private |

## 🚀 How to Run

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (Atlas or Local)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd smart-parking
```

### 2. Backend Setup
```bash
cd backend
npm install
```
- Copy the `.env.example` file to `.env` and fill in your secrets.
- Run the seeder to populate demo data: `npm run seed`
- Start the server: `npm run dev`

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Environment Variables
You will need a `.env` file in the `backend/` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
```

## 📸 Screenshots
*(Add screenshots of your application here after pushing to GitHub)*
- Home Page
- Find Parking Search
- Admin Dashboard
- Booking Confirmation

## 🔮 Future Enhancements
- Integration with physical IoT sensors for automated slot detection.
- Payment gateway integration (e.g., Stripe, Razorpay) for paid reservations.
- Interactive map view using Mapbox or Google Maps API.
- Geolocation support to automatically find parking "near me".

## 👥 Team
- **[Your Name]** - Full Stack Developer

---
*Developed as a Full Stack Development Mini Project.*
