import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../hooks/redux';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  FolderKanban, 
  TrendingUp, 
  FileText,
  Download,
  UserCheck,
  UserX,
  Clock,
  CheckCircle
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardApi, DashboardStats } from '../api/dashboardApi';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user.firstName}!
              </h2>
              <p className="text-gray-600">Here's what's happening with your workspace today.</p>
            </div>
            <button
              onClick={handleExportStats}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Download size={18} />
              Export Report
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Total Employees */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="text-blue-600" size={24} />
                    </div>
                    <TrendingUp className="text-green-500" size={20} />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Total Employees</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.employees.total}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {stats.employees.active} Active
                  </p>
                </div>

                {/* Attendance Today */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <UserCheck className="text-green-600" size={24} />
                    </div>
                    <Calendar className="text-gray-400" size={20} />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Present Today</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.attendance.todayPresent}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {stats.attendance.attendanceRate.toFixed(1)}% Rate
                  </p>
                </div>

                {/* Pending Leaves */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Clock className="text-orange-600" size={24} />
                    </div>
                    <FileText className="text-gray-400" size={20} />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Pending Leaves</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.leaves.pending}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {stats.leaves.approved} Approved
                  </p>
                </div>

                {/* Active Projects */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <FolderKanban className="text-purple-600" size={24} />
                    </div>
                    <CheckCircle className="text-green-500" size={20} />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">Active Projects</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.projects.active}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {stats.projects.completed} Completed
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Department Distribution */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Employees by Department</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.employees.byDepartment}>
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
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects by Status</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.projects.byStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ _id, count }) => `${_id}: ${count}`}
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
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Status Overview</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.attendance.byStatus} layout="vertical">
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

