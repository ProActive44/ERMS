import api from './axios';
import {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilters,
  TaskResponse,
  TaskStatsResponse,
} from '../types/task';

// Create task
export const createTask = async (data: CreateTaskPayload): Promise<Task> => {
  const response = await api.post<TaskResponse>('/tasks', data);
  return response.data.data as Task;
};

// Get all tasks
export const getAllTasks = async (
  filters?: TaskFilters
): Promise<{ tasks: Task[]; pagination: any }> => {
  const response = await api.get<TaskResponse>('/tasks', {
    params: filters,
  });
  return {
    tasks: response.data.data as Task[],
    pagination: response.data.pagination,
  };
};

// Get task by ID
export const getTaskById = async (id: string): Promise<Task> => {
  const response = await api.get<TaskResponse>(`/tasks/${id}`);
  return response.data.data as Task;
};

// Update task
export const updateTask = async (
  id: string,
  data: UpdateTaskPayload
): Promise<Task> => {
  const response = await api.put<TaskResponse>(`/tasks/${id}`, data);
  return response.data.data as Task;
};

// Delete task
export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

// Update task status
export const updateTaskStatus = async (
  id: string,
  status: 'To Do' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked'
): Promise<Task> => {
  const response = await api.patch<TaskResponse>(`/tasks/${id}/status`, {
    status,
  });
  return response.data.data as Task;
};

// Assign task
export const assignTask = async (
  id: string,
  assignedTo: string
): Promise<Task> => {
  const response = await api.patch<TaskResponse>(`/tasks/${id}/assign`, {
    assignedTo,
  });
  return response.data.data as Task;
};

// Update task hours
export const updateTaskHours = async (
  id: string,
  actualHours: number
): Promise<Task> => {
  const response = await api.patch<TaskResponse>(`/tasks/${id}/hours`, {
    actualHours,
  });
  return response.data.data as Task;
};

// Get tasks by project
export const getTasksByProject = async (
  projectId: string,
  filters?: { status?: string; assignedTo?: string }
): Promise<Task[]> => {
  const response = await api.get<TaskResponse>(
    `/tasks/project/${projectId}`,
    { params: filters }
  );
  return response.data.data as Task[];
};

// Get task statistics
export const getTaskStats = async (
  projectId?: string
): Promise<TaskStatsResponse['data']> => {
  const response = await api.get<TaskStatsResponse>('/tasks/stats', {
    params: { projectId },
  });
  return response.data.data;
};
