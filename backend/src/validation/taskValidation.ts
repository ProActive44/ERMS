import { z } from 'zod';

// Create Task
export const createTaskSchema = z.object({
  body: z.object({
    projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
    title: z.string().min(3, 'Task title must be at least 3 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
    status: z.enum(['To Do', 'In Progress', 'In Review', 'Completed', 'Blocked']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
    assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID').optional(),
    dueDate: z.string().datetime().optional(),
    estimatedHours: z.number().min(0).optional(),
    tags: z.array(z.string().max(50)).optional(),
    dependencies: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID')).optional(),
  }),
});

// Update Task
export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID'),
  }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(2000).optional(),
    status: z.enum(['To Do', 'In Progress', 'In Review', 'Completed', 'Blocked']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    dueDate: z.string().datetime().optional(),
    estimatedHours: z.number().min(0).optional(),
    actualHours: z.number().min(0).optional(),
    tags: z.array(z.string().max(50)).optional(),
    dependencies: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  }),
});

// Get All Tasks (with filters)
export const getAllTasksSchema = z.object({
  query: z.object({
    projectId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    status: z.enum(['To Do', 'In Progress', 'In Review', 'Completed', 'Blocked']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.enum(['title', 'dueDate', 'priority', 'status', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    overdue: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  }),
});

// Get Task by ID
export const getTaskByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID'),
  }),
});

// Delete Task
export const deleteTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID'),
  }),
});

// Update Task Status
export const updateTaskStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID'),
  }),
  body: z.object({
    status: z.enum(['To Do', 'In Progress', 'In Review', 'Completed', 'Blocked']),
  }),
});

// Assign Task
export const assignTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID'),
  }),
  body: z.object({
    assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid employee ID'),
  }),
});

// Update Task Hours
export const updateTaskHoursSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID'),
  }),
  body: z.object({
    actualHours: z.number().min(0),
  }),
});

// Get Tasks by Project
export const getTasksByProjectSchema = z.object({
  params: z.object({
    projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid project ID'),
  }),
  query: z.object({
    status: z.enum(['To Do', 'In Progress', 'In Review', 'Completed', 'Blocked']).optional(),
    assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type GetAllTasksInput = z.infer<typeof getAllTasksSchema>;
export type GetTaskByIdInput = z.infer<typeof getTaskByIdSchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
export type UpdateTaskHoursInput = z.infer<typeof updateTaskHoursSchema>;
export type GetTasksByProjectInput = z.infer<typeof getTasksByProjectSchema>;
