import React, { useState } from "react";
import "../Styles/HarvestingDay.css";
import DashboardHeader from "../../components/Header/DashboardHeader";
import { createHarvestingPlanRequest } from '../../services/serviceRequestsService';

export default function ScheduleHarvestingPlan() {
  const [formData, setFormData] = useState({
    plannedHarvestDate: "",
    estimatedYield: "",
    farmSize: "",
    preparationNeeded: [],
    laborRequirement: "",
    equipmentRequired: [],
    transportArrangement: "",
    storageNeeded: "",
    qualityStandards: "",
    marketTarget: "",
    specialInstructions: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreparationModal, setShowPreparationModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);

  const preparationOptions = [
    "Pruning and trimming",
    "Pest control",
    "Irrigation check",
    "Soil testing",
    "Access road preparation",
    "Crate preparation"
  ];

  const equipmentOptions = [
    "Harvest Clipper",
    "Picking Poles",
    "Plastic crates",
    "Ladders",
    "Sorting tables",
    "Weighing scale"
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handlePreparationChange = (preparation, checked) => {
    const currentPreparation = formData.preparationNeeded;
    const updatedPreparation = checked
      ? [...currentPreparation, preparation]
      : currentPreparation.filter(item => item !== preparation);
    handleInputChange("preparationNeeded", updatedPreparation);
  };

  const handleEquipmentChange = (equipment, checked) => {
    const currentEquipment = formData.equipmentRequired;
    const updatedEquipment = checked
      ? [...currentEquipment, equipment]
      : currentEquipment.filter(item => item !== equipment);
    handleInputChange("equipmentRequired", updatedEquipment);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.plannedHarvestDate) {
      newErrors.plannedHarvestDate = "Please select planned harvest date";
    }
    
    if (!formData.estimatedYield || formData.estimatedYield < 1) {
      newErrors.estimatedYield = "Please enter estimated yield in kg";
    }
    
    if (!formData.farmSize || formData.farmSize < 0.1) {
      newErrors.farmSize = "Please enter farm size in hectares";
    }
    
    if (!formData.laborRequirement || formData.laborRequirement < 1) {
      newErrors.laborRequirement = "Please specify labor requirement";
    }
    
    if (!formData.marketTarget || formData.marketTarget.trim() === "") {
      newErrors.marketTarget = "Please specify your market target";
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
      const harvestingPlanData = {
        plannedHarvestDate: formData.plannedHarvestDate,
        estimatedYield: parseFloat(formData.estimatedYield),
        farmSize: parseFloat(formData.farmSize),
        preparationNeeded: formData.preparationNeeded,
        laborRequirement: parseInt(formData.laborRequirement),
        equipmentRequired: formData.equipmentRequired,
        transportArrangement: formData.transportArrangement || "Not specified",
        storageNeeded: formData.storageNeeded || "Not specified",
        qualityStandards: formData.qualityStandards || "Standard quality",
        marketTarget: formData.marketTarget,
        specialInstructions: formData.specialInstructions || "No special instructions",
        location: {
          province: localStorage.getItem('farmerProvince') || 'Eastern Province',
          district: localStorage.getItem('farmerDistrict') || 'Gatsibo',
          sector: localStorage.getItem('farmerSector') || 'Kageyo',
          cell: localStorage.getItem('farmerCell') || 'Karangazi',
          village: localStorage.getItem('farmerVillage') || 'Nyagatare'
        },
        farmerInfo: {
          name: localStorage.getItem('farmerName') || 'John Doe',
          phone: localStorage.getItem('farmerPhone') || '+250 123 456 789',
          email: localStorage.getItem('farmerEmail') || 'farmer@example.com',
          location: localStorage.getItem('farmerLocation') || 'Kigali, Rwanda'
        },
        agentInfo: {
          name: localStorage.getItem('agentName') || 'Agent Name',
          phone: localStorage.getItem('agentPhone') || '+250 987 654 321',
          email: localStorage.getItem('agentEmail') || 'agent@example.com'
        },
        priority: 'medium',
        notes: `Harvesting plan for ${formData.farmSize} hectares with estimated yield of ${formData.estimatedYield} kg. Target market: ${formData.marketTarget}.`
      };

      const response = await createHarvestingPlanRequest(harvestingPlanData);
      
      console.log("Harvesting plan submitted successfully:", response);
      setSubmitted(true);
      
      const newRequest = {
        id: response.id || Date.now().toString(),
        type: 'Harvesting Plan',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        ...harvestingPlanData
      };

      const existingRequests = JSON.parse(localStorage.getItem('farmerServiceRequests') || '[]');
      const updatedRequests = [...existingRequests, newRequest];
      localStorage.setItem('farmerServiceRequests', JSON.stringify(updatedRequests));
      
    } catch (error) {
      console.error('Error submitting harvesting plan:', error);
      setErrors({ submit: error.message || 'Failed to submit harvesting plan. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
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
            <h2 className="title-submitted">Harvesting Plan Submitted!</h2>
            <p className="text-submitted">
              Your harvesting plan has been received. Our team will review your plan and coordinate with you to ensure all preparations are made for a successful harvest.
            </p>
            <div className="summary-container">
              <p className="summary-text">
                <strong>Planned Harvest Date:</strong> {formData.plannedHarvestDate}<br />
                <strong>Estimated Yield:</strong> {formData.estimatedYield} kg<br />
                <strong>Farm Size:</strong> {formData.farmSize} hectares<br />
                <strong>Labor Required:</strong> {formData.laborRequirement} workers<br />
                <strong>Market Target:</strong> {formData.marketTarget}<br />
                <strong>Preparation Needed:</strong> {formData.preparationNeeded.length > 0 ? formData.preparationNeeded.join(", ") : "None specified"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fullscreen container-font">
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Preparation Modal */}
      {showPreparationModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setShowPreparationModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ 
                fontSize: '22px',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                color: '#080a10e3',
                margin: 0
              }}>
                Select Preparation Activities
              </h2>
              <button
                onClick={() => setShowPreparationModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {preparationOptions.map((preparation) => (
                <label
                  key={preparation}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: formData.preparationNeeded.includes(preparation) ? '#f0f9ff' : '#f9fafb',
                    border: formData.preparationNeeded.includes(preparation) ? '2px solid #080a10e3' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.preparationNeeded.includes(preparation)}
                    onChange={(e) => handlePreparationChange(preparation, e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ 
                    fontSize: '14px',
                    color: '#374151',
                    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                  }}>
                    {preparation}
                  </span>
                </label>
              ))}
            </div>

            <button
              onClick={() => setShowPreparationModal(false)}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '12px',
                backgroundColor: '#080a10e3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {showEquipmentModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setShowEquipmentModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ 
                fontSize: '22px',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                color: '#080a10e3',
                margin: 0
              }}>
                Select Equipment
              </h2>
              <button
                onClick={() => setShowEquipmentModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {equipmentOptions.map((equipment) => (
                <label
                  key={equipment}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: formData.equipmentRequired.includes(equipment) ? '#f0f9ff' : '#f9fafb',
                    border: formData.equipmentRequired.includes(equipment) ? '2px solid #080a10e3' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.equipmentRequired.includes(equipment)}
                    onChange={(e) => handleEquipmentChange(equipment, e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ 
                    fontSize: '14px',
                    color: '#374151',
                    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                  }}>
                    {equipment}
                  </span>
                </label>
              ))}
            </div>

            <button
              onClick={() => setShowEquipmentModal(false)}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '12px',
                backgroundColor: '#080a10e3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      <DashboardHeader />
      <div style={{ 
        marginTop: '90px',
        paddingTop: '20px'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '30px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
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
            Plan your harvest in advance to ensure proper preparation and coordination
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Planned Harvest Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Planned Harvest Date<span style={{ color: '#c44' }}>*</span>
              </label>
              <input
                type="date"
                value={formData.plannedHarvestDate}
                onChange={(e) => handleInputChange("plannedHarvestDate", e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: errors.plannedHarvestDate ? '1px solid #c44' : '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}
              />
            </div>
            {errors.plannedHarvestDate && (
              <p style={{ color: '#c44', fontSize: '13px', marginTop: '-12px', marginLeft: '265px' }}>{errors.plannedHarvestDate}</p>
            )}

            {/* Estimated Yield */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Estimated Yield (kg)<span style={{ color: '#c44' }}>*</span>
              </label>
              <input
                type="number"
                value={formData.estimatedYield}
                onChange={(e) => handleInputChange("estimatedYield", e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: errors.estimatedYield ? '1px solid #c44' : '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}
                placeholder="Enter estimated yield in kg..."
                min="1"
              />
            </div>
            {errors.estimatedYield && (
              <p style={{ color: '#c44', fontSize: '13px', marginTop: '-12px', marginLeft: '265px' }}>{errors.estimatedYield}</p>
            )}

            {/* Farm Size */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Farm Size (hectares)<span style={{ color: '#c44' }}>*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.farmSize}
                onChange={(e) => handleInputChange("farmSize", e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: errors.farmSize ? '1px solid #c44' : '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}
                placeholder="Enter farm size in hectares..."
                min="0.1"
              />
            </div>
            {errors.farmSize && (
              <p style={{ color: '#c44', fontSize: '13px', marginTop: '-12px', marginLeft: '265px' }}>{errors.farmSize}</p>
            )}

            {/* Preparation Needed - Modal Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Preparation Activities Needed
              </label>
              <button
                type="button"
                onClick={() => setShowPreparationModal(true)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: formData.preparationNeeded.length > 0 ? '#1f2937' : '#9ca3af',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>
                  {formData.preparationNeeded.length > 0 
                    ? `${formData.preparationNeeded.length} activities selected` 
                    : 'Click to select preparation activities...'}
                </span>
                <span style={{ fontSize: '18px', color: '#080a10e3' }}>▼</span>
              </button>
            </div>
            {formData.preparationNeeded.length > 0 && (
              <div style={{ marginLeft: '265px', marginTop: '-12px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {formData.preparationNeeded.map((preparation) => (
                    <span 
                      key={preparation}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        backgroundColor: '#080a10e3',
                        color: 'white',
                        borderRadius: '15px',
                        fontSize: '12px'
                      }}
                    >
                      {preparation}
                      <button
                        onClick={() => handlePreparationChange(preparation, false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: '0',
                          fontSize: '16px',
                          lineHeight: '1'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Labor Requirement */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Labor Requirement (workers)<span style={{ color: '#c44' }}>*</span>
              </label>
              <input
                type="number"
                value={formData.laborRequirement}
                onChange={(e) => handleInputChange("laborRequirement", e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: errors.laborRequirement ? '1px solid #c44' : '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}
                placeholder="Enter number of workers needed..."
                min="1"
              />
            </div>
            {errors.laborRequirement && (
              <p style={{ color: '#c44', fontSize: '13px', marginTop: '-12px', marginLeft: '265px' }}>{errors.laborRequirement}</p>
            )}

            {/* Equipment Required - Modal Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Equipment Required
              </label>
              <button
                type="button"
                onClick={() => setShowEquipmentModal(true)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: formData.equipmentRequired.length > 0 ? '#1f2937' : '#9ca3af',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>
                  {formData.equipmentRequired.length > 0 
                    ? `${formData.equipmentRequired.length} equipment selected` 
                    : 'Click to select equipment...'}
                </span>
                <span style={{ fontSize: '18px', color: '#080a10e3' }}>▼</span>
              </button>
            </div>
            {formData.equipmentRequired.length > 0 && (
              <div style={{ marginLeft: '265px', marginTop: '-12px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {formData.equipmentRequired.map((equipment) => (
                    <span 
                      key={equipment}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        backgroundColor: '#080a10e3',
                        color: 'white',
                        borderRadius: '15px',
                        fontSize: '12px'
                      }}
                    >
                      {equipment}
                      <button
                        onClick={() => handleEquipmentChange(equipment, false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: '0',
                          fontSize: '16px',
                          lineHeight: '1'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Transport Arrangement */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Transport Arrangement
              </label>
              <input
                type="text"
                value={formData.transportArrangement}
                onChange={(e) => handleInputChange("transportArrangement", e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}
                placeholder="e.g., Pickup truck, Company transport..."
              />
            </div>

            {/* Storage Needed */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Storage Needed
              </label>
              <input
                type="text"
                value={formData.storageNeeded}
                onChange={(e) => handleInputChange("storageNeeded", e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}
                placeholder="e.g., Cold storage, Warehouse..."
              />
            </div>

            {/* Quality Standards */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Quality Standards
              </label>
              <input
                type="text"
                value={formData.qualityStandards}
                onChange={(e) => handleInputChange("qualityStandards", e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}
                placeholder="e.g., Export quality, Local market..."
              />
            </div>

            {/* Market Target */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Market Target<span style={{ color: '#c44' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.marketTarget}
                onChange={(e) => handleInputChange("marketTarget", e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: errors.marketTarget ? '1px solid #c44' : '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}
                placeholder="e.g., Export, Local market, Processing plant..."
              />
            </div>
            {errors.marketTarget && (
              <p style={{ color: '#c44', fontSize: '13px', marginTop: '-12px', marginLeft: '265px' }}>{errors.marketTarget}</p>
            )}

            {/* Special Instructions */}
            <div>
              <label style={{ 
                display: 'block',
                marginBottom: '6px',
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
              }}>
                Special Instructions
              </label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                placeholder="Any additional information or special requirements..."
              />
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '10px' }}>
              {errors.submit && (
                <p style={{ color: '#c44', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>
                  {errors.submit}
                </p>
              )}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: isSubmitting ? 'rgba(14, 67, 8, 0.5)' : 'rgb(14, 67, 8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = 'rgb(10, 50, 6)')}
                onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = 'rgb(14, 67, 8)')}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Harvesting Plan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
