import apiClient, { extractData } from './apiClient';

// Get all service requests (using property evaluation endpoint as per requirement)
export async function listServiceRequests(options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.farmer_id) params.farmer_id = options.farmer_id;
    if (options.agent_id) params.agent_id = options.agent_id;
    if (options.service_type) params.service_type = options.service_type;
    if (options.status) params.status = options.status;
    if (options.priority) params.priority = options.priority;
    if (options.province) params.province = options.province;
    if (options.city) params.city = options.city;
    if (options.date_from) params.date_from = options.date_from;
    if (options.date_to) params.date_to = options.date_to;
    if (options.search) params.search = options.search;
    
    // Use /service-requests/property-evaluation as per user instruction
    const response = await apiClient.get('/service-requests/property-evaluation', { params });
    return extractData(response);
  } catch (error) {
    console.error('API Error in listServiceRequests:', error.response?.status, error.message);
    
    // If it's a 404, return empty array as fallback
    if (error.response?.status === 404) {
      console.warn('Property evaluation requests endpoint not found. Using fallback data.');
      return [];
    }
    
    throw error;
  }
}

// Get service request by ID
export async function getServiceRequest(requestId) {
  if (!requestId) {
    throw new Error("Service request ID is required");
  }
  
  const response = await apiClient.get(`/service-requests/${requestId}`);
  return extractData(response);
}

// Create new service request
export async function createServiceRequest(requestData) {
  // Validate required fields
  if (!requestData || typeof requestData !== 'object') {
    throw new Error("Service request data is required");
  }
  
  if (!requestData.service_type) {
    throw new Error("Service type is required");
  }
  
  if (!requestData.title) {
    throw new Error("Title is required");
  }
  
  if (!requestData.description) {
    throw new Error("Description is required");
  }
  
  if (!requestData.location) {
    throw new Error("Location is required");
  }
  
  // Validate location required fields
  if (!requestData.location.street_address) {
    throw new Error("Location street address is required");
  }
  
  if (!requestData.location.city) {
    throw new Error("Location city is required");
  }
  
  if (!requestData.location.province) {
    throw new Error("Location province is required");
  }
  
  const response = await apiClient.post('/service-requests', requestData);
  return extractData(response);
}

// Update service request
export async function updateServiceRequest(requestId, requestData) {
  if (!requestId) {
    throw new Error("Service request ID is required");
  }
  
  if (!requestData || typeof requestData !== 'object') {
    throw new Error("Valid service request data is required");
  }
  
  const response = await apiClient.put(`/service-requests/${requestId}`, requestData);
  return extractData(response);
}

// Delete service request
export async function deleteServiceRequest(requestId) {
  if (!requestId) {
    throw new Error("Service request ID is required");
  }
  
  const response = await apiClient.delete(`/service-requests/${requestId}`);
  return extractData(response);
}

// Assign agent to service request
export async function assignAgentToServiceRequest(requestId, agentData) {
  if (!requestId) {
    throw new Error("Service request ID is required");
  }
  
  if (!agentData || typeof agentData !== 'object') {
    throw new Error("Agent data is required");
  }
  
  if (!agentData.agent_id) {
    throw new Error("Agent ID is required");
  }
  
  const response = await apiClient.put(`/service-requests/${requestId}/assign`, agentData);
  return extractData(response);
}

// Update service request status
export async function updateServiceRequestStatus(requestId, statusData) {
  if (!requestId) {
    throw new Error("Service request ID is required");
  }
  
  if (!statusData || typeof statusData !== 'object') {
    throw new Error("Status data is required");
  }
  
  if (!statusData.status) {
    throw new Error("Status is required");
  }
  
  const response = await apiClient.put(`/service-requests/${requestId}/status`, statusData);
  return extractData(response);
}

// Submit feedback for completed service request
export async function submitServiceRequestFeedback(requestId, feedbackData) {
  if (!requestId) {
    throw new Error("Service request ID is required");
  }
  
  if (!feedbackData || typeof feedbackData !== 'object') {
    throw new Error("Feedback data is required");
  }
  
  if (feedbackData.rating === undefined || feedbackData.rating === null) {
    throw new Error("Rating is required");
  }
  
  if (feedbackData.farmer_satisfaction === undefined || feedbackData.farmer_satisfaction === null) {
    throw new Error("Farmer satisfaction rating is required");
  }
  
  if (feedbackData.agent_professionalism === undefined || feedbackData.agent_professionalism === null) {
    throw new Error("Agent professionalism rating is required");
  }
  
  if (feedbackData.service_quality === undefined || feedbackData.service_quality === null) {
    throw new Error("Service quality rating is required");
  }
  
  if (feedbackData.would_recommend === undefined) {
    throw new Error("Would recommend field is required");
  }
  
  const response = await apiClient.post(`/service-requests/${requestId}/feedback`, feedbackData);
  return extractData(response);
}

// Get service requests for a specific farmer
export async function getServiceRequestsForFarmer(farmerId, options = {}) {
  if (!farmerId) {
    throw new Error("Farmer ID is required");
  }
  
  const params = {};
  if (options.page) params.page = options.page;
  if (options.limit) params.limit = options.limit;
  if (options.status) params.status = options.status;
  if (options.service_type) params.service_type = options.service_type;
  
  const response = await apiClient.get(`/service-requests/farmer/${farmerId}`, { params });
  return extractData(response);
}

// Get service requests assigned to a specific agent
export async function getServiceRequestsForAgent(agentId, options = {}) {
  if (!agentId) {
    throw new Error("Agent ID is required");
  }
  
  const params = {};
  if (options.page) params.page = options.page;
  if (options.limit) params.limit = options.limit;
  if (options.status) params.status = options.status;
  if (options.service_type) params.service_type = options.service_type;
  
  const response = await apiClient.get(`/service-requests/agent/${agentId}`, { params });
  return extractData(response);
}

// =============================================================================
// HARVEST REQUEST FUNCTIONS
// =============================================================================

// Create harvest request
export async function createHarvestRequest(harvestData) {
  // Validate required fields
  if (!harvestData || typeof harvestData !== 'object') {
    throw new Error("Harvest request data is required");
  }
  
  if (!harvestData.workersNeeded) {
    throw new Error("Workers needed is required");
  }
  
  if (!harvestData.treesToHarvest) {
    throw new Error("Number of trees to harvest is required");
  }
  
  if (!harvestData.harvestDateFrom || !harvestData.harvestDateTo) {
    throw new Error("Harvest date range is required");
  }
  
  if (!harvestData.location) {
    throw new Error("Location is required");
  }
  
  const response = await apiClient.post('/service-requests/harvest', harvestData);
  return extractData(response);
}

// Get all harvest requests
export async function listHarvestRequests(options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.status) params.status = options.status;
    if (options.priority) params.priority = options.priority;
    if (options.harvest_date_from) params.harvest_date_from = options.harvest_date_from;
    if (options.harvest_date_to) params.harvest_date_to = options.harvest_date_to;
    
    const response = await apiClient.get('/service-requests/harvest', { params });
    return extractData(response);
  } catch (error) {
    console.error('API Error in listHarvestRequests:', error.response?.status, error.message);
    
    if (error.response?.status === 404) {
      console.warn('Harvest requests endpoint not found. Using fallback data.');
      return { data: [] };
    }
    
    throw error;
  }
}

// Approve harvest request (Admin only)
export async function approveHarvestRequest(requestId, approvalData) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }
  
  const response = await apiClient.put(`/service-requests/${requestId}/approve`, approvalData);
  return extractData(response);
}

// Reject harvest request (Admin only)
export async function rejectHarvestRequest(requestId, rejectionData) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }
  
  if (!rejectionData.rejection_reason) {
    throw new Error("Rejection reason is required");
  }
  
  const response = await apiClient.put(`/service-requests/${requestId}/reject`, rejectionData);
  return extractData(response);
}

// Start harvest request (Agent only)
export async function startHarvestRequest(requestId, startData) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }
  
  const response = await apiClient.put(`/service-requests/${requestId}/start`, startData);
  return extractData(response);
}

// Complete harvest request (Admin/Agent)
export async function completeHarvestRequest(requestId, completionData) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }
  
  const response = await apiClient.put(`/service-requests/${requestId}/complete`, completionData);
  return extractData(response);
}

// =============================================================================
// PROPERTY EVALUATION REQUEST FUNCTIONS
// =============================================================================

/**
 * Create a new property evaluation request (Farmers only)
 */
