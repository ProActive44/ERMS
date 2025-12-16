import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const response: ApiResponse = {
    status: 404,
    success: false,
    message: `Route ${req.originalUrl} not found`,
  };
  res.status(404).json(response);
};

/**
 * Global Error Handler
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  let status = 500;
  let message = 'Internal server error';

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    
    if (field === 'email') {
      message = 'This email is already registered';
    } else if (field === 'employeeId') {
      message = 'This employee ID is already in use';
    } else if (err.keyPattern?.employeeId && err.keyPattern?.date) {
      message = 'An attendance record already exists for this employee on this date';
    } else {
      message = 'A record with this information already exists';
    }
  }
  // Handle validation errors
  else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors || {})
      .map((e: any) => e.message)
      .join(', ');
  }
  // Handle cast errors (invalid ObjectId)
  else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  }
  // Development mode - show actual error
  else if (process.env.NODE_ENV !== 'production') {
    message = err.message;
  }

  const response: ApiResponse = {
    status,
    success: false,
    message,
  };

  res.status(status).json(response);
};

