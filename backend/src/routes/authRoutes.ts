import { Router } from 'express';
import { register, login, getProfile, updateProfile, getUserList } from '../controllers/authController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, updateUserSchema } from '../validation/authValidation';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected routes
router.get('/users', authenticateToken, requireRole('admin', 'hr'), getUserList);
router.get('/profile/:user_id', authenticateToken, getProfile); // Get specific user profile (must come before /profile)
router.get('/profile', authenticateToken, getProfile); // Get own profile
router.put('/profile/edit/:user_id', authenticateToken, validate(updateUserSchema), updateProfile);

export default router;

