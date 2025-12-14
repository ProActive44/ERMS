import { Route } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';

const AuthRoutes = () => {
  return (
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </>
  );
};

export default AuthRoutes;
