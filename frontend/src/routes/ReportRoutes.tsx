import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Reports from '../pages/Reports';

const ReportRoutes = () => {
  return (
    <>
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        }
      />
    </>
  );
};

export default ReportRoutes;
