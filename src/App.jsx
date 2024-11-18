import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './Pages/Login/Login'
import Dashboard from './Pages/Dashboard/Dashboard'
import Admin from './Pages/Admin/Admin'
import Agent from './Pages/Agent/Agent'
import Farmer from './Pages/Farmer/Farmer'
import Users from './Pages/Admin/Users'
import Home from './Pages/Home'
import Layout from './components/Layout/Layout';
import Market from './Pages/Farmer/Market'
import Profile from './Pages/Farmer/Profile'
import Service from './Pages/Farmer/Service'
import FarmerList from './Pages/Agent/FarmerList'
import PendingService from './Pages/Agent/PendingService'
import Report from './Pages/Agent/Report'
import Shop from './Pages/Agent/Shop'
import Agents from './Pages/Admin/Agents'
import Reports from './Pages/Admin/Reports'
import ShopView from './Pages/Admin/ShopView'
import Statistics from './Pages/Admin/Statistics'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="admin" element={<Admin />} />
          <Route path="admin/users" element={<Users />} />
          <Route path="admin/agents" element={<Agents/>} />
          <Route path="admin/reports" element={<Reports/>} />
          <Route path="admin/shops" element={<ShopView/>} />
          <Route path="admin/statistics" element={<Statistics/>} />
          <Route path="agent" element={<Agent />} />
          <Route path='agent/FarmerList' element={<FarmerList/>}/>
          <Route path='agent/PendingService' element={<PendingService/>}/>
          <Route path='agent/Report' element={<Report/>}/>
          <Route path='agent/Shop' element={<Shop/>}/>
          <Route path="farmer" element={<Farmer />} />
          <Route path='farmer/market' element={<Market />} />
          <Route path='farmer/service' element={<Service/>}/>
          <Route path='farmer/profile' element={<Profile/>}/>
        </Route>
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App