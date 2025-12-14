import { Response } from 'express';
import { Leave } from '../models/Leave';
import { Employee } from '../models/Employee';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../types';
import mongoose from 'mongoose';

/**
 * Apply for leave
 */
export const applyLeave = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

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

    // Verify employee exists
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

    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      employeeId: targetEmployeeId,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
      ],
    });

    if (overlappingLeave) {
      const response: ApiResponse = {
        status: 400,
        success: false,
        message: 'Leave request overlaps with existing leave',
      };
      res.status(400).json(response);
      return;
    }

    // Create leave request
    const leave = await Leave.create({
      employeeId: targetEmployeeId,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: 'Pending',
      appliedDate: new Date(),
    });

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employeeId', 'employeeId firstName lastName email department designation')
      .populate('approvedBy', 'firstName lastName email');

    const response: ApiResponse = {
      status: 201,
      success: true,
      message: 'Leave application submitted successfully',
      data: populatedLeave,
    };
    res.status(201).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: err.message || 'Failed to apply for leave',
    };
    res.status(500).json(response);
  }
};

/**
 * Get all leaves with filters
 */
export const getAllLeaves = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      employeeId,
      status,
      leaveType,
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (status) {
      query.status = status;
    }

    if (leaveType) {
      query.leaveType = leaveType;
    }

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate as string);
      if (endDate) query.startDate.$lte = new Date(endDate as string);
    }

    // If regular employee, only show their leaves
    if (req.user?.role === 'employee' && req.user.userId) {
      const employee = await Employee.findOne({ userId: req.user.userId });
      if (employee) {
        query.employeeId = employee._id;
      }
    }

    const [leaves, total] = await Promise.all([
      Leave.find(query)
        .populate('employeeId', 'employeeId firstName lastName email department designation')
        .populate('approvedBy', 'firstName lastName email')
        .sort({ appliedDate: -1 })
        .skip(skip)
        .limit(limitNum),
      Leave.countDocuments(query),
    ]);

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Leaves retrieved successfully',
      data: {
        leaves,
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
      message: err.message || 'Failed to retrieve leaves',
    };
    res.status(500).json(response);
  }
};

/**
 * Get leave by ID
 */
export const getLeaveById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        status: 400,
        success: false,
        message: 'Invalid leave ID',
      };
      res.status(400).json(response);
      return;
    }

    const leave = await Leave.findById(id)
      .populate('employeeId', 'employeeId firstName lastName email department designation')
      .populate('approvedBy', 'firstName lastName email');

    if (!leave) {
      const response: ApiResponse = {
        status: 404,
        success: false,
        message: 'Leave not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Leave retrieved successfully',
      data: leave,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: err.message || 'Failed to retrieve leave',
    };
    res.status(500).json(response);
  }
};

/**
 * Update leave status (Approve/Reject/Cancel)
 */
export const updateLeaveStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        status: 400,
        success: false,
        message: 'Invalid leave ID',
      };
      res.status(400).json(response);
      return;
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      const response: ApiResponse = {
        status: 404,
        success: false,
        message: 'Leave not found',
      };
      res.status(404).json(response);
      return;
    }

    // Check if leave can be updated
    if (leave.status === 'Approved' || leave.status === 'Rejected') {
      const response: ApiResponse = {
        status: 400,
        success: false,
        message: `Leave has already been ${leave.status.toLowerCase()}`,
      };
      res.status(400).json(response);
      return;
    }

    // Update leave status
    leave.status = status;

    if (status === 'Approved' || status === 'Rejected') {
      leave.approvedBy = req.user!.userId as any;
      leave.approvedDate = new Date();
    }

    if (status === 'Rejected' && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employeeId', 'employeeId firstName lastName email department designation')
      .populate('approvedBy', 'firstName lastName email');

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: `Leave ${status.toLowerCase()} successfully`,
      data: populatedLeave,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: err.message || 'Failed to update leave status',
    };
    res.status(500).json(response);
  }
};

/**
 * Update leave details (before approval)
 */
export const updateLeave = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        status: 400,
        success: false,
        message: 'Invalid leave ID',
      };
      res.status(400).json(response);
      return;
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      const response: ApiResponse = {
        status: 404,
        success: false,
        message: 'Leave not found',
      };
      res.status(404).json(response);
      return;
    }

    // Only pending leaves can be updated
    if (leave.status !== 'Pending') {
      const response: ApiResponse = {
        status: 400,
        success: false,
        message: 'Only pending leaves can be updated',
      };
      res.status(400).json(response);
      return;
    }

    // Update fields
    if (leaveType) leave.leaveType = leaveType;
    if (startDate) leave.startDate = new Date(startDate);
    if (endDate) leave.endDate = new Date(endDate);
    if (reason) leave.reason = reason;

    await leave.save();

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employeeId', 'employeeId firstName lastName email department designation')
      .populate('approvedBy', 'firstName lastName email');

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Leave updated successfully',
      data: populatedLeave,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: err.message || 'Failed to update leave',
    };
    res.status(500).json(response);
  }
};

/**
 * Delete leave
 */
export const deleteLeave = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const response: ApiResponse = {
        status: 400,
        success: false,
        message: 'Invalid leave ID',
      };
      res.status(400).json(response);
      return;
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      const response: ApiResponse = {
        status: 404,
        success: false,
        message: 'Leave not found',
      };
      res.status(404).json(response);
      return;
    }

    await Leave.findByIdAndDelete(id);

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Leave deleted successfully',
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: err.message || 'Failed to delete leave',
    };
    res.status(500).json(response);
  }
};

/**
 * Get leave statistics
 */
export const getLeaveStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.query;

    const matchStage: any = {};
    if (employeeId) {
      matchStage.employeeId = new mongoose.Types.ObjectId(employeeId as string);
    }

    const stats = await Leave.aggregate([
      { $match: matchStage },
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
          typeCount: [
            {
              $group: {
                _id: '$leaveType',
                count: { $sum: 1 },
                totalDays: { $sum: '$numberOfDays' },
              },
            },
          ],
          monthlyCount: [
            {
              $group: {
                _id: {
                  year: { $year: '$startDate' },
                  month: { $month: '$startDate' },
                },
                count: { $sum: 1 },
                totalDays: { $sum: '$numberOfDays' },
              },
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 },
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
      message: 'Leave statistics retrieved successfully',
      data: stats[0],
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: err.message || 'Failed to retrieve leave statistics',
    };
    res.status(500).json(response);
  }
};

/**
 * Get leave balance for an employee
 */
export const getLeaveBalance = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    let { employeeId } = req.params;

    // If employeeId is "current", find employee by logged-in user's ID
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

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    // Get leaves for current year
    const leaves = await Leave.find({
      employeeId,
      startDate: { $gte: yearStart, $lte: yearEnd },
      status: { $in: ['Approved', 'Pending'] },
    });

    // Calculate leave balance (assuming standard leave policy)
    const leaveBalance = {
      sickLeave: { total: 12, used: 0, available: 12 },
      casualLeave: { total: 12, used: 0, available: 12 },
      earnedLeave: { total: 18, used: 0, available: 18 },
      maternityLeave: { total: 180, used: 0, available: 180 },
      paternityLeave: { total: 15, used: 0, available: 15 },
      unpaidLeave: { total: 0, used: 0, available: 0 },
    };

    leaves.forEach((leave) => {
      switch (leave.leaveType) {
        case 'Sick Leave':
          leaveBalance.sickLeave.used += leave.numberOfDays;
          break;
        case 'Casual Leave':
          leaveBalance.casualLeave.used += leave.numberOfDays;
          break;
        case 'Earned Leave':
          leaveBalance.earnedLeave.used += leave.numberOfDays;
          break;
        case 'Maternity Leave':
          leaveBalance.maternityLeave.used += leave.numberOfDays;
          break;
        case 'Paternity Leave':
          leaveBalance.paternityLeave.used += leave.numberOfDays;
          break;
        case 'Unpaid Leave':
          leaveBalance.unpaidLeave.used += leave.numberOfDays;
          break;
      }
    });

    // Calculate available
    leaveBalance.sickLeave.available = leaveBalance.sickLeave.total - leaveBalance.sickLeave.used;
    leaveBalance.casualLeave.available = leaveBalance.casualLeave.total - leaveBalance.casualLeave.used;
    leaveBalance.earnedLeave.available = leaveBalance.earnedLeave.total - leaveBalance.earnedLeave.used;
    leaveBalance.maternityLeave.available = leaveBalance.maternityLeave.total - leaveBalance.maternityLeave.used;
    leaveBalance.paternityLeave.available = leaveBalance.paternityLeave.total - leaveBalance.paternityLeave.used;

    const response: ApiResponse = {
      status: 200,
      success: true,
      message: 'Leave balance retrieved successfully',
      data: leaveBalance,
    };
    res.status(200).json(response);
  } catch (error: unknown) {
    const err = error as Error;
    const response: ApiResponse = {
      status: 500,
      success: false,
      message: err.message || 'Failed to retrieve leave balance',
    };
    res.status(500).json(response);
  }
};
