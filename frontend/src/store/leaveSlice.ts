import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { leaveApi } from '../api/leaveApi';
import { Leave, LeaveFormData, LeaveFilters, LeaveBalance, LeaveStats } from '../types/leave';
import { toast } from 'react-toastify';

interface LeaveState {
  leaves: Leave[];
  currentLeave: Leave | null;
  leaveBalance: LeaveBalance | null;
  leaveStats: LeaveStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  filters: LeaveFilters;
}

const initialState: LeaveState = {
  leaves: [],
  currentLeave: null,
  leaveBalance: null,
  leaveStats: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
  filters: {},
};

// Async thunks
export const applyLeave = createAsyncThunk(
  'leave/applyLeave',
  async (data: LeaveFormData, { rejectWithValue }) => {
    try {
      const response = await leaveApi.applyLeave(data);
      toast.success(response.message || 'Leave application submitted successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply for leave');
      return rejectWithValue(error.response?.data?.message || 'Failed to apply for leave');
    }
  }
);

export const fetchLeaves = createAsyncThunk(
  'leave/fetchLeaves',
  async (
    { filters, page, limit }: { filters?: LeaveFilters; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await leaveApi.getLeaves(filters, page, limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaves');
    }
  }
);

export const fetchLeaveById = createAsyncThunk(
  'leave/fetchLeaveById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await leaveApi.getLeaveById(id);
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch leave details');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leave details');
    }
  }
);

export const updateLeaveStatus = createAsyncThunk(
  'leave/updateLeaveStatus',
  async (
    {
      id,
      status,
      rejectionReason,
    }: { id: string; status: 'Approved' | 'Rejected' | 'Cancelled'; rejectionReason?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await leaveApi.updateLeaveStatus(id, status, rejectionReason);
      toast.success(response.message || 'Leave status updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update leave status');
      return rejectWithValue(error.response?.data?.message || 'Failed to update leave status');
    }
  }
);

export const updateLeave = createAsyncThunk(
  'leave/updateLeave',
  async ({ id, data }: { id: string; data: Partial<LeaveFormData> }, { rejectWithValue }) => {
    try {
      const response = await leaveApi.updateLeave(id, data);
      toast.success(response.message || 'Leave updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update leave');
      return rejectWithValue(error.response?.data?.message || 'Failed to update leave');
    }
  }
);

export const deleteLeave = createAsyncThunk(
  'leave/deleteLeave',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await leaveApi.deleteLeave(id);
      toast.success(response.message || 'Leave deleted successfully');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete leave');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete leave');
    }
  }
);

export const fetchLeaveBalance = createAsyncThunk(
  'leave/fetchLeaveBalance',
  async (employeeId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await leaveApi.getLeaveBalance(employeeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leave balance');
    }
  }
);

export const fetchLeaveStats = createAsyncThunk(
  'leave/fetchLeaveStats',
  async (employeeId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await leaveApi.getLeaveStats(employeeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leave statistics');
    }
  }
);

// Slice
const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<LeaveFilters>) => {
      state.filters = action.payload;
    },
    clearCurrentLeave: (state) => {
      state.currentLeave = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Apply leave
    builder
      .addCase(applyLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves.unshift(action.payload);
      })
      .addCase(applyLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch leaves
    builder
      .addCase(fetchLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload.leaves;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch leave by ID
    builder
      .addCase(fetchLeaveById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLeave = action.payload;
      })
      .addCase(fetchLeaveById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update leave status
    builder
      .addCase(updateLeaveStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.leaves.findIndex((leave) => leave._id === action.payload._id);
        if (index !== -1) {
          state.leaves[index] = action.payload;
        }
        if (state.currentLeave && state.currentLeave._id === action.payload._id) {
          state.currentLeave = action.payload;
        }
      })
      .addCase(updateLeaveStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update leave
    builder
      .addCase(updateLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLeave.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.leaves.findIndex((leave) => leave._id === action.payload._id);
        if (index !== -1) {
          state.leaves[index] = action.payload;
        }
        if (state.currentLeave && state.currentLeave._id === action.payload._id) {
          state.currentLeave = action.payload;
        }
      })
      .addCase(updateLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete leave
    builder
      .addCase(deleteLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = state.leaves.filter((leave) => leave._id !== action.payload);
      })
      .addCase(deleteLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch leave balance
    builder
      .addCase(fetchLeaveBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveBalance = action.payload;
      })
      .addCase(fetchLeaveBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch leave stats
    builder
      .addCase(fetchLeaveStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveStats.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveStats = action.payload;
      })
      .addCase(fetchLeaveStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearCurrentLeave, clearError } = leaveSlice.actions;
export default leaveSlice.reducer;
