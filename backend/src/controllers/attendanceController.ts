import { Response } from 'express';
import { Attendance } from '../models/Attendance';
import { Employee } from '../models/Employee';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

/**
 * Check-in attendance
 */
export const checkIn = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { employeeId, checkIn, remarks, location } = req.body;

    let targetEmployeeId = employeeId;

    // If no employeeId provided, find employee by logged-in user's ID
    if (!targetEmployeeId && req.user?.userId) {
      const employee = await Employee.findOne({ userId: req.user.userId });
      if (!employee) {
        const response: ApiResponse = {
          status: 404,
          success: false,
          message: 'No employee record found for this user',
        };
        res.status(404).json(response);
        return;
      }
      targetEmployeeId = employee._id;
    }

    // Check if employee exists
    const employee = await Employee.findById(targetEmployeeId);
    if (!employee) {
      const response: ApiResponse = {
        status: 404,
        success: false,
        message: 'Employee not found',
      };
      res.status(404).json(response);
      return;
    }

    // Get current date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employeeId: targetEmployeeId,
      date: today,
    });

    if (existingAttendance) {
      const response: ApiResponse = {
        status: 400,
        success: false,
        message: 'Already checked in for today',
      };
      res.status(400).json(response);
      return;
    }

    // Create attendance record
    const checkInTime = checkIn ? new Date(checkIn) : new Date();
    
    // Determine status based on check-in time (e.g., late if after 9:30 AM)
    const checkInHour = checkInTime.getHours();
    const checkInMinute = checkInTime.getMinutes();
    const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMinute > 30);

    const attendance = await Attendance.create({
      employeeId: targetEmployeeId,
      date: today,
      checkIn: checkInTime,
      status: isLate ? 'Late' : 'Present',
      remarks,
      location: location
        ? {
            checkIn: {
              latitude: location.latitude,
              longitude: location.longitude,
              address: location.address,
            },
          }
        : undefined,
      createdBy: req.user!.userId,
    });

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('employeeId', 'employeeId firstName lastName email department designation')
      .populate('createdBy', 'firstName lastName email');

    const response: ApiResponse = {
      status: 201,
      success: true,
      message: 'Check-in successful',
      data: populatedAttendance,
    };
    res.status(201).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: err.message || 'Failed to check in',
    };
    res.status(500).json(response);
  }
};

/**
 * Check-out attendance
 */
export const checkOut = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { checkOut, remarks, location } = req.body;

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      const response: ApiResponse = {
        status: 404,
        success: false,
        message: 'Attendance record not found',
      };
      res.status(404).json(response);
      return;
    }

    if (attendance.checkOut) {
      const response: ApiResponse = {
        status: 400,
        success: false,
        message: 'Already checked out',
      };
      res.status(400).json(response);
      return;
    }

    const checkOutTime = checkOut ? new Date(checkOut) : new Date();

    // Update attendance record
    attendance.checkOut = checkOutTime;
    if (remarks) attendance.remarks = remarks;
    if (location) {
      attendance.location = {
        ...attendance.location,
        checkOut: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
        },
      };
    }
    attendance.updatedBy = req.user!.userId as any;

    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('employeeId', 'employeeId firstName lastName email department designation')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Check-out successful',
      data: populatedAttendance,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: err.message || 'Failed to check out',
    };
    res.status(500).json(response);
  }
};

/**
 * Get all attendance records with filters
 */
export const getAllAttendance = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { employeeId, startDate, endDate, status, page = '1', limit = '10' } = req.query;

    const query: any = {};

    if (employeeId) query.employeeId = employeeId;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .populate('employeeId', 'employeeId firstName lastName email department designation')
        .populate('createdBy', 'firstName lastName email')
        .sort({ date: -1, checkIn: -1 })
        .skip(skip)
        .limit(limitNum),
      Attendance.countDocuments(query),
    ]);

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Attendance records retrieved successfully',
      data: {
        attendance,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: err.message || 'Failed to retrieve attendance records',
    };
    res.status(500).json(response);
  }
};

/**
 * Get attendance by ID
 */
export const getAttendanceById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findById(id)
      .populate('employeeId', 'employeeId firstName lastName email department designation phone')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!attendance) {
      const response: ApiResponse = {
        status: 404,
        success: false,
        message: 'Attendance record not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Attendance record retrieved successfully',
      data: attendance,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: err.message || 'Failed to retrieve attendance record',
    };
    res.status(500).json(response);
  }
};

/**
 * Create attendance manually (Admin/HR only)
 */
