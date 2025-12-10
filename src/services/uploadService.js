import apiClient from './apiClient';

/**
 * Upload Service
 * Implements endpoints from API documentation:
 * Base Path: /upload
 * - POST /upload           Upload single file (multipart form with `file`)
 * - POST /upload/multiple  Upload multiple files (multipart with `files[]`)
 */

export async function uploadSingle(file) {
  if (!file) throw new Error('File is required');
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data; // keep full structure { success, data: { url, ... } }
}

export async function uploadMultiple(files) {
  if (!files || files.length === 0) throw new Error('At least one file is required');
  const formData = new FormData();
  for (const f of files) formData.append('files[]', f);

  const response = await apiClient.post('/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export default { uploadSingle, uploadMultiple };
