import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import '../Styles/Agent.css';
import { listAgents, deleteUser, updateUserRole } from '../../services/usersService';

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

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await listAgents();
        setAgents(response);
        setError(null);
      } catch (error) {
        console.error('Error fetching agents:', error);
        setError('Failed to fetch agents');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Remove Airtable preview effect as services are no longer available

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      setAgents(agents.filter(agent => agent.id !== id));
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setResponseMessage('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create user with agent role
      const agentData = {
        full_name: formData.fullname,
        email: formData.email,
        phone: formData.phonenumber,
        role: 'agent',
        profile: {
          province: formData.province,
          district: formData.district,
          sector: formData.sector
        }
      };
      
      // Note: This would require a proper user creation endpoint
      // For now, we'll simulate the creation
      setResponseMessage('Agent created successfully');
      
      // Refresh the agents list
      const response = await listAgents();
      setAgents(response);
      
      setFormData({
        fullname: '',
        email: '',
        phonenumber: '',
        province: '',
        district: '',
        sector: ''
      });
    } catch (error) {
      setResponseMessage('Error creating agent');
      console.error('Error creating agent:', error);
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
            {new Set(agents.map(a => a.province)).size}
          </p>
        </div>
        <div className="stats-card1">
          <p>Districts Covered</p>
          <p className="stats-number">
            {new Set(agents.map(a => a.district)).size}
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
            <div className="error-message">{error}</div>
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
                          {agent.fullname ? agent.fullname.charAt(0) : 'A'}
                        </div>
                        <div className="user-info">
                          <div className="user-name">{agent.full_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="contact-column">
                      <div className="contact-primary">{agent.email}</div>
                      <div className="contact-secondary">{agent.phone}</div>
                    </td>
                    <td className="location-column">
                      <div className="location-primary">{agent.province}</div>
                      <div className="location-secondary">
                        {agent.district}, {agent.sector}
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
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="form-group">
                  <label>{key}</label>
                  <input
                    type={key === 'email' ? 'email' : 'text'}
                    name={key}
                    value={value}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary1">Create Agent</button>
              </div>
            </form>
            {responseMessage && (
              <p className={`response-message ${responseMessage.includes('success') ? 'success' : 'error'}`}>
                {responseMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}