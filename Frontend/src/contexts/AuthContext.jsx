import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if token is a real JWT or test token
  const isRealJWT = (token) => {
    if (!token || typeof token !== 'string') return false;
    const parts = token.split('.');
    return parts.length === 3;
  };

  // JWT decode function for real JWT tokens
  const decodeJWT = (token) => {
    if (!isRealJWT(token)) {
      console.log('Not a real JWT token, treating as test token');
      return null;
    }
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  // Check if token is expired (handles both test tokens and real JWTs)
  const isTokenExpired = (token) => {
    if (!token) {
      console.log('No token provided');
      return true;
    }
    
    // If it's a test token (like "test-jwt-token-for-development")
    if (!isRealJWT(token)) {
      console.log('Test token detected:', token.substring(0, 20) + '...');
      // Test tokens never expire for development
      return false;
    }
    
    // If it's a real JWT, check expiration
    const decoded = decodeJWT(token);
    
    if (!decoded) {
      console.log('Could not decode JWT');
      return true;
    }
    
    if (!decoded.exp) {
      console.log('JWT has no expiration claim');
      return false;
    }
    
    const isExpired = decoded.exp * 1000 < Date.now();
    console.log('JWT expiration check:', {
      exp: decoded.exp,
      expDate: new Date(decoded.exp * 1000),
      now: Date.now(),
      isExpired
    });
    
    return isExpired;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      console.log('🔍 Auth check debug:', { 
        tokenExists: !!token,
        tokenType: typeof token,
        tokenLength: token?.length,
        tokenSample: token ? token.substring(0, 30) + '...' : 'none',
        isRealJWT: token ? isRealJWT(token) : false,
        userExists: !!currentUser
      });
      
      // Check if token exists and is not expired
      const valid = !!token && !!currentUser && !isTokenExpired(token);
      
      console.log('🔍 Auth check result:', { 
        hasToken: !!token, 
        hasUser: !!currentUser,
        tokenExpired: token ? isTokenExpired(token) : true,
        isValid: valid 
      });
      
      setUser(currentUser);
      setIsAuthenticated(valid);
      
      // If token is invalid (not just expired), clear it
      if (token && isTokenExpired(token) && token.includes('invalid')) {
        console.log('Invalid token detected, clearing...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔐 Attempting login with backend...');
      
      // Call real backend API
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Backend login response:', response.data);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Check what kind of token we got
        console.log('🔐 Received token analysis:', {
          length: token.length,
          type: typeof token,
          sample: token.substring(0, 30) + '...',
          isRealJWT: isRealJWT(token),
          parts: token.split('.').length
        });
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true, user, token };
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      
      let errorMessage = 'Login failed';
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.response?.status === 404) {
        errorMessage = 'Cannot connect to server. Make sure backend is running on port 5000';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        checkAuth,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};