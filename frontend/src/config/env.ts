/**
 * Frontend Environment Configuration
 * Note: Vite uses import.meta.env instead of process.env
 * Environment variables must be prefixed with VITE_
 */
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  appName: import.meta.env.VITE_APP_NAME || 'ERMS',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
};

