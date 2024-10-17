import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../../components/Ui/Modal';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phonenumber: '',
    province: '',
    district: '',
    sector: ''
  });
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axios.get('https://pwallet-api.onrender.com/api/agents');
        setAgents(response.data);
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };

    fetchAgents();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://pwallet-api.onrender.com/api/agents/${id}`);
      setAgents(agents.filter(agent => agent.id !== id));
    } catch (error) {
      console.error('Error deleting agent:', error);
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
      const response = await axios.post('https://pwallet-api.onrender.com/api/auth/create-agent', formData);
      setResponseMessage('Agent created successfully');
      setAgents([...agents, response.data]);
      setFormData({
        fullname: '',
        email: '',
        phonenumber: '',
        province: '',
        district: '',
        sector: ''
      });
    } catch (error) {
      setResponseMessage('Error creating agent');
      console.error('Error creating agent:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Agents Management
            </h1>
            <button
              onClick={openModal}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              + Add New Agent
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
              <p className="text-sm text-gray-500">Total Agents</p>
              <p className="text-2xl font-bold text-gray-800">{agents.length}</p>
            </div>
            <div className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
              <p className="text-sm text-gray-500">Active Agents</p>
              <p className="text-2xl font-bold text-green-600">{agents.length}</p>
            </div>
            <div className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
              <p className="text-sm text-gray-500">Provinces Covered</p>
              <p className="text-2xl font-bold text-blue-600">
                {new Set(agents.map(a => a.province)).size}
              </p>
            </div>
            <div className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
              <p className="text-sm text-gray-500">Districts Covered</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(agents.map(a => a.district)).size}
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
                    <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Agent Details</th>
                    <th scope="col" className="hidden px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase md:table-cell">Contact</th>
                    <th scope="col" className="hidden px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase lg:table-cell">Location</th>
                    <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agents.map(agent => (
                    <tr key={agent.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                              {agent.fullname.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{agent.fullname}</div>
                            <div className="text-sm text-gray-500 md:hidden">{agent.email}</div>
                            <div className="text-sm text-gray-500 md:hidden">{agent.phonenumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-6 py-4 whitespace-nowrap md:table-cell">
                        <div className="text-sm text-gray-900">{agent.email}</div>
                        <div className="text-sm text-gray-500">{agent.phonenumber}</div>
                      </td>
                      <td className="hidden px-6 py-4 whitespace-nowrap lg:table-cell">
                        <div className="text-sm text-gray-900">{agent.province}</div>
                        <div className="text-sm text-gray-500">{agent.district}, {agent.sector}</div>
                      </td>
                      <td className="px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap">
                        <button className="inline-flex items-center px-3 py-1 text-blue-600 transition-colors bg-blue-100 rounded-md hover:bg-blue-200">
                          View
                        </button>
                        <button className="inline-flex items-center px-3 py-1 transition-colors rounded-md bg-amber-100 text-amber-600 hover:bg-amber-200">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(agent.id)}
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

              <h2 className="mb-6 text-2xl font-bold text-gray-800">Create New Agent</h2>

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
                        className="w-full px-4 py-2 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Create Agent
                  </button>
                </div>
              </form>

              {responseMessage && (
                <div className={`mt-4 p-4 rounded-lg ${
                  responseMessage.includes('success')
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {responseMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}