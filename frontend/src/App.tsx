import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './store';
import Navbar from './components/Navbar';
import AppRoutes from './routes';
import './App.css';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="App min-h-screen bg-gray-50">
      {!isAuthPage && <Navbar />}
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;

