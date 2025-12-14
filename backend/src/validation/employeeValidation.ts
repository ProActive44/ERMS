import { z } from 'zod';

// Address schema
const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
});

// Emergency contact schema
const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Emergency contact name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
});

// Document schema
const documentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  url: z.string().url('Valid URL is required'),
  uploadedAt: z.string().datetime().optional(),
});

// Create employee validation schema
export const createEmployeeSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Valid date of birth is required',
    }),
    gender: z.enum(['Male', 'Female', 'Other'], {
      errorMap: () => ({ message: 'Gender must be Male, Female, or Other' }),
    }),
    address: addressSchema,
    department: z.string().min(1, 'Department is required'),
    designation: z.string().min(1, 'Designation is required'),
    joiningDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Valid joining date is required',
    }),
    employmentType: z.enum(['Full-Time', 'Part-Time', 'Contract', 'Intern'], {
      errorMap: () => ({
        message: 'Employment type must be Full-Time, Part-Time, Contract, or Intern',
      }),
    }),
    salary: z.number().min(0, 'Salary must be a positive number'),
    managerId: z.string().optional(),
    status: z.enum(['Active', 'Inactive', 'On Leave', 'Terminated']).optional(),
    emergencyContact: emergencyContactSchema,
    documents: z.array(documentSchema).optional(),
  }),
});

// Update employee validation schema (all fields optional except what should be required)
export const updateEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(10).optional(),
    dateOfBirth: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)))
      .optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    address: addressSchema.optional(),
    department: z.string().min(1).optional(),
    designation: z.string().min(1).optional(),
    joiningDate: z
      .string()
      .refine((date) => !isNaN(Date.parse(date)))
      .optional(),
    employmentType: z.enum(['Full-Time', 'Part-Time', 'Contract', 'Intern']).optional(),
    salary: z.number().min(0).optional(),
    managerId: z.string().optional(),
    status: z.enum(['Active', 'Inactive', 'On Leave', 'Terminated']).optional(),
    emergencyContact: emergencyContactSchema.optional(),
    documents: z.array(documentSchema).optional(),
  }),
});

// Get employees query validation
export const getEmployeesQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z
    .object({
      page: z.string().regex(/^\d+$/).optional(),
      limit: z.string().regex(/^\d+$/).optional(),
      search: z.string().optional(),
      department: z.string().optional(),
      status: z.enum(['Active', 'Inactive', 'On Leave', 'Terminated']).optional(),
      employmentType: z.enum(['Full-Time', 'Part-Time', 'Contract', 'Intern']).optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    })
    .optional(),
  params: z.object({}).optional(),
});
