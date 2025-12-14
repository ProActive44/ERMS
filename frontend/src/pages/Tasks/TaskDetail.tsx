import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Link as LinkIcon,
  Save,
  Tag,
  Trash2,
  User,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchEmployees } from '../../store/employeeSlice';
import {
  assignTask,
  deleteTask,
  fetchTaskById,
  updateTask,
  updateTaskHours,
  updateTaskStatus,
} from '../../store/taskSlice';
import { UpdateTaskPayload } from '../../types/task';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentTask, loading } = useAppSelector((state) => state.task);
  const { employees } = useAppSelector((state) => state.employees);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateTaskPayload>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [hoursInput, setHoursInput] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchTaskById(id));
      dispatch(fetchEmployees({}));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentTask && !isEditing) {
      setEditData({
        title: currentTask.title,
        description: currentTask.description,
        status: currentTask.status,
        priority: currentTask.priority,
        dueDate: currentTask.dueDate
          ? new Date(currentTask.dueDate).toISOString().split('T')[0]
          : undefined,
        estimatedHours: currentTask.estimatedHours,
        actualHours: currentTask.actualHours,
        tags: currentTask.tags,
      });
    }
  }, [currentTask, isEditing]);

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]:
        name === 'estimatedHours' || name === 'actualHours'
          ? value
            ? Number(value)
            : undefined
          : value,
    }));
  };

  const handleSave = async () => {
    if (!id) return;

    const payload = {
      ...editData,
      dueDate: editData.dueDate
        ? new Date(editData.dueDate).toISOString()
        : undefined,
    };

    const result = await dispatch(updateTask({ id, data: payload }));
    if (updateTask.fulfilled.match(result)) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const result = await dispatch(deleteTask(id));
    if (deleteTask.fulfilled.match(result)) {
      navigate('/tasks');
    }
  };

  const handleStatusChange = async (
    status: 'To Do' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked'
  ) => {
    if (!id) return;
    await dispatch(updateTaskStatus({ id, status }));
  };

  const handleAssign = async () => {
    if (!id || !selectedAssignee) return;
    const result = await dispatch(
      assignTask({ id, assignedTo: selectedAssignee })
    );
    if (assignTask.fulfilled.match(result)) {
      setShowAssignModal(false);
      setSelectedAssignee('');
    }
  };

  const handleUpdateHours = async () => {
    if (!id || !hoursInput) return;
    const result = await dispatch(
      updateTaskHours({ id, actualHours: Number(hoursInput) })
    );
    if (updateTaskHours.fulfilled.match(result)) {
      setShowHoursModal(false);
      setHoursInput('');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'In Review':
        return 'bg-purple-100 text-purple-700';
      case 'Blocked':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading || !currentTask) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Tasks
        </button>

        <div className="flex justify-between items-start">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={editData.title}
                onChange={handleEditChange}
                className="text-3xl font-bold text-gray-800 border-b-2 border-indigo-600 focus:outline-none w-full"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-800">
                {currentTask.title}
              </h1>
            )}
            <p className="text-gray-600 mt-2">
              Project: {currentTask.projectId.name}
            </p>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  <Save size={18} />
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  <X size={18} />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  <Edit2 size={18} />
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Description
            </h2>
            {isEditing ? (
              <textarea
                name="description"
                value={editData.description}
                onChange={handleEditChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {currentTask.description}
              </p>
            )}
          </div>

          {/* Status & Priority */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Status & Priority
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                {isEditing ? (
                  <select
                    name="status"
                    value={editData.status}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(['To Do', 'In Progress', 'In Review', 'Completed', 'Blocked'] as const).map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                            currentTask.status === status
                              ? getStatusColor(status)
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                {isEditing ? (
                  <select
                    name="priority"
                    value={editData.priority}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                ) : (
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getPriorityColor(currentTask.priority)}`}
                  >
                    {currentTask.priority}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Time Tracking */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Time Tracking
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setShowHoursModal(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Update Hours
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Hours
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="estimatedHours"
                    value={editData.estimatedHours || ''}
                    onChange={handleEditChange}
                    min="0"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">
                    {currentTask.estimatedHours || 0}h
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actual Hours
                </label>
                <p className="text-2xl font-bold text-gray-800">
                  {currentTask.actualHours || 0}h
                </p>
                {currentTask.estimatedHours &&
                  currentTask.actualHours !== undefined && (
                    <p className="text-sm text-gray-600 mt-1">
                      {currentTask.actualHours > currentTask.estimatedHours ? (
                        <span className="text-red-600">
                          {(currentTask.actualHours - currentTask.estimatedHours).toFixed(1)}h over
                        </span>
                      ) : (
                        <span className="text-green-600">
                          {(currentTask.estimatedHours - currentTask.actualHours).toFixed(1)}h remaining
                        </span>
                      )}
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Dependencies */}
          {currentTask.dependencies.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Dependencies
              </h2>
              <div className="space-y-3">
                {currentTask.dependencies.map((dep) => (
                  <div
                    key={dep._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => navigate(`/tasks/${dep._id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <LinkIcon size={18} className="text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-800">{dep.title}</p>
                        <p className="text-sm text-gray-600">
                          Status: {dep.status}
                        </p>
                      </div>
                    </div>
                    {dep.status === 'Completed' ? (
                      <CheckCircle2 className="text-green-500" size={20} />
                    ) : (
                      <AlertCircle className="text-yellow-500" size={20} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {currentTask.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Tag size={20} />
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {currentTask.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <User size={18} />
                Assigned To
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Change
                </button>
              )}
            </div>
            {currentTask.assignedTo ? (
              <div>
                <p className="font-medium text-gray-800">
                  {currentTask.assignedTo.firstName}{' '}
                  {currentTask.assignedTo.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {currentTask.assignedTo.email}
                </p>
                <p className="text-sm text-gray-600">
                  {currentTask.assignedTo.department}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Unassigned</p>
            )}
          </div>

          {/* Due Date */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={18} />
              Due Date
            </h3>
            {isEditing ? (
              <input
                type="date"
                name="dueDate"
                value={editData.dueDate || ''}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            ) : currentTask.dueDate ? (
              <div>
                <p className="text-lg font-medium text-gray-800">
                  {new Date(currentTask.dueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                {new Date(currentTask.dueDate) < new Date() &&
                  currentTask.status !== 'Completed' && (
                    <p className="text-sm text-red-600 mt-2">Overdue</p>
                  )}
              </div>
            ) : (
              <p className="text-gray-500">No due date set</p>
            )}
          </div>

          {/* Created & Updated */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock size={18} />
              Timeline
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium text-gray-800">
                  {new Date(currentTask.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">
                  by {currentTask.createdBy.name}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Last Updated</p>
                <p className="font-medium text-gray-800">
                  {new Date(currentTask.updatedAt).toLocaleDateString()}
                </p>
                {currentTask.updatedBy && (
                  <p className="text-xs text-gray-500">
                    by {currentTask.updatedBy.name}
                  </p>
                )}
              </div>
              {currentTask.completedAt && (
                <div>
                  <p className="text-gray-600">Completed</p>
                  <p className="font-medium text-gray-800">
                    {new Date(currentTask.completedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Delete Task
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Assign Task
            </h3>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} - {emp.department}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={handleAssign}
                disabled={!selectedAssignee}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Assign
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedAssignee('');
                }}
                className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Hours Modal */}
      {showHoursModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Update Actual Hours
            </h3>
            <input
              type="number"
              value={hoursInput}
              onChange={(e) => setHoursInput(e.target.value)}
              min="0"
              step="0.5"
              placeholder="Enter actual hours"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleUpdateHours}
                disabled={!hoursInput}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Update
              </button>
              <button
                onClick={() => {
                  setShowHoursModal(false);
                  setHoursInput('');
                }}
                className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
