import axios from './axios';
import { LeaveFormData, LeaveFilters } from '../types/leave';

export const leaveApi = {
  // Apply for leave
  applyLeave: async (data: LeaveFormData) => {
    const response = await axios.post('/leaves', data);
    return response.data;
  },

  // Get all leaves with filters
  getLeaves: async (filters?: LeaveFilters, page = 1, limit = 10) => {
    const response = await axios.get('/leaves', {
      params: { ...filters, page, limit },
    });
    return response.data;
  },

  // Get leave by ID
  getLeaveById: async (id: string) => {
    const response = await axios.get(`/leaves/${id}`);
    return response.data;
  },

  // Update leave status
  updateLeaveStatus: async (id: string, status: 'Approved' | 'Rejected' | 'Cancelled', rejectionReason?: string) => {
    const response = await axios.put(`/leaves/${id}/status`, {
      status,
      rejectionReason,
    });
    return response.data;
  },

  // Update leave details
  updateLeave: async (id: string, data: Partial<LeaveFormData>) => {
    const response = await axios.put(`/leaves/${id}`, data);
    return response.data;
  },

  // Delete leave
  deleteLeave: async (id: string) => {
    const response = await axios.delete(`/leaves/${id}`);
    return response.data;
  },

  // Get leave statistics
  getLeaveStats: async (employeeId?: string) => {
    const response = await axios.get('/leaves/stats', {
      params: { employeeId },
    });
    return response.data;
  },

  // Get leave balance
  getLeaveBalance: async (employeeId?: string) => {
    const endpoint = employeeId ? `/leaves/balance/${employeeId}` : '/leaves/balance/current';
    const response = await axios.get(endpoint);
    return response.data;
  },
};
