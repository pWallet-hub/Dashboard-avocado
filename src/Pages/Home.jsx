import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './home.css';

const Home = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      // Check if token exists
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        const response = await axios.get(
          'https://dash-api-hnyp.onrender.com/api/farmer-information',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Check if response has the expected data structure
        if (!response.data) {
          throw new Error('No data received from server');
        }

        const { user_info, farmer_profile } = response.data;

        // Verify user_info exists before accessing properties
        if (!user_info) {
          throw new Error('User information not found in response');
        }

        const profileData = {
          id: user_info.id || null,
          full_name: user_info.full_name || 'Unknown User',
          email: user_info.email || '',
          phone: user_info.phone || '',
          role: localStorage.getItem('role') || 'farmer',
          created_at: user_info.created_at || new Date().toISOString(),
          profile: farmer_profile || {},
        };

        setProfile(profileData);
      } catch (err) {
        setError('Failed to load profile. Please log in again.');
        console.error('Profile fetch error:', err);
        console.error('Error details:', err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="hm-loading">
        <div className="hm-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="hm-error">{error}</div>;
  }

  if (!profile) {
    return <div className="hm-no-data">No profile data.</div>;
  }

  const fp = profile.profile || {};

  return (
    <div className="hm-container">
      {/* Floating Particles */}
      <div className="hm-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`hm-particle hm-p${i + 1}`}></div>
        ))}
      </div>

      {/* Hero: Profile + Nav */}
      <div className="hm-hero">
        {/* Creative Profile Card */}
        <div className="hm-profile-card">
          <div className="hm-card-glow"></div>
          <div className="hm-avatar-wrapper">
            <div className="hm-avatar">
              {fp.image ? (
                <img src={fp.image} alt="Profile" />
              ) : (
                <div className="hm-avatar-fallback">
                  {profile.full_name?.charAt(0) || 'F'}
                </div>
              )}
            </div>
            <div className="hm-avatar-ring"></div>
            <div className="hm-ring-pulse"></div>
          </div>

          <div className="hm-user-info">
            <h2 className="hm-name">{profile.full_name}</h2>
            <p className="hm-role">Role: {profile.role}</p>
            <p className="hm-member">
              Member since {new Date(profile.created_at).getFullYear()}
            </p>
          </div>

          <div className="hm-stats">
            <div className="hm-stat">
              <div className="hm-hex">
                <span>{fp.tree_count || '0'}</span>
              </div>
              <p>Trees</p>
            </div>
            <div className="hm-stat">
              <div className="hm-hex">
                <span>{fp.farm_size || '0'}</span>
              </div>
              <p>Hectares</p>
            </div>
            <div className="hm-stat">
              <div className="hm-hex">
                <span>{fp.upi_number?.slice(0, 8) || '—'}</span>
              </div>
              <p>UPI</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="hm-nav">
          <button className="hm-nav-btn hm-active">
            <span>Dashboard</span>
            <div className="hm-glow"></div>
          </button>
          <button
            className="hm-nav-btn"
            onClick={() => navigate('/profile')}
          >
            <span>Profile</span>
            <div className="hm-glow"></div>
          </button>
          <button className="hm-nav-btn hm-logout" onClick={handleLogout}>
            <span>Logout</span>
            <div className="hm-glow"></div>
          </button>
        </div>
      </div>

      {/* Welcome */}
      <div className="hm-welcome">
        <h1>Welcome back, {profile.full_name.split(' ')[0]}!</h1>
        <p>Your avocado journey starts here.</p>
      </div>
    </div>
  );
};

export default Home;