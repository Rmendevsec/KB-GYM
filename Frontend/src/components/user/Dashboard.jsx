import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { toast } from 'react-toastify';
import moment from 'moment';
import api from '../../services/api';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom'; // Add this
import { useAuth } from '../../contexts/AuthContext'; // Add this
const UserDashboard = () => {
const [qrData, setQrData] = useState(null);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch data in parallel
      const [qrResponse, statsResponse] = await Promise.all([
        api.get('/qr/current'),
        api.get('/qr/stats')
      ]);

      setQrData(qrResponse.data.data);
      setStats(statsResponse.data.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshQR = async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/qr/current');
      setQrData(response.data.data);
      toast.success('QR code refreshed');
    } catch (error) {
      toast.error('Failed to refresh QR code', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="no-package">
        <h2>No Active Package</h2>
        <p>Please purchase a package to access gym facilities.</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>Member Dashboard</h1>
        <p>Welcome back! Here's your access information</p>
      </div>

      <div className="dashboard-content">
        <div className="qr-section">
          <div className="qr-card">
            <h3>Your QR Code</h3>
            <p className="qr-expiry">
              Expires: {moment(qrData?.expiresAt).format('hh:mm A')}
            </p>
            
            <div className="qr-code-container">
              {qrData?.qrImage ? (
                <img src={qrData.qrImage} alt="QR Code" className="qr-image" />
              ) : (
                <QRCode 
                  value={qrData?.qrData || ''}
                  size={200}
                  level="H"
                  includeMargin
                />
              )}
            </div>

            <button 
              onClick={refreshQR}
              disabled={refreshing}
              className="btn-refresh"
            >
              {refreshing ? 'Refreshing...' : 'Refresh QR Code'}
            </button>

            <p className="qr-note">
              <small>
                QR code refreshes every 10 minutes for security.
                Show this code at the reception for scanning.
              </small>
            </p>
          </div>
        </div>

        <div className="stats-section">
          <div className="stats-card">
            <h3>Package Information</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Package</span>
                <span className="stat-value">{stats.packageName}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Scans</span>
                <span className="stat-value">{stats.totalScans}/{stats.maxScans}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Remaining Scans</span>
                <span className={`stat-value ${stats.remainingScans < 10 ? 'warning' : ''}`}>
                  {stats.remainingScans}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Weekly Usage</span>
                <span className="stat-value">{stats.weeklyScans}/{stats.weeklyLimit}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Sunday Bonus</span>
                <span className="stat-value">
                  {stats.sundayBonus ? '✅ Available' : '❌ Not Available'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span className={`stat-value ${stats.isActive ? 'active' : 'inactive'}`}>
                  {stats.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="progress-section">
              <div className="progress-item">
                <label>Package Usage</label>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${(stats.totalScans / stats.maxScans) * 100}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {Math.round((stats.totalScans / stats.maxScans) * 100)}%
                </span>
              </div>

              <div className="progress-item">
                <label>Weekly Usage</label>
                <div className="progress-bar">
                  <div 
                    className="progress-fill weekly"
                    style={{ width: `${(stats.weeklyScans / stats.weeklyLimit) * 100}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {stats.weeklyScans}/{stats.weeklyLimit} days
                </span>
              </div>
            </div>

            {/* Rules Information */}
            <div className="rules-info">
              <h4>Package Rules:</h4>
              <ul>
                <li>Maximum {stats.maxScans} total scans</li>
                <li>Maximum 3 scans per week (Monday-Saturday)</li>
                <li>{stats.sundayBonus ? 'Sunday scans allowed as bonus' : 'No Sunday access'}</li>
                <li>One scan per day maximum</li>
                <li>Package expires when all scans are used</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <div className="alert-card">
          <h4>Important Reminders</h4>
          <ul>
            <li>QR codes are valid for 10 minutes only</li>
            <li>You can only scan once per day</li>
            <li>Weekly limit resets every Monday</li>
            <li>Contact admin if you need to upgrade your package</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;