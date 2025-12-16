import { Clock, Eye, Filter, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  checkIn,
  checkOut,
  deleteAttendance,
  fetchAttendance,
  fetchTodayAttendance,
  setFilters,
} from '../../store/attendanceSlice';
import { fetchEmployees } from '../../store/employeeSlice';
import { AttendanceFilters } from '../../types/attendance';

const AttendanceList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { attendance, todayAttendance, loading, pagination, filters } = useAppSelector(
    (state) => state.attendance
  );
  const { employees } = useAppSelector((state) => state.employees);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<AttendanceFilters>(filters);
  const [selectedEmployeesForCheckIn, setSelectedEmployeesForCheckIn] = useState<string[]>([]);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');

  const canManage = user?.role === 'admin' || user?.role === 'hr';

  useEffect(() => {
    dispatch(fetchAttendance({ filters, page: pagination.page, limit: pagination.limit }));
    dispatch(fetchEmployees({ page: 1, limit: 100 }));
  }, [dispatch, filters, pagination.page, pagination.limit]);

  useEffect(() => {
    // Fetch today's attendance for current user (backend will find employee by userId)
    dispatch(fetchTodayAttendance('current'));
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(setFilters({ ...localFilters }));
    dispatch(fetchAttendance({ filters: localFilters, page: 1, limit: pagination.limit }));
  };

  const handleCheckIn = async () => {
    if (canManage && selectedEmployeesForCheckIn.length > 0) {
      // Check in multiple employees
      for (const employeeId of selectedEmployeesForCheckIn) {
        await dispatch(checkIn({ employeeId }));
      }
      setSelectedEmployeesForCheckIn([]);
      setShowEmployeeSelector(false);
    } else {
      // Check in current user
      await dispatch(checkIn({ employeeId: '' }));
    }
    
    dispatch(fetchAttendance({ filters, page: pagination.page, limit: pagination.limit }));
    dispatch(fetchTodayAttendance('current'));
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployeesForCheckIn(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName} ${emp.employeeId}`
      .toLowerCase()
      .includes(employeeSearchTerm.toLowerCase())
  );

  const handleCheckOut = async (id: string) => {
    if (confirm('Are you sure you want to check out?')) {
      await dispatch(checkOut({ id, data: {} }));
      dispatch(fetchAttendance({ filters, page: pagination.page, limit: pagination.limit }));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this attendance record?')) {
      await dispatch(deleteAttendance(id));
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Present: 'bg-green-100 text-green-800',
      Absent: 'bg-red-100 text-red-800',
      'Half Day': 'bg-yellow-100 text-yellow-800',
      Late: 'bg-orange-100 text-orange-800',
      'On Leave': 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Management</h1>
        <p className="text-gray-600">Track and manage employee attendance records</p>
      </div>

      {/* Today's Status Card */}
      {todayAttendance && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Check-in Time</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatTime(todayAttendance.checkIn)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Check-out Time</p>
              <p className="text-lg font-semibold text-gray-900">
                {todayAttendance.checkOut ? formatTime(todayAttendance.checkOut) : 'Not yet'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Work Hours</p>
              <p className="text-lg font-semibold text-gray-900">
                {todayAttendance.workHours ? `${todayAttendance.workHours.toFixed(2)} hrs` : 'In progress'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(todayAttendance.status)}`}>
                {todayAttendance.status}
              </span>
            </div>
          </div>
          {!todayAttendance.checkOut && (
            <button
              onClick={() => handleCheckOut(todayAttendance._id)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Check Out
            </button>
          )}
        </div>
      )}

      {/* Quick Check-in */}
      {!todayAttendance && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Check-in</h2>
          {canManage ? (
            <div>
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setShowEmployeeSelector(!showEmployeeSelector)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-left flex items-center justify-between"
                >
                  <span className="text-gray-700">
                    {selectedEmployeesForCheckIn.length === 0
                      ? 'Select Employees'
                      : `${selectedEmployeesForCheckIn.length} employee(s) selected`}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${showEmployeeSelector ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleCheckIn}
                  disabled={selectedEmployeesForCheckIn.length === 0 || loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Clock size={20} />
                  Check In ({selectedEmployeesForCheckIn.length})
                </button>
              </div>
              
              {/* Employee Selector Dropdown */}
              {showEmployeeSelector && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={employeeSearchTerm}
                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredEmployees.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No employees found</p>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <label
                          key={emp._id}
                          className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition"
                        >
                          <input
                            type="checkbox"
                            checked={selectedEmployeesForCheckIn.includes(emp._id)}
                            onChange={() => toggleEmployeeSelection(emp._id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {emp.employeeId} - {emp.department}
                            </p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                    <button
                      onClick={() => setSelectedEmployeesForCheckIn(filteredEmployees.map(e => e._id))}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedEmployeesForCheckIn([])}
                      className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Clock size={20} />
              Check In Now
            </button>
          )}
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by employee name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <Filter size={20} />
            Filters
          </button>
          {canManage && (
            <button
              onClick={() => navigate('/attendance/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus size={20} />
              Add Record
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                value={localFilters.employeeId || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, employeeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={localFilters.startDate || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={localFilters.endDate || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={localFilters.status || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, status: (e.target.value || undefined) as 'Present' | 'Absent' | 'Half Day' | 'Late' | 'On Leave' | undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="Late">Late</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
            <div className="md:col-span-4 flex gap-2">
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setLocalFilters({});
                  dispatch(setFilters({}));
                  dispatch(fetchAttendance({ filters: {}, page: 1, limit: pagination.limit }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.employeeId.firstName} {record.employeeId.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{record.employeeId.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(record.checkIn)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.checkOut ? formatTime(record.checkOut) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.workHours ? `${record.workHours.toFixed(2)} hrs` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/attendance/${record._id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        {canManage && (
                          <button
                            onClick={() => navigate(`/attendance/edit/${record._id}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                        {!record.checkOut && (
                          <button
                            onClick={() => handleCheckOut(record._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Check Out"
                          >
                            <Clock size={18} />
                          </button>
                        )}
                        {canManage && (
                          <button
                            onClick={() => handleDelete(record._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => dispatch(fetchAttendance({ filters, page: pagination.page - 1, limit: pagination.limit }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => dispatch(fetchAttendance({ filters, page: pagination.page + 1, limit: pagination.limit }))}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceList;
