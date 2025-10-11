import Task from '../models/Task.js';
import { emitNotificationToUser } from '../socket.js';

export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignee', 'username email role')
      .populate('assignedBy', 'username email role')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, assignee } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      dueDate,
      assignee,
      assignedBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'username email role')
      .populate('assignedBy', 'username email role');

    // Always send a success toast to the task creator
    emitNotificationToUser(req.user._id.toString(), {
      type: 'success',
      message: 'Task created successfully',
      taskId: populatedTask._id,
    });

    // Emit notification to assignee
    if (populatedTask.assignee && populatedTask.assignee._id.toString() !== req.user._id.toString()) {
      emitNotificationToUser(populatedTask.assignee._id.toString(), {
        type: 'success',
        message: `New task assigned: ${populatedTask.title}`,
        taskId: populatedTask._id,
      });
    }

    // Emit taskCreated event to all connected clients
    req.io.emit('taskCreated', { task: populatedTask });

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, assignee } = req.body;
    const taskId = req.params.id;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldAssignee = task.assignee ? task.assignee.toString() : null;

    // Update task fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if ('dueDate' in req.body) task.dueDate = dueDate; // Allow setting to null/undefined
    if (assignee) task.assignee = assignee;

    await task.save();

    const updatedTask = await Task.findById(taskId)
      .populate('assignee', 'username email role')
      .populate('assignedBy', 'username email role');

    // Emit notification to new assignee if changed
    if (updatedTask.assignee && updatedTask.assignee._id.toString() !== oldAssignee) {
      emitNotificationToUser(updatedTask.assignee._id.toString(), {
        type: 'info',
        message: `Task reassigned to you: ${updatedTask.title}`,
        taskId: updatedTask._id,
      });
    }

    // Emit notification to old assignee if changed
    if (oldAssignee && (!updatedTask.assignee || updatedTask.assignee._id.toString() !== oldAssignee)) {
      emitNotificationToUser(oldAssignee, {
        type: 'info',
        message: `Task ${updatedTask.title} was unassigned from you.`,
        taskId: updatedTask._id,
      });
    }

    // Emit notification to current assignee for status/due date changes
    if (updatedTask.assignee && (status || dueDate)) {
      emitNotificationToUser(updatedTask.assignee._id.toString(), {
        type: 'info',
        message: `Task updated: ${updatedTask.title}`,
        taskId: updatedTask._id,
      });
    }

    // Emit taskUpdated event to all connected clients
    req.io.emit('taskUpdated', { task: updatedTask });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating task' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId).populate('assignedBy', 'role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if the user has permission to delete the task
    if (!req.user.canDeleteTask(task.assignedBy.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this task' });
    }

    const assigneeId = task.assignee ? task.assignee.toString() : null;

    await task.deleteOne();

    // Emit notification to assignee
    if (assigneeId) {
      emitNotificationToUser(assigneeId, {
        type: 'warning',
        message: `Task deleted: ${task.title}`,
        taskId: taskId,
      });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting task' });
  }
};