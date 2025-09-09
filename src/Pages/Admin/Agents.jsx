import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import '../Styles/Agent.css';
import { listAgents, createUser, deleteUser } from '../../services/usersService';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phonenumber: '',
    province: '',
    district: '',
    sector: ''
  });
  const [responseMessage, setResponseMessage] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        setError(null);
        // Pass default pagination params to avoid validation error
        const response = await listAgents({ page: 1, limit: 50 });
        setAgents(Array.isArray(response) ? response : []);
      } catch (error) {
        // Show API error details if available
        const apiMsg = error?.message || 'Failed to fetch agents';
        console.error('Error fetching agents:', error);
        setError(apiMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

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
      fullname: '',
      email: '',
      phonenumber: '',
      province: '',
      district: '',
      sector: ''
    });
  };

  const validateForm = () => {
    if (!formData.fullname.trim()) return 'Full name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
    if (!formData.phonenumber.trim()) return 'Phone number is required';
    if (!formData.province.trim()) return 'Province is required';
    if (!formData.district.trim()) return 'District is required';
    if (!formData.sector.trim()) return 'Sector is required';
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

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

      // Create user with agent role
      const agentData = {
        full_name: formData.fullname.trim(),
        email: formData.email.trim(),
        phone: formData.phonenumber.trim(),
        role: 'agent',
        profile: {
          province: formData.province.trim(),
          district: formData.district.trim(),
          sector: formData.sector.trim()
        }
      };
      
      const newAgent = await createUser(agentData);
      
      // Refresh the agents list
      const response = await listAgents({ page: 1, limit: 50 });
      setAgents(Array.isArray(response) ? response : []);
      
      setResponseMessage('Agent created successfully');
      
      // Reset form
      setFormData({
        fullname: '',
        email: '',
        phonenumber: '',
        province: '',
        district: '',
        sector: ''
      });
      
      // Close modal after 2 seconds
      setTimeout(() => closeModal(), 2000);
    } catch (error) {
      const apiMsg = error?.message || 'Error creating agent';
      setResponseMessage(apiMsg);
      console.error('Error creating agent:', error);
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
            {new Set(agents.map(a => a.profile?.province)).size}
          </p>
        </div>
        <div className="stats-card1">
          <p>Districts Covered</p>
          <p className="stats-number">
            {new Set(agents.map(a => a.profile?.district)).size}
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
                className="btn-primary mt-2"
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
                          <div className="user-role">Agent</div>
                        </div>
                      </div>
                    </td>
                    <td className="contact-column">
                      <div className="contact-primary">{agent.email}</div>
                      <div className="contact-secondary">{agent.phone}</div>
                    </td>
                    <td className="location-column">
                      <div className="location-primary">{agent.profile?.province || 'N/A'}</div>
                      <div className="location-secondary">
                        {agent.profile?.district || 'N/A'}, {agent.profile?.sector || 'N/A'}
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
                  name="fullname"
                  value={formData.fullname}
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
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phonenumber"
                  value={formData.phonenumber}
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
                <button type="submit" className="btn-primary1" disabled={submitLoading}>
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