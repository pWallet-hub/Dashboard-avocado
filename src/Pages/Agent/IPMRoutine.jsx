import React, { useState, useEffect } from "react";
import { Search, Mail, Phone, MapPin, Maximize2, Bug } from "lucide-react";
import "../../Pages/Styles/HarvestingDay.css";
import { createIPMRoutineRequest } from '../../services/serviceRequestsService';
import { listFarmers } from '../../services/usersService';
import { getAgentInformation } from '../../services/agent-information';

export default function AgentScheduleIPMRoutine() {
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
    scheduledDate: "",
    farmSize: "",
    pestType: [],
    ipmMethod: [],
    chemicalsNeeded: "",
    equipmentNeeded: [],
    laborRequired: "",
    targetArea: "",
    severity: "medium",
    preventiveMeasures: "",
    followUpDate: "",
    specialInstructions: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPestModal, setShowPestModal] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);

  const pestTypeOptions = [
    "Avocado Thrips", "Mites", "Fruit Flies", "Scale Insects", "Stem Borers",
    "Anthracnose", "Root Rot", "Cercospora Spot", "Other"
  ];

  const ipmMethodOptions = [
    "Biological Control", "Cultural Practices", "Mechanical Control",
    "Chemical Control", "Organic Pesticides", "Traps and Monitoring",
    "Pruning Infected Parts", "Soil Management"
  ];

  const equipmentOptions = [
    "Sprayer", "Protective Gear", "Pruning Tools",
    "Measuring Equipment", "Monitoring Traps", "Safety Equipment"
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
    // Pre-fill farm size if available
    if (farmer.profile?.farm_details?.farm_size) {
      setFormData(prev => ({
        ...prev,
        farmSize: farmer.profile.farm_details.farm_size
      }));
    }
    setCurrentStep(2);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handlePestChange = (pest, checked) => {
    const currentPest = formData.pestType;
    const updatedPest = checked ? [...currentPest, pest] : currentPest.filter(item => item !== pest);
    handleInputChange("pestType", updatedPest);
  };

  const handleMethodChange = (method, checked) => {
    const currentMethod = formData.ipmMethod;
    const updatedMethod = checked ? [...currentMethod, method] : currentMethod.filter(item => item !== method);
    handleInputChange("ipmMethod", updatedMethod);
  };

  const handleEquipmentChange = (equipment, checked) => {
    const currentEquipment = formData.equipmentNeeded;
    const updatedEquipment = checked ? [...currentEquipment, equipment] : currentEquipment.filter(item => item !== equipment);
    handleInputChange("equipmentNeeded", updatedEquipment);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.scheduledDate) newErrors.scheduledDate = "Please select scheduled date";
    if (!formData.farmSize || formData.farmSize < 0.1) newErrors.farmSize = "Please enter farm size in hectares";
    if (formData.pestType.length === 0) newErrors.pestType = "Please select at least one pest type";
    if (formData.ipmMethod.length === 0) newErrors.ipmMethod = "Please select at least one IPM method";
    if (!formData.laborRequired || formData.laborRequired < 1) newErrors.laborRequired = "Please specify labor requirement";
    if (!formData.targetArea || formData.targetArea.trim() === "") newErrors.targetArea = "Please specify target area";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    
    try {
      const ipmRoutineData = {
        scheduledDate: formData.scheduledDate,
        farmSize: parseFloat(formData.farmSize),
        pestType: formData.pestType,
        ipmMethod: formData.ipmMethod,
        chemicalsNeeded: formData.chemicalsNeeded || "None specified",
        equipmentNeeded: formData.equipmentNeeded,
        laborRequired: parseInt(formData.laborRequired),
        targetArea: formData.targetArea,
        severity: formData.severity,
        preventiveMeasures: formData.preventiveMeasures || "Standard preventive measures",
        followUpDate: formData.followUpDate || "",
        specialInstructions: formData.specialInstructions || "No special instructions",
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
        priority: formData.severity,
        notes: `IPM routine for ${formData.farmSize} hectares targeting ${formData.pestType.join(", ")}. Methods: ${formData.ipmMethod.join(", ")}. Requested by agent on behalf of farmer ${selectedFarmer.full_name}.`
      };

      const response = await createIPMRoutineRequest(ipmRoutineData);
      console.log("IPM routine submitted successfully:", response);
      setSubmitted(true);
      
    } catch (error) {
      console.error('Error submitting IPM routine:', error);
      setErrors({ submit: error.message || 'Failed to submit IPM routine. Please try again.' });
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
      scheduledDate: "", farmSize: "", pestType: [], ipmMethod: [],
      chemicalsNeeded: "", equipmentNeeded: [], laborRequired: "",
      targetArea: "", severity: "medium", preventiveMeasures: "",
      followUpDate: "", specialInstructions: ""
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
            <h2 className="title-submitted">IPM Routine Scheduled!</h2>
            <p className="text-submitted">
              IPM routine for <strong>{selectedFarmer.full_name}</strong> has been submitted successfully. The farmer will be notified and you will coordinate the pest management activities.
            </p>
            <div className="summary-container">
              <p className="summary-text">
                <strong>Farmer:</strong> {selectedFarmer.full_name}<br />
                <strong>Scheduled Date:</strong> {formData.scheduledDate}<br />
                <strong>Farm Size:</strong> {formData.farmSize} hectares<br />
                <strong>Target Pests:</strong> {formData.pestType.join(", ")}<br />
                <strong>IPM Methods:</strong> {formData.ipmMethod.join(", ")}<br />
                <strong>Labor Required:</strong> {formData.laborRequired} workers<br />
                <strong>Severity Level:</strong> {formData.severity}<br />
                {formData.followUpDate && <><strong>Follow-up Date:</strong> {formData.followUpDate}<br /></>}
              </p>
            </div>
            <button onClick={handleReset} style={{ marginTop: '20px', padding: '12px 30px', backgroundColor: 'rgb(14, 67, 8)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
              Schedule Another Routine
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
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#080a10e3', marginBottom: '10px', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>
            Schedule IPM Routine
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '30px', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>
            Select a farmer to schedule pest management service on their behalf
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
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', width: '20px', height: '20px' }} />
              <input type="text" placeholder="Search farmers by name, email, phone, or district..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 45px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }} />
            </div>
          </div>

          {/* Farmers List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading farmers...</div>
          ) : filteredFarmers.length === 0 ? (
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center', color: '#6b7280' }}>
              No farmers found. {searchTerm && 'Try a different search term.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {filteredFarmers.map((farmer) => (
                <div key={farmer.id} onClick={() => handleFarmerSelect(farmer)} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#080a10e3'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'; }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#080a10e3', marginBottom: '12px', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>{farmer.full_name}</h3>
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
                      <span>{farmer.profile?.district || farmer.district || 'N/A'} - {farmer.profile?.sector || farmer.sector || 'N/A'}</span>
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

  // Step 2: Fill Form
  return (
    <div className="container-fullscreen container-font">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Modals - Pest Type */}
      {showPestModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }} onClick={() => setShowPestModal(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)', animation: 'slideUp 0.3s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', color: '#080a10e3', margin: 0 }}>Select Pest Types</h2>
              <button onClick={() => setShowPestModal(false)} style={{ background: 'none', border: 'none', fontSize: '28px', color: '#9ca3af', cursor: 'pointer', padding: '0', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              {pestTypeOptions.map((pest) => (
                <label key={pest} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '6px', cursor: 'pointer', backgroundColor: formData.pestType.includes(pest) ? '#f0f9ff' : '#f9fafb', border: formData.pestType.includes(pest) ? '2px solid #080a10e3' : '2px solid transparent', transition: 'all 0.2s' }}>
                  <input type="checkbox" checked={formData.pestType.includes(pest)} onChange={(e) => handlePestChange(pest, e.target.checked)} style={{ cursor: 'pointer' }} />
                  <span style={{ fontSize: '14px', color: '#374151', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>{pest}</span>
                </label>
              ))}
            </div>
            <button onClick={() => setShowPestModal(false)} style={{ width: '100%', marginTop: '20px', padding: '12px', backgroundColor: '#080a10e3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>Done</button>
          </div>
        </div>
      )}

      {/* Modals - IPM Method */}
      {showMethodModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }} onClick={() => setShowMethodModal(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)', animation: 'slideUp 0.3s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', color: '#080a10e3', margin: 0 }}>Select IPM Methods</h2>
              <button onClick={() => setShowMethodModal(false)} style={{ background: 'none', border: 'none', fontSize: '28px', color: '#9ca3af', cursor: 'pointer', padding: '0', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              {ipmMethodOptions.map((method) => (
                <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '6px', cursor: 'pointer', backgroundColor: formData.ipmMethod.includes(method) ? '#f0f9ff' : '#f9fafb', border: formData.ipmMethod.includes(method) ? '2px solid #080a10e3' : '2px solid transparent', transition: 'all 0.2s' }}>
                  <input type="checkbox" checked={formData.ipmMethod.includes(method)} onChange={(e) => handleMethodChange(method, e.target.checked)} style={{ cursor: 'pointer' }} />
                  <span style={{ fontSize: '14px', color: '#374151', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>{method}</span>
                </label>
              ))}
            </div>
            <button onClick={() => setShowMethodModal(false)} style={{ width: '100%', marginTop: '20px', padding: '12px', backgroundColor: '#080a10e3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>Done</button>
          </div>
        </div>
      )}

      {/* Modals - Equipment */}
      {showEquipmentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }} onClick={() => setShowEquipmentModal(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)', animation: 'slideUp 0.3s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', color: '#080a10e3', margin: 0 }}>Select Equipment</h2>
              <button onClick={() => setShowEquipmentModal(false)} style={{ background: 'none', border: 'none', fontSize: '28px', color: '#9ca3af', cursor: 'pointer', padding: '0', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              {equipmentOptions.map((equipment) => (
                <label key={equipment} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '6px', cursor: 'pointer', backgroundColor: formData.equipmentNeeded.includes(equipment) ? '#f0f9ff' : '#f9fafb', border: formData.equipmentNeeded.includes(equipment) ? '2px solid #080a10e3' : '2px solid transparent', transition: 'all 0.2s' }}>
                  <input type="checkbox" checked={formData.equipmentNeeded.includes(equipment)} onChange={(e) => handleEquipmentChange(equipment, e.target.checked)} style={{ cursor: 'pointer' }} />
                  <span style={{ fontSize: '14px', color: '#374151', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>{equipment}</span>
                </label>
              ))}
            </div>
            <button onClick={() => setShowEquipmentModal(false)} style={{ width: '100%', marginTop: '20px', padding: '12px', backgroundColor: '#080a10e3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>Done</button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '10px', paddingTop: '10px' }}>
        <div style={{ margin: '0', padding: '15px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          
          {/* Selected Farmer Info Banner */}
          <div style={{ backgroundColor: '#f0f9ff', padding: '12px 15px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Scheduling IPM for:</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#080a10e3', margin: 0 }}>{selectedFarmer.full_name}</p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{selectedFarmer.profile?.district || selectedFarmer.district} - {selectedFarmer.profile?.sector || selectedFarmer.sector}</p>
              </div>
              <button onClick={handleBackToFarmerSelection} style={{ padding: '8px 16px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#374151' }}>Change Farmer</button>
            </div>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#080a10e3', marginBottom: '5px', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>Schedule IPM Routine</h1>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '15px', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>You will perform the pest management work on behalf of the farmer</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Row 1: Scheduled Date, Farm Size, Pest Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '3px', fontSize: '12px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>
                  Scheduled Date<span style={{ color: '#c44' }}>*</span>
                </label>
                <input type="date" value={formData.scheduledDate} onChange={(e) => handleInputChange("scheduledDate", e.target.value)} style={{ width: '100%', padding: '7px 8px', border: errors.scheduledDate ? '1px solid #c44' : '1px solid #b8c5b3', borderRadius: '3px', fontSize: '12px', backgroundColor: 'white', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }} />
                {errors.scheduledDate && <p style={{ color: '#c44', fontSize: '10px', marginTop: '2px' }}>{errors.scheduledDate}</p>}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '3px', fontSize: '12px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>
                  Farm Size (hectares)<span style={{ color: '#c44' }}>*</span>
                </label>
                <input type="number" step="0.1" value={formData.farmSize} onChange={(e) => handleInputChange("farmSize", e.target.value)} style={{ width: '100%', padding: '7px 8px', border: errors.farmSize ? '1px solid #c44' : '1px solid #b8c5b3', borderRadius: '3px', fontSize: '12px', backgroundColor: 'white', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }} placeholder="Enter farm size..." min="0.1" />
                {errors.farmSize && <p style={{ color: '#c44', fontSize: '10px', marginTop: '2px' }}>{errors.farmSize}</p>}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '3px', fontSize: '12px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>
                  Pest/Disease Type<span style={{ color: '#c44' }}>*</span>
                </label>
                <button type="button" onClick={() => setShowPestModal(true)} style={{ width: '100%', padding: '7px 8px', border: errors.pestType ? '1px solid #c44' : '1px solid #b8c5b3', borderRadius: '3px', fontSize: '12px', backgroundColor: 'white', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', cursor: 'pointer', textAlign: 'left', color: formData.pestType.length > 0 ? '#1f2937' : '#9ca3af', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{formData.pestType.length > 0 ? `${formData.pestType.length} selected` : 'Select...'}</span>
                  <span style={{ fontSize: '14px', color: '#080a10e3' }}>▼</span>
                </button>
                {errors.pestType && <p style={{ color: '#c44', fontSize: '10px', marginTop: '2px' }}>{errors.pestType}</p>}
                {formData.pestType.length > 0 && (
                  <div style={{ marginTop: '5px', display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {formData.pestType.map((pest) => (
                      <span key={pest} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 6px', backgroundColor: '#080a10e3', color: 'white', borderRadius: '10px', fontSize: '10px' }}>
                        {pest}
                        <button onClick={() => handlePestChange(pest, false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0', fontSize: '12px', lineHeight: '1' }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* IPM Method */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ fontSize: '15px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', whiteSpace: 'nowrap', minWidth: '250px' }}>IPM Methods<span style={{ color: '#c44' }}>*</span></label>
              <button type="button" onClick={() => setShowMethodModal(true)} style={{ flex: 1, padding: '10px 12px', border: errors.ipmMethod ? '1px solid #c44' : '1px solid #b8c5b3', borderRadius: '3px', fontSize: '14px', backgroundColor: 'white', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', cursor: 'pointer', textAlign: 'left', color: formData.ipmMethod.length > 0 ? '#1f2937' : '#9ca3af', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{formData.ipmMethod.length > 0 ? `${formData.ipmMethod.length} methods selected` : 'Click to select IPM methods...'}</span>
                <span style={{ fontSize: '18px', color: '#080a10e3' }}>▼</span>
              </button>
            </div>
            {errors.ipmMethod && <p style={{ color: '#c44', fontSize: '13px', marginTop: '-12px', marginLeft: '265px' }}>{errors.ipmMethod}</p>}
            {formData.ipmMethod.length > 0 && (
              <div style={{ marginLeft: '265px', marginTop: '-12px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {formData.ipmMethod.map((method) => (
                    <span key={method} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#080a10e3', color: 'white', borderRadius: '15px', fontSize: '12px' }}>
                      {method}
                      <button onClick={() => handleMethodChange(method, false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0', fontSize: '16px', lineHeight: '1' }}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chemicals, Equipment, Labor, Target Area, Severity, etc. - Continue with similar inline styles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ fontSize: '15px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', whiteSpace: 'nowrap', minWidth: '250px' }}>Chemicals Needed</label>
              <input type="text" value={formData.chemicalsNeeded} onChange={(e) => handleInputChange("chemicalsNeeded", e.target.value)} style={{ flex: 1, padding: '10px 12px', border: '1px solid #b8c5b3', borderRadius: '3px', fontSize: '14px', backgroundColor: 'white', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }} placeholder="e.g., Organic insecticide, Fungicide..." />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ fontSize: '15px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', whiteSpace: 'nowrap', minWidth: '250px' }}>Equipment Needed</label>
              <button type="button" onClick={() => setShowEquipmentModal(true)} style={{ flex: 1, padding: '10px 12px', border: '1px solid #b8c5b3', borderRadius: '3px', fontSize: '14px', backgroundColor: 'white', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', cursor: 'pointer', textAlign: 'left', color: formData.equipmentNeeded.length > 0 ? '#1f2937' : '#9ca3af', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{formData.equipmentNeeded.length > 0 ? `${formData.equipmentNeeded.length} equipment selected` : 'Click to select equipment...'}</span>
                <span style={{ fontSize: '18px', color: '#080a10e3' }}>▼</span>
              </button>
            </div>
            {formData.equipmentNeeded.length > 0 && (
              <div style={{ marginLeft: '265px', marginTop: '-12px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {formData.equipmentNeeded.map((equipment) => (
                    <span key={equipment} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#080a10e3', color: 'white', borderRadius: '15px', fontSize: '12px' }}>
                      {equipment}
                      <button onClick={() => handleEquipmentChange(equipment, false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0', fontSize: '16px', lineHeight: '1' }}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ fontSize: '15px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', whiteSpace: 'nowrap', minWidth: '250px' }}>Labor Required (workers)<span style={{ color: '#c44' }}>*</span></label>
              <input type="number" value={formData.laborRequired} onChange={(e) => handleInputChange("laborRequired", e.target.value)} style={{ flex: 1, padding: '10px 12px', border: errors.laborRequired ? '1px solid #c44' : '1px solid #b8c5b3', borderRadius: '3px', fontSize: '14px', backgroundColor: 'white', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }} placeholder="Enter number of workers needed..." min="1" />
            </div>
            {errors.laborRequired && <p style={{ color: '#c44', fontSize: '13px', marginTop: '-12px', marginLeft: '265px' }}>{errors.laborRequired}</p>}

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ fontSize: '15px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', whiteSpace: 'nowrap', minWidth: '250px' }}>Target Area<span style={{ color: '#c44' }}>*</span></label>
              <input type="text" value={formData.targetArea} onChange={(e) => handleInputChange("targetArea", e.target.value)} style={{ flex: 1, padding: '10px 12px', border: errors.targetArea ? '1px solid #c44' : '1px solid #b8c5b3', borderRadius: '3px', fontSize: '14px', backgroundColor: 'white', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }} placeholder="e.g., Entire farm, North section, Young trees..." />
            </div>
            {errors.targetArea && <p style={{ color: '#c44', fontSize: '13px', marginTop: '-12px', marginLeft: '265px' }}>{errors.targetArea}</p>}

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ fontSize: '15px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', whiteSpace: 'nowrap', minWidth: '250px' }}>Severity Level</label>
              <select value={formData.severity} onChange={(e) => handleInputChange("severity", e.target.value)} style={{ flex: 1, padding: '10px 12px', border: '1px solid #b8c5b3', borderRadius: '3px', fontSize: '14px', backgroundColor: 'white', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', cursor: 'pointer' }}>
                <option value="low">Low - Preventive</option>
                <option value="medium">Medium - Moderate Infestation</option>
                <option value="high">High - Severe Infestation</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ fontSize: '15px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', whiteSpace: 'nowrap', minWidth: '250px' }}>Preventive Measures Taken</label>
              <input type="text" value={formData.preventiveMeasures} onChange={(e) => handleInputChange("preventiveMeasures", e.target.value)} style={{ flex: 1, padding: '10px 12px', border: '1px solid #b8c5b3', borderRadius: '3px', fontSize: '14px', backgroundColor: 'white', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }} placeholder="e.g., Regular monitoring, Sanitation, Pruning..." />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ fontSize: '15px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', whiteSpace: 'nowrap', minWidth: '250px' }}>Follow-up Date</label>
              <input type="date" value={formData.followUpDate} onChange={(e) => handleInputChange("followUpDate", e.target.value)} style={{ flex: 1, padding: '10px 12px', border: '1px solid #b8c5b3', borderRadius: '3px', fontSize: '14px', backgroundColor: 'white', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '15px', color: '#080a10e3', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif' }}>Special Instructions</label>
              <textarea value={formData.specialInstructions} onChange={(e) => handleInputChange("specialInstructions", e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #b8c5b3', borderRadius: '3px', fontSize: '14px', backgroundColor: 'white', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', minHeight: '100px', resize: 'vertical' }} placeholder="Any additional information or specific requirements for the IPM routine..." />
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '10px' }}>
              {errors.submit && <p style={{ color: '#c44', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>{errors.submit}</p>}
              <button onClick={handleSubmit} disabled={isSubmitting} style={{ width: '100%', padding: '14px', backgroundColor: isSubmitting ? 'rgba(14, 67, 8, 0.5)' : 'rgb(14, 67, 8)', color: 'white', border: 'none', borderRadius: '25px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: '600', fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif', letterSpacing: '1px', textTransform: 'uppercase', transition: 'background-color 0.3s' }} onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = 'rgb(10, 50, 6)')} onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = 'rgb(14, 67, 8)')}>
                {isSubmitting ? 'Submitting...' : 'Submit IPM Routine Request'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
