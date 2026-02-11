import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface AuthRouteProps {
  children: ReactNode;
}

function AuthRoute({ children }: AuthRouteProps) {
  // Kiểm tra token trong localStorage
  const token = localStorage.getItem('token');
  
  // Nếu không có token -> redirect về /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Nếu có token -> render component con
  return <>{children}</>;
}

export default AuthRoute;
