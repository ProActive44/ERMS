import { Request, Response } from 'express';
import { User } from '../models/User';
import { Employee } from '../models/Employee';
import { generateTokens } from '../utils/jwt';
import { ApiResponse, Pagination } from '../types';
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
 * Get user profile by ID (or own profile if user_id not provided)
 */
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const authenticatedUserId = req.user?.userId;
    const authenticatedUserRole = req.user?.role;

    if (!authenticatedUserId) {
      const response: ApiResponse = {
        status: 401,
        success: false,
        message: 'Authentication required',
      };
      res.status(401).json(response);
      return;
    }

    // If user_id is not provided, use the authenticated user's ID
    const targetUserId = user_id || authenticatedUserId;

    // Users can only view their own profile unless they're admin or hr
    if (targetUserId !== authenticatedUserId && authenticatedUserRole !== 'admin' && authenticatedUserRole !== 'hr') {
      const response: ApiResponse = {
        status: 403,
        success: false,
        message: 'Insufficient permissions to view this profile',
      };
      res.status(403).json(response);
      return;
    }

    const user = await User.findById(targetUserId)
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

/**
 * Update user profile by ID
 */
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const { email, username, password, firstName, lastName, role, employeeId } = req.body;
    const authenticatedUserId = req.user?.userId;
    const authenticatedUserRole = req.user?.role;

    if (!authenticatedUserId) {
      const response: ApiResponse = {
        status: 401,
        success: false,
        message: 'Authentication required',
      };
      res.status(401).json(response);
      return;
    }

    // Users can only update their own profile unless they're admin or hr
    // Only admin can update roles
    if (user_id !== authenticatedUserId && authenticatedUserRole !== 'admin' && authenticatedUserRole !== 'hr') {
      const response: ApiResponse = {
        status: 403,
        success: false,
        message: 'Insufficient permissions to update this profile',
      };
      res.status(403).json(response);
      return;
    }

    // Only admin can update roles
    if (role !== undefined && authenticatedUserRole !== 'admin') {
      const response: ApiResponse = {
        status: 403,
        success: false,
        message: 'Only admin can update user roles',
      };
      res.status(403).json(response);
      return;
    }

    const userId = user_id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      const response: ApiResponse = {
        status: 404,
        success: false,
        message: 'User not found',
      };
      res.status(404).json(response);
      return;
    }

    // Check for duplicate email if email is being updated
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        const response: ApiResponse = {
          status: 400,
          success: false,
          message: 'Email already registered',
        };
        res.status(400).json(response);
        return;
      }
    }

    // Check for duplicate username if username is being updated
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        const response: ApiResponse = {
          status: 400,
          success: false,
          message: 'Username already taken',
        };
        res.status(400).json(response);
        return;
      }
    }

    // Handle employee linking/unlinking if employeeId is provided
    if (employeeId !== undefined) {
      if (employeeId === null || employeeId === '') {
        // Unlinking employee - remove reference from user and employee
        if (user.employee) {
          const currentEmployee = await Employee.findById(user.employee);
          if (currentEmployee) {
            currentEmployee.user = undefined;
            await currentEmployee.save();
          }
        }
        user.employee = null;
      } else {
        // Linking employee - validate employee exists and isn't already linked
        const employee = await Employee.findById(employeeId);
        if (!employee) {
          const response: ApiResponse = {
            status: 400,
            success: false,
            message: 'Employee not found',
          };
          res.status(400).json(response);
          return;
        }

        // Check if employee is already linked to another user
        if (employee.user && employee.user.toString() !== userId) {
          const response: ApiResponse = {
            status: 400,
            success: false,
            message: 'Employee is already linked to another user',
          };
          res.status(400).json(response);
          return;
        }

        // Unlink previous employee if exists
        if (user.employee && user.employee.toString() !== employeeId) {
          const previousEmployee = await Employee.findById(user.employee);
          if (previousEmployee) {
            previousEmployee.user = undefined;
            await previousEmployee.save();
          }
        }

        // Link new employee
        user.employee = employeeId as any;
        employee.user = user._id;
        await employee.save();
      }
    }

    // Update user fields
    if (email) user.email = email;
    if (username) user.username = username;
    if (password) user.password = password; // Will be hashed by pre-save hook
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role && authenticatedUserRole === 'admin') user.role = role;

    await user.save();

    // Populate employee data for response
    await user.populate({
      path: 'employee',
      select: 'employeeId designation department address documents',
      populate: {
        path: 'department',
        select: 'name description',
      },
    });

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Profile updated successfully',
      data: user,
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

/**
 * Get list of users with pagination and filters
 */
export const getUserList = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
    } = req.query;

    const query: any = {};

    // Search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    // Active status filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get users and total count
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .populate({
          path: 'employee',
          select: 'employeeId designation department address',
          populate: {
            path: 'department',
            select: 'name description',
          },
        })
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    const pagination: Pagination = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    };

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination,
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: error.message || 'Error retrieving users',
    };
    res.status(500).json(response);
  }
};

