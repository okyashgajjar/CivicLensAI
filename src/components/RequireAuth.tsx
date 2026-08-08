import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth, type Role } from '../context/AuthContext';

interface RequireAuthProps {
  readonly children: ReactNode;
  readonly role?: Role;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, role }) => {
  const { role: currentRole } = useAuth();
  const location = useLocation();

  if (!currentRole) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && currentRole !== role) {
    return <Navigate to={currentRole === 'authority' ? '/admin' : '/'} replace />;
  }

  return <>{children}</>;
};
