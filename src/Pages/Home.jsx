import { useEffect, useState } from 'react';
import axios from 'axios';
import '../Pages/Styles/Home.css';

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
    <div className="page-wrapper">
      <div className="hero">
        <div className="container hero-content">
          <h1 className="hero-title">Welcome to Your Dashboard</h1>
          <p className="hero-subtitle">
            Stay updated with the latest announcements and important information
          </p>
        </div>
      </div>

      <div className="container main-content">
        {role === 'admin' && (
          <div style={{ marginBottom: '2rem' }}>
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="create-button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Create New Announcement
              </button>
            ) : (
              <div className="create-form">
                <div className="form-header">
                  <h2 className="form-title">Create Announcement</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="close-button"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <textarea
                  className="form-textarea"
                  rows="4"
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  placeholder="Write your announcement here..."
                ></textarea>
                <div className="form-actions">
                  <button
                    className="cancel-button"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="submit-button"
                    onClick={handleCreateAnnouncement}
                    disabled={loading || !newAnnouncement.trim()}
                  >
                    {loading ? 'Creating...' : 'Post Announcement'}
                  </button>
                </div>
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="announcements-section">
          <h2 className="section-title">Recent Announcements</h2>
          
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : error ? (
            <div className="error-message">
              {error}
            </div>
          ) : announcements.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-lg">No announcements yet</p>
            </div>
          ) : (
            <div className="announcement-list">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="announcement-item"
                >
                  <div className="announcement-content">
                    <div className="announcement-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <div>
                      <p className="announcement-text">{announcement.content}</p>
                      <p className="announcement-date">
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