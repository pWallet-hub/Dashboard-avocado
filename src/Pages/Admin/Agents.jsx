import { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import '../Styles/Agent.css';
import { listAgentProfiles } from '../../services/agentProfilesService';

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
        const response = await axios.get('https://pwallet-api.onrender.com/api/agents');
        setAgents(response.data);
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

  useEffect(() => {
    const fetchAirtableAgents = async () => {
      try {
        const page = await listAgentProfiles({ pageSize: 5, returnFieldsByFieldId: true });
        console.log('[Airtable] Agent Profiles fetched (preview):', page?.records?.length ?? 0, 'records');
      } catch (e) {
        console.debug('[Airtable] Agent Profiles fetch failed (non-blocking):', e?.message || e);
      }
    };
    fetchAirtableAgents();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://pwallet-api.onrender.com/api/agents/${id}`);
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
      const response = await axios.post('https://pwallet-api.onrender.com/api/auth/create-agent', formData);
      setResponseMessage('Agent created successfully');
      setAgents([...agents, response.data]);
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
          <p className="stats-number">{agents.length}</p>
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
                          <div className="user-name">{agent.fullname}</div>
                        </div>
                      </div>
                    </td>
                    <td className="contact-column">
                      <div className="contact-primary">{agent.email}</div>
                      <div className="contact-secondary">{agent.phonenumber}</div>
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