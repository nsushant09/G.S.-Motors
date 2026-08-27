import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../lib/adminAuth';

export function RequireAdmin() {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
