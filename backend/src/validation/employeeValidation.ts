import { z } from 'zod';

export const createEmployeeSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').trim(),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must not exceed 50 characters')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters')
    .trim(),
  email: z.string().email('Please provide a valid email address').toLowerCase(),
  mobileNumber: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number must not exceed 15 digits')
    .trim(),
  designation: z.string().min(1, 'Designation is required').trim(),
  department: z.string().min(1, 'Department is required'),
  address: z.string().max(500, 'Address must not exceed 500 characters').trim().optional(),
  documents: z
    .array(
      z.object({
        type: z.enum(['id_proof', 'offer_letter', 'resume', 'other']),
        url: z.string().url('Invalid document URL'),
        uploadedAt: z.date().optional(),
      })
    )
    .optional(),
  isActive: z.boolean().default(true).optional(),
  userId: z.string().optional(), // Optional - employee can exist without user
});

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  employeeId: z.string().min(1, 'Employee ID is required').trim().optional(),
  email: z.string().email('Please provide a valid email address').toLowerCase().optional(),
  mobileNumber: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number must not exceed 15 digits')
    .trim()
    .optional(),
  userId: z.string().nullable().optional(), // Optional - can link/unlink user
});

// Export types for TypeScript
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

