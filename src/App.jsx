import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './Pages/Login/Login'
import ForgotPassword from './Pages/Login/ForgotPassword'
import ResetPassword from './Pages/Login/ResetPassword'
import Register from './Pages/Register/Register'
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
import AdminProfile from './Pages/Admin/Profile'
import AgentProfile from './Pages/Agent/Profile'
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
import ShopManagers from './Pages/Admin/ShopManagers'
import Transactions from './Pages/Admin/Transactions'

// New feature area imports (Farms/Trees/Geography, Diseases/Forecasting, Visits/Weather,
// Documents/ProfileAccess, Procurement/Settings/Logs/Monitoring, Training/Cart)
import AgentFarms from './Pages/Agent/Farms'
import AdminFarms from './Pages/Admin/Farms'
import AdminGeography from './Pages/Admin/Geography'
import AdminDiseases from './Pages/Admin/Diseases'
import AgentDiseaseCases from './Pages/Agent/DiseaseCases'
import AgentForecasting from './Pages/Agent/Forecasting'
import AdminForecasting from './Pages/Admin/Forecasting'
import AgentVisits from './Pages/Agent/Visits'
import FarmerWeather from './Pages/Farmer/Weather'
import AgentDocuments from './Pages/Agent/Documents'
import AdminDocumentReview from './Pages/Admin/DocumentReview'
import AgentProfileAccessQR from './Pages/Agent/ProfileAccessQR'
import ShopProcurement from './Pages/ShopManager/Procurement'
import AdminSettings from './Pages/Admin/Settings'
import AdminLogs from './Pages/Admin/Logs'
import AdminMonitoring from './Pages/Admin/Monitoring'
import AdminTraining from './Pages/Admin/Training'
import FarmerTraining from './Pages/Farmer/Training'
import FarmerCart from './Pages/Farmer/Cart'

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
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Ui/Toast';
import { ConfirmProvider } from './components/Ui/ConfirmDialog';

