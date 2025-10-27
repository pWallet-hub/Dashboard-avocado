import { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import Select from 'react-select';
import AddShopForm from '../../components/AddShopForm/AddShopForm';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory
} from '../../services/productsService';
import {
  getAllShops,
  getShopById,
  updateShop,
  deleteShop,
  exportShopsToExcel
} from '../../services/shopService';

export default function ShopView() {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [itemsPerPage] = useState(20);
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const [isEditShopModalOpen, setIsEditShopModalOpen] = useState(false);
  const [isViewShopModalOpen, setIsViewShopModalOpen] = useState(false);
  const [selectedShopData, setSelectedShopData] = useState(null);
  const [editShopFormData, setEditShopFormData] = useState({
    shopName: '', description: '', province: '', district: '',
    ownerName: '', ownerEmail: '', ownerPhone: ''
  });
  const [productFormData, setProductFormData] = useState({
    name: '', category: '', description: '', price: 0, quantity: 0,
    unit: 'piece', supplier_id: '', status: 'available', sku: '',
    brand: '', images: [], specifications: {}
  });

  useEffect(() => {
    const fetchShops = async () => {
      console.log('🚀 Starting to fetch shops...');
      setLoading(true);
      setError(null);
      try {
        const response = await getAllShops();
        console.log('📦 Shops API Response:', response);
        console.log('📦 Response type:', typeof response);
        console.log('📦 Response.success:', response?.success);
        console.log('📦 Response.data:', response?.data);
        console.log('📦 Is response.data an array?', Array.isArray(response?.data));
       
        if (response && response.success) {
          const shopsData = Array.isArray(response.data) ? response.data : [];
          console.log('✅ Shops Data to set:', shopsData);
          console.log('✅ Number of shops:', shopsData.length);
          setShops(shopsData);
        } else {
          console.warn('⚠️ API response success is false or missing:', response);
          setShops([]);
        }
      } catch (error) {
        console.error('❌ Error fetching shops:', error);
        console.error('❌ Error details:', {
          message: error.message,
          response: error.response,
          status: error.response?.status,
          data: error.response?.data
        });
        setShops([]);
        setError('Failed to load shops. Please try again later.');
      } finally {
        setLoading(false);
        console.log('🏁 Fetch shops completed');
      }
    };
    fetchShops();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const options = {
          page: currentPage,
          limit: itemsPerPage,
          ...(selectedCategory && { category: selectedCategory }),
          ...(selectedStatus && { status: selectedStatus }),
          ...(searchQuery && { search: searchQuery })
        };
        const response = await getAllProducts(options);
        setProducts(response.data || []);
        setPagination(response.pagination || {});
        setFilteredProducts(response.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab, currentPage, selectedCategory, selectedStatus, searchQuery, itemsPerPage]);

  const handleProductFormChange = (field, value) => {
    setProductFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateProduct = async () => {
    try {
      setLoading(true);
      await createProduct(productFormData);
      const response = await getAllProducts({ page: currentPage, limit: itemsPerPage });
      setProducts(response.data || []);
      setFilteredProducts(response.data || []);
      closeModal();
      alert('Product created successfully!');
    } catch (error) {
      console.error('Error creating product:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    try {
      setLoading(true);
      await updateProduct(selectedProduct.id, productFormData);
      const response = await getAllProducts({ page: currentPage, limit: itemsPerPage });
      setProducts(response.data || []);
      setFilteredProducts(response.data || []);
      closeModal();
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      setLoading(true);
      await deleteProduct(productId);
      const response = await getAllProducts({ page: currentPage, limit: itemsPerPage });
      setProducts(response.data || []);
      setFilteredProducts(response.data || []);
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSellingPermission = async (shopId, canSell) => {
    try {
      await axios.put(`https://api.example.com/shops/${shopId}`, { canSell });
      const updated = shops.map(shop => shop.id === shopId ? { ...shop, canSell } : shop);
      setShops(updated);
    } catch (error) {
      console.error('Error updating selling permission:', error);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setProductFormData({
      name: '', category: '', description: '', price: 0, quantity: 0,
      unit: 'piece', supplier_id: '', status: 'available', sku: '',
      brand: '', images: [], specifications: {}
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setProductFormData({
      name: product.name || '', category: product.category || '',
      description: product.description || '', price: product.price || 0,
      quantity: product.quantity || 0, unit: product.unit || 'piece',
      supplier_id: product.supplier_id || '', status: product.status || 'available',
      sku: product.sku || '', brand: product.brand || '',
      images: product.images || [], specifications: product.specifications || {}
    });
    setIsModalOpen(true);
  };

  const openViewModal = (product) => {
    setModalMode('view');
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setModalMode('view');
  };

  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption ? selectedOption.value : '');
  };

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption ? selectedOption.value : null);
    setCurrentPage(1);
  };

  const handleStatusChange = (selectedOption) => {
    setSelectedStatus(selectedOption ? selectedOption.value : null);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    if (shops.length === 0) {
      alert('No shops data to export');
      return;
    }
    exportShopsToExcel(shops);
  };

  const handleShopSuccess = async (newShop) => {
    console.log('Shop created successfully, refreshing list...');
    try {
      const response = await getAllShops();
      console.log('Refresh response:', response);
      if (response.success) {
        const shopsData = Array.isArray(response.data) ? response.data : [];
        console.log('Updated shops data:', shopsData);
        setShops(shopsData);
      }
    } catch (error) {
      console.error('Error refreshing shops:', error);
    }
  };

  const handleDeleteShop = async (shopId) => {
    if (!window.confirm('Are you sure you want to delete this shop?')) {
      return;
    }
    try {
      const response = await deleteShop(shopId);
      if (response.success) {
        alert('Shop deleted successfully');
        const refreshResponse = await getAllShops();
        if (refreshResponse.success) {
          setShops(refreshResponse.data || []);
        }
      }
    } catch (error) {
      console.error('Error deleting shop:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete shop';
      alert(`Error: ${errorMessage}`);
    }
  };

  const openViewShopModal = (shop) => {
    setSelectedShopData(shop);
    setIsViewShopModalOpen(true);
  };

  const openEditShopModal = (shop) => {
    setSelectedShopData(shop);
    setEditShopFormData({
      shopName: shop.shopName || '',
      description: shop.description || '',
      province: shop.province || '',
      district: shop.district || '',
      ownerName: shop.ownerName || '',
      ownerEmail: shop.ownerEmail || '',
      ownerPhone: shop.ownerPhone || ''
    });
    setIsEditShopModalOpen(true);
  };

  const handleEditShopFormChange = (field, value) => {
    setEditShopFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateShop = async () => {
    if (!selectedShopData) return;
    if (!editShopFormData.shopName || !editShopFormData.ownerName || !editShopFormData.ownerEmail) {
      alert('Please fill in all required fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editShopFormData.ownerEmail)) {
      alert('Please enter a valid email address');
      return;
    }
    try {
      setLoading(true);
      console.log('Updating shop:', selectedShopData.id, editShopFormData);
      const response = await updateShop(selectedShopData.id, editShopFormData);
      console.log('Update shop response:', response);
      if (response.success) {
        alert('Shop updated successfully');
        setIsEditShopModalOpen(false);
        setSelectedShopData(null);
        const refreshResponse = await getAllShops();
        if (refreshResponse.success) {
          setShops(refreshResponse.data || []);
        }
      }
    } catch (error) {
      console.error('Error updating shop:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update shop';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = selectedDistrict
    ? shops.filter(shop => shop.district === selectedDistrict)
    : shops;

  const categoryOptions = [
    { label: 'Irrigation', value: 'irrigation' },
    { label: 'Harvesting', value: 'harvesting' },
    { label: 'Containers', value: 'containers' },
    { label: 'Pest Management', value: 'pest-management' }
  ];

  const statusOptions = [
    { label: 'Available', value: 'available' },
    { label: 'Out of Stock', value: 'out_of_stock' },
    { label: 'Discontinued', value: 'discontinued' }
  ];

  const unitOptions = [
    { label: 'Kilogram (kg)', value: 'kg' }, { label: 'Gram (g)', value: 'g' },
    { label: 'Pound (lb)', value: 'lb' }, { label: 'Ounce (oz)', value: 'oz' },
    { label: 'Ton', value: 'ton' }, { label: 'Liter', value: 'liter' },
    { label: 'Milliliter (ml)', value: 'ml' }, { label: 'Gallon', value: 'gallon' },
    { label: 'Piece', value: 'piece' }, { label: 'Dozen', value: 'dozen' },
    { label: 'Box', value: 'box' }, { label: 'Bag', value: 'bag' },
    { label: 'Bottle', value: 'bottle' }, { label: 'Can', value: 'can' },
    { label: 'Packet', value: 'packet' }
  ];

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '0.75rem',
      borderColor: '#e2e8f0',
      paddingTop: '0.125rem',
      paddingBottom: '0.125rem',
      backgroundColor: '#f8fafc',
      boxShadow: 'none',
      '&:hover': { borderColor: '#cbd5e1' }
    }),
    menu: (base) => ({ ...base, borderRadius: '0.75rem', overflow: 'hidden' })
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #dbeafe 100%)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Tab Navigation */}
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '0.5rem', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                flex: 1, padding: '0.875rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: activeTab === 'products' ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' : 'transparent',
                color: activeTab === 'products' ? 'white' : '#64748b',
                boxShadow: activeTab === 'products' ? '0 4px 12px rgba(59,130,246,0.3)' : 'none'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Products Management
              </span>
            </button>
            <button
              onClick={() => setActiveTab('shops')}
              style={{
                flex: 1, padding: '0.875rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: activeTab === 'shops' ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' : 'transparent',
                color: activeTab === 'shops' ? 'white' : '#64748b',
                boxShadow: activeTab === 'shops' ? '0 4px 12px rgba(59,130,246,0.3)' : 'none'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Shops Management
              </span>
            </button>
          </div>
        </div>
        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            {/* Header */}
            <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Products Management</h1>
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage your product inventory and stock levels</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={exportToExcel}
                    style={{
                      padding: '0.625rem 1.25rem', background: 'white', border: '2px solid #e2e8f0', color: '#475569',
                      borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onMouseOver={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#cbd5e1'; }}
                    onMouseOut={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#e2e8f0'; }}
                  >
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                  </button>
                  <button
                    onClick={openCreateModal}
                    style={{
                      padding: '0.625rem 1.25rem', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                      color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                      gap: '0.5rem', boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                  </button>
                </div>
              </div>
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Total Products', value: pagination.total || products.length, gradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', color: '#1e40af', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', iconBg: '#3b82f6' },
                  { label: 'Available', value: products.filter(p => p.status === 'available').length, gradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', color: '#065f46', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: '#10b981' },
                  { label: 'Out of Stock', value: products.filter(p => p.status === 'out_of_stock' || p.quantity === 0).length, gradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', color: '#991b1b', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: '#ef444四大'},
                  { label: 'Categories', value: new Set(products.map(p => p.category)).size, gradient: 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)', color: '#6b21a8', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', iconBg: '#a855f7' }
                ].map((stat, i) => (
                  <div key={i} style={{ background: stat.gradient, borderRadius: '0.75rem', padding: '1rem', border: `1px solid ${stat.iconBg}33` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: stat.color }}>{stat.label}</p>
                      <div style={{ width: '2.5rem', height: '2.5rem', background: stat.iconBg, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                        </svg>
                      </div>
                    </div>
                    <p style={{ fontSize: '1.875rem', fontWeight: 700, color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Filters */}
            <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Search Products</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search by name, SKU..."
                      style={{
                        width: '100%', paddingLeft: '2.75rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem',
                        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', color: '#0f172a',
                        outline: 'none', transition: 'all 0.2s'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                    <svg style={{ position: 'absolute', left: '0.875rem', top: '0.75rem', width: '1.25rem', height: '1.25rem', color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Category</label>
                  <Select options={categoryOptions} isClearable onChange={handleCategoryChange} placeholder="All categories" styles={customSelectStyles} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Status</label>
                  <Select options={statusOptions} isClearable onChange={handleStatusChange} placeholder="All statuses" styles={customSelectStyles} />
                </div>
              </div>
            </div>
            {/* Products Table */}
            <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
                  <ClipLoader color="#3b82f6" loading={loading} size={50} />
                </div>
              ) : error ? (
                <div style={{ padding: '5rem 0', textAlign: 'center', color: '#ef4444' }}>{error}</div>
              ) : filteredProducts.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        {['Product', 'Category', 'Price', 'Quantity', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody style={{ borderTop: '1px solid #e2e8f0' }}>
                      {filteredProducts.map(product => (
                        <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '2.5rem', height: '2.5rem', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.125rem', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}>
                                {product.name ? product.name.charAt(0) : 'P'}
                              </div>
                              <div>
                                <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.125rem' }}>{product.name}</p>
                                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>SKU: {product.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 500, background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                              {product.category?.replace('-', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <p style={{ fontWeight: 600, color: '#0f172a' }}>{product.price?.toLocaleString()} RWF</p>
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <p style={{ color: '#475569' }}>{product.quantity} {product.unit}</p>
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', borderRadius: '0.5rem',
                              fontSize: '0.75rem', fontWeight: 600,
                              background: product.status === 'available' ? '#d1fae5' : product.status === 'out_of_stock' ? '#fee2e2' : '#f1f5f9',
                              color: product.status === 'available' ? '#065f46' : product.status === 'out_of_stock' ? '#991b1b' : '#475569',
                              border: `1px solid ${product.status === 'available' ? '#a7f3d0' : product.status === 'out_of_stock' ? '#fecaca' : '#e2e8f0'}`
                            }}>
                              {product.status?.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {[
                                { onClick: () => openViewModal(product), color: '#3b82f6', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', title: 'View' },
                                { onClick: () => openEditModal(product), color: '#f59e0b', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', title: 'Edit' },
                                { onClick: () => handleDeleteProduct(product.id), color: '#ef4444', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', title: 'Delete' }
                              ].map((btn, i) => (
                                <button
                                  key={i}
                                  onClick={btn.onClick}
                                  title={btn.title}
                                  style={{
                                    padding: '0.5rem', color: btn.color, background: 'transparent', border: 'none',
                                    borderRadius: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex'
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.background = `${btn.color}15`}
                                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                  <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={btn.icon} />
                                  </svg>
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '5rem 0', textAlign: 'center' }}>
                  <svg style={{ width: '4rem', height: '4rem', color: '#cbd5e1', margin: '0 auto 1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p style={{ color: '#64748b', fontSize: '1.125rem', fontWeight: 500 }}>No products found</p>
                </div>
              )}
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.5rem 1rem', background: currentPage === 1 ? '#f8fafc' : 'white',
                      border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontWeight: 600,
                      color: currentPage === 1 ? '#cbd5e1' : '#475569', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ color: '#475569', fontWeight: 500 }}>
                    Page {currentPage} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                    disabled={currentPage === pagination.pages}
                    style={{
                      padding: '0.5rem 1rem', background: currentPage === pagination.pages ? '#f8fafc' : 'white',
                      border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontWeight: 600,
                      color: currentPage === pagination.pages ? '#cbd5e1' : '#475569',
                      cursor: currentPage === pagination.pages ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        {/* Shops Tab */}
        {activeTab === 'shops' && (
          <>
            <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Shops Management</h1>
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage shop permissions and settings</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={exportToExcel}
                    style={{
                      padding: '0.625rem 1.25rem', background: 'white', border: '2px solid #e2e8f0', color: '#475569',
                      borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onMouseOver={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#cbd5e1'; }}
                    onMouseOut={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#e2e8f0'; }}
                  >
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                  </button>
                  <button
                    onClick={() => setIsAddShopModalOpen(true)}
                    style={{
                      padding: '0.625rem 1.25rem', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                      color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                      gap: '0.5rem', boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                    }}
                  >
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Shop
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Total Shops', value: shops.length, gradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', color: '#1e40af', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', iconBg: '#3b82f6' },
                  { label: 'Active Shops', value: shops.filter(s => s.canSell !== false).length, gradient: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', color: '#065f46', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: '#10b981' },
                  { label: 'Provinces', value: new Set(shops.map(s => s.province).filter(Boolean)).size, gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', color: '#92400e', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', iconBg: '#f59e0b' },
                  { label: 'Districts', value: new Set(shops.map(s => s.district).filter(Boolean)).size, gradient: 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)', color: '#6b21a8', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', iconBg: '#a855f7' }
                ].map((stat, i) => (
                  <div key={i} style={{ background: stat.gradient, borderRadius: '0.75rem', padding: '1rem', border: `1px solid ${stat.iconBg}33` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: stat.color }}>{stat.label}</p>
                      <div style={{ width: '2.5rem', height: '2.5rem', background: stat.iconBg, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                        </svg>
                      </div>
                    </div>
                    <p style={{ fontSize: '1.875rem', fontWeight: 700, color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Filter by District</label>
              <Select
                options={[...new Set(shops.map(s => s.district).filter(Boolean))].map(d => ({ label: d, value: d }))}
                isClearable
                onChange={handleDistrictChange}
                placeholder="Select or search district"
                styles={customSelectStyles}
              />
            </div>
            <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
                  <ClipLoader color="#3b82f6" loading={loading} size={50} />
                  <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 500 }}>Loading shops...</p>
                </div>
              ) : filteredShops.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderBottom: '2px solid #e2e8f0' }}>
                        {[
                          { label: 'Shop Details', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                          { label: 'Location', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
                          { label: 'Owner Information', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                          { label: 'Contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                          { label: 'Status', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                          { label: 'Actions', icon: 'M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z' }
                        ].map((h, i) => (
                          <th key={i} style={{ padding: '1.25rem 1.5rem', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <svg style={{ width: '1.125rem', height: '1.125rem', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={h.icon} />
                              </svg>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {h.label}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShops.map((shop, idx) => (
                        <tr
                          key={shop.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'all 0.2s',
                            background: 'white'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.transform = 'translateX(2px)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }}
                        >
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{
                                width: '3rem',
                                height: '3rem',
                                background: `linear-gradient(135deg, ${['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx % 5]} 0%, ${['#6366f1', '#059669', '#d97706', '#dc2626', '#7c3aed'][idx % 5]} 100%)`,
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '1.25rem',
                                boxShadow: `0 4px 12px ${['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx % 5]}40`,
                                flexShrink: 0
                              }}>
                                {shop.shopName ? shop.shopName.charAt(0).toUpperCase() : 'S'}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                                  {shop.shopName}
                                </p>
                                <p style={{
                                  fontSize: '0.8125rem',
                                  color: '#64748b',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '250px'
                                }} title={shop.description}>
                                  {shop.description || 'No description'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '0.25rem 0.625rem',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  background: '#fef3c7',
                                  color: '#92400e',
                                  border: '1px solid #fde68a'
                                }}>
                                  {shop.province}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '0.25rem 0.625rem',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  background: '#dbeafe',
                                  color: '#1e40af',
                                  border: '1px solid #bfdbfe'
                                }}>
                                  {shop.district}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                              <div style={{
                                width: '2rem',
                                height: '2rem',
                                background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #7dd3fc'
                              }}>
                                <svg style={{ width: '1rem', height: '1rem', color: '#0369a1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div>
                                <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>{shop.ownerName}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg style={{ width: '0.875rem', height: '0.875rem', color: '#64748b', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <p style={{ fontSize: '0.8125rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }} title={shop.ownerEmail}>
                                  {shop.ownerEmail}
                                </p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg style={{ width: '0.875rem', height: '0.875rem', color: '#64748b', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <p style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 500 }}>
                                  {shop.ownerPhone}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              padding: '0.375rem 0.75rem',
                              borderRadius: '0.5rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: shop.canSell !== false ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                              color: shop.canSell !== false ? '#065f46' : '#991b1b',
                              border: `1px solid ${shop.canSell !== false ? '#a7f3d0' : '#fecaca'}`,
                              boxShadow: `0 2px 4px ${shop.canSell !== false ? '#10b98120' : '#ef444420'}`
                            }}>
                              <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={shop.canSell !== false ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'} />
                              </svg>
                              {shop.canSell !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => openViewShopModal(shop)}
                                style={{
                                  padding: '0.5rem 0.875rem',
                                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                                  color: '#1e40af',
                                  border: '1px solid #93c5fd',
                                  borderRadius: '0.5rem',
                                  fontWeight: 600,
                                  fontSize: '0.8125rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.375rem',
                                  boxShadow: '0 1px 3px rgba(59,130,246,0.1)'
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.background = 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)';
                                  e.target.style.transform = 'translateY(-1px)';
                                  e.target.style.boxShadow = '0 4px 8px rgba(59,130,246,0.2)';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.background = 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = '0 1px 3px rgba(59,130,246,0.1)';
                                }}
                              >
                                <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                              </button>
                              <button
                                onClick={() => openEditShopModal(shop)}
                                style={{
                                  padding: '0.5rem 0.875rem',
                                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                  color: '#92400e',
                                  border: '1px solid #fcd34d',
                                  borderRadius: '0.5rem',
                                  fontWeight: 600,
                                  fontSize: '0.8125rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.375rem',
                                  boxShadow: '0 1px 3px rgba(245,158,11,0.1)'
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.background = 'linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)';
                                  e.target.style.transform = 'translateY(-1px)';
                                  e.target.style.boxShadow = '0 4px 8px rgba(245,158,11,0.2)';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = '0 1px 3px rgba(245,158,11,0.1)';
                                }}
                              >
                                <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteShop(shop.id)}
                                style={{
                                  padding: '0.5rem 0.875rem',
                                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                                  color: '#991b1b',
                                  border: '1px solid #fca5a5',
                                  borderRadius: '0.5rem',
                                  fontWeight: 600,
                                  fontSize: '0.8125rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.375rem',
                                  boxShadow: '0 1px 3px rgba(239,68,68,0.1)'
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.background = 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)';
                                  e.target.style.transform = 'translateY(-1px)';
                                  e.target.style.boxShadow = '0 4px 8px rgba(239,68,68,0.2)';
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = '0 1px 3px rgba(239,68,68,0.1)';
                                }}
                              >
                                <svg style={{ width: '0.875rem', height: '0.875rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '5rem 0', textAlign: 'center' }}>
                  <svg style={{ width: '4rem', height: '4rem', color: '#cbd5e1', margin: '0 auto 1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p style={{ color: '#64748b', fontSize: '1.125rem', fontWeight: 500 }}>No shops found</p>
                </div>
              )}
            </div>
          </>
        )}
               {/* Product Modal */}
        {isModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '1rem'
          }}>
            <div style={{
              background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '600px',
              maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
              padding: '2rem', border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                  {modalMode === 'create' ? 'Add New Product' : modalMode === 'edit' ? 'Edit Product' : 'View Product'}
                </h2>
                <button
                  onClick={closeModal}
                  style={{
                    padding: '0.5rem', background: 'transparent', border: 'none',
                    color: '#64748b', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#ef4444'}
                  onMouseOut={(e) => e.target.style.color = '#64748b'}
                >
                  <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={productFormData.name}
                    onChange={(e) => handleProductFormChange('name', e.target.value)}
                    placeholder="Enter product name"
                    disabled={modalMode === 'view'}
                    style={{
                      width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0',
                      borderRadius: '0.75rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s',
                      cursor: modalMode === 'view' ? 'not-allowed' : 'text'
                    }}
                    onFocus={(e) => { if (modalMode !== 'view') { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; } }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                    Category
                  </label>
                  <Select
                    options={categoryOptions}
                    value={categoryOptions.find(opt => opt.value === productFormData.category)}
                    onChange={(opt) => handleProductFormChange('category', opt ? opt.value : '')}
                    isDisabled={modalMode === 'view'}
                    placeholder="Select category"
                    styles={customSelectStyles}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                    Description
                  </label>
                  <textarea
                    value={productFormData.description}
                    onChange={(e) => handleProductFormChange('description', e.target.value)}
                    placeholder="Enter product description"
                    disabled={modalMode === 'view'}
                    style={{
                      width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0',
                      borderRadius: '0.75rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s',
                      minHeight: '100px', resize: 'vertical', cursor: modalMode === 'view' ? 'not-allowed' : 'text'
                    }}
                    onFocus={(e) => { if (modalMode !== 'view') { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; } }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                      Price (RWF)
                    </label>
                    <input
                      type="number"
                      value={productFormData.price}
                      onChange={(e) => handleProductFormChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="Enter price"
                      disabled={modalMode === 'view'}
                      style={{
                        width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: '0.75rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s',
                        cursor: modalMode === 'view' ? 'not-allowed' : 'text'
                      }}
                      onFocus={(e) => { if (modalMode !== 'view') { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; } }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={productFormData.quantity}
                      onChange={(e) => handleProductFormChange('quantity', parseInt(e.target.value) || 0)}
                      placeholder="Enter quantity"
                      disabled={modalMode === 'view'}
                      style={{
                        width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: '0.75rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s',
                        cursor: modalMode === 'view' ? 'not-allowed' : 'text'
                      }}
                      onFocus={(e) => { if (modalMode !== 'view') { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; } }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                    Unit
                  </label>
                  <Select
                    options={unitOptions}
                    value={unitOptions.find(opt => opt.value === productFormData.unit)}
                    onChange={(opt) => handleProductFormChange('unit', opt ? opt.value : 'piece')}
                    isDisabled={modalMode === 'view'}
                    placeholder="Select unit"
                    styles={customSelectStyles}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                    Status
                  </label>
                  <Select
                    options={statusOptions}
                    value={statusOptions.find(opt => opt.value === productFormData.status)}
                    onChange={(opt) => handleProductFormChange('status', opt ? opt.value : 'available')}
                    isDisabled={modalMode === 'view'}
                    placeholder="Select status"
                    styles={customSelectStyles}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                    SKU
                  </label>
                  <input
                    type="text"
                    value={productFormData.sku}
                    onChange={(e) => handleProductFormChange('sku', e.target.value)}
                    placeholder="Enter SKU"
                    disabled={modalMode === 'view'}
                    style={{
                      width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0',
                      borderRadius: '0.75rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s',
                      cursor: modalMode === 'view' ? 'not-allowed' : 'text'
                    }}
                    onFocus={(e) => { if (modalMode !== 'view') { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; } }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                    Brand
                  </label>
                  <input
                    type="text"
                    value={productFormData.brand}
                    onChange={(e) => handleProductFormChange('brand', e.target.value)}
                    placeholder="Enter brand"
                    disabled={modalMode === 'view'}
                    style={{
                      width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0',
                      borderRadius: '0.75rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s',
                      cursor: modalMode === 'view' ? 'not-allowed' : 'text'
                    }}
                    onFocus={(e) => { if (modalMode !== 'view') { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; } }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
              {modalMode !== 'view' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    onClick={closeModal}
                    style={{
                      padding: '0.625rem 1.25rem', background: 'white', border: '2px solid #e2e8f0',
                      color: '#475569', borderRadius: '0.75rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#cbd5e1'; }}
                    onMouseOut={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#e2e8f0'; }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={modalMode === 'create' ? handleCreateProduct : handleUpdateProduct}
                    style={{
                      padding: '0.625rem 1.25rem', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                      color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    {modalMode === 'create' ? 'Create Product' : 'Update Product'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Add Shop Modal */}
        {isAddShopModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '1rem'
          }}>
            <div style={{
              background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '600px',
              maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
              padding: '2rem', border: '1px solid #e2e8f0'
            }}>
              <AddShopForm
                onSuccess={handleShopSuccess}
                onClose={() => setIsAddShopModalOpen(false)}
              />
            </div>
          </div>
        )}
        {/* Edit Shop Modal */}
        {isEditShopModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '1rem'
          }}>
            <div style={{
              background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '600px',
              maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
              padding: '2rem', border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                  Edit Shop
                </h2>
                <button
                  onClick={() => setIsEditShopModalOpen(false)}
                  style={{
                    padding: '0.5rem', background: 'transparent', border: 'none',
                    color: '#64748b', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#ef4444'}
                  onMouseOut={(e) => e.target.style.color = '#64748b'}
                >
                  <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                    Shop Name
                  </label>
                  <input
                    type="text"
                    value={editShopFormData.shopName}
                    onChange={(e) => handleEditShopFormChange('shopName', e.target.value)}
                    placeholder="Enter shop name"
                    style={{
                      width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0',
                      borderRadius: '0.75rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                    Description
                  </label>
                  <textarea
                    value={editShopFormData.description}
                    onChange={(e) => handleEditShopFormChange('description', e.target.value)}
                    placeholder="Enter shop description"
                    style={{
                      width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0',
                      borderRadius: '0.75rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s',
                      minHeight: '100px', resize: 'vertical'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                      Province
                    </label>
                    <input
                      type="text"
                      value={editShopFormData.province}
                      onChange={(e) => handleEditShopFormChange('province', e.target.value)}
                      placeholder="Enter province"
                      style={{
                        width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: '0.75rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                      District
                    </label>
                    <input
                      type="text"
                      value={editShopFormData.district}
                      onChange={(e) => handleEditShopFormChange('district', e.target.value)}
                      placeholder="Enter district"
                      style={{
                        width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: '0.75rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={editShopFormData.ownerName}
                    onChange={(e) => handleEditShopFormChange('ownerName', e.target.value)}
                    placeholder="Enter owner name"
                    style={{
                      width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0',
                      borderRadius: '0.75rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                    Owner Email
                  </label>
                  <input
                    type="email"
                    value={editShopFormData.ownerEmail}
                    onChange={(e) => handleEditShopFormChange('ownerEmail', e.target.value)}
                    placeholder="Enter owner email"
                    style={{
                      width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0',
                      borderRadius: '0.75rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                    Owner Phone
                  </label>
                  <input
                    type="tel"
                    value={editShopFormData.ownerPhone}
                    onChange={(e) => handleEditShopFormChange('ownerPhone', e.target.value)}
                    placeholder="Enter owner phone"
                    style={{
                      width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0',
                      borderRadius: '0.75rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setIsEditShopModalOpen(false)}
                  style={{
                    padding: '0.625rem 1.25rem', background: 'white', border: '2px solid #e2e8f0',
                    color: '#475569', borderRadius: '0.75rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#cbd5e1'; }}
                  onMouseOut={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#e2e8f0'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateShop}
                  style={{
                    padding: '0.625rem 1.25rem', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                    color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Update Shop
                </button>
              </div>
            </div>
          </div>
        )}
        {/* View Shop Modal */}
        {isViewShopModalOpen && selectedShopData && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000, padding: '1rem'
          }}>
            <div style={{
              background: 'white', borderRadius: '1rem', width: '100%', maxWidth: '600px',
              maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
              padding: '2rem', border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                  Shop Details
                </h2>
                <button
                  onClick={() => setIsViewShopModalOpen(false)}
                  style={{
                    padding: '0.5rem', background: 'transparent', border: 'none',
                    color: '#64748b', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#ef4444'}
                  onMouseOut={(e) => e.target.style.color = '#64748b'}
                >
                  <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '3rem', height: '3rem', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                    borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '1.25rem', boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                  }}>
                    {selectedShopData.shopName ? selectedShopData.shopName.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div>
                    <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>{selectedShopData.shopName}</p>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{selectedShopData.description || 'No description'}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p style={{ fontSize: '0.875rem', color: '#475569' }}>
                      <span style={{ fontWeight: 600 }}>Location:</span> {selectedShopData.province}, {selectedShopData.district}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p style={{ fontSize: '0.875rem', color: '#475569' }}>
                      <span style={{ fontWeight: 600 }}>Owner:</span> {selectedShopData.ownerName}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p style={{ fontSize: '0.875rem', color: '#475569' }}>
                      <span style={{ fontWeight: 600 }}>Email:</span> {selectedShopData.ownerEmail}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <p style={{ fontSize: '0.875rem', color: '#475569' }}>
                      <span style={{ fontWeight: 600 }}>Phone:</span> {selectedShopData.ownerPhone}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: selectedShopData.canSell !== false ? '#10b981' : '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={selectedShopData.canSell !== false ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'} />
                    </svg>
                    <p style={{ fontSize: '0.875rem', color: '#475569' }}>
                      <span style={{ fontWeight: 600 }}>Status:</span> {selectedShopData.canSell !== false ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setIsViewShopModalOpen(false)}
                  style={{
                    padding: '0.625rem 1.25rem', background: 'white', border: '2px solid #e2e8f0',
                    color: '#475569', borderRadius: '0.75rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#cbd5e1'; }}
                  onMouseOut={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#e2e8f0'; }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}