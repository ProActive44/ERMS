import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models/User';
import { ApiResponse } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
    role: string;
  };
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      const response: ApiResponse = {
        status: 401,
        success: false,
        message: 'Access token is required',
      };
      res.status(401).json(response);
      return;
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId).select(
      '_id email username role isActive'
    );

    if (!user || !user.isActive) {
      const response: ApiResponse = {
        status: 401,
        success: false,
        message: 'Invalid or expired token',
      };
      res.status(401).json(response);
      return;
    }

    // Attach user to request
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error: any) {
    const response: ApiResponse = {
      status: 401,
      success: false,
      message: error.message || 'Invalid or expired token',
    };
    res.status(401).json(response);
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (...roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      const response: ApiResponse = {
        status: 401,
        success: false,
        message: 'Authentication required',
      };
      res.status(401).json(response);
      return;
    }

    if (!roles.includes(req.user.role)) {
      const response: ApiResponse = {
        status: 403,
        success: false,
        message: 'Insufficient permissions',
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};

