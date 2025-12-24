import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaBell } from 'react-icons/fa';
import './Header.css';

const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <h1>🏋️ Gym Management</h1>
          </Link>
        </div>
        
        <div className="header-right">
          {user && (
            <>
              <div className="user-info">
                <FaUser className="user-icon" />
                <div className="user-details">
                  <span className="user-name">{user.full_name}</span>
                  <span className="user-role">{user.role.toUpperCase()}</span>
                </div>
              </div>
              
              <button className="notification-btn">
                <FaBell />
                <span className="notification-badge">3</span>
              </button>
              
              <button onClick={onLogout} className="logout-btn">
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;