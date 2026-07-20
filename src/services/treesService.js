import apiClient, { extractData } from './apiClient';

// Get a tree summary for a farm - latest tree record, untreated disease count, and all reported disease names
export async function getFarmTreeSummary(farmId) {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }

    const response = await apiClient.get(`/trees/farm/${farmId}/summary`);
    return extractData(response);
  } catch (error) {
    console.error('Error in getFarmTreeSummary:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load tree summary');
  }
}

// List all tree records for a farm
export async function listFarmTrees(farmId) {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }

    const response = await apiClient.get(`/trees/farm/${farmId}`);
    const extractedData = extractData(response);

    if (Array.isArray(extractedData)) {
      return extractedData;
    } else if (extractedData && Array.isArray(extractedData.data)) {
      return extractedData.data;
    }
    return [];
  } catch (error) {
    console.error('Error in listFarmTrees:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load tree records');
  }
}

// Add a tree record to a farm
export async function addTreeRecord(farmId, treeData) {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }
    if (!treeData || typeof treeData !== 'object') {
      throw new Error('Tree data is required');
    }
    if (!treeData.tree_number) {
      throw new Error('Tree number is required');
    }

    const response = await apiClient.post(`/trees/farm/${farmId}`, treeData);
    return extractData(response);
  } catch (error) {
    console.error('Error in addTreeRecord:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to add tree record');
  }
}

// List tree-level disease records for a farm
export async function listFarmTreeDiseases(farmId) {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }

    const response = await apiClient.get(`/trees/farm/${farmId}/diseases`);
    const extractedData = extractData(response);

    if (Array.isArray(extractedData)) {
      return extractedData;
    } else if (extractedData && Array.isArray(extractedData.data)) {
      return extractedData.data;
    }
    return [];
  } catch (error) {
    console.error('Error in listFarmTreeDiseases:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load tree disease records');
  }
}

// Report a tree-level disease
export async function reportTreeDisease(farmId, diseaseData) {
  try {
    if (!farmId) {
      throw new Error('Farm ID is required');
    }
    if (!diseaseData || typeof diseaseData !== 'object') {
      throw new Error('Disease data is required');
    }
    if (!diseaseData.tree_id) {
      throw new Error('Tree is required');
    }
    if (!diseaseData.disease_name) {
      throw new Error('Disease name is required');
    }
    if (!diseaseData.severity) {
      throw new Error('Severity is required');
    }

    const response = await apiClient.post(`/trees/farm/${farmId}/diseases`, diseaseData);
    return extractData(response);
  } catch (error) {
    console.error('Error in reportTreeDisease:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to report tree disease');
  }
}

// Update a tree disease record (mark treated/resolved)
export async function updateTreeDisease(diseaseId, diseaseData) {
  try {
    if (!diseaseId) {
      throw new Error('Disease record ID is required');
    }
    if (!diseaseData || typeof diseaseData !== 'object') {
      throw new Error('Valid disease data is required');
    }

    const response = await apiClient.put(`/trees/diseases/${diseaseId}`, diseaseData);
    return extractData(response);
  } catch (error) {
    console.error('Error in updateTreeDisease:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update tree disease record');
  }
}
