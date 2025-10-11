import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import NotificationBell from '../components/NotificationBell'; 
import socketService from '../socket';
import {
  fetchTasks,
  setStatusFilter,
  setSortBy,
  selectFilteredTasks,
  setAssignedToMeFilter,
} from '../redux/slices/tasksSlice';
import axiosInstance from '../api/axiosInstance';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const tasks = useSelector(selectFilteredTasks);
  const { status: statusFilter, sortBy, assignedToMeFilter } = useSelector(state => state.tasks.filters);
  const { user } = useSelector(state => state.auth);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    dispatch(fetchTasks());
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();



    socketService.connect();

   
    return () => {
      socketService.socket.off('notification');
      socketService.disconnect();
    };
  }, [dispatch]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setModalOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  const handleStatusFilterChange = (event) => {
    dispatch(setStatusFilter(event.target.value));
  };

  const handleSortChange = (event) => {
    const value = event.target.value;
    if (value === 'assignedToMe') {
      dispatch(setAssignedToMeFilter(true));
      dispatch(setSortBy('')); 
    } else {
      dispatch(setAssignedToMeFilter(false));
      dispatch(setSortBy(value));
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Task Dashboard</h1>
        <div className="dashboard-controls">
          <button className="create-button" onClick={handleCreateTask}>
            <span className="create-button-icon">+</span>
            Create Task
          </button>
          <div className="form-control">
            <label className="form-label">Status</label>
            <select 
              className="form-select"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="all">All</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="form-control">
            <label className="form-label">Filter/Sort By</label>
            <select
              className="form-select"
              value={assignedToMeFilter ? 'assignedToMe' : sortBy}
              onChange={handleSortChange}
            >
              <option value="dueDate">Due Date</option>
              <option value="assignedToMe">Assigned to Me</option>
            </select>
          </div>
        <NotificationBell /> 
        </div>
      </div>

      <div className="tasks-grid">
        {tasks.map(task => (
          <TaskItem
            key={task._id}
            task={task}
            onEdit={handleEditTask}
          />
        ))}
      </div>

      {modalOpen && (
        <TaskModal
          open={modalOpen}
          onClose={handleCloseModal}
          task={selectedTask}
          users={users}
          currentUserId={user._id}
        />
      )}
    </div>
  );
};

export default Dashboard;