import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  createEmployee,
  updateEmployee,
  fetchEmployeeById,
  clearCurrentEmployee,
} from '../../store/employeeSlice';
import { EmployeeFormData } from '../../types/employee';
import { ArrowLeft } from 'lucide-react';

// Dummy data for testing - generates unique ID each time
const generateDummyEmployeeData = (): EmployeeFormData => {
  const timestamp = Date.now();
  return {
    employeeId: `EMP${timestamp.toString().slice(-6)}`,
    firstName: 'John',
    lastName: 'Doe',
    email: `john.doe${timestamp}@company.com`,
    phone: `${timestamp.toString().slice(-10)}`,
    dateOfBirth: '1990-01-15',
    gender: 'Male',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    joiningDate: '2020-01-01',
    employmentType: 'Full-Time',
    salary: 75000,
    managerId: '',
    status: 'Active',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '9876543210',
    },
  };
};

const EmployeeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentEmployee, loading } = useAppSelector((state) => state.employees);
  const isEdit = Boolean(id);

  // Generate dummy data only once when component mounts
  const dummyData = React.useMemo(() => generateDummyEmployeeData(), []);

  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchEmployeeById(id));
    }
    return () => {
      dispatch(clearCurrentEmployee());
    };
  }, [dispatch, id, isEdit]);

  const validationSchema = Yup.object({
    employeeId: Yup.string().required('Employee ID is required'),
    firstName: Yup.string().required('First name is required').max(50),
    lastName: Yup.string().required('Last name is required').max(50),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string()
      .matches(/^[0-9]{10,}$/, 'Phone number must be at least 10 digits')
      .required('Phone is required'),
    dateOfBirth: Yup.date().required('Date of birth is required').max(new Date(), 'Invalid date'),
    gender: Yup.string().oneOf(['Male', 'Female', 'Other']).required('Gender is required'),
    address: Yup.object({
      street: Yup.string().required('Street is required'),
      city: Yup.string().required('City is required'),
      state: Yup.string().required('State is required'),
      zipCode: Yup.string().required('Zip code is required'),
      country: Yup.string().required('Country is required'),
    }),
    department: Yup.string().required('Department is required'),
    designation: Yup.string().required('Designation is required'),
    joiningDate: Yup.date().required('Joining date is required'),
    employmentType: Yup.string()
      .oneOf(['Full-Time', 'Part-Time', 'Contract', 'Intern'])
      .required('Employment type is required'),
    salary: Yup.number().min(0, 'Salary must be positive').required('Salary is required'),
    status: Yup.string().oneOf(['Active', 'Inactive', 'On Leave', 'Terminated']),
    emergencyContact: Yup.object({
      name: Yup.string().required('Emergency contact name is required'),
      relationship: Yup.string().required('Relationship is required'),
      phone: Yup.string()
        .matches(/^[0-9]{10,}$/, 'Phone number must be at least 10 digits')
        .required('Emergency contact phone is required'),
    }),
  });

  const formik = useFormik<EmployeeFormData>({
    initialValues: isEdit && currentEmployee ? {
      employeeId: currentEmployee.employeeId,
      firstName: currentEmployee.firstName,
      lastName: currentEmployee.lastName,
      email: currentEmployee.email,
      phone: currentEmployee.phone,
      dateOfBirth: new Date(currentEmployee.dateOfBirth).toISOString().split('T')[0],
      gender: currentEmployee.gender,
      address: {
        street: currentEmployee.address.street,
        city: currentEmployee.address.city,
        state: currentEmployee.address.state,
        zipCode: currentEmployee.address.zipCode,
        country: currentEmployee.address.country,
      },
      department: currentEmployee.department,
      designation: currentEmployee.designation,
      joiningDate: new Date(currentEmployee.joiningDate).toISOString().split('T')[0],
      employmentType: currentEmployee.employmentType,
      salary: currentEmployee.salary,
      managerId: currentEmployee.managerId?._id || '',
      status: currentEmployee.status,
      emergencyContact: {
        name: currentEmployee.emergencyContact.name,
        relationship: currentEmployee.emergencyContact.relationship,
        phone: currentEmployee.emergencyContact.phone,
      },
    } : dummyData,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      // Remove managerId if it's empty
      const submitData = { ...values };
      if (!submitData.managerId || submitData.managerId === '') {
        delete submitData.managerId;
      }

      if (isEdit && id) {
        await dispatch(updateEmployee({ id, data: submitData }));
      } else {
        await dispatch(createEmployee(submitData));
      }
      navigate('/employees');
    },
  });

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
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit Employee' : 'Add New Employee'}
        </h1>
      </div>

      <form onSubmit={formik.handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Basic Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID *
              </label>
              <input
                type="text"
                name="employeeId"
                value={formik.values.employeeId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isEdit}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.employeeId && formik.errors.employeeId
                    ? 'border-red-500'
                    : 'border-gray-300'
                } ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {formik.touched.employeeId && formik.errors.employeeId && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.employeeId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.firstName && formik.errors.firstName
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.lastName && formik.errors.lastName
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.phone && formik.errors.phone
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formik.values.dateOfBirth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.dateOfBirth && formik.errors.dateOfBirth
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.dateOfBirth}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select
                name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.gender && formik.errors.gender
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {formik.touched.gender && formik.errors.gender && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.gender}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street *</label>
              <input
                type="text"
                name="address.street"
                value={formik.values.address.street}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.address?.street && formik.errors.address?.street
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.address?.street && formik.errors.address?.street && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.address.street}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                name="address.city"
                value={formik.values.address.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.address?.city && formik.errors.address?.city
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.address?.city && formik.errors.address?.city && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.address.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input
                type="text"
                name="address.state"
                value={formik.values.address.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.address?.state && formik.errors.address?.state
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.address?.state && formik.errors.address?.state && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.address.state}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
              <input
                type="text"
                name="address.zipCode"
                value={formik.values.address.zipCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.address?.zipCode && formik.errors.address?.zipCode
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.address?.zipCode && formik.errors.address?.zipCode && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.address.zipCode}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <input
                type="text"
                name="address.country"
                value={formik.values.address.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.address?.country && formik.errors.address?.country
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.address?.country && formik.errors.address?.country && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.address.country}</p>
              )}
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Employment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <input
                type="text"
                name="department"
                value={formik.values.department}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.department && formik.errors.department
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.department && formik.errors.department && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation *
              </label>
              <input
                type="text"
                name="designation"
                value={formik.values.designation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.designation && formik.errors.designation
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.designation && formik.errors.designation && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.designation}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date *
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formik.values.joiningDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.joiningDate && formik.errors.joiningDate
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.joiningDate && formik.errors.joiningDate && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.joiningDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type *
              </label>
              <select
                name="employmentType"
                value={formik.values.employmentType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.employmentType && formik.errors.employmentType
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
              {formik.touched.employmentType && formik.errors.employmentType && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.employmentType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary *</label>
              <input
                type="number"
                name="salary"
                value={formik.values.salary}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.salary && formik.errors.salary
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.salary && formik.errors.salary && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.salary}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.status && formik.errors.status
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
              {formik.touched.status && formik.errors.status && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.status}</p>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="emergencyContact.name"
                value={formik.values.emergencyContact.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.emergencyContact?.name &&
                  formik.errors.emergencyContact?.name
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.emergencyContact?.name &&
                formik.errors.emergencyContact?.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.emergencyContact.name}
                  </p>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship *
              </label>
              <input
                type="text"
                name="emergencyContact.relationship"
                value={formik.values.emergencyContact.relationship}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.emergencyContact?.relationship &&
                  formik.errors.emergencyContact?.relationship
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.emergencyContact?.relationship &&
                formik.errors.emergencyContact?.relationship && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.emergencyContact.relationship}
                  </p>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                name="emergencyContact.phone"
                value={formik.values.emergencyContact.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.emergencyContact?.phone &&
                  formik.errors.emergencyContact?.phone
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.emergencyContact?.phone &&
                formik.errors.emergencyContact?.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.emergencyContact.phone}
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formik.isValid}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
