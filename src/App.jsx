import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './Pages/Login/Login'
import Dashboard from './Pages/Dashboard/Dashboard'
import Admin from './Pages/Admin/Admin'
import Agent from './Pages/Agent/Agent'
import Farmer from './Pages/Farmer/Farmer'
import ShopManager from './Pages/ShopManager/ShopManager' // New import
import Users from './Pages/Admin/Users'
import Home from './Pages/Home'
import Layout from './components/Layout/Layout';
import Market from './Pages/Farmer/Market'
import IrrigationKits from './Pages/Farmer/Irrigationkits'
import HarvestingKit from './Pages/Farmer/HarvestingKit'
import Protection from './Pages/Farmer/Protection'
import Container from './Pages/Farmer/Container'
import Pest from './Pages/Farmer/Pest'
import Profile from './Pages/Farmer/Profile'
import Service from './Pages/Farmer/Service'
import PestManagement from './Pages/Farmer/PestManagement'
import HarvestingDay from './Pages/Farmer/HarvestingDay'
import PropertyEvaluation from './Pages/Farmer/PropertyEvaluation'
import Product from './Pages/Farmer/Product'
import MyServiceRequests from './Pages/Farmer/MyServiceRequests'
import FarmerList from './Pages/Agent/FarmerList'
import HarvestingPlan from './Pages/Agent/HarvestingPlan'
import IPMRoutine from './Pages/Agent/IPMRoutine'
import Report from './Pages/Agent/Report'
import Shop from './Pages/Agent/Shop'
import ServiceHistory from './Pages/Agent/ServiceHistory'
import Agents from './Pages/Admin/Agents'
import Reports from './Pages/Admin/Reports'
import ShopView from './Pages/Admin/ShopView'
import Statistics from './Pages/Admin/Statistics'
import ServiceRequests from './Pages/Admin/ServiceRequests'

// New Shop Manager imports
import ShopInventory from './Pages/ShopManager/ShopInventory'
import ShopOrders from './Pages/ShopManager/ShopOrders'
import ShopSales from './Pages/ShopManager/ShopSales'
import ShopCustomers from './Pages/ShopManager/ShopCustomers'
import ShopAnalytics from './Pages/ShopManager/ShopAnalytics'
import ShopProfile from './Pages/ShopManager/ShopProfile'
import ShopSuppliers from './Pages/ShopManager/ShopSuppliers'
import ShopProducts from './Pages/ShopManager/ShopProducts'

