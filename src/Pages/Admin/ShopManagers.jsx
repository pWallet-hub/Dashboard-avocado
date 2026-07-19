import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import '../Styles/Agent.css';
import { getShopManagers, deleteUser, updateUserStatus } from '../../services/usersService';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import { useToast } from '../../components/Ui/Toast';

export default function ShopManagers() {
  const confirm = useConfirm();
  const toast = useToast();
  const [shopManagers, setShopManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  useEffect(() => {
    fetchShopManagers();
  }, []);

  const fetchShopManagers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getShopManagers();
      setShopManagers(Array.isArray(response) ? response : (response?.data || []));
    } catch (err) {
      console.error('Error fetching shop managers:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch shop managers. Check token or parameters.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (!(await confirm('Are you sure you want to delete this shop manager?'))) return;

    try {
      await deleteUser(id);
      setShopManagers(prev => prev.filter(sm => sm.id !== id));
      toast.success('Shop manager deleted successfully');
    } catch (err) {
      console.error('Error deleting shop manager:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to delete shop manager');
    }
  };

  const handleToggleStatus = async (shopManager) => {
    const newStatus = shopManager.status === 'active' ? 'inactive' : 'active';
    try {
      await updateUserStatus(shopManager.id, newStatus);
      setShopManagers(prev => prev.map(sm => sm.id === shopManager.id ? { ...sm, status: newStatus } : sm));
      toast.success(`Shop manager marked as ${newStatus}`);
    } catch (err) {
      console.error('Error updating shop manager status:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to update status');
    }
  };

  const getShopInfo = (sm) => {
    const profile = sm.profile || {};
    const shopName = profile.shop_name || profile.business_name || profile.shopName || sm.shop_name;
    const shopLocation = profile.shop_location || profile.shop_address || [profile.province, profile.district]
      .filter(Boolean)
      .join(', ');
    return { shopName, shopLocation };
  };

  const filteredShopManagers = shopManagers.filter(sm => {
    const search = filters.search.toLowerCase();
    const matchesSearch = !search ||
      (sm.full_name?.toLowerCase().includes(search)) ||
      (sm.email?.toLowerCase().includes(search)) ||
      (sm.phone?.toLowerCase().includes(search));

    const matchesStatus = !filters.status || sm.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="agents-container">
      <div className="agents-header">
        <h1>Shop Managers Management</h1>
      </div>

      <div className="filter-container" style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search by name, email, or phone"
          style={{ padding: '8px', width: '220px' }}
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          style={{ padding: '8px', width: '150px' }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="stats-container">
        <div className="stats-card1">
          <p>Total Shop Managers</p>
          <p className="stats-number">{shopManagers.length}</p>
        </div>
        <div className="stats-card1">
          <p>Active</p>
          <p className="stats-number">{shopManagers.filter(sm => sm.status === 'active').length}</p>
        </div>
        <div className="stats-card1">
          <p>Inactive</p>
          <p className="stats-number">{shopManagers.filter(sm => sm.status === 'inactive').length}</p>
        </div>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-container">
              <ClipLoader color="#3498db" loading={loading} size={50} />
            </div>
          ) : error ? (
            <div className="error-message">
              {error}
              <button
                onClick={fetchShopManagers}
                style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}
              >
                Retry
              </button>
            </div>
          ) : filteredShopManagers.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Shop Manager Details</th>
                  <th className="contact-column">Contact</th>
                  <th className="location-column">Shop Info</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShopManagers.map(sm => {
                  const { shopName, shopLocation } = getShopInfo(sm);
                  return (
                    <tr key={sm.id}>
                      <td>
                        <div className="user-details">
                          <div className="user-avatar">
                            {sm.full_name ? sm.full_name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div className="user-info">
                            <div className="user-name">{sm.full_name}</div>
                            <div className="user-role">{sm.role || 'shop_manager'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="contact-column">
                        <div className="contact-primary">{sm.email}</div>
                        <div className="contact-secondary">{sm.phone || 'N/A'}</div>
                      </td>
                      <td className="location-column">
                        <div className="location-primary">{shopName || 'N/A'}</div>
                        <div className="location-secondary">{shopLocation || 'N/A'}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            backgroundColor: sm.status === 'active' ? '#dcfce7' : '#fee2e2',
                            color: sm.status === 'active' ? '#166534' : '#991b1b'
                          }}
                        >
                          {sm.status || 'unknown'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-edit" onClick={() => handleToggleStatus(sm)}>
                            {sm.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="btn btn-delete" onClick={() => handleDelete(sm.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="loading-container">No shop managers found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
