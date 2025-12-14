import { Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import EmployeeList from '../pages/Employees/EmployeeList';
import EmployeeForm from '../pages/Employees/EmployeeForm';
import EmployeeDetail from '../pages/Employees/EmployeeDetail';
import EmployeeCredentials from '../pages/Employees/EmployeeCredentials';

const EmployeeRoutes = () => {
  return (
    <>
      <Route
        path="/employees"
        element={
          <PrivateRoute>
            <EmployeeList />
          </PrivateRoute>
        }
      />
      <Route
        path="/employees/new"
        element={
          <PrivateRoute>
            <EmployeeForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/employees/:id"
        element={
          <PrivateRoute>
            <EmployeeDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/employees/:id/edit"
        element={
          <PrivateRoute>
            <EmployeeForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/employees/:id/credentials"
        element={
          <PrivateRoute>
            <EmployeeCredentials />
          </PrivateRoute>
        }
      />
    </>
  );
};

export default EmployeeRoutes;
