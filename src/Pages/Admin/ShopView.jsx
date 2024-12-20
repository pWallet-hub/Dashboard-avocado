import { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import Select from 'react-select';
import '../Styles/Shop.css';

export default function ShopView() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('https://api.example.com/shops');
        setShops(response.data);
      } catch (error) {
        console.error('Error fetching shops:', error);
        setError('There was an error fetching the shops!');
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const toggleSellingPermission = async (shopId, canSell) => {
    try {
      await axios.put(`https://api.example.com/shops/${shopId}`, { canSell });
      setShops(shops.map(shop => shop.id === shopId ? { ...shop, canSell } : shop));
    } catch (error) {
      console.error('Error updating selling permission:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedShop(null);
  };

  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption ? selectedOption.value : '');
  };

  const filteredShops = selectedDistrict
    ? shops.filter(shop => shop.district === selectedDistrict)
    : shops;

  const exportToExcel = () => {
    alert('Exporting to Excel...');
  };

  return (
    <div className="container">
      <div className="content">
        <div className="header-section">
          <div className="header-content">
            <h1 className="page-title">Shops Management</h1>
            <div className="button-container">
              <button
                onClick={() => alert('Add New Shop')}
                className="primary-button"
              >
                + Add New Shop
              </button>
              <button 
                onClick={exportToExcel}
                className="export-button"
              >
                Export to Excel
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stats-card">
              <p className="stats-label">Total Shops</p>
              <p className="stats-value">{shops.length}</p>
            </div>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-container">
              <label className="filter-label">Filter by District:</label>
              <div className="filter-select">
                <Select
                  options={shops.map(shop => ({
                    label: shop.district,
                    value: shop.district
                  }))}
                  isClearable
                  onChange={handleDistrictChange}
                  placeholder="Select or search district"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-container">
          <div className="table-wrapper">
            <div className="table-responsive">
              {loading ? (
                <div className="loader">
                  <ClipLoader color="#3498db" loading={loading} size={50} />
                </div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : filteredShops.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Shop Name</th>
                      <th>Owner</th>
                      <th>Email</th>
                      <th>Phone Number</th>
                      <th>Can Sell</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShops.map(shop => (
                      <tr key={shop.id}>
                        <td>
                          <div className="shop-info">
                            <div className="shop-avatar">
                              {shop.name ? shop.name.charAt(0) : 'S'}
                            </div>
                            <div className="shop-name">{shop.name}</div>
                          </div>
                        </td>
                        <td>
                          <div className="cell-text">{shop.owner}</div>
                        </td>
                        <td>
                          <div className="cell-text">{shop.email}</div>
                        </td>
                        <td>
                          <div className="cell-text">{shop.phoneNumber}</div>
                        </td>
                        <td>
                          <div className="cell-text">{shop.canSell ? 'Yes' : 'No'}</div>
                        </td>
                        <td>
                          <button
                            onClick={() => toggleSellingPermission(shop.id, !shop.canSell)}
                            className={`action-button ${shop.canSell ? 'disable' : 'enable'}`}
                          >
                            {shop.canSell ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-data">No shops found.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Shop Details</h2>
              <button onClick={closeModal} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body">
              {selectedShop && (
                <div className="shop-details">
                  <p className="cell-text">Shop Name: {selectedShop.name}</p>
                  <p className="cell-text">Owner: {selectedShop.owner}</p>
                  <p className="cell-text">Email: {selectedShop.email}</p>
                  <p className="cell-text">Phone Number: {selectedShop.phoneNumber}</p>
                  <p className="cell-text">Can Sell: {selectedShop.canSell ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={closeModal}
                className="modal-close-button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className='advert'> hello world thiis our home </div>
    </div>
  );
}