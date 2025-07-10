import { useEffect, useState } from 'react';
import axios from 'axios';
import Advertisement from '../components/advertisement/advertisement';

const Home = () => {
  const [role, setRole] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    setRole(userRole);

    const fetchAnnouncements = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('https://pwallet-api.onrender.com/api/announcements');
        setAnnouncements(response.data);
      } catch (error) {
        console.log(error);
        setError('There was an error fetching the announcements!');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.trim()) return;

    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        'https://pwallet-api.onrender.com/api/announcements',
        { content: newAnnouncement },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAnnouncements([response.data, ...announcements]);
      setNewAnnouncement('');
      setShowCreateForm(false);
    } catch (error) {
      setError('There was an error creating the announcement!');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-green-800 text-white rounded-2xl mb-8 animate-fade-in-down">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-green-800/20" />
          <div className="relative py-12 px-6 sm:px-12 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight animate-pulse-slow">
              Welcome to Avocado Society Rwanda
            </h1>
            <p className="text-lg sm:text-xl max-w-3xl mx-auto text-green-100">
              Stay updated with the latest announcements and important information
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 animate-fade-in">
          {role === 'admin' && (
            <div className="mb-8">
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="group flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Announcement
                </button>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 animate-slide-up">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Create Announcement</h2>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <textarea
                    className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                    rows="4"
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                    placeholder="Write your announcement here..."
                  />
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleCreateAnnouncement}
                      disabled={loading || !newAnnouncement.trim()}
                    >
                      {loading ? 'Creating...' : 'Post Announcement'}
                    </button>
                  </div>
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg animate-shake">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="announcements-section">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Announcements</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg animate-shake">
                {error}
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-lg">No announcements yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="group bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800">{announcement.content}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {announcement.createdAt && formatDate(announcement.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Advertisement />
      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-4px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(4px);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Home;