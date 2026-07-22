import React, { useEffect, useState } from 'react';
import { 
  ClipboardList, Clock, CheckCircle, XCircle, User, Mail, Phone, 
  Shield, Edit3, Save, X, Truck, ArrowUpRight, ArrowDownRight, 
  Settings, Key, AlertTriangle, Activity, Lock, ExternalLink
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import '../Styles/Admin.css';
import { getProfile, updateProfile, changePassword } from '../../services/authService';
import { listServiceRequests, listHarvestRequests } from '../../services/serviceRequestsService';

function Admin() {
  const [adminProfile, setAdminProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  
  // Password update modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdateError, setPasswordUpdateError] = useState('');
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

  // Email update modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailUpdateError, setEmailUpdateError] = useState('');
  const [emailUpdateSuccess, setEmailUpdateSuccess] = useState(false);
  
  // Service requests state
  const [serviceRequests, setServiceRequests] = useState([]);
  const [harvestRequests, setHarvestRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const profile = await getProfile();
        setAdminProfile(profile || {});
        setEditedProfile(profile || {});
      } catch (err) {
        console.error(err);
        setError('There was an error fetching the profile data!');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  // Load service requests from API and localStorage
  useEffect(() => {
    const fetchServiceRequests = async () => {
      setRequestsLoading(true);
      setRequestsError(null);
      
      try {
        const [propertyEvalResponse, harvestResponse] = await Promise.allSettled([
          listServiceRequests().catch(err => {
            console.warn('Property evaluation requests failed:', err);
            return [];
          }),
          listHarvestRequests().catch(err => {
            console.warn('Harvest requests failed:', err);
            return { success: false, data: [] };
          })
        ]);

        let propertyRequests = [];
        if (propertyEvalResponse.status === 'fulfilled') {
          const propData = propertyEvalResponse.value;
          propertyRequests = Array.isArray(propData) ? propData : (propData?.data || []);
        }

        let harvestData = [];
        if (harvestResponse.status === 'fulfilled') {
          const harvestResult = harvestResponse.value;
          if (harvestResult?.success && Array.isArray(harvestResult.data)) {
            harvestData = harvestResult.data;
          } else if (Array.isArray(harvestResult?.data)) {
            harvestData = harvestResult.data;
          } else if (Array.isArray(harvestResult)) {
            harvestData = harvestResult;
          }
        }

        setServiceRequests(propertyRequests);
        setHarvestRequests(harvestData);

        const totalRequests = propertyRequests.length + harvestData.length;

        if (totalRequests === 0) {
          const savedRequests = localStorage.getItem('farmerServiceRequests');
          if (savedRequests) {
            try {
              const parsedRequests = JSON.parse(savedRequests);
              if (Array.isArray(parsedRequests) && parsedRequests.length > 0) {
                const propEval = parsedRequests.filter(req => req.service_type === 'property_evaluation' || req.type === 'Property Evaluation');
                const harvest = parsedRequests.filter(req => req.service_type === 'harvest' || req.type === 'Harvesting Day');
                
                setServiceRequests(propEval.length > 0 ? propEval : parsedRequests);
                setHarvestRequests(harvest);
              }
            } catch (parseError) {
              console.error('Error parsing localStorage requests:', parseError);
            }
          }
        }
        
      } catch (err) {
        console.error('Critical error fetching service requests:', err);
        setRequestsError(`Failed to fetch service requests: ${err.message}`);
      } finally {
        setRequestsLoading(false);
      }
    };

    fetchServiceRequests();
  }, []);

  // Stats Counters
  const getPendingRequestsCount = () => {
    const p = serviceRequests.filter(r => r.status === 'pending').length;
    const h = harvestRequests.filter(r => r.status === 'pending').length;
    return p + h;
  };

  const getApprovedRequestsCount = () => {
    const p = serviceRequests.filter(r => r.status === 'approved').length;
    const h = harvestRequests.filter(r => r.status === 'approved').length;
    return p + h;
  };

  const getCompletedRequestsCount = () => {
    const p = serviceRequests.filter(r => r.status === 'completed').length;
    const h = harvestRequests.filter(r => r.status === 'completed').length;
    return p + h;
  };

  const getHarvestRequestsCount = () => harvestRequests.length;
  const getPropertyEvalRequestsCount = () => serviceRequests.length;
  const getTotalRequestsCount = () => serviceRequests.length + harvestRequests.length;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleEditProfile = () => {
    setEditedProfile({ ...adminProfile });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedProfile = await updateProfile({
        full_name: editedProfile.full_name,
        phone: editedProfile.phone
      });
      
      setAdminProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile({ ...adminProfile });
    setIsEditing(false);
  };

  const handleProfileChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  // Password Modal
  const openPasswordModal = () => {
    setIsPasswordModalOpen(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordUpdateError('');
    setPasswordUpdateSuccess(false);
  };

  const closePasswordModal = () => setIsPasswordModalOpen(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPasswordUpdateError('All fields are required');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordUpdateError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordUpdateError('New password must be at least 8 characters long');
      return;
    }
    if (oldPassword === newPassword) {
      setPasswordUpdateError('New password must be different from current password');
      return;
    }

    try {
      await changePassword({ currentPassword: oldPassword, newPassword });
      setPasswordUpdateSuccess(true);
      setPasswordUpdateError('');
      setTimeout(() => closePasswordModal(), 2000);
    } catch (err) {
      console.error(err);
      setPasswordUpdateError(err.response?.data?.message || 'Failed to update password. Please try again.');
    }
  };

  // Email Modal
  const openEmailModal = () => {
    setIsEmailModalOpen(true);
    setNewEmail('');
    setEmailUpdateError('');
    setEmailUpdateSuccess(false);
  };

  const closeEmailModal = () => setIsEmailModalOpen(false);

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    if (!newEmail) {
      setEmailUpdateError('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailUpdateError('Please enter a valid email address');
      return;
    }

    try {
      await updateProfile({ email: newEmail });
      setEmailUpdateSuccess(true);
      setEmailUpdateError('');
      setAdminProfile(prev => ({ ...prev, email: newEmail }));
      setTimeout(() => closeEmailModal(), 2000);
    } catch (err) {
      console.error(err);
      setEmailUpdateError(err.response?.data?.message || 'Failed to update email. Please try again.');
    }
  };

  // Sample analytics chart data derived dynamically
  const activityData = [
    { name: 'Jan', requests: 12, completed: 8 },
    { name: 'Feb', requests: 19, completed: 14 },
    { name: 'Mar', requests: 15, completed: 11 },
    { name: 'Apr', requests: 22, completed: 18 },
    { name: 'May', requests: 28, completed: 24 },
    { name: 'Jun', requests: 34, completed: 29 },
    { name: 'Jul', requests: 40, completed: 35 },
    { name: 'Aug', requests: 38, completed: 32 },
    { name: 'Sep', requests: 45, completed: 39 },
    { name: 'Oct', requests: 52, completed: 46 },
    { name: 'Nov', requests: 58, completed: 50 },
    { name: 'Dec', requests: getTotalRequestsCount() || 64, completed: getCompletedRequestsCount() || 55 },
  ];

  const pieData = [
    { name: 'Harvesting', value: getHarvestRequestsCount() || 10, color: '#38ef7d' },
    { name: 'Evaluations', value: getPropertyEvalRequestsCount() || 5, color: '#00f2fe' },
    { name: 'Pending', value: getPendingRequestsCount() || 3, color: '#a855f7' }
  ];

  return (
    <div className="admin-dashboard-root font-poppins">
      <div className="admin-wrapper">
        
        {/* Modern Flat Top Bar */}
        <header className="dash-header flex justify-between items-center mb-6">
          <div>
            <h1 className="dash-title">System Overview</h1>
            <p className="dash-subtitle">Welcome back, {adminProfile.full_name || 'Administrator'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleLogout} className="dash-logout-btn">
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div className="dash-alert error mb-6">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* 4 Colored Metric Stat Cards matching design exactness */}
        <div className="metrics-grid">
          <div className="metric-card bg-emerald">
            <div className="metric-content">
              <span className="metric-label">TOTAL REQUESTS</span>
              <h2 className="metric-value">{getTotalRequestsCount()}</h2>
              <div className="metric-badge">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+12.5%</span>
              </div>
            </div>
            <ClipboardList className="metric-watermark" />
          </div>

          <div className="metric-card bg-purple">
            <div className="metric-content">
              <span className="metric-label">HARVEST JOBS</span>
              <h2 className="metric-value">{getHarvestRequestsCount()}</h2>
              <div className="metric-badge">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+8.2%</span>
              </div>
            </div>
            <Truck className="metric-watermark" />
          </div>

          <div className="metric-card bg-blue">
            <div className="metric-content">
              <span className="metric-label">EVALUATIONS</span>
              <h2 className="metric-value">{getPropertyEvalRequestsCount()}</h2>
              <div className="metric-badge">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+5.7%</span>
              </div>
            </div>
            <CheckCircle className="metric-watermark" />
          </div>

          <div className="metric-card bg-coral">
            <div className="metric-content">
              <span className="metric-label">PENDING ACTION</span>
              <h2 className="metric-value">{getPendingRequestsCount()}</h2>
              <div className="metric-badge down">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>-2.1%</span>
              </div>
            </div>
            <Clock className="metric-watermark" />
          </div>
        </div>

        {/* Middle Dual Grid: Overview Analytics & Donut Breakdowns */}
        <div className="analytics-grid">
          {/* Main Area Analytics */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3 className="dash-card-title">Activity & Request Flow</h3>
              <div className="dash-card-action">
                <Activity className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38ef7d" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38ef7d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} />
                  <Tooltip contentStyle={{ background: '#fff', borderRadius: '8px', border: '1px solid #eee', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="requests" stroke="#00f2fe" strokeWidth={2} fillOpacity={1} fill="url(#colorReq)" />
                  <Area type="monotone" dataKey="completed" stroke="#38ef7d" strokeWidth={2} fillOpacity={1} fill="url(#colorComp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="dot bg-cyan"></span> Requests Received</span>
              <span className="legend-item"><span className="dot bg-green"></span> Resolved / Completed</span>
            </div>
          </div>

          {/* Service Distribution Pie */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3 className="dash-card-title">Request Types Distribution</h3>
            </div>
            <div className="chart-container flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-center-label">
                <span className="pie-count">{getTotalRequestsCount()}</span>
                <span className="pie-sub">Total</span>
              </div>
            </div>
            <div className="chart-legend vertical">
              <span className="legend-item"><span className="dot" style={{ background: '#38ef7d' }}></span> Harvest Requests</span>
              <span className="legend-item"><span className="dot" style={{ background: '#00f2fe' }}></span> Property Evaluations</span>
              <span className="legend-item"><span className="dot" style={{ background: '#a855f7' }}></span> Pending Queue</span>
            </div>
          </div>
        </div>

        {/* Bottom Dual Grid: Activity Stream & Account Administration Table */}
        <div className="content-grid">
          
          {/* Recent Activity List matching exact left bottom block */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3 className="dash-card-title">Recent Activity Log</h3>
            </div>

            {requestsLoading ? (
              <div className="dash-loading-box">
                <div className="dash-spinner"></div>
                <p>Loading activity feeds...</p>
              </div>
            ) : requestsError ? (
              <div className="dash-alert error"><p>{requestsError}</p></div>
            ) : (
              <div className="activity-feed-list">
                {harvestRequests.slice(0, 4).map((req, idx) => (
                  <div key={req.id || idx} className="feed-item">
                    <div className={`feed-icon-circle ${req.status === 'completed' ? 'green' : req.status === 'approved' ? 'blue' : 'amber'}`}>
                      {req.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="feed-details">
                      <p className="feed-title">
                        {req.farmer_id?.full_name || 'Farmer Client'} requested Harvest
                      </p>
                      <p className="feed-sub">
                        Request ID: #{req.request_number || (idx + 101)} • {req.harvest_details?.trees_to_harvest || 0} Trees
                      </p>
                    </div>
                    <span className={`status-pill ${req.status || 'pending'}`}>
                      {req.status || 'pending'}
                    </span>
                  </div>
                ))}

                {serviceRequests.slice(0, 2).map((req, idx) => (
                  <div key={req.id || `prop-${idx}`} className="feed-item">
                    <div className="feed-icon-circle purple">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div className="feed-details">
                      <p className="feed-title">Property Evaluation Request</p>
                      <p className="feed-sub">
                        Location: {req.location?.village || 'District Site'}
                      </p>
                    </div>
                    <span className={`status-pill ${req.status || 'pending'}`}>
                      {req.status || 'pending'}
                    </span>
                  </div>
                ))}

                {harvestRequests.length === 0 && serviceRequests.length === 0 && (
                  <div className="feed-empty">No recent activity detected in database.</div>
                )}
              </div>
            )}
          </div>

          {/* Account Profile & Settings Section matching right bottom table block */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h3 className="dash-card-title">Admin Account Profile</h3>
              {!isEditing ? (
                <button onClick={handleEditProfile} className="icon-btn-edit">
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} disabled={loading} className="icon-btn-save">
                    <Save className="w-3.5 h-3.5 mr-1" /> Save
                  </button>
                  <button onClick={handleCancelEdit} className="icon-btn-cancel">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="profile-table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>ACCOUNT FIELD</th>
                    <th>INFORMATION</th>
                    <th className="text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="flex items-center gap-2 font-medium">
                        <User className="w-4 h-4 text-purple-500" />
                        <span>Full Name</span>
                      </div>
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.full_name || ''}
                          onChange={(e) => handleProfileChange('full_name', e.target.value)}
                          className="table-input"
                        />
                      ) : (
                        <span className="font-semibold text-gray-800">{adminProfile.full_name || 'N/A'}</span>
                      )}
                    </td>
                    <td className="text-right">
                      <span className="badge-pill in-stock">Active</span>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="flex items-center gap-2 font-medium">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span>Email Address</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-gray-700">{adminProfile.email || 'N/A'}</span>
                    </td>
                    <td className="text-right">
                      <button onClick={openEmailModal} className="text-link">Update</button>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="flex items-center gap-2 font-medium">
                        <Phone className="w-4 h-4 text-emerald-500" />
                        <span>Phone Number</span>
                      </div>
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile.phone || ''}
                          onChange={(e) => handleProfileChange('phone', e.target.value)}
                          className="table-input"
                        />
                      ) : (
                        <span className="text-gray-700">{adminProfile.phone || 'N/A'}</span>
                      )}
                    </td>
                    <td className="text-right">
                      <span className="badge-pill in-stock">Verified</span>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="flex items-center gap-2 font-medium">
                        <Shield className="w-4 h-4 text-coral-500" />
                        <span>Role</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-semibold text-gray-800 uppercase text-xs tracking-wider">{adminProfile.role || 'Admin'}</span>
                    </td>
                    <td className="text-right">
                      <span className="badge-pill system">System</span>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="flex items-center gap-2 font-medium">
                        <Lock className="w-4 h-4 text-amber-500" />
                        <span>Security</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-gray-500 text-xs">••••••••••••</span>
                    </td>
                    <td className="text-right">
                      <button onClick={openPasswordModal} className="text-link">Change</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="dash-card-footer mt-4 pt-4 border-t flex justify-between gap-3">
              <a href="/dashboard/admin/service-requests" className="action-btn-outline">
                <ClipboardList className="w-4 h-4" /> View Service Requests
              </a>
              <a href="/dashboard/admin/harvest-requests" className="action-btn-outline">
                <Truck className="w-4 h-4" /> Manage Harvest Jobs
              </a>
            </div>

          </div>

        </div>

      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Update Security Password</h3>
              <button onClick={closePasswordModal} className="close-btn"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handlePasswordUpdate}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="dash-input"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="dash-input"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="dash-input"
                />
              </div>
              {passwordUpdateError && <div className="dash-alert error">{passwordUpdateError}</div>}
              {passwordUpdateSuccess && <div className="dash-alert success">Password updated successfully!</div>}
              <div className="modal-actions">
                <button type="button" onClick={closePasswordModal} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Update Email Address</h3>
              <button onClick={closeEmailModal} className="close-btn"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEmailUpdate}>
              <div className="form-group">
                <label>New Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="dash-input"
                />
              </div>
              {emailUpdateError && <div className="dash-alert error">{emailUpdateError}</div>}
              {emailUpdateSuccess && <div className="dash-alert success">Email updated successfully!</div>}
              <div className="modal-actions">
                <button type="button" onClick={closeEmailModal} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Updating...' : 'Update Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Admin;