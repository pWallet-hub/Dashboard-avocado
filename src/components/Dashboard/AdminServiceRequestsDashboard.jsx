import React, { useState, useEffect } from 'react';
import { 
  listServiceRequests, 
  listHarvestRequests,
  listPestManagementRequests,
  approveHarvestRequest,
  rejectHarvestRequest,
  approvePropertyEvaluationRequest,
  rejectPropertyEvaluationRequest,
  approvePestManagementRequest,
  rejectPestManagementRequest,
  startHarvestRequest,
  completeHarvestRequest,
  startPropertyEvaluation,
  completePropertyEvaluation,
  startPestManagementTreatment,
  completePestManagementTreatment
} from '../../services/serviceRequestsService';
import './AdminServiceRequestsDashboard.css';

const AdminServiceRequestsDashboard = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [harvestRequests, setHarvestRequests] = useState([]);
  const [pestManagementRequests, setPestManagementRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoading, setActionLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [propertyResponse, harvestResponse, pestResponse] = await Promise.allSettled([
        listServiceRequests(),
        listHarvestRequests(),
        listPestManagementRequests()
      ]);

      if (propertyResponse.status === 'fulfilled') {
        const propData = propertyResponse.value;
        const requests = Array.isArray(propData) ? propData : propData?.data || [];
        setServiceRequests(requests);
      } else {
        setServiceRequests([]);
      }

      if (harvestResponse.status === 'fulfilled') {
        const harvestData = harvestResponse.value;
        let requests = [];
        
        if (harvestData?.success && Array.isArray(harvestData.data)) {
          requests = harvestData.data;
        } else if (Array.isArray(harvestData?.data)) {
          requests = harvestData.data;
        } else if (Array.isArray(harvestData)) {
          requests = harvestData;
        }
        
        setHarvestRequests(requests);
      } else {
        setHarvestRequests([]);
      }

      if (pestResponse.status === 'fulfilled') {
        const pestData = pestResponse.value;
        let requests = [];
        
        if (pestData?.success && Array.isArray(pestData.data)) {
          requests = pestData.data;
        } else if (Array.isArray(pestData?.data)) {
          requests = pestData.data;
        } else if (Array.isArray(pestData)) {
          requests = pestData;
        }
        
        setPestManagementRequests(requests);
      } else {
        setPestManagementRequests([]);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setRequestLoading = (requestId, isLoading) => {
    setActionLoading(prev => ({
      ...prev,
      [requestId]: isLoading
    }));
  };

  const handleApproveRequest = async (request, type) => {
    const requestId = request.id || request._id;
    setRequestLoading(requestId, true);
    
    try {
      if (type === 'harvest') {
        await approveHarvestRequest(requestId, { 
          approved_by: 'admin',
          approval_notes: 'Approved by administrator'
        });
      } else if (type === 'pest') {
        await approvePestManagementRequest(requestId, { 
          approved_by: 'admin',
          approval_notes: 'Approved by administrator'
        });
      } else {
        await approvePropertyEvaluationRequest(requestId, { 
          approved_by: 'admin',
          approval_notes: 'Approved by administrator'
        });
      }
      await fetchAllRequests();
      setShowModal(false);
    } catch (err) {
      alert(`Failed to approve request: ${err.message}`);
    } finally {
      setRequestLoading(requestId, false);
    }
  };

  const handleRejectRequest = async (request, type) => {
    const requestId = request.id || request._id;
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setRequestLoading(requestId, true);
    
    try {
      if (type === 'harvest') {
        await rejectHarvestRequest(requestId, { rejection_reason: reason });
      } else if (type === 'pest') {
        await rejectPestManagementRequest(requestId, { rejection_reason: reason });
      } else {
        await rejectPropertyEvaluationRequest(requestId, { rejection_reason: reason });
      }
      await fetchAllRequests();
      setShowModal(false);
    } catch (err) {
      alert(`Failed to reject request: ${err.message}`);
    } finally {
      setRequestLoading(requestId, false);
    }
  };

  const handleStartRequest = async (request, type) => {
    const requestId = request.id || request._id;
    setRequestLoading(requestId, true);
    
    try {
      if (type === 'harvest') {
        await startHarvestRequest(requestId, { 
          started_by: 'admin',
          start_notes: 'Started by administrator'
        });
      } else if (type === 'pest') {
        await startPestManagementTreatment(requestId, { 
          started_by: 'admin',
          start_notes: 'Treatment started by administrator'
        });
      } else {
        await startPropertyEvaluation(requestId, { 
          started_by: 'admin',
          start_notes: 'Started by administrator'
        });
      }
      await fetchAllRequests();
      setShowModal(false);
    } catch (err) {
      alert(`Failed to start request: ${err.message}`);
    } finally {
      setRequestLoading(requestId, false);
    }
  };

  const handleCompleteRequest = async (request, type) => {
    const requestId = request.id || request._id;
    setRequestLoading(requestId, true);
    
    try {
      if (type === 'harvest') {
        await completeHarvestRequest(requestId, { 
          completed_by: 'admin',
          completion_notes: 'Completed by administrator'
        });
      } else if (type === 'pest') {
        await completePestManagementTreatment(requestId, { 
          completed_by: 'admin',
          completion_notes: 'Treatment completed by administrator',
          treatment_effectiveness: 'effective'
        });
      } else {
        await completePropertyEvaluation(requestId, { 
          completed_by: 'admin',
          completion_notes: 'Completed by administrator'
        });
      }
      await fetchAllRequests();
      setShowModal(false);
    } catch (err) {
      alert(`Failed to complete request: ${err.message}`);
    } finally {
      setRequestLoading(requestId, false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLocation = (location) => {
    if (!location) return 'N/A';
    if (typeof location === 'string') return location;
    
    const parts = [
      location.village,
      location.cell,
      location.sector,
      location.district,
      location.province
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`status-badge status-${status || 'pending'}`}>
        {(status || 'pending').charAt(0).toUpperCase() + (status || 'pending').slice(1).replace('_', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    return (
      <span className={`priority-badge priority-${priority || 'medium'}`}>
        {(priority || 'medium').charAt(0).toUpperCase() + (priority || 'medium').slice(1)}
      </span>
    );
  };

  const renderActionButtons = (request, type) => {
    const requestId = request.id || request._id;
    const isLoading = actionLoading[requestId];
    const status = request.status || 'pending';

    return (
      <div className="action-buttons">
        {status === 'pending' && (
          <>
            <button
              onClick={() => handleApproveRequest(request, type)}
              disabled={isLoading}
              className="btn btn-approve"
            >
              {isLoading ? '⏳' : '✓ Approve'}
            </button>
            <button
              onClick={() => handleRejectRequest(request, type)}
              disabled={isLoading}
              className="btn btn-reject"
            >
              {isLoading ? '⏳' : '✗ Reject'}
            </button>
          </>
        )}
        {status === 'approved' && (
          <button
            onClick={() => handleStartRequest(request, type)}
            disabled={isLoading}
            className="btn btn-start"
          >
            {isLoading ? '⏳' : '▶ Start'}
          </button>
        )}
        {status === 'in_progress' && (
          <button
            onClick={() => handleCompleteRequest(request, type)}
            disabled={isLoading}
            className="btn btn-complete"
          >
            {isLoading ? '⏳' : '✓ Complete'}
          </button>
        )}
        {['completed', 'rejected', 'cancelled'].includes(status) && (
          <span className="no-action">No actions</span>
        )}
      </div>
    );
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const allRequests = [
    ...serviceRequests.map(req => ({ ...req, type: 'property' })),
    ...harvestRequests.map(req => ({ ...req, type: 'harvest' })),
    ...pestManagementRequests.map(req => ({ ...req, type: 'pest' }))
  ];

  let filteredRequests = allRequests.filter(request => {
    if (activeTab === 'harvest' && request.type !== 'harvest') return false;
    if (activeTab === 'property' && request.type !== 'property') return false;
    if (activeTab === 'pest' && request.type !== 'pest') return false;
    
    if (statusFilter && request.status !== statusFilter) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const farmerName = (request.farmer_id?.full_name || '').toLowerCase();
      const requestNumber = (request.request_number || request.id || '').toString().toLowerCase();
      const location = formatLocation(request.location).toLowerCase();
      const pestType = (request.pest_type || '').toLowerCase();
      
      return farmerName.includes(searchLower) || 
             requestNumber.includes(searchLower) || 
             location.includes(searchLower) ||
             pestType.includes(searchLower);
    }
    
    return true;
  });

  // Apply sorting
  if (sortConfig.key) {
    filteredRequests.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'farmer') {
        aVal = a.farmer_id?.full_name || '';
        bVal = b.farmer_id?.full_name || '';
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading service requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={fetchAllRequests} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-contents">
          <div className="header-text">
            <h1>Service Requests Management</h1>
            <p>Manage harvest requests, property evaluations, and pest management</p>
          </div>
          <div className="header-actions">
            <button
              onClick={fetchAllRequests}
              disabled={loading}
              className="btn btn-refresh"
            >
              <span className="refresh-icon">🔄</span>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-cards stat-total">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Total Requests</h3>
              <p className="stat-number">{allRequests.length}</p>
            </div>
            {/* <div className="stat-icon"></div> */}
          </div>
          <div className="stat-footer">
            <span className="stat-trend positive">↑ All time</span>
          </div>
        </div>
        
        <div className="stat-cards stat-property">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Property Evaluations</h3>
              <p className="stat-number">{serviceRequests.length}</p>
            </div>
            {/* <div className="stat-icon">🏡</div> */}
          </div>
          <div className="stat-footer">
            <span className="stat-label">Active evaluations</span>
          </div>
        </div>
        
        <div className="stat-cards stat-harvest">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Harvest Requests</h3>
              <p className="stat-number">{harvestRequests.length}</p>
            </div>
            {/* <div className="stat-icon">🌾</div> */}
          </div>
          <div className="stat-footer">
            <span className="stat-label">Pending harvests</span>
          </div>
        </div>
        
        <div className="stat-cards stat-pest">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Pest Management</h3>
              <p className="stat-number">{pestManagementRequests.length}</p>
            </div>
            {/* <div className="stat-icon">🐛</div> */}
          </div>
          <div className="stat-footer">
            <span className="stat-label">Active treatments</span>
          </div>
        </div>
        
        <div className="stat-cards stat-pending">
          <div className="stat-content">
            <div className="stat-info">
              <h3>Pending</h3>
              <p className="stat-number">
                {allRequests.filter(req => req.status === 'pending').length}
              </p>
            </div>
            {/* <div className="stat-icon">⏳</div> */}
          </div>
          <div className="stat-footer">
            <span className="stat-trend warning">Needs attention</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-panel">
        {/* Tabs */}
        <div className="tabs-container">
          <nav className="tabs">
            {[
              { key: 'all', label: 'All Requests', count: allRequests.length, icon: '' },
              { key: 'property', label: 'Property Evaluations', count: serviceRequests.length, icon: '' },
              { key: 'harvest', label: 'Harvest Requests', count: harvestRequests.length, icon: '' },
              { key: 'pest', label: 'Pest Management', count: pestManagementRequests.length, icon: '' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`tab ${activeTab === tab.key ? 'active' : ''}`}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
                <span className="tab-count">{tab.count}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filter */}
        <div className="filters-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by farmer name, location, or pest type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search" 
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                ☰
              </button>
              <button
                className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Card View"
              >
                ▦
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('type')} className="sortable">
                  <div className="th-content">
                    Type
                    {sortConfig.key === 'type' && (
                      <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('farmer')} className="sortable">
                  <div className="th-content">
                    Farmer
                    {sortConfig.key === 'farmer' && (
                      <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th>Location</th>
                <th>Details</th>
                <th onClick={() => handleSort('status')} className="sortable">
                  <div className="th-content">
                    Status
                    {sortConfig.key === 'status' && (
                      <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('priority')} className="sortable">
                  <div className="th-content">
                    Priority
                    {sortConfig.key === 'priority' && (
                      <span className="sort-indicator">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th>Date Range</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <div className="empty-content">
                      <div className="empty-icon">📭</div>
                      <h3>No requests found</h3>
                      <p>
                        {searchTerm || statusFilter 
                          ? 'Try adjusting your search or filter criteria' 
                          : `No ${activeTab === 'all' ? '' : activeTab} requests are available at the moment.`
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request, index) => (
                  <tr 
                    key={request.id || request._id || index} 
                    className="table-row"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowModal(true);
                    }}
                  >
                    <td>
                      <span className={`type-badge type-${request.type}`}>
                        {request.type === 'harvest' ? 'Harvest' : 
                         request.type === 'pest' ? 'Pest Control' : 
                         'Property'}
                      </span>
                    </td>
                    <td>
                      <div className="farmer-info">
                        <div className="farmer-name">{request.farmer_id?.full_name || 'Unknown'}</div>
                        <div className="farmer-contact">{request.farmer_id?.phone || 'No contact'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="location-text">{formatLocation(request.location)}</div>
                    </td>
                    <td>
                      <div className="details-cell">
                        {request.type === 'harvest' && (
                          <>
                            <div>Trees: {request.harvest_details?.trees_to_harvest || 'N/A'}</div>
                            <div>Workers: {request.harvest_details?.workers_needed || 'N/A'}</div>
                          </>
                        )}
                        {request.type === 'pest' && (
                          <>
                            <div>Pest: {request.pest_type || 'N/A'}</div>
                            <div>Severity: {request.severity_level || 'N/A'}</div>
                          </>
                        )}
                        {request.type === 'property' && (
                          <>
                            <div>Purpose: {request.evaluation_purpose || 'N/A'}</div>
                            <div>Size: {request.farmSize || 'N/A'}</div>
                          </>
                        )}
                      </div>
                    </td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>{getPriorityBadge(request.priority)}</td>
                    <td>
                      <div className="date-range">
                        {request.type === 'harvest' ? (
                          <>
                            <div>{formatDate(request.harvest_details?.harvest_date_from)}</div>
                            <div className="date-separator">→</div>
                            <div>{formatDate(request.harvest_details?.harvest_date_to)}</div>
                          </>
                        ) : request.type === 'pest' ? (
                          <>
                            <div>Requested: {formatDate(request.created_at)}</div>
                            <div>Preferred: {formatDate(request.preferred_treatment_date)}</div>
                          </>
                        ) : (
                          <>
                            <div>{formatDate(request.visitStartDate)}</div>
                            <div className="date-separator">→</div>
                            <div>{formatDate(request.visitEndDate)}</div>
                          </>
                        )}
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {renderActionButtons(request, request.type)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredRequests.length === 0 ? (
            <div className="empty-state-cards">
              <div className="empty-icon">📭</div>
              <h3>No requests found</h3>
              <p>
                {searchTerm || statusFilter 
                  ? 'Try adjusting your search or filter criteria' 
                  : `No ${activeTab === 'all' ? '' : activeTab} requests are available.`
                }
              </p>
            </div>
          ) : (
            filteredRequests.map((request, index) => (
              <div 
                key={request.id || request._id || index} 
                className="request-card"
                onClick={() => {
                  setSelectedRequest(request);
                  setShowModal(true);
                }}
              >
                <div className="card-header">
                  <span className={`type-badge type-${request.type}`}>
                    {request.type === 'harvest' ? 'Harvest' : 
                     request.type === 'pest' ? 'Pest Control' : 
                     'Property'}
                  </span>
                  {getPriorityBadge(request.priority)}
                </div>
                
                <div className="card-body">
                  <div className="card-farmer">
                    <div className="farmer-avatar">
                      {(request.farmer_id?.full_name || 'U')[0].toUpperCase()}
                    </div>
                    <div className="farmer-details">
                      <h3>{request.farmer_id?.full_name || 'Unknown Farmer'}</h3>
                      <p>{request.farmer_id?.phone || 'No contact'}</p>
                    </div>
                  </div>
                  
                  <div className="card-location">
                    📍 {formatLocation(request.location)}
                  </div>
                  
                  <div className="card-details">
                    {request.type === 'harvest' && (
                      <>
                        <div className="detail-item">
                          <span className="detail-label">Trees:</span>
                          <span className="detail-value">{request.harvest_details?.trees_to_harvest || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Workers:</span>
                          <span className="detail-value">{request.harvest_details?.workers_needed || 'N/A'}</span>
                        </div>
                      </>
                    )}
                    {request.type === 'pest' && (
                      <>
                        <div className="detail-item">
                          <span className="detail-label">Pest Type:</span>
                          <span className="detail-value">{request.pest_type || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Severity:</span>
                          <span className="detail-value">{request.severity_level || 'N/A'}</span>
                        </div>
                      </>
                    )}
                    {request.type === 'property' && (
                      <>
                        <div className="detail-item">
                          <span className="detail-label">Purpose:</span>
                          <span className="detail-value">{request.evaluation_purpose || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Farm Size:</span>
                          <span className="detail-value">{request.farmSize || 'N/A'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="card-footer">
                  <div className="card-status">
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    {renderActionButtons(request, request.type)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Results Summary */}
      {filteredRequests.length > 0 && (
        <div className="results-summary">
          Showing <strong>{filteredRequests.length}</strong> of <strong>{allRequests.length}</strong> total requests
          {searchTerm && ` matching "${searchTerm}"`}
          {statusFilter && ` with status "${statusFilter}"`}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-headers">
              <h2>Request Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-section">
                <h3>Request Information</h3>
                <div className="modal-grid">
                  <div className="modal-field">
                    <label>Type</label>
                    <span className={`type-badge type-${selectedRequest.type}`}>
                      {selectedRequest.type === 'harvest' ? 'Harvest' : 
                       selectedRequest.type === 'pest' ? 'Pest Control' : 
                       'Property Evaluation'}
                    </span>
                  </div>
                  <div className="modal-field">
                    <label>Status</label>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <div className="modal-field">
                    <label>Priority</label>
                    {getPriorityBadge(selectedRequest.priority)}
                  </div>
                  <div className="modal-field">
                    <label>Request ID</label>
                    <span>{selectedRequest.id || selectedRequest._id || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Farmer Information</h3>
                <div className="modal-grid">
                  <div className="modal-field">
                    <label>Name</label>
                    <span>{selectedRequest.farmer_id?.full_name || 'Unknown'}</span>
                  </div>
                  <div className="modal-field">
                    <label>Phone</label>
                    <span>{selectedRequest.farmer_id?.phone || 'N/A'}</span>
                  </div>
                  <div className="modal-field">
                    <label>Email</label>
                    <span>{selectedRequest.farmer_id?.email || 'N/A'}</span>
                  </div>
                  <div className="modal-field">
                    <label>Location</label>
                    <span>{formatLocation(selectedRequest.location)}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Request Details</h3>
                {selectedRequest.type === 'harvest' && (
                  <div className="modal-grid">
                    <div className="modal-field">
                      <label>Trees to Harvest</label>
                      <span>{selectedRequest.harvest_details?.trees_to_harvest || 'N/A'}</span>
                    </div>
                    <div className="modal-field">
                      <label>Workers Needed</label>
                      <span>{selectedRequest.harvest_details?.workers_needed || 'N/A'}</span>
                    </div>
                    <div className="modal-field">
                      <label>Equipment Needed</label>
                      <span>{selectedRequest.harvest_details?.equipment_needed || 'N/A'}</span>
                    </div>
                    <div className="modal-field">
                      <label>Start Date</label>
                      <span>{formatDate(selectedRequest.harvest_details?.harvest_date_from)}</span>
                    </div>
                    <div className="modal-field">
                      <label>End Date</label>
                      <span>{formatDate(selectedRequest.harvest_details?.harvest_date_to)}</span>
                    </div>
                  </div>
                )}
                
                {selectedRequest.type === 'pest' && (
                  <div className="modal-grid">
                    <div className="modal-field">
                      <label>Pest Type</label>
                      <span>{selectedRequest.pest_type || 'N/A'}</span>
                    </div>
                    <div className="modal-field">
                      <label>Affected Area</label>
                      <span>{selectedRequest.affected_area || 'N/A'}</span>
                    </div>
                    <div className="modal-field">
                      <label>Severity Level</label>
                      <span>{selectedRequest.severity_level || 'N/A'}</span>
                    </div>
                    <div className="modal-field">
                      <label>Treatment Method</label>
                      <span>{selectedRequest.treatment_method || selectedRequest.preferred_treatment || 'N/A'}</span>
                    </div>
                    <div className="modal-field">
                      <label>Preferred Date</label>
                      <span>{formatDate(selectedRequest.preferred_treatment_date)}</span>
                    </div>
                    <div className="modal-field">
                      <label>Description</label>
                      <span>{selectedRequest.description || 'N/A'}</span>
                    </div>
                  </div>
                )}
                
                {selectedRequest.type === 'property' && (
                  <div className="modal-grid">
                    <div className="modal-field">
                      <label>Evaluation Purpose</label>
                      <span>{selectedRequest.evaluation_purpose || selectedRequest.evaluationPurpose || 'N/A'}</span>
                    </div>
                    <div className="modal-field">
                      <label>Farm Size</label>
                      <span>{selectedRequest.farmSize || 'N/A'}</span>
                    </div>
                    <div className="modal-field">
                      <label>Irrigation Source</label>
                      <span>{selectedRequest.irrigationSource || 'N/A'}</span>
                    </div>
                    <div className="modal-field">
                      <label>Visit Start Date</label>
                      <span>{formatDate(selectedRequest.visitStartDate)}</span>
                    </div>
                    <div className="modal-field">
                      <label>Visit End Date</label>
                      <span>{formatDate(selectedRequest.visitEndDate)}</span>
                    </div>
                  </div>
                )}
              </div>

              {(selectedRequest.notes || selectedRequest.special_instructions) && (
                <div className="modal-section">
                  <h3>Additional Notes</h3>
                  <p className="modal-notes">
                    {selectedRequest.notes || selectedRequest.special_instructions}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {renderActionButtons(selectedRequest, selectedRequest.type)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServiceRequestsDashboard;