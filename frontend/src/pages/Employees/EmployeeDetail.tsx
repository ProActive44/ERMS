import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchEmployeeById,
  deleteEmployee,
  clearCurrentEmployee,
} from '../../store/employeeSlice';
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Calendar, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentEmployee, loading } = useAppSelector((state) => state.employees);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchEmployeeById(id));
    }
    return () => {
      dispatch(clearCurrentEmployee());
    };
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (id && window.confirm('Are you sure you want to delete this employee?')) {
      await dispatch(deleteEmployee(id));
      navigate('/employees');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'Terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canManage = user?.role === 'Admin' || user?.role === 'HR';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentEmployee) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Employee not found</p>
          <button
            onClick={() => navigate('/employees')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/employees')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Employees
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {currentEmployee.firstName} {currentEmployee.lastName}
              </h1>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                  currentEmployee.status
                )}`}
              >
                {currentEmployee.status}
              </span>
            </div>
            <p className="text-gray-600 text-lg">{currentEmployee.designation}</p>
            <p className="text-gray-500">{currentEmployee.department}</p>
          </div>
          {canManage && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/employees/${id}/edit`)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Edit size={18} />
                Edit
              </button>
              {user?.role === 'Admin' && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="text-gray-900 font-medium">{currentEmployee.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="text-gray-900 font-medium">{currentEmployee.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="text-gray-900 font-medium">
                  {format(new Date(currentEmployee.dateOfBirth), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="text-gray-900 font-medium">
                  {new Date().getFullYear() -
                    new Date(currentEmployee.dateOfBirth).getFullYear()}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a
                    href={`mailto:${currentEmployee.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {currentEmployee.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <a
                    href={`tel:${currentEmployee.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {currentEmployee.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900">
                    {currentEmployee.address.street}
                    <br />
                    {currentEmployee.address.city}, {currentEmployee.address.state}{' '}
                    {currentEmployee.address.zipCode}
                    <br />
                    {currentEmployee.address.country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Employment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="text-gray-900 font-medium">{currentEmployee.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Designation</p>
                <p className="text-gray-900 font-medium">{currentEmployee.designation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Employment Type</p>
                <p className="text-gray-900 font-medium">{currentEmployee.employmentType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Joining Date</p>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <Calendar size={16} />
                  {format(new Date(currentEmployee.joiningDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Salary</p>
                <p className="text-gray-900 font-medium">
                  ${currentEmployee.salary.toLocaleString()}
                </p>
              </div>
              {currentEmployee.managerId && (
                <div>
                  <p className="text-sm text-gray-500">Manager</p>
                  <p className="text-gray-900 font-medium">
                    {currentEmployee.managerId.firstName}{' '}
                    {currentEmployee.managerId.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {currentEmployee.managerId.designation}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-gray-900 font-medium">
                  {currentEmployee.emergencyContact.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Relationship</p>
                <p className="text-gray-900 font-medium">
                  {currentEmployee.emergencyContact.relationship}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <a
                  href={`tel:${currentEmployee.emergencyContact.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {currentEmployee.emergencyContact.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Briefcase className="text-blue-600" size={24} />
                <div>
                  <p className="text-sm text-gray-500">Employment Type</p>
                  <p className="text-gray-900 font-medium">
                    {currentEmployee.employmentType}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Calendar className="text-green-600" size={24} />
                <div>
                  <p className="text-sm text-gray-500">Time with Company</p>
                  <p className="text-gray-900 font-medium">
                    {Math.floor(
                      (new Date().getTime() -
                        new Date(currentEmployee.joiningDate).getTime()) /
                        (1000 * 60 * 60 * 24 * 365)
                    )}{' '}
                    years
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              System Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="text-gray-900 text-sm">
                  {format(new Date(currentEmployee.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-gray-900 text-sm">
                  {format(new Date(currentEmployee.updatedAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              {currentEmployee.createdBy && (
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="text-gray-900 text-sm">
                    {currentEmployee.createdBy.firstName}{' '}
                    {currentEmployee.createdBy.lastName}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
