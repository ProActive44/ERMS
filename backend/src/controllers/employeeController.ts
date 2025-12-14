import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Employee } from '../models/Employee';
import { User } from '../models/User';
import { ApiResponse } from '../types';
import mongoose from 'mongoose';

// Get all employees with pagination, filtering, and search
export const getAllEmployees = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      search = '',
      department = '',
      status = '',
      employmentType = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};

    // Search by name or email or employee ID
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by employment type
    if (employmentType) {
      query.employmentType = employmentType;
    }

    // Get total count for pagination
    const totalCount = await Employee.countDocuments(query);

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Get employees
    const employees = await Employee.find(query)
      .select('-documents') // Exclude documents for list view
      .populate('managerId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Employees retrieved successfully',
      data: {
        employees,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          pages: Math.ceil(totalCount / limitNum),
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get employee by ID
export const getEmployeeById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid employee ID',
      });
      return;
    }

    const employee = await Employee.findById(id)
      .populate('managerId', 'firstName lastName email designation')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .lean();

    if (!employee) {
      res.status(404).json({
        status: 404,
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Employee retrieved successfully',
      data: employee,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Create new employee
export const createEmployee = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employeeData = req.body;

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({
      employeeId: employeeData.employeeId,
    });

    if (existingEmployee) {
      res.status(400).json({
        status: 400,
        success: false,
        message: 'Employee ID already exists',
      });
      return;
    }

    // Check if email already exists
    const existingEmail = await Employee.findOne({ email: employeeData.email });

    if (existingEmail) {
      res.status(400).json({
        status: 400,
        success: false,
        message: 'Email already exists',
      });
      return;
    }

    // Validate manager ID if provided
    if (employeeData.managerId) {
      if (!mongoose.Types.ObjectId.isValid(employeeData.managerId)) {
        res.status(400).json({
          status: 400,
          success: false,
          message: 'Invalid manager ID',
        });
        return;
      }

      const manager = await Employee.findById(employeeData.managerId);
      if (!manager) {
        res.status(400).json({
          status: 400,
          success: false,
          message: 'Manager not found',
        });
        return;
      }
    }

    // Create employee
    const employee = await Employee.create({
      ...employeeData,
      createdBy: req.user?.userId,
    });

    // WORKAROUND: Automatically create User account for employee
    // This will be replaced by the activation flow in v2.0
    // Default password: Employee@123 (should be changed on first login)
    try {
      const defaultPassword = 'Employee@123';
      const username = employeeData.email.split('@')[0]; // Extract username from email
      
      const newUser = await User.create({
        email: employeeData.email,
        username: username,
        password: defaultPassword,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        role: 'employee',
      });

      // Link employee to user
      employee.userId = newUser._id;
      await employee.save();
    } catch (userError: any) {
      // If user creation fails (e.g., email already exists), log but don't fail employee creation
      console.error('Failed to create user account for employee:', userError.message);
    }

    const populatedEmployee = await Employee.findById(employee._id)
      .populate('managerId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('userId', 'email username role')
      .lean();

    const response: ApiResponse = {
      status: 201,
      success: true,
      message: 'Employee created successfully',
      data: populatedEmployee,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Update employee
export const updateEmployee = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        status: 400,
        success: false,
        message: 'Invalid employee ID',
      });
      return;
    }

    const employee = await Employee.findById(id);

    if (!employee) {
      res.status(404).json({
        status: 404,
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    // Check if email is being changed and already exists
    if (updateData.email && updateData.email !== employee.email) {
      const existingEmail = await Employee.findOne({ email: updateData.email });
      if (existingEmail) {
        res.status(400).json({
          status: 400,
          success: false,
          message: 'Email already exists',
        });
        return;
      }
    }

    // Validate manager ID if provided
    if (updateData.managerId) {
      if (!mongoose.Types.ObjectId.isValid(updateData.managerId)) {
        res.status(400).json({
          status: 400,
          success: false,
          message: 'Invalid manager ID',
        });
        return;
      }

      const manager = await Employee.findById(updateData.managerId);
      if (!manager) {
        res.status(400).json({
          status: 400,
          success: false,
          message: 'Manager not found',
        });
        return;
      }
    }

    // Update employee
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedBy: req.user?.userId,
      },
      { new: true, runValidators: true }
    )
      .populate('managerId', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .lean();

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Delete employee (soft delete by setting status to Terminated)
export const deleteEmployee = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        status: 400,
        success: false,
        message: 'Invalid employee ID',
      });
      return;
    }

    const employee = await Employee.findById(id);

    if (!employee) {
      res.status(404).json({
        status: 404,
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    // Soft delete - set status to Terminated
    employee.status = 'Terminated';
    employee.updatedBy = req.user?.userId as any;
    await employee.save();

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Employee deleted successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get employee statistics
export const getEmployeeStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await Employee.aggregate([
      {
        $facet: {
          statusCount: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ],
          departmentCount: [
            {
              $group: {
                _id: '$department',
                count: { $sum: 1 },
              },
            },
          ],
          employmentTypeCount: [
            {
              $group: {
                _id: '$employmentType',
                count: { $sum: 1 },
              },
            },
          ],
          totalCount: [
            {
              $count: 'total',
            },
          ],
        },
      },
    ]);

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Employee statistics retrieved successfully',
      data: stats[0],
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Create or update employee login credentials (WORKAROUND)
// NOTE: This is a temporary solution. Will be replaced by activation flow in v2.0
export const manageEmployeeCredentials = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, password, email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        status: 400,
        success: false,
        message: 'Invalid employee ID',
      });
      return;
    }

    const employee = await Employee.findById(id);

    if (!employee) {
      res.status(404).json({
        status: 404,
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    let user;
    const userEmail = email || employee.email;

    // Check if employee already has a user account
    if (employee.userId) {
      // Update existing user
      user = await User.findById(employee.userId);
      
      if (!user) {
        res.status(404).json({
          status: 404,
          success: false,
          message: 'User account not found',
        });
        return;
      }

      if (username) user.username = username;
      if (email) user.email = email;
      if (password) user.password = password; // Will be hashed by pre-save hook
      
      await user.save();
    } else {
      // Create new user account
      const defaultUsername = username || employee.email.split('@')[0];
      const defaultPassword = password || 'Employee@123';

      // Check if user with this email already exists
      const existingUser = await User.findOne({ email: userEmail });
      
      if (existingUser) {
        res.status(400).json({
          status: 400,
          success: false,
          message: 'User account with this email already exists',
        });
        return;
      }

      user = await User.create({
        email: userEmail,
        username: defaultUsername,
        password: defaultPassword,
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: 'employee',
      });

      // Link employee to user
      employee.userId = user._id;
      await employee.save();
    }

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: employee.userId ? 'Credentials updated successfully' : 'Credentials created successfully',
      data: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get employee credentials info (without password)
export const getEmployeeCredentials = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        status: 400,
        success: false,
        message: 'Invalid employee ID',
      });
      return;
    }

    const employee = await Employee.findById(id).populate('userId', 'email username role');

    if (!employee) {
      res.status(404).json({
        status: 404,
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Employee credentials retrieved successfully',
      data: employee.userId || null,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
