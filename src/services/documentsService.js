import apiClient, { extractData } from './apiClient';

/**
 * Documents Service
 * Implements endpoints from API documentation:
 * Base Path: /documents
 * - GET    /documents                      List documents owned by current user (admin may pass owner_id)
 * - GET    /documents/{id}                 Get a document's metadata
 * - GET    /documents/{id}/download         Download a document's file (streamed, private storage)
 * - POST   /documents/{id}/notarize         Upload a physically notarized copy for admin review (agent/admin)
 * - PUT    /documents/{id}/notarize-review  Approve or reject a document pending notarization review (admin only)
 * - POST   /documents/{id}/signature        Attach a captured signature image to a document
 */

// List documents owned by the current user (admin may pass owner_id to view another user's documents)
export async function listDocuments(options = {}) {
  try {
    const params = {};
    if (options.type) params.type = options.type;
    if (options.owner_id) params.owner_id = options.owner_id;

    const response = await apiClient.get('/documents', { params });
    const extractedData = extractData(response);

    if (extractedData && Array.isArray(extractedData.data)) {
      return extractedData.data;
    } else if (Array.isArray(extractedData)) {
      return extractedData;
    }
    return [];
  } catch (error) {
    console.error('Error in listDocuments:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load documents');
  }
}

// Paginated variant: returns { data, pagination }. Admins pass owner_id to see
// another user's documents (without it the API returns the caller's own).
export async function listDocumentsPage(options = {}) {
  const params = {};
  ['type', 'owner_id', 'page', 'limit'].forEach((k) => {
    if (options[k]) params[k] = options[k];
  });
  try {
    const response = await apiClient.get('/documents', { params });
    return {
      data: Array.isArray(response.data?.data) ? response.data.data : [],
      pagination: response.data?.meta?.pagination || {},
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to load documents');
  }
}

// Fetch a private document's file as a Blob (authenticated), for in-app viewing.
export async function fetchDocumentBlob(documentId) {
  if (!documentId) {
    throw new Error('Document ID is required');
  }
  try {
    const response = await apiClient.get(`/documents/${documentId}/download`, { responseType: 'blob' });
    const type = response.headers?.['content-type'] || response.data?.type || 'application/octet-stream';
    return new Blob([response.data], { type });
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to load document file');
  }
}

// Get a document's metadata
export async function getDocument(documentId) {
  if (!documentId) {
    throw new Error('Document ID is required');
  }

  try {
    const response = await apiClient.get(`/documents/${documentId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in getDocument:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to get document');
  }
}

// Download a document's file and trigger a browser download
export async function downloadDocument(documentId, filename) {
  if (!documentId) {
    throw new Error('Document ID is required');
  }

  try {
    const response = await apiClient.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = filename || `document-${documentId}`;
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error in downloadDocument:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to download document');
  }
}

// Upload a physically notarized copy of a document for admin review (agent/admin)
export async function uploadNotarizedCopy(documentId, file) {
  if (!documentId) {
    throw new Error('Document ID is required');
  }
  if (!file) {
    throw new Error('File is required');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post(`/documents/${documentId}/notarize`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractData(response);
  } catch (error) {
    console.error('Error in uploadNotarizedCopy:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to upload notarized copy');
  }
}

// Approve or reject a document pending notarization review (admin only)
export async function reviewNotarization(documentId, { approved, rejectionReason } = {}) {
  if (!documentId) {
    throw new Error('Document ID is required');
  }
  if (typeof approved !== 'boolean') {
    throw new Error('Approved (true/false) is required');
  }
  if (!approved && !rejectionReason) {
    throw new Error('Rejection reason is required when rejecting a document');
  }

  const payload = { approved };
  if (!approved) {
    payload.rejection_reason = rejectionReason;
  }

  try {
    const response = await apiClient.put(`/documents/${documentId}/notarize-review`, payload);
    return extractData(response);
  } catch (error) {
    console.error('Error in reviewNotarization:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to review notarization');
  }
}

// Attach a captured signature image to a document
export async function attachSignature(documentId, file) {
  if (!documentId) {
    throw new Error('Document ID is required');
  }
  if (!file) {
    throw new Error('Signature image is required');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post(`/documents/${documentId}/signature`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return extractData(response);
  } catch (error) {
    console.error('Error in attachSignature:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to attach signature');
  }
}

export default {
  listDocuments,
  getDocument,
  downloadDocument,
  uploadNotarizedCopy,
  reviewNotarization,
  attachSignature,
};
