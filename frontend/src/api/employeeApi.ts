import api from './axios';
import { Employee, EmployeeFormData, EmployeeFilters, EmployeeStats } from '../types/employee';

interface PaginationResponse {
  employees: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const employeeApi = {
  // Get all employees with filters
  getAll: async (filters?: EmployeeFilters): Promise<PaginationResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.department) params.append('department', filters.department);
      if (filters.status) params.append('status', filters.status);
      if (filters.employmentType) params.append('employmentType', filters.employmentType);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    }

    const response = await api.get(`/employees?${params.toString()}`);
    return response.data.data;
  },

  // Get employee by ID
  getById: async (id: string): Promise<Employee> => {
    const response = await api.get(`/employees/${id}`);
    return response.data.data;
  },

  // Create new employee
  create: async (data: EmployeeFormData): Promise<Employee> => {
    const response = await api.post('/employees', data);
    return response.data.data;
  },

  // Update employee
  update: async (id: string, data: Partial<EmployeeFormData>): Promise<Employee> => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data.data;
  },

  // Delete employee
  delete: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },

  // Get employee statistics
  getStats: async (): Promise<EmployeeStats> => {
    const response = await api.get('/employees/stats');
    return response.data.data;
  },
};