function App() {
  return (
    <ErrorBoundary>
    <ToastProvider>
    <ConfirmProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard/admin/service-requests" element={<AdminServiceRequestsDashboard />} />
          <Route index element={<Home />} />
          
          {/* Admin Routes */}
          <Route path="admin" element={<RoleBasedRoute allowedRoles={['admin']}><Admin /></RoleBasedRoute>} />
          <Route path="admin/profile" element={<RoleBasedRoute allowedRoles={['admin']}><AdminProfile /></RoleBasedRoute>} />
          <Route path="admin/users" element={<RoleBasedRoute allowedRoles={['admin']}><Users /></RoleBasedRoute>} />
          <Route path="admin/agents" element={<RoleBasedRoute allowedRoles={['admin']}><Agents/></RoleBasedRoute>} />
          <Route path="admin/reports" element={<RoleBasedRoute allowedRoles={['admin']}><Reports/></RoleBasedRoute>} />
          <Route path="admin/shops" element={<RoleBasedRoute allowedRoles={['admin']}><ShopView/></RoleBasedRoute>} />
          <Route path="admin/statistics" element={<RoleBasedRoute allowedRoles={['admin']}><Statistics/></RoleBasedRoute>} />
          <Route path="admin/service-requests" element={<RoleBasedRoute allowedRoles={['admin']}><ServiceRequests/></RoleBasedRoute>} />
          <Route path="/dashboard/admin/service-requests" element={<AdminServiceRequestsDashboard />} />
          <Route path="admin/shop-managers" element={<RoleBasedRoute allowedRoles={['admin']}><ShopManagers/></RoleBasedRoute>} />
          <Route path="admin/transactions" element={<RoleBasedRoute allowedRoles={['admin']}><Transactions/></RoleBasedRoute>} />
          <Route path="admin/farms" element={<RoleBasedRoute allowedRoles={['admin']}><AdminFarms/></RoleBasedRoute>} />
          <Route path="admin/geography" element={<RoleBasedRoute allowedRoles={['admin']}><AdminGeography/></RoleBasedRoute>} />
          <Route path="admin/diseases" element={<RoleBasedRoute allowedRoles={['admin']}><AdminDiseases/></RoleBasedRoute>} />
          <Route path="admin/forecasting" element={<RoleBasedRoute allowedRoles={['admin']}><AdminForecasting/></RoleBasedRoute>} />
          <Route path="admin/DocumentReview" element={<RoleBasedRoute allowedRoles={['admin']}><AdminDocumentReview/></RoleBasedRoute>} />
          <Route path="admin/settings" element={<RoleBasedRoute allowedRoles={['admin']}><AdminSettings/></RoleBasedRoute>} />
          <Route path="admin/logs" element={<RoleBasedRoute allowedRoles={['admin']}><AdminLogs/></RoleBasedRoute>} />
          <Route path="admin/monitoring" element={<RoleBasedRoute allowedRoles={['admin']}><AdminMonitoring/></RoleBasedRoute>} />
          <Route path="admin/training" element={<RoleBasedRoute allowedRoles={['admin']}><AdminTraining/></RoleBasedRoute>} />
          
          
          {/* Agent Routes */}
          <Route path="agent" element={<RoleBasedRoute allowedRoles={['agent']}><Agent /></RoleBasedRoute>} />
          <Route path="agent/profile" element={<RoleBasedRoute allowedRoles={['agent']}><AgentProfile /></RoleBasedRoute>} />
          <Route path='agent/FarmerList' element={<RoleBasedRoute allowedRoles={['agent']}><FarmerList/></RoleBasedRoute>}/>
          <Route path='agent/HarvestingPlan' element={<RoleBasedRoute allowedRoles={['agent']}><HarvestingPlan/></RoleBasedRoute>}/>
          <Route path='agent/IPMRoutine' element={<RoleBasedRoute allowedRoles={['agent']}><IPMRoutine/></RoleBasedRoute>}/>
          <Route path='agent/ServiceHistory' element={<RoleBasedRoute allowedRoles={['agent']}><ServiceHistory/></RoleBasedRoute>}/>
          <Route path='agent/Report' element={<RoleBasedRoute allowedRoles={['agent']}><Report/></RoleBasedRoute>}/>
          <Route path='agent/Shop' element={<RoleBasedRoute allowedRoles={['agent']}><Shop/></RoleBasedRoute>}/>
          <Route path='agent/farms' element={<RoleBasedRoute allowedRoles={['agent']}><AgentFarms/></RoleBasedRoute>}/>
          <Route path='agent/DiseaseCases' element={<RoleBasedRoute allowedRoles={['agent']}><AgentDiseaseCases/></RoleBasedRoute>}/>
          <Route path='agent/Forecasting' element={<RoleBasedRoute allowedRoles={['agent']}><AgentForecasting/></RoleBasedRoute>}/>
          <Route path='agent/Visits' element={<RoleBasedRoute allowedRoles={['agent']}><AgentVisits/></RoleBasedRoute>}/>
          <Route path='agent/Documents' element={<RoleBasedRoute allowedRoles={['agent']}><AgentDocuments/></RoleBasedRoute>}/>
          <Route path='agent/ProfileAccessQR' element={<RoleBasedRoute allowedRoles={['agent']}><AgentProfileAccessQR/></RoleBasedRoute>}/>
          
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
          <Route path='farmer/Weather' element={<RoleBasedRoute allowedRoles={['farmer']}><FarmerWeather/></RoleBasedRoute>}/>
          <Route path='farmer/training' element={<RoleBasedRoute allowedRoles={['farmer']}><FarmerTraining/></RoleBasedRoute>}/>
          <Route path='farmer/cart' element={<RoleBasedRoute allowedRoles={['farmer']}><FarmerCart/></RoleBasedRoute>}/>
          
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
          <Route path='shop-manager/procurement' element={<RoleBasedRoute allowedRoles={['shop_manager', 'admin']}><ShopProcurement/></RoleBasedRoute>}/>
          
        </Route>
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </Router>
    </ConfirmProvider>
    </ToastProvider>
    </ErrorBoundary>
  );
}

export default App