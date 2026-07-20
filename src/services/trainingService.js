import apiClient, { extractData } from './apiClient';

/**
 * Training Service
 * Implements endpoints from API documentation:
 * Base Path: /training
 * - GET    /training              List training content (published only for farmers)
 * - GET    /training/all          List all training content regardless of status (admin)
 * - POST   /training              Create training content (admin)
 * - GET    /training/{id}         Get a training content item (records access for farmers)
 * - PUT    /training/{id}         Update training content (admin)
 * - DELETE /training/{id}         Delete training content (admin)
 * - PUT    /training/{id}/publish Publish a draft training item (admin)
 * - PUT    /training/{id}/archive Archive a training item (admin)
 */

const CONTENT_TYPES = ['article', 'video', 'pdf', 'quiz'];
const STATUSES = ['draft', 'published', 'archived'];

// List training content (published only for farmers, all statuses visible to admin per backend rules)
export async function listTraining(options = {}) {
  try {
    const params = {};
    if (options.content_type) params.content_type = options.content_type;
    if (options.status) params.status = options.status;

    const response = await apiClient.get('/training', { params });
    const extractedData = extractData(response);

    if (extractedData && Array.isArray(extractedData.data)) {
      return extractedData.data;
    } else if (Array.isArray(extractedData)) {
      return extractedData;
    }
    return [];
  } catch (error) {
    console.error('Error in listTraining:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load training content');
  }
}

// List all training content regardless of status (admin)
export async function listAllTraining(options = {}) {
  try {
    const params = {};
    if (options.content_type) params.content_type = options.content_type;
    if (options.status) params.status = options.status;

    const response = await apiClient.get('/training/all', { params });
    const extractedData = extractData(response);

    if (extractedData && Array.isArray(extractedData.data)) {
      return extractedData.data;
    } else if (Array.isArray(extractedData)) {
      return extractedData;
    }
    return [];
  } catch (error) {
    console.error('Error in listAllTraining:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load training content');
  }
}

// Get a single training content item by id
export async function getTraining(trainingId) {
  if (!trainingId) {
    throw new Error('Training content ID is required');
  }

  try {
    const response = await apiClient.get(`/training/${trainingId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in getTraining:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to get training content');
  }
}

// Create training content (admin)
export async function createTraining(trainingData) {
  if (!trainingData || typeof trainingData !== 'object') {
    throw new Error('Training content data is required');
  }
  if (!trainingData.title || !trainingData.title.trim()) {
    throw new Error('Title is required');
  }
  if (!trainingData.content_type) {
    throw new Error('Content type is required');
  }
  if (!CONTENT_TYPES.includes(trainingData.content_type)) {
    throw new Error(`Invalid content type. Must be one of: ${CONTENT_TYPES.join(', ')}`);
  }

  try {
    const response = await apiClient.post('/training', trainingData);
    return extractData(response);
  } catch (error) {
    console.error('Error in createTraining:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create training content');
  }
}

// Update training content (admin)
export async function updateTraining(trainingId, trainingData) {
  if (!trainingId) {
    throw new Error('Training content ID is required');
  }
  if (!trainingData || typeof trainingData !== 'object') {
    throw new Error('Valid training content data is required');
  }
  if (trainingData.content_type && !CONTENT_TYPES.includes(trainingData.content_type)) {
    throw new Error(`Invalid content type. Must be one of: ${CONTENT_TYPES.join(', ')}`);
  }
  if (trainingData.status && !STATUSES.includes(trainingData.status)) {
    throw new Error(`Invalid status. Must be one of: ${STATUSES.join(', ')}`);
  }

  try {
    const response = await apiClient.put(`/training/${trainingId}`, trainingData);
    return extractData(response);
  } catch (error) {
    console.error('Error in updateTraining:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update training content');
  }
}

// Delete training content (admin)
export async function deleteTraining(trainingId) {
  if (!trainingId) {
    throw new Error('Training content ID is required');
  }

  try {
    const response = await apiClient.delete(`/training/${trainingId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in deleteTraining:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete training content');
  }
}

// Publish a draft training item (admin)
export async function publishTraining(trainingId) {
  if (!trainingId) {
    throw new Error('Training content ID is required');
  }

  try {
    const response = await apiClient.put(`/training/${trainingId}/publish`);
    return extractData(response);
  } catch (error) {
    console.error('Error in publishTraining:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to publish training content');
  }
}

// Archive a training item (admin)
export async function archiveTraining(trainingId) {
  if (!trainingId) {
    throw new Error('Training content ID is required');
  }

  try {
    const response = await apiClient.put(`/training/${trainingId}/archive`);
    return extractData(response);
  } catch (error) {
    console.error('Error in archiveTraining:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to archive training content');
  }
}

export default {
  listTraining,
  listAllTraining,
  getTraining,
  createTraining,
  updateTraining,
  deleteTraining,
  publishTraining,
  archiveTraining,
};
