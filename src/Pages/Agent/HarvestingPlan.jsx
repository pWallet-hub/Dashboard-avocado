import React, { useState, useEffect } from "react";
import { Search, Calendar, TrendingUp, Maximize2, Users, Package, Truck, Warehouse, Award, Target, Mail, Phone, MapPin } from "lucide-react";
import "../../Pages/Styles/HarvestingDay.css";
import { createHarvestRequest } from '../../services/serviceRequestsService';
import { listFarmers } from '../../services/usersService';
import { getAgentInformation } from '../../services/agent-information';

export default function AgentScheduleHarvestingPlan() {
  const [currentStep, setCurrentStep] = useState(1); // 1: Select Farmer, 2: Fill Form
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentInfo, setAgentInfo] = useState(null);
  const [agentTerritories, setAgentTerritories] = useState([]); // Agent's assigned territories
  
  // Location filters
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCell, setSelectedCell] = useState('');
  
  const [formData, setFormData] = useState({
    workersNeeded: 1,
    equipmentNeeded: [],
    transportationNeeded: "",
    harvestDateFrom: "",
    harvestDateTo: "",
    harvestImages: []
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);

  const equipmentOptions = [
    "Harvest Clipper",
    "Picking Poles",
    "plastic crates"
  ];

  // Filter farmers based on agent's territory (district and sector match)
  const filterFarmersByTerritory = (farmersList, territories) => {
    // If no territories defined, show all farmers (fallback for admin or when territory not loaded)
    if (!territories || territories.length === 0) {
      console.warn('No agent territories found - showing all farmers');
      return farmersList;
    }

    const filtered = farmersList.filter(farmer => {
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

    console.log(`Territory filtering: ${farmersList.length} total farmers → ${filtered.length} in agent's territories`);
    return filtered;
  };

  // Fetch agent information and territories
  useEffect(() => {
    const fetchAgentInfo = async () => {
      try {
        const data = await getAgentInformation();
        setAgentInfo(data);
        
        // Extract territories from agent profile
        if (data?.agent_profile?.territory && Array.isArray(data.agent_profile.territory)) {
          setAgentTerritories(data.agent_profile.territory);
          console.log('Agent territories loaded:', data.agent_profile.territory);
        } else {
          console.warn('No territories found in agent profile');
          setAgentTerritories([]);
        }
      } catch (error) {
        console.error('Error fetching agent info:', error);
        setAgentTerritories([]); // Fallback to empty array
      }
    };
    fetchAgentInfo();
  }, []);

  // Fetch farmers when component mounts and apply territory filtering
  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true);
      try {
        const response = await listFarmers({ limit: 100 });
        const farmersList = response.data || [];
        
        // Apply territory filtering to show only farmers in agent's assigned territories
        const territoryFilteredFarmers = filterFarmersByTerritory(farmersList, agentTerritories);
        
        setFarmers(territoryFilteredFarmers);
        setFilteredFarmers(territoryFilteredFarmers);
        
        console.log('Farmers loaded and filtered by territory:', territoryFilteredFarmers.length);
      } catch (error) {
        console.error('Error fetching farmers:', error);
        setFarmers([]);
        setFilteredFarmers([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch farmers after agent info is loaded (whether or not territories exist)
    if (agentInfo !== null) {
      fetchFarmers();
    }
  }, [agentInfo, agentTerritories]);

  // Filter farmers based on search and location filters
  useEffect(() => {
    let filtered = farmers;

    // Apply location filters
    if (selectedDistrict) {
      filtered = filtered.filter(farmer => 
        (farmer.profile?.district || farmer.district)?.toLowerCase() === selectedDistrict.toLowerCase()
      );
    }

    if (selectedSector) {
      filtered = filtered.filter(farmer => 
        (farmer.profile?.sector || farmer.sector)?.toLowerCase() === selectedSector.toLowerCase()
      );
    }

    if (selectedCell) {
      filtered = filtered.filter(farmer => 
        (farmer.profile?.cell || farmer.cell)?.toLowerCase() === selectedCell.toLowerCase()
      );
    }

    // Apply search term filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(farmer => 
        farmer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.phone?.includes(searchTerm)
      );
    }

    setFilteredFarmers(filtered);
  }, [searchTerm, selectedDistrict, selectedSector, selectedCell, farmers]);

  // Get unique districts, sectors, and cells from farmers list
  const getUniqueDistricts = () => {
    const districts = farmers
      .map(f => f.profile?.district || f.district)
      .filter(d => d && d.trim() !== '');
    return [...new Set(districts)].sort();
  };

  const getUniqueSectors = () => {
    let sectors = farmers;
    
    // Filter by selected district first
    if (selectedDistrict) {
      sectors = farmers.filter(f => 
        (f.profile?.district || f.district)?.toLowerCase() === selectedDistrict.toLowerCase()
      );
    }
    
    const sectorList = sectors
      .map(f => f.profile?.sector || f.sector)
      .filter(s => s && s.trim() !== '');
    return [...new Set(sectorList)].sort();
  };

  const getUniqueCells = () => {
    let cells = farmers;
    
    // Filter by selected district and sector
    if (selectedDistrict) {
      cells = cells.filter(f => 
        (f.profile?.district || f.district)?.toLowerCase() === selectedDistrict.toLowerCase()
      );
    }
    
    if (selectedSector) {
      cells = cells.filter(f => 
        (f.profile?.sector || f.sector)?.toLowerCase() === selectedSector.toLowerCase()
      );
    }
    
    const cellList = cells
      .map(f => f.profile?.cell || f.cell)
      .filter(c => c && c.trim() !== '');
    return [...new Set(cellList)].sort();
  };

  // Reset dependent filters when parent filter changes
  useEffect(() => {
    if (selectedDistrict) {
      // Check if current sector still valid for selected district
      const validSectors = getUniqueSectors();
      if (selectedSector && !validSectors.some(s => s.toLowerCase() === selectedSector.toLowerCase())) {
        setSelectedSector('');
        setSelectedCell('');
      }
    } else {
      setSelectedSector('');
      setSelectedCell('');
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedSector) {
      // Check if current cell still valid for selected sector
      const validCells = getUniqueCells();
      if (selectedCell && !validCells.some(c => c.toLowerCase() === selectedCell.toLowerCase())) {
        setSelectedCell('');
      }
    } else {
      setSelectedCell('');
    }
  }, [selectedSector]);

  const handleFarmerSelect = (farmer) => {
    setSelectedFarmer(farmer);
    setCurrentStep(2);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleDateChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    
    if (newFormData.harvestDateFrom && newFormData.harvestDateTo) {
      const fromDate = new Date(newFormData.harvestDateFrom);
      const toDate = new Date(newFormData.harvestDateTo);
      const diffTime = Math.abs(toDate - fromDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 5) {
        setErrors(prev => ({
          ...prev,
          harvestDateRange: "Date range cannot exceed 5 days"
        }));
        return;
      } else if (toDate < fromDate) {
        setErrors(prev => ({
          ...prev,
          harvestDateRange: "End date must be after start date"
        }));
        return;
      } else {
        setErrors(prev => ({
          ...prev,
          harvestDateRange: ""
        }));
      }
    }
    
    handleInputChange(field, value);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      harvestImages: [...prev.harvestImages, ...files]
    }));
  };

  const handleEquipmentChange = (equipment, checked) => {
    const currentEquipment = formData.equipmentNeeded;
    const updatedEquipment = checked
      ? [...currentEquipment, equipment]
      : currentEquipment.filter(item => item !== equipment);
    handleInputChange("equipmentNeeded", updatedEquipment);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.workersNeeded || formData.workersNeeded < 1) {
      newErrors.workersNeeded = "Please specify at least 1 worker";
    }
    
    if (!formData.transportationNeeded.trim()) {
      newErrors.transportationNeeded = "Please specify number of trees";
    }
    
    if (!formData.harvestDateFrom) {
      newErrors.harvestDateFrom = "Please select harvest start date";
    }
    
    if (!formData.harvestDateTo) {
      newErrors.harvestDateTo = "Please select harvest end date";
    }
    
    // Additional date validation
    if (formData.harvestDateFrom && formData.harvestDateTo) {
      const fromDate = new Date(formData.harvestDateFrom);
      const toDate = new Date(formData.harvestDateTo);
      const diffTime = Math.abs(toDate - fromDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 5) {
        newErrors.harvestDateRange = "Date range cannot exceed 5 days";
      }
      
      if (toDate < fromDate) {
        newErrors.harvestDateRange = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use the same structure as HarvestingDay for farmers
      const harvestRequestData = {
        farmer_id: selectedFarmer.id, // Required when agent creates harvest request
        agent_id: agentInfo?.agent_profile?.id || localStorage.getItem('userId'), // Track which agent created this
        workersNeeded: parseInt(formData.workersNeeded),
        equipmentNeeded: formData.equipmentNeeded,
        treesToHarvest: parseInt(formData.transportationNeeded),
        harvestDateFrom: formData.harvestDateFrom,
        harvestDateTo: formData.harvestDateTo,
        harvestImages: formData.harvestImages.map(file => file.name),
        location: {
          province: selectedFarmer.profile?.province || selectedFarmer.province || 'Eastern Province',
          district: selectedFarmer.profile?.district || selectedFarmer.district || 'Gatsibo',
          sector: selectedFarmer.profile?.sector || selectedFarmer.sector || 'Kageyo',
          cell: selectedFarmer.profile?.cell || selectedFarmer.cell || 'Karangazi',
          village: selectedFarmer.profile?.village || selectedFarmer.village || 'Nyagatare'
        },
        farmerInfo: {
          name: selectedFarmer.full_name,
          phone: selectedFarmer.phone || 'N/A',
          email: selectedFarmer.email,
          farmerId: selectedFarmer.id
        },
        agentInfo: {
          name: agentInfo?.agent_profile?.full_name || localStorage.getItem('agentName') || 'Agent',
          phone: agentInfo?.agent_profile?.phone || localStorage.getItem('agentPhone') || 'N/A',
          email: agentInfo?.agent_profile?.email || localStorage.getItem('agentEmail') || 'agent@example.com',
          agentId: agentInfo?.agent_profile?.id || localStorage.getItem('userId')
        },
        requestedBy: 'agent',
        priority: 'medium',
        notes: `Ready for harvest. Trees are at full maturity with good fruit quality. Request for ${formData.transportationNeeded} trees requiring ${formData.workersNeeded} workers. Requested by agent on behalf of farmer ${selectedFarmer.full_name}.`
      };

      console.log('📤 Submitting harvest request with agent tracking:', {
        agent_id: harvestRequestData.agent_id,
        farmer_id: harvestRequestData.farmer_id,
        requestedBy: harvestRequestData.requestedBy
      });

      const response = await createHarvestRequest(harvestRequestData);
      
      console.log("Harvest request submitted successfully:", response);
      setSubmitted(true);
      
    } catch (error) {
      console.error('Error submitting harvesting plan:', error);
      setErrors({ submit: error.message || 'Failed to submit harvesting plan. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToFarmerSelection = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedFarmer(null);
    setFormData({
      workersNeeded: 1,
      equipmentNeeded: [],
      transportationNeeded: "",
      harvestDateFrom: "",
      harvestDateTo: "",
      harvestImages: []
    });
    setSubmitted(false);
    setErrors({});
  };

  if (submitted) {
    return (
      <div className="container-fullscreen">
        <div className="container-centered">
          <div className="card-submitted">
            <div className="icon-success-container">
              <svg className="icon-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="title-submitted">Harvest Plan Submitted!</h2>
            <p className="text-submitted">
              Harvesting plan for <strong>{selectedFarmer.full_name}</strong> has been submitted successfully. The farmer will be notified and our team will coordinate the resources.
            </p>
            <div className="summary-container">
              <p className="summary-text">
                <strong>Farmer:</strong> {selectedFarmer.full_name}<br />
                <strong>Harvest Period:</strong> {formData.harvestDateFrom} to {formData.harvestDateTo}<br />
                <strong>Workers Needed:</strong> {formData.workersNeeded}<br />
                <strong>Equipment Required:</strong> {formData.equipmentNeeded.length > 0 ? formData.equipmentNeeded.join(", ") : "No equipment needed"}<br />
                <strong>Trees to Harvest:</strong> {formData.transportationNeeded}<br />
                <strong>Images Uploaded:</strong> {formData.harvestImages.length}
              </p>
            </div>
            <button
              onClick={handleReset}
              style={{
                marginTop: '20px',
                padding: '12px 30px',
                backgroundColor: 'rgb(14, 67, 8)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Schedule Another Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Select Farmer
  if (currentStep === 1) {
    return (
      <div style={{ padding: '30px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '28px',
            fontWeight: '700',
            color: '#080a10e3',
            marginBottom: '10px',
            fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
          }}>
            Schedule Harvesting Plan
          </h1>
          <p style={{ 
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '30px',
            fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
          }}>
            Select a farmer to create a harvesting plan on their behalf
          </p>

          {/* Location Filters */}
          <div style={{ 
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '15px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              fontSize: '14px',
              fontWeight: '600',
              color: '#080a10e3',
              marginBottom: '15px',
              fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
            }}>
              Filter by Location
            </h3>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              {/* District Filter */}
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}>
                  District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">All Districts</option>
                  {getUniqueDistricts().map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              {/* Sector Filter */}
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}>
                  Sector
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  disabled={!selectedDistrict}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                    backgroundColor: selectedDistrict ? 'white' : '#f3f4f6',
                    cursor: selectedDistrict ? 'pointer' : 'not-allowed',
                    opacity: selectedDistrict ? 1 : 0.6
                  }}
                >
                  <option value="">All Sectors</option>
                  {getUniqueSectors().map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              {/* Cell Filter */}
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}>
                  Cell
                </label>
                <select
                  value={selectedCell}
                  onChange={(e) => setSelectedCell(e.target.value)}
                  disabled={!selectedSector}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                    backgroundColor: selectedSector ? 'white' : '#f3f4f6',
                    cursor: selectedSector ? 'pointer' : 'not-allowed',
                    opacity: selectedSector ? 1 : 0.6
                  }}
                >
                  <option value="">All Cells</option>
                  {getUniqueCells().map(cell => (
                    <option key={cell} value={cell}>{cell}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters Button */}
              {(selectedDistrict || selectedSector || selectedCell) && (
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setSelectedDistrict('');
                      setSelectedSector('');
                      setSelectedCell('');
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ 
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ 
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                width: '20px',
                height: '20px'
              }} />
              <input
                type="text"
                placeholder="Search farmers by name, email, phone, or district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 45px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}
              />
            </div>
          </div>

          {/* Farmers List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Loading farmers...
            </div>
          ) : filteredFarmers.length === 0 ? (
            <div style={{ 
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              No farmers found. {searchTerm && 'Try a different search term.'}
            </div>
          ) : (
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '20px'
            }}>
              {filteredFarmers.map((farmer) => (
                <div
                  key={farmer.id}
                  onClick={() => handleFarmerSelect(farmer)}
                  style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#080a10e3';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <h3 style={{ 
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#080a10e3',
                    marginBottom: '12px',
                    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                  }}>
                    {farmer.full_name}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                      <Mail style={{ width: '14px', height: '14px' }} />
                      <span>{farmer.email}</span>
                    </div>
                    {farmer.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                        <Phone style={{ width: '14px', height: '14px' }} />
                        <span>{farmer.phone}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                      <MapPin style={{ width: '14px', height: '14px' }} />
                      <span>
                        {farmer.profile?.district || farmer.district || 'N/A'} - {farmer.profile?.sector || farmer.sector || 'N/A'}
                      </span>
                    </div>
                    {farmer.profile?.farm_details?.farm_size && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                        <Maximize2 style={{ width: '14px', height: '14px' }} />
                        <span>{farmer.profile.farm_details.farm_size} hectares</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Fill Form (same as farmer page but with selected farmer info displayed)
  return (
    <div className="container-fullscreen container-font">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Equipment Modal */}
      {showEquipmentModal && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setShowEquipmentModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white', borderRadius: '8px', padding: '30px',
              maxWidth: '500px', width: '90%',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', color: '#080a10e3', margin: 0 }}>Select Equipment</h2>
              <button onClick={() => setShowEquipmentModal(false)} style={{ background: 'none', border: 'none', fontSize: '28px', color: '#9ca3af', cursor: 'pointer', padding: '0', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
              {equipmentOptions.map((equipment) => (
                <label key={equipment} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px', backgroundColor: formData.equipmentNeeded.includes(equipment) ? '#e8f5e9' : '#f5f5f5', borderRadius: '6px', border: formData.equipmentNeeded.includes(equipment) ? '2px solid #080a10e3' : '2px solid transparent', transition: 'all 0.2s' }}>
                  <input type="checkbox" checked={formData.equipmentNeeded.includes(equipment)} onChange={(e) => handleEquipmentChange(equipment, e.target.checked)} style={{ marginRight: '12px', width: '20px', height: '20px', cursor: 'pointer' }} />
                  <span style={{ fontSize: '15px', color: '#1f2937' }}>{equipment}</span>
                </label>
              ))}
            </div>
            <button onClick={() => setShowEquipmentModal(false)} style={{ width: '100%', padding: '12px', backgroundColor: '#080a10e3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>
              Done ({formData.equipmentNeeded.length} selected)
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '10px', paddingTop: '10px' }}>
        <div style={{ margin: '0', padding: '15px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          
          {/* Selected Farmer Info Banner */}
          <div style={{ 
            backgroundColor: '#f0f9ff',
            padding: '12px 15px',
            borderRadius: '6px',
            marginBottom: '15px',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Scheduling for:</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#080a10e3', margin: 0 }}>
                  {selectedFarmer.full_name}
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                  {selectedFarmer.profile?.district || selectedFarmer.district} - {selectedFarmer.profile?.sector || selectedFarmer.sector}
                </p>
              </div>
              <button
                onClick={handleBackToFarmerSelection}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#374151'
                }}
              >
                Change Farmer
              </button>
            </div>
          </div>

          <h1 style={{ textAlign: 'center', fontSize: '28px', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', color: '#080a10e3', marginBottom: '15px', fontWeight: 'normal', letterSpacing: '0.5px' }}>
            Book Your Harvesting Day
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Row 1: Workers, Equipment, Trees */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              {/* Workers Needed */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '15px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>
                  How Many VBAs Do You Need<span style={{ color: '#c44' }}>*</span>
                </label>
                <input 
                  type="number" 
                  value={formData.workersNeeded} 
                  onChange={(e) => handleInputChange("workersNeeded", Math.max(1, parseInt(e.target.value) || 1))} 
                  min="1" 
                  style={{ width: '100%', padding: '10px 12px', border: errors.workersNeeded ? '1px solid #c44' : '1px solid #b8c5b3', borderRadius: '3px', fontSize: '14px', backgroundColor: 'white', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }} 
                  placeholder="Enter number of workers..." 
                />
                {errors.workersNeeded && (
                  <p style={{ color: '#c44', fontSize: '12px', marginTop: '3px' }}>{errors.workersNeeded}</p>
                )}
              </div>

              {/* Equipment Needed */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '15px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>
                  Which Equipment do You Need?
                </label>
                <button 
                  type="button" 
                  onClick={() => setShowEquipmentModal(true)} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #b8c5b3', borderRadius: '3px', fontSize: '14px', backgroundColor: 'white', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', cursor: 'pointer', textAlign: 'left', color: formData.equipmentNeeded.length > 0 ? '#1f2937' : '#9ca3af', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>{formData.equipmentNeeded.length > 0 ? `${formData.equipmentNeeded.length} selected` : 'Select equipment...'}</span>
                  <span style={{ fontSize: '18px', color: '#080a10e3' }}>▼</span>
                </button>
                {formData.equipmentNeeded.length > 0 && (
                  <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {formData.equipmentNeeded.map((equipment) => (
                      <span key={equipment} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', backgroundColor: '#080a10e3', color: 'white', borderRadius: '12px', fontSize: '11px' }}>
                        {equipment}
                        <button onClick={() => handleEquipmentChange(equipment, false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0', fontSize: '14px', lineHeight: '1' }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Trees to Harvest */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '15px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>
                  How many trees to be harvested?<span style={{ color: '#c44' }}>*</span>
                </label>
                <input 
                  type="number" 
                  value={formData.transportationNeeded} 
                  onChange={(e) => handleInputChange("transportationNeeded", e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', border: errors.transportationNeeded ? '1px solid #c44' : '1px solid #b8c5b3', borderRadius: '3px', fontSize: '14px', backgroundColor: 'white', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }} 
                  placeholder="Enter number of trees..." 
                  min="1" 
                />
                {errors.transportationNeeded && (
                  <p style={{ color: '#c44', fontSize: '12px', marginTop: '3px' }}>{errors.transportationNeeded}</p>
                )}
              </div>
            </div>

            {/* Row 2: Harvest Date Range (From and To) and File Upload */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              {/* Harvest Date From */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '15px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>
                  Harvest Date From<span style={{ color: '#c44' }}>*</span>
                </label>
                <input 
                  type="date" 
                  value={formData.harvestDateFrom} 
                  onChange={(e) => handleDateChange("harvestDateFrom", e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', border: errors.harvestDateFrom ? '1px solid #c44' : '1px solid #b8c5b3', borderRadius: '3px', fontSize: '14px', backgroundColor: 'white', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }} 
                />
                {errors.harvestDateFrom && (
                  <p style={{ color: '#c44', fontSize: '12px', marginTop: '3px' }}>{errors.harvestDateFrom}</p>
                )}
              </div>

              {/* Harvest Date To */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '15px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>
                  Harvest Date To<span style={{ color: '#c44' }}>*</span>
                </label>
                <input 
                  type="date" 
                  value={formData.harvestDateTo} 
                  onChange={(e) => handleDateChange("harvestDateTo", e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', border: errors.harvestDateTo ? '1px solid #c44' : '1px solid #b8c5b3', borderRadius: '3px', fontSize: '14px', backgroundColor: 'white', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }} 
                />
                {errors.harvestDateTo && (
                  <p style={{ color: '#c44', fontSize: '12px', marginTop: '3px' }}>{errors.harvestDateTo}</p>
                )}
                {errors.harvestDateRange && (
                  <p style={{ color: '#c44', fontSize: '12px', marginTop: '3px' }}>{errors.harvestDateRange}</p>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '15px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>
                  Upload pictures of crops
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="file" multiple accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} id="file-upload" />
                  <label htmlFor="file-upload" style={{ flex: 1, padding: '10px 12px', border: '1px solid #b8c5b3', borderRadius: '3px', backgroundColor: 'white', cursor: 'pointer', fontSize: '14px', color: '#374151', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', textAlign: 'center' }}>
                    Choose files
                  </label>
                  <button onClick={() => document.getElementById("file-upload").click()} style={{ padding: '10px 16px', backgroundColor: '#080a10e3', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }} type="button">
                    Upload
                  </button>
                </div>
                {formData.harvestImages.length > 0 && (
                  <div style={{ marginTop: '6px' }}>
                    <p style={{ fontSize: '12px', color: '#080a10e3', marginBottom: '3px', fontWeight: '600' }}>
                      {formData.harvestImages.length} file(s) uploaded
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
              {errors.submit && (
                <p style={{ color: '#c44', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>
                  {errors.submit}
                </p>
              )}
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting} 
                style={{ 
                  padding: '8px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  backgroundColor: isSubmitting ? 'rgba(14, 67, 8, 0.5)' : 'rgb(14, 67, 8)',
                  fontFamily: 'Inter, system-ui, "Segoe UI", Roboto, Arial, sans-serif',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  color: 'white',
                  width: '23%',
                  fontWeight: '600',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  transition: 'background-color 0.3s'
                }} 
                onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = 'rgb(10, 50, 6)')} 
                onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = 'rgb(14, 67, 8)')}
              >
                {isSubmitting ? 'Submitting...' : 'Submit '}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
