import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import employeeReducer from './employeeSlice';
import attendanceReducer from './attendanceSlice';
import leaveReducer from './leaveSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    attendance: attendanceReducer,
    leave: leaveReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

