import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout Components
import Layout from './components/common/Layout';

// Auth Components
import Login from './components/auth/Login';

// Admin Components
import AdminDashboard from './components/admin/Dashboard';

// User Components
import UserDashboard from './components/user/Dashboard';

// Cashier Components
import Scan from './components/cashier/Scan';

// Protected Route
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Helmet>
        <title>Gym Management System</title>
      </Helmet>
      
    
        <div className="App">
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Default route - redirect based on auth */}
            <Route path="/" element={<HomeRedirect />} />
            
            {/* Protected User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <UserDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Protected Cashier Routes */}
            <Route path="/cashier" element={
              <ProtectedRoute roles={['cashier', 'admin']}>
                <Layout>
                  <Scan />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      
    </AuthProvider>
  );
}

// HomeRedirect component using useAuth hook
function HomeRedirect() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  switch(user.role) {
    case 'admin':
      return <Navigate to="/admin" />;
    case 'cashier':
      return <Navigate to="/cashier" />;
    case 'user':
      return <Navigate to="/dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
}

export default App;