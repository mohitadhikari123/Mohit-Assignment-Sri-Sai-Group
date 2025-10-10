import { Server } from 'socket.io';

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