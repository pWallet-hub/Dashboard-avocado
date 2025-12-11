import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import '../Styles/Agent.css';
import { getAgents, deleteUser, createAgent } from '../../services/usersService';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    province: '',
    district: '',
    sector: ''
  });
  const [responseMessage, setResponseMessage] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    search: ''
  });

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await listAgents();
        setAgents(response || []);
      } catch (error) {
        console.error('Error fetching agents:', error);
        setError(error.message || 'Failed to fetch agents. Check token or parameters.');
        // Log full error for debugging
        if (error.response) console.log('Response:', error.response.data);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [filters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;

    try {
      await deleteUser(id);
      setAgents(agents.filter(agent => agent.id !== id));
      setResponseMessage('Agent deleted successfully');
    } catch (error) {
      console.error('Error deleting agent:', error);
      setError('Failed to delete agent. Please try again.');
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setResponseMessage('');
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      province: '',
      district: '',
      sector: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) return 'Full name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!formData.province.trim()) return 'Province is required';
    if (!formData.district.trim()) return 'District is required';
    if (!formData.sector.trim()) return 'Sector is required';
    return null;
  };

  // UPDATED: Fixed handleSubmit function to match API structure
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setResponseMessage(validationError);
      return;
    }

    try {
      setSubmitLoading(true);
      setResponseMessage('');
      setError(null);
      const handleSubmit = async (e) => {
  e.preventDefault();
  const validationError = validateForm();
  if (validationError) {
    setResponseMessage(validationError);
    return;
  }

  try {
    setSubmitLoading(true);
    setResponseMessage('');
    setError(null);

    // Agent data matching the API structure
    const agentData = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      province: formData.province.trim(),
      district: formData.district.trim(),
      sector: formData.sector.trim()
    };

    console.log('Submitting agent data:', agentData);

    // Use the dedicated createAgent function
    await createAgent(agentData);

    // Refresh the agents list after creation
    const response = await listAgents();
    setAgents(response || []);

    setResponseMessage('Agent created successfully');

    setFormData({
      full_name: '',
      email: '',
      phone: '',
      province: '',
      district: '',
      sector: ''
    });
    setTimeout(closeModal, 2000);
  } catch (error) {
    console.error('Error creating agent:', error);
    console.error('Error details:', error.response?.data);
    setResponseMessage(error.message || 'Error creating agent');
  } finally {
    setSubmitLoading(false);
  }
};

      // FIXED: Match the API endpoint structure - flat structure, not nested under profile
      const agentData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        province: formData.province.trim(),
        district: formData.district.trim(),
        sector: formData.sector.trim()
        // Note: role is not needed as the API endpoint is specifically for agents
      };

      await createUser(agentData);

      // FIXED: Refresh the agents list after creation
      const response = await listAgents();
      setAgents(response || []); // Match the structure from useEffect

      setResponseMessage('Agent created successfully');

      setFormData({
        full_name: '',
        email: '',
        phone: '',
        province: '',
        district: '',
        sector: ''
      });
      setTimeout(closeModal, 2000);
    } catch (error) {
      console.error('Error creating agent:', error);
      setResponseMessage(error.message || 'Error creating agent');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="agents-container">
      <div className="agents-header">
        <h1>Agents Management</h1>
        <button className="btn-primary" onClick={openModal}>+ Add New Agent</button>
      </div>

      <div className="filter-container" style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search by name or email"
          style={{ padding: '8px', width: '200px' }}
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
          <p>Total Agents</p>
          <p className="stats-number">{agents.length}</p>
        </div>
        <div className="stats-card1">
          <p>Active Agents</p>
          <p className="stats-number">{agents.filter(agent => agent.status === 'active').length}</p>
        </div>
        <div className="stats-card1">
          <p>Provinces Covered</p>
          <p className="stats-number">
            {new Set(agents.map(a => a.profile?.province || a.province)).size}
          </p>
        </div>
        <div className="stats-card1">
          <p>Districts Covered</p>
          <p className="stats-number">
            {new Set(agents.map(a => a.profile?.district || a.district)).size}
          </p>
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
                onClick={() => window.location.reload()}
                style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}
              >
                Retry
              </button>
            </div>
          ) : agents.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Agent Details</th>
                  <th className="contact-column">Contact</th>
                  <th className="location-column">Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map(agent => (
                  <tr key={agent.id}>
                    <td>
                      <div className="user-details">
                        <div className="user-avatar">
                          {agent.full_name ? agent.full_name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="user-info">
                          <div className="user-name">{agent.full_name}</div>
                          <div className="user-role">{agent.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="contact-column">
                      <div className="contact-primary">{agent.email}</div>
                      <div className="contact-secondary">{agent.phone}</div>
                    </td>
                    <td className="location-column">
                      <div className="location-primary">{agent.profile?.province || agent.province || 'N/A'}</div>
                      <div className="location-secondary">
                        {agent.profile?.district || agent.district || 'N/A'}, {agent.profile?.sector || agent.sector || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-view">View</button>
                        <button className="btn btn-edit">Edit</button>
                        <button className="btn btn-delete" onClick={() => handleDelete(agent.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="loading-container">No agents found.</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>Create New Agent</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter email"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label>Province</label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  required
                  placeholder="Enter province"
                />
              </div>
              <div className="form-group">
                <label>District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  placeholder="Enter district"
                />
              </div>
              <div className="form-group">
                <label>Sector</label>
                <input
                  type="text"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  required
                  placeholder="Enter sector"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button
                  type="submit"
                  className="btn-primary1"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Creating...' : 'Create Agent'}
                </button>
              </div>
            </form>
            {responseMessage && (
              <p className={`response-message ${responseMessage.includes('success') || responseMessage.includes('created') ? 'success' : 'error'}`}>
                {responseMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}