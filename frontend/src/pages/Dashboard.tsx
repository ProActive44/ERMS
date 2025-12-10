import React from 'react';
import { useAppSelector } from '../hooks/redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { useAppDispatch } from '../hooks/redux';

const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">ERMS Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user.firstName} {user.lastName}
              </span>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                {user.role.toUpperCase()}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to ERMS!
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="text-gray-600">
                  <strong>Username:</strong> {user.username}
                </p>
                <p className="text-gray-600">
                  <strong>Role:</strong> {user.role}
                </p>
              </div>
              <p className="text-gray-500 mt-4">
                Your authentication is working! You can now start building your
                ERMS features.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

