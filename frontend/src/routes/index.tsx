import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthRoutes from './AuthRoutes';
import DashboardRoutes from './DashboardRoutes';
import EmployeeRoutes from './EmployeeRoutes';
import AttendanceRoutes from './AttendanceRoutes';
import LeaveRoutes from './LeaveRoutes';
import ProjectRoutes from './ProjectRoutes';
import TaskRoutes from './TaskRoutes';
import ReportRoutes from './ReportRoutes';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      {AuthRoutes()}
      {DashboardRoutes()}
      {EmployeeRoutes()}
      {AttendanceRoutes()}
      {LeaveRoutes()}
      {ProjectRoutes()}
      {TaskRoutes()}
      {ReportRoutes()}
    </Routes>
  );
};

export default AppRoutes;
