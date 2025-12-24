import { useAuth } from '../contexts/AuthContext';

const useAuthHook = () => {
  const auth = useAuth();
  
  const hasPermission = (requiredRole) => {
    return auth.user?.role === requiredRole;
  };
  
  const isAdmin = () => {
    return auth.user?.role === 'admin';
  };
  
  const isCashier = () => {
    return auth.user?.role === 'cashier';
  };
  
  const isUser = () => {
    return auth.user?.role === 'user';
  };
  
  return {
    ...auth,
    hasPermission,
    isAdmin,
    isCashier,
    isUser
  };
};

export default useAuthHook;