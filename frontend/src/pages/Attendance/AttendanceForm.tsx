import { ArrowLeft, Calendar, Clock, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createAttendance, fetchAttendanceById, updateAttendance } from '../../store/attendanceSlice';
import { fetchEmployees } from '../../store/employeeSlice';
import { AttendanceFormData } from '../../types/attendance';

const AttendanceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentAttendance, loading } = useAppSelector((state) => state.attendance);
  const { employees } = useAppSelector((state) => state.employees);

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<AttendanceFormData>({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'Present',
    remarks: '',
  });

  useEffect(() => {
    dispatch(fetchEmployees({ page: 1, limit: 100 }));
    if (id) {
      dispatch(fetchAttendanceById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (isEditMode && currentAttendance) {
      setFormData({
        employeeId: currentAttendance.employeeId._id,
        date: new Date(currentAttendance.date).toISOString().split('T')[0],
        checkIn: new Date(currentAttendance.checkIn).toTimeString().slice(0, 5),
        checkOut: currentAttendance.checkOut ? new Date(currentAttendance.checkOut).toTimeString().slice(0, 5) : '',
        status: currentAttendance.status,
        remarks: currentAttendance.remarks || '',
      });
    }
  }, [isEditMode, currentAttendance]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse date components to ensure UTC midnight
    const [year, month, day] = formData.date.split('-').map(Number);
    const dateAtMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    
    // Convert to ISO 8601 format with timezone
    const submitData: AttendanceFormData = {
      employeeId: formData.employeeId,
      date: dateAtMidnight.toISOString(),
      checkIn: new Date(`${formData.date}T${formData.checkIn}:00`).toISOString(),
      checkOut: formData.checkOut ? new Date(`${formData.date}T${formData.checkOut}:00`).toISOString() : undefined,
      status: formData.status,
      remarks: formData.remarks,
    };

    try {
      if (isEditMode && id) {
        await dispatch(updateAttendance({ id, data: submitData })).unwrap();
      } else {
        await dispatch(createAttendance(submitData)).unwrap();
      }
      // Only navigate if submission was successful
      navigate('/attendance');
    } catch (error) {
      // Error is already handled by Redux slice and shown in toast
      // Stay on the form page
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditMode ? 'Edit Attendance Record' : 'Add Attendance Record'}
        </h1>
        <p className="text-gray-600">
          {isEditMode ? 'Update the attendance record details' : 'Create a new attendance record'}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee */}
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                disabled={isEditMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.employeeId} - {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="text-gray-400" size={20} />
                </div>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  disabled={isEditMode}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Check-in Time */}
            <div>
              <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-2">
                Check-in Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="text-gray-400" size={20} />
                </div>
                <input
                  type="time"
                  id="checkIn"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Check-out Time */}
            <div>
              <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-2">
                Check-out Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="text-gray-400" size={20} />
                </div>
                <input
                  type="time"
                  id="checkOut"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="Late">Late</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any additional notes or remarks..."
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={18} />
              {isEditMode ? 'Update Record' : 'Create Record'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/attendance')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceForm;
