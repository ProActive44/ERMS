import { Router } from 'express';
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  updateProjectProgress,
  getProjectStats,
} from '../controllers/projectController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  getAllProjectsSchema,
  getProjectByIdSchema,
  deleteProjectSchema,
  addTeamMemberSchema,
  removeTeamMemberSchema,
  updateProjectProgressSchema,
} from '../validation/projectValidation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create project - Admin/HR only
router.post(
  '/',
  requireRole('admin', 'hr'),
  validate(createProjectSchema),
  createProject
);

// Get all projects - All authenticated users
router.get('/', validate(getAllProjectsSchema), getAllProjects);

// Get project statistics - Admin/HR only
router.get('/stats', requireRole('admin', 'hr'), getProjectStats);

// Get project by ID - All authenticated users
router.get('/:id', validate(getProjectByIdSchema), getProjectById);

// Update project - Admin/HR only
router.put(
  '/:id',
  requireRole('admin', 'hr'),
  validate(updateProjectSchema),
  updateProject
);

// Delete project - Admin only
router.delete(
  '/:id',
  requireRole('admin'),
  validate(deleteProjectSchema),
  deleteProject
);

// Add team member - Admin/HR only
router.post(
  '/:id/team-members',
  requireRole('admin', 'hr'),
  validate(addTeamMemberSchema),
  addTeamMember
);

// Remove team member - Admin/HR only
router.delete(
  '/:id/team-members',
  requireRole('admin', 'hr'),
  validate(removeTeamMemberSchema),
  removeTeamMember
);

// Update project progress - Admin/HR/Project Manager
router.patch(
  '/:id/progress',
  requireRole('admin', 'hr'),
  validate(updateProjectProgressSchema),
  updateProjectProgress
);

export default router;
