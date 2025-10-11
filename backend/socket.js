import { Server } from 'socket.io';
import { verifyAccessToken } from './utils/generateToken.js';
import User from './models/User.js';

const userSocketMap = {}; // Stores userId -> socketId
export let ioInstance; // To store the io instance

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    if (socket.handshake.auth && socket.handshake.auth.token) {
      try {
        const decoded = verifyAccessToken(socket.handshake.auth.token);
        const user = await User.findById(decoded.userId).select('-password');
        if (user) {
          socket.user = user;
          next();
        } else {
          next(new Error('User not found'));
        }
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    } else {
      next(new Error('Authentication error: Token not provided'));
    }
  });

  ioInstance = io; // Store the io instance

  io.on('connection', (socket) => {

    socket.on('setUserId', (userId) => {
      userSocketMap[userId] = socket.id;
    });

    socket.on('disconnect', () => {
      // Remove user from map on disconnect
      for (const userId in userSocketMap) {
        if (userSocketMap[userId] === socket.id) {
          delete userSocketMap[userId];
          break;
        }
      }
    });
  });

  return io;
};

export const emitNotificationToUser = (userId, notification) => {
  const socketId = userSocketMap[userId];
  if (socketId && ioInstance) {
    ioInstance.to(socketId).emit('notification', notification);
  } else {
    console.log(`User ${userId} not connected or ioInstance not available. Notification not sent. Current userSocketMap:`, userSocketMap);
  }
};