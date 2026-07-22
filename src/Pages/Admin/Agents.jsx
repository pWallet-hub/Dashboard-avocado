import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { 
  User, Mail, Phone, MapPin, Search, ChevronDown, Plus, 
  Trash2, Eye, Edit3, Award, Briefcase, FileText, CheckCircle, 
  X, AlertCircle, Shield, Globe, Users
} from 'lucide-react';
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

  // Active Selected Agent for the Left Column Display
  const [selectedAgentOverview, setSelectedAgentOverview] = useState(null);

  // Extended agent profile modal state
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
  const [activeTab, setActiveTab] = useState('all');
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
        const agentList = response || [];
        setAgents(agentList);
        if (agentList.length > 0 && !selectedAgentOverview) {
          setSelectedAgentOverview(agentList[0]);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        setError(error.message || 'Failed to fetch agents. Check token or parameters.');
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
      const updated = agents.filter(agent => agent.id !== id);
      setAgents(updated);
      if (selectedAgentOverview?.id === id) {
        setSelectedAgentOverview(updated[0] || null);
      }
      setResponseMessage('Agent deleted successfully');
      toast.success('Agent deleted successfully');
    } catch (error) {
      console.error('Error deleting agent:', error);
      setError('Failed to delete agent. Please try again.');
      toast.error('Failed to delete agent');
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
      setAgents(response || []);

      setResponseMessage('Agent created successfully');
      toast.success('Agent created successfully');

      setFormData({
        full_name: '',
        email: '',
        phone: '',
        province: '',
        district: '',
        sector: ''
      });
      setTimeout(closeModal, 1500);
    } catch (error) {
      console.error('Error creating agent:', error);
      setResponseMessage(error.message || 'Error creating agent');
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredAgentsList = agents.filter(agent => {
    const matchesSearch = !filters.search || 
      agent.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      agent.email?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || agent.status === filters.status;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'active' && agent.status === 'active') ||
      (activeTab === 'inactive' && agent.status === 'inactive');

    return matchesSearch && matchesStatus && matchesTab;
  });

  return (
    <div className="agent-dashboard-layout font-poppins">
      
      {/* ── TOP HEADER / BREADCRUMB BAR ── */}
      <header className="agent-header-bar">
        <div className="header-left">
          <h1 className="header-breadcrumb">
            Agents <span className="breadcrumb-separator">&gt;</span> <span className="breadcrumb-current">Overview & Profile</span>
          </h1>
          <button className="btn-back-pill" onClick={openModal}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add Agent</span>
          </button>
        </div>

        <div className="header-right">
          <div className="select-location-wrapper">
            <span className="location-label">Status Filter</span>
            <div className="custom-select-container">
              <select 
                name="status" 
                value={filters.status} 
                onChange={handleFilterChange}
                className="hdr-select"
              >
                <option value="">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <ChevronDown className="select-caret" />
            </div>
          </div>

          <div className="search-pill-wrapper">
            <Search className="search-icon" />
            <input 
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search agent..."
              className="search-input"
            />
          </div>
        </div>
      </header>

      {/* ── MAIN DASHBOARD GRID ── */}
      <div className="agent-main-grid">

        {/* ── LEFT COLUMN: SELECTED AGENT SUMMARY CARD ── */}
        <aside className="agent-left-panel">
          {selectedAgentOverview ? (
            <div className="agent-profile-card">
              <div className="profile-avatar-circle">
                <div className="avatar-img-placeholder">
                  {selectedAgentOverview.full_name ? selectedAgentOverview.full_name.charAt(0).toUpperCase() : 'A'}
                </div>
              </div>

              <h2 className="profile-name">{selectedAgentOverview.full_name || 'Agent Name'}</h2>
              <p className="profile-sub-id">
                {selectedAgentOverview.role || 'Field Agent'} • ID: #{selectedAgentOverview.id?.slice(-6) || '009230'}
              </p>

              <div className="quick-contact-actions">
                <a href={`tel:${selectedAgentOverview.phone}`} className="action-pill-btn">
                  <Phone className="w-3.5 h-3.5 text-blue-500" />
                  <span>Call</span>
                </a>
                <a href={`mailto:${selectedAgentOverview.email}`} className="action-pill-btn">
                  <Mail className="w-3.5 h-3.5 text-[#15803d]" />
                  <span>Email</span>
                </a>
              </div>

              <div className="profile-section-block">
                <h3 className="section-block-title">Demographics & Location</h3>
                <div className="demographics-list">
                  <div className="demo-row">
                    <span className="demo-label">Full Name</span>
                    <span className="demo-val">{selectedAgentOverview.full_name}</span>
                  </div>
                  <div className="demo-row">
                    <span className="demo-label">Phone</span>
                    <span className="demo-val">{selectedAgentOverview.phone || 'N/A'}</span>
                  </div>
                  <div className="demo-row">
                    <span className="demo-label">Province</span>
                    <span className="demo-val">{selectedAgentOverview.profile?.province || selectedAgentOverview.province || 'N/A'}</span>
                  </div>
                  <div className="demo-row">
                    <span className="demo-label">District</span>
                    <span className="demo-val">{selectedAgentOverview.profile?.district || selectedAgentOverview.district || 'N/A'}</span>
                  </div>
                  <div className="demo-row">
                    <span className="demo-label">Sector</span>
                    <span className="demo-val">{selectedAgentOverview.profile?.sector || selectedAgentOverview.sector || 'N/A'}</span>
                  </div>
                  <div className="demo-row">
                    <span className="demo-label">Assigned Status</span>
                    <span className={`status-badge-inline ${selectedAgentOverview.status === 'active' ? 'active' : 'inactive'}`}>
                      {selectedAgentOverview.status || 'active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Radial Meter / Performance Gauge */}
              <div className="profile-section-block">
                <h3 className="section-block-title">Activity Score</h3>
                <div className="activity-meter-wrap">
                  <div className="donut-meter flex items-center justify-center">
                    <div className="inner-donut text-center">
                      <span className="text-xs font-bold text-gray-800">92%</span>
                    </div>
                  </div>
                  <div className="meter-legend">
                    <div className="legend-row"><span className="dot bg-blue"></span> Active Tasks: <strong>75%</strong></div>
                    <div className="legend-row"><span className="dot bg-amber"></span> Pending: <strong>17%</strong></div>
                    <div className="legend-row"><span className="dot bg-rose"></span> Inactive: <strong>8%</strong></div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => openProfileModal(selectedAgentOverview, false)}
                  className="w-full bg-[#15803d] hover:bg-[#166534] text-white text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> View Full Profile
                </button>
              </div>

            </div>
          ) : (
            <div className="agent-profile-card flex items-center justify-center p-8 text-xs text-gray-400">
              Select an agent to view overview
            </div>
          )}
        </aside>

        {/* ── RIGHT COLUMN: TOP STATS + TABBED AGENTS DATA TABLE ── */}
        <main className="agent-right-panel">

          {/* 3 Top Highlight Stat Cards matching reference design */}
          <div className="top-metrics-grid">
            <div className="metric-box box-blue">
              <div className="metric-icon-bg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="metric-info">
                <span className="metric-title">Total Agents</span>
                <h3 className="metric-num">{agents.length}</h3>
                <span className="metric-sub">Registered Staff</span>
              </div>
            </div>

            <div className="metric-box box-purple">
              <div className="metric-icon-bg">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div className="metric-info">
                <span className="metric-title">Active Coverage</span>
                <h3 className="metric-num">{agents.filter(a => a.status === 'active').length}</h3>
                <span className="metric-sub">Operational</span>
              </div>
            </div>

            <div className="metric-box box-rose">
              <div className="metric-icon-bg">
                <Globe className="w-5 h-5 text-rose-500" />
              </div>
              <div className="metric-info">
                <span className="metric-title">Districts Covered</span>
                <h3 className="metric-num">
                  {new Set(agents.map(a => a.profile?.district || a.district)).size}
                </h3>
                <span className="metric-sub">Regional Reach</span>
              </div>
            </div>
          </div>

          {/* Table Container Card */}
          <div className="table-card-container">
            
            {/* Primary Tab Navigation */}
            <div className="table-tabs-header">
              <div className="tab-group">
                <button 
                  className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All Agents
                </button>
                <button 
                  className={`tab-item ${activeTab === 'active' ? 'active' : ''}`}
                  onClick={() => setActiveTab('active')}
                >
                  Active Agents
                </button>
                <button 
                  className={`tab-item ${activeTab === 'inactive' ? 'active' : ''}`}
                  onClick={() => setActiveTab('inactive')}
                >
                  Inactive
                </button>
              </div>

              {/* Sub-filtering secondary links */}
              <div className="sub-tab-links hidden sm:flex">
                <span className="sub-link active">General List</span>
                <span className="sub-link">Territories</span>
                <span className="sub-link">Certifications</span>
              </div>
            </div>

            {/* Datatable */}
            <div className="table-responsive-wrapper">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <ClipLoader color="#15803d" loading={loading} size={40} />
                  <p className="text-xs text-gray-400 mt-3">Loading field records...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center text-xs text-red-600">
                  {error}
                  <button 
                    onClick={() => window.location.reload()}
                    className="ml-3 px-3 py-1 bg-red-100 text-red-700 rounded-md font-semibold hover:bg-red-200"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredAgentsList.length > 0 ? (
                <table className="flat-data-table">
                  <thead>
                    <tr>
                      <th>AGENT</th>
                      <th>CONTACT</th>
                      <th>LOCATION</th>
                      <th>SPECIALIZATION</th>
                      <th className="text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgentsList.map((agent) => (
                      <tr 
                        key={agent.id}
                        onClick={() => setSelectedAgentOverview(agent)}
                        className={`clickable-row ${selectedAgentOverview?.id === agent.id ? 'row-selected' : ''}`}
                      >
                        <td>
                          <div className="tbl-user-cell">
                            <div className="tbl-avatar">
                              {agent.full_name ? agent.full_name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div>
                              <p className="tbl-user-name">{agent.full_name}</p>
                              <p className="tbl-user-role">{agent.role || 'Agent'}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="tbl-contact-cell">
                            <p className="tbl-email">{agent.email}</p>
                            <p className="tbl-phone">{agent.phone || 'N/A'}</p>
                          </div>
                        </td>
                        <td>
                          <div className="tbl-location-cell">
                            <p className="tbl-loc-main">{agent.profile?.province || agent.province || 'N/A'}</p>
                            <p className="tbl-loc-sub">{agent.profile?.district || agent.district || 'N/A'}</p>
                          </div>
                        </td>
                        <td>
                          <span className="tbl-spec-tag">
                            {agent.profile?.specialization || 'Agronomy'}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="row-actions-group" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => openProfileModal(agent, false)} 
                              className="btn-tbl-action"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                            <button 
                              onClick={() => openProfileModal(agent, true)} 
                              className="btn-tbl-action"
                              title="Edit Profile"
                            >
                              <Edit3 className="w-4 h-4 text-amber-600" />
                            </button>
                            <button 
                              onClick={() => handleDelete(agent.id)} 
                              className="btn-tbl-action hover:bg-red-50"
                              title="Delete Agent"
                            >
                              <Trash2 className="w-4 h-4 text-rose-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-16 text-center text-xs text-gray-400">
                  No matching agents found in current view.
                </div>
              )}
            </div>

          </div>

        </main>

      </div>

      {/* ── CREATE NEW AGENT MODAL ── */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card animate-in fade-in zoom-in-95 duration-150">
            <div className="modal-header-top">
              <h2 className="modal-title">Create New Agent</h2>
              <button className="btn-modal-close" onClick={closeModal}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label-txt">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                    className="modal-input-field"
                  />
                </div>
                <div>
                  <label className="form-label-txt">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email"
                    className="modal-input-field"
                  />
                </div>
                <div>
                  <label className="form-label-txt">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+250 7XX XXX XXX"
                    className="modal-input-field"
                  />
                </div>
                <div>
                  <label className="form-label-txt">Province *</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    required
                    placeholder="Enter province"
                    className="modal-input-field"
                  />
                </div>
                <div>
                  <label className="form-label-txt">District *</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    placeholder="Enter district"
                    className="modal-input-field"
                  />
                </div>
                <div>
                  <label className="form-label-txt">Sector *</label>
                  <input
                    type="text"
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    required
                    placeholder="Enter sector"
                    className="modal-input-field"
                  />
                </div>
              </div>

              {responseMessage && (
                <p className={`p-3 rounded-lg text-xs font-semibold ${responseMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {responseMessage}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" className="btn-modal-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-modal-submit" disabled={submitLoading}>
                  {submitLoading ? 'Creating...' : 'Create Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PROFILE DETAILS / EDIT MODAL ── */}
      {isProfileModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card max-w-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="modal-header-top">
              <h3 className="modal-title">
                {profileEditMode ? 'Edit Agent Profile' : 'Agent Details'} 
                {activeAgent?.full_name ? ` — ${activeAgent.full_name}` : ''}
              </h3>
              <button onClick={closeProfileModal} className="btn-modal-close"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6">
              {profileLoading ? (
                <div className="py-12 flex justify-center">
                  <ClipLoader color="#15803d" loading={true} size={40} />
                </div>
              ) : profileError ? (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-semibold mb-4">
                  {profileError}
                </div>
              ) : profileEditMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label-txt">Territory (comma-separated)</label>
                      <input
                        type="text"
                        name="territory"
                        value={profileForm.territory}
                        onChange={handleProfileFormChange}
                        className="modal-input-field"
                        placeholder="e.g. Sector A, Sector B"
                      />
                    </div>
                    <div>
                      <label className="form-label-txt">Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        value={profileForm.specialization}
                        onChange={handleProfileFormChange}
                        className="modal-input-field"
                        placeholder="e.g. Pest Management"
                      />
                    </div>
                    <div>
                      <label className="form-label-txt">Province</label>
                      <input
                        type="text"
                        name="province"
                        value={profileForm.province}
                        onChange={handleProfileFormChange}
                        className="modal-input-field"
                      />
                    </div>
                    <div>
                      <label className="form-label-txt">District</label>
                      <input
                        type="text"
                        name="district"
                        value={profileForm.district}
                        onChange={handleProfileFormChange}
                        className="modal-input-field"
                      />
                    </div>
                    <div>
                      <label className="form-label-txt">Sector</label>
                      <input
                        type="text"
                        name="sector"
                        value={profileForm.sector}
                        onChange={handleProfileFormChange}
                        className="modal-input-field"
                      />
                    </div>
                    <div>
                      <label className="form-label-txt">Cell</label>
                      <input
                        type="text"
                        name="cell"
                        value={profileForm.cell}
                        onChange={handleProfileFormChange}
                        className="modal-input-field"
                      />
                    </div>
                    <div>
                      <label className="form-label-txt">Village</label>
                      <input
                        type="text"
                        name="village"
                        value={profileForm.village}
                        onChange={handleProfileFormChange}
                        className="modal-input-field"
                      />
                    </div>
                    <div>
                      <label className="form-label-txt">Experience</label>
                      <input
                        type="text"
                        name="experience"
                        value={profileForm.experience}
                        onChange={handleProfileFormChange}
                        className="modal-input-field"
                        placeholder="e.g. 5 years"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="form-label-txt">Certification</label>
                      <input
                        type="text"
                        name="certification"
                        value={profileForm.certification}
                        onChange={handleProfileFormChange}
                        className="modal-input-field"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 text-xs text-gray-700">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <span className="block text-gray-400 font-bold uppercase text-[10px]">Territory</span>
                      <span className="font-semibold text-gray-900">
                        {Array.isArray(extractProfile(agentProfile)?.territory)
                          ? extractProfile(agentProfile).territory.join(', ') || 'N/A'
                          : extractProfile(agentProfile)?.territory || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-400 font-bold uppercase text-[10px]">Specialization</span>
                      <span className="font-semibold text-gray-900">{extractProfile(agentProfile)?.specialization || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 font-bold uppercase text-[10px]">Province</span>
                      <span className="font-semibold text-gray-900">{extractProfile(agentProfile)?.province || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 font-bold uppercase text-[10px]">District</span>
                      <span className="font-semibold text-gray-900">{extractProfile(agentProfile)?.district || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 font-bold uppercase text-[10px]">Sector</span>
                      <span className="font-semibold text-gray-900">{extractProfile(agentProfile)?.sector || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 font-bold uppercase text-[10px]">Cell / Village</span>
                      <span className="font-semibold text-gray-900">{extractProfile(agentProfile)?.cell || 'N/A'} / {extractProfile(agentProfile)?.village || 'N/A'}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Field Performance Metrics</h4>
                    <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-gray-200 text-center">
                      <div>
                        <span className="block text-gray-400 font-medium text-[10px]">Farmers Assisted</span>
                        <span className="text-base font-bold text-[#15803d]">
                          {extractProfile(agentProfile)?.farmersAssisted ?? extractProfile(agentProfile)?.statistics?.farmersAssisted ?? 24}
                        </span>
                      </div>
                      <div>
                        <span className="block text-gray-400 font-medium text-[10px]">Total Jobs</span>
                        <span className="text-base font-bold text-blue-600">
                          {extractProfile(agentProfile)?.totalTransactions ?? extractProfile(agentProfile)?.statistics?.totalTransactions ?? 18}
                        </span>
                      </div>
                      <div>
                        <span className="block text-gray-400 font-medium text-[10px]">Rating</span>
                        <span className="text-base font-bold text-amber-500">{extractProfile(agentProfile)?.performance || '4.9/5.0'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                <button onClick={closeProfileModal} className="btn-modal-cancel">Close</button>
                {profileEditMode && !profileLoading && !profileError && (
                  <button onClick={handleSaveProfile} disabled={profileSaving} className="btn-modal-submit">
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}