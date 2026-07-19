import apiClient, { extractData } from './apiClient';

// ==========================================================================
// Disease Registry (admin CRUD)
// ==========================================================================

// List disease registry entries
export async function listDiseaseRegistry() {
  try {
    const response = await apiClient.get('/diseases/registry');
    const extractedData = extractData(response);
    return Array.isArray(extractedData) ? extractedData : (extractedData?.data || []);
  } catch (error) {
    console.error('Error in listDiseaseRegistry:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load disease registry');
  }
}

// Add a disease to the registry (admin)
export async function createDiseaseRegistryEntry(diseaseData) {
  try {
    if (!diseaseData || typeof diseaseData !== 'object') {
      throw new Error('Disease data is required');
    }
    if (!diseaseData.name) {
      throw new Error('Disease name is required');
    }

    const response = await apiClient.post('/diseases/registry', diseaseData);
    return extractData(response);
  } catch (error) {
    console.error('Error in createDiseaseRegistryEntry:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to add disease to registry');
  }
}

// Update a disease registry entry (admin)
export async function updateDiseaseRegistryEntry(diseaseId, diseaseData) {
  try {
    if (!diseaseId) {
      throw new Error('Disease ID is required');
    }
    if (!diseaseData || typeof diseaseData !== 'object') {
      throw new Error('Valid disease data is required');
    }

    const response = await apiClient.put(`/diseases/registry/${diseaseId}`, diseaseData);
    return extractData(response);
  } catch (error) {
    console.error('Error in updateDiseaseRegistryEntry:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update disease registry entry');
  }
}

// Delete a disease registry entry (admin)
export async function deleteDiseaseRegistryEntry(diseaseId) {
  try {
    if (!diseaseId) {
      throw new Error('Disease ID is required');
    }

    const response = await apiClient.delete(`/diseases/registry/${diseaseId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in deleteDiseaseRegistryEntry:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete disease registry entry');
  }
}

// ==========================================================================
// Disease Cases
// ==========================================================================

// List disease cases (optionally filtered by status / farm_id)
export async function listDiseaseCases(options = {}) {
  try {
    const params = {};
    if (options.status) params.status = options.status;
    if (options.farm_id) params.farm_id = options.farm_id;

    const response = await apiClient.get('/diseases/cases', { params });
    const extractedData = extractData(response);
    return Array.isArray(extractedData) ? extractedData : (extractedData?.data || []);
  } catch (error) {
    console.error('Error in listDiseaseCases:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load disease cases');
  }
}

// Get a disease case by ID, including farm and outbreak details
export async function getDiseaseCase(caseId) {
  try {
    if (!caseId) {
      throw new Error('Disease case ID is required');
    }

    const response = await apiClient.get(`/diseases/cases/${caseId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in getDiseaseCase:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to get disease case');
  }
}

// Report a disease case on a farm
export async function reportDiseaseCase(caseData) {
  try {
    if (!caseData || typeof caseData !== 'object') {
      throw new Error('Disease case data is required');
    }
    if (!caseData.farm_id) {
      throw new Error('Farm is required');
    }
    if (!caseData.disease_id) {
      throw new Error('Disease is required');
    }
    if (!caseData.severity) {
      throw new Error('Severity is required');
    }

    const response = await apiClient.post('/diseases/cases', caseData);
    return extractData(response);
  } catch (error) {
    console.error('Error in reportDiseaseCase:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to report disease case');
  }
}

// Update a disease case (e.g. status)
export async function updateDiseaseCase(caseId, caseData) {
  try {
    if (!caseId) {
      throw new Error('Disease case ID is required');
    }
    if (!caseData || typeof caseData !== 'object') {
      throw new Error('Valid disease case data is required');
    }

    const response = await apiClient.put(`/diseases/cases/${caseId}`, caseData);
    return extractData(response);
  } catch (error) {
    console.error('Error in updateDiseaseCase:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update disease case');
  }
}

// ==========================================================================
// Disease Outbreaks
// ==========================================================================

// List disease outbreaks
export async function listDiseaseOutbreaks() {
  try {
    const response = await apiClient.get('/diseases/outbreaks');
    const extractedData = extractData(response);
    return Array.isArray(extractedData) ? extractedData : (extractedData?.data || []);
  } catch (error) {
    console.error('Error in listDiseaseOutbreaks:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load disease outbreaks');
  }
}

// Get a disease outbreak by ID, including all linked disease cases
export async function getDiseaseOutbreak(outbreakId) {
  try {
    if (!outbreakId) {
      throw new Error('Outbreak ID is required');
    }

    const response = await apiClient.get(`/diseases/outbreaks/${outbreakId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in getDiseaseOutbreak:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to get disease outbreak');
  }
}

// Declare a disease outbreak (admin)
export async function declareDiseaseOutbreak(outbreakData) {
  try {
    if (!outbreakData || typeof outbreakData !== 'object') {
      throw new Error('Outbreak data is required');
    }
    if (!outbreakData.disease_id) {
      throw new Error('Disease is required');
    }
    if (!outbreakData.location) {
      throw new Error('Location is required');
    }
    if (!outbreakData.started_at) {
      throw new Error('Start date is required');
    }

    const response = await apiClient.post('/diseases/outbreaks', outbreakData);
    return extractData(response);
  } catch (error) {
    console.error('Error in declareDiseaseOutbreak:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to declare disease outbreak');
  }
}

// Update a disease outbreak (admin/agent). Auto-sets end_date when status is set to resolved.
export async function updateDiseaseOutbreak(outbreakId, outbreakData) {
  try {
    if (!outbreakId) {
      throw new Error('Outbreak ID is required');
    }
    if (!outbreakData || typeof outbreakData !== 'object') {
      throw new Error('Valid outbreak data is required');
    }

    const response = await apiClient.put(`/diseases/outbreaks/${outbreakId}`, outbreakData);
    return extractData(response);
  } catch (error) {
    console.error('Error in updateDiseaseOutbreak:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update disease outbreak');
  }
}

// ==========================================================================
// Statistics
// ==========================================================================

// Disease statistics - case counts by status and severity
export async function getDiseaseStatistics() {
  try {
    const response = await apiClient.get('/diseases/statistics');
    return extractData(response);
  } catch (error) {
    console.error('Error in getDiseaseStatistics:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load disease statistics');
  }
}
