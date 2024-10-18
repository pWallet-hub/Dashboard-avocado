import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

export default function Report() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [reports, setReports] = useState([]);
  const [fetchingReports, setFetchingReports] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setFetchingReports(true);
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('https://applicanion-api.onrender.com/api/reports', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setFetchingReports(false);
      }
    };

    fetchReports();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('https://applicanion-api.onrender.com/api/reports', {
        title,
        description
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess('Report sent successfully!');
      setTitle('');
      setDescription('');
      setReports([...reports, response.data]);
    } catch (error) {
      setError('There was an error sending the report!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600">
            Create and Send Report
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Use the form below to create and send a report. You can also view the reports you have sent.
          </p>
        </div>

        {/* Form Section */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-bold">New Report</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block mb-2 text-sm font-bold text-gray-700">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block mb-2 text-sm font-bold text-gray-700">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <button
                type="submit"
                className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Report'}
              </button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
          </form>
        </div>

        {/* Reports Section */}
        <div className="overflow-hidden bg-white shadow-lg rounded-xl">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              {fetchingReports ? (
                <div className="p-6 text-center">
                  <ClipLoader color="#3498db" loading={fetchingReports} size={50} />
                </div>
              ) : reports.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{report.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{report.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(report.createdAt).toLocaleDateString()}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center">No reports available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}