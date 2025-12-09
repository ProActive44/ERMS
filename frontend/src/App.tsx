import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  ERMS - Employee Resource Management System
                </h1>
                <p className="text-gray-600">
                  Frontend is ready. Start building your pages!
                </p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