export async function createPropertyEvaluationRequest(requestData) {
  if (!requestData || typeof requestData !== 'object') {
    throw new Error("Valid property evaluation data is required");
  }

  // Validate required fields
  if (!requestData.irrigationSource) {
    throw new Error("Irrigation source is required");
  }

  if (requestData.irrigationSource === 'Yes' && !requestData.irrigationTiming) {
    throw new Error("Irrigation timing is required when irrigation source is Yes");
  }

  if (!requestData.visitStartDate || !requestData.visitEndDate) {
    throw new Error("Visit start date and end date are required");
  }

  // Validate date range
  const startDate = new Date(requestData.visitStartDate);
  const endDate = new Date(requestData.visitEndDate);
  const currentDate = new Date();

  if (startDate < currentDate) {
    throw new Error("Visit start date cannot be in the past");
  }

  if (endDate < startDate) {
    throw new Error("Visit end date cannot be before start date");
  }

  // Calculate date difference in days
  const timeDifference = endDate.getTime() - startDate.getTime();
  const dayDifference = timeDifference / (1000 * 3600 * 24);
  if (dayDifference !== 4) { // Inclusive range: 5 days total (start date + 4 days = end date)
    throw new Error("Visit date range must be exactly 5 days");
  }

  // Validate location if provided
  if (requestData.location) {
    if (!requestData.location.street_address || !requestData.location.city || !requestData.location.province) {
      throw new Error("Complete location details (street address, city, province) are required");
    }
  }

  // Transform frontend data to match API expectations
  const apiData = {
    irrigationSource: requestData.irrigationSource,
    irrigationTiming: requestData.irrigationTiming,
    soilTesting: requestData.soilTesting || '',
    visitStartDate: requestData.visitStartDate,
    visitEndDate: requestData.visitEndDate,
    evaluationPurpose: requestData.evaluationPurpose || 'Property evaluation',
    priority: requestData.priority || 'medium',
    notes: requestData.notes,
    location: requestData.location,
    certified_valuation_requested: requestData.certifiedValuationRequested || false,
    property_details: {
      farm_size: requestData.farmSize,
      crop_types: requestData.cropTypes,
      current_irrigation_system: requestData.currentIrrigationSystem,
      soil_type: requestData.soilType,
      water_access: requestData.waterAccess
    }
  };

  const response = await apiClient.post('/service-requests/property-evaluation', apiData);
  return extractData(response);
}

/**
 * Get all property evaluation requests with role-based filtering
 */
export async function getPropertyEvaluationRequests(options = {}) {
  try {
    const params = {};
    if (options.page) params.page = options.page;
    if (options.limit) params.limit = options.limit;
    if (options.status) params.status = options.status;
    if (options.priority) params.priority = options.priority;
    if (options.farmer_id) params.farmer_id = options.farmer_id;
    if (options.agent_id) params.agent_id = options.agent_id;
    if (options.visit_date_from) params.visit_date_from = options.visit_date_from;
    if (options.visit_date_to) params.visit_date_to = options.visit_date_to;
    if (options.irrigation_source) params.irrigation_source = options.irrigation_source;
    if (options.soil_testing) params.soil_testing = options.soil_testing;
    if (options.evaluation_purpose) params.evaluation_purpose = options.evaluation_purpose;

    const response = await apiClient.get('/service-requests/property-evaluation', { params });
    return extractData(response);
  } catch (error) {
    console.error('API Error in getPropertyEvaluationRequests:', error.response?.status, error.message);
    
    if (error.response?.status === 404) {
      console.warn('Property evaluation requests endpoint not found. Using fallback data.');
      return [];
    }
    
    throw error;
  }
}

/**
 * Get property evaluation request by ID
 */
export async function getPropertyEvaluationRequestById(requestId) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }

  const response = await apiClient.get(`/service-requests/${requestId}`);
  return extractData(response);
}

/**
 * Update property evaluation request (Farmers only, before approval)
 */
