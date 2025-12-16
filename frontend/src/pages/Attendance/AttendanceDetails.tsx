import { ArrowLeft, Calendar, Clock, Edit, Trash2, User } from 'lucide-react';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { deleteAttendance, fetchAttendanceById } from '../../store/attendanceSlice';

const AttendanceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentAttendance, loading } = useAppSelector((state) => state.attendance);

  const canManage = user?.role === 'admin' || user?.role === 'hr';

  useEffect(() => {
    if (id) {
      dispatch(fetchAttendanceById(id));
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this attendance record?')) {
      await dispatch(deleteAttendance(id!));
      navigate('/attendance');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Present: 'bg-green-100 text-green-800 border-green-200',
      Absent: 'bg-red-100 text-red-800 border-red-200',
      'Half Day': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Late: 'bg-orange-100 text-orange-800 border-orange-200',
      'On Leave': 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading attendance details...</div>
        </div>
      </div>
    );
  }

  if (!currentAttendance) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Attendance record not found</div>
        </div>
      </div>
    );
  }

  const employee = currentAttendance.employeeId;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/attendance')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft size={20} />
          Back to Attendance List
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Details</h1>
            <p className="text-gray-600">View attendance record information</p>
          </div>
          {canManage && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/attendance/edit/${id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Edit size={18} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Employee Information</h3>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="text-base font-medium text-gray-900">{employee.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-base font-medium text-gray-900">
                  {employee.firstName} {employee.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base font-medium text-gray-900">{employee.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="text-base font-medium text-gray-900">{employee.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Designation</p>
                <p className="text-base font-medium text-gray-900">{employee.designation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Details Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Attendance Record</h3>

            {/* Status Badge */}
            <div className="mb-6">
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusBadge(currentAttendance.status)}`}>
                {currentAttendance.status}
              </span>
            </div>

            {/* Date and Time Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-gray-400" size={20} />
                  <p className="text-sm font-medium text-gray-500">Date</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(currentAttendance.date)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-gray-400" size={20} />
                  <p className="text-sm font-medium text-gray-500">Work Hours</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {currentAttendance.workHours ? `${currentAttendance.workHours.toFixed(2)} hours` : 'In progress'}
                </p>
              </div>
            </div>

            {/* Check-in and Check-out Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Check-in Time</p>
                <div className="flex items-center gap-2">
                  <Clock className="text-green-600" size={20} />
                  <p className="text-xl font-semibold text-gray-900">
                    {formatTime(currentAttendance.checkIn)}
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Check-out Time</p>
                <div className="flex items-center gap-2">
                  <Clock className={currentAttendance.checkOut ? 'text-red-600' : 'text-gray-400'} size={20} />
                  <p className="text-xl font-semibold text-gray-900">
                    {currentAttendance.checkOut ? formatTime(currentAttendance.checkOut) : 'Not checked out yet'}
                  </p>
                </div>
              </div>
            </div>

            {/* Remarks Section */}
            {currentAttendance.remarks && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Remarks</h4>
                <p className="text-gray-900">{currentAttendance.remarks}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <p className="font-medium mb-1">Created At</p>
                  <p>{new Date(currentAttendance.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Last Updated</p>
                  <p>{new Date(currentAttendance.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetails;
