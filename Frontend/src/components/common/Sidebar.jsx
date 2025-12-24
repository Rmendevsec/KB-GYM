import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaHistory, 
  FaUserPlus,
  FaQrcode,
  FaUserCircle,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const adminMenuItems = [
    { path: '/admin', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/admin/users', label: 'Users', icon: <FaUsers /> },
    { path: '/admin/users/create', label: 'Create User', icon: <FaUserPlus /> },
    { path: '/admin/logs', label: 'Access Logs', icon: <FaHistory /> },
    { path: '/cashier', label: 'Scanner', icon: <FaQrcode /> },
  ];

  const cashierMenuItems = [
    { path: '/cashier', label: 'QR Scanner', icon: <FaQrcode /> },
  ];

  const userMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/profile', label: 'Profile', icon: <FaUserCircle /> },
  ];

  let menuItems = [];
  switch (user?.role) {
    case 'admin':
      menuItems = adminMenuItems;
      break;
    case 'cashier':
      menuItems = cashierMenuItems;
      break;
    case 'user':
      menuItems = userMenuItems;
      break;
    default:
      menuItems = [];
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? <FaBars /> : <FaTimes />}
      </button>
      
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <span className="nav-label">{item.label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="user-status">
            <div className="status-indicator active"></div>
            <span>Online</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;