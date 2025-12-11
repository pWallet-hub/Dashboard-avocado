import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    // Redirect to user's own dashboard
    const rolePath = user.role ? user.role.replace('_', '-') : 'farmer';
    return <Navigate to={`/dashboard/${rolePath}`} replace />;
  }
  
  return children;
};

export default RoleBasedRoute;