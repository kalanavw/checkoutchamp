
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PublicRouteProps {
  restricted?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ restricted = true }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect to dashboard if user is authenticated and route is restricted
  if (isAuthenticated && restricted) {
    return <Navigate to="/" replace />;
  }
  
  // Render for unauthenticated users or non-restricted public routes
  return <Outlet />;
};

export default PublicRoute;
