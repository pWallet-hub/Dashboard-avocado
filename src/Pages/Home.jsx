import { Navigate } from 'react-router-dom';
import { homeRouteFor } from '../components/Layout/navConfig';

/** /dashboard index: send each role to its own home page. */
const Home = () => <Navigate to={homeRouteFor(localStorage.getItem('role'))} replace />;

export default Home;
