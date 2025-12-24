import api from './api';

// Simple JWT decode function
const decodeJWT = (token) => {
  if (!token) return null;
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

// Helper function to get current user without circular dependency
const getCurrentUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting user from storage:', error);
    return null;
  }
};

// Export authService object
export const authService = {
  login: async (email, password) => {
    try {
      console.log('🔐 Login attempt:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ Login response:', response.data);
      
      const { token, user } = response.data.data;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error) {
      console.error('❌ Login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    return getCurrentUserFromStorage();
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isTokenExpired: (token) => {
    if (!token) return true;
    
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    // exp is in seconds, convert to milliseconds
    return decoded.exp * 1000 < Date.now();
  },

  hasRole: (requiredRole) => {
    const user = getCurrentUserFromStorage();
    return user?.role === requiredRole;
  }
};