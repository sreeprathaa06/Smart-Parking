import { io } from 'socket.io-client';

// Connect to the backend server
const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

export default socket;
