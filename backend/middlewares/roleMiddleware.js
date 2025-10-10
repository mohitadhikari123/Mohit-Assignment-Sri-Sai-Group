import User from '../models/User.js';

export const validateTaskAssignment = async (req, res, next) => {
  try {
    const assigneeId = req.body.assignee;

    if (!assigneeId) {
      return res.status(400).json({ message: 'Assignee ID is required' });
    }

    const assignee = await User.findById(assigneeId);

    if (!assignee) {
      return res.status(404).json({ message: 'Assignee not found' });
    }

    if (!req.user.canAssignTasksTo(assignee.role) && req.user._id.toString() !== assigneeId.toString()) {
      return res.status(403).json({
        message: 'You can only assign tasks to users with lower roles or yourself'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: `Server error in role validation: ${error.message}` });
  }
};