export async function updatePropertyEvaluationRequest(requestId, requestData) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }

  if (!requestData || typeof requestData !== 'object') {
    throw new Error("Valid property evaluation data is required");
  }

  // Validate date range if provided
  if (requestData.visitStartDate && requestData.visitEndDate) {
    const startDate = new Date(requestData.visitStartDate);
    const endDate = new Date(requestData.visitEndDate);
    const currentDate = new Date();

    if (startDate < currentDate) {
      throw new Error("Visit start date cannot be in the past");
    }

    if (endDate < startDate) {
      throw new Error("Visit end date cannot be before start date");
    }

    const timeDifference = endDate.getTime() - startDate.getTime();
    const dayDifference = timeDifference / (1000 * 3600 * 24);
    if (dayDifference !== 4) {
      throw new Error("Visit date range must be exactly 5 days");
    }
  }

  // Validate irrigation timing if irrigation source is 'Yes'
  if (requestData.irrigationSource === 'Yes' && !requestData.irrigationTiming) {
    throw new Error("Irrigation timing is required when irrigation source is Yes");
  }

  // Transform frontend data to match API expectations
  const apiData = {
    irrigationSource: requestData.irrigationSource,
    irrigationTiming: requestData.irrigationTiming,
    soilTesting: requestData.soilTesting,
    visitStartDate: requestData.visitStartDate,
    visitEndDate: requestData.visitEndDate,
    evaluationPurpose: requestData.evaluationPurpose,
    priority: requestData.priority,
    notes: requestData.notes,
    location: requestData.location,
    certified_valuation_requested: requestData.certifiedValuationRequested,
    property_details: {
      farm_size: requestData.farmSize,
      crop_types: requestData.cropTypes,
      current_irrigation_system: requestData.currentIrrigationSystem,
      soil_type: requestData.soilType,
      water_access: requestData.waterAccess
    }
  };

  const response = await apiClient.put(`/service-requests/property-evaluation/${requestId}`, apiData);
  return extractData(response);
}

/**
 * Approve a property evaluation request (Admin only)
 */
export async function approvePropertyEvaluationRequest(requestId, approvalData = {}) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }

  const apiData = {
    agent_id: approvalData.agent_id,
    scheduled_date: approvalData.scheduled_date,
    cost_estimate: approvalData.cost_estimate,
    notes: approvalData.notes,
    evaluation_type: approvalData.evaluation_type,
    specialist_required: approvalData.specialist_required || false
  };

  const response = await apiClient.put(`/service-requests/${requestId}/approve-property-evaluation`, apiData);
  return extractData(response);
}

/**
 * Reject a property evaluation request (Admin only)
 */
export async function rejectPropertyEvaluationRequest(requestId, rejectionData) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }
  
  if (!rejectionData || !rejectionData.rejection_reason) {
    throw new Error("Rejection reason is required");
  }

  const apiData = {
    rejection_reason: rejectionData.rejection_reason,
    notes: rejectionData.notes
  };

  const response = await apiClient.put(`/service-requests/${requestId}/reject`, apiData);
  return extractData(response);
}

/**
 * Assign agent to property evaluation request (Admin only)
 */
export async function assignAgentToPropertyEvaluation(requestId, agentData) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }
  
  if (!agentData || !agentData.agent_id) {
    throw new Error("Agent ID is required");
  }

  const apiData = {
    agent_id: agentData.agent_id,
    assignment_notes: agentData.notes,
    expected_completion_date: agentData.expected_completion_date
  };

  const response = await apiClient.put(`/service-requests/${requestId}/assign`, apiData);
  return extractData(response);
}

/**
 * Start property evaluation (Agent only)
 */
export async function startPropertyEvaluation(requestId, startData = {}) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }

  const apiData = {
    start_notes: startData.notes,
    actual_start_date: startData.actual_start_date || new Date().toISOString()
  };

  const response = await apiClient.put(`/service-requests/${requestId}/start`, apiData);
  return extractData(response);
}

/**
 * Complete property evaluation with report (Agent only)
 */
export async function completePropertyEvaluation(requestId, completionData) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }
  
  if (!completionData || typeof completionData !== 'object') {
    throw new Error("Completion data is required");
  }

  const apiData = {
    completion_notes: completionData.notes,
    follow_up_required: completionData.followUpRequired || false,
    follow_up_date: completionData.followUpDate,
    attachments: completionData.attachments || [],
    evaluation_report: {
      soil_quality_rating: completionData.soilQualityRating,
      irrigation_assessment: completionData.irrigationAssessment,
      recommendations: completionData.recommendations,
      estimated_yield_potential: completionData.estimatedYieldPotential,
      required_improvements: completionData.requiredImprovements,
      cost_estimates: completionData.costEstimates,
      soil_test_results: completionData.soilTestResults,
      water_quality_analysis: completionData.waterQualityAnalysis,
      crop_suitability: completionData.cropSuitability,
      risk_factors: completionData.riskFactors
    }
  };

  const response = await apiClient.put(`/service-requests/${requestId}/complete`, apiData);
  return extractData(response);
}

/**
 * Submit evaluation report feedback (Farmer only)
 */
