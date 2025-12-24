import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Register.css';

const Register = () => {
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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      // Register the user
      const response = await api.post('/auth/register', {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        package_id: formData.package_id
      });

      toast.success('User registered successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Fetch packages on component mount
  React.useEffect(() => {
    // This would fetch packages from API
    // For demo, we'll use static data
    const demoPackages = [
      { id: '1', name: '1 Month', max_scans: 40, price: 29.99 },
      { id: '2', name: '3 Month', max_scans: 120, price: 79.99 },
      { id: '3', name: '6 Month', max_scans: 240, price: 149.99 },
      { id: '4', name: '1 Year', max_scans: 480, price: 279.99 }
    ];
    setPackages(demoPackages);
  }, []);

  return (
    <div className="register-container">
      <Helmet>
        <title>Register - Gym Management System</title>
      </Helmet>
      
      <div className="register-card">
        <div className="register-header">
          <h1>Create New Account</h1>
          <p>Register a new gym member</p>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="full_name">
                <FaUser className="input-icon" />
                Full Name
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
                Email Address
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
                Password
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
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <FaLock className="input-icon" />
                Confirm Password
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
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">Role</label>
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
            </div>
            
            <div className="form-group">
              <label htmlFor="package_id">Package</label>
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
          
          <div className="form-footer">
            <Link to="/login" className="back-link">
              ← Back to Login
            </Link>
            <button
              type="submit"
              className="register-button"
              disabled={loading || !formData.package_id}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                'Register User'
              )}
            </button>
          </div>
        </form>
        
        <div className="package-info">
          <h4>Package Details:</h4>
          <div className="package-grid">
            {packages.map((pkg) => (
              <div key={pkg.id} className="package-card">
                <h5>{pkg.name}</h5>
                <p>Scans: {pkg.max_scans}</p>
                <p>Price: ${pkg.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;