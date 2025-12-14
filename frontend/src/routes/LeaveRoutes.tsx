import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import LeaveList from '../pages/Leaves/LeaveList';
import ApplyLeave from '../pages/Leaves/ApplyLeave';
import LeaveDetail from '../pages/Leaves/LeaveDetail';

const LeaveRoutes = () => {
  return (
    <>
      <Route
        path="/leaves"
        element={
          <PrivateRoute>
            <LeaveList />
          </PrivateRoute>
        }
      />
      <Route
        path="/leaves/apply"
        element={
          <PrivateRoute>
            <ApplyLeave />
          </PrivateRoute>
        }
      />
      <Route
        path="/leaves/:id"
        element={
          <PrivateRoute>
            <LeaveDetail />
          </PrivateRoute>
        }
      />
    </>
  );
};

export default LeaveRoutes;
