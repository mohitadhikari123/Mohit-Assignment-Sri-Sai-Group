import express from 'express';
import { getAllTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateTaskAssignment } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(protect); // All task routes require authentication

router.route('/')
  .get(getAllTasks)
  .post(validateTaskAssignment, createTask);

router.route('/:id')
  .patch(validateTaskAssignment, updateTask)
  .delete(deleteTask);

export default router;