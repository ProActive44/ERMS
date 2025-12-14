import express from 'express';
import {
  applyLeave,
  getAllLeaves,
  getLeaveById,
  updateLeaveStatus,
  updateLeave,
  deleteLeave,
  getLeaveStats,
  getLeaveBalance,
} from '../controllers/leaveController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  applyLeaveSchema,
  updateLeaveStatusSchema,
  updateLeaveSchema,
  getLeavesQuerySchema,
} from '../validation/leaveValidation';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get leave statistics - Admin/HR only
router.get('/stats', requireRole('admin', 'hr'), getLeaveStats);

// Get leave balance for an employee (or current user)
router.get('/balance/:employeeId?', getLeaveBalance);

// Get all leaves with filters
router.get('/', validate(getLeavesQuerySchema), getAllLeaves);

// Get leave by ID
router.get('/:id', getLeaveById);

// Apply for leave (all authenticated users)
router.post('/', validate(applyLeaveSchema), applyLeave);

// Update leave status (Approve/Reject) - Admin/HR only
router.put('/:id/status', requireRole('admin', 'hr'), validate(updateLeaveStatusSchema), updateLeaveStatus);

// Update leave details - Admin/HR or employee (for pending leaves)
router.put('/:id', validate(updateLeaveSchema), updateLeave);

// Delete leave - Admin only
router.delete('/:id', requireRole('admin'), deleteLeave);

export default router;
