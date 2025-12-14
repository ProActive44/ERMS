import { z } from 'zod';

// Check-in validation
export const checkInSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'Employee ID is required').optional(),
    checkIn: z.string().datetime().optional(),
    remarks: z.string().max(500, 'Remarks must not exceed 500 characters').optional(),
    location: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        address: z.string().optional(),
      })
      .optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

// Check-out validation
export const checkOutSchema = z.object({
  body: z.object({
    checkOut: z.string().datetime().optional(),
    remarks: z.string().max(500, 'Remarks must not exceed 500 characters').optional(),
    location: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        address: z.string().optional(),
      })
      .optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, 'Attendance ID is required'),
  }),
});

// Manual attendance creation (for HR/Admin)
export const createAttendanceSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    date: z.string().datetime('Invalid date format'),
    checkIn: z.string().datetime('Invalid check-in time'),
    checkOut: z.string().datetime('Invalid check-out time').optional(),
    status: z.enum(['Present', 'Absent', 'Half Day', 'Late', 'On Leave']),
    remarks: z.string().max(500, 'Remarks must not exceed 500 characters').optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

// Update attendance validation
export const updateAttendanceSchema = z.object({
  body: z.object({
    checkIn: z.string().datetime('Invalid check-in time').optional(),
    checkOut: z.string().datetime('Invalid check-out time').optional(),
    status: z.enum(['Present', 'Absent', 'Half Day', 'Late', 'On Leave']).optional(),
    remarks: z.string().max(500, 'Remarks must not exceed 500 characters').optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, 'Attendance ID is required'),
  }),
});

// Query validation for getting attendance records
export const getAttendanceQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    employeeId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(['Present', 'Absent', 'Half Day', 'Late', 'On Leave']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
  params: z.object({}).optional(),
});

// Export types
export type CheckInInput = z.infer<typeof checkInSchema>['body'];
export type CheckOutInput = z.infer<typeof checkOutSchema>['body'];
export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>['body'];
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>['body'];
export type GetAttendanceQuery = z.infer<typeof getAttendanceQuerySchema>['query'];
