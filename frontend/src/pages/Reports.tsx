/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Download, FileText, Calendar, Users, Clock } from 'lucide-react';
import api from '../api/axios';

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    reportType: 'attendance',
    startDate: '',
    endDate: '',
    department: '',
    format: 'csv',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    ).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateAttendanceReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await api.get(`/attendance?${params.toString()}&limit=1000`);
      const attendanceData = response.data.data.attendance;
      
      const reportData = attendanceData.map((record: any) => ({
        Date: new Date(record.date).toLocaleDateString(),
        'Employee ID': record.employeeId.employeeId,
        'Employee Name': `${record.employeeId.firstName} ${record.employeeId.lastName}`,
        Department: record.employeeId.department,
        'Check In': new Date(record.checkIn).toLocaleTimeString(),
        'Check Out': record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'N/A',
        'Work Hours': record.workHours ? record.workHours.toFixed(2) : '0',
        Status: record.status,
        Remarks: record.remarks || '',
      }));
      
      exportToCSV(reportData, 'attendance-report');
    } catch (error) {
      console.error('Failed to generate attendance report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const generateEmployeeReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.department) params.append('department', filters.department);
      
      const response = await api.get(`/employees?${params.toString()}&limit=1000`);
      const employees = response.data.data.employees;
      
      const reportData = employees.map((emp: any) => ({
        'Employee ID': emp.employeeId,
        'First Name': emp.firstName,
        'Last Name': emp.lastName,
        Email: emp.email,
        Phone: emp.phone || '',
        Department: emp.department,
        Designation: emp.designation,
        'Employment Type': emp.employmentType,
        Status: emp.status,
        'Join Date': new Date(emp.dateOfJoining).toLocaleDateString(),
        'Date of Birth': emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString() : '',
      }));
      
      exportToCSV(reportData, 'employee-report');
    } catch (error) {
      console.error('Failed to generate employee report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const generateLeaveReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await api.get(`/leaves?${params.toString()}&limit=1000`);
      const leaves = response.data.data.leaves;
      
      const reportData = leaves.map((leave: any) => ({
        'Employee ID': leave.employeeId.employeeId,
        'Employee Name': `${leave.employeeId.firstName} ${leave.employeeId.lastName}`,
        Department: leave.employeeId.department,
        'Leave Type': leave.leaveType,
        'Start Date': new Date(leave.startDate).toLocaleDateString(),
        'End Date': new Date(leave.endDate).toLocaleDateString(),
        Days: leave.totalDays,
        Reason: leave.reason,
        Status: leave.status,
        'Applied On': new Date(leave.createdAt).toLocaleDateString(),
      }));
      
      exportToCSV(reportData, 'leave-report');
    } catch (error) {
      console.error('Failed to generate leave report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const generateProjectReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects?limit=1000');
      const projects = response.data.data.projects;
      
      const reportData = projects.map((project: any) => ({
        'Project Name': project.name,
        Description: project.description || '',
        Status: project.status,
        Priority: project.priority,
        'Start Date': new Date(project.startDate).toLocaleDateString(),
        'End Date': project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing',
        'Team Size': project.teamMembers?.length || 0,
        'Created On': new Date(project.createdAt).toLocaleDateString(),
      }));
      
      exportToCSV(reportData, 'project-report');
    } catch (error) {
      console.error('Failed to generate project report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    switch (filters.reportType) {
      case 'attendance':
        generateAttendanceReport();
        break;
      case 'employees':
        generateEmployeeReport();
        break;
      case 'leaves':
        generateLeaveReport();
        break;
      case 'projects':
        generateProjectReport();
        break;
      default:
        alert('Please select a report type');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Generate and export comprehensive reports</p>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => setFilters({ ...filters, reportType: 'attendance' })}
          className={`cursor-pointer rounded-lg shadow p-6 transition ${
            filters.reportType === 'attendance' 
              ? 'bg-blue-50 border-2 border-blue-500' 
              : 'bg-white hover:shadow-lg'
          }`}
        >
          <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
            <Clock className="text-blue-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Attendance Report</h3>
          <p className="text-sm text-gray-600">Employee attendance records with check-in/out times</p>
        </div>

        <div 
          onClick={() => setFilters({ ...filters, reportType: 'employees' })}
          className={`cursor-pointer rounded-lg shadow p-6 transition ${
            filters.reportType === 'employees' 
              ? 'bg-green-50 border-2 border-green-500' 
              : 'bg-white hover:shadow-lg'
          }`}
        >
          <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
            <Users className="text-green-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Employee Report</h3>
          <p className="text-sm text-gray-600">Complete employee directory with details</p>
        </div>

        <div 
          onClick={() => setFilters({ ...filters, reportType: 'leaves' })}
          className={`cursor-pointer rounded-lg shadow p-6 transition ${
            filters.reportType === 'leaves' 
              ? 'bg-orange-50 border-2 border-orange-500' 
              : 'bg-white hover:shadow-lg'
          }`}
        >
          <div className="p-3 bg-orange-100 rounded-lg w-fit mb-4">
            <Calendar className="text-orange-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Leave Report</h3>
          <p className="text-sm text-gray-600">Leave applications and approval status</p>
        </div>

        <div 
          onClick={() => setFilters({ ...filters, reportType: 'projects' })}
          className={`cursor-pointer rounded-lg shadow p-6 transition ${
            filters.reportType === 'projects' 
              ? 'bg-purple-50 border-2 border-purple-500' 
              : 'bg-white hover:shadow-lg'
          }`}
        >
          <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
            <FileText className="text-purple-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Report</h3>
          <p className="text-sm text-gray-600">Project status and team allocation</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(filters.reportType === 'attendance' || filters.reportType === 'leaves') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
          
          {filters.reportType === 'employees' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                name="department"
                value={filters.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Generate {filters.reportType.charAt(0).toUpperCase() + filters.reportType.slice(1)} Report
            </h3>
            <p className="text-sm text-gray-600">
              Export will be downloaded as a CSV file
            </p>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Download size={20} />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
