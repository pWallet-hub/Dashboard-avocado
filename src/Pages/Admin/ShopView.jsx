import { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import Select from 'react-select';
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getProductsByCategory 
} from '../../services/productsService';

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
  const [productFormData, setProductFormData] = useState({
    name: '', category: '', description: '', price: 0, quantity: 0,
    unit: 'piece', supplier_id: '', status: 'available', sku: '',
    brand: '', images: [], specifications: {}
  });

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('https://api.example.com/shops');
        const data = Array.isArray(response.data) ? response.data : [];
        setShops(data);
      } catch (error) {
        console.error('Error fetching shops:', error);
        setShops([]);
        setError(null);
      } finally {
        setLoading(false);
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
    alert('Exporting to Excel...');
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
                  { label: 'Out of Stock', value: products.filter(p => p.status === 'out_of_stock' || p.quantity === 0).length, gradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', color: '#991b1b', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', iconBg: '#ef4444' },
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
                    onClick={() => alert('Add New Shop')}
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
                <div style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #3b82f633' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e40af' }}>Total Shops</p>
                    <div style={{ width: '2.5rem', height: '2.5rem', background: '#3b82f6', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <p style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1e40af' }}>{shops.length}</p>
                </div>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
                  <ClipLoader color="#3b82f6" loading={loading} size={50} />
                </div>
              ) : filteredShops.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        {['Shop Name', 'Owner', 'Email', 'Phone Number', 'Can Sell', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShops.map(shop => (
                        <tr key={shop.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '2.5rem', height: '2.5rem', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.125rem', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}>
                                {shop.name ? shop.name.charAt(0) : 'S'}
                              </div>
                              <p style={{ fontWeight: 600, color: '#0f172a' }}>{shop.name}</p>
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.5rem', color: '#475569' }}>{shop.owner}</td>
                          <td style={{ padding: '1rem 1.5rem', color: '#475569' }}>{shop.email}</td>
                          <td style={{ padding: '1rem 1.5rem', color: '#475569' }}>{shop.phoneNumber}</td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', borderRadius: '0.5rem',
                              fontSize: '0.75rem', fontWeight: 600,
                              background: shop.canSell ? '#d1fae5' : '#fee2e2',
                              color: shop.canSell ? '#065f46' : '#991b1b',
                              border: `1px solid ${shop.canSell ? '#a7f3d0' : '#fecaca'}`
                            }}>
                              {shop.canSell ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <button
                              onClick={() => toggleSellingPermission(shop.id, !shop.canSell)}
                              style={{
                                padding: '0.5rem 1rem', background: shop.canSell ? '#fee2e2' : '#d1fae5',
                                color: shop.canSell ? '#991b1b' : '#065f46', border: 'none',
                                borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem',
                                cursor: 'pointer', transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => e.target.style.opacity = '0.8'}
                              onMouseOut={(e) => e.target.style.opacity = '1'}
                            >
                              {shop.canSell ? 'Disable' : 'Enable'}
                            </button>
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
      </div>

      {/* Product Modal */}
      {isModalOpen && activeTab === 'products' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', maxWidth: '48rem', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                {modalMode === 'create' && 'Create New Product'}
                {modalMode === 'edit' && 'Edit Product'}
                {modalMode === 'view' && 'Product Details'}
              </h2>
              <button
                onClick={closeModal}
                style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', border: 'none', borderRadius: '0.5rem', fontSize: '1.5rem', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.target.style.background = '#e2e8f0'; e.target.style.color = '#0f172a'; }}
                onMouseOut={(e) => { e.target.style.background = '#f1f5f9'; e.target.style.color = '#64748b'; }}
              >
                ×
              </button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              {modalMode === 'view' && selectedProduct ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {[
                    { label: 'Name', value: selectedProduct.name },
                    { label: 'Category', value: selectedProduct.category },
                    { label: 'Description', value: selectedProduct.description || 'N/A' },
                    { label: 'Price', value: `${selectedProduct.price} RWF` },
                    { label: 'Quantity', value: selectedProduct.quantity },
                    { label: 'Unit', value: selectedProduct.unit },
                    { label: 'Status', value: selectedProduct.status },
                    { label: 'SKU', value: selectedProduct.sku || 'N/A' },
                    { label: 'Brand', value: selectedProduct.brand || 'N/A' },
                    { label: 'Supplier ID', value: selectedProduct.supplier_id }
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase' }}>{item.label}</p>
                      <p style={{ fontSize: '0.9375rem', color: '#0f172a', fontWeight: 500 }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <form style={{ display: 'grid', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Product Name *</label>
                      <input
                        type="text"
                        value={productFormData.name}
                        onChange={(e) => handleProductFormChange('name', e.target.value)}
                        placeholder="Enter product name"
                        required
                        style={{ width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Category *</label>
                      <select
                        value={productFormData.category}
                        onChange={(e) => handleProductFormChange('category', e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a', outline: 'none' }}
                      >
                        <option value="">Select category</option>
                        <option value="irrigation">Irrigation</option>
                        <option value="harvesting">Harvesting</option>
                        <option value="containers">Containers</option>
                        <option value="pest-management">Pest Management</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Description</label>
                    <textarea
                      value={productFormData.description}
                      onChange={(e) => handleProductFormChange('description', e.target.value)}
                      placeholder="Enter product description"
                      rows="3"
                      style={{ width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a', outline: 'none', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Price (RWF) *</label>
                      <input
                        type="number"
                        value={productFormData.price}
                        onChange={(e) => handleProductFormChange('price', parseFloat(e.target.value))}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                        style={{ width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Quantity *</label>
                      <input
                        type="number"
                        value={productFormData.quantity}
                        onChange={(e) => handleProductFormChange('quantity', parseInt(e.target.value))}
                        placeholder="0"
                        min="0"
                        required
                        style={{ width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Unit *</label>
                      <select
                        value={productFormData.unit}
                        onChange={(e) => handleProductFormChange('unit', e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a', outline: 'none' }}
                      >
                        {unitOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Supplier ID *</label>
                      <input
                        type="text"
                        value={productFormData.supplier_id}
                        onChange={(e) => handleProductFormChange('supplier_id', e.target.value)}
                        placeholder="SUP123456"
                        required
                        style={{ width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Status *</label>
                      <select
                        value={productFormData.status}
                        onChange={(e) => handleProductFormChange('status', e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a', outline: 'none' }}
                      >
                        <option value="available">Available</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="discontinued">Discontinued</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>SKU</label>
                      <input
                        type="text"
                        value={productFormData.sku}
                        onChange={(e) => handleProductFormChange('sku', e.target.value)}
                        placeholder="Auto-generated if empty"
                        style={{ width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Brand</label>
                      <input
                        type="text"
                        value={productFormData.brand}
                        onChange={(e) => handleProductFormChange('brand', e.target.value)}
                        placeholder="Enter brand name"
                        style={{ width: '100%', padding: '0.625rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', color: '#0f172a', outline: 'none' }}
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', padding: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '0.625rem 1.5rem', background: 'white', border: '2px solid #e2e8f0', color: '#475569',
                  borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#f8fafc'}
                onMouseOut={(e) => e.target.style.background = 'white'}
              >
                {modalMode === 'view' ? 'Close' : 'Cancel'}
              </button>
              {modalMode !== 'view' && (
                <button
                  onClick={modalMode === 'create' ? handleCreateProduct : handleUpdateProduct}
                  disabled={loading}
                  style={{
                    padding: '0.625rem 1.5rem', background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                    color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                    boxShadow: loading ? 'none' : '0 4px 12px rgba(59,130,246,0.3)'
                  }}
                >
                  {loading ? 'Saving...' : modalMode === 'create' ? 'Create Product' : 'Update Product'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}