import React, { useEffect, useState } from 'react';
import { FileCheck2, Eye, CheckCircle, XCircle, RefreshCw, Leaf } from 'lucide-react';
import { listDocuments, getDocument, reviewNotarization } from '../../services/documentsService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';

const PENDING_STATUSES = ['pending', 'pending_review', 'submitted', 'awaiting_review'];

const isPending = (doc) => {
  const status = (doc.notarization_status || doc.status || '').toString().toLowerCase();
  return PENDING_STATUSES.includes(status) || status === '';
};

const statusBadgeClass = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'approved':
      return 'bg-green-200 text-green-800 ring-green-500';
    case 'rejected':
      return 'bg-red-200 text-red-800 ring-red-500';
    case 'pending':
    case 'pending_review':
      return 'bg-yellow-200 text-yellow-800 ring-yellow-500';
    default:
      return 'bg-gray-200 text-gray-800 ring-gray-500';
  }
};

const DocumentReview = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const [metadataDoc, setMetadataDoc] = useState(null);
  const [metadataLoading, setMetadataLoading] = useState(false);

  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewReason, setReviewReason] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listDocuments({ type: 'notarized_upload' });
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading documents for review:', err);
      setError(err.message || 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const visibleDocuments = showAll ? documents : documents.filter(isPending);

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

  const openReviewModal = (doc) => {
    setReviewReason('');
    setReviewTarget(doc);
  };

  const handleApprove = async () => {
    const confirmed = await confirm(
      'Approve this notarized document? The agent/farmer will be notified.',
      { title: 'Approve Document', confirmLabel: 'Approve', danger: false }
    );
    if (!confirmed) return;

    setReviewSubmitting(true);
    try {
      await reviewNotarization(reviewTarget.id, { approved: true, rejectionReason: reviewReason || undefined });
      toast.success('Document approved');
      setReviewTarget(null);
      await loadDocuments();
    } catch (err) {
      console.error('Error approving document:', err);
      toast.error('Error approving document: ' + err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reviewReason.trim()) {
      toast.error('A rejection reason is required');
      return;
    }

    const confirmed = await confirm(
      'Reject this notarized document? The uploader will need to resubmit.',
      { title: 'Reject Document', confirmLabel: 'Reject', danger: true }
    );
    if (!confirmed) return;

    setReviewSubmitting(true);
    try {
      await reviewNotarization(reviewTarget.id, { approved: false, rejectionReason: reviewReason });
      toast.success('Document rejected');
      setReviewTarget(null);
      await loadDocuments();
    } catch (err) {
      console.error('Error rejecting document:', err);
      toast.error('Error rejecting document: ' + err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <FileCheck2 className="h-7 w-7 mr-3 text-green-600" />
              Document Notarization Review
            </h2>
            <p className="text-green-600 mt-1">Review and approve or reject notarized document submissions</p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">
                {error}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-green-700">
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
              />
              Show all statuses
            </label>
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
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-green-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-green-600">Loading documents...</p>
          </div>
        ) : visibleDocuments.length === 0 ? (
          <div className="p-8 text-center">
            <Leaf className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-600 text-lg font-medium mb-2">No documents pending review</p>
            <p className="text-green-500 text-sm">Newly submitted notarized documents will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-green-100">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-100">
                {visibleDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-green-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-900">{doc.owner_id || doc.owner_name || 'N/A'}</div>
                      <div className="text-xs text-green-500">{doc.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-900">{(doc.type || 'other').replace(/_/g, ' ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${statusBadgeClass(doc.notarization_status || doc.status)}`}>
                        {(doc.notarization_status || doc.status || 'pending').toString().replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-900">
                        {doc.updated_at || doc.created_at
                          ? new Date(doc.updated_at || doc.created_at).toLocaleDateString()
                          : 'N/A'}
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
                          onClick={() => openReviewModal(doc)}
                          className="text-blue-600 hover:text-blue-800 transform hover:scale-110 transition"
                          title="Review"
                          aria-label="Review"
                        >
                          <CheckCircle className="h-5 w-5" />
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

      {/* Review Modal */}
      {reviewTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Review Document</h3>
              <button
                onClick={() => setReviewTarget(null)}
                className="text-green-400 hover:text-green-600 text-2xl"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <p className="text-sm text-green-600 mb-4">
              Document <span className="font-medium">{reviewTarget.id}</span>
            </p>
            <label className="block text-sm font-medium text-green-700 mb-2">
              Reason / Notes <span className="text-green-400">(required when rejecting)</span>
            </label>
            <textarea
              value={reviewReason}
              onChange={(e) => setReviewReason(e.target.value)}
              rows="4"
              className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Explain why the document is being rejected, or add optional approval notes..."
            />
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setReviewTarget(null)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
                disabled={reviewSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                disabled={reviewSubmitting}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                disabled={reviewSubmitting}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentReview;
