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
    <div className="App min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {!isAuthPage && <Navbar />}
      <div className={!isAuthPage ? 'pt-16' : ''}>
        <AppRoutes />
      </div>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="light"
        className="mt-16"
        toastClassName="backdrop-blur-md bg-white/90 shadow-lg"
      />
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

