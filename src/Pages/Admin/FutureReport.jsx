import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../../components/Ui/Modal';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    reporter: '',
  });
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('https://pwallet-api.onrender.com/api/reports');
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://pwallet-api.onrender.com/api/reports/${id}`);
      setReports(reports.filter(report => report.id !== id));
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setResponseMessage('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://pwallet-api.onrender.com/api/reports', formData);
      setResponseMessage('Report submitted successfully');
      setReports([...reports, response.data]);
      setFormData({
        title: '',
        description: '',
        date: '',
        reporter: '',
      });
    } catch (error) {
      setResponseMessage('Error submitting report');
      console.error('Error submitting report:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Reports Management
            </h1>
            <button
              onClick={openModal}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              + Add New Report
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
              <p className="text-sm text-gray-500">Total Reports</p>
              <p className="text-2xl font-bold text-gray-800">{reports.length}</p>
            </div>
            <div className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
              <p className="text-sm text-gray-500">Reports This Month</p>
              <p className="text-2xl font-bold text-green-600">{reports.length}</p>
            </div>
            <div className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
              <p className="text-sm text-gray-500">Reported By</p>
              <p className="text-2xl font-bold text-blue-600">
                {new Set(reports.map(r => r.reporter)).size}
              </p>
            </div>
            <div className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
              <p className="text-sm text-gray-500">Dates Reported</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(reports.map(r => r.date)).size}
              </p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden bg-white shadow-lg rounded-xl">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Report Details</th>
                    <th scope="col" className="hidden px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase md:table-cell">Reporter</th>
                    <th scope="col" className="hidden px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase lg:table-cell">Date</th>
                    <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map(report => (
                    <tr key={report.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{report.title}</div>
                        <div className="text-sm text-gray-500 md:hidden">{report.description}</div>
                      </td>
                      <td className="hidden px-6 py-4 whitespace-nowrap md:table-cell">
                        <div className="text-sm text-gray-900">{report.reporter}</div>
                      </td>
                      <td className="hidden px-6 py-4 whitespace-nowrap lg:table-cell">
                        <div className="text-sm text-gray-900">{report.date}</div>
                      </td>
                      <td className="px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap">
                        <button className="inline-flex items-center px-3 py-1 text-blue-600 transition-colors bg-blue-100 rounded-md hover:bg-blue-200">
                          View
                        </button>
                        <button className="inline-flex items-center px-3 py-1 transition-colors rounded-md bg-amber-100 text-amber-600 hover:bg-amber-200">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="inline-flex items-center px-3 py-1 text-red-600 transition-colors bg-red-100 rounded-md hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
            <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={closeModal}></div>
            <div className="relative w-full max-w-lg p-6 mx-auto bg-white shadow-2xl rounded-xl sm:p-8">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <h2 className="mb-6 text-2xl font-bold text-gray-800">Submit New Report</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key} className="col-span-1">
                      <label className="block mb-1 text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type={key === 'email' ? 'email' : 'text'}
                        name={key}
                        value={value}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl focus:outline-none"
                  >
                    Submit
                  </button>
                </div>

                {responseMessage && (
                  <div className="pt-4 text-center text-green-600">
                    {responseMessage}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
