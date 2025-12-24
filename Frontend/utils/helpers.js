import moment from 'moment';

export const formatDate = (date, format = 'MMM DD, YYYY') => {
  return moment(date).format(format);
};

export const formatTime = (date, format = 'hh:mm A') => {
  return moment(date).format(format);
};

export const getRemainingDays = (expiryDate) => {
  const now = moment();
  const expiry = moment(expiryDate);
  const days = expiry.diff(now, 'days');
  return days > 0 ? days : 0;
};

export const getDayOfWeek = (date) => {
  return moment(date).format('dddd');
};

export const isToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

export const isThisWeek = (date) => {
  return moment(date).isSame(moment(), 'week');
};

export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
};

export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateAvatarColor = (name) => {
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#fa709a', '#fee140', '#30cfd0', '#330867'
  ];
  
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};