export const createAttendance = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { employeeId, date, checkIn, checkOut, status, remarks } = req.body;

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      const response: ApiResponse = {
        status: 404,
        success: false,
        message: 'Employee not found',
      };
      res.status(404).json(response);
      return;
    }

    const attendance = await Attendance.create({
      employeeId,
      date: new Date(date),
      checkIn: new Date(checkIn),
      checkOut: checkOut ? new Date(checkOut) : undefined,
      status,
      remarks,
      createdBy: req.user!.userId,
    });

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('employeeId', 'employeeId firstName lastName email department designation')
      .populate('createdBy', 'firstName lastName email');

    const response: ApiResponse = {
      status: 201,
      success: true,
      message: 'Attendance record created successfully',
      data: populatedAttendance,
    };
    res.status(201).json(response);
  } catch (error: any) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const response: ApiResponse = {
        status: 409,
        success: false,
        message: 'An attendance record already exists for this employee on this date',
      };
      res.status(409).json(response);
      return;
    }

    const response: ApiResponse = {
      status: 500,
      success: false,
      message: error.message || 'Failed to create attendance record',
    };
    res.status(500).json(response);
  }
};

/**
 * Update attendance (Admin/HR only)
 */
export const updateAttendance = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      const response: ApiResponse = {
        status: 404,
        success: false,
        message: 'Attendance record not found',
      };
      res.status(404).json(response);
      return;
    }

    // Update fields
    if (updates.checkIn) attendance.checkIn = new Date(updates.checkIn);
    if (updates.checkOut) attendance.checkOut = new Date(updates.checkOut);
    if (updates.status) attendance.status = updates.status;
    if (updates.remarks !== undefined) attendance.remarks = updates.remarks;
    attendance.updatedBy = req.user!.userId as any;

    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('employeeId', 'employeeId firstName lastName email department designation')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Attendance record updated successfully',
      data: populatedAttendance,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: err.message || 'Failed to update attendance record',
    };
    res.status(500).json(response);
  }
};

/**
 * Delete attendance (Admin only)
 */
export const deleteAttendance = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance) {
      const response: ApiResponse = {
        status: 404,
        success: false,
        message: 'Attendance record not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Attendance record deleted successfully',
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: err.message || 'Failed to delete attendance record',
    };
    res.status(500).json(response);
  }
};

/**
 * Get attendance statistics
 */
export const getAttendanceStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    const matchStage: any = {};
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate as string);
      if (endDate) matchStage.date.$lte = new Date(endDate as string);
    }
    
    if (employeeId) {
      matchStage.employeeId = employeeId;
    }

    // Get status count for all records
    const statusCount = await Attendance.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgWorkHours: { $avg: '$workHours' },
        },
      },
    ]);

    // Get today's statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalEmployees = await Employee.countDocuments({ status: 'Active' });
    const todayPresent = todayStats.find(s => s._id === 'Present')?.count || 0;
    const todayAbsent = totalEmployees - todayPresent;
    const attendanceRate = totalEmployees > 0 ? (todayPresent / totalEmployees) * 100 : 0;

    const totalRecords = await Attendance.countDocuments(matchStage);

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Attendance statistics retrieved successfully',
      data: {
        stats: statusCount,
        total: totalRecords,
        todayStats: {
          present: todayPresent,
          absent: todayAbsent,
        },
        attendanceRate,
        statusCount,
      },
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: err.message || 'Failed to retrieve attendance statistics',
    };
    res.status(500).json(response);
  }
};

/**
 * Get today's attendance for an employee
 */
export const getTodayAttendance = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    let { employeeId } = req.params;

    // If employeeId is "current" or not provided, find employee by logged-in user's ID
    if (!employeeId || employeeId === 'current') {
      if (!req.user?.userId) {
        const response: ApiResponse = {
          status: 401,
          success: false,
          message: 'User not authenticated',
        };
        res.status(401).json(response);
        return;
      }

      const employee = await Employee.findOne({ userId: req.user.userId });
      if (!employee) {
        const response: ApiResponse = {
          status: 404,
          success: false,
          message: 'No employee record found for this user',
        };
        res.status(404).json(response);
        return;
      }
      employeeId = employee._id.toString();
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId,
      date: today,
    })
      .populate('employeeId', 'employeeId firstName lastName email department designation')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: attendance ? "Today's attendance found" : 'No attendance record for today',
      data: attendance,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: err.message || 'Failed to retrieve today\'s attendance',
    };
    res.status(500).json(response);
  }
};
