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

  ioInstance = io; // Assign the created io instance to ioInstance

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('setUserId', (userId) => {
      userSocketMap[userId] = socket.id;
      console.log(`User ${userId} mapped to socket ${socket.id}`);
      console.log('Current userSocketMap:', userSocketMap);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      for (const userId in userSocketMap) {
        if (userSocketMap[userId] === socket.id) {
          delete userSocketMap[userId];
          break;
        }
      }
      console.log('userSocketMap after disconnect:', userSocketMap);
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