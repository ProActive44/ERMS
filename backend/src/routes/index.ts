import { Router } from 'express';
import authRoutes from './authRoutes';

const router = Router();

// Health check route (already handled in server.ts, but can add here if needed)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ERMS API is running' });
});

// Authentication routes
router.use('/auth', authRoutes);

// API routes will be added here
// Example:
// router.use('/employees', employeeRoutes);
// router.use('/attendance', attendanceRoutes);
// router.use('/leaves', leaveRoutes);
// router.use('/projects', projectRoutes);
// router.use('/tasks', taskRoutes);
// router.use('/dashboard', dashboardRoutes);

export default router;

