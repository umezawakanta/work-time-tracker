import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;