import { Request, Response } from 'express';
import { User } from '../models/User';
import { Employee } from '../models/Employee';
import { generateTokens } from '../utils/jwt';
import { ApiResponse } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password, firstName, lastName, role, employeeId } = req.body;

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

    // If employeeId is provided, validate and link
    let employee = null;
    if (employeeId) {
      employee = await Employee.findById(employeeId);
      
      if (!employee) {
        const response: ApiResponse = {
          status: 400,
          success: false,
          message: 'Employee not found',
        };
        res.status(400).json(response);
        return;
      }

      // Check if employee already has a user account
      if (employee.user) {
        const response: ApiResponse = {
          status: 400,
          success: false,
          message: 'Employee already has a user account',
        };
        res.status(400).json(response);
        return;
      }
    }

    // Create new user
    const user = new User({
      email,
      username,
      password,
      firstName,
      lastName,
      role: role || 'employee',
      employee: employeeId || null, // Optional link
    });

    await user.save();

    // If employee was linked, update employee with user reference
    if (employee && employeeId) {
      employee.user = user._id;
      await employee.save();
    }

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
          employee: user.employee || null,
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
 * Get current user profile
 */
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId)
      .select('-password')
      .populate({
        path: 'employee',
        select: 'employeeId designation department address documents',
        populate: {
          path: 'department',
          select: 'name description',
        },
      });

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
  } catch (error: any) {
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: error.message || 'Error retrieving profile',
    };
    res.status(500).json(response);
  }
};

