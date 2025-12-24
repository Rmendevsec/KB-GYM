import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import api from '../../services/api';
import './CreateUser.css';

const CreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    package_id: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      // This would be an API call to get packages
      // For now, using static data
      const demoPackages = [
        { id: '1', name: '1 Month', max_scans: 40, price: 29.99 },
        { id: '2', name: '3 Month', max_scans: 120, price: 79.99 },
        { id: '3', name: '6 Month', max_scans: 240, price: 149.99 },
        { id: '4', name: '1 Year', max_scans: 480, price: 279.99 }
      ];
      setPackages(demoPackages);
    } catch (error) {
      toast.error('Failed to load packages');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.full_name || !formData.email || !formData.password || !formData.package_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        package_id: formData.package_id
      });

      toast.success('User created successfully!');
      navigate('/admin/users');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-user-container">
      <Helmet>
        <title>Create User - Gym Management System</title>
      </Helmet>
      
      <div className="create-user-header">
        <button onClick={() => navigate('/admin/users')} className="back-button">
          <FaArrowLeft /> Back to Users
        </button>
        <div>
          <h1>Create New User</h1>
          <p>Register a new gym member or staff</p>
        </div>
      </div>
      
      <div className="create-user-card">
        <form onSubmit={handleSubmit} className="create-user-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="full_name">
                  <FaUser className="input-icon" />
                  Full Name *
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">
                  <FaEnvelope className="input-icon" />
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">
                  <FaLock className="input-icon" />
                  Password *
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <small className="password-hint">
                  Minimum 8 characters with uppercase, lowercase, and number
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <FaLock className="input-icon" />
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Account Settings</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="user">Member</option>
                  <option value="cashier">Cashier</option>
                  <option value="admin">Admin</option>
                </select>
                <small className="role-hint">
                  Admin: Full access, Cashier: Can scan QR codes, Member: Basic access
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="package_id">Package *</label>
                <select
                  id="package_id"
                  name="package_id"
                  value={formData.package_id}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select a package</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} - ${pkg.price} ({pkg.max_scans} scans)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/admin/users')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-create"
              disabled={loading || !formData.package_id}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;