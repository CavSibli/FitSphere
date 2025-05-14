import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, checkSession } from '../middleware/auth';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      const isValid = await checkSession();
      setIsAuthorized(isValid);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute; 