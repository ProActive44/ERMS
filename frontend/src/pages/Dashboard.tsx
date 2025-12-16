import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  FolderKanban,
  TrendingUp,
  UserCheck,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { dashboardApi, DashboardStats } from '../api/dashboardApi';
import { useAppSelector } from '../hooks/redux';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface ChartDataItem {
  _id: string;
  count: number;
  [key: string]: string | number;
}

const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: Record<string, string | number>[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportStats = () => {
    if (!stats) return;
    
    const exportData = [
      { Metric: 'Total Employees', Value: stats.employees.total },
      { Metric: 'Active Employees', Value: stats.employees.active },
      { Metric: 'Today Present', Value: stats.attendance.todayPresent },
      { Metric: 'Today Absent', Value: stats.attendance.todayAbsent },
      { Metric: 'Attendance Rate', Value: `${stats.attendance.attendanceRate}%` },
      { Metric: 'Pending Leaves', Value: stats.leaves.pending },
      { Metric: 'Active Projects', Value: stats.projects.active },
      { Metric: 'Completed Projects', Value: stats.projects.completed },
    ];
    
    exportToCSV(exportData, 'dashboard-summary');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-primary-400 opacity-20 mx-auto"></div>
          </div>
          <p className="text-gray-700 font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 animate-fade-in">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-down">
            <div>
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-secondary-600 to-purple-600 mb-2">
                Welcome back, {user.firstName}! 👋
              </h2>
              <p className="text-gray-600 text-lg">Here's what's happening with your workspace today.</p>
            </div>
            <button
              onClick={handleExportStats}
              className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Download size={18} />
              Export Report
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Employees */}
                <div className="stat-card hover-lift group animate-slide-up">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <Users className="text-white" size={24} />
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <TrendingUp className="text-green-600" size={20} />
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-semibold mb-2 uppercase tracking-wide">Total Employees</h3>
                  <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">{stats.employees.total}</p>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      {stats.employees.active} Active
                    </p>
                  </div>
                </div>

                {/* Attendance Today */}
                <div className="stat-card hover-lift group animate-slide-up animation-delay-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <UserCheck className="text-white" size={24} />
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Calendar className="text-blue-500" size={20} />
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-semibold mb-2 uppercase tracking-wide">Present Today</h3>
                  <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">{stats.attendance.todayPresent}</p>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="text-green-600 font-semibold">{stats.attendance.attendanceRate.toFixed(1)}%</span> Attendance Rate
                    </p>
                  </div>
                </div>

                {/* Pending Leaves */}
                <div className="stat-card hover-lift group animate-slide-up animation-delay-400">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <Clock className="text-white" size={24} />
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <FileText className="text-orange-500" size={20} />
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-semibold mb-2 uppercase tracking-wide">Pending Leaves</h3>
                  <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-800">{stats.leaves.pending}</p>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="text-green-600 font-semibold">{stats.leaves.approved}</span> Approved
                    </p>
                  </div>
                </div>

                {/* Active Projects */}
                <div className="stat-card hover-lift group animate-slide-up animation-delay-600">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <FolderKanban className="text-white" size={24} />
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="text-green-500" size={20} />
                    </div>
                  </div>
                  <h3 className="text-gray-500 text-sm font-semibold mb-2 uppercase tracking-wide">Active Projects</h3>
                  <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-800">{stats.projects.active}</p>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="text-green-600 font-semibold">{stats.projects.completed}</span> Completed
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Department Distribution */}
                <div className="card-gradient p-6 hover-lift animate-scale-in">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-primary-600 to-secondary-600 rounded-full"></div>
                    Employees by Department
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.employees.byDepartment as ChartDataItem[]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3B82F6" name="Employees" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Project Status Distribution */}
                <div className="card-gradient p-6 hover-lift animate-scale-in animation-delay-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                    Projects by Status
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.projects.byStatus as ChartDataItem[]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }: { name?: string; value?: number }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="_id"
                      >
                        {stats.projects.byStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Attendance Status */}
              <div className="card-gradient p-6 mb-8 hover-lift animate-slide-up">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                  Attendance Status Overview
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.attendance.byStatus as ChartDataItem[]} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="_id" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#10B981" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
            
            <div className="card-gradient p-6 mb-8 hover-lift animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></div>
                Your Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 font-medium mb-1">Email</p>
                  <p className="text-gray-900 font-semibold">{user.email}</p>
                </div>
                <div className="bg-white/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 font-medium mb-1">Username</p>
                  <p className="text-gray-900 font-semibold">{user.username}</p>
                </div>
                <div className="bg-white/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 font-medium mb-1">Full Name</p>
                  <p className="text-gray-900 font-semibold">{user.firstName} {user.lastName}</p>
                </div>
                <div className="bg-white/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 font-medium mb-1">Role</p>
                  <p className="text-primary-600 font-bold capitalize">{user.role || 'employee'}</p>
                </div>
              </div>
            </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/employees')}
              className="card-hover p-6 text-left group animate-slide-up"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Users className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                  Employee Management
                </h3>
              </div>
              <p className="text-gray-600">
                View and manage employee records, add new employees, and update
                information.
              </p>
            </button>

            <button
              onClick={() => navigate('/attendance')}
              className="card-hover p-6 text-left group animate-slide-up animation-delay-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-green-400 to-green-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Calendar className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  Attendance
                </h3>
              </div>
              <p className="text-gray-600">
                Track employee attendance, check-in/check-out times, and monitor work hours.
              </p>
            </button>

            <button
              onClick={() => navigate('/leaves')}
              className="card-hover p-6 text-left group animate-slide-up animation-delay-400"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg group-hover:scale-110 transition-transform">
                  <FileText className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                  Leave Management
                </h3>
              </div>
              <p className="text-gray-600">
                Apply for leaves, manage leave requests, and track leave balances.
              </p>
            </button>

            <button
              onClick={() => navigate('/projects')}
              className="card-hover p-6 text-left group animate-slide-up animation-delay-600"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                  <FolderKanban className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  Projects
                </h3>
              </div>
              <p className="text-gray-600">
                Manage projects, track progress, and collaborate with teams.
              </p>
            </button>

            <button
              onClick={() => navigate('/tasks')}
              className="card-hover p-6 text-left group animate-slide-up animation-delay-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                  <FolderKanban className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  Task Board
                </h3>
              </div>
              <p className="text-gray-600">
                View and manage tasks with Kanban board, assign work, and track completion.
              </p>
            </button>

            <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-xl shadow-soft text-left cursor-not-allowed group animate-slide-up animation-delay-400">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-400/20 to-secondary-400/20 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gray-300 rounded-lg">
                    <TrendingUp className="text-gray-500" size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-700">
                    Payroll
                  </h3>
                </div>
                <p className="text-gray-500">
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">Coming Soon</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

