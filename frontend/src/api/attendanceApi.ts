import axios from './axios';
import { CheckInData, CheckOutData, AttendanceFormData, AttendanceFilters } from '../types/attendance';

const API_URL = '/attendance';

export const attendanceApi = {
  // Check-in
  checkIn: async (data: CheckInData) => {
    const response = await axios.post(`${API_URL}/check-in`, data);
    return response.data;
  },

  // Check-out
  checkOut: async (id: string, data: CheckOutData) => {
    const response = await axios.put(`${API_URL}/${id}/check-out`, data);
    return response.data;
  },

  // Get all attendance records
  getAll: async (filters?: AttendanceFilters, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await axios.get(`${API_URL}?${params.toString()}`);
    return response.data;
  },

  // Get attendance by ID
  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Get today's attendance for an employee
  getTodayAttendance: async (employeeId: string) => {
    const response = await axios.get(`${API_URL}/today/${employeeId}`);
    return response.data;
  },

  // Create attendance manually (Admin/HR)
  create: async (data: AttendanceFormData) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  // Update attendance (Admin/HR)
  update: async (id: string, data: Partial<AttendanceFormData>) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  // Delete attendance (Admin)
  delete: async (id: string) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Get attendance statistics
  getStats: async (filters?: { startDate?: string; endDate?: string; employeeId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);

    const response = await axios.get(`${API_URL}/stats?${params.toString()}`);
    return response.data;
  },
};
