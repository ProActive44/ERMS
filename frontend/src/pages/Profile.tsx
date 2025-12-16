import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { updateUserProfile } from '../store/authSlice';
import { toast } from 'react-toastify';
import { User, Mail, Shield, Calendar, Edit2, Save, X } from 'lucide-react';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'Failed to update profile';
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      username: user?.username || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600 mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 text-lg">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card-gradient p-6 text-center animate-slide-up sticky top-24">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full blur-lg opacity-50"></div>
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 via-purple-500 to-secondary-500 flex items-center justify-center text-white font-bold shadow-xl text-5xl ring-4 ring-white mx-auto">
                  {user.firstName[0].toUpperCase()}{user.lastName[0].toUpperCase()}
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-primary-600 font-semibold capitalize mb-4 flex items-center justify-center gap-2">
                <Shield size={16} />
                {user.role}
              </p>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={18} className="text-gray-400" />
                    <span className="text-gray-700 font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User size={18} className="text-gray-400" />
                    <span className="text-gray-700 font-medium">@{user.username}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={18} className="text-gray-400" />
                    <span className="text-gray-700 font-medium">
                      Joined {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="card-gradient p-8 animate-slide-up animation-delay-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-8 bg-gradient-to-b from-primary-600 to-secondary-600 rounded-full"></div>
                  Personal Information
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="btn-success flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={18} />
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn-outline flex items-center gap-2"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="input"
                      placeholder="First Name"
                    />
                  ) : (
                    <div className="bg-white/50 px-4 py-3 rounded-lg border border-gray-200">
                      <p className="text-gray-900 font-medium">{user.firstName}</p>
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="input"
                      placeholder="Last Name"
                    />
                  ) : (
                    <div className="bg-white/50 px-4 py-3 rounded-lg border border-gray-200">
                      <p className="text-gray-900 font-medium">{user.lastName}</p>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                      placeholder="Email"
                    />
                  ) : (
                    <div className="bg-white/50 px-4 py-3 rounded-lg border border-gray-200">
                      <p className="text-gray-900 font-medium">{user.email}</p>
                    </div>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="input"
                      placeholder="Username"
                    />
                  ) : (
                    <div className="bg-white/50 px-4 py-3 rounded-lg border border-gray-200">
                      <p className="text-gray-900 font-medium">{user.username}</p>
                    </div>
                  )}
                </div>

                {/* Role (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="bg-white/50 px-4 py-3 rounded-lg border border-gray-200">
                    <p className="text-primary-600 font-bold capitalize">{user.role}</p>
                  </div>
                </div>

                {/* User ID (Read-only) */}
                {/* <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    User ID
                  </label>
                  <div className="bg-white/50 px-4 py-3 rounded-lg border border-gray-200">
                    <p className="text-gray-900 font-medium font-mono text-sm">{user._id}</p>
                  </div>
                </div> */}
              </div>

              {/* Additional Information */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Account Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <p className="text-green-700 font-bold">Active</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Last Login</p>
                    <p className="text-blue-700 font-bold">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
