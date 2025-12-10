import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../types';

/**
 * Validation middleware factory for Zod schemas
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate and parse request body
      const validatedData = schema.parse(req.body);
      
      // Replace req.body with validated and sanitized value
      req.body = validatedData;
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        
        const response: ApiResponse = {
          status: 400,
          success: false,
          message: 'Validation error',
          error: errors,
        };
        res.status(400).json(response);
        return;
      }
      
      // Handle unexpected errors
      const response: ApiResponse = {
        status: 500,
        success: false,
        message: 'Internal server error during validation',
      };
      res.status(500).json(response);
    }
  };
};
