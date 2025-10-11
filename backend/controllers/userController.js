import User, { userRoles } from '../models/User.js';

// Get all users (excluding sensitive information)
export const getAllUsers = async (req, res) => {
  try {
    const currentUserRoleIndex = userRoles.indexOf(req.user.role);
    const lowerRoles = userRoles.slice(0, currentUserRoleIndex);

    const users = await User.find({
      $or: [
        { _id: req.user._id }, // Include self
        { role: req.user.role }, // Include same level roles
        { role: { $in: lowerRoles } }, // Include lower roles
      ],
    }).select('_id username email role');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};