export async function submitEvaluationFeedback(requestId, feedbackData) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }
  
  if (!feedbackData || typeof feedbackData !== 'object') {
    throw new Error("Feedback data is required");
  }
  
  if (feedbackData.overall_rating === undefined || feedbackData.overall_rating === null) {
    throw new Error("Overall rating is required");
  }

  const apiData = {
    rating: feedbackData.overall_rating,
    comment: feedbackData.additional_comments,
    farmer_satisfaction: feedbackData.report_clarity,
    agent_professionalism: feedbackData.agent_professionalism,
    service_quality: feedbackData.recommendations_usefulness,
    would_recommend: feedbackData.would_recommend,
    submitted_at: new Date().toISOString()
  };

  const response = await apiClient.post(`/service-requests/${requestId}/feedback`, apiData);
  return extractData(response);
}

/**
 * Get property evaluation statistics (Admin only)
 */
export async function getPropertyEvaluationStats(options = {}) {
  try {
    const params = {};
    if (options.date_from) params.date_from = options.date_from;
    if (options.date_to) params.date_to = options.date_to;
    if (options.agent_id) params.agent_id = options.agent_id;
    if (options.province) params.province = options.province;
    
    const response = await apiClient.get('/service-requests/property-evaluation/stats', { params });
    return extractData(response);
  } catch (error) {
    console.error('API Error in getPropertyEvaluationStats:', error.response?.status, error.message);
    
    if (error.response?.status === 404) {
      console.warn('Property evaluation stats endpoint not found. Using fallback data.');
      return { stats: {} };
    }
    
    throw error;
  }
}

/**
 * Schedule property evaluation visit (Agent only)
 */
export async function scheduleEvaluationVisit(requestId, scheduleData) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }
  
  if (!scheduleData || !scheduleData.visit_date || !scheduleData.visit_time) {
    throw new Error("Visit date and time are required");
  }

  const apiData = {
    visit_date: scheduleData.visit_date,
    visit_time: scheduleData.visit_time,
    estimated_duration: scheduleData.estimated_duration,
    preparation_notes: scheduleData.preparation_notes,
    farmer_instructions: scheduleData.farmer_instructions
  };

  const response = await apiClient.put(`/service-requests/${requestId}/schedule-visit`, apiData);
  return extractData(response);
}

/**
 * Reschedule property evaluation visit
 */
export async function rescheduleEvaluationVisit(requestId, rescheduleData) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }
  
  if (!rescheduleData || !rescheduleData.new_visit_date || !rescheduleData.reason) {
    throw new Error("New visit date and reason are required");
  }

  const apiData = {
    new_visit_date: rescheduleData.new_visit_date,
    new_visit_time: rescheduleData.new_visit_time,
    reason: rescheduleData.reason,
    rescheduled_by: rescheduleData.rescheduled_by,
    farmer_notified: rescheduleData.farmer_notified || false
  };

  const response = await apiClient.put(`/service-requests/${requestId}/reschedule-visit`, apiData);
  return extractData(response);
}

/**
 * Cancel property evaluation request
 */
export async function cancelPropertyEvaluationRequest(requestId, cancellationData) {
  if (!requestId) {
    throw new Error("Request ID is required");
  }
  
  if (!cancellationData || !cancellationData.cancellation_reason) {
    throw new Error("Cancellation reason is required");
  }

  const apiData = {
    cancellation_reason: cancellationData.cancellation_reason,
    cancelled_by: cancellationData.cancelled_by,
    refund_applicable: cancellationData.refund_applicable || false
  };

  const response = await apiClient.put(`/service-requests/${requestId}/cancel`, apiData);
  return extractData(response);
}

// Helper function to get all service requests from different endpoints
export async function getAllServiceRequests(options = {}) {
  const results = {
    regular: [],
    harvest: [],
    propertyEvaluation: [],
    errors: []
  };

  // Try to get property evaluation requests (replacing regular service requests)
  try {
    results.regular = await listServiceRequests(options);
  } catch (error) {
    console.error('Failed to fetch property evaluation requests:', error.message);
    results.errors.push({ type: 'regular', error: error.message });
  }

  // Try to get harvest requests
  try {
    const harvestResponse = await listHarvestRequests(options);
    results.harvest = harvestResponse?.data || harvestResponse || [];
  } catch (error) {
    console.error('Failed to fetch harvest requests:', error.message);
    results.errors.push({ type: 'harvest', error: error.message });
  }

  // Try to get property evaluation requests (for consistency)
  try {
    results.propertyEvaluation = await getPropertyEvaluationRequests(options);
  } catch (error) {
    console.error('Failed to fetch property evaluation requests:', error.message);
    results.errors.push({ type: 'propertyEvaluation', error: error.message });
  }

  // Combine all requests with proper formatting
  const allRequests = [
    ...(results.regular || []).map(req => ({
      ...req,
      service_type: 'property_evaluation',
      type: 'Property Evaluation',
      farmerName: req.farmer_id?.full_name || req.farmerName,
      farmerPhone: req.farmer_id?.phone || req.farmerPhone,
      farmerEmail: req.farmer_id?.email || req.farmerEmail,
      farmerLocation: req.location ? 
        `${req.location.street_address || ''}, ${req.location.city || ''}, ${req.location.province || ''}`.replace(/^,\s*|,\s*$/g, '') 
        : req.farmerLocation || 'N/A',
      submittedAt: req.created_at || req.submittedAt,
      visitStartDate: req.visitStartDate || req.visit_start_date,
      visitEndDate: req.visitEndDate || req.visit_end_date,
      irrigationSource: req.irrigationSource || req.irrigation_source,
      irrigationTiming: req.irrigationTiming || req.irrigation_timing,
      soilTesting: req.soilTesting || req.soil_testing,
      evaluationPurpose: req.evaluationPurpose || req.evaluation_purpose,
      priority: req.priority || 'medium',
      notes: req.notes || ''
    })),
    ...(results.harvest || []).map(req => ({
      ...req,
      service_type: 'harvest',
      type: 'Harvesting Day',
      farmerName: req.farmer_id?.full_name || req.farmerName,
      farmerPhone: req.farmer_id?.phone || req.farmerPhone,
      farmerEmail: req.farmer_id?.email || req.farmerEmail,
      farmerLocation: req.location ? 
        `${req.location.village || ''}, ${req.location.cell || ''}, ${req.location.sector || ''}, ${req.location.district || ''}, ${req.location.province || ''}`.replace(/^,\s*|,\s*$/g, '') 
        : req.farmerLocation || 'N/A',
      submittedAt: req.created_at || req.submittedAt,
      workersNeeded: req.workersNeeded || req.harvest_details?.workers_needed,
      equipmentNeeded: req.equipmentNeeded || req.harvest_details?.equipment_needed,
      treesToHarvest: req.treesToHarvest || req.harvest_details?.trees_to_harvest,
      harvestDateFrom: req.harvestDateFrom || req.harvest_details?.harvest_date_from,
      harvestDateTo: req.harvestDateTo || req.harvest_details?.harvest_date_to,
      hassBreakdown: req.hassBreakdown || req.harvest_details?.hass_breakdown,
      harvestImages: req.harvestImages || req.harvest_details?.harvest_images,
      priority: req.priority || 'medium',
      notes: req.notes || ''
    })),
    ...(results.propertyEvaluation || []).map(req => ({
      ...req,
      service_type: 'property_evaluation',
      type: 'Property Evaluation',
      farmerName: req.farmer_id?.full_name || req.farmerName,
      farmerPhone: req.farmer_id?.phone || req.farmerPhone,
      farmerEmail: req.farmer_id?.email || req.farmerEmail,
      farmerLocation: req.location ? 
        `${req.location.street_address || ''}, ${req.location.city || ''}, ${req.location.province || ''}`.replace(/^,\s*|,\s*$/g, '') 
        : req.farmerLocation || 'N/A',
      submittedAt: req.created_at || req.submittedAt,
      visitStartDate: req.visitStartDate || req.visit_start_date,
      visitEndDate: req.visitEndDate || req.visit_end_date,
      irrigationSource: req.irrigationSource || req.irrigation_source,
      irrigationTiming: req.irrigationTiming || req.irrigation_timing,
      soilTesting: req.soilTesting || req.soil_testing,
      evaluationPurpose: req.evaluationPurpose || req.evaluation_purpose,
      priority: req.priority || 'medium',
      notes: req.notes || ''
    }))
  ];

  return {
    data: allRequests,
    errors: results.errors,
    totalRequests: allRequests.length,
    summary: {
      regular: results.regular?.length || 0,
      harvest: results.harvest?.length || 0,
      propertyEvaluation: results.propertyEvaluation?.length || 0
    }
  };
}