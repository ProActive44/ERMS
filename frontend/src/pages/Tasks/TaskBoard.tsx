import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTasks, updateTaskStatus } from '../../store/taskSlice';
import { fetchProjects } from '../../store/projectSlice';
import { fetchEmployees } from '../../store/employeeSlice';
import {
  Plus,
  Filter,
  Search,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { Task } from '../../types/task';

const TaskBoard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);
  const { tasks, loading } = useAppSelector((state) => state.task);
  const { projects } = useAppSelector((state) => state.project);
  const { employees } = useAppSelector((state) => state.employees);

  const canManage = user?.role === 'admin' || user?.role === 'hr';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>(
    searchParams.get('project') || ''
  );
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const statuses: Array<
    'To Do' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked'
  > = ['To Do', 'In Progress', 'In Review', 'Completed', 'Blocked'];

  useEffect(() => {
    dispatch(fetchProjects({}));
    dispatch(fetchEmployees({}));
  }, [dispatch]);

  useEffect(() => {
    const filters: {
      projectId?: string;
      priority?: 'Low' | 'Medium' | 'High' | 'Critical';
      assignedTo?: string;
      search?: string;
    } = {};
    if (selectedProject) filters.projectId = selectedProject;
    if (selectedPriority) filters.priority = selectedPriority as 'Low' | 'Medium' | 'High' | 'Critical';
    if (selectedAssignee) filters.assignedTo = selectedAssignee;
    if (searchQuery) filters.search = searchQuery;

    dispatch(fetchTasks(filters));
  }, [dispatch, selectedProject, selectedPriority, selectedAssignee, searchQuery]);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (
    status: 'To Do' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked'
  ) => {
    if (draggedTask && draggedTask.status !== status) {
      await dispatch(updateTaskStatus({ id: draggedTask._id, status }));
      setDraggedTask(null);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    let matches = true;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matches =
        matches &&
        (task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query));
    }

    if (selectedProject) {
      matches = matches && task.projectId._id === selectedProject;
    }

    if (selectedPriority) {
      matches = matches && task.priority === selectedPriority;
    }

    if (selectedAssignee) {
      matches = matches && task.assignedTo?._id === selectedAssignee;
    }

    return matches;
  });

  const tasksByStatus = (
    status: 'To Do' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked'
  ) => {
    return filteredTasks.filter((task) => task.status === status);
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

  const getStatusIcon = (
    status: 'To Do' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked'
  ) => {
    switch (status) {
      case 'To Do':
        return <AlertCircle className="text-gray-500" size={16} />;
      case 'In Progress':
        return <Clock className="text-blue-500" size={16} />;
      case 'In Review':
        return <User className="text-purple-500" size={16} />;
      case 'Completed':
        return <CheckCircle2 className="text-green-500" size={16} />;
      case 'Blocked':
        return <XCircle className="text-red-500" size={16} />;
    }
  };

  const getStatusColor = (
    status: 'To Do' | 'In Progress' | 'In Review' | 'Completed' | 'Blocked'
  ) => {
    switch (status) {
      case 'To Do':
        return 'bg-gray-100';
      case 'In Progress':
        return 'bg-blue-50';
      case 'In Review':
        return 'bg-purple-50';
      case 'Completed':
        return 'bg-green-50';
      case 'Blocked':
        return 'bg-red-50';
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedProject('');
    setSelectedPriority('');
    setSelectedAssignee('');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {canManage ? 'Task Board' : 'My Tasks'}
            </h1>
            <p className="text-gray-600 mt-1">
              {canManage ? 'Manage and track tasks across projects' : 'View and manage your assigned tasks'}
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => navigate('/tasks/new')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus size={20} />
              New Task
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Filter size={20} />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Projects</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignee
                  </label>
                  <select
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Assignees</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statuses.map((status) => (
            <div
              key={status}
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(status)}
            >
              {/* Column Header */}
              <div
                className={`${getStatusColor(status)} rounded-t-lg px-4 py-3 border-b-2 border-gray-200`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <h3 className="font-semibold text-gray-800">{status}</h3>
                  </div>
                  <span className="bg-white text-gray-700 text-sm font-medium px-2 py-1 rounded-full">
                    {tasksByStatus(status).length}
                  </span>
                </div>
              </div>

              {/* Task Cards */}
              <div className="bg-gray-50 rounded-b-lg p-4 min-h-[600px] space-y-3">
                {tasksByStatus(status).length === 0 ? (
                  <p className="text-center text-gray-500 text-sm mt-8">
                    No tasks in {status}
                  </p>
                ) : (
                  tasksByStatus(status).map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onClick={() => navigate(`/tasks/${task._id}`)}
                      className="bg-white rounded-lg p-4 shadow hover:shadow-md transition cursor-move"
                    >
                      {/* Task Title */}
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {task.title}
                      </h4>

                      {/* Task Description */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>

                      {/* Priority Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                        {task.tags.length > 0 && (
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                            {task.tags[0]}
                          </span>
                        )}
                      </div>

                      {/* Project Name */}
                      <div className="text-xs text-gray-500 mb-2">
                        📁 {task.projectId.name}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          {task.assignedTo ? (
                            <>
                              <User size={14} />
                              <span>
                                {task.assignedTo.firstName}{' '}
                                {task.assignedTo.lastName}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Dependencies Indicator */}
                      {task.dependencies.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          🔗 {task.dependencies.length} dependencies
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
