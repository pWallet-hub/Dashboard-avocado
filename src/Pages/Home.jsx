import { useEffect, useState } from 'react';
import axios from 'axios';

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Welcome to Your Dashboard
          </h1>
          <p className="text-blue-100 text-center max-w-2xl mx-auto text-lg">
            Stay updated with the latest announcements and important information
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Admin Create Announcement Section */}
        {role === 'admin' && (
          <div className="mb-8">
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Create New Announcement
              </button>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">Create Announcement</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <textarea
                  className="w-full p-4 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows="4"
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  placeholder="Write your announcement here..."
                ></textarea>
                <div className="flex justify-end gap-3">
                  <button
                    className="px-6 py-2 text-gray-600 hover:text-gray-800"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    onClick={handleCreateAnnouncement}
                    disabled={loading || !newAnnouncement.trim()}
                  >
                    {loading ? 'Creating...' : 'Post Announcement'}
                  </button>
                </div>
                {error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Announcements Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recent Announcements</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
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
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 mb-2">{announcement.content}</p>
                      <p className="text-sm text-gray-500">
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
  );
};

export default Home;