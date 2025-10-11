import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { handleTaskCreated, handleTaskUpdated, handleTaskDeleted } from './redux/slices/tasksSlice';
import { addNotification } from './redux/slices/notificationsSlice';
import { store } from './redux/store';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;
 
class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    const token = localStorage.getItem('accessToken');
    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: {
        token: token,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      const user = store.getState().auth.user;
      if (user) {
        this.socket.emit('setUserId', user._id);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    // Listen for generic notifications
    this.socket.on('notification', (notification) => {
      const currentUser = store.getState().auth.user;
      if (currentUser) {
        store.dispatch(addNotification(notification));
        // Display toast notification
        if (notification.type && notification.message) {
          toast[notification.type](notification.message, {
            autoClose: 3000,
          });
        }
      }
    });

    // Task events
    this.socket.on('taskCreated', (data) => {
      store.dispatch(handleTaskCreated(data.task));
    });

    this.socket.on('taskUpdated', (data) => {
      store.dispatch(handleTaskUpdated(data.task));
    });

    this.socket.on('taskDeleted', (data) => {
      store.dispatch(handleTaskDeleted(data.taskId));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
export default socketService;