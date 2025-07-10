import React, { useState, useEffect } from 'react';
import { FileText, Send, Calendar, Eye, Plus, CheckCircle, AlertCircle } from 'lucide-react';

export default function Report() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [reports, setReports] = useState([]);
  const [fetchingReports, setFetchingReports] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Mock data for demonstration since we can't use localStorage
  const mockReports = [
    {
      id: 1,
      title: "Q4 Performance Analysis",
      description: "Comprehensive analysis of quarterly performance metrics and key indicators",
      createdAt: "2024-12-15T10:30:00Z",
      status: "completed"
    },
    {
      id: 2,
      title: "User Experience Review",
      description: "Detailed review of user interface improvements and user feedback integration",
      createdAt: "2024-12-10T14:20:00Z",
      status: "pending"
    },
    {
      id: 3,
      title: "Security Assessment",
      description: "Monthly security audit and vulnerability assessment report",
      createdAt: "2024-12-05T09:15:00Z",
      status: "completed"
    }
  ];

  useEffect(() => {
    const fetchReports = async () => {
      setFetchingReports(true);
      // Simulate API call
      setTimeout(() => {
        setReports(mockReports);
        setFetchingReports(false);
      }, 1000);
    };

    fetchReports();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Simulate API call
    setTimeout(() => {
      const newReport = {
        id: reports.length + 1,
        title,
        description,
        createdAt: new Date().toISOString(),
        status: "pending"
      };
      
      setReports([newReport, ...reports]);
      setSuccess('Report created successfully!');
      setTitle('');
      setDescription('');
      setShowForm(false);
      setLoading(false);
    }, 1500);
  };

  const getStatusColor = (status) => {
    return status === 'completed' ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50';
  };

  const getStatusIcon = (status) => {
    return status === 'completed' ? CheckCircle : AlertCircle;
  };

  return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-800 via-emerald-700 to-green-600">
                Report Management
              </h1>
              <p className="mt-3 text-lg text-gray-600 max-w-2xl">
                Create, manage, and track your reports with our professional reporting system
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl hover:from-green-800 hover:to-emerald-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              style={{ 
                background: 'linear-gradient(to right, #1F310A, #2d4a0f)' 
              }}
            >
              <Plus size={20} />
              New Report
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {(success || error) && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 ${success ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'} transform transition-all duration-300`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${success ? 'text-green-400' : 'text-red-400'}`}>
                {success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${success ? 'text-green-800' : 'text-red-800'}`}>
                  {success || error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Section */}
        {showForm && (
          <div className="mb-8 p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 transform transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(to right, #1F310A, #2d4a0f)' }}>
                <FileText className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Report</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Report Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                  style={{ 
                    '--tw-ring-color': '#1F310A',
                    '--tw-ring-opacity': '0.5'
                  }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(31, 49, 10, 0.5)'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                  placeholder="Enter report title..."
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-gray-300 resize-none"
                  style={{ 
                    '--tw-ring-color': '#1F310A',
                    '--tw-ring-opacity': '0.5'
                  }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(31, 49, 10, 0.5)'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                  placeholder="Describe your report..."
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !title || !description}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  style={{ 
                    background: 'linear-gradient(to right, #1F310A, #2d4a0f)',
                    '--tw-ring-color': '#1F310A'
                  }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(31, 49, 10, 0.5), 0 0 0 4px rgba(31, 49, 10, 0.1)'}
                  onBlur={(e) => e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                  {loading ? 'Creating...' : 'Create Report'}
                </button>
                
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reports Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg">
                <FileText className="text-white" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Your Reports</h2>
              <span className="ml-auto px-3 py-1 text-sm font-medium rounded-full" style={{ backgroundColor: 'rgba(31, 49, 10, 0.1)', color: '#1F310A' }}>
                {reports.length} Reports
              </span>
            </div>
          </div>

          <div className="overflow-hidden">
            {fetchingReports ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'rgba(31, 49, 10, 0.1)' }}>
                  <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1F310A' }}></div>
                </div>
                <p className="text-gray-600">Loading reports...</p>
              </div>
            ) : reports.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {reports.map((report, index) => {
                  const StatusIcon = getStatusIcon(report.status);
                  return (
                    <div
                      key={report.id}
                      className="p-6 hover:bg-gray-50/50 transition-all duration-200 transform hover:scale-[1.01] cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 transition-colors" style={{ ':hover': { color: '#1F310A' } }}
                              onMouseEnter={(e) => e.target.style.color = '#1F310A'}
                              onMouseLeave={(e) => e.target.style.color = '#111827'}>
                              {report.title}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                              <StatusIcon size={12} />
                              {report.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {report.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(report.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye size={14} />
                              View Details
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <button className="p-2 text-gray-400 rounded-lg transition-all duration-200"
                            style={{ ':hover': { color: '#1F310A', backgroundColor: 'rgba(31, 49, 10, 0.1)' } }}
                            onMouseEnter={(e) => {
                              e.target.style.color = '#1F310A';
                              e.target.style.backgroundColor = 'rgba(31, 49, 10, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = '#9ca3af';
                              e.target.style.backgroundColor = 'transparent';
                            }}>
                            <Eye size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <FileText className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
                <p className="text-gray-500 mb-4">Create your first report to get started</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                  style={{ backgroundColor: '#1F310A' }}
                >
                  <Plus size={16} />
                  Create Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}