import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import '../Styles/Agent.css';
import { listAgents, deleteUser, createAgent } from '../../services/usersService';
import { getAgentProfileById, updateAgentProfileById } from '../../services/agent-information';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import { useToast } from '../../components/Ui/Toast';

export default function Agents() {
  const confirm = useConfirm();
  const toast = useToast();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extended agent profile (agent-information) view/edit modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);
  const [agentProfile, setAgentProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    territory: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    specialization: '',
    experience: '',
    certification: ''
  });
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
    if (!(await confirm('Are you sure you want to delete this agent?'))) return;

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

  // Normalize the agent-information response into a flat profile object,
  // since the API may return { user_info, agent_profile } or a flat shape.
  const extractProfile = (data) => {
    if (!data) return {};
    return data.agent_profile || data.profile || data;
  };

  const populateProfileForm = (profile) => {
    setProfileForm({
      territory: Array.isArray(profile?.territory) ? profile.territory.join(', ') : (profile?.territory || ''),
      province: profile?.province || '',
      district: profile?.district || '',
      sector: profile?.sector || '',
      cell: profile?.cell || '',
      village: profile?.village || '',
      specialization: profile?.specialization || '',
      experience: profile?.experience || '',
      certification: profile?.certification || ''
    });
  };

  const openProfileModal = async (agent, editMode = false) => {
    setActiveAgent(agent);
    setProfileEditMode(editMode);
    setIsProfileModalOpen(true);
    setProfileError(null);
    setAgentProfile(null);
    setProfileLoading(true);

    try {
      const data = await getAgentProfileById(agent.id);
      setAgentProfile(data);
      populateProfileForm(extractProfile(data));
    } catch (err) {
      console.error('Error fetching agent profile:', err);
      setProfileError(err.response?.data?.message || err.message || 'Failed to load agent profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setProfileEditMode(false);
    setActiveAgent(null);
    setAgentProfile(null);
    setProfileError(null);
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!activeAgent) return;

    setProfileSaving(true);
    try {
      const updateData = {
        territory: profileForm.territory
          ? profileForm.territory.split(',').map(t => t.trim()).filter(Boolean)
          : [],
        province: profileForm.province.trim(),
        district: profileForm.district.trim(),
        sector: profileForm.sector.trim(),
        cell: profileForm.cell.trim(),
        village: profileForm.village.trim(),
        specialization: profileForm.specialization.trim(),
        experience: profileForm.experience.trim(),
        certification: profileForm.certification.trim()
      };

      const updated = await updateAgentProfileById(activeAgent.id, updateData);
      setAgentProfile(updated);
      populateProfileForm(extractProfile(updated));
      setProfileEditMode(false);
      toast.success('Agent profile updated successfully');
    } catch (err) {
      console.error('Error updating agent profile:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to update agent profile');
    } finally {
      setProfileSaving(false);
    }
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

      const agentData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        province: formData.province.trim(),
        district: formData.district.trim(),
        sector: formData.sector.trim()
      };

      await createAgent(agentData);

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
                        <button className="btn btn-view" onClick={() => openProfileModal(agent, false)}>View</button>
                        <button className="btn btn-edit" onClick={() => openProfileModal(agent, true)}>Edit</button>
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

      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {profileEditMode ? 'Edit Agent Profile' : 'Agent Profile'}
                {activeAgent?.full_name ? ` - ${activeAgent.full_name}` : ''}
              </h3>
              <button
                onClick={closeProfileModal}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {profileLoading ? (
              <div className="py-10 flex justify-center">
                <ClipLoader color="#3498db" loading={true} size={40} />
              </div>
            ) : profileError ? (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                {profileError}
              </div>
            ) : profileEditMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Territory (comma-separated)</label>
                    <input
                      type="text"
                      name="territory"
                      value={profileForm.territory}
                      onChange={handleProfileFormChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Sector A, Sector B"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      value={profileForm.specialization}
                      onChange={handleProfileFormChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Pest Management"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                    <input
                      type="text"
                      name="province"
                      value={profileForm.province}
                      onChange={handleProfileFormChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <input
                      type="text"
                      name="district"
                      value={profileForm.district}
                      onChange={handleProfileFormChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                    <input
                      type="text"
                      name="sector"
                      value={profileForm.sector}
                      onChange={handleProfileFormChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cell</label>
                    <input
                      type="text"
                      name="cell"
                      value={profileForm.cell}
                      onChange={handleProfileFormChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                    <input
                      type="text"
                      name="village"
                      value={profileForm.village}
                      onChange={handleProfileFormChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <input
                      type="text"
                      name="experience"
                      value={profileForm.experience}
                      onChange={handleProfileFormChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. 5 years"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certification</label>
                    <input
                      type="text"
                      name="certification"
                      value={profileForm.certification}
                      onChange={handleProfileFormChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase">Territory</span>
                    <span className="text-sm text-gray-800">
                      {Array.isArray(extractProfile(agentProfile)?.territory)
                        ? extractProfile(agentProfile).territory.join(', ') || 'N/A'
                        : extractProfile(agentProfile)?.territory || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase">Specialization</span>
                    <span className="text-sm text-gray-800">{extractProfile(agentProfile)?.specialization || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase">Province</span>
                    <span className="text-sm text-gray-800">{extractProfile(agentProfile)?.province || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase">District</span>
                    <span className="text-sm text-gray-800">{extractProfile(agentProfile)?.district || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase">Sector</span>
                    <span className="text-sm text-gray-800">{extractProfile(agentProfile)?.sector || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase">Cell</span>
                    <span className="text-sm text-gray-800">{extractProfile(agentProfile)?.cell || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase">Village</span>
                    <span className="text-sm text-gray-800">{extractProfile(agentProfile)?.village || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase">Experience</span>
                    <span className="text-sm text-gray-800">{extractProfile(agentProfile)?.experience || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase">Certification</span>
                    <span className="text-sm text-gray-800">{extractProfile(agentProfile)?.certification || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Performance Metrics</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <span className="block text-xs font-semibold text-gray-500 uppercase">Farmers Assisted</span>
                      <span className="text-sm text-gray-800">
                        {extractProfile(agentProfile)?.farmersAssisted ?? extractProfile(agentProfile)?.statistics?.farmersAssisted ?? 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-500 uppercase">Total Transactions</span>
                      <span className="text-sm text-gray-800">
                        {extractProfile(agentProfile)?.totalTransactions ?? extractProfile(agentProfile)?.statistics?.totalTransactions ?? 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-500 uppercase">Performance</span>
                      <span className="text-sm text-gray-800">{extractProfile(agentProfile)?.performance || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeProfileModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
              >
                Close
              </button>
              {profileEditMode && !profileLoading && !profileError && (
                <button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}