import { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [role, setRole] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user role from local storage or API
    const userRole = localStorage.getItem('role');
    setRole(userRole);

    // Fetch announcements
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
    if (!newAnnouncement) return;

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
      setAnnouncements([...announcements, response.data]);
      setNewAnnouncement('');
    } catch (error) {
      setError('There was an error creating the announcement!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Welcome to the Dashboard Home</h1>
      {role === 'admin' && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Create Announcement</h2>
          <textarea
            className="w-full p-2 border rounded mb-4"
            rows="4"
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
            placeholder="Write your announcement here..."
          ></textarea>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleCreateAnnouncement}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Announcement'}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Announcements</h2>
        {loading ? (
          <p>Loading announcements...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <ul className="list-disc pl-5">
            {announcements.map((announcement) => (
              <li key={announcement.id} className="mb-2">
                {announcement.content}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;