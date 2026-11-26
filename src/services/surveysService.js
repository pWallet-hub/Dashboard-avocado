import apiClient, { extractData } from './apiClient';

const errorMessage = (error, fallback) => error.response?.data?.message || error.message || fallback;
const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));

/** Upload the survey spreadsheet and get a validated preview (nothing is imported yet). */
export async function previewSurveyImport(file) {
  if (!file) throw new Error('Choose an Excel or CSV file first');
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) throw new Error('Only .xlsx, .xls or .csv files are supported');
  const form = new FormData();
  form.append('file', file);
  try {
    const response = await apiClient.post('/surveys/import/preview', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000,
    });
    return extractData(response);
  } catch (error) {
    throw new Error(errorMessage(error, 'Could not read the spreadsheet'));
  }
}

export async function getImportBatch(batchId, { filter = 'all', page = 1, limit = 50 } = {}) {
  try {
    const response = await apiClient.get(`/surveys/import/batches/${batchId}`, { params: { filter, page, limit } });
    return extractData(response);
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load import batch'));
  }
}

export async function listImportBatches() {
  try {
    const response = await apiClient.get('/surveys/import/batches');
    const data = extractData(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load previous imports'));
  }
}

/** Cheap progress check while a large import runs in the background. */
export async function getImportStatus(batchId) {
  try {
    return extractData(await apiClient.get(`/surveys/import/batches/${batchId}/status`));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load import progress'));
  }
}

/**
 * Start the import. Small files finish right away ({ ...result });
 * large ones answer 202 with { status: 'committing' } — poll getImportStatus.
 */
export async function commitSurveyImport(batchId, options = {}) {
  try {
    const response = await apiClient.post(`/surveys/import/batches/${batchId}/commit`, options, { timeout: 120000 });
    if (response.status === 202) return { background: true, ...extractData(response) };
    return extractData(response);
  } catch (error) {
    throw new Error(errorMessage(error, 'Import failed'));
  }
}

export async function listSurveys(filters = {}) {
  try {
    const response = await apiClient.get('/surveys', { params: cleanParams(filters) });
    const body = response.data || {};
    return { data: Array.isArray(body.data) ? body.data : [], pagination: body.meta?.pagination || { page: 1, totalPages: 1, total: 0 } };
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load surveys'));
  }
}

export async function getSurvey(id) {
  try {
    return extractData(await apiClient.get(`/surveys/${id}`));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load survey'));
  }
}

export async function getSurveyAnalytics(filters = {}) {
  try {
    return extractData(await apiClient.get('/surveys/analytics', { params: cleanParams(filters) }));
  } catch (error) {
    throw new Error(errorMessage(error, 'Failed to load survey analytics'));
  }
}

/** Download a binary endpoint with the auth header and save it as a file. */
async function download(path, params, fallbackName) {
  const response = await apiClient.get(path, { params: cleanParams(params), responseType: 'blob', timeout: 180000 });
  const disposition = response.headers?.['content-disposition'] || '';
  const name = disposition.match(/filename="?([^"]+)"?/)?.[1] || fallbackName;
  const url = URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportSurveys(filters = {}) {
  try {
    await download('/surveys/export', filters, 'farmer-surveys.xlsx');
  } catch (error) {
    throw new Error(errorMessage(error, 'Export failed'));
  }
}

export async function downloadSurveyTemplate() {
  try {
    await download('/surveys/template', {}, 'farmer-survey-template.xlsx');
  } catch (error) {
    throw new Error(errorMessage(error, 'Could not download the template'));
  }
}
