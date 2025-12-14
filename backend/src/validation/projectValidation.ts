import { z } from 'zod';

// Create Project
export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Project name must be at least 3 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
    status: z.enum(['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
    projectManagerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project manager ID'),
    teamMembers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID')).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    budget: z.number().min(0).optional(),
    clientName: z.string().max(200).optional(),
    tags: z.array(z.string().max(50)).optional(),
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  ),
});

// Update Project
export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
  body: z.object({
    name: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(2000).optional(),
    status: z.enum(['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    projectManagerId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    teamMembers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    budget: z.number().min(0).optional(),
    clientName: z.string().max(200).optional(),
    tags: z.array(z.string().max(50)).optional(),
    progress: z.number().min(0).max(100).optional(),
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  ),
});

// Get All Projects (with filters)
export const getAllProjectsSchema = z.object({
  query: z.object({
    status: z.enum(['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    projectManagerId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.enum(['name', 'startDate', 'endDate', 'priority', 'progress', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

// Get Project by ID
export const getProjectByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
});

// Delete Project
export const deleteProjectSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
});

// Add Team Member
export const addTeamMemberSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
  body: z.object({
    employeeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID'),
  }),
});

// Remove Team Member
export const removeTeamMemberSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
  body: z.object({
    employeeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID'),
  }),
});

// Update Project Progress
export const updateProjectProgressSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
  body: z.object({
    progress: z.number().min(0).max(100),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type GetAllProjectsInput = z.infer<typeof getAllProjectsSchema>;
export type GetProjectByIdInput = z.infer<typeof getProjectByIdSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;
export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
export type RemoveTeamMemberInput = z.infer<typeof removeTeamMemberSchema>;
export type UpdateProjectProgressInput = z.infer<typeof updateProjectProgressSchema>;
