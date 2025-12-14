export interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  projectManager: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeId: string;
    department?: string;
  };
  teamMembers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeId: string;
    department?: string;
  }>;
  startDate?: string;
  endDate?: string;
  budget?: number;
  clientName?: string;
  progress: number;
  tags: string[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description: string;
  status?: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  projectManagerId: string;
  teamMembers?: string[];
  startDate?: string;
  endDate?: string;
  budget?: number;
  clientName?: string;
  tags?: string[];
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  status?: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  projectManagerId?: string;
  teamMembers?: string[];
  startDate?: string;
  endDate?: string;
  budget?: number;
  clientName?: string;
  tags?: string[];
  progress?: number;
}

export interface ProjectFilters {
  status?: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  projectManagerId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'startDate' | 'endDate' | 'priority' | 'progress' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  projectsByStatus: Array<{
    _id: string;
    count: number;
  }>;
  projectsByPriority: Array<{
    _id: string;
    count: number;
  }>;
}

export interface ProjectResponse {
  success: boolean;
  message?: string;
  data?: Project | Project[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProjectStatsResponse {
  success: boolean;
  data: ProjectStats;
}
