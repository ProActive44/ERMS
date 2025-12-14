import api from './axios';
import {
  Project,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectFilters,
  ProjectResponse,
  ProjectStatsResponse,
} from '../types/project';

// Create project
export const createProject = async (
  data: CreateProjectPayload
): Promise<Project> => {
  const response = await api.post<ProjectResponse>('/projects', data);
  return response.data.data as Project;
};

// Get all projects
export const getAllProjects = async (
  filters?: ProjectFilters
): Promise<{ projects: Project[]; pagination: any }> => {
  const response = await api.get<ProjectResponse>('/projects', {
    params: filters,
  });
  return {
    projects: response.data.data as Project[],
    pagination: response.data.pagination,
  };
};

// Get project by ID
export const getProjectById = async (id: string): Promise<Project> => {
  const response = await api.get<ProjectResponse>(`/projects/${id}`);
  return response.data.data as Project;
};

// Update project
export const updateProject = async (
  id: string,
  data: UpdateProjectPayload
): Promise<Project> => {
  const response = await api.put<ProjectResponse>(`/projects/${id}`, data);
  return response.data.data as Project;
};

// Delete project
export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/projects/${id}`);
};

// Add team member
export const addTeamMember = async (
  projectId: string,
  employeeId: string
): Promise<Project> => {
  const response = await api.post<ProjectResponse>(
    `/projects/${projectId}/team-members`,
    { employeeId }
  );
  return response.data.data as Project;
};

// Remove team member
export const removeTeamMember = async (
  projectId: string,
  employeeId: string
): Promise<Project> => {
  const response = await api.delete<ProjectResponse>(
    `/projects/${projectId}/team-members`,
    { data: { employeeId } }
  );
  return response.data.data as Project;
};

// Update project progress
export const updateProjectProgress = async (
  projectId: string,
  progress: number
): Promise<Project> => {
  const response = await api.patch<ProjectResponse>(
    `/projects/${projectId}/progress`,
    { progress }
  );
  return response.data.data as Project;
};

// Get project statistics
export const getProjectStats = async (): Promise<ProjectStatsResponse['data']> => {
  const response = await api.get<ProjectStatsResponse>('/projects/stats');
  return response.data.data;
};
