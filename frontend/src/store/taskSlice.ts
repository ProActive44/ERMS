import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as taskApi from '../api/taskApi';
import {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilters,
  TaskStats,
} from '../types/task';
import { toast } from 'react-toastify';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  stats: TaskStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: TaskFilters;
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  stats: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

// Async thunks
export const createTask = createAsyncThunk(
  'task/createTask',
  async (data: CreateTaskPayload, { rejectWithValue }) => {
    try {
      const task = await taskApi.createTask(data);
      toast.success('Task created successfully');
      return task;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create task');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create task'
      );
    }
  }
);

export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async (filters: TaskFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await taskApi.getAllTasks(filters);
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch tasks');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch tasks'
      );
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'task/fetchTaskById',
  async (id: string, { rejectWithValue }) => {
    try {
      const task = await taskApi.getTaskById(id);
      return task;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch task');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch task'
      );
    }
  }
);

export const updateTask = createAsyncThunk(
  'task/updateTask',
  async (
    { id, data }: { id: string; data: UpdateTaskPayload },
    { rejectWithValue }
  ) => {
    try {
      const task = await taskApi.updateTask(id, data);
      toast.success('Task updated successfully');
      return task;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update task');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update task'
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await taskApi.deleteTask(id);
      toast.success('Task deleted successfully');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete task'
      );
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'task/updateTaskStatus',
  async (
    {
      id,
      status,
    }: {
      id: string;
      status: 'To Do' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked';
    },
    { rejectWithValue }
  ) => {
    try {
      const task = await taskApi.updateTaskStatus(id, status);
      toast.success('Task status updated successfully');
      return task;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to update task status'
      );
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update task status'
      );
    }
  }
);

export const assignTask = createAsyncThunk(
  'task/assignTask',
  async (
    { id, assignedTo }: { id: string; assignedTo: string },
    { rejectWithValue }
  ) => {
    try {
      const task = await taskApi.assignTask(id, assignedTo);
      toast.success('Task assigned successfully');
      return task;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign task');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to assign task'
      );
    }
  }
);

export const updateTaskHours = createAsyncThunk(
  'task/updateTaskHours',
  async (
    { id, actualHours }: { id: string; actualHours: number },
    { rejectWithValue }
  ) => {
    try {
      const task = await taskApi.updateTaskHours(id, actualHours);
      toast.success('Task hours updated successfully');
      return task;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to update task hours'
      );
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update task hours'
      );
    }
  }
);

export const fetchTasksByProject = createAsyncThunk(
  'task/fetchTasksByProject',
  async (
    {
      projectId,
      filters,
    }: { projectId: string; filters?: { status?: string; assignedTo?: string } },
    { rejectWithValue }
  ) => {
    try {
      const tasks = await taskApi.getTasksByProject(projectId, filters);
      return tasks;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch tasks');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch tasks'
      );
    }
  }
);

export const fetchTaskStats = createAsyncThunk(
  'task/fetchTaskStats',
  async (projectId: string | undefined, { rejectWithValue }) => {
    try {
      const stats = await taskApi.getTaskStats(projectId);
      return stats;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to fetch task statistics'
      );
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch task statistics'
      );
    }
  }
);

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<TaskFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    // Create Task
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Task by ID
    builder
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Task
    builder
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        if (state.currentTask?._id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Task Status
    builder
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Assign Task
    builder
      .addCase(assignTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignTask.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(assignTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Task Hours
    builder
      .addCase(updateTaskHours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskHours.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTaskHours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Tasks by Project
    builder
      .addCase(fetchTasksByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasksByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Task Stats
    builder
      .addCase(fetchTaskStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchTaskStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, resetFilters, clearError, clearCurrentTask } =
  taskSlice.actions;

export default taskSlice.reducer;
