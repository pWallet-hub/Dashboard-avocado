import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '../../hooks/useAuth.jsx'; // Import the auth hook

const Layout = () => {
  const role = localStorage.getItem('role'); 
  const username = localStorage.getItem('username'); 

  const handleLogout = async () => {
    try {
      // Use authService.logout() instead of manual token removal
      await logout();
    } catch (error) {
      // Even if logout fails on the server, we should clear local data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('id');
      localStorage.removeItem('username');
    } finally {
      // Redirect to login page
      window.location.href = '/';
    }
  };

  // Guard: if no role (not logged in), redirect to login
  if (!role) {
    return <Navigate to="/" replace />;
  }

  // Create user object with name property
  const user = {
    name: username || 'Guest',
    email: username,
    role: role
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar role={role} />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar */}
        <TopBar onLogout={handleLogout} user={user} />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;