import { Navigate } from 'react-router-dom';

const Home = () => {
  const role = localStorage.getItem('role');
  const rolePath = role ? role.replace('_', '-') : 'farmer';
  return <Navigate to={`/dashboard/${rolePath}`} replace />;
};

export default Home;
