import { Request, Response } from 'express';
import { Employee } from '../models/Employee';
import { Department } from '../models/Department';
import { User } from '../models/User';
import { ApiResponse, Pagination } from '../types';

/**
 * Create a new employee
 */
export const createEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      mobileNumber,
      designation,
      department,
      address,
      documents,
    } = req.body;

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({
      $or: [{ email }, { employeeId }, { mobileNumber }],
    });

    if (existingEmployee) {
      let message = 'Employee already exists';
      if (existingEmployee.email === email) {
        message = 'Email already registered';
      } else if (existingEmployee.employeeId === employeeId) {
        message = 'Employee ID already exists';
      } else if (existingEmployee.mobileNumber === mobileNumber) {
        message = 'Mobile number already registered';
      }

      const response: ApiResponse = {
        status: 400,
        success: false,
        message,
      };
      res.status(400).json(response);
      return;
    }

    // Verify department exists
    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      const response: ApiResponse = {
        status: 400,
        success: false,
        message: 'Department not found',
      };
      res.status(400).json(response);
      return;
    }

    // Create new employee
    const employee = new Employee({
      employeeId,
      firstName,
      lastName,
      email,
      mobileNumber,
      designation,
      department,
      address,
      documents: documents || [],
    });

    await employee.save();
    await employee.populate('department', 'name description');

    const response: ApiResponse = {
      status: 201,
      success: true,
      message: 'Employee created successfully',
      data: employee,
    };
    res.status(201).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: error.message || 'Error creating employee',
    };
    res.status(500).json(response);
  }
};

/**
 * Get list of employees with pagination and filters
 */
export const getEmployeeList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      department,
      isActive,
      designation,
    } = req.query;

    const query: any = {};

    // Search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Department filter
    if (department) {
      query.department = department;
    }

    // Active status filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Designation filter
    if (designation) {
      query.designation = { $regex: designation, $options: 'i' };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get employees and total count
    const [employees, total] = await Promise.all([
      Employee.find(query)
        .populate('department', 'name description')
        .populate('user', 'email username role')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Employee.countDocuments(query),
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
      message: 'Employees retrieved successfully',
      data: {
        employees,
        pagination,
      },
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: error.message || 'Error retrieving employees',
    };
    res.status(500).json(response);
  }
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id)
      .populate('department', 'name description')
      .populate('user', 'email username role');

    if (!employee) {
      const response: ApiResponse = {
        status: 404,
        success: false,
        message: 'Employee not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Employee retrieved successfully',
      data: employee,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: error.message || 'Error retrieving employee',
    };
    res.status(500).json(response);
  }
};

/**
 * Update employee
 */
export const updateEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If email, employeeId, or mobileNumber is being updated, check for duplicates
    if (updateData.email || updateData.employeeId || updateData.mobileNumber) {
      const existingEmployee = await Employee.findOne({
        _id: { $ne: id },
        $or: [
          updateData.email ? { email: updateData.email } : {},
          updateData.employeeId ? { employeeId: updateData.employeeId } : {},
          updateData.mobileNumber
            ? { mobileNumber: updateData.mobileNumber }
            : {},
        ],
      });

      if (existingEmployee) {
        let message = 'Employee with this information already exists';
        if (existingEmployee.email === updateData.email) {
          message = 'Email already registered';
        } else if (existingEmployee.employeeId === updateData.employeeId) {
          message = 'Employee ID already exists';
        } else if (existingEmployee.mobileNumber === updateData.mobileNumber) {
          message = 'Mobile number already registered';
        }

        const response: ApiResponse = {
          status: 400,
          success: false,
          message,
        };
        res.status(400).json(response);
        return;
      }
    }

    // If department is being updated, verify it exists
    if (updateData.department) {
      const departmentExists = await Department.findById(updateData.department);
      if (!departmentExists) {
        const response: ApiResponse = {
          status: 400,
          success: false,
          message: 'Department not found',
        };
        res.status(400).json(response);
        return;
      }
    }

    // If userId is being set/updated, validate it exists and isn't already linked
    if (updateData.userId !== undefined) {
      if (updateData.userId === null || updateData.userId === '') {
        // Unlinking user - remove reference from employee and user
        const currentEmployee = await Employee.findById(id);
        if (currentEmployee?.user) {
          await User.findByIdAndUpdate(currentEmployee.user, {
            $set: { employee: null },
          });
        }
        updateData.user = null;
        delete updateData.userId;
      } else {
        // Linking user - validate user exists and isn't already linked
        const user = await User.findById(updateData.userId);
        if (!user) {
          const response: ApiResponse = {
            status: 400,
            success: false,
            message: 'User not found',
          };
          res.status(400).json(response);
          return;
        }

        // Check if user is already linked to another employee
        if (user.employee && user.employee.toString() !== id) {
          const response: ApiResponse = {
            status: 400,
            success: false,
            message: 'User is already linked to another employee',
          };
          res.status(400).json(response);
          return;
        }

        // Check if this employee already has a different user
        const currentEmployee = await Employee.findById(id);
        if (currentEmployee?.user && currentEmployee.user.toString() !== updateData.userId) {
          const response: ApiResponse = {
            status: 400,
            success: false,
            message: 'Employee is already linked to another user',
          };
          res.status(400).json(response);
          return;
        }

        updateData.user = updateData.userId;
        delete updateData.userId;
      }
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('department', 'name description')
      .populate('user', 'email username role');

    if (!employee) {
      const response: ApiResponse = {
        status: 404,
        success: false,
        message: 'Employee not found',
      };
      res.status(404).json(response);
      return;
    }

    // If user was linked, update user's employee reference
    if (updateData.user) {
      await User.findByIdAndUpdate(updateData.user, {
        $set: { employee: employee._id },
      });
    }

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: error.message || 'Error updating employee',
    };
    res.status(500).json(response);
  }
};

/**
 * Delete employee (soft delete)
 */
export const deleteEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!employee) {
      const response: ApiResponse = {
        status: 404,
        success: false,
        message: 'Employee not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Employee deleted successfully',
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: error.message || 'Error deleting employee',
    };
    res.status(500).json(response);
  }
};

