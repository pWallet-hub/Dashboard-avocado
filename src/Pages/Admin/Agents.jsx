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

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setResponseMessage('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
    <div className="container p-4 mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Agents</h1>
        <button
          className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
          onClick={openModal}
        >
          Create Agent
        </button>
      </div>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">Full Name</th>
            <th className="px-4 py-2 border-b">Email</th>
            <th className="px-4 py-2 border-b">Phone Number</th>
            <th className="px-4 py-2 border-b">Province</th>
            <th className="px-4 py-2 border-b">District</th>
            <th className="px-4 py-2 border-b">Sector</th>
            <th className="px-4 py-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {agents.map(agent => (
            <tr key={agent.id} className="hover:bg-gray-100">
              <td className="px-4 py-2 border-b">{agent.fullname}</td>
              <td className="px-4 py-2 border-b">{agent.email}</td>
              <td className="px-4 py-2 border-b">{agent.phonenumber}</td>
              <td className="px-4 py-2 border-b">{agent.province}</td>
              <td className="px-4 py-2 border-b">{agent.district}</td>
              <td className="px-4 py-2 border-b">{agent.sector}</td>
              <td className="px-4 py-2 border-b">
                <button className="px-2 py-1 mr-2 text-white bg-blue-500 rounded hover:bg-blue-600">View</button>
                <button className="px-2 py-1 mr-2 text-white bg-yellow-500 rounded hover:bg-yellow-600">Edit</button>
                <button
                  className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                  onClick={() => handleDelete(agent.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-1/3 p-6 bg-white rounded shadow-lg">
            <button className="absolute top-0 right-0 mt-2 mr-2 text-gray-500 hover:text-gray-700" onClick={closeModal}>
              &times;
            </button>
            <h2 className="mb-4 text-xl font-bold">Create New Agent</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700">Phone Number</label>
                <input
                  type="text"
                  name="phonenumber"
                  value={formData.phonenumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700">Province</label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700">District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700">Sector</label>
                <input
                  type="text"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
              >
                Submit
              </button>
            </form>
            {responseMessage && <p className="mt-4 text-center">{responseMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
}