import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Dashboard from './components/Dashboard';
import BatchList from './components/Batches/BatchList';
import BatchDetails from './components/Batches/BatchDetails';
import StudentList from './components/Students/StudentList';
import StudentDetails from './components/Students/StudentDetails';
import MarkList from './components/Marks/MarkList';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  return (
    <Router>
      <div className="App">
        {token && <Navbar />}
        <Routes>
          
          <Route path="/login" element={token ? <Navigate to="/Dashboard" /> : <Login setToken={setToken} />} />
          <Route path="/register" element={token ? <Navigate to="/Dashboard" /> : <Register />} />

          
          <Route path="/" element={token ? <Navigate to="/Dashboard" /> : <Navigate to="/login" />} />

          
          <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/batches" element={<ProtectedRoute><BatchList /></ProtectedRoute>} />
          <Route path="/batches/:id" element={<ProtectedRoute><BatchDetails /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><StudentList /></ProtectedRoute>} />
          <Route path="/students/:id" element={<ProtectedRoute><StudentDetails /></ProtectedRoute>} />
          <Route path="/marks" element={<ProtectedRoute><MarkList /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;