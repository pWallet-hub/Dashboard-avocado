import { useEffect, useState } from 'react';
import {
  CalendarClock, Plus, Play, CheckCircle2, XCircle, Search, Filter,
  MapPin, RefreshCw, ClipboardList, Clock
} from 'lucide-react';
import apiClient, { extractData } from '../../services/apiClient';
import {
  listVisits,
  scheduleVisit,
  startVisit,
  completeVisit,
  cancelVisit
} from '../../services/visitsService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';

const STATUS_STYLES = {
  scheduled: 'bg-blue-100 text-blue-800 ring-blue-500',
  in_progress: 'bg-purple-100 text-purple-800 ring-purple-500',
  completed: 'bg-green-100 text-green-800 ring-green-500',
  cancelled: 'bg-red-100 text-red-800 ring-red-500',
};

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const emptyScheduleForm = {
  farm_id: '',
  scheduled_at: '',
  purpose: '',
  notes: '',
};

export default function Visits() {
  const toast = useToast();
  const confirm = useConfirm();

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [farms, setFarms] = useState([]);
  const [farmsLoading, setFarmsLoading] = useState(false);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState(emptyScheduleForm);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [completingVisit, setCompletingVisit] = useState(null);
  const [completeNotes, setCompleteNotes] = useState('');
  const [completeLoading, setCompleteLoading] = useState(false);

  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadVisits = async (status = statusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const options = status !== 'all' ? { status } : {};
      const data = await listVisits(options);
      const sorted = [...data].sort(
        (a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at)
      );
      setVisits(sorted);
    } catch (err) {
      console.error('Error loading visits:', err);
      setError(err.message || 'Failed to load visits');
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFarms = async () => {
    setFarmsLoading(true);
    try {
      // No dedicated farmsService.js exists yet, so fetch farms inline for the picker.
      const response = await apiClient.get('/farms');
      const extracted = extractData(response);
      const list = Array.isArray(extracted) ? extracted : Array.isArray(extracted?.data) ? extracted.data : [];
      setFarms(list);
    } catch (err) {
      console.error('Error loading farms:', err);
      setFarms([]);
    } finally {
      setFarmsLoading(false);
    }
  };

  useEffect(() => {
    loadVisits('all');
    loadFarms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadVisits(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const farmLabel = (farm) => {
    const name = farm.farmName || farm.farm_name || 'Unnamed Farm';
    return farm.farmerName ? `${name} (${farm.farmerName})` : name;
  };

  const findFarm = (farmId) => farms.find((f) => f.id === farmId);

  const safeVisits = Array.isArray(visits) ? visits : [];
  const filteredVisits = safeVisits.filter((visit) => {
    if (!visit) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const farm = findFarm(visit.farm_id);
    return (
      (visit.purpose?.toLowerCase() || '').includes(term) ||
      (farm?.farmName?.toLowerCase() || farm?.farm_name?.toLowerCase() || '').includes(term) ||
      (farm?.farmerName?.toLowerCase() || '').includes(term)
    );
  });

  const openScheduleModal = () => {
    setScheduleForm(emptyScheduleForm);
    setShowScheduleModal(true);
  };

  const handleSchedule = async () => {
    if (!scheduleForm.farm_id) {
      toast.error('Please select a farm');
      return;
    }
    if (!scheduleForm.scheduled_at) {
      toast.error('Please choose a date and time');
      return;
    }

    setScheduleLoading(true);
    try {
      const scheduledAtIso = new Date(scheduleForm.scheduled_at).toISOString();
      await scheduleVisit({
        farm_id: scheduleForm.farm_id,
        scheduled_at: scheduledAtIso,
        ...(scheduleForm.purpose && { purpose: scheduleForm.purpose }),
        ...(scheduleForm.notes && { notes: scheduleForm.notes }),
      });
      toast.success('Visit scheduled successfully');
      setShowScheduleModal(false);
      setScheduleForm(emptyScheduleForm);
      await loadVisits();
    } catch (err) {
      console.error('Error scheduling visit:', err);
      toast.error(err.message || 'Failed to schedule visit');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleStart = async (visit) => {
    setActionLoadingId(visit.id);
    try {
      await startVisit(visit.id);
      toast.success('Visit marked as in-progress');
      await loadVisits();
    } catch (err) {
      console.error('Error starting visit:', err);
      toast.error(err.message || 'Failed to start visit');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openCompleteModal = (visit) => {
    setCompletingVisit(visit);
    setCompleteNotes('');
  };

  const handleComplete = async () => {
    if (!completingVisit) return;
    setCompleteLoading(true);
    try {
      await completeVisit(completingVisit.id, completeNotes);
      toast.success('Visit marked as completed');
      setCompletingVisit(null);
      setCompleteNotes('');
      await loadVisits();
    } catch (err) {
      console.error('Error completing visit:', err);
      toast.error(err.message || 'Failed to complete visit');
    } finally {
      setCompleteLoading(false);
    }
  };

  const handleCancel = async (visit) => {
    const ok = await confirm('Are you sure you want to cancel this visit? This cannot be undone.', {
      title: 'Cancel Visit',
      confirmLabel: 'Cancel Visit',
      cancelLabel: 'Keep Visit',
    });
    if (!ok) return;

    setActionLoadingId(visit.id);
    try {
      await cancelVisit(visit.id, 'Cancelled by agent');
      toast.success('Visit cancelled');
      await loadVisits();
    } catch (err) {
      console.error('Error cancelling visit:', err);
      toast.error(err.message || 'Failed to cancel visit');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-green-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-green-800 flex items-center">
              <CalendarClock className="h-7 w-7 mr-3 text-green-600" />
              Farm Visits
            </h2>
            <p className="text-green-600 mt-1">Schedule and manage your farm visits</p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm text-yellow-700">
                {error}
              </div>
            )}
          </div>
          <button
            onClick={openScheduleModal}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Schedule Visit
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 ring-1 ring-green-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
            <input
              type="text"
              placeholder="Search by farm, farmer or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              aria-label="Search visits"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none transition-all"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-green-600">
              Total Visits: <span className="font-semibold">{filteredVisits.length}</span>
            </span>
            <button
              onClick={() => loadVisits()}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm flex items-center"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-green-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-green-600">Loading visits...</p>
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardList className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-600 text-lg font-medium mb-2">
              {error ? 'Unable to load visits' : 'No visits found'}
            </p>
            <p className="text-green-500 text-sm mb-4">
              {error
                ? 'Please check your connection and try again.'
                : 'Schedule a visit to a farm to get started.'}
            </p>
            <button
              onClick={openScheduleModal}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center mx-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Schedule Visit
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-green-100">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Farm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Scheduled</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-100">
                {filteredVisits.map((visit) => {
                  const farm = findFarm(visit.farm_id);
                  return (
                    <tr key={visit.id} className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-900 flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-green-500" />
                          {farm ? farmLabel(farm) : visit.farm_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-900 flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-green-500" />
                          {formatDateTime(visit.scheduled_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-green-700 max-w-xs truncate">{visit.purpose || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ring-1 ${STATUS_STYLES[visit.status] || 'bg-gray-200 text-gray-800 ring-gray-500'}`}>
                          {formatStatus(visit.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          {visit.status === 'scheduled' && (
                            <button
                              onClick={() => handleStart(visit)}
                              disabled={actionLoadingId === visit.id}
                              className="text-purple-600 hover:text-purple-800 transform hover:scale-110 transition disabled:opacity-50"
                              title="Start Visit"
                              aria-label="Start Visit"
                            >
                              <Play className="h-5 w-5" />
                            </button>
                          )}
                          {(visit.status === 'scheduled' || visit.status === 'in_progress') && (
                            <button
                              onClick={() => openCompleteModal(visit)}
                              className="text-green-600 hover:text-green-800 transform hover:scale-110 transition"
                              title="Complete Visit"
                              aria-label="Complete Visit"
                            >
                              <CheckCircle2 className="h-5 w-5" />
                            </button>
                          )}
                          {(visit.status === 'scheduled' || visit.status === 'in_progress') && (
                            <button
                              onClick={() => handleCancel(visit)}
                              disabled={actionLoadingId === visit.id}
                              className="text-red-600 hover:text-red-800 transform hover:scale-110 transition disabled:opacity-50"
                              title="Cancel Visit"
                              aria-label="Cancel Visit"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Visit Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Schedule Visit</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-green-400 hover:text-green-600 text-2xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Farm *</label>
                <select
                  value={scheduleForm.farm_id}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, farm_id: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  disabled={farmsLoading}
                >
                  <option value="">{farmsLoading ? 'Loading farms...' : 'Select a farm'}</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>{farmLabel(farm)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Date &amp; Time *</label>
                <input
                  type="datetime-local"
                  value={scheduleForm.scheduled_at}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, scheduled_at: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Purpose</label>
                <input
                  type="text"
                  value={scheduleForm.purpose}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, purpose: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. Routine inspection, pest control follow-up..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Notes</label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Any additional details for this visit..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
                disabled={scheduleLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105"
                disabled={scheduleLoading}
              >
                {scheduleLoading ? 'Scheduling...' : 'Schedule Visit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Visit Modal */}
      {completingVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-green-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-green-800">Complete Visit</h3>
              <button
                onClick={() => setCompletingVisit(null)}
                className="text-green-400 hover:text-green-600 text-2xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">Visit Notes</label>
              <textarea
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
                className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows="4"
                placeholder="Summarize what was observed and any follow-up actions..."
              />
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setCompletingVisit(null)}
                className="px-6 py-3 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all"
                disabled={completeLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105"
                disabled={completeLoading}
              >
                {completeLoading ? 'Saving...' : 'Mark as Completed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
