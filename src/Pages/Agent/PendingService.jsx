import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PendingService() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('https://applicanion-api.onrender.com/api/pending-requests', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPendingRequests(response.data);
      } catch (error) {
        setError(error.response.data.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Pending Service Requests</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="p-6 bg-white rounded-lg shadow-md">
          {pendingRequests.length > 0 ? (
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b">Farmer Name</th>
                  <th className="px-4 py-2 border-b">Email</th>
                  <th className="px-4 py-2 border-b">Phone Number</th>
                  <th className="px-4 py-2 border-b">Service Requested</th>
                  <th className="px-4 py-2 border-b">Request Date</th>
                  <th className="px-4 py-2 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border-b">{request.farmerName}</td>
                    <td className="px-4 py-2 border-b">{request.email}</td>
                    <td className="px-4 py-2 border-b">{request.phoneNumber}</td>
                    <td className="px-4 py-2 border-b">{request.serviceRequested}</td>
                    <td className="px-4 py-2 border-b">{new Date(request.requestDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2 border-b">{request.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No pending service requests available.</p>
          )}
        </div>
      )}
    </div>
  );
}