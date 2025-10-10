import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tasksReducer from './slices/tasksSlice';
import notificationsReducer from './slices/notificationsSlice';

const loadState = () => {
  try {
    const serializedNotifications = localStorage.getItem('notifications');
    const serializedTasks = localStorage.getItem('tasks');
    return {
      notifications: serializedNotifications === null ? undefined : JSON.parse(serializedNotifications),
      tasks: serializedTasks === null ? undefined : JSON.parse(serializedTasks),
    };
  } catch (err) {
    console.error("Error loading state from localStorage:", err);
    return undefined;
  }
};

const saveState = (state) => {
  try {
    localStorage.setItem('notifications', JSON.stringify(state.notifications));
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
  } catch (err) {
    console.error("Error saving state to localStorage:", err);
  }
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    notifications: notificationsReducer,
  },
  preloadedState: {
    notifications: loadState()?.notifications || { notifications: [] },
    tasks: loadState()?.tasks || { tasks: [], loading: false, error: null, filters: { status: 'all', sortBy: 'dueDate', assignedToMe: false } },
  },
});

store.subscribe(() => {
  saveState({
    notifications: store.getState().notifications,
    tasks: store.getState().tasks,
  });
});