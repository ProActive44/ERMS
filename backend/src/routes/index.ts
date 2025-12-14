import { Router } from 'express';
import authRoutes from './authRoutes';
import employeeRoutes from './employeeRoutes';
import attendanceRoutes from './attendanceRoutes';
import leaveRoutes from './leaveRoutes';
import projectRoutes from './projectRoutes';
import taskRoutes from './taskRoutes';

const router = Router();

// Health check route (already handled in server.ts, but can add here if needed)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ERMS API is running' });
});

// Authentication routes
router.use('/auth', authRoutes);

// Employee routes
router.use('/employees', employeeRoutes);

// Attendance routes
router.use('/attendance', attendanceRoutes);

// Leave routes
router.use('/leaves', leaveRoutes);

// Project routes
router.use('/projects', projectRoutes);

// Task routes
router.use('/tasks', taskRoutes);

export default router;

