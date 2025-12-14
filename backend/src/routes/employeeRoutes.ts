import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
} from '../controllers/employeeController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  getEmployeesQuerySchema,
} from '../validation/employeeValidation';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get employee statistics - Admin/HR only
router.get('/stats', requireRole('admin', 'hr'), getEmployeeStats);

// Get all employees with pagination and filters
router.get('/', validate(getEmployeesQuerySchema), getAllEmployees);

// Get employee by ID
router.get('/:id', getEmployeeById);

// Create new employee - Admin/HR only
router.post(
  '/',
  requireRole('admin', 'hr'),
  validate(createEmployeeSchema),
  createEmployee
);

// Update employee - Admin/HR only
router.put(
  '/:id',
  requireRole('admin', 'hr'),
  validate(updateEmployeeSchema),
  updateEmployee
);

// Delete employee - Admin only
router.delete('/:id', requireRole('admin'), deleteEmployee);

export default router;
