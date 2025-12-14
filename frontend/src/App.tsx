import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './store';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/Employees/EmployeeList';
import EmployeeForm from './pages/Employees/EmployeeForm';
import EmployeeDetail from './pages/Employees/EmployeeDetail';
import EmployeeCredentials from './pages/Employees/EmployeeCredentials';
import AttendanceList from './pages/Attendance/AttendanceList';
import LeaveList from './pages/Leaves/LeaveList';
import ApplyLeave from './pages/Leaves/ApplyLeave';
import LeaveDetail from './pages/Leaves/LeaveDetail';
import './App.css';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="App min-h-screen bg-gray-50">
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/new" element={<EmployeeForm />} />
        <Route path="/employees/:id" element={<EmployeeDetail />} />
        <Route path="/employees/:id/edit" element={<EmployeeForm />} />
        <Route path="/employees/:id/credentials" element={<EmployeeCredentials />} />
        <Route path="/attendance" element={<AttendanceList />} />
        <Route path="/leaves" element={<LeaveList />} />
        <Route path="/leaves/apply" element={<ApplyLeave />} />
        <Route path="/leaves/:id" element={<LeaveDetail />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;

