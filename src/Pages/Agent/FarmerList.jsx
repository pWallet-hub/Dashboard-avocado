import { useEffect, useState } from 'react';
import { User, Phone, Mail, MapPin, TreePine, Calendar, Search, Filter, Download, Plus, Eye, X, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { listFarmers, createFarmer } from '../../services/usersService';
import { getAgentInformation } from '../../services/agent-information';


export default function FarmerList() {
  const [farmers, setFarmers] = useState([]);
  const [allFarmers, setAllFarmers] = useState([]); // Store all farmers from API
  const [agentTerritories, setAgentTerritories] = useState([]); // Store agent's territories
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [newFarmer, setNewFarmer] = useState({
    full_name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Male',
    marital_status: 'Single',
    education_level: 'Secondary',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    farm_province: '',
    farm_district: '',
    farm_sector: '',
    farm_cell: '',
    farm_village: '',
    farm_age: '',
    planted: '',
    avocado_type: '',
    mixed_percentage: '',
    farm_size: '',
    tree_count: '',
    upi_number: '',
    assistance: ''
  });

  // Mock data for demonstration
  const mockFarmers = [
    {
      id: 1,
      full_name: "Jean Baptiste Uwimana",
      email: "jean.uwimana@email.com",
      telephone: "+250788123456",
      province: "Kigali",
      district: "Gasabo",
      sector: "Remera",
      farm_province: "Kigali",
      farm_district: "Gasabo",
      farm_sector: "Remera",
      farm_cell: "Rukiri",
      farm_village: "Karama",
      farm_age: 5,
      planted: "2019-03-15",
      avocado_type: "Hass",
      mixed_percentage: "80%",
      farm_size: "2.5 hectares",
      tree_count: 150,
      upi_number: "UPI001234567",
      assistance: ["Training", "Equipment", "Fertilizer"]
    },
    {
      id: 2,
      full_name: "Marie Claire Mukamana",
      email: "marie.mukamana@email.com",
      telephone: "+250788765432",
      province: "Northern",
      district: "Musanze",
      sector: "Cyuve",
      farm_province: "Northern",
      farm_district: "Musanze",
      farm_sector: "Cyuve",
      farm_cell: "Rugengabari",
      farm_village: "Nyange",
      farm_age: 3,
      planted: "2021-06-20",
      avocado_type: "Fuerte",
      mixed_percentage: "60%",
      farm_size: "1.8 hectares",
      tree_count: 95,
      upi_number: "UPI002345678",
      assistance: ["Seeds", "Training"]
    },
    {
      id: 3,
      full_name: "Paul Nzeyimana",
      email: "paul.nzeyimana@email.com",
      telephone: "+250788654321",
      province: "Eastern",
      district: "Nyagatare",
      sector: "Karangazi",
      farm_province: "Eastern",
      farm_district: "Nyagatare",
      farm_sector: "Karangazi",
      farm_cell: "Nyagihanga",
      farm_village: "Rugarama",
      farm_age: 7,
      planted: "2017-01-10",
      avocado_type: "Mixed",
      mixed_percentage: "45%",
      farm_size: "3.2 hectares",
      tree_count: 200,
      upi_number: "UPI003456789",
      assistance: ["Equipment", "Fertilizer", "Pesticides"]
    }
  ];

  // Fetch agent's territory information on mount
  useEffect(() => {
    const fetchAgentTerritory = async () => {
      try {
        const agentData = await getAgentInformation();
        
        // Extract territories from agent profile
        if (agentData?.agent_profile?.territory && Array.isArray(agentData.agent_profile.territory)) {
          setAgentTerritories(agentData.agent_profile.territory);
          console.log('Agent territories loaded:', agentData.agent_profile.territory);
        } else {
          console.warn('No territories found for agent');
          setAgentTerritories([]);
        }
      } catch (err) {
        console.error('Error fetching agent territory:', err);
        // If we can't fetch agent territory, show all farmers (fallback)
        setAgentTerritories([]);
      }
    };

    fetchAgentTerritory();
  }, []);

  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true);
      setError(null);
      try {
        const options = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          search: searchTerm || undefined,
          status: filterBy !== 'all' ? filterBy : undefined
        };
        
        const response = await listFarmers(options);
        
        if (response.data && Array.isArray(response.data)) {
          // Store all farmers from API
          setAllFarmers(response.data);
          
          // Filter farmers based on agent's territory
          const filteredByTerritory = filterFarmersByTerritory(response.data, agentTerritories);
          setFarmers(filteredByTerritory);
          
          console.log('Total farmers from API:', response.data.length);
          console.log('Farmers in agent territory:', filteredByTerritory.length);
        } else {
          setAllFarmers([]);
          setFarmers([]);
        }
        
        // Handle pagination from meta.pagination
        if (response.meta?.pagination) {
          setPagination({
            currentPage: response.meta.pagination.page,
            totalPages: response.meta.pagination.totalPages,
            totalItems: response.meta.pagination.total,
            itemsPerPage: response.meta.pagination.limit
          });
        }
      } catch (err) {
        console.error('Error fetching farmers:', err);
        setError(err.message || 'Failed to load farmers');
        setAllFarmers([]);
        setFarmers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, [pagination.currentPage, pagination.itemsPerPage, searchTerm, filterBy, agentTerritories]);

  // Filter farmers based on agent's territory (district and sector match)
  const filterFarmersByTerritory = (farmersList, territories) => {
    // If no territories defined, show all farmers (for admin or when territory not loaded)
    if (!territories || territories.length === 0) {
      return farmersList;
    }

    return farmersList.filter(farmer => {
      // Check if farmer's location matches any of the agent's territories
      const farmerDistrict = farmer.profile?.district;
      const farmerSector = farmer.profile?.sector;

      // Skip farmers without location data
      if (!farmerDistrict || !farmerSector) {
        return false;
      }

      // Check if farmer's district and sector match any agent territory
      return territories.some(territory => {
        const districtMatch = territory.district?.toLowerCase() === farmerDistrict.toLowerCase();
        const sectorMatch = territory.sector?.toLowerCase() === farmerSector.toLowerCase();
        
        return districtMatch && sectorMatch;
      });
    });
  };

  // Remove Airtable preview effect as services are no longer available

  const exportToExcel = () => {
    // Prepare data for Excel export
    const exportData = filteredFarmers.map(farmer => ({
      'ID': farmer.id,
      'Full Name': farmer.full_name,
      'Email': farmer.email,
      'Telephone': farmer.telephone,
      'UPI Number': farmer.upi_number,
      'Province': farmer.province,
      'District': farmer.district,
      'Sector': farmer.sector,
      'Farm Province': farmer.farm_province,
      'Farm District': farmer.farm_district,
      'Farm Sector': farmer.farm_sector,
      'Farm Cell': farmer.farm_cell,
      'Farm Village': farmer.farm_village,
      'Farm Size': farmer.farm_size,
      'Tree Count': farmer.tree_count,
      'Avocado Type': farmer.avocado_type,
      'Mixed Percentage': farmer.mixed_percentage,
      'Farm Age (Years)': farmer.farm_age,
      'Date Planted': farmer.planted,
      'Assistance Provided': farmer.assistance.join(', ')
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns
    const colWidths = [];
    const keys = Object.keys(exportData[0] || {});
    keys.forEach((key, index) => {
      const maxLength = Math.max(
        key.length,
        ...exportData.map(row => String(row[key] || '').length)
      );
      colWidths.push({ width: Math.min(maxLength + 2, 50) });
    });
    ws['!cols'] = colWidths;

    // Add styling to header row
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1F310A" } },
      alignment: { horizontal: "center", vertical: "center" }
    };

    // Apply header styling
    keys.forEach((key, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      if (ws[cellAddress]) {
        ws[cellAddress].s = headerStyle;
      }
    });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Farmers List');

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `farmers_list_${currentDate}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  const openModal = (farmer) => {
    setSelectedFarmer(farmer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFarmer(null);
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewFarmer({
      full_name: '',
      email: '',
      phone: '',
      age: '',
      gender: 'Male',
      marital_status: 'Single',
      education_level: 'Secondary',
      province: '',
      district: '',
      sector: '',
      cell: '',
      village: '',
      farm_province: '',
      farm_district: '',
      farm_sector: '',
      farm_cell: '',
      farm_village: '',
      farm_age: '',
      planted: '',
      avocado_type: '',
      mixed_percentage: '',
      farm_size: '',
      tree_count: '',
      upi_number: '',
      assistance: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFarmer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addFarmer = async () => {
    if (!newFarmer.full_name || !newFarmer.email || !newFarmer.gender) {
      alert('Please fill in all required fields (Name, Email, Gender)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare farmer data for API
      const farmerData = {
        full_name: newFarmer.full_name,
        email: newFarmer.email,
        phone: newFarmer.phone || undefined,
        age: newFarmer.age ? parseInt(newFarmer.age) : undefined,
        gender: newFarmer.gender,
        marital_status: newFarmer.marital_status || undefined,
        education_level: newFarmer.education_level || undefined,
        province: newFarmer.province || undefined,
        district: newFarmer.district || undefined,
        sector: newFarmer.sector || undefined,
        cell: newFarmer.cell || undefined,
        village: newFarmer.village || undefined,
        farm_province: newFarmer.farm_province || undefined,
        farm_district: newFarmer.farm_district || undefined,
        farm_sector: newFarmer.farm_sector || undefined,
        farm_cell: newFarmer.farm_cell || undefined,
        farm_village: newFarmer.farm_village || undefined,
        farm_age: newFarmer.farm_age ? parseInt(newFarmer.farm_age) : undefined,
        planted: newFarmer.planted || undefined,
        avocado_type: newFarmer.avocado_type || undefined,
        mixed_percentage: newFarmer.mixed_percentage ? parseInt(newFarmer.mixed_percentage) : undefined,
        farm_size: newFarmer.farm_size ? parseFloat(newFarmer.farm_size) : undefined,
        tree_count: newFarmer.tree_count ? parseInt(newFarmer.tree_count) : undefined,
        upi_number: newFarmer.upi_number || undefined,
        assistance: newFarmer.assistance || undefined
      };

      // Remove undefined values
      Object.keys(farmerData).forEach(key => 
        farmerData[key] === undefined && delete farmerData[key]
      );

      const response = await createFarmer(farmerData);
      
      if (response.data) {
        alert(`Farmer created successfully! Default password: ${response.data.default_password || 'FarmerPass123!'}`);
        closeAddModal();
        
        // Refresh the farmers list
        const refreshOptions = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          search: searchTerm || undefined,
          status: filterBy !== 'all' ? filterBy : undefined
        };
        const refreshResponse = await listFarmers(refreshOptions);
        if (refreshResponse.data) {
          setAllFarmers(refreshResponse.data);
          const filteredByTerritory = filterFarmersByTerritory(refreshResponse.data, agentTerritories);
          setFarmers(filteredByTerritory);
        }
        if (refreshResponse.meta?.pagination) {
          setPagination({
            currentPage: refreshResponse.meta.pagination.page,
            totalPages: refreshResponse.meta.pagination.totalPages,
            totalItems: refreshResponse.meta.pagination.total,
            itemsPerPage: refreshResponse.meta.pagination.limit
          });
        }
      }
    } catch (err) {
      console.error('Error adding farmer:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add farmer';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Since filtering is done server-side, just use farmers directly
  const filteredFarmers = farmers;

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on search
  };

  const handleFilterChange = (e) => {
    setFilterBy(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on filter
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-800 via-green-700 to-green-600">
                Farmer Management
              </h1>
              <p className="text-gray-600">Manage and track your registered farmers</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                style={{ background: '#1F310A' }}
                onMouseEnter={(e) => e.target.style.background = '#2A4A0D'}
                onMouseLeave={(e) => e.target.style.background = '#1F310A'}
              >
                <Plus size={20} />
                Add Farmer
              </button>
              <button 
                onClick={exportToExcel}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 hover:from-green-700 hover:to-emerald-700"
                disabled={filteredFarmers.length === 0}
              >
                <Download size={20} />
                Export to Excel
              </button>
            </div>
          </div>
        </div>

        {/* Territory Filter Info */}
        {agentTerritories.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  Showing farmers in your assigned territories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {agentTerritories.map((territory, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                    >
                      {territory.district} - {territory.sector}
                      {territory.isPrimary && (
                        <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-[10px]">
                          Primary
                        </span>
                      )}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  {farmers.length} of {allFarmers.length} total farmers match your territory
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {agentTerritories.length > 0 ? 'Farmers in Territory' : 'Total Farmers'}
                </p>
                <p className="text-3xl font-bold text-gray-800">{farmers.length}</p>
                {agentTerritories.length > 0 && allFarmers.length > farmers.length && (
                  <p className="text-xs text-gray-500 mt-1">of {allFarmers.length} total</p>
                )}
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: '#1F310A20' }}>
                <User className="w-8 h-8" style={{ color: '#1F310A' }} />
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Trees</p>
                <p className="text-3xl font-bold text-gray-800">
                  {farmers.reduce((sum, f) => sum + (f.profile?.farm_details?.tree_count || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TreePine className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Current Page</p>
                <p className="text-3xl font-bold text-gray-800">{pagination.currentPage}/{pagination.totalPages}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Farm Area</p>
                <p className="text-3xl font-bold text-gray-800">
                  {farmers.length > 0 
                    ? (farmers.reduce((sum, f) => sum + (parseFloat(f.profile?.farm_details?.farm_size) || 0), 0)).toFixed(1)
                    : '0'}ha
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search farmers by name or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{ '--tw-ring-color': '#1F310A' }}
                onFocus={(e) => e.target.style.borderColor = '#1F310A'}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={filterBy}
                onChange={handleFilterChange}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{ '--tw-ring-color': '#1F310A' }}
                onFocus={(e) => e.target.style.borderColor = '#1F310A'}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Export Info */}
        {filteredFarmers.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Download size={16} />
              <span className="text-sm">
                Ready to export {filteredFarmers.length} farmer{filteredFarmers.length !== 1 ? 's' : ''} to Excel
              </span>
            </div>
          </div>
        )}

        {/* Modern Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#1F310A' }}></div>
                <p className="mt-4 text-gray-600">Loading farmers...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            ) : filteredFarmers.length > 0 ? (
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Farmer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Farm Info</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredFarmers.map((farmer, index) => (
                    <tr key={farmer.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-12 h-12">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg" style={{ background: '#1F310A' }}>
                              {farmer.full_name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{farmer.full_name}</div>
                            <div className="text-sm text-gray-500">ID: {farmer.profile?.farm_details?.upi_number || farmer.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {farmer.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {farmer.phone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">{farmer.profile?.province || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{farmer.profile?.district || 'N/A'}, {farmer.profile?.sector || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {farmer.profile?.farm_details?.farm_size ? `${farmer.profile.farm_details.farm_size} ha` : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {farmer.profile?.farm_details?.tree_count || 0} trees • {farmer.profile?.farm_details?.avocado_type || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openModal(farmer)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                          style={{ background: '#1F310A' }}
                          onMouseEnter={(e) => e.target.style.background = '#2A4A0D'}
                          onMouseLeave={(e) => e.target.style.background = '#1F310A'}
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">No farmers found matching your criteria.</p>
                <p className="text-sm text-gray-500 mt-2">
                  {searchTerm || filterBy !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No farmers have been added yet. Click "Add New Farmer" to create one.'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                </span> of{' '}
                <span className="font-medium">{pagination.totalItems}</span> farmers
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        page === pagination.currentPage
                          ? 'text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      style={{
                        background: page === pagination.currentPage ? '#1F310A' : 'white',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modal */}
      {isModalOpen && selectedFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 text-white" style={{ background: '#1F310A' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Farmer Details</h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" style={{ color: '#1F310A' }} />
                      Personal Information
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Full Name:</span>
                        <span className="text-gray-900">{selectedFarmer.full_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Email:</span>
                        <span className="text-gray-900">{selectedFarmer.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Phone:</span>
                        <span className="text-gray-900">{selectedFarmer.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">UPI Number:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.farm_details?.upi_number || selectedFarmer.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Age:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.age || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Gender:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.gender || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          selectedFarmer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedFarmer.status || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      Location
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Province:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.province || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">District:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.district || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Sector:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.sector || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Cell:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.cell || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Village:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.village || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Farm Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <TreePine className="w-5 h-5" style={{ color: '#1F310A' }} />
                      Farm Information
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Farm Size:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.farm_details?.farm_size ? `${selectedFarmer.profile.farm_details.farm_size} ha` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Tree Count:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.farm_details?.tree_count || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Avocado Type:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.farm_details?.avocado_type || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Mixed %:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.farm_details?.mixed_percentage ? `${selectedFarmer.profile.farm_details.mixed_percentage}%` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Farm Age:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.farm_details?.farm_age ? `${selectedFarmer.profile.farm_details.farm_age} years` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Planted:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.farm_details?.planted || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Farm Location */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" style={{ color: '#1F310A' }} />
                      Farm Location
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Province:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.farm_details?.farm_location?.province || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">District:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.farm_details?.farm_location?.district || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Sector:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.farm_details?.farm_location?.sector || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Cell:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.farm_details?.farm_location?.cell || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Village:</span>
                        <span className="text-gray-900">{selectedFarmer.profile?.farm_details?.farm_location?.village || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assistance Section */}
              {selectedFarmer.profile?.farm_details?.assistance && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Assistance Provided</h3>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ background: '#1F310A' }}
                    >
                      {selectedFarmer.profile.farm_details.assistance}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 text-white rounded-lg transition-colors duration-200"
                style={{ background: '#1F310A' }}
                onMouseEnter={(e) => e.target.style.background = '#2A4A0D'}
                onMouseLeave={(e) => e.target.style.background = '#1F310A'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Farmer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 text-white" style={{ background: '#1F310A' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Add New Farmer</h2>
                <button
                  onClick={closeAddModal}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" style={{ color: '#1F310A' }} />
                      Personal Information
                    </h3>
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={newFarmer.full_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={{ '--tw-ring-color': '#1F310A' }}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={newFarmer.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={{ '--tw-ring-color': '#1F310A' }}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="telephone"
                          value={newFarmer.telephone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={{ '--tw-ring-color': '#1F310A' }}
                          placeholder="+250788123456"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      Personal Location
                    </h3>
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                        <select
                          name="province"
                          value={newFarmer.province}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={{ '--tw-ring-color': '#1F310A' }}
                        >
                          <option value="">Select Province</option>
                          <option value="Kigali">Kigali</option>
                          <option value="Northern">Northern</option>
                          <option value="Southern">Southern</option>
                          <option value="Eastern">Eastern</option>
                          <option value="Western">Western</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                        <input
                          type="text"
                          name="district"
                          value={newFarmer.district}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={{ '--tw-ring-color': '#1F310A' }}
                          placeholder="Enter district"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
                        <input
                          type="text"
                          name="sector"
                          value={newFarmer.sector}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={{ '--tw-ring-color': '#1F310A' }}
                          placeholder="Enter sector"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Farm Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <TreePine className="w-5 h-5" style={{ color: '#1F310A' }} />
                      Farm Information
                    </h3>
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Farm Size</label>
                        <input
                          type="text"
                          name="farm_size"
                          value={newFarmer.farm_size}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={{ '--tw-ring-color': '#1F310A' }}
                          placeholder="2.5 hectares"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tree Count</label>
                        <input
                          type="number"
                          name="tree_count"
                          value={newFarmer.tree_count}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={{ '--tw-ring-color': '#1F310A' }}
                          placeholder="150"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Avocado Type</label>
                        <select
                          name="avocado_type"
                          value={newFarmer.avocado_type}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={{ '--tw-ring-color': '#1F310A' }}
                        >
                          <option value="">Select Type</option>
                          <option value="Hass">Hass</option>
                          <option value="Fuerte">Fuerte</option>
                          <option value="Mixed">Mixed</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mixed Percentage</label>
                        <input
                          type="text"
                          name="mixed_percentage"
                          value={newFarmer.mixed_percentage}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={{ '--tw-ring-color': '#1F310A' }}
                          placeholder="80%"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Farm Age (years)</label>
                        <input
                          type="number"
                          name="farm_age"
                          value={newFarmer.farm_age}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={{ '--tw-ring-color': '#1F310A' }}
                          placeholder="5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Planted</label>
                        <input
                          type="date"
                          name="planted"
                          value={newFarmer.planted}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={{ '--tw-ring-color': '#1F310A' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Farm Location */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" style={{ color: '#1F310A' }} />
                      Farm Location
                    </h3>
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Farm Province</label>
                        <select
                          name="farm_province"
                          value={newFarmer.farm_province}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={{ '--tw-ring-color': '#1F310A' }}
                        >
                          <option value="">Select Province</option>
                          <option value="Kigali">Kigali</option>
                          <option value="Northern">Northern</option>
                          <option value="Southern">Southern</option>
                          <option value="Eastern">Eastern</option>
                          <option value="Western">Western</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Farm District</label>
                        <input
                          type="text"
                          name="farm_district"
                          value={newFarmer.farm_district}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={{ '--tw-ring-color': '#1F310A' }}
                          placeholder="Enter district"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Farm Sector</label>
                        <input
                          type="text"
                          name="farm_sector"
                          value={newFarmer.farm_sector}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={{ '--tw-ring-color': '#1F310A' }}
                          placeholder="Enter sector"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Farm Cell</label>
                        <input
                          type="text"
                          name="farm_cell"
                          value={newFarmer.farm_cell}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={{ '--tw-ring-color': '#1F310A' }}
                          placeholder="Enter cell"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Farm Village</label>
                        <input
                          type="text"
                          name="farm_village"
                          value={newFarmer.farm_village}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200"
                          style={{ '--tw-ring-color': '#1F310A' }}
                          placeholder="Enter village"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assistance Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Assistance Needed</h3>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex flex-wrap gap-3">
                    {['Training', 'Equipment', 'Fertilizer', 'Seeds', 'Pesticides', 'Financial Support'].map((assistance) => (
                      <label key={assistance} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newFarmer.assistance.includes(assistance)}
                          onChange={() => handleAssistanceChange(assistance)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{assistance}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeAddModal}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={addFarmer}
                className="px-6 py-2 text-white rounded-lg transition-colors duration-200"
                style={{ background: '#1F310A' }}
                onMouseEnter={(e) => e.target.style.background = '#2A4A0D'}
                onMouseLeave={(e) => e.target.style.background = '#1F310A'}
              >
                Add Farmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}