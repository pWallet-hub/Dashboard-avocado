import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('id');
      try {
        const response = await axios.get(`https://pwallet-api.onrender.com/api/farmers/profile/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfile(response.data);
      } catch (error) {
        setError('There was an error fetching the profile data!');
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-blue-200 rounded-full border-t-blue-500 animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
        <div className="w-full max-w-lg p-6 border-l-4 border-red-500 rounded-lg bg-red-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="mt-1 text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-500">No profile data available.</p>
      </div>
    );
  }

  const InfoItem = ({ label, value }) => (
    <div className="mb-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value}</dd>
    </div>
  );

  const TabButton = ({ id, label, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-blue-500 text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Profile Header */}
        <div className="mb-8 overflow-hidden bg-white shadow-lg rounded-2xl">
          <div className="px-8 py-12 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="flex flex-col items-center max-w-4xl mx-auto sm:flex-row">
              <div className="flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-lg">
                <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="mt-6 text-center sm:mt-0 sm:ml-8 sm:text-left">
                <h1 className="text-3xl font-bold text-white">{profile.full_name}</h1>
                <div className="flex flex-col items-center mt-3 space-y-2 sm:space-y-0 sm:space-x-6 sm:flex-row">
                  <div className="flex items-center text-blue-100">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {profile.email}
                  </div>
                  <div className="flex items-center text-blue-100">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {profile.telephone}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-2 px-8 py-4 overflow-x-auto border-b">
            <TabButton id="personal" label="Personal Info" active={activeTab === 'personal'} />
            <TabButton id="location" label="Location" active={activeTab === 'location'} />
            <TabButton id="farm" label="Farm Details" active={activeTab === 'farm'} />
            <TabButton id="assistance" label="Assistance" active={activeTab === 'assistance'} />
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {activeTab === 'personal' && (
            <div className="p-6 bg-white shadow-md rounded-xl">
              <h2 className="mb-6 text-xl font-semibold">Personal Information</h2>
              <div className="space-y-4">
                <InfoItem label="Age" value={profile.age} />
                <InfoItem label="ID Number" value={profile.id_number} />
                <InfoItem label="Gender" value={profile.gender} />
                <InfoItem label="Marital Status" value={profile.marital_status} />
                <InfoItem label="Education Level" value={profile.education_level} />
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="p-6 bg-white shadow-md rounded-xl">
              <h2 className="mb-6 text-xl font-semibold">Location Information</h2>
              <div className="space-y-4">
                <InfoItem label="Province" value={profile.province} />
                <InfoItem label="District" value={profile.district} />
                <InfoItem label="Sector" value={profile.sector} />
                <InfoItem label="Cell" value={profile.cell} />
                <InfoItem label="Village" value={profile.village} />
              </div>
            </div>
          )}

          {activeTab === 'farm' && (
            <>
              <div className="p-6 bg-white shadow-md rounded-xl">
                <h2 className="mb-6 text-xl font-semibold">Farm Details</h2>
                <div className="space-y-4">
                  <InfoItem label="Farm Age" value={`${profile.farm_age} years`} />
                  <InfoItem label="Avocado Type" value={profile.avocado_type} />
                  <InfoItem label="Farm Size" value={profile.farm_size} />
                  <InfoItem label="Tree Count" value={profile.tree_count} />
                  <InfoItem label="UPI Number" value={profile.upi_number} />
                  <InfoItem label="Planted" value={profile.planted} />
                  <InfoItem label="Mixed Percentage" value={profile.mixed_percentage} />
                </div>
              </div>
              <div className="p-6 bg-white shadow-md rounded-xl">
                <h2 className="mb-6 text-xl font-semibold">Farm Location</h2>
                <div className="space-y-4">
                  <InfoItem label="Province" value={profile.farm_province} />
                  <InfoItem label="District" value={profile.farm_district} />
                  <InfoItem label="Sector" value={profile.farm_sector} />
                  <InfoItem label="Cell" value={profile.farm_cell} />
                  <InfoItem label="Village" value={profile.farm_village} />
                </div>
              </div>
            </>
          )}

          {activeTab === 'assistance' && (
            <div className="p-6 bg-white shadow-md rounded-xl">
              <h2 className="mb-6 text-xl font-semibold">Assistance Information</h2>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {profile.assistance.map((item, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}