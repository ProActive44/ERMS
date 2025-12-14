export interface Task {
  _id: string;
  projectId: {
    _id: string;
    name: string;
    description?: string;
    status: string;
    priority: string;
  };
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeId: string;
    department?: string;
  };
  assignedBy: {
    _id: string;
    name: string;
    email: string;
  };
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: Array<{
    name: string;
    url: string;
    uploadedAt: string;
  }>;
  dependencies: Array<{
    _id: string;
    title: string;
    status: string;
    priority?: string;
    dueDate?: string;
  }>;
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
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  projectId: string;
  title: string;
  description: string;
  status?: 'To Do' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo?: string;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
  dependencies?: string[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: 'To Do' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  dependencies?: string[];
}

export interface TaskFilters {
  projectId?: string;
  status?: 'To Do' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'dueDate' | 'priority' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  overdue?: boolean;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  tasksByStatus: Array<{
    _id: string;
    count: number;
  }>;
  tasksByPriority: Array<{
    _id: string;
    count: number;
  }>;
}

export interface TaskResponse {
  success: boolean;
  message?: string;
  data?: Task | Task[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TaskStatsResponse {
  success: boolean;
  data: TaskStats;
}
