import express from 'express';
import {
  checkIn,
  checkOut,
  getAllAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
  getTodayAttendance,
} from '../controllers/attendanceController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  checkInSchema,
  checkOutSchema,
  createAttendanceSchema,
  updateAttendanceSchema,
  getAttendanceQuerySchema,
} from '../validation/attendanceValidation';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get attendance statistics - Admin/HR only
router.get('/stats', requireRole('admin', 'hr'), getAttendanceStats);

// Get today's attendance for an employee (or current user if no employeeId)
router.get('/today/:employeeId?', getTodayAttendance);

// Get all attendance records with filters
router.get('/', validate(getAttendanceQuerySchema), getAllAttendance);

// Get attendance by ID
router.get('/:id', getAttendanceById);

// Check-in (all authenticated users)
router.post('/check-in', validate(checkInSchema), checkIn);

// Check-out
router.put('/:id/check-out', validate(checkOutSchema), checkOut);

// Create attendance manually - Admin/HR only
router.post(
  '/',
  requireRole('admin', 'hr'),
  validate(createAttendanceSchema),
  createAttendance
);

// Update attendance - Admin/HR only
router.put(
  '/:id',
  requireRole('admin', 'hr'),
  validate(updateAttendanceSchema),
  updateAttendance
);

// Delete attendance - Admin only
router.delete('/:id', requireRole('admin'), deleteAttendance);

export default router;
