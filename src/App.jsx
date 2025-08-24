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
import PendingService from './Pages/Agent/PendingService'
import Report from './Pages/Agent/Report'
import Shop from './Pages/Agent/Shop'
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Home />} />
          
          {/* Admin Routes */}
          <Route path="admin" element={<Admin />} />
          <Route path="admin/users" element={<Users />} />
          <Route path="admin/agents" element={<Agents/>} />
          <Route path="admin/reports" element={<Reports/>} />
          <Route path="admin/shops" element={<ShopView/>} />
          <Route path="admin/statistics" element={<Statistics/>} />
          <Route path="admin/service-requests" element={<ServiceRequests/>} />
          
          {/* Agent Routes */}
          <Route path="agent" element={<Agent />} />
          <Route path='agent/FarmerList' element={<FarmerList/>}/>
          <Route path='agent/PendingService' element={<PendingService/>}/>
          <Route path='agent/Report' element={<Report/>}/>
          <Route path='agent/Shop' element={<Shop/>}/>
          
          {/* Farmer Routes */}
          <Route path="farmer" element={<Farmer />} />
          <Route path='farmer/market' element={<Market />} />
          <Route path="farmer/IrrigationKits" element={<IrrigationKits />} />
          <Route path="farmer/HarvestingKit" element={<HarvestingKit />} />
          <Route path='farmer/protection' element={<Protection/>}/>
          <Route path='farmer/container' element={<Container/>}/>
          <Route path='farmer/pest' element={<Pest/>}/>
          <Route path='farmer/service' element={<Service/>}/>
          <Route path='farmer/PestManagement' element={<PestManagement/>}/>
          <Route path='farmer/HarvestingDay' element={<HarvestingDay/>}/>
          <Route path='farmer/PropertyEvaluation' element={<PropertyEvaluation/>}/>
          <Route path='farmer/my-service-requests' element={<MyServiceRequests/>}/>
          <Route path='farmer/profile' element={<Profile/>}/>
          <Route path='farmer/product' element={<Product/>}/>
          
          {/* Shop Manager Routes */}
          <Route path="shop-manager" element={<ShopManager />} />
          <Route path='shop-manager/inventory' element={<ShopInventory/>}/>
          <Route path='shop-manager/orders' element={<ShopOrders/>}/>
          <Route path='shop-manager/sales' element={<ShopSales/>}/>
          <Route path='shop-manager/customers' element={<ShopCustomers/>}/>
          <Route path='shop-manager/products' element={<ShopProducts/>}/>
          <Route path='shop-manager/suppliers' element={<ShopSuppliers/>}/>
          <Route path='shop-manager/analytics' element={<ShopAnalytics/>}/>
          <Route path='shop-manager/profile' element={<ShopProfile/>}/>
          
        </Route>
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App