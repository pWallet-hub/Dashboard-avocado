import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ allowedRoles, children }) => {
  const userRole = localStorage.getItem('role');
  
  if (!allowedRoles.includes(userRole)) {
    // Redirect to user's own dashboard
    const rolePath = userRole ? userRole.replace('_', '-') : 'farmer';
    return <Navigate to={`/dashboard/${rolePath}`} replace />;
  }
  
  return children;
};

export default RoleBasedRoute;