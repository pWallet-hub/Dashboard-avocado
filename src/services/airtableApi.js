import axios from 'axios';

// Airtable REST API client configured from Vite env vars
// Docs: https://airtable.com/developers/web/api/introduction
const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;

if (!baseId) {
  // eslint-disable-next-line no-console
  console.warn('VITE_AIRTABLE_BASE_ID is not set');
}
if (!apiKey) {
  // eslint-disable-next-line no-console
  console.warn('VITE_AIRTABLE_API_KEY is not set');
}

const airtableAxios = axios.create({
  baseURL: `https://api.airtable.com/v0/${baseId}/`,
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
});

// Simple response interceptor to unwrap data
airtableAxios.interceptors.response.use(
  (res) => res,
  (error) => {
    // Optionally map common Airtable errors
    return Promise.reject(error);
  }
);

export default airtableAxios;
