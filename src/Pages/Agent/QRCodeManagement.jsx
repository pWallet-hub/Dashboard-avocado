import React, { useState, useEffect } from 'react';
import { QrCode, Search, User, Edit, Download, Upload, Eye, Scan } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { generateQRCode, getUserByQRToken, updateUserViaQR, importUsersFromExcel } from '../../services/profileAccessService';
import { listFarmers } from '../../services/usersService';

const QRCodeManagement = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [scanToken, setScanToken] = useState('');
  const [scannedUserData, setScannedUserData] = useState(null);

  useEffect(() => {
    loadFarmers();
  }, []);

  const loadFarmers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await listFarmers({ limit: 1000 });
      const farmersData = response?.data || response || [];
      setFarmers(Array.isArray(farmersData) ? farmersData : []);
    } catch (error) {
      console.error('Error loading farmers:', error);
      setError('Failed to load farmers');
      setFarmers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (farmer) => {
    try {
      setSelectedFarmer(farmer);
      
      // Generate QR code for the farmer
      const qrResponse = await generateQRCode(farmer.id);
      
      // Generate QR code image
      const qrCodeUrl = await QRCodeLib.toDataURL(qrResponse.token || farmer.id, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeData({
        ...qrResponse,
        imageUrl: qrCodeUrl,
        farmer: farmer
      });
      
      setShowQRModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code: ' + error.message);
    }
  };

  const handleScanQR = async () => {
    if (!scanToken.trim()) {
      alert('Please enter a QR token');
      return;
    }
    
    try {
      const userData = await getUserByQRToken(scanToken.trim());
      setScannedUserData(userData);
    } catch (error) {
      console.error('Error scanning QR code:', error);
      alert('Error scanning QR code: ' + error.message);
      setScannedUserData(null);
    }
  };

  const handleUpdateScannedUser = async (updatedData) => {
    try {
      await updateUserViaQR(scanToken, updatedData);
      alert('User data updated successfully!');
      setShowScanModal(false);
      setScanToken('');
      setScannedUserData(null);
    } catch (error) {
      console.error('Error updating user via QR:', error);
      alert('Error updating user data: ' + error.message);
    }
  };

  const handleImportExcel = async (file) => {
    try {
      const result = await importUsersFromExcel(file);
      alert(`Successfully imported ${result.imported || 0} users`);
      setShowImportModal(false);
      await loadFarmers();
    } catch (error) {
      console.error('Error importing Excel file:', error);
      alert('Error importing Excel file: ' + error.message);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeData?.imageUrl) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${selectedFarmer?.full_name || 'farmer'}.png`;
    link.href = qrCodeData.imageUrl;
    link.click();
  };

  const filteredFarmers = farmers.filter(farmer => {
    if (!farmer) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (farmer.full_name?.toLowerCase() || '').includes(searchLower) ||
           (farmer.email?.toLowerCase() || '').includes(searchLower) ||
           (farmer.phone?.toLowerCase() || '').includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <QrCode className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading farmers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <QrCode className="h-7 w-7 mr-3 text-blue-600" />
              QR Code Management
            </h1>
            <p className="text-gray-600 mt-1">Generate and manage QR codes for farmer profiles</p>
            {error && (
              <div className="mt-2 p-2 bg-red-100 border border-red-400 rounded text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowScanModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Scan className="h-4 w-4 mr-2" />
              Scan QR Code
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Excel
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search farmers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Found: <span className="font-semibold">{filteredFarmers.length}</span> farmers
          </span>
          <button
            onClick={loadFarmers}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Farmers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFarmers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No farmers found</p>
          </div>
        ) : (
          filteredFarmers.map((farmer) => (
            <div key={farmer.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {farmer.full_name || 'Unknown Name'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">{farmer.email || 'No email'}</p>
                  <p className="text-sm text-gray-600 mb-1">{farmer.phone || 'No phone'}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    farmer.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {farmer.status || 'unknown'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleGenerateQR(farmer)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && qrCodeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-2xl">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                QR Code for {selectedFarmer?.full_name}
              </h3>
              
              <div className="mb-6">
                <img 
                  src={qrCodeData.imageUrl} 
                  alt="QR Code" 
                  className="mx-auto border border-gray-200 rounded-lg"
                />
              </div>
              
              <div className="text-sm text-gray-600 mb-6">
                <p><strong>Token:</strong> {qrCodeData.token}</p>
                <p><strong>Expires:</strong> {qrCodeData.expiresAt ? new Date(qrCodeData.expiresAt).toLocaleString() : 'Never'}</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scan QR Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Scan QR Code</h3>
              <button
                onClick={() => { setShowScanModal(false); setScanToken(''); setScannedUserData(null); }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">QR Token</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={scanToken}
                    onChange={(e) => setScanToken(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter QR token or scan QR code"
                  />
                  <button
                    onClick={handleScanQR}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Scan
                  </button>
                </div>
              </div>
              
              {scannedUserData && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">User Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        defaultValue={scannedUserData.full_name || ''}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        id="fullName"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        defaultValue={scannedUserData.email || ''}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        id="email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        defaultValue={scannedUserData.phone || ''}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        id="phone"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        defaultValue={scannedUserData.status || 'active'}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        id="status"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        const updatedData = {
                          full_name: document.getElementById('fullName').value,
                          email: document.getElementById('email').value,
                          phone: document.getElementById('phone').value,
                          status: document.getElementById('status').value
                        };
                        handleUpdateScannedUser(updatedData);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update User
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Import Users from Excel</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excel File</label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleImportExcel(file);
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Required columns:</strong></p>
                <ul className="list-disc list-inside mt-1">
                  <li>full_name</li>
                  <li>email</li>
                  <li>phone</li>
                  <li>role (optional)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeManagement;