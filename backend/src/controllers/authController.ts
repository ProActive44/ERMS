import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateTokens } from '../utils/jwt';
import { ApiResponse } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const response: ApiResponse = {
        status: 400,
        success: false,
        message:
          existingUser.email === email
            ? 'Email already registered'
            : 'Username already taken',
      };
      res.status(400).json(response);
      return;
    }

    // Create new user
    const user = new User({
      email,
      username,
      password,
      firstName,
      lastName,
      role: role || 'employee',
    });

    await user.save();

    // Generate tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const response: ApiResponse = {
      status: 201,
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        ...tokens,
      },
    };

    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: error.message || 'Error registering user',
    };
    res.status(500).json(response);
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      const response: ApiResponse = {
        status: 401,
        success: false,
        message: 'Invalid email or password',
      };
      res.status(401).json(response);
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      const response: ApiResponse = {
        status: 401,
        success: false,
        message: 'Account is deactivated',
      };
      res.status(401).json(response);
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      const response: ApiResponse = {
        status: 401,
        success: false,
        message: 'Invalid email or password',
      };
      res.status(401).json(response);
      return;
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        ...tokens,
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: error.message || 'Error logging in',
    };
    res.status(500).json(response);
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const response: ApiResponse = {
        status: 401,
        success: false,
        message: 'Refresh token is required',
      };
      res.status(401).json(response);
      return;
    }

    // Verify refresh token
    const { verifyRefreshToken, generateTokens } = require('../utils/jwt');
    const decoded = verifyRefreshToken(refreshToken);

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      const response: ApiResponse = {
        status: 401,
        success: false,
        message: 'Invalid refresh token',
      };
      res.status(401).json(response);
      return;
    }

    // Generate new tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
    };

    res.status(200).json(response);
  } catch (error: unknown) {
    const axiosError = error as { message?: string };
    const response: ApiResponse = {
      status: 401,
      success: false,
      message: axiosError.message || 'Invalid or expired refresh token',
    };
    res.status(401).json(response);
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select(
      '-password'
    );

    if (!user) {
      const response: ApiResponse = {
        status: 404,
        success: false,
        message: 'User not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
    };

    res.status(200).json(response);
  } catch (error: unknown) {
    const axiosError = error as { message?: string };
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: axiosError.message || 'Error retrieving profile',
    };
    res.status(500).json(response);
  }
};