// Import route protection components
import ProtectedRoute from './components/Layout/ProtectedRoute';
import RoleBasedRoute from './components/Layout/RoleBasedRoute';
import AdminServiceRequestsDashboard from './components/Dashboard/AdminServiceRequestsDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard/admin/service-requests" element={<AdminServiceRequestsDashboard />} />
          <Route index element={<Home />} />
          
          {/* Admin Routes */}
          <Route path="admin" element={<RoleBasedRoute allowedRoles={['admin']}><Admin /></RoleBasedRoute>} />
          <Route path="admin/users" element={<RoleBasedRoute allowedRoles={['admin']}><Users /></RoleBasedRoute>} />
          <Route path="admin/agents" element={<RoleBasedRoute allowedRoles={['admin']}><Agents/></RoleBasedRoute>} />
          <Route path="admin/reports" element={<RoleBasedRoute allowedRoles={['admin']}><Reports/></RoleBasedRoute>} />
          <Route path="admin/shops" element={<RoleBasedRoute allowedRoles={['admin']}><ShopView/></RoleBasedRoute>} />
          <Route path="admin/statistics" element={<RoleBasedRoute allowedRoles={['admin']}><Statistics/></RoleBasedRoute>} />
          <Route path="admin/service-requests" element={<RoleBasedRoute allowedRoles={['admin']}><ServiceRequests/></RoleBasedRoute>} />
          <Route path="/dashboard/admin/service-requests" element={<AdminServiceRequestsDashboard />} />
          
          
          {/* Agent Routes */}
          <Route path="agent" element={<RoleBasedRoute allowedRoles={['agent']}><Agent /></RoleBasedRoute>} />
          <Route path='agent/FarmerList' element={<RoleBasedRoute allowedRoles={['agent']}><FarmerList/></RoleBasedRoute>}/>
          <Route path='agent/HarvestingPlan' element={<RoleBasedRoute allowedRoles={['agent']}><HarvestingPlan/></RoleBasedRoute>}/>
          <Route path='agent/IPMRoutine' element={<RoleBasedRoute allowedRoles={['agent']}><IPMRoutine/></RoleBasedRoute>}/>
          <Route path='agent/ServiceHistory' element={<RoleBasedRoute allowedRoles={['agent']}><ServiceHistory/></RoleBasedRoute>}/>
          <Route path='agent/Report' element={<RoleBasedRoute allowedRoles={['agent']}><Report/></RoleBasedRoute>}/>
          <Route path='agent/Shop' element={<RoleBasedRoute allowedRoles={['agent']}><Shop/></RoleBasedRoute>}/>
          
          {/* Farmer Routes */}
          <Route path="farmer" element={<RoleBasedRoute allowedRoles={['farmer']}><Farmer /></RoleBasedRoute>} />
          <Route path='farmer/market' element={<RoleBasedRoute allowedRoles={['farmer']}><Market /></RoleBasedRoute>} />
          <Route path="farmer/IrrigationKits" element={<RoleBasedRoute allowedRoles={['farmer']}><IrrigationKits /></RoleBasedRoute>} />
          <Route path="farmer/HarvestingKit" element={<RoleBasedRoute allowedRoles={['farmer']}><HarvestingKit /></RoleBasedRoute>} />
          <Route path='farmer/protection' element={<RoleBasedRoute allowedRoles={['farmer']}><Protection/></RoleBasedRoute>}/>
          <Route path='farmer/container' element={<RoleBasedRoute allowedRoles={['farmer']}><Container/></RoleBasedRoute>}/>
          <Route path='farmer/pest' element={<RoleBasedRoute allowedRoles={['farmer']}><Pest/></RoleBasedRoute>}/>
          <Route path='farmer/service' element={<RoleBasedRoute allowedRoles={['farmer']}><Service/></RoleBasedRoute>}/>
          <Route path='farmer/PestManagement' element={<RoleBasedRoute allowedRoles={['farmer']}><PestManagement/></RoleBasedRoute>}/>
          <Route path='farmer/HarvestingDay' element={<RoleBasedRoute allowedRoles={['farmer']}><HarvestingDay/></RoleBasedRoute>}/>
          <Route path='farmer/PropertyEvaluation' element={<RoleBasedRoute allowedRoles={['farmer']}><PropertyEvaluation/></RoleBasedRoute>}/>
          <Route path='farmer/my-service-requests' element={<RoleBasedRoute allowedRoles={['farmer']}><MyServiceRequests/></RoleBasedRoute>}/>
          <Route path='farmer/profile' element={<RoleBasedRoute allowedRoles={['farmer']}><Profile/></RoleBasedRoute>}/>
          <Route path='farmer/product' element={<RoleBasedRoute allowedRoles={['farmer']}><Product/></RoleBasedRoute>}/>
          
          {/* Shop Manager Routes */}
          <Route path="shop-manager" element={<RoleBasedRoute allowedRoles={['shop_manager']}><ShopManager /></RoleBasedRoute>} />
          <Route path='shop-manager/inventory' element={<RoleBasedRoute allowedRoles={['shop_manager']}><ShopInventory/></RoleBasedRoute>}/>
          <Route path='shop-manager/orders' element={<RoleBasedRoute allowedRoles={['shop_manager']}><ShopOrders/></RoleBasedRoute>}/>
          <Route path='shop-manager/sales' element={<RoleBasedRoute allowedRoles={['shop_manager']}><ShopSales/></RoleBasedRoute>}/>
          <Route path='shop-manager/customers' element={<RoleBasedRoute allowedRoles={['shop_manager']}><ShopCustomers/></RoleBasedRoute>}/>
          <Route path='shop-manager/products' element={<RoleBasedRoute allowedRoles={['shop_manager']}><ShopProducts/></RoleBasedRoute>}/>
          <Route path='shop-manager/suppliers' element={<RoleBasedRoute allowedRoles={['shop_manager']}><ShopSuppliers/></RoleBasedRoute>}/>
          <Route path='shop-manager/analytics' element={<RoleBasedRoute allowedRoles={['shop_manager']}><ShopAnalytics/></RoleBasedRoute>}/>
          <Route path='shop-manager/profile' element={<RoleBasedRoute allowedRoles={['shop_manager']}><ShopProfile/></RoleBasedRoute>}/>
          
        </Route>
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App