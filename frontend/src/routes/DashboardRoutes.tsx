import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Dashboard from '../pages/Dashboard';

const DashboardRoutes = () => {
  return (
    <>
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </>
  );
};

export default DashboardRoutes;
