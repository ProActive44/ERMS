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
    const { hashToken } = require('../utils/jwt');
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // Store hashed refresh token in database
    const hashedRefreshToken = hashToken(tokens.refreshToken);
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(hashedRefreshToken);
    
    // Keep only last 5 refresh tokens (limit active sessions)
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    await user.save();

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
        accessToken: tokens.accessToken,
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
    const { hashToken } = require('../utils/jwt');
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // Store hashed refresh token in database
    const hashedRefreshToken = hashToken(tokens.refreshToken);
    const userWithTokens = await User.findById(user._id).select('+refreshTokens');
    if (userWithTokens) {
      userWithTokens.refreshTokens = userWithTokens.refreshTokens || [];
      userWithTokens.refreshTokens.push(hashedRefreshToken);
      
      // Keep only last 5 refresh tokens (limit active sessions)
      if (userWithTokens.refreshTokens.length > 5) {
        userWithTokens.refreshTokens = userWithTokens.refreshTokens.slice(-5);
      }
      await userWithTokens.save();
    }

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
        accessToken: tokens.accessToken,
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
    // Get refresh token from httpOnly cookie
    const refreshToken = req.cookies.refreshToken;

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
    const { verifyRefreshToken, generateTokens, hashToken } = require('../utils/jwt');
    const decoded = verifyRefreshToken(refreshToken);

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId).select('+refreshTokens');

    if (!user || !user.isActive) {
      res.clearCookie('refreshToken');
      const response: ApiResponse = {
        status: 401,
        success: false,
        message: 'Invalid refresh token',
      };
      res.status(401).json(response);
      return;
    }

    // Verify refresh token exists in database (not revoked)
    const hashedToken = hashToken(refreshToken);
    const tokenExists = user.refreshTokens?.includes(hashedToken);

    if (!tokenExists) {
      // Token reuse detected! Possible attack - revoke all tokens
      user.refreshTokens = [];
      await user.save();
      res.clearCookie('refreshToken');
      
      const response: ApiResponse = {
        status: 401,
        success: false,
        message: 'Token reuse detected. All sessions revoked.',
      };
      res.status(401).json(response);
      return;
    }

    // Remove old refresh token
    user.refreshTokens = user.refreshTokens.filter((t: string) => t !== hashedToken);

    // Generate new tokens (token rotation)
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // Store new hashed refresh token
    const newHashedToken = hashToken(tokens.refreshToken);
    user.refreshTokens.push(newHashedToken);
    
    // Keep only last 5 refresh tokens
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    
    await user.save();

    // Set new refresh token in httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: tokens.accessToken,
      },
    };

    res.status(200).json(response);
  } catch (error: unknown) {
    const axiosError = error as { message?: string };
    res.clearCookie('refreshToken');
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

/**
 * Logout user and revoke refresh token
 */
export const logout = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken && req.user?.userId) {
      // Remove refresh token from database
      const { hashToken } = require('../utils/jwt');
      const hashedToken = hashToken(refreshToken);
      
      const user = await User.findById(req.user.userId).select('+refreshTokens');
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((t: string) => t !== hashedToken);
        await user.save();
      }
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Logged out successfully',
    };

    res.status(200).json(response);
  } catch (error: unknown) {
    const axiosError = error as { message?: string };
    res.clearCookie('refreshToken');
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: axiosError.message || 'Error logging out',
    };
    res.status(500).json(response);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      const response: ApiResponse = {
        status: 401,
        success: false,
        message: 'Unauthorized',
      };
      res.status(401).json(response);
      return;
    }

    const { firstName, lastName, email, username } = req.body;

    // Check if email or username is being changed to an existing one
    if (email || username) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        $or: [
          ...(email ? [{ email }] : []),
          ...(username ? [{ username }] : []),
        ],
      });

      if (existingUser) {
        const response: ApiResponse = {
          status: 400,
          success: false,
          message:
            existingUser.email === email
              ? 'Email already in use'
              : 'Username already taken',
        };
        res.status(400).json(response);
        return;
      }
    }

    // Update user
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

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
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: error.message || 'Error updating profile',
    };
    res.status(500).json(response);
  }
};

