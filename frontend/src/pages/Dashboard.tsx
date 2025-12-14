import React from 'react';
import { useAppSelector } from '../hooks/redux';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.firstName}!
            </h2>
            <p className="text-gray-600 mb-6">Here's what's happening with your workspace today.</p>
            
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="text-gray-900 font-medium">{user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-gray-900 font-medium">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-gray-900 font-medium capitalize">{user.role || 'employee'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/employees')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Employee Management
              </h3>
              <p className="text-gray-600">
                View and manage employee records, add new employees, and update
                information.
              </p>
            </button>

            <button
              onClick={() => navigate('/attendance')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Attendance
              </h3>
              <p className="text-gray-600">
                Track employee attendance, check-in/check-out times, and monitor work hours.
              </p>
            </button>

            <button
              onClick={() => navigate('/leaves')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Leave Management
              </h3>
              <p className="text-gray-600">
                Apply for leaves, manage leave requests, and track leave balances.
              </p>
            </button>

            <button
              onClick={() => navigate('/projects')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Projects
              </h3>
              <p className="text-gray-600">
                Manage projects, track progress, and collaborate with teams.
              </p>
            </button>

            <button
              onClick={() => navigate('/tasks')}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Task Board
              </h3>
              <p className="text-gray-600">
                View and manage tasks with Kanban board, assign work, and track completion.
              </p>
            </button>

            <div className="bg-gray-100 p-6 rounded-lg shadow text-left opacity-50 cursor-not-allowed">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payroll
              </h3>
              <p className="text-gray-600">Coming soon...</p>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg shadow text-left opacity-50 cursor-not-allowed">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reports
              </h3>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

