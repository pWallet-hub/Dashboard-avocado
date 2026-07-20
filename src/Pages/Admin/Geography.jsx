import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, ChevronDown, ChevronRight, Plus, Edit, Trash2, X, Globe2 } from 'lucide-react';
import {
  getFullGeography,
  createProvince, updateProvince, deleteProvince,
  createDistrict, updateDistrict,
  createSector,
  createCell,
  createVillage
} from '../../services/geographyService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';

// Full-tree responses may use either lowercase or capitalized keys for child
// collections depending on serialization - check both defensively.
const getChildren = (node, keys) => {
  for (const key of keys) {
    if (node && Array.isArray(node[key])) return node[key];
  }
  return [];
};

const getDistricts = (province) => getChildren(province, ['districts', 'Districts']);
const getSectors = (district) => getChildren(district, ['sectors', 'Sectors']);
const getCells = (sector) => getChildren(sector, ['cells', 'Cells']);
const getVillages = (cell) => getChildren(cell, ['villages', 'Villages']);

const LEVEL_LABELS = {
  province: 'Province',
  district: 'District',
  sector: 'Sector',
  cell: 'Cell',
  village: 'Village'
};

const AdminGeography = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [expandedProvinces, setExpandedProvinces] = useState(new Set());
  const [expandedDistricts, setExpandedDistricts] = useState(new Set());
  const [expandedSectors, setExpandedSectors] = useState(new Set());
  const [expandedCells, setExpandedCells] = useState(new Set());

  // modal: { level, mode: 'add'|'edit', parentId, parentLabel, data: {id,name,code} }
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadGeography = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFullGeography();
      const list = Array.isArray(data) ? data : (Array.isArray(data?.provinces) ? data.provinces : []);
      setProvinces(list);
    } catch (err) {
      console.error('Error loading geography:', err);
      setError(err.message || 'Failed to load geography data');
      setProvinces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGeography();
  }, [loadGeography]);

  const toggle = (set, setSet, id) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSet(next);
  };

  // ---- Modal helpers ----
  const openAdd = (level, parentId, parentLabel) => {
    setModal({ level, mode: 'add', parentId, parentLabel, data: { name: '', code: '' } });
  };

  const openEdit = (level, node, parentId, parentLabel) => {
    setModal({ level, mode: 'edit', parentId, parentLabel, data: { id: node.id, name: node.name || '', code: node.code || '' } });
  };

  const closeModal = () => setModal(null);

  const handleSave = async () => {
    if (!modal) return;
    if (!modal.data.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const { level, mode, parentId, data } = modal;
      if (level === 'province') {
        if (mode === 'add') {
          await createProvince({ name: data.name.trim(), code: data.code?.trim() || undefined });
        } else {
          await updateProvince(data.id, { name: data.name.trim(), code: data.code?.trim() || undefined });
        }
      } else if (level === 'district') {
        if (mode === 'add') {
          await createDistrict({ name: data.name.trim(), province_id: parentId, code: data.code?.trim() || undefined });
        } else {
          await updateDistrict(data.id, { name: data.name.trim(), code: data.code?.trim() || undefined });
        }
      } else if (level === 'sector') {
        await createSector({ name: data.name.trim(), district_id: parentId });
      } else if (level === 'cell') {
        await createCell({ name: data.name.trim(), sector_id: parentId });
      } else if (level === 'village') {
        await createVillage({ name: data.name.trim(), cell_id: parentId });
      }
      toast.success(`${LEVEL_LABELS[level]} ${mode === 'add' ? 'created' : 'updated'} successfully`);
      closeModal();
      await loadGeography();
    } catch (err) {
      console.error(`Error saving ${modal.level}:`, err);
      toast.error(err.message || `Failed to save ${LEVEL_LABELS[modal.level].toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProvince = async (province) => {
    const ok = await confirm(`Delete province "${province.name}"? This is only possible if it has no districts.`, { title: 'Delete Province' });
    if (!ok) return;
    try {
      await deleteProvince(province.id);
      toast.success('Province deleted');
      await loadGeography();
    } catch (err) {
      console.error('Error deleting province:', err);
      toast.error(err.message || 'Failed to delete province. It may still have districts assigned to it.');
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <Globe2 className="h-7 w-7 mr-3 text-green-600" />
              Geography Management
            </h2>
            <p className="text-green-600 mt-1">Manage the administrative location hierarchy: Province → District → Sector → Cell → Village</p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">{error}</div>
            )}
          </div>
          <button
            onClick={() => openAdd('province', null, null)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Province
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 ring-1 ring-green-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-green-600">Loading geography data...</p>
          </div>
        ) : provinces.length === 0 ? (
          <div className="p-8 text-center">
            <MapPin className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-600 text-lg font-medium">No provinces yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {provinces.map((province) => {
              const isProvinceOpen = expandedProvinces.has(province.id);
              const districts = getDistricts(province);
              return (
                <div key={province.id} className="border border-green-100 rounded-lg">
                  <div className="flex items-center justify-between px-3 py-2 hover:bg-green-50 rounded-lg">
                    <button onClick={() => toggle(expandedProvinces, setExpandedProvinces, province.id)} className="flex items-center flex-1 text-left">
                      {isProvinceOpen ? <ChevronDown className="h-4 w-4 mr-2 text-green-600" /> : <ChevronRight className="h-4 w-4 mr-2 text-green-600" />}
                      <span className="font-semibold text-green-900">{province.name}</span>
                      {province.code && <span className="ml-2 text-xs text-green-500">({province.code})</span>}
                      <span className="ml-2 text-xs text-gray-400">{districts.length} district{districts.length !== 1 ? 's' : ''}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openAdd('district', province.id, province.name)} className="p-1.5 text-green-600 hover:bg-green-100 rounded" title="Add District"><Plus className="h-4 w-4" /></button>
                      <button onClick={() => openEdit('province', province, null, null)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded" title="Edit Province"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteProvince(province)} className="p-1.5 text-red-600 hover:bg-red-100 rounded" title="Delete Province"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>

                  {isProvinceOpen && (
                    <div className="pl-8 pr-2 pb-2 space-y-1">
                      {districts.length === 0 && <p className="text-xs text-gray-400 py-1">No districts yet.</p>}
                      {districts.map((district) => {
                        const isDistrictOpen = expandedDistricts.has(district.id);
                        const sectors = getSectors(district);
                        return (
                          <div key={district.id} className="border border-green-50 rounded-lg">
                            <div className="flex items-center justify-between px-3 py-1.5 hover:bg-green-50 rounded-lg">
                              <button onClick={() => toggle(expandedDistricts, setExpandedDistricts, district.id)} className="flex items-center flex-1 text-left">
                                {isDistrictOpen ? <ChevronDown className="h-3.5 w-3.5 mr-2 text-green-600" /> : <ChevronRight className="h-3.5 w-3.5 mr-2 text-green-600" />}
                                <span className="text-sm font-medium text-green-800">{district.name}</span>
                                {district.code && <span className="ml-2 text-xs text-green-500">({district.code})</span>}
                                <span className="ml-2 text-xs text-gray-400">{sectors.length} sector{sectors.length !== 1 ? 's' : ''}</span>
                              </button>
                              <div className="flex items-center gap-2">
                                <button onClick={() => openAdd('sector', district.id, district.name)} className="p-1.5 text-green-600 hover:bg-green-100 rounded" title="Add Sector"><Plus className="h-3.5 w-3.5" /></button>
                                <button onClick={() => openEdit('district', district, province.id, province.name)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded" title="Edit District"><Edit className="h-3.5 w-3.5" /></button>
                              </div>
                            </div>

                            {isDistrictOpen && (
                              <div className="pl-8 pr-2 pb-2 space-y-1">
                                {sectors.length === 0 && <p className="text-xs text-gray-400 py-1">No sectors yet.</p>}
                                {sectors.map((sector) => {
                                  const isSectorOpen = expandedSectors.has(sector.id);
                                  const cells = getCells(sector);
                                  return (
                                    <div key={sector.id} className="border border-green-50 rounded-lg">
                                      <div className="flex items-center justify-between px-3 py-1.5 hover:bg-green-50 rounded-lg">
                                        <button onClick={() => toggle(expandedSectors, setExpandedSectors, sector.id)} className="flex items-center flex-1 text-left">
                                          {isSectorOpen ? <ChevronDown className="h-3.5 w-3.5 mr-2 text-green-600" /> : <ChevronRight className="h-3.5 w-3.5 mr-2 text-green-600" />}
                                          <span className="text-sm text-green-800">{sector.name}</span>
                                          <span className="ml-2 text-xs text-gray-400">{cells.length} cell{cells.length !== 1 ? 's' : ''}</span>
                                        </button>
                                        <button onClick={() => openAdd('cell', sector.id, sector.name)} className="p-1.5 text-green-600 hover:bg-green-100 rounded" title="Add Cell"><Plus className="h-3.5 w-3.5" /></button>
                                      </div>

                                      {isSectorOpen && (
                                        <div className="pl-8 pr-2 pb-2 space-y-1">
                                          {cells.length === 0 && <p className="text-xs text-gray-400 py-1">No cells yet.</p>}
                                          {cells.map((cell) => {
                                            const isCellOpen = expandedCells.has(cell.id);
                                            const villages = getVillages(cell);
                                            return (
                                              <div key={cell.id} className="border border-green-50 rounded-lg">
                                                <div className="flex items-center justify-between px-3 py-1.5 hover:bg-green-50 rounded-lg">
                                                  <button onClick={() => toggle(expandedCells, setExpandedCells, cell.id)} className="flex items-center flex-1 text-left">
                                                    {isCellOpen ? <ChevronDown className="h-3.5 w-3.5 mr-2 text-green-600" /> : <ChevronRight className="h-3.5 w-3.5 mr-2 text-green-600" />}
                                                    <span className="text-sm text-green-800">{cell.name}</span>
                                                    <span className="ml-2 text-xs text-gray-400">{villages.length} village{villages.length !== 1 ? 's' : ''}</span>
                                                  </button>
                                                  <button onClick={() => openAdd('village', cell.id, cell.name)} className="p-1.5 text-green-600 hover:bg-green-100 rounded" title="Add Village"><Plus className="h-3.5 w-3.5" /></button>
                                                </div>

                                                {isCellOpen && (
                                                  <div className="pl-8 pr-2 pb-2">
                                                    {villages.length === 0 ? (
                                                      <p className="text-xs text-gray-400 py-1">No villages yet.</p>
                                                    ) : (
                                                      <ul className="list-disc list-inside space-y-0.5">
                                                        {villages.map((village) => (
                                                          <li key={village.id} className="text-sm text-green-700">{village.name}</li>
                                                        ))}
                                                      </ul>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">
                {modal.mode === 'add' ? `Add ${LEVEL_LABELS[modal.level]}` : `Edit ${LEVEL_LABELS[modal.level]}`}
              </h3>
              <button onClick={closeModal} className="text-green-400 hover:text-green-600" aria-label="Close"><X className="h-6 w-6" /></button>
            </div>
            {modal.parentLabel && (
              <p className="text-sm text-green-600 mb-4">Under: <span className="font-medium">{modal.parentLabel}</span></p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={modal.data.name}
                  onChange={(e) => setModal(prev => ({ ...prev, data: { ...prev.data, name: e.target.value } }))}
                  className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder={`Enter ${LEVEL_LABELS[modal.level].toLowerCase()} name`}
                />
              </div>
              {(modal.level === 'province' || modal.level === 'district') && (
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={modal.data.code}
                    onChange={(e) => setModal(prev => ({ ...prev, data: { ...prev.data, code: e.target.value } }))}
                    className="w-full p-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Optional short code"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button onClick={closeModal} className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all" disabled={saving}>Cancel</button>
              <button onClick={handleSave} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGeography;
