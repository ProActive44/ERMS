import { z } from 'zod';

// Apply for leave validation
export const applyLeaveSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'Employee ID is required').optional(),
    leaveType: z.enum(['Sick Leave', 'Casual Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave']),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
    reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000, 'Reason must not exceed 1000 characters'),
  }).refine((data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  }, {
    message: 'End date must be greater than or equal to start date',
    path: ['endDate'],
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

// Update leave status validation
export const updateLeaveStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Approved', 'Rejected', 'Cancelled']),
    rejectionReason: z.string().max(500, 'Rejection reason must not exceed 500 characters').optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, 'Leave ID is required'),
  }),
});

// Update leave validation
export const updateLeaveSchema = z.object({
  body: z.object({
    leaveType: z.enum(['Sick Leave', 'Casual Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave']).optional(),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date').optional(),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date').optional(),
    reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000, 'Reason must not exceed 1000 characters').optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, 'Leave ID is required'),
  }),
});

// Get leaves query validation
export const getLeavesQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    employeeId: z.string().optional(),
    status: z.enum(['Pending', 'Approved', 'Rejected', 'Cancelled']).optional(),
    leaveType: z.enum(['Sick Leave', 'Casual Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }).optional(),
  params: z.object({}).optional(),
});
