import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createTask, updateTask, fetchTasks } from '../redux/slices/tasksSlice';
import '../styles/TaskModal.css';

const TaskModal = ({ open, onClose, task = null, users, currentUserId }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    dueDate: '',
    assignee: currentUserId || '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assignee: task.assignee._id,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        dueDate: '',
        assignee: currentUserId || '',
      });
    }
  }, [task, currentUserId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (task) {
      await dispatch(updateTask({
        taskId: task._id,
        taskData: formData,
      }));
      dispatch(fetchTasks()); 
      onClose();
    } else {
      await dispatch(createTask(formData));
      dispatch(fetchTasks()); 
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="form-textarea"
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="assignee">Assignee</label>
              <select
                id="assignee"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Select an assignee</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.username} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="button cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button submit-button">
              {task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;