import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as projectApi from '../api/projectApi';
import {
  Project,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectFilters,
  ProjectStats,
} from '../types/project';
import { toast } from 'react-toastify';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  stats: ProjectStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: ProjectFilters;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
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
export const createProject = createAsyncThunk(
  'project/createProject',
  async (data: CreateProjectPayload, { rejectWithValue }) => {
    try {
      const project = await projectApi.createProject(data);
      toast.success('Project created successfully');
      return project;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create project');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create project'
      );
    }
  }
);

export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (filters: ProjectFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await projectApi.getAllProjects(filters);
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch projects');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch projects'
      );
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'project/fetchProjectById',
  async (id: string, { rejectWithValue }) => {
    try {
      const project = await projectApi.getProjectById(id);
      return project;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch project');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch project'
      );
    }
  }
);

export const updateProject = createAsyncThunk(
  'project/updateProject',
  async (
    { id, data }: { id: string; data: UpdateProjectPayload },
    { rejectWithValue }
  ) => {
    try {
      const project = await projectApi.updateProject(id, data);
      toast.success('Project updated successfully');
      return project;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update project');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update project'
      );
    }
  }
);

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (id: string, { rejectWithValue }) => {
    try {
      await projectApi.deleteProject(id);
      toast.success('Project deleted successfully');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete project'
      );
    }
  }
);

export const addTeamMember = createAsyncThunk(
  'project/addTeamMember',
  async (
    { projectId, employeeId }: { projectId: string; employeeId: string },
    { rejectWithValue }
  ) => {
    try {
      const project = await projectApi.addTeamMember(projectId, employeeId);
      toast.success('Team member added successfully');
      return project;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to add team member'
      );
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add team member'
      );
    }
  }
);

export const removeTeamMember = createAsyncThunk(
  'project/removeTeamMember',
  async (
    { projectId, employeeId }: { projectId: string; employeeId: string },
    { rejectWithValue }
  ) => {
    try {
      const project = await projectApi.removeTeamMember(projectId, employeeId);
      toast.success('Team member removed successfully');
      return project;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to remove team member'
      );
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove team member'
      );
    }
  }
);

export const updateProjectProgress = createAsyncThunk(
  'project/updateProjectProgress',
  async (
    { projectId, progress }: { projectId: string; progress: number },
    { rejectWithValue }
  ) => {
    try {
      const project = await projectApi.updateProjectProgress(
        projectId,
        progress
      );
      toast.success('Project progress updated successfully');
      return project;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to update project progress'
      );
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update project progress'
      );
    }
  }
);

export const fetchProjectStats = createAsyncThunk(
  'project/fetchProjectStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await projectApi.getProjectStats();
      return stats;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to fetch project statistics'
      );
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch project statistics'
      );
    }
  }
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ProjectFilters>) => {
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
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
  },
  extraReducers: (builder) => {
    // Create Project
    builder
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Projects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.projects;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Project by ID
    builder
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Project
    builder
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
        const index = state.projects.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Project
    builder
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter((p) => p._id !== action.payload);
        if (state.currentProject?._id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add Team Member
    builder
      .addCase(addTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
        const index = state.projects.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(addTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Remove Team Member
    builder
      .addCase(removeTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
        const index = state.projects.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(removeTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Project Progress
    builder
      .addCase(updateProjectProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProjectProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
        const index = state.projects.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(updateProjectProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Project Stats
    builder
      .addCase(fetchProjectStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchProjectStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, resetFilters, clearError, clearCurrentProject } =
  projectSlice.actions;

export default projectSlice.reducer;
