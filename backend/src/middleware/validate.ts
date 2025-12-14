import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../types';

/**
 * Validation middleware factory for Zod schemas
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate and parse the entire request object (body, query, params)
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Replace req properties with validated and sanitized values
      if (validatedData.body) req.body = validatedData.body;
      if (validatedData.query) req.query = validatedData.query;
      if (validatedData.params) req.params = validatedData.params;
      
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
