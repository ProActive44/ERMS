import { z } from 'zod';

const registerBodySchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Username must contain only letters and numbers'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters'),
  role: z.enum(['admin', 'hr', 'employee']).default('employee').optional(),
});

const loginBodySchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  body: registerBodySchema,
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const loginSchema = z.object({
  body: loginBodySchema,
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

// Export types for TypeScript
export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
