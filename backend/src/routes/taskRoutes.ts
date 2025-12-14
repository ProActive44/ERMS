import { Router } from 'express';
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  assignTask,
  updateTaskHours,
  getTasksByProject,
  getTaskStats,
} from '../controllers/taskController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  getAllTasksSchema,
  getTaskByIdSchema,
  deleteTaskSchema,
  updateTaskStatusSchema,
  assignTaskSchema,
  updateTaskHoursSchema,
  getTasksByProjectSchema,
} from '../validation/taskValidation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create task - Admin/HR only
router.post(
  '/',
  requireRole('admin', 'hr'),
  validate(createTaskSchema),
  createTask
);

// Get all tasks - All authenticated users
router.get('/', validate(getAllTasksSchema), getAllTasks);

// Get task statistics - Admin/HR only
router.get('/stats', requireRole('admin', 'hr'), getTaskStats);

// Get tasks by project - All authenticated users
router.get(
  '/project/:projectId',
  validate(getTasksByProjectSchema),
  getTasksByProject
);

// Get task by ID - All authenticated users
router.get('/:id', validate(getTaskByIdSchema), getTaskById);

// Update task - Admin/HR only
router.put(
  '/:id',
  requireRole('admin', 'hr'),
  validate(updateTaskSchema),
  updateTask
);

// Delete task - Admin only
router.delete(
  '/:id',
  requireRole('admin'),
  validate(deleteTaskSchema),
  deleteTask
);

// Update task status - All authenticated users (can update their own tasks)
router.patch(
  '/:id/status',
  validate(updateTaskStatusSchema),
  updateTaskStatus
);

// Assign task - Admin/HR only
router.patch(
  '/:id/assign',
  requireRole('admin', 'hr'),
  validate(assignTaskSchema),
  assignTask
);

// Update task hours - All authenticated users (can update their own tasks)
router.patch(
  '/:id/hours',
  validate(updateTaskHoursSchema),
  updateTaskHours
);

export default router;
