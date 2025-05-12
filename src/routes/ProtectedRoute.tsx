import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === undefined) {
    return <div>Loading...</div>; // or add a fancy spinner here!
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;