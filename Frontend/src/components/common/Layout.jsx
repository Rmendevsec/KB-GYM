import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="layout-container">
        <Sidebar user={user} />
        
        <main className="main-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
      
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} KB GYM. All rights reserved.</p>
          <p>Version {process.env.REACT_APP_VERSION || '1.0.0'}</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;