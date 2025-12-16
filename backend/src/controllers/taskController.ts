import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { Employee } from '../models/Employee';

// Create Task
export const createTask = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      projectId,
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
      estimatedHours,
      tags,
      dependencies,
    } = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Verify assignee exists if provided
    if (assignedTo) {
      const employee = await Employee.findById(assignedTo);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Assigned employee not found',
        });
      }
    }

    // Verify dependencies exist if provided
    if (dependencies && dependencies.length > 0) {
      const tasks = await Task.find({ _id: { $in: dependencies } });
      if (tasks.length !== dependencies.length) {
        return res.status(404).json({
          success: false,
          message: 'One or more dependent tasks not found',
        });
      }
    }

    const task = new Task({
      projectId,
      title,
      description,
      status: status || 'To Do',
      priority,
      assignedTo,
      assignedBy: req.user!.userId,
      dueDate,
      estimatedHours,
      tags: tags || [],
      dependencies: dependencies || [],
      createdBy: req.user!.userId,
      updatedBy: req.user!.userId,
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('projectId', 'name status priority')
      .populate('assignedTo', 'firstName lastName email employeeId')
      .populate('assignedBy', 'name email')
      .populate('dependencies', 'title status')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message,
    });
  }
};

// Get All Tasks
export const getAllTasks = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      projectId,
      status,
      priority,
      assignedTo,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      overdue,
    } = req.query;

    const filter: any = {};

    // For regular employees, only show tasks assigned to them
    const userRole = req.user?.role;
    if (userRole === 'employee') {
      const employee = await Employee.findOne({ userId: req.user?.userId });
      if (employee) {
        filter.assignedTo = employee._id;
      } else {
        // No employee record, return empty
        return res.json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            page: Number(page),
            limit: Number(limit),
            totalPages: 0,
          },
        });
      }
    }

    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    // Only allow admin/HR to filter by assignedTo (employees already have this set)
    if (assignedTo && userRole !== 'employee') filter.assignedTo = assignedTo;
    if (search) {
      filter.$text = { $search: search as string };
    }
    if (overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $ne: 'Completed' };
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);

    const tasks = await Task.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('projectId', 'name status priority')
      .populate('assignedTo', 'firstName lastName email employeeId')
      .populate('assignedBy', 'name email')
      .populate('dependencies', 'title status')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message,
    });
  }
};

// Get Task by ID
export const getTaskById = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate('projectId', 'name description status priority')
      .populate('assignedTo', 'firstName lastName email employeeId department')
      .populate('assignedBy', 'name email')
      .populate('dependencies', 'title status priority dueDate')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message,
    });
  }
};

// Update Task
export const updateTask = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedBy: req.user!.userId };

    // Verify assignee exists if being updated
    if (updateData.assignedTo) {
      const employee = await Employee.findById(updateData.assignedTo);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Assigned employee not found',
        });
      }
    }

    // Verify dependencies exist if being updated
    if (updateData.dependencies && updateData.dependencies.length > 0) {
      const tasks = await Task.find({ _id: { $in: updateData.dependencies } });
      if (tasks.length !== updateData.dependencies.length) {
        return res.status(404).json({
          success: false,
          message: 'One or more dependent tasks not found',
        });
      }
    }

    const task = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('projectId', 'name status priority')
      .populate('assignedTo', 'firstName lastName email employeeId')
      .populate('assignedBy', 'name email')
      .populate('dependencies', 'title status')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message,
    });
  }
};

// Delete Task
export const deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message,
    });
  }
};

// Update Task Status
export const updateTaskStatus = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findByIdAndUpdate(
      id,
      {
        status,
        updatedBy: req.user!.userId,
      },
      { new: true, runValidators: true }
    )
      .populate('projectId', 'name status priority')
      .populate('assignedTo', 'firstName lastName email employeeId')
      .populate('assignedBy', 'name email')
      .populate('dependencies', 'title status')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: task,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating task status',
      error: error.message,
    });
  }
};

// Assign Task
export const assignTask = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const employee = await Employee.findById(assignedTo);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      {
        assignedTo,
        assignedBy: req.user!.userId,
        updatedBy: req.user!.userId,
      },
      { new: true, runValidators: true }
    )
      .populate('projectId', 'name status priority')
      .populate('assignedTo', 'firstName lastName email employeeId')
      .populate('assignedBy', 'name email')
      .populate('dependencies', 'title status')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      message: 'Task assigned successfully',
      data: task,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error assigning task',
      error: error.message,
    });
  }
};

// Update Task Hours
export const updateTaskHours = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { actualHours } = req.body;

    const task = await Task.findByIdAndUpdate(
      id,
      {
        actualHours,
        updatedBy: req.user!.userId,
      },
      { new: true, runValidators: true }
    )
      .populate('projectId', 'name status priority')
      .populate('assignedTo', 'firstName lastName email employeeId')
      .populate('assignedBy', 'name email')
      .populate('dependencies', 'title status')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      message: 'Task hours updated successfully',
      data: task,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating task hours',
      error: error.message,
    });
  }
};

// Get Tasks by Project
export const getTasksByProject = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { projectId } = req.params;
    const { status, assignedTo } = req.query;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const filter: any = { projectId };
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'firstName lastName email employeeId')
      .populate('assignedBy', 'name email')
      .populate('dependencies', 'title status')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message,
    });
  }
};

// Get Task Statistics
export const getTaskStats = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { projectId } = req.query;

    const filter: any = {};
    
    // For regular employees, only count their assigned tasks
    const userRole = req.user?.role;
    if (userRole === 'employee') {
      const employee = await Employee.findOne({ userId: req.user?.userId });
      if (employee) {
        filter.assignedTo = employee._id;
      } else {
        // No employee record, return zeros
        return res.json({
          success: true,
          data: {
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            blockedTasks: 0,
            overdueTasks: 0,
            tasksByStatus: [],
            tasksByPriority: [],
          },
        });
      }
    }
    
    if (projectId) filter.projectId = projectId;

    const totalTasks = await Task.countDocuments(filter);
    const completedTasks = await Task.countDocuments({ ...filter, status: 'Completed' });
    const inProgressTasks = await Task.countDocuments({ ...filter, status: 'In Progress' });
    const blockedTasks = await Task.countDocuments({ ...filter, status: 'Blocked' });

    const overdueTasks = await Task.countDocuments({
      ...filter,
      dueDate: { $lt: new Date() },
      status: { $ne: 'Completed' },
    });

    const tasksByStatus = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const tasksByPriority = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        blockedTasks,
        overdueTasks,
        tasksByStatus,
        tasksByPriority,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task statistics',
      error: error.message,
    });
  }
};
