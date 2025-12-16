import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Project } from '../models/Project';
import { Employee } from '../models/Employee';
import mongoose from 'mongoose';

// Create Project
export const createProject = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      name,
      description,
      status,
      priority,
      projectManagerId,
      teamMembers,
      startDate,
      endDate,
      budget,
      clientName,
      tags,
    } = req.body;

    // Verify project manager exists
    const projectManager = await Employee.findById(projectManagerId);
    if (!projectManager) {
      return res.status(404).json({
        success: false,
        message: 'Project manager not found',
      });
    }

    // Verify team members exist
    if (teamMembers && teamMembers.length > 0) {
      const employees = await Employee.find({ _id: { $in: teamMembers } });
      if (employees.length !== teamMembers.length) {
        return res.status(404).json({
          success: false,
          message: 'One or more team members not found',
        });
      }
    }

    const project = new Project({
      name,
      description,
      status: status || 'Planning',
      priority,
      projectManager: projectManagerId,
      teamMembers: teamMembers || [],
      startDate,
      endDate,
      budget,
      clientName,
      tags: tags || [],
      createdBy: req.user?.userId,
      updatedBy: req.user?.userId,
    });

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('projectManager', 'firstName lastName email employeeId')
      .populate('teamMembers', 'firstName lastName email employeeId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: populatedProject,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message,
    });
  }
};

// Get All Projects
export const getAllProjects = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const {
      status,
      priority,
      projectManagerId,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter: any = {};

    // For regular employees, only show projects they're assigned to
    const userRole = req.user?.role;
    if (userRole === 'employee') {
      const employee = await Employee.findOne({ userId: req.user?.userId });
      if (employee) {
        filter.$or = [
          { projectManager: employee._id },
          { teamMembers: employee._id }
        ];
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

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    // Only allow admin/HR to filter by projectManager (conflicts with employee $or condition)
    if (projectManagerId && userRole !== 'employee') filter.projectManager = projectManagerId;
    if (search) {
      filter.$text = { $search: search as string };
    }

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);

    const projects = await Project.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('projectManager', 'firstName lastName email employeeId')
      .populate('teamMembers', 'firstName lastName email employeeId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      data: projects,
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
      message: 'Error fetching projects',
      error: error.message,
    });
  }
};

// Get Project by ID
export const getProjectById = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate('projectManager', 'firstName lastName email employeeId department')
      .populate('teamMembers', 'firstName lastName email employeeId department')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message,
    });
  }
};

// Update Project
export const updateProject = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedBy: req.user!.userId };

    // Verify project manager exists if being updated
    if (updateData.projectManagerId) {
      const projectManager = await Employee.findById(updateData.projectManagerId);
      if (!projectManager) {
        return res.status(404).json({
          success: false,
          message: 'Project manager not found',
        });
      }
      updateData.projectManager = updateData.projectManagerId;
      delete updateData.projectManagerId;
    }

    // Verify team members exist if being updated
    if (updateData.teamMembers && updateData.teamMembers.length > 0) {
      const employees = await Employee.find({ _id: { $in: updateData.teamMembers } });
      if (employees.length !== updateData.teamMembers.length) {
        return res.status(404).json({
          success: false,
          message: 'One or more team members not found',
        });
      }
    }

    const project = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('projectManager', 'firstName lastName email employeeId')
      .populate('teamMembers', 'firstName lastName email employeeId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message,
    });
  }
};

// Delete Project
export const deleteProject = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message,
    });
  }
};

// Add Team Member to Project
export const addTeamMember = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.teamMembers.includes(new mongoose.Types.ObjectId(employeeId))) {
      return res.status(400).json({
        success: false,
        message: 'Employee is already a team member',
      });
    }

    project.teamMembers.push(new mongoose.Types.ObjectId(employeeId));
    project.updatedBy = new mongoose.Types.ObjectId(req.user!.userId);
    await project.save();

    const updatedProject = await Project.findById(id)
      .populate('projectManager', 'firstName lastName email employeeId')
      .populate('teamMembers', 'firstName lastName email employeeId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      success: true,
      message: 'Team member added successfully',
      data: updatedProject,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error adding team member',
      error: error.message,
    });
  }
};

// Remove Team Member from Project
export const removeTeamMember = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const memberIndex = project.teamMembers.findIndex(
      (memberId) => memberId.toString() === employeeId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Employee is not a team member',
      });
    }

    project.teamMembers.splice(memberIndex, 1);
    project.updatedBy = new mongoose.Types.ObjectId(req.user!.userId);
    await project.save();

    const updatedProject = await Project.findById(id)
      .populate('projectManager', 'firstName lastName email employeeId')
      .populate('teamMembers', 'firstName lastName email employeeId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json({
      success: true,
      message: 'Team member removed successfully',
      data: updatedProject,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error removing team member',
      error: error.message,
    });
  }
};

// Update Project Progress
export const updateProjectProgress = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      {
        progress,
        updatedBy: req.user!.userId,
      },
      { new: true, runValidators: true }
    )
      .populate('projectManager', 'firstName lastName email employeeId')
      .populate('teamMembers', 'firstName lastName email employeeId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.json({
      success: true,
      message: 'Project progress updated successfully',
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating project progress',
      error: error.message,
    });
  }
};

// Get Project Statistics
export const getProjectStats = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const filter: any = {};
    
    // For regular employees, only count their assigned projects
    const userRole = req.user?.role;
    if (userRole === 'employee') {
      const employee = await Employee.findOne({ userId: req.user?.userId });
      if (employee) {
        filter.$or = [
          { projectManager: employee._id },
          { teamMembers: employee._id }
        ];
      } else {
        // No employee record, return zeros
        return res.json({
          success: true,
          data: {
            totalProjects: 0,
            activeProjects: 0,
            completedProjects: 0,
            onHoldProjects: 0,
            projectsByStatus: [],
            projectsByPriority: [],
          },
        });
      }
    }

    const totalProjects = await Project.countDocuments(filter);
    const activeProjects = await Project.countDocuments({ ...filter, status: 'In Progress' });
    const completedProjects = await Project.countDocuments({ ...filter, status: 'Completed' });
    const onHoldProjects = await Project.countDocuments({ ...filter, status: 'On Hold' });

    const matchStage = Object.keys(filter).length > 0 ? { $match: filter } : { $match: {} };

    const projectsByStatus = await Project.aggregate([
      matchStage,
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const projectsByPriority = await Project.aggregate([
      matchStage,
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
        totalProjects,
        activeProjects,
        completedProjects,
        onHoldProjects,
        projectsByStatus,
        projectsByPriority,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching project statistics',
      error: error.message,
    });
  }
};
