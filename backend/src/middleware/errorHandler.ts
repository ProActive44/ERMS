import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
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
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  const response: ApiResponse = {
    status: 500,
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  };

  res.status(500).json(response);
};

