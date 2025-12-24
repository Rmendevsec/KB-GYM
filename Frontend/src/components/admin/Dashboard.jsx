import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { 
  FaUsers, 
  FaQrcode, 
  FaHistory, 
  FaChartLine,
  FaUserCheck,
  FaCalendarCheck
} from 'react-icons/fa';
import api from '../../services/api';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    todayScans: 0,
    weekScans: 0,
    monthScans: 0,
    activePackages: 0
  });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, logsResponse] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/admin/access-logs?limit=5')
      ]);

      setStats(statsResponse.data.data);
      setRecentScans(logsResponse.data.data.logs);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <FaUsers />,
      color: '#667eea',
      change: '+12%'
    },
    {
      title: 'Active Today',
      value: stats.todayScans,
      icon: <FaUserCheck />,
      color: '#10b981',
      change: '+8%'
    },
    {
      title: 'Active Packages',
      value: stats.activePackages,
      icon: <FaCalendarCheck />,
      color: '#f59e0b',
      change: '+5%'
    },
    {
      title: 'Weekly Scans',
      value: stats.weekScans,
      icon: <FaChartLine />,
      color: '#ef4444',
      change: '+15%'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Helmet>
        <title>Admin Dashboard - Gym Management System</title>
      </Helmet>
      
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the gym management control panel</p>
      </div>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20` }}>
              <div style={{ color: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
            <div className="stat-change positive">
              {stat.change}
            </div>
          </div>
        ))}
      </div>
      
      <div className="dashboard-content">
        {/* Recent Scans */}
        <div className="recent-scans">
          <div className="section-header">
            <h2>
              <FaHistory /> Recent Scans
            </h2>
            <button className="view-all-btn">View All</button>
          </div>
          
          <div className="scans-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Time</th>
                  <th>Scanned By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentScans.length > 0 ? (
                  recentScans.map((scan) => (
                    <tr key={scan.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {scan.user?.full_name?.charAt(0)}
                          </div>
                          <div className="user-info">
                            <strong>{scan.user?.full_name}</strong>
                            <small>{scan.user?.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {new Date(scan.scanned_at).toLocaleTimeString()}
                        <br />
                        <small>{new Date(scan.scanned_at).toLocaleDateString()}</small>
                      </td>
                      <td>
                        {scan.scanner?.full_name || 'System'}
                      </td>
                      <td>
                        <span className={`status-badge ${scan.valid ? 'success' : 'error'}`}>
                          {scan.valid ? 'Valid' : 'Invalid'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">
                      No recent scans found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="section-header">
            <h2>
              <FaQrcode /> Quick Actions
            </h2>
          </div>
          
          <div className="actions-grid">
            <a href="/admin/users/create" className="action-card">
              <div className="action-icon">
                <FaUsers />
              </div>
              <h3>Add New User</h3>
              <p>Register a new gym member</p>
            </a>
            
            <a href="/admin/users" className="action-card">
              <div className="action-icon">
                <FaUsers />
              </div>
              <h3>Manage Users</h3>
              <p>View and edit user accounts</p>
            </a>
            
            <a href="/admin/logs" className="action-card">
              <div className="action-icon">
                <FaHistory />
              </div>
              <h3>Access Logs</h3>
              <p>View all scan history</p>
            </a>
            
            <a href="/cashier" className="action-card">
              <div className="action-icon">
                <FaQrcode />
              </div>
              <h3>Scan QR</h3>
              <p>Quick scan interface</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;