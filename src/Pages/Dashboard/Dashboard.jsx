import { useEffect, useState } from 'react';
import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import * as XLSX from 'xlsx';
import { CiLogout } from "react-icons/ci";
import Select from 'react-select'; 
import { listFarmers as apiListFarmers, updateUser as apiUpdateUser, deleteUser as apiDeleteUser } from '../../services/usersService';
import { initializeStorage, getFarmerProducts, getFarmerToShopTransactions, getShopInventory } from '../../services/marketStorageService';
import { 
  BarChart3, TrendingUp, Package, DollarSign, ShoppingCart, 
  Users, Calendar, Eye, Plus, Truck, Store, Activity
} from 'lucide-react';

const Dashboard = () => {
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null); // Updated to match react-select
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [farmerMetrics, setFarmerMetrics] = useState({});
  const [farmerProducts, setFarmerProducts] = useState([]);
  const [shopIntegration, setShopIntegration] = useState({});

  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiListFarmers();
        // Assuming the response structure contains a 'data' array
        const farmersData = response.data || response;
        setFarmers(farmersData);
      } catch (error) {
        setError('Failed to fetch farmers data');
        console.error('Error fetching farmers:', error);
        // Fallback to empty array instead of demo data
        setFarmers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
    loadFarmerDashboardData();
  }, []);

  // Load farmer market and shop integration data
  useEffect(() => {
    loadFarmerDashboardData();
  }, [activeView]);

  const loadFarmerDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      initializeStorage();
      
      // Get current farmer (in real app, this would come from auth)
      const currentFarmer = getCurrentFarmer();
      
      // Load farmer's products with error handling
      let products = [];
      try {
        products = await getFarmerProducts(currentFarmer.id) || [];
      } catch (err) {
        console.error('Error in getFarmerProducts:', err);
        setError('Failed to load farmer products');
      }
      setFarmerProducts(products);
      
      // Load shop integration data with error handling
      let transactions = [];
      try {
        transactions = await getFarmerToShopTransactions() || [];
      } catch (err) {
        console.error('Error in getFarmerToShopTransactions:', err);
        setError('Failed to load transactions');
      }
      const farmerTransactions = transactions.filter(t => t.farmerId === currentFarmer.id);
      
      let inventory = [];
      try {
        inventory = await getShopInventory() || [];
      } catch (err) {
        console.error('Error in getShopInventory:', err);
        setError('Failed to load shop inventory');
      }
      const farmerInventoryItems = inventory.filter(item => 
        item.sourceType === 'farmer' && item.supplierId === currentFarmer.id
      );
      
      // Calculate metrics
      const totalRevenue = farmerTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
      const totalProducts = products.length;
      const syncedProducts = farmerInventoryItems.length;
      const availableProducts = products.filter(p => p.status === 'available').length;
      
      setFarmerMetrics({
        totalProducts,
        syncedProducts,
        availableProducts,
        totalRevenue,
        totalTransactions: farmerTransactions.length,
        avgPrice: totalProducts > 0 ? products.reduce((sum, p) => sum + p.pricePerUnit, 0) / totalProducts : 0
      });
      
      setShopIntegration({
        transactions: farmerTransactions,
        inventoryItems: farmerInventoryItems,
        syncRate: totalProducts > 0 ? (syncedProducts / totalProducts) * 100 : 0
      });
      
    } catch (error) {
      console.error('Error loading farmer dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentFarmer = () => {
    // In a real app, this would come from authentication
    return {
      id: 'f1',
      name: 'Jean Uwimana',
      location: 'Gasabo, Remera'
    };
  };

  // Remove Airtable preview effect as services are no longer available

  const openModal = (farmer, editMode = false) => {
    setSelectedFarmer(farmer);
    setIsEditMode(editMode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFarmer(null);
    setIsEditMode(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      closeModal();
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(farmers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Farmers');
    XLSX.writeFile(workbook, 'FarmersData.xlsx');
  };

  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption ? selectedOption.value : '');
  };

  const districtOptions = farmers
    .map(farmer => farmer.district)
    .filter((value, index, self) => self.indexOf(value) === index)
    .map(district => ({
      label: district,
      value: district
    }));

  const filteredFarmers = selectedDistrict
    ? farmers.filter(farmer => farmer.district === selectedDistrict)
    : farmers;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleEdit = async (farmer) => {
    const { id, ...fields } = farmer;
    try {
      const updatedRecord = await apiUpdateUser(id, fields);
      setFarmers(farmers.map(f => (f.id === id ? updatedRecord : f)));
      closeModal();
    } catch (error) {
      setError('There was an error updating the farmer!');
      console.error(error);
    }
  };

  const handleDelete = async (farmerId) => {
    try {
      await apiDeleteUser(farmerId);
      setFarmers(farmers.filter(f => f.id !== farmerId));
    } catch (error) {
      setError('There was an error deleting the farmer!');
      console.error(error);
    }
  };

  const FarmerOverview = () => (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{farmerMetrics.totalProducts || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-green-600 font-medium">{farmerMetrics.availableProducts || 0} available</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Shop Integration</p>
              <p className="text-2xl font-bold text-gray-900">{farmerMetrics.syncedProducts || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Store className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-blue-600 font-medium">{shopIntegration.syncRate?.toFixed(1) || 0}% synced</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${(farmerMetrics.totalRevenue || 0).toFixed(2)}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-yellow-600 font-medium">{farmerMetrics.totalTransactions || 0} transactions</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Price</p>
              <p className="text-2xl font-bold text-gray-900">${(farmerMetrics.avgPrice || 0).toFixed(2)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-purple-600 font-medium">per unit</span>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Recent Products</h3>
          <button 
            onClick={() => setActiveView('products')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farmerProducts.slice(0, 6).map((product) => (
            <div key={product.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">{product.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.status}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Quantity:</strong> {product.quantity} {product.unit}</p>
                <p><strong>Price:</strong> ${product.pricePerUnit}/{product.unit}</p>
                <p><strong>Quality:</strong> {product.quality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shop Integration Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Shop Integration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Recent Transactions</h4>
            <div className="space-y-2">
              {shopIntegration.transactions?.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{transaction.productName}</p>
                    <p className="text-xs text-gray-500">{transaction.transactionDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${transaction.totalAmount}</p>
                    <p className="text-xs text-gray-500">{transaction.quantity} units</p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-sm">No transactions yet</p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Products in Shop</h4>
            <div className="space-y-2">
              {shopIntegration.inventoryItems?.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Shop Price: ${item.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.quantity} {item.unit}</p>
                    <p className={`text-xs ${item.status === 'in-stock' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {item.status}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-sm">No products synced yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const FarmerProductsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">My Products</h3>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmerProducts.map((product) => (
            <div key={product.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Category:</strong> {product.category}</p>
                <p><strong>Quantity:</strong> {product.quantity} {product.unit}</p>
                <p><strong>Price:</strong> ${product.pricePerUnit}/{product.unit}</p>
                <p><strong>Quality:</strong> {product.quality}</p>
                <p><strong>Harvest Date:</strong> {product.harvestDate}</p>
              </div>
              
              {/* Shop Integration Status */}
              <div className="mt-4 p-2 bg-blue-50 rounded">
                {shopIntegration.inventoryItems?.find(item => item.sourceId === product.id) ? (
                  <div className="flex items-center text-blue-600">
                    <Store className="h-4 w-4 mr-1" />
                    <span className="text-xs">Synced to Shop</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <Activity className="h-4 w-4 mr-1" />
                    <span className="text-xs">Not synced</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button className="text-blue-600 hover:text-blue-900">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="text-green-600 hover:text-green-900">
                  <FiEdit className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {farmerProducts.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No products added yet. Click "Add Product" to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center p-5 mb-5 text-white bg-teal-700 rounded-lg mx-5 mt-5">
          <img src={logo} alt="Logo" className="w-24 mr-5" />
          <div className="flex-grow">
            <h1 className="mb-1 text-2xl font-bold">Farmer Dashboard - {getCurrentFarmer().name}</h1>
            <p className="text-lg opacity-80">
              Manage your products and track shop integration
            </p>
          </div>
          <button className="flex items-center px-4 py-2 ml-auto text-white transition duration-300 bg-green-500 rounded hover:bg-green-600" onClick={handleLogout}>
            <CiLogout className="mr-2 text-2xl" /> Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mx-5 mb-5 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'overview'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveView('products')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'products'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Package className="h-4 w-4 inline mr-2" />
            My Products
          </button>
          <button
            onClick={() => setActiveView('farmers')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'farmers'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Farmers Directory
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        {loading && <div className="text-center py-8">Loading...</div>}
        {error && <div className="text-center py-8 text-red-500">{error}</div>}
        {activeView === 'overview' && <FarmerOverview />}
        {activeView === 'products' && <FarmerProductsView />}
        {activeView === 'farmers' && <FarmersDirectory />}
      </div>
    </div>
  );

  function FarmersDirectory() {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Farmers Directory</h2>
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 text-white transition duration-300 bg-green-600 rounded hover:bg-green-700"
                onClick={() => setIsModalOpen(true)}
              >
                Add Farmer
              </button>
              <button 
                className="px-4 py-2 text-white transition duration-300 bg-green-600 rounded hover:bg-green-700" 
                onClick={exportToExcel}
              >
                Export to Excel
              </button>
            </div>
          </div>

          <div className="flex items-center gap-8 mb-5">
            <label htmlFor="district-select" className="text-sm font-medium text-gray-700">Filter by District:</label>
            <Select
              id="district-select"
              options={districtOptions}
              isClearable
              onChange={handleDistrictChange}
              placeholder="Select or search district"
            />
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <p>Loading data...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : filteredFarmers.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-white bg-green-500">First Name</th>
                    <th className="p-3 text-white bg-green-500">Last Name</th>
                    <th className="p-3 text-white bg-green-500">Telephone</th>
                    <th className="p-3 text-white bg-green-500">Age</th>
                    <th className="p-3 text-white bg-green-500">District</th>
                    <th className="p-3 text-white bg-green-500">Sector</th>
                    <th className="p-3 text-white bg-green-500">Cell</th>
                    <th className="p-3 text-white bg-green-500">Village</th>
                    <th className="p-3 text-white bg-green-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFarmers.map((farmer, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">{farmer.firstname || 'N/A'}</td>
                      <td className="p-3">{farmer.lastname || 'N/A'}</td>
                      <td className="p-3">{farmer.telephone || 'N/A'}</td>
                      <td className="p-3">{farmer.age || 'N/A'}</td>
                      <td className="p-3">{farmer.district || 'N/A'}</td>
                      <td className="p-3">{farmer.sector || 'N/A'}</td>
                      <td className="p-3">{farmer.cell || 'N/A'}</td>
                      <td className="p-3">{farmer.village || 'N/A'}</td>
                      <td className="flex gap-2 ml-[-1rem]">
                        <button className="px-2 py-1 text-white transition duration-300 bg-blue-500 rounded hover:bg-blue-600" onClick={() => openModal(farmer, false)}>View</button>
                        <button className="px-2 py-1 text-white transition duration-300 bg-yellow-500 rounded hover:bg-yellow-600" onClick={() => openModal(farmer, true)}><FiEdit /></button>
                        <button 
                          className="px-2 py-1 text-white transition duration-300 bg-red-500 rounded hover:bg-red-600" 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this farmer?')) {
                              handleDelete(farmer.id);
                            }
                          }}
                        >
                          <MdOutlineDeleteOutline />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No Farmers Available</p>
            )}
          </div>
        </div>
        {isModalOpen && selectedFarmer && (
          <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50" onClick={handleOverlayClick}>
            <div className="bg-white p-8 w-96 rounded-lg shadow-lg relative max-h-[80vh] flex flex-col">
              <span className="absolute text-2xl cursor-pointer top-2 right-5" onClick={closeModal}>&times;</span>
              <h2 className="mb-4 text-xl">Farmer Details</h2>
              <div className="flex-grow overflow-y-auto pr-4 mr-[-1rem]">
                {Object.entries(selectedFarmer).map(([key, value]) => (
                  <p key={key} className="flex items-center justify-between mb-4 text-sm text-green-600">
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                    {isEditMode ? (
                      <input
                        type="text"
                        name={key}
                        value={value || ''}
                        onChange={(e) => setSelectedFarmer({ ...selectedFarmer, [key]: e.target.value })}
                        className="flex-grow p-1 ml-4 text-sm border border-gray-300 rounded"
                      />
                    ) : (
                      ` ${value || 'N/A'}`
                    )}
                  </p>
                ))}
              </div>
              {isEditMode && (
                <div className="flex justify-center gap-5 mt-4">
                  <button className="px-4 py-2 text-white transition duration-300 bg-yellow-500 rounded hover:bg-yellow-600" onClick={() => handleEdit(selectedFarmer)} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="px-4 py-2 text-white transition duration-300 bg-red-500 rounded hover:bg-red-600" onClick={closeModal}>Cancel</button>
                </div>
              )}
              {error && <p className="mt-4 text-red-500">{error}</p>}
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default Dashboard;