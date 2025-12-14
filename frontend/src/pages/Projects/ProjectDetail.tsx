import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchProjectById,
  updateProject,
  addTeamMember,
  removeTeamMember,
  updateProjectProgress,
  clearCurrentProject,
} from '../../store/projectSlice';
import { fetchTasksByProject } from '../../store/taskSlice';
import { fetchEmployees } from '../../store/employeeSlice';
import {
  ArrowLeft,
  Edit,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Briefcase,
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentProject, loading } = useAppSelector((state) => state.project);
  const { tasks } = useAppSelector((state) => state.task);
  const { employees } = useAppSelector((state) => state.employees);

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  const canManage = user?.role === 'admin' || user?.role === 'hr';

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
      dispatch(fetchTasksByProject({ projectId: id }));
      if (canManage) {
        dispatch(fetchEmployees({}));
      }
    }
    return () => {
      dispatch(clearCurrentProject());
    };
  }, [dispatch, id, canManage]);

  useEffect(() => {
    if (currentProject) {
      setProgressValue(currentProject.progress);
    }
  }, [currentProject]);

  const handleAddTeamMember = async () => {
    if (id && selectedEmployeeId) {
      await dispatch(addTeamMember({ projectId: id, employeeId: selectedEmployeeId }));
      setShowAddMemberModal(false);
      setSelectedEmployeeId('');
    }
  };

  const handleRemoveTeamMember = async (employeeId: string) => {
    if (id && confirm('Remove this team member?')) {
      await dispatch(removeTeamMember({ projectId: id, employeeId }));
    }
  };

  const handleUpdateProgress = async () => {
    if (id) {
      await dispatch(updateProjectProgress({ projectId: id, progress: progressValue }));
      setShowProgressModal(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Planning: 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-green-100 text-green-800',
      'On Hold': 'bg-yellow-100 text-yellow-800',
      Completed: 'bg-gray-100 text-gray-800',
      Cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      Low: 'bg-gray-100 text-gray-800',
      Medium: 'bg-blue-100 text-blue-800',
      High: 'bg-orange-100 text-orange-800',
      Critical: 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTaskStatusStats = () => {
    const stats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'Completed').length,
      inProgress: tasks.filter((t) => t.status === 'In Progress').length,
      blocked: tasks.filter((t) => t.status === 'Blocked').length,
    };
    return stats;
  };

  const availableEmployees = employees.filter(
    (emp) =>
      !currentProject?.teamMembers.some((member) => member._id === emp._id) &&
      currentProject?.projectManager._id !== emp._id
  );

  if (loading || !currentProject) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const taskStats = getTaskStatusStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Projects
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {currentProject.name}
            </h1>
            <div className="flex gap-2 items-center">
              <span
                className={`px-3 py-1 text-sm font-semibold rounded ${getStatusColor(
                  currentProject.status
                )}`}
              >
                {currentProject.status}
              </span>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded ${getPriorityColor(
                  currentProject.priority
                )}`}
              >
                {currentProject.priority} Priority
              </span>
            </div>
          </div>
          {canManage && (
            <button
              onClick={() => navigate(`/projects/${id}/edit`)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <Edit size={20} />
              Edit Project
            </button>
          )}
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
            <p className="text-gray-600 whitespace-pre-wrap">
              {currentProject.description}
            </p>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Progress</h2>
              {canManage && (
                <button
                  onClick={() => setShowProgressModal(true)}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Update
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-semibold text-gray-800">
                  {currentProject.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all"
                  style={{ width: `${currentProject.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Tasks Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
              {canManage && (
                <button
                  onClick={() => navigate(`/tasks/new?projectId=${id}`)}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  <Plus size={16} />
                  Add Task
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-800">{taskStats.total}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {taskStats.completed}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {taskStats.inProgress}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Blocked</p>
                <p className="text-2xl font-bold text-red-600">{taskStats.blocked}</p>
              </div>
            </div>
            {tasks.length > 0 && (
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/tasks/${task._id}`)}
                  >
                    <div className="flex items-center gap-3">
                      {task.status === 'Completed' && (
                        <CheckCircle2 className="text-green-500" size={20} />
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{task.title}</p>
                        <p className="text-sm text-gray-600">{task.status}</p>
                      </div>
                    </div>
                    {task.assignedTo && (
                      <div className="text-sm text-gray-600">
                        {task.assignedTo.firstName} {task.assignedTo.lastName}
                      </div>
                    )}
                  </div>
                ))}
                {tasks.length > 5 && (
                  <button
                    onClick={() => navigate(`/tasks?projectId=${id}`)}
                    className="w-full text-center text-indigo-600 hover:text-indigo-700 text-sm font-medium py-2"
                  >
                    View all {tasks.length} tasks
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Project Info
            </h2>
            <div className="space-y-4">
              {currentProject.startDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(currentProject.startDate)}
                    </p>
                  </div>
                </div>
              )}
              {currentProject.endDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(currentProject.endDate)}
                    </p>
                  </div>
                </div>
              )}
              {currentProject.budget && (
                <div className="flex items-start gap-3">
                  <DollarSign className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-medium text-gray-800">
                      ${currentProject.budget.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {currentProject.clientName && (
                <div className="flex items-start gap-3">
                  <Briefcase className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-medium text-gray-800">
                      {currentProject.clientName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Project Manager */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Project Manager
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold text-lg">
                  {currentProject.projectManager.firstName[0]}
                  {currentProject.projectManager.lastName[0]}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {currentProject.projectManager.firstName}{' '}
                  {currentProject.projectManager.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {currentProject.projectManager.email}
                </p>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Team Members ({currentProject.teamMembers.length})
              </h2>
              {canManage && (
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {currentProject.teamMembers.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-sm">
                        {member.firstName[0]}
                        {member.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{member.department}</p>
                    </div>
                  </div>
                  {canManage && (
                    <button
                      onClick={() => handleRemoveTeamMember(member._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {currentProject.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="text-gray-600" size={20} />
                <h2 className="text-xl font-semibold text-gray-800">Tags</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentProject.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Team Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Add Team Member
            </h3>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
            >
              <option value="">Select an employee</option>
              {availableEmployees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} - {emp.department}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleAddTeamMember}
                disabled={!selectedEmployeeId}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Add Member
              </button>
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSelectedEmployeeId('');
                }}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Update Progress
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress: {progressValue}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={progressValue}
                onChange={(e) => setProgressValue(Number(e.target.value))}
                className="w-full"
              />
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all"
                  style={{ width: `${progressValue}%` }}
                ></div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUpdateProgress}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Update
              </button>
              <button
                onClick={() => setShowProgressModal(false)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
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

export default ProjectDetail;
