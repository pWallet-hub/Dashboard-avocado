import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './Pages/Login/Login'
import Admin from './Pages/Admin/Admin'
import Agent from './Pages/Agent/Agent'
import Farmer from './Pages/Farmer/Farmer'
import ShopManager from './Pages/ShopManager/ShopManager'
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
import QRCodeManagement from './Pages/Agent/QRCodeManagement'
import Agents from './Pages/Admin/Agents'
import Reports from './Pages/Admin/Reports'
import ShopView from './Pages/Admin/ShopView'
import Statistics from './Pages/Admin/Statistics'
import ServiceRequests from './Pages/Admin/ServiceRequests'
import SystemMonitoring from './Pages/Admin/SystemMonitoring'
import NotificationsManagement from './Pages/Admin/NotificationsManagement'
import LogsManagement from './Pages/Admin/LogsManagement'
import ApiTesting from './Pages/Admin/ApiTesting'
import ApiStatus from './Pages/Admin/ApiStatus'
import SystemTest from './Pages/Admin/SystemTest'

// Shop Manager imports
import ShopInventory from './Pages/ShopManager/ShopInventory'
import ShopOrders from './Pages/ShopManager/ShopOrders'
import ShopSales from './Pages/ShopManager/ShopSales'
import ShopCustomers from './Pages/ShopManager/ShopCustomers'
import ShopAnalytics from './Pages/ShopManager/ShopAnalytics'
import ShopProfile from './Pages/ShopManager/ShopProfile'
import ShopSuppliers from './Pages/ShopManager/ShopSuppliers'
import ShopProducts from './Pages/ShopManager/ShopProducts'

// Route protection components
import ProtectedRoute from './components/Layout/ProtectedRoute';
import RoleBasedRoute from './components/Layout/RoleBasedRoute';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Home />} />
            
            {/* Admin Routes */}
            <Route path="admin" element={<RoleBasedRoute allowedRoles={['admin']}><Admin /></RoleBasedRoute>} />
            <Route path="admin/users" element={<RoleBasedRoute allowedRoles={['admin']}><Users /></RoleBasedRoute>} />
            <Route path="admin/agents" element={<RoleBasedRoute allowedRoles={['admin']}><Agents/></RoleBasedRoute>} />
            <Route path="admin/reports" element={<RoleBasedRoute allowedRoles={['admin']}><Reports/></RoleBasedRoute>} />
            <Route path="admin/shops" element={<RoleBasedRoute allowedRoles={['admin']}><ShopView/></RoleBasedRoute>} />
            <Route path="admin/statistics" element={<RoleBasedRoute allowedRoles={['admin']}><Statistics/></RoleBasedRoute>} />
            <Route path="admin/service-requests" element={<RoleBasedRoute allowedRoles={['admin']}><ServiceRequests/></RoleBasedRoute>} />
            <Route path="admin/monitoring" element={<RoleBasedRoute allowedRoles={['admin']}><SystemMonitoring/></RoleBasedRoute>} />
            <Route path="admin/notifications" element={<RoleBasedRoute allowedRoles={['admin']}><NotificationsManagement/></RoleBasedRoute>} />
            <Route path="admin/logs" element={<RoleBasedRoute allowedRoles={['admin']}><LogsManagement/></RoleBasedRoute>} />
            <Route path="admin/api-testing" element={<RoleBasedRoute allowedRoles={['admin']}><ApiTesting/></RoleBasedRoute>} />
            <Route path="admin/api-status" element={<RoleBasedRoute allowedRoles={['admin']}><ApiStatus/></RoleBasedRoute>} />
            <Route path="admin/system-test" element={<RoleBasedRoute allowedRoles={['admin']}><SystemTest/></RoleBasedRoute>} />
            
            {/* Agent Routes */}
            <Route path="agent" element={<RoleBasedRoute allowedRoles={['agent']}><Agent /></RoleBasedRoute>} />
            <Route path='agent/farmers' element={<RoleBasedRoute allowedRoles={['agent']}><FarmerList/></RoleBasedRoute>}/>
            <Route path='agent/harvest-plan' element={<RoleBasedRoute allowedRoles={['agent']}><HarvestingPlan/></RoleBasedRoute>}/>
            <Route path='agent/ipm-routine' element={<RoleBasedRoute allowedRoles={['agent']}><IPMRoutine/></RoleBasedRoute>}/>
            <Route path='agent/service-history' element={<RoleBasedRoute allowedRoles={['agent']}><ServiceHistory/></RoleBasedRoute>}/>
            <Route path='agent/reports' element={<RoleBasedRoute allowedRoles={['agent']}><Report/></RoleBasedRoute>}/>
            <Route path='agent/shop' element={<RoleBasedRoute allowedRoles={['agent']}><Shop/></RoleBasedRoute>}/>
            <Route path='agent/qr-management' element={<RoleBasedRoute allowedRoles={['agent']}><QRCodeManagement/></RoleBasedRoute>}/>
            
            {/* Farmer Routes */}
            <Route path="farmer" element={<RoleBasedRoute allowedRoles={['farmer']}><Farmer /></RoleBasedRoute>} />
            <Route path='farmer/market' element={<RoleBasedRoute allowedRoles={['farmer']}><Market /></RoleBasedRoute>} />
            <Route path="farmer/irrigation-kits" element={<RoleBasedRoute allowedRoles={['farmer']}><IrrigationKits /></RoleBasedRoute>} />
            <Route path="farmer/harvesting-kit" element={<RoleBasedRoute allowedRoles={['farmer']}><HarvestingKit /></RoleBasedRoute>} />
            <Route path='farmer/protection' element={<RoleBasedRoute allowedRoles={['farmer']}><Protection/></RoleBasedRoute>}/>
            <Route path='farmer/containers' element={<RoleBasedRoute allowedRoles={['farmer']}><Container/></RoleBasedRoute>}/>
            <Route path='farmer/pest-management' element={<RoleBasedRoute allowedRoles={['farmer']}><Pest/></RoleBasedRoute>}/>
            <Route path='farmer/services' element={<RoleBasedRoute allowedRoles={['farmer']}><Service/></RoleBasedRoute>}/>
            <Route path='farmer/pest-management-request' element={<RoleBasedRoute allowedRoles={['farmer']}><PestManagement/></RoleBasedRoute>}/>
            <Route path='farmer/harvest-request' element={<RoleBasedRoute allowedRoles={['farmer']}><HarvestingDay/></RoleBasedRoute>}/>
            <Route path='farmer/property-evaluation' element={<RoleBasedRoute allowedRoles={['farmer']}><PropertyEvaluation/></RoleBasedRoute>}/>
            <Route path='farmer/service-requests' element={<RoleBasedRoute allowedRoles={['farmer']}><MyServiceRequests/></RoleBasedRoute>}/>
            <Route path='farmer/profile' element={<RoleBasedRoute allowedRoles={['farmer']}><Profile/></RoleBasedRoute>}/>
            <Route path='farmer/products' element={<RoleBasedRoute allowedRoles={['farmer']}><Product/></RoleBasedRoute>}/>
            
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
          <Route path="/unauthorized" element={<div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </div>
          </div>} />
          <Route path="*" element={<div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
              <p className="text-gray-600">The page you're looking for doesn't exist.</p>
            </div>
          </div>} />
        </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App