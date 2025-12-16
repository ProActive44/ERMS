import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import AttendanceList from '../pages/Attendance/AttendanceList';
import AttendanceDetails from '../pages/Attendance/AttendanceDetails';
import AttendanceForm from '../pages/Attendance/AttendanceForm';

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
      <Route
        path="/attendance/new"
        element={
          <PrivateRoute>
            <AttendanceForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/attendance/edit/:id"
        element={
          <PrivateRoute>
            <AttendanceForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/attendance/:id"
        element={
          <PrivateRoute>
            <AttendanceDetails />
          </PrivateRoute>
        }
      />
    </>
  );
};

export default AttendanceRoutes;
