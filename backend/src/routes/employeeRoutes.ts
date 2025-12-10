import { Router } from 'express';
import {
  createEmployee,
  getEmployeeList,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from '../validation/employeeValidation';

const router = Router();

// All employee routes require authentication
router.use(authenticateToken);

// Get employee list (with pagination and filters)
router.get('/', getEmployeeList);

// Get employee by ID
router.get('/:id', getEmployeeById);

// Create employee (Admin and HR only)
router.post(
  '/',
  requireRole('admin', 'hr'),
  validate(createEmployeeSchema),
  createEmployee
);

// Update employee (Admin and HR only)
router.put(
  '/:id',
  requireRole('admin', 'hr'),
  validate(updateEmployeeSchema),
  updateEmployee
);

// Delete employee (Admin and HR only)
router.delete('/:id', requireRole('admin', 'hr'), deleteEmployee);

export default router;

