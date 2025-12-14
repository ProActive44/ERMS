import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import TaskBoard from '../pages/Tasks/TaskBoard';
import CreateTask from '../pages/Tasks/CreateTask';
import TaskDetail from '../pages/Tasks/TaskDetail';

const TaskRoutes = () => {
  return (
    <>
      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <TaskBoard />
          </PrivateRoute>
        }
      />
      <Route
        path="/tasks/new"
        element={
          <PrivateRoute>
            <CreateTask />
          </PrivateRoute>
        }
      />
      <Route
        path="/tasks/:id"
        element={
          <PrivateRoute>
            <TaskDetail />
          </PrivateRoute>
        }
      />
    </>
  );
};

export default TaskRoutes;
