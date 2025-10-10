import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const userRoles = ['intern', 'trainee', 'associate', 'lead', 'manager'];

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: userRoles,
    default: 'manager',
  },
  refreshToken: {
    type: String,
  },
}, {
  timestamps: true,
});

// Add method to check if user can assign tasks to another user
userSchema.methods.canAssignTasksTo = function(otherUserRole) {
  const currentUserRoleIndex = userRoles.indexOf(this.role);
  const otherUserRoleIndex = userRoles.indexOf(otherUserRole);
  return currentUserRoleIndex > otherUserRoleIndex;
};

userSchema.methods.canDeleteTask = function(taskAssignedByRole) {
  const currentUserRoleIndex = userRoles.indexOf(this.role);
  const assignedByRoleIndex = userRoles.indexOf(taskAssignedByRole);
  return currentUserRoleIndex >= assignedByRoleIndex;
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;