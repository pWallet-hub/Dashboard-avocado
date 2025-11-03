import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import Select from 'react-select';
import {
  getAllShops,
  updateShop,
  deleteShop,
  exportShopsToExcel
} from '../../services/shopService';
import {
  Store, MapPin, User, Phone, Mail, Edit, Trash2, Download,
  Search, Eye, Building2, MapPinned, TrendingUp, CheckCircle2,
  XCircle, Filter, RefreshCw, Users, Globe
} from 'lucide-react';

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: '0.75rem',
    borderColor: state.isFocused ? '#0f4c3a' : '#d1d5db',
    padding: '0.25rem',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(15, 76, 58, 0.1)' : 'none',
    '&:hover': { borderColor: '#9ca3af' },
    backgroundColor: '#f9fdfb',
    transition: 'all 0.2s',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
    border: '1px solid #d1d5db',
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected ? '#0f4c3a' : isFocused ? '#ecfdf5' : '#fff',
    color: isSelected ? '#fff' : '#1f2937',
    fontWeight: isSelected ? 600 : 400,
    '&:active': { backgroundColor: '#d1fae5' },
  }),
};

export default function ShopSuppliers() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    shopName: '',
    description: '',
    province: '',
    district: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
  });

  const provinces = [
    'Kigali',
    'Eastern Province',
    'Northern Province',
    'Southern Province',
    'Western Province',
  ];

  const districts = {
    Kigali: ['Gasabo', 'Kicukiro', 'Nyarugenge'],
    'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
    'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
    'Southern Province': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
    'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Starting to fetch shops...');
      const response = await getAllShops();
      console.log('Response received:', response);
      if (response.success && response.data) {
        const shopsData = Array.isArray(response.data) ? response.data : [];
        console.log(`Successfully loaded ${shopsData.length} shops`);
        setShops(shopsData);
        if (shopsData.length === 0) {
          setError('No shops found. Create your first shop to get started!');
        }
      } else {
        setShops([]);
        setError(response.message || 'Failed to load shops.');
      }
    } catch (error) {
      console.error('Error in fetchShops:', error);
      setShops([]);
      if (error.message?.includes('timeout') || error.message?.includes('starting up')) {
        setError('The server is waking up (this can take 30-60 seconds on first request). Please click Retry.');
      } else if (error.message?.includes('Network error')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You do not have permission to view shops.');
      } else {
        setError(error.message || 'Failed to load shops. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditShop = (shop) => {
    setSelectedShop(shop);
    setEditFormData({
      shopName: shop.shopName,
      description: shop.description,
      province: shop.province,
      district: shop.district,
      ownerName: shop.ownerName,
      ownerEmail: shop.ownerEmail,
      ownerPhone: shop.ownerPhone,
    });
    setIsEditModalOpen(true);
  };

  const handleViewShop = (shop) => {
    setSelectedShop(shop);
    setIsViewModalOpen(true);
  };

  const handleEditFormChange = (name, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'province' && { district: '' }),
    }));
  };

  const handleUpdateShop = async () => {
    if (!selectedShop) return;
    setLoading(true);
    try {
      const response = await updateShop(selectedShop.id, editFormData);
      if (response.success) {
        alert('Shop updated successfully!');
        setIsEditModalOpen(false);
        fetchShops();
      }
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || 'Failed to update shop'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShop = async (shopId) => {
    if (!window.confirm('Are you sure you want to delete this shop?')) return;
    try {
      const response = await deleteShop(shopId);
      if (response.success) {
        alert('Shop deleted successfully');
        fetchShops();
      }
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || 'Failed to delete shop'}`);
    }
  };

  const exportToExcel = () => {
    if (shops.length === 0) {
      alert('No shops data to export');
      return;
    }
    exportShopsToExcel(shops);
  };

  const clearFilters = () => {
    setSelectedDistrict(null);
    setSelectedProvince(null);
    setSearchQuery('');
  };

  const filteredShops = shops.filter((shop) => {
    const matchesDistrict = !selectedDistrict || shop.district === selectedDistrict;
    const matchesProvince = !selectedProvince || shop.province === selectedProvince;
    const matchesSearch = !searchQuery ||
      shop.shopName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.ownerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesProvince && matchesSearch;
  });

  const stats = {
    total: shops.length,
    active: shops.filter(s => s.canSell !== false).length,
    provinces: new Set(shops.map(s => s.province).filter(Boolean)).size,
    districts: new Set(shops.map(s => s.district).filter(Boolean)).size,
  };

  const statCards = [
    { label: 'Total Shops', value: stats.total, icon: Store, gradient: 'from-green-600 to-emerald-700', bg: 'from-green-50 to-emerald-50', iconColor: 'text-green-700' },
    { label: 'Active Shops', value: stats.active, icon: CheckCircle2, gradient: 'from-teal-600 to-cyan-700', bg: 'from-teal-50 to-cyan-50', iconColor: 'text-teal-700' },
    { label: 'Provinces', value: stats.provinces, icon: Globe, gradient: 'from-amber-600 to-orange-700', bg: 'from-amber-50 to-orange-50', iconColor: 'text-amber-700' },
    { label: 'Districts', value: stats.districts, icon: MapPinned, gradient: 'from-purple-600 to-pink-700', bg: 'from-purple-50 to-pink-50', iconColor: 'text-purple-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    Shop Management Dashboard
                  </h1>
                  <p className="text-green-100 mt-1">Manage and monitor all shop operations</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchShops}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 border border-white/30"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh
                </button>
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-green-700 rounded-xl font-semibold hover:bg-green-50 transition-all duration-200 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Export Excel
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, idx) => (
                <div
                  key={idx}
                  className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className={`w-5 h-5 ${stat.iconColor} opacity-50`} />
                  </div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Filter className="w-5 h-5 text-green-700" />
            <h2 className="text-lg font-bold text-gray-900">Search & Filters</h2>
            {(searchQuery || selectedDistrict || selectedProvince) && (
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-green-700 hover:text-green-800 font-medium flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-green-700" />
                Search Shops
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name, owner, email..."
                  className="w-full pl-11 pr-4 py-2.5 bg-green-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Province Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-700" />
                Filter by Province
              </label>
              <Select
                options={[...new Set(shops.map(s => s.province).filter(Boolean))].map(p => ({
                  label: p,
                  value: p,
                }))}
                isClearable
                value={selectedProvince ? { label: selectedProvince, value: selectedProvince } : null}
                onChange={(opt) => setSelectedProvince(opt?.value || null)}
                placeholder="All provinces"
                styles={customSelectStyles}
              />
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-purple-700" />
                Filter by District
              </label>
              <Select
                options={[...new Set(shops.map(s => s.district).filter(Boolean))].map(d => ({
                  label: d,
                  value: d,
                }))}
                isClearable
                value={selectedDistrict ? { label: selectedDistrict, value: selectedDistrict } : null}
                onChange={(opt) => setSelectedDistrict(opt?.value || null)}
                placeholder="All districts"
                styles={customSelectStyles}
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedDistrict || selectedProvince) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 font-medium">Active filters:</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" />
                  {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="hover:text-green-900">
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {selectedProvince && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  {selectedProvince}
                  <button onClick={() => setSelectedProvince(null)} className="hover:text-amber-900">
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {selectedDistrict && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedDistrict}
                  <button onClick={() => setSelectedDistrict(null)} className="hover:text-purple-900">
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Showing <span className="font-bold text-green-700">{filteredShops.length}</span> of{' '}
              <span className="font-bold text-gray-900">{shops.length}</span> shops
            </p>
          </div>
        </div>

        {/* Shops Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ClipLoader color="#0f4c3a" loading={loading} size={60} />
              <p className="mt-4 text-gray-600 font-medium">Loading shops data...</p>
              <p className="mt-2 text-sm text-gray-500">First load may take 30-60 seconds while server wakes up</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <p className="text-red-600 font-semibold text-lg mb-2">{error}</p>
              {error.includes('waking up') && (
                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                  Tip: Free-tier backends sleep after inactivity. The next request will be faster!
                </p>
              )}
              <button
                onClick={fetchShops}
                className="mt-4 px-6 py-2.5 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Now
              </button>
            </div>
          ) : filteredShops.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-100">
                  <tr>
                    {[
                      { label: 'Shop Details', icon: Store },
                      { label: 'Location', icon: MapPin },
                      { label: 'Owner', icon: User },
                      { label: 'Contact', icon: Mail },
                      { label: 'Status', icon: CheckCircle2 },
                      { label: 'Actions', icon: null }
                    ].map((header, idx) => (
                      <th key={idx} className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          {header.icon && <header.icon className="w-4 h-4 text-green-700" />}
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            {header.label}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredShops.map((shop, idx) => {
                    const colors = [
                      'from-green-600 to-emerald-700',
                      'from-teal-600 to-cyan-700',
                      'from-amber-600 to-orange-700',
                      'from-purple-600 to-pink-700',
                      'from-rose-600 to-red-700'
                    ];
                    const colorIdx = idx % colors.length;

                    return (
                      <tr key={shop.id} className="hover:bg-green-50 transition-all duration-200 group">
                        {/* Shop Details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 bg-gradient-to-br ${colors[colorIdx]} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-200`}>
                              {shop.shopName?.charAt(0).toUpperCase() || 'S'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                                {shop.shopName}
                              </p>
                              <p className="text-sm text-gray-500 truncate max-w-xs" title={shop.description}>
                                {shop.description || 'No description'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold">
                                {shop.province}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-semibold">
                                {shop.district}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Owner */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                              <User className="w-5 h-5 text-green-700" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{shop.ownerName}</p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="truncate max-w-[180px]" title={shop.ownerEmail}>
                                {shop.ownerEmail}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{shop.ownerPhone}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                            shop.canSell !== false
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {shop.canSell !== false ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewShop(shop)}
                              className="p-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors group/btn"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => handleEditShop(shop)}
                              className="p-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors group/btn"
                              title="Edit Shop"
                            >
                              <Edit className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => handleDeleteShop(shop.id)}
                              className="p-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors group/btn"
                              title="Delete Shop"
                            >
                              <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Store className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No shops found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery || selectedDistrict || selectedProvince
                  ? 'No shops match your current filters. Try adjusting your search criteria.'
                  : 'Get started by adding your first shop to the system.'}
              </p>
              {(searchQuery || selectedDistrict || selectedProvince) && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-colors inline-flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

              {/* ────────────────────────  VIEW SHOP MODAL  ──────────────────────── */}
        {isViewModalOpen && selectedShop && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Shop Details</h2>
                    <p className="text-green-100 text-sm">Complete shop information</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Form-style content */}
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Shop Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Shop Name
                    </label>
                    <div className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-base">
                      {selectedShop.shopName}
                    </div>
                  </div>

                  {/* Province */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Province
                    </label>
                    <div className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-base">
                      {selectedShop.province}
                    </div>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      District
                    </label>
                    <div className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-base">
                      {selectedShop.district}
                    </div>
                  </div>

                  {/* Owner Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Owner Name
                    </label>
                    <div className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-base">
                      {selectedShop.ownerName}
                    </div>
                  </div>

                  {/* Owner Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Owner Email
                    </label>
                    <div className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-base">
                      {selectedShop.ownerEmail}
                    </div>
                  </div>

                  {/* Owner Phone */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Owner Phone
                    </label>
                    <div className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-base">
                      {selectedShop.ownerPhone}
                    </div>
                  </div>

                  {/* Description */}
                  {selectedShop.description && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Description
                      </label>
                      <div className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-base">
                        {selectedShop.description}
                      </div>
                    </div>
                  )}

                  {/* Created Date */}
                  {selectedShop.createdAt && (
                    <div className="md:col-span-2 text-center text-sm text-gray-500 mt-4">
                      Created on{' '}
                      {new Date(selectedShop.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 bg-green-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-6 py-2.5 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditShop(selectedShop);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-800 transition-all shadow-lg flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Shop
                </button>
              </div>
            </div>
          </div>
        )}        {/* EDIT SHOP MODAL – Fully consistent green theme */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Header – Green (same as View) */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Edit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Edit Shop</h2>
                    <p className="text-green-100 text-sm">Update shop information</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Shop Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Shop Name *
                    </label>
                    <input
                      type="text"
                      value={editFormData.shopName}
                      onChange={(e) => handleEditFormChange('shopName', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="Enter shop name"
                    />
                  </div>

                  {/* Province */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Province *
                    </label>
                    <select
                      value={editFormData.province}
                      onChange={(e) => handleEditFormChange('province', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    >
                      <option value="">Select province</option>
                      {provinces.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      District *
                    </label>
                    <select
                      value={editFormData.district}
                      onChange={(e) => handleEditFormChange('district', e.target.value)}
                      disabled={!editFormData.province}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select district</option>
                      {editFormData.province &&
                        districts[editFormData.province]?.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                  </div>

                  {/* Owner Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      value={editFormData.ownerName}
                      onChange={(e) => handleEditFormChange('ownerName', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="Enter owner name"
                    />
                  </div>

                  {/* Owner Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Owner Email *
                    </label>
                    <input
                      type="email"
                      value={editFormData.ownerEmail}
                      onChange={(e) => handleEditFormChange('ownerEmail', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="owner@example.com"
                    />
                  </div>

                  {/* Owner Phone */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Owner Phone
                    </label>
                    <input
                      type="tel"
                      value={editFormData.ownerPhone}
                      onChange={(e) => handleEditFormChange('ownerPhone', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="+250 XXX XXX XXX"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => handleEditFormChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-vertical"
                      placeholder="Enter shop description (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Footer – Shared green color */}
              <div className="px-8 py-6 bg-green-50 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2.5 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateShop}
                  disabled={loading}
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <ClipLoader color="#fff" size={16} />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Update Shop
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}