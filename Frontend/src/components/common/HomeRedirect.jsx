// components/common/HomeRedirect.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const HomeRedirect = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else {
        switch(user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'cashier':
            navigate('/cashier');
            break;
          default:
            navigate('/dashboard');
        }
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Redirecting...</p>
    </div>
  );
};

export default HomeRedirect;