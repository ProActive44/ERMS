import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { attendanceApi } from '../api/attendanceApi';
import { Attendance, CheckInData, CheckOutData, AttendanceFormData, AttendanceFilters } from '../types/attendance';
import { toast } from 'react-toastify';

interface AttendanceState {
  attendance: Attendance[];
  currentAttendance: Attendance | null;
  todayAttendance: Attendance | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: AttendanceFilters;
}

const initialState: AttendanceState = {
  attendance: [],
  currentAttendance: null,
  todayAttendance: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  filters: {},
};

// Async thunks
export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (data: CheckInData, { rejectWithValue }) => {
    try {
      const response = await attendanceApi.checkIn(data);
      toast.success('Checked in successfully');
      return response.data;
    } catch (error: unknown) {
      const err = error as any;
      const message = err.response?.data?.message || 'Failed to check in';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async ({ id, data }: { id: string; data: CheckOutData }, { rejectWithValue }) => {
    try {
      const response = await attendanceApi.checkOut(id, data);
      toast.success('Checked out successfully');
      return response.data;
    } catch (error: unknown) {
      const err = error as any;
      const message = err.response?.data?.message || 'Failed to check out';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchAttendance = createAsyncThunk(
  'attendance/fetchAll',
  async (
    { filters, page, limit }: { filters: AttendanceFilters | undefined; page: number; limit: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await attendanceApi.getAll(filters, page, limit);
      return response.data;
    } catch (error: unknown) {
      const err = error as any;
      const message = err.response?.data?.message || 'Failed to fetch attendance records';
      return rejectWithValue(message);
    }
  }
);

export const fetchAttendanceById = createAsyncThunk(
  'attendance/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await attendanceApi.getById(id);
      return response.data;
    } catch (error: unknown) {
      const err = error as any;
      const message = err.response?.data?.message || 'Failed to fetch attendance record';
      return rejectWithValue(message);
    }
  }
);

export const fetchTodayAttendance = createAsyncThunk(
  'attendance/fetchToday',
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const response = await attendanceApi.getTodayAttendance(employeeId);
      return response.data;
    } catch (error: unknown) {
      const err = error as any;
      const message = err.response?.data?.message || "Failed to fetch today's attendance";
      return rejectWithValue(message);
    }
  }
);

export const createAttendance = createAsyncThunk(
  'attendance/create',
  async (data: AttendanceFormData, { rejectWithValue }) => {
    try {
      const response = await attendanceApi.create(data);
      toast.success('Attendance record created successfully');
      return response.data;
    } catch (error: unknown) {
      const err = error as any;
      const message = err.response?.data?.message || 'Failed to create attendance record';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateAttendance = createAsyncThunk(
  'attendance/update',
  async ({ id, data }: { id: string; data: Partial<AttendanceFormData> }, { rejectWithValue }) => {
    try {
      const response = await attendanceApi.update(id, data);
      toast.success('Attendance record updated successfully');
      return response.data;
    } catch (error: unknown) {
      const err = error as any;
      const message = err.response?.data?.message || 'Failed to update attendance record';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteAttendance = createAsyncThunk(
  'attendance/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await attendanceApi.delete(id);
      toast.success('Attendance record deleted successfully');
      return id;
    } catch (error: unknown) {
      const err = error as any;
      const message = err.response?.data?.message || 'Failed to delete attendance record';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<AttendanceFilters>) => {
      state.filters = action.payload;
    },
    clearCurrentAttendance: (state) => {
      state.currentAttendance = null;
    },
    clearTodayAttendance: (state) => {
      state.todayAttendance = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check-in
      .addCase(checkIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        state.todayAttendance = action.payload;
        state.attendance.unshift(action.payload);
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Check-out
      .addCase(checkOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.loading = false;
        state.todayAttendance = action.payload;
        const index = state.attendance.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) {
          state.attendance[index] = action.payload;
        }
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch attendance
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance = action.payload.attendance;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch by ID
      .addCase(fetchAttendanceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttendance = action.payload;
      })
      .addCase(fetchAttendanceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch today's attendance
      .addCase(fetchTodayAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.todayAttendance = action.payload;
      })
      .addCase(fetchTodayAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance.unshift(action.payload);
      })
      .addCase(createAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.attendance.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) {
          state.attendance[index] = action.payload;
        }
        if (state.currentAttendance?._id === action.payload._id) {
          state.currentAttendance = action.payload;
        }
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance = state.attendance.filter((a) => a._id !== action.payload);
      })
      .addCase(deleteAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearCurrentAttendance, clearTodayAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;
