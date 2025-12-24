import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaCalendar, FaKey, FaSave } from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    role: '',
    created_at: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setProfile({
        full_name: user.full_name || '',
        email: user.email || '',
        role: user.role || '',
        created_at: user.created_at || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    
    if (!profile.full_name || !profile.email) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/user/profile', {
        full_name: profile.full_name,
        email: profile.email
      });

      updateUser(response.data.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/user/change-password', passwordData);
      toast.success('Password changed successfully');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Helmet>
        <title>My Profile - Gym Management System</title>
      </Helmet>
      
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account information and security</p>
      </div>
      
      <div className="profile-content">
        <div className="profile-sidebar">
          <button
            className={`sidebar-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Profile Information
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <FaKey /> Change Password
          </button>
        </div>
        
        <div className="profile-main">
          {activeTab === 'profile' ? (
            <div className="profile-card">
              <h3>Profile Information</h3>
              
              <form onSubmit={updateProfile} className="profile-form">
                <div className="form-group">
                  <label htmlFor="full_name">
                    <FaUser className="input-icon" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={profile.full_name}
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">
                    <FaEnvelope className="input-icon" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    <FaCalendar className="input-icon" />
                    Member Since
                  </label>
                  <div className="read-only-field">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Role</label>
                  <div className="read-only-field">
                    <span className={`role-badge ${user.role}`}>
                      {user.role?.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="btn-save"
                  disabled={loading}
                >
                  <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          ) : (
            <div className="profile-card">
              <h3>Change Password</h3>
              
              <form onSubmit={changePassword} className="password-form">
                <div className="form-group">
                  <label htmlFor="current_password">
                    <FaKey className="input-icon" />
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current_password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="new_password">
                    <FaKey className="input-icon" />
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new_password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    disabled={loading}
                  />
                  <small className="password-hint">
                    Minimum 8 characters with uppercase, lowercase, and number
                  </small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirm_password">
                    <FaKey className="input-icon" />
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn-save"
                  disabled={loading}
                >
                  <FaSave /> {loading ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;