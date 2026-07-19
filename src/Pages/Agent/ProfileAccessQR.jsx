import React, { useEffect, useMemo, useState } from 'react';
import { QrCode, RefreshCw, Ban, Users, Clock, UploadCloud, Leaf } from 'lucide-react';
import { listFarmers } from '../../services/usersService';
import {
  getUserQRCode,
  regenerateQRToken,
  expireQRToken,
  getActivityLog,
  bulkImportUsers,
} from '../../services/profileAccessService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';

// Best-effort extraction of a displayable QR image source from an unknown response shape
const extractQrImageSrc = (qrData) => {
  if (!qrData) return null;
  if (typeof qrData === 'string') {
    return qrData.startsWith('http') || qrData.startsWith('data:')
      ? qrData
      : `data:image/png;base64,${qrData}`;
  }
  const candidate =
    qrData.qr_code_url || qrData.qr_image_url || qrData.image_url ||
    qrData.qr_code || qrData.qr_image || qrData.image || qrData.data_url || qrData.url;
  if (!candidate) return null;
  return candidate.startsWith('http') || candidate.startsWith('data:')
    ? candidate
    : `data:image/png;base64,${candidate}`;
};

const ProfileAccessQR = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';

  const [farmers, setFarmers] = useState([]);
  const [farmersLoading, setFarmersLoading] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState('');

  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [activityLog, setActivityLog] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const [bulkFile, setBulkFile] = useState(null);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  useEffect(() => {
    loadFarmers();
  }, []);

  useEffect(() => {
    if (selectedFarmerId) {
      loadQrCode(selectedFarmerId);
      loadActivityLog(selectedFarmerId);
    } else {
      setQrData(null);
      setActivityLog([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFarmerId]);

  const loadFarmers = async () => {
    setFarmersLoading(true);
    try {
      const response = await listFarmers({ limit: 200 });
      const farmersList = response?.data || [];
      setFarmers(Array.isArray(farmersList) ? farmersList : []);
    } catch (err) {
      console.error('Error loading farmers:', err);
      setFarmers([]);
    } finally {
      setFarmersLoading(false);
    }
  };

  const loadQrCode = async (farmerId) => {
    setQrLoading(true);
    try {
      const data = await getUserQRCode(farmerId);
      setQrData(data);
    } catch (err) {
      console.error('Error loading QR code:', err);
      setQrData(null);
      toast.error('Error loading QR code: ' + err.message);
    } finally {
      setQrLoading(false);
    }
  };

  const loadActivityLog = async (farmerId) => {
    setActivityLoading(true);
    try {
      const data = await getActivityLog(farmerId);
      setActivityLog(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading activity log:', err);
      setActivityLog([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedFarmerId) return;
    const confirmed = await confirm(
      'Regenerate this farmer\'s QR code? The previous QR code will no longer work.',
      { title: 'Regenerate QR Code', confirmLabel: 'Regenerate', danger: false }
    );
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await regenerateQRToken(selectedFarmerId);
      toast.success('QR code regenerated successfully');
      await loadQrCode(selectedFarmerId);
    } catch (err) {
      console.error('Error regenerating QR code:', err);
      toast.error('Error regenerating QR code: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExpire = async () => {
    if (!selectedFarmerId) return;
    const confirmed = await confirm(
      'Immediately expire this farmer\'s QR code? They will not be able to use it until a new one is generated.',
      { title: 'Expire QR Code', confirmLabel: 'Expire', danger: true }
    );
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await expireQRToken(selectedFarmerId);
      toast.success('QR code expired successfully');
      await loadQrCode(selectedFarmerId);
    } catch (err) {
      console.error('Error expiring QR code:', err);
      toast.error('Error expiring QR code: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkFile) {
      toast.error('Please select an Excel file to import');
      return;
    }
    setBulkSubmitting(true);
    setBulkResult(null);
    try {
      const result = await bulkImportUsers(bulkFile);
      setBulkResult(result);
      toast.success('Bulk import completed successfully');
      setBulkFile(null);
      await loadFarmers();
    } catch (err) {
      console.error('Error bulk importing users:', err);
      toast.error('Error importing users: ' + err.message);
    } finally {
      setBulkSubmitting(false);
    }
  };

  const activityColumns = useMemo(() => {
    if (!activityLog.length) return [];
    const keys = new Set();
    activityLog.forEach((entry) => Object.keys(entry || {}).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, [activityLog]);

  const qrImageSrc = extractQrImageSrc(qrData);
  const selectedFarmer = farmers.find((f) => f.id === selectedFarmerId);

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <h2 className="text-2xl font-bold text-green-800 flex items-center">
          <QrCode className="h-7 w-7 mr-3 text-green-600" />
          Farmer Profile Access QR
        </h2>
        <p className="text-green-600 mt-1">
          Generate and manage QR codes farmers can use to update their profile without logging in
        </p>
      </div>

      {/* Farmer Picker */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <label className="block text-sm font-medium text-green-700 mb-2 flex items-center">
          <Users className="h-4 w-4 mr-2" /> Select Farmer
        </label>
        <select
          value={selectedFarmerId}
          onChange={(e) => setSelectedFarmerId(e.target.value)}
          className="w-full sm:w-96 p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
          disabled={farmersLoading}
        >
          <option value="">{farmersLoading ? 'Loading farmers...' : 'Select a farmer'}</option>
          {farmers.map((farmer) => (
            <option key={farmer.id} value={farmer.id}>
              {farmer.full_name || farmer.name || farmer.email} {farmer.phone ? `(${farmer.phone})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* QR Code Panel */}
      {selectedFarmerId && (
        <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            QR Code {selectedFarmer ? `— ${selectedFarmer.full_name || selectedFarmer.name}` : ''}
          </h3>
          {qrLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-green-600">Loading QR code...</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-48 h-48 border border-green-200 rounded-lg flex items-center justify-center bg-green-50 overflow-hidden">
                {qrImageSrc ? (
                  <img src={qrImageSrc} alt="Farmer QR code" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-green-500 text-sm p-4">
                    <QrCode className="h-10 w-10 mx-auto mb-2 text-green-300" />
                    No QR code available
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRegenerate}
                  disabled={actionLoading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${actionLoading ? 'animate-spin' : ''}`} />
                  Regenerate QR Code
                </button>
                <button
                  onClick={handleExpire}
                  disabled={actionLoading}
                  className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all disabled:opacity-50"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Expire QR Code
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity Log */}
      {selectedFarmerId && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-green-100">
          <div className="p-6 border-b border-green-100">
            <h3 className="text-lg font-semibold text-green-800 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-green-600" />
              Scan Activity Log
            </h3>
          </div>
          {activityLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-green-600">Loading activity log...</p>
            </div>
          ) : activityLog.length === 0 ? (
            <div className="p-8 text-center">
              <Leaf className="h-10 w-10 text-green-400 mx-auto mb-3" />
              <p className="text-green-600 text-sm">No scan activity recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-green-100">
                <thead className="bg-green-50">
                  <tr>
                    {activityColumns.map((col) => (
                      <th key={col} className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-green-100">
                  {activityLog.map((entry, idx) => (
                    <tr key={entry.id || idx} className="hover:bg-green-50 transition-colors">
                      {activityColumns.map((col) => (
                        <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                          {typeof entry[col] === 'object' && entry[col] !== null
                            ? JSON.stringify(entry[col])
                            : String(entry[col] ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Admin-only Bulk Import */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
            <UploadCloud className="h-5 w-5 mr-2 text-green-600" />
            Bulk Import Users (Excel)
          </h3>
          <p className="text-sm text-green-600 mb-4">
            Upload an Excel file of users. Each imported user will automatically receive a QR access key.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
              className="w-full sm:w-96 p-2 border border-green-300 rounded-lg"
            />
            <button
              onClick={handleBulkImport}
              disabled={bulkSubmitting}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
            >
              {bulkSubmitting ? 'Importing...' : 'Import Users'}
            </button>
          </div>
          {bulkResult && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg text-sm text-green-700">
              <p className="font-medium mb-2">Import Result</p>
              <pre className="whitespace-pre-wrap break-all">{JSON.stringify(bulkResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileAccessQR;
