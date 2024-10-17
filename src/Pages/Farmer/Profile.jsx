import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('id'); // Retrieve user_id from local storage
      try {
        const response = await axios.get(`https://pwallet-api.onrender.com/api/farmers/profile/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfile(response.data);
      } catch (error) {
        setError('There was an error fetching the profile data!');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <div className="loader"></div>
        <p className="ml-2">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  if (!profile) {
    return <p className="text-center">No profile data available.</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Farmer Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
            <p><strong>Full Name:</strong> {profile.full_name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Phone Number:</strong> {profile.telephone}</p>
            <p><strong>Age:</strong> {profile.age}</p>
            <p><strong>ID Number:</strong> {profile.id_number}</p>
            <p><strong>Gender:</strong> {profile.gender}</p>
            <p><strong>Marital Status:</strong> {profile.marital_status}</p>
            <p><strong>Education Level:</strong> {profile.education_level}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Location Information</h2>
            <p><strong>Province:</strong> {profile.province}</p>
            <p><strong>District:</strong> {profile.district}</p>
            <p><strong>Sector:</strong> {profile.sector}</p>
            <p><strong>Cell:</strong> {profile.cell}</p>
            <p><strong>Village:</strong> {profile.village}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Farm Information</h2>
            <p><strong>Farm Province:</strong> {profile.farm_province}</p>
            <p><strong>Farm District:</strong> {profile.farm_district}</p>
            <p><strong>Farm Sector:</strong> {profile.farm_sector}</p>
            <p><strong>Farm Cell:</strong> {profile.farm_cell}</p>
            <p><strong>Farm Village:</strong> {profile.farm_village}</p>
            <p><strong>Farm Age:</strong> {profile.farm_age} years</p>
            <p><strong>Planted:</strong> {profile.planted}</p>
            <p><strong>Avocado Type:</strong> {profile.avocado_type}</p>
            <p><strong>Mixed Percentage:</strong> {profile.mixed_percentage}</p>
            <p><strong>Farm Size:</strong> {profile.farm_size}</p>
            <p><strong>Tree Count:</strong> {profile.tree_count}</p>
            <p><strong>UPI Number:</strong> {profile.upi_number}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Assistance</h2>
            <p>{profile.assistance.join(', ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}