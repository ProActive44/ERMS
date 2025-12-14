import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import ProjectList from '../pages/Projects/ProjectList';
import ProjectDetail from '../pages/Projects/ProjectDetail';
import CreateProject from '../pages/Projects/CreateProject';

const ProjectRoutes = () => {
  return (
    <>
      <Route
        path="/projects"
        element={
          <PrivateRoute>
            <ProjectList />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/new"
        element={
          <PrivateRoute>
            <CreateProject />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <PrivateRoute>
            <ProjectDetail />
          </PrivateRoute>
        }
      />
    </>
  );
};

export default ProjectRoutes;
