import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchLeaveById, updateLeaveStatus, clearCurrentLeave } from '../../store/leaveSlice';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const LeaveDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentLeave, loading } = useAppSelector((state) => state.leave);
  const { user } = useAppSelector((state) => state.auth);

  const canManage = user?.role === 'admin' || user?.role === 'hr';

  useEffect(() => {
    if (id) {
      dispatch(fetchLeaveById(id));
    }
    return () => {
      dispatch(clearCurrentLeave());
    };
  }, [dispatch, id]);

  const handleApprove = async () => {
    if (id && confirm('Are you sure you want to approve this leave?')) {
      await dispatch(updateLeaveStatus({ id, status: 'Approved' }));
      navigate('/leaves');
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please enter rejection reason:');
    if (id && reason) {
      await dispatch(updateLeaveStatus({ id, status: 'Rejected', rejectionReason: reason }));
      navigate('/leaves');
    }
  };

  const getStatusColor = (status: string) => {
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
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentLeave) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Leave not found</p>
          <button
            onClick={() => navigate('/leaves')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Leaves
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/leaves')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Leaves
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentLeave.leaveType}</h1>
            <p className="text-gray-600">
              {currentLeave.employeeId.firstName} {currentLeave.employeeId.lastName} -{' '}
              {currentLeave.employeeId.employeeId}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                currentLeave.status
              )}`}
            >
              {currentLeave.status}
            </span>
            {canManage && currentLeave.status === 'Pending' && (
              <>
                <button
                  onClick={handleApprove}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <CheckCircle size={18} />
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  <XCircle size={18} />
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Leave Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Leave Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Leave Type</p>
                <p className="text-gray-900 font-medium">{currentLeave.leaveType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Number of Days</p>
                <p className="text-gray-900 font-medium">{currentLeave.numberOfDays} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="text-gray-900 font-medium">{formatDate(currentLeave.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="text-gray-900 font-medium">{formatDate(currentLeave.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Applied Date</p>
                <p className="text-gray-900 font-medium">{formatDate(currentLeave.appliedDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(
                    currentLeave.status
                  )}`}
                >
                  {currentLeave.status}
                </span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reason</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{currentLeave.reason}</p>
          </div>

          {/* Rejection Reason */}
          {currentLeave.status === 'Rejected' && currentLeave.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-900 mb-4">Rejection Reason</h2>
              <p className="text-red-700">{currentLeave.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Employee Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Employee Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-gray-900 font-medium">
                  {currentLeave.employeeId.firstName} {currentLeave.employeeId.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="text-gray-900 font-medium">{currentLeave.employeeId.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="text-gray-900 font-medium">{currentLeave.employeeId.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Designation</p>
                <p className="text-gray-900 font-medium">{currentLeave.employeeId.designation}</p>
              </div>
            </div>
          </div>

          {/* Approval Info */}
          {currentLeave.approvedBy && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Approval Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Approved/Rejected By</p>
                  <p className="text-gray-900 font-medium">
                    {currentLeave.approvedBy.firstName} {currentLeave.approvedBy.lastName}
                  </p>
                </div>
                {currentLeave.approvedDate && (
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-gray-900 font-medium">
                      {formatDate(currentLeave.approvedDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveDetail;
