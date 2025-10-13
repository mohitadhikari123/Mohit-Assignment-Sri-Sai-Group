import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { deleteTask } from '../redux/slices/tasksSlice';
import '../styles/TaskItem.css';
import TaskModal from './TaskModal';

const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

const TaskItem = ({ task, onEdit }) => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);

  const truncateDescription = (description, wordLimit) => {
    if (!description) return '';
    const words = description.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return description;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'todo':
        return 'status-todo';
      case 'in-progress':
        return 'status-in-progress';
      case 'done':
        return 'status-done';
      default:
        return 'status-default';
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation(); 
    dispatch(deleteTask(task._id));
  };

  const handleCardClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="task-card" onClick={handleCardClick}>
      <div className="task-content">
        <h3 className="task-title">{capitalizeWords(task.title)}</h3>
        <p className="task-description">{capitalizeWords(truncateDescription(task.description, 10))}</p>
        <div className="task-meta">
          <span className={`task-status ${getStatusClass(task.status)}`}>
            {task.status}
          </span>
          {task.dueDate && (
            <span className="task-due-date">
              Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </span>
          )}
        </div>
        {task.assignee && (
          <p className="task-assignee">
            Assigned to: {capitalizeWords(task.assignee.username)}
          </p>
        )}


        <div className="task-actions">
          <button 
            className="task-button edit-button"
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
          >
            Edit
          </button>
          <button 
            className="task-button delete-button"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>

      {showModal && (
        <TaskModal 
          show={showModal}
          onClose={handleCloseModal}
          task={task}
          isViewMode={true}
        />
      )}
    </div>
  );
};

export default TaskItem;