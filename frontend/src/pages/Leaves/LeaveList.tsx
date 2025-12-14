import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchLeaves,
  fetchLeaveBalance,
  deleteLeave,
  updateLeaveStatus,
  setFilters,
} from '../../store/leaveSlice';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { LeaveFilters } from '../../types/leave';

const LeaveList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { leaves, leaveBalance, loading, pagination, filters } = useAppSelector(
    (state) => state.leave
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<LeaveFilters>(filters);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const canManage = user?.role === 'admin' || user?.role === 'hr';

  useEffect(() => {
    dispatch(fetchLeaves({ filters, page: pagination.page, limit: pagination.limit }));
    dispatch(fetchLeaveBalance());
  }, [dispatch, filters, pagination.page, pagination.limit]);

  const handleSearch = () => {
    dispatch(setFilters({ ...localFilters }));
    dispatch(fetchLeaves({ filters: localFilters, page: 1, limit: pagination.limit }));
  };

  const handleApprove = async (id: string) => {
    if (confirm('Are you sure you want to approve this leave?')) {
      await dispatch(updateLeaveStatus({ id, status: 'Approved' }));
      dispatch(fetchLeaves({ filters, page: pagination.page, limit: pagination.limit }));
    }
  };

  const handleReject = (id: string) => {
    setSelectedLeaveId(id);
    setShowApprovalModal(true);
  };

  const handleRejectConfirm = async () => {
    if (selectedLeaveId) {
      await dispatch(
        updateLeaveStatus({
          id: selectedLeaveId,
          status: 'Rejected',
          rejectionReason,
        })
      );
      dispatch(fetchLeaves({ filters, page: pagination.page, limit: pagination.limit }));
      setShowApprovalModal(false);
      setSelectedLeaveId(null);
      setRejectionReason('');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this leave?')) {
      await dispatch(deleteLeave(id));
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave Management</h1>
        <p className="text-gray-600">Manage employee leave requests and balances</p>
      </div>

      {/* Leave Balance Card */}
      {leaveBalance && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave Balance</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Sick Leave</p>
              <p className="text-2xl font-bold text-blue-600">
                {leaveBalance.sickLeave.available}
              </p>
              <p className="text-xs text-gray-500">
                of {leaveBalance.sickLeave.total} days
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Casual Leave</p>
              <p className="text-2xl font-bold text-green-600">
                {leaveBalance.casualLeave.available}
              </p>
              <p className="text-xs text-gray-500">
                of {leaveBalance.casualLeave.total} days
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Earned Leave</p>
              <p className="text-2xl font-bold text-purple-600">
                {leaveBalance.earnedLeave.available}
              </p>
              <p className="text-xs text-gray-500">
                of {leaveBalance.earnedLeave.total} days
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Maternity Leave</p>
              <p className="text-2xl font-bold text-pink-600">
                {leaveBalance.maternityLeave.available}
              </p>
              <p className="text-xs text-gray-500">
                of {leaveBalance.maternityLeave.total} days
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Paternity Leave</p>
              <p className="text-2xl font-bold text-indigo-600">
                {leaveBalance.paternityLeave.available}
              </p>
              <p className="text-xs text-gray-500">
                of {leaveBalance.paternityLeave.total} days
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Unpaid Leave</p>
              <p className="text-2xl font-bold text-gray-600">
                {leaveBalance.unpaidLeave.used}
              </p>
              <p className="text-xs text-gray-500">days taken</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search leaves..."
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
          <button
            onClick={() => navigate('/leaves/apply')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={20} />
            Apply Leave
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={localFilters.status || ''}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, status: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
              <select
                value={localFilters.leaveType || ''}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, leaveType: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Earned Leave">Earned Leave</option>
                <option value="Maternity Leave">Maternity Leave</option>
                <option value="Paternity Leave">Paternity Leave</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={localFilters.startDate || ''}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={localFilters.endDate || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-full flex gap-2">
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
                  dispatch(fetchLeaves({ filters: {}, page: 1, limit: pagination.limit }));
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Leaves Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No leave requests found</p>
            <button
              onClick={() => navigate('/leaves/apply')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Apply for Leave
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {canManage && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-gray-50">
                      {canManage && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {leave.employeeId.firstName} {leave.employeeId.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {leave.employeeId.employeeId}
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{leave.leaveType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {leave.numberOfDays} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                            leave.status
                          )}`}
                        >
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(leave.appliedDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/leaves/${leave._id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {canManage && leave.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(leave._id)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(leave._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          {(user?.role === 'admin' || leave.status === 'Pending') && (
                            <button
                              onClick={() => handleDelete(leave._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    dispatch(
                      fetchLeaves({
                        filters,
                        page: pagination.page - 1,
                        limit: pagination.limit,
                      })
                    )
                  }
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    dispatch(
                      fetchLeaves({
                        filters,
                        page: pagination.page + 1,
                        limit: pagination.limit,
                      })
                    )
                  }
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() =>
                        dispatch(
                          fetchLeaves({
                            filters,
                            page: pagination.page - 1,
                            limit: pagination.limit,
                          })
                        )
                      }
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        dispatch(
                          fetchLeaves({
                            filters,
                            page: pagination.page + 1,
                            limit: pagination.limit,
                          })
                        )
                      }
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Rejection Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Leave Request</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedLeaveId(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveList;
