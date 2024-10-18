import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import Select from 'react-select';

export default function ShopView() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null); // To handle modal selection
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('https://api.example.com/shops');
        setShops(response.data);
      } catch (error) {
        console.error('Error fetching shops:', error);
        setError('There was an error fetching the shops!');
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const toggleSellingPermission = async (shopId, canSell) => {
    try {
      await axios.put(`https://api.example.com/shops/${shopId}`, { canSell });
      setShops(shops.map(shop => shop.id === shopId ? { ...shop, canSell } : shop));
    } catch (error) {
      console.error('Error updating selling permission:', error);
    }
  };

  const openModal = (shop) => {
    setSelectedShop(shop);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedShop(null);
  };

  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption ? selectedOption.value : '');
  };

  const filteredShops = selectedDistrict
    ? shops.filter(shop => shop.district === selectedDistrict)
    : shops;

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(shops);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Shops');
    XLSX.writeFile(workbook, 'ShopsData.xlsx');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Shops Management
            </h1>
            <div className="flex flex-col gap-2 mt-4 sm:flex-row sm:mt-0">
              <button
                onClick={() => alert('Add New Shop')}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                + Add New Shop
              </button>
              <button 
                onClick={exportToExcel}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Export to Excel
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
              <p className="text-sm text-gray-500">Total Shops</p>
              <p className="text-2xl font-bold text-gray-800">{shops.length}</p>
            </div>
            {/* Add more stats as needed */}
          </div>

          {/* Filter Section */}
          <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
              <label className="text-gray-600 whitespace-nowrap">Filter by District:</label>
              <div className="w-full md:w-64">
                <Select
                  options={shops.map(shop => ({
                    label: shop.district, 
                    value: shop.district
                  }))}
                  isClearable
                  onChange={handleDistrictChange}
                  placeholder="Select or search district"
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden bg-white shadow-lg rounded-xl">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              {loading ? (
                <div className="p-6 text-center">
                  <ClipLoader color="#3498db" loading={loading} size={50} />
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">{error}</div>
              ) : filteredShops.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Shop Name</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Owner</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Phone Number</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Can Sell</th>
                      <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredShops.map(shop => (
                      <tr key={shop.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                                {shop.name ? shop.name.charAt(0) : 'S'}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{shop.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{shop.owner}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{shop.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{shop.phoneNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{shop.canSell ? 'Yes' : 'No'}</div>
                        </td>
                        <td className="px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap">
                          <button
                            onClick={() => toggleSellingPermission(shop.id, !shop.canSell)}
                            className={`inline-flex items-center px-3 py-1 text-white transition-colors rounded-md ${shop.canSell ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                          >
                            {shop.canSell ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center">No shops found.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for viewing/editing shops */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="relative w-full max-w-xl p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-gray-700">Shop Details</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                &times;
              </button>
            </div>
            <div className="mt-4 overflow-y-auto max-h-96"> {/* Set fixed height and enable scrolling */}
              {selectedShop && (
                <div className="grid gap-4">
                  <p className="text-sm text-gray-500">Shop Name: {selectedShop.name}</p>
                  <p className="text-sm text-gray-500">Owner: {selectedShop.owner}</p>
                  <p className="text-sm text-gray-500">Email: {selectedShop.email}</p>
                  <p className="text-sm text-gray-500">Phone Number: {selectedShop.phoneNumber}</p>
                  <p className="text-sm text-gray-500">Can Sell: {selectedShop.canSell ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={closeModal}
                className="inline-flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}