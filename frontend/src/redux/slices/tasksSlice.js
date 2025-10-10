import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/tasks');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/tasks/${taskId}`);
      toast.success('Task deleted successfully!');
      return taskId;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        toast.error(error.response.data.message || 'You do not have permission to delete this task.');
      } else {
        toast.error('Failed to delete task.');
      }
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  tasks: [],
  loading: false,
  error: null,
  filters: {
    status: 'all',
    sortBy: 'dueDate',
    assignedToMeFilter: false,
  },
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    setSortBy: (state, action) => {
      state.filters.sortBy = action.payload;
    },
    setAssignedToMeFilter: (state, action) => {
      state.filters.assignedToMeFilter = action.payload;
    },
    // Socket event handlers
    handleTaskCreated: (state, action) => {
      const existingTaskIndex = state.tasks.findIndex(task => task._id === action.payload._id);
      if (existingTaskIndex !== -1) {
        state.tasks[existingTaskIndex] = action.payload;
      } else {
        state.tasks.push(action.payload);
      }
    },
    handleTaskUpdated: (state, action) => {
      const index = state.tasks.findIndex(task => task._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    handleTaskDeleted: (state, action) => {
      state.tasks = state.tasks.filter(task => task._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch tasks';
      })

      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
      });
  },
});

export const {
  setSearchTerm,
  setStatusFilter,
  setSortBy,
  setAssignedToMeFilter,
  handleTaskCreated,
  handleTaskUpdated,
  handleTaskDeleted,
} = tasksSlice.actions;

export const selectFilteredTasks = createSelector(
  [(state) => state.tasks.tasks, (state) => state.tasks.filters, (state) => state.auth],
  (tasks, filters, auth) => {
    const { status: statusFilter, sortBy, assignedToMeFilter } = filters;
    const { user } = auth;
    const currentUserId = user ? user._id : null;

    let filteredTasks = tasks.filter(task => {
      if (statusFilter === 'all') return true;
      return task.status === statusFilter;
    });

    if (assignedToMeFilter && currentUserId) {
      filteredTasks = filteredTasks.filter(task => task.assignee?._id === currentUserId);
    }

    if (sortBy === 'dueDate') {
      filteredTasks.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return dateA - dateB;
      });
    } else if (sortBy === 'assignedTo') {
      filteredTasks.sort((a, b) => {
        const assignedA = a.assignee?.username || '';
        const assignedB = b.assignee?.username || '';
        return assignedA.localeCompare(assignedB);
      });
    }
    return filteredTasks;
  }
);

export default tasksSlice.reducer;