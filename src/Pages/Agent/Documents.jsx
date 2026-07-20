import React, { useEffect, useState } from 'react';
import { FileText, Download, Eye, PenTool, UploadCloud, Leaf, RefreshCw } from 'lucide-react';
import {
  listDocuments,
  getDocument,
  downloadDocument,
  attachSignature,
  uploadNotarizedCopy,
} from '../../services/documentsService';
import { useToast } from '../../components/Ui/Toast';

const DOCUMENT_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'profile_card', label: 'Profile Card' },
  { value: 'contract', label: 'Contract' },
  { value: 'ipm_form', label: 'IPM Form' },
  { value: 'notarized_upload', label: 'Notarized Upload' },
  { value: 'other', label: 'Other' },
];

const statusBadgeClass = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'approved':
      return 'bg-green-200 text-green-800 ring-green-500';
    case 'rejected':
      return 'bg-red-200 text-red-800 ring-red-500';
    case 'pending':
      return 'bg-yellow-200 text-yellow-800 ring-yellow-500';
    default:
      return 'bg-gray-200 text-gray-800 ring-gray-500';
  }
};

const Documents = () => {
  const toast = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');

  const [metadataDoc, setMetadataDoc] = useState(null);
  const [metadataLoading, setMetadataLoading] = useState(false);

  const [signatureTarget, setSignatureTarget] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signatureSubmitting, setSignatureSubmitting] = useState(false);

  const [notarizeTarget, setNotarizeTarget] = useState(null);
  const [notarizeFile, setNotarizeFile] = useState(null);
  const [notarizeSubmitting, setNotarizeSubmitting] = useState(false);

  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const options = {};
      if (typeFilter !== 'all') options.type = typeFilter;
      const data = await listDocuments(options);
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError(err.message || 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMetadata = async (doc) => {
    setMetadataLoading(true);
    try {
      const fullDoc = await getDocument(doc.id);
      setMetadataDoc(fullDoc || doc);
    } catch (err) {
      console.error('Error fetching document metadata:', err);
      setMetadataDoc(doc);
    } finally {
      setMetadataLoading(false);
    }
  };

  const handleDownload = async (doc) => {
    setDownloadingId(doc.id);
    try {
      await downloadDocument(doc.id, doc.file_name || doc.name || `document-${doc.id}`);
      toast.success('Download started');
    } catch (err) {
      console.error('Error downloading document:', err);
      toast.error('Error downloading document: ' + err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const openSignatureModal = (doc) => {
    setSignatureFile(null);
    setSignatureTarget(doc);
  };

  const handleAttachSignature = async () => {
    if (!signatureFile) {
      toast.error('Please select a signature image');
      return;
    }
    setSignatureSubmitting(true);
    try {
      await attachSignature(signatureTarget.id, signatureFile);
      toast.success('Signature attached successfully');
      setSignatureTarget(null);
      setSignatureFile(null);
      await loadDocuments();
    } catch (err) {
      console.error('Error attaching signature:', err);
      toast.error('Error attaching signature: ' + err.message);
    } finally {
      setSignatureSubmitting(false);
    }
  };

  const openNotarizeModal = (doc) => {
    setNotarizeFile(null);
    setNotarizeTarget(doc);
  };

  const handleUploadNotarized = async () => {
    if (!notarizeFile) {
      toast.error('Please select the notarized document file');
      return;
    }
    setNotarizeSubmitting(true);
    try {
      await uploadNotarizedCopy(notarizeTarget.id, notarizeFile);
      toast.success('Notarized copy uploaded. Awaiting admin review.');
      setNotarizeTarget(null);
      setNotarizeFile(null);
      await loadDocuments();
    } catch (err) {
      console.error('Error uploading notarized copy:', err);
      toast.error('Error uploading notarized copy: ' + err.message);
    } finally {
      setNotarizeSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <FileText className="h-7 w-7 mr-3 text-green-600" />
              My Documents
            </h2>
            <p className="text-green-600 mt-1">View, download, sign, and submit notarized copies of your documents</p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">
                {error}
              </div>
            )}
          </div>
          <button
            onClick={loadDocuments}
            className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <label className="block text-sm font-medium text-green-700 mb-2">Filter by Type</label>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full sm:w-64 p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-green-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-green-600">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center">
            <Leaf className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-600 text-lg font-medium mb-2">No documents found</p>
            <p className="text-green-500 text-sm">Documents assigned to you will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-green-100">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-green-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-900">
                        {(doc.type || 'other').replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-green-500">{doc.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${statusBadgeClass(doc.notarization_status || doc.status)}`}>
                        {(doc.notarization_status || doc.status || 'N/A').toString().replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-900">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewMetadata(doc)}
                          className="text-green-600 hover:text-green-800 transform hover:scale-110 transition"
                          title="View metadata"
                          aria-label="View metadata"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-blue-600 hover:text-blue-800 transform hover:scale-110 transition disabled:opacity-50"
                          title="Download"
                          aria-label="Download"
                          disabled={downloadingId === doc.id}
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openSignatureModal(doc)}
                          className="text-purple-600 hover:text-purple-800 transform hover:scale-110 transition"
                          title="Attach signature"
                          aria-label="Attach signature"
                        >
                          <PenTool className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openNotarizeModal(doc)}
                          className="text-orange-600 hover:text-orange-800 transform hover:scale-110 transition"
                          title="Upload notarized copy"
                          aria-label="Upload notarized copy"
                        >
                          <UploadCloud className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Metadata Modal */}
      {metadataDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Document Metadata</h3>
              <button
                onClick={() => setMetadataDoc(null)}
                className="text-green-400 hover:text-green-600 text-2xl"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            {metadataLoading ? (
              <div className="text-center py-4 text-green-600">Loading...</div>
            ) : (
              <div className="space-y-2 text-sm">
                {Object.entries(metadataDoc).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-green-50 py-2">
                    <span className="font-medium text-green-700 mr-4">{key.replace(/_/g, ' ')}</span>
                    <span className="text-green-600 text-right break-all">
                      {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? 'N/A')}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setMetadataDoc(null)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attach Signature Modal */}
      {signatureTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Attach Signature</h3>
              <button
                onClick={() => setSignatureTarget(null)}
                className="text-green-400 hover:text-green-600 text-2xl"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <p className="text-sm text-green-600 mb-4">
              Upload an image of your signature for document{' '}
              <span className="font-medium">{signatureTarget.id}</span>.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
              className="w-full p-2 border border-green-300 rounded-lg"
            />
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setSignatureTarget(null)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
                disabled={signatureSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAttachSignature}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                disabled={signatureSubmitting}
              >
                {signatureSubmitting ? 'Uploading...' : 'Attach Signature'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Notarized Copy Modal */}
      {notarizeTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Upload Notarized Copy</h3>
              <button
                onClick={() => setNotarizeTarget(null)}
                className="text-green-400 hover:text-green-600 text-2xl"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <p className="text-sm text-green-600 mb-4">
              Upload the physically notarized copy of document{' '}
              <span className="font-medium">{notarizeTarget.id}</span> for admin review.
            </p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setNotarizeFile(e.target.files?.[0] || null)}
              className="w-full p-2 border border-green-300 rounded-lg"
            />
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setNotarizeTarget(null)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
                disabled={notarizeSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadNotarized}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                disabled={notarizeSubmitting}
              >
                {notarizeSubmitting ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
