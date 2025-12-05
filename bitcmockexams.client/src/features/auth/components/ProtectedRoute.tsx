import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@features/auth/context/AuthContext';
import { useEffect, useRef } from 'react';
import { useLoginModal } from '@features/auth/context/LoginModalContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { open } = useLoginModal();
  const openedRef = useRef(false);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const targetUrl = `${location.pathname}${location.search}${location.hash}`;
    useEffect(() => {
      if (!openedRef.current) {
        openedRef.current = true;
        open(targetUrl);
      }
    }, [open, targetUrl]);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
