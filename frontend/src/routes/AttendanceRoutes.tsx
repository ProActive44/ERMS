import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import AttendanceList from '../pages/Attendance/AttendanceList';

const AttendanceRoutes = () => {
  return (
    <>
      <Route
        path="/attendance"
        element={
          <PrivateRoute>
            <AttendanceList />
          </PrivateRoute>
        }
      />
    </>
  );
};

export default AttendanceRoutes;
