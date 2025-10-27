import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import Select from 'react-select';
import { 
  getAllShops, 
  getShopById, 
  updateShop, 
  deleteShop, 
  exportShopsToExcel 
} from '../../services/shopService';
import { Store, MapPin, User, Phone, Mail, Edit, Trash2, Download } from 'lucide-react';

export default function ShopManagerShopView() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    shopName: '',
    description: '',
    province: '',
    district: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: ''
  });

  const provinces = [
    'Kigali',
    'Eastern Province',
    'Northern Province',
    'Southern Province',
    'Western Province'
  ];

  const districts = {
    'Kigali': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
    'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
    'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
    'Southern Province': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
    'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro']
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllShops();
      console.log('Shop Manager - Shops API Response:', response);
      
      if (response.success) {
        const shopsData = Array.isArray(response.data) ? response.data : [];
        console.log('Shop Manager - Shops Data:', shopsData);
        setShops(shopsData);
      } else {
        console.warn('Shop Manager - API response success is false:', response);
        setShops([]);
      }
    } catch (error) {
      console.error('Shop Manager - Error fetching shops:', error);
      setShops([]);
      setError('Failed to load shops. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption?.value || null);
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
      ownerPhone: shop.ownerPhone
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (name, value) => {
    setEditFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'province' && { district: '' })
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
        fetchShops(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating shop:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update shop';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
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
        fetchShops(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting shop:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete shop';
      alert(`Error: ${errorMessage}`);
    }
  };

  const exportToExcel = () => {
    if (shops.length === 0) {
      alert('No shops data to export');
      return;
    }
    exportShopsToExcel(shops);
  };

  const filteredShops = selectedDistrict
    ? shops.filter(shop => shop.district === selectedDistrict)
    : shops;

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '0.75rem',
      borderColor: '#e2e8f0',
      padding: '0.25rem',
      '&:hover': { borderColor: '#cbd5e1' }
    }),
    menu: (base) => ({ ...base, borderRadius: '0.75rem', overflow: 'hidden' }),
    option: (base, { isFocused }) => ({
      ...base,
      backgroundColor: isFocused ? '#f1f5f9' : 'white',
      color: '#0f172a',
      '&:active': { backgroundColor: '#e2e8f0' }
    })
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                <Store className="inline-block w-8 h-8 mr-2" />
                Shops Management
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>View and manage all shops</p>
            </div>
            <button
              onClick={exportToExcel}
              style={{
                padding: '0.625rem 1.25rem', background: 'white', border: '2px solid #e2e8f0', color: '#475569',
                borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <Download className="w-5 h-5" />
              Export to Excel
            </button>
          </div>

          {/* Statistics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #3b82f633' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1e40af' }}>Total Shops</p>
                <Store className="w-6 h-6 text-blue-600" />
              </div>
              <p style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1e40af' }}>{shops.length}</p>
            </div>
          </div>
        </div>

        {/* District Filter */}
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
            <MapPin className="w-4 h-4 inline mr-1" />
            Filter by District
          </label>
          <Select
            options={[...new Set(shops.map(s => s.district).filter(Boolean))].map(d => ({ label: d, value: d }))}
            isClearable
            onChange={handleDistrictChange}
            placeholder="Select or search district"
            styles={customSelectStyles}
          />
        </div>

        {/* Shops Table */}
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
              <ClipLoader color="#3b82f6" loading={loading} size={50} />
            </div>
          ) : error ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: '#ef4444', fontWeight: 500 }}>{error}</p>
            </div>
          ) : filteredShops.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    {['ID', 'Shop Name', 'Description', 'Province', 'District', 'Owner', 'Email', 'Phone', 'Created At', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredShops.map(shop => (
                    <tr key={shop.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontWeight: 600 }}>#{shop.id}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '2.5rem', height: '2.5rem', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.125rem', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}>
                            {shop.shopName ? shop.shopName.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <p style={{ fontWeight: 600, color: '#0f172a' }}>{shop.shopName}</p>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: '#475569', maxWidth: '200px' }}>
                        <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={shop.description}>
                          {shop.description}
                        </p>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: '#475569' }}>{shop.province}</td>
                      <td style={{ padding: '1rem 1.5rem', color: '#475569' }}>{shop.district}</td>
                      <td style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 500 }}>{shop.ownerName}</td>
                      <td style={{ padding: '1rem 1.5rem', color: '#475569' }}>{shop.ownerEmail}</td>
                      <td style={{ padding: '1rem 1.5rem', color: '#475569' }}>{shop.ownerPhone}</td>
                      <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                        {new Date(shop.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEditShop(shop)}
                            style={{
                              padding: '0.5rem 1rem', background: '#dbeafe',
                              color: '#1e40af', border: '1px solid #bfdbfe',
                              borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem',
                              cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.25rem'
                            }}
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteShop(shop.id)}
                            style={{
                              padding: '0.5rem 1rem', background: '#fee2e2',
                              color: '#991b1b', border: '1px solid #fecaca',
                              borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem',
                              cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.25rem'
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
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
              <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p style={{ color: '#64748b', fontSize: '1.125rem', fontWeight: 500 }}>No shops found</p>
            </div>
          )}
        </div>

        {/* Edit Shop Modal */}
        {isEditModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
            <div style={{ background: 'white', borderRadius: '1rem', maxWidth: '48rem', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Edit Shop</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ width: '2rem', height: '2rem', background: '#f1f5f9', border: 'none', borderRadius: '0.5rem', fontSize: '1.5rem', color: '#64748b', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ padding: '1.5rem', maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {/* Shop Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                      Shop Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.shopName}
                      onChange={(e) => handleEditFormChange('shopName', e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                      Description
                    </label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => handleEditFormChange('description', e.target.value)}
                      rows={3}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', resize: 'vertical' }}
                    />
                  </div>

                  {/* Province */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                      Province
                    </label>
                    <select
                      value={editFormData.province}
                      onChange={(e) => handleEditFormChange('province', e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                    >
                      <option value="">Select province</option>
                      {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                      District
                    </label>
                    <select
                      value={editFormData.district}
                      onChange={(e) => handleEditFormChange('district', e.target.value)}
                      disabled={!editFormData.province}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                    >
                      <option value="">Select district</option>
                      {editFormData.province && districts[editFormData.province]?.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Owner Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                      Owner Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.ownerName}
                      onChange={(e) => handleEditFormChange('ownerName', e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                    />
                  </div>

                  {/* Owner Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                      Owner Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.ownerEmail}
                      onChange={(e) => handleEditFormChange('ownerEmail', e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                    />
                  </div>

                  {/* Owner Phone */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                      Owner Phone
                    </label>
                    <input
                      type="tel"
                      value={editFormData.ownerPhone}
                      onChange={(e) => handleEditFormChange('ownerPhone', e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    style={{
                      flex: 1, padding: '0.75rem', background: '#f1f5f9', border: 'none',
                      borderRadius: '0.5rem', fontWeight: 600, color: '#475569', cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateShop}
                    disabled={loading}
                    style={{
                      flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                      border: 'none', borderRadius: '0.5rem', fontWeight: 600, color: 'white',
                      cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1
                    }}
                  >
                    {loading ? 'Updating...' : 'Update Shop'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
