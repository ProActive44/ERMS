import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import axios from '../../api/axios';

interface CredentialsData {
  email: string;
  username: string;
  role: string;
}

const EmployeeCredentials: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [existingCredentials, setExistingCredentials] = useState<CredentialsData | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchCredentials();
  }, [id]);

  const fetchCredentials = async () => {
    try {
      const response = await axios.get(`/employees/${id}/credentials`);
      if (response.data.data) {
        setExistingCredentials(response.data.data);
        setFormData({
          username: response.data.data.username || '',
          password: '',
          email: response.data.data.email || '',
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch credentials:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(`/employees/${id}/credentials`, formData);
      setMessage({
        type: 'success',
        text: response.data.message || 'Credentials saved successfully',
      });
      
      // Refresh credentials
      await fetchCredentials();
      
      // Clear password field
      setFormData({ ...formData, password: '' });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to save credentials',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Login Credentials</h1>
        <p className="text-gray-600">
          {existingCredentials
            ? 'Update employee login credentials'
            : 'Create login credentials for employee'}
        </p>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <AlertCircle className="text-yellow-400 mr-3 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm text-yellow-700">
              <strong>Temporary Solution:</strong> This credential management interface is a
              workaround for v1.0. In future versions, employees will receive activation emails
              and set their own passwords securely.
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              <strong>Default Password:</strong> If no password is provided, the default password
              is <code className="bg-yellow-100 px-1 py-0.5 rounded">Employee@123</code>
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 mb-6 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Existing Credentials Info */}
      {existingCredentials && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Credentials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{existingCredentials.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="font-medium text-gray-900">{existingCredentials.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-900 capitalize">{existingCredentials.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="employee@company.com"
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              This will be used for login. Usually matches employee's official email.
            </p>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="johndoe"
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Unique username for employee. Can be used for login instead of email.
            </p>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password {!existingCredentials && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={existingCredentials ? 'Leave blank to keep current password' : 'Employee@123'}
                required={!existingCredentials}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {existingCredentials
                ? 'Leave blank to keep the current password. Provide a new password to update.'
                : 'Set a temporary password. Employee should change this on first login.'}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Saving...'
                : existingCredentials
                ? 'Update Credentials'
                : 'Create Credentials'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions for Admin</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Provide these credentials to the employee via secure channel (not email)</li>
          <li>Instruct employee to change password on first login</li>
          <li>Never share passwords via unencrypted communication</li>
          <li>Regularly update credentials for security compliance</li>
        </ul>
      </div>
    </div>
  );
};

export default EmployeeCredentials;
