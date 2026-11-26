import apiClient, { extractData } from './apiClient';

// Helper to normalize list-shaped responses (array, or {data: [...]})
const toArray = (extractedData) => {
  if (Array.isArray(extractedData)) return extractedData;
  if (extractedData && Array.isArray(extractedData.data)) return extractedData.data;
  return [];
};

// Full geography tree (Province -> District -> Sector -> Cell -> Village)
export async function getFullGeography() {
  try {
    const response = await apiClient.get('/geography/full');
    return extractData(response);
  } catch (error) {
    console.error('Error in getFullGeography:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load geography data');
  }
}

// ---- Provinces ----

export async function listProvinces() {
  try {
    const response = await apiClient.get('/geography/provinces');
    return toArray(extractData(response));
  } catch (error) {
    console.error('Error in listProvinces:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load provinces');
  }
}

export async function createProvince(provinceData) {
  try {
    if (!provinceData || !provinceData.name) {
      throw new Error('Province name is required');
    }

    const response = await apiClient.post('/geography/provinces', provinceData);
    return extractData(response);
  } catch (error) {
    console.error('Error in createProvince:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create province');
  }
}

export async function updateProvince(provinceId, provinceData) {
  try {
    if (!provinceId) {
      throw new Error('Province ID is required');
    }
    if (!provinceData || typeof provinceData !== 'object') {
      throw new Error('Valid province data is required');
    }

    const response = await apiClient.put(`/geography/provinces/${provinceId}`, provinceData);
    return extractData(response);
  } catch (error) {
    console.error('Error in updateProvince:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update province');
  }
}

// Delete a province - only if it has no districts (admin)
export async function deleteProvince(provinceId) {
  try {
    if (!provinceId) {
      throw new Error('Province ID is required');
    }

    const response = await apiClient.delete(`/geography/provinces/${provinceId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error in deleteProvince:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete province');
  }
}

// ---- Districts ----

export async function listDistricts(provinceId) {
  try {
    if (!provinceId) {
      throw new Error('Province ID is required');
    }

    const response = await apiClient.get(`/geography/provinces/${provinceId}/districts`);
    return toArray(extractData(response));
  } catch (error) {
    console.error('Error in listDistricts:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load districts');
  }
}

export async function createDistrict(districtData) {
  try {
    if (!districtData || !districtData.name) {
      throw new Error('District name is required');
    }
    if (!districtData.province_id) {
      throw new Error('Province is required');
    }

    const response = await apiClient.post('/geography/districts', districtData);
    return extractData(response);
  } catch (error) {
    console.error('Error in createDistrict:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create district');
  }
}

export async function updateDistrict(districtId, districtData) {
  try {
    if (!districtId) {
      throw new Error('District ID is required');
    }
    if (!districtData || typeof districtData !== 'object') {
      throw new Error('Valid district data is required');
    }

    const response = await apiClient.put(`/geography/districts/${districtId}`, districtData);
    return extractData(response);
  } catch (error) {
    console.error('Error in updateDistrict:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update district');
  }
}

// ---- Sectors ----

export async function listSectors(districtId) {
  try {
    if (!districtId) {
      throw new Error('District ID is required');
    }

    const response = await apiClient.get(`/geography/districts/${districtId}/sectors`);
    return toArray(extractData(response));
  } catch (error) {
    console.error('Error in listSectors:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load sectors');
  }
}

export async function createSector(sectorData) {
  try {
    if (!sectorData || !sectorData.name) {
      throw new Error('Sector name is required');
    }
    if (!sectorData.district_id) {
      throw new Error('District is required');
    }

    const response = await apiClient.post('/geography/sectors', sectorData);
    return extractData(response);
  } catch (error) {
    console.error('Error in createSector:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create sector');
  }
}

// ---- Cells ----

export async function listCells(sectorId) {
  try {
    if (!sectorId) {
      throw new Error('Sector ID is required');
    }

    const response = await apiClient.get(`/geography/sectors/${sectorId}/cells`);
    return toArray(extractData(response));
  } catch (error) {
    console.error('Error in listCells:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load cells');
  }
}

export async function createCell(cellData) {
  try {
    if (!cellData || !cellData.name) {
      throw new Error('Cell name is required');
    }
    if (!cellData.sector_id) {
      throw new Error('Sector is required');
    }

    const response = await apiClient.post('/geography/cells', cellData);
    return extractData(response);
  } catch (error) {
    console.error('Error in createCell:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create cell');
  }
}

// ---- Villages ----

export async function listVillages(cellId) {
  try {
    if (!cellId) {
      throw new Error('Cell ID is required');
    }

    const response = await apiClient.get(`/geography/cells/${cellId}/villages`);
    return toArray(extractData(response));
  } catch (error) {
    console.error('Error in listVillages:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load villages');
  }
}

export async function createVillage(villageData) {
  try {
    if (!villageData || !villageData.name) {
      throw new Error('Village name is required');
    }
    if (!villageData.cell_id) {
      throw new Error('Cell is required');
    }

    const response = await apiClient.post('/geography/villages', villageData);
    return extractData(response);
  } catch (error) {
    console.error('Error in createVillage:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create village');
  }
}

// ---- Official divisions, boundaries and per-area statistics ----

/** Fill the division tables with Rwanda's official provinces → villages (admin). */
export async function syncOfficialDivisions() {
  try {
    return extractData(await apiClient.post('/geography/sync', {}, { timeout: 120000 }));
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Could not load the official divisions');
  }
}

const boundaryCache = new Map();
/** GeoJSON boundaries: level = province | district | sector | cell (sector/cell can be limited to a district). */
export async function getBoundaries(level, { district } = {}) {
  const key = `${level}|${district || ''}`;
  if (!boundaryCache.has(key)) {
    boundaryCache.set(key, apiClient.get(`/geography/boundaries/${level}`, { params: district ? { district } : {} }).then(extractData));
  }
  try {
    return await boundaryCache.get(key);
  } catch (error) {
    boundaryCache.delete(key);
    throw new Error(error.response?.data?.message || error.message || 'Failed to load boundaries');
  }
}

/** Farmers, farms, trees, hectares … per district, or per sector of one district. */
export async function getAreaStats({ level = 'district', district } = {}) {
  try {
    return extractData(await apiClient.get('/geography/stats', { params: { level, ...(district ? { district } : {}) } }));
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to load area statistics');
  }
}
