import axios from 'axios';

// Create an Axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Parking API Services
export const parkingService = {
  getAllParkings: (search = '') => api.get('/parking', { params: { search } }),
  getParkingById: (id) => api.get(`/parking/${id}`),
  createParking: (data) => api.post('/parking', data),
  updateParking: (id, data) => api.put(`/parking/${id}`, data),
  deleteParking: (id) => api.delete(`/parking/${id}`)
};

// Auth API Services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Booking API Services
export const bookingService = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my'),
  getAllBookings: () => api.get('/bookings'),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
};

export default api;
