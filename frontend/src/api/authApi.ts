import apiClient from './axios';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'admin' | 'hr' | 'employee';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    _id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  accessToken: string;
  // refreshToken is now in httpOnly cookie, not in response
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data.data;
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await apiClient.post('/auth/refresh-token', {});
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data.data;
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
  }) => {
    const response = await apiClient.put('/auth/profile', data);
    return response.data.data;
  },
};

