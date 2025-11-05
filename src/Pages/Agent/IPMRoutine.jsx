import React, { useState } from "react";
import "../Styles/HarvestingDay.css";
import DashboardHeader from "../../components/Header/DashboardHeader";
import { createIPMRoutineRequest } from '../../services/serviceRequestsService';

export default function ScheduleIPMRoutine() {
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
    "Avocado Thrips",
    "Mites",
    "Fruit Flies",
    "Scale Insects",
    "Stem Borers",
    "Anthracnose",
    "Root Rot",
    "Cercospora Spot",
    "Other"
  ];

  const ipmMethodOptions = [
    "Biological Control",
    "Cultural Practices",
    "Mechanical Control",
    "Chemical Control",
    "Organic Pesticides",
    "Traps and Monitoring",
    "Pruning Infected Parts",
    "Soil Management"
  ];

  const equipmentOptions = [
    "Sprayer",
    "Protective Gear",
    "Pruning Tools",
    "Measuring Equipment",
    "Monitoring Traps",
    "Safety Equipment"
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

  const handlePestChange = (pest, checked) => {
    const currentPest = formData.pestType;
    const updatedPest = checked
      ? [...currentPest, pest]
      : currentPest.filter(item => item !== pest);
    handleInputChange("pestType", updatedPest);
  };

  const handleMethodChange = (method, checked) => {
    const currentMethod = formData.ipmMethod;
    const updatedMethod = checked
      ? [...currentMethod, method]
      : currentMethod.filter(item => item !== method);
    handleInputChange("ipmMethod", updatedMethod);
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
    
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = "Please select scheduled date";
    }
    
    if (!formData.farmSize || formData.farmSize < 0.1) {
      newErrors.farmSize = "Please enter farm size in hectares";
    }
    
    if (formData.pestType.length === 0) {
      newErrors.pestType = "Please select at least one pest type";
    }
    
    if (formData.ipmMethod.length === 0) {
      newErrors.ipmMethod = "Please select at least one IPM method";
    }
    
    if (!formData.laborRequired || formData.laborRequired < 1) {
      newErrors.laborRequired = "Please specify labor requirement";
    }
    
    if (!formData.targetArea || formData.targetArea.trim() === "") {
      newErrors.targetArea = "Please specify target area";
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
        priority: formData.severity,
        notes: `IPM routine for ${formData.farmSize} hectares targeting ${formData.pestType.join(", ")}. Methods: ${formData.ipmMethod.join(", ")}.`
      };

      const response = await createIPMRoutineRequest(ipmRoutineData);
      
      console.log("IPM routine submitted successfully:", response);
      setSubmitted(true);
      
      const newRequest = {
        id: response.id || Date.now().toString(),
        type: 'IPM Routine',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        ...ipmRoutineData
      };

      const existingRequests = JSON.parse(localStorage.getItem('farmerServiceRequests') || '[]');
      const updatedRequests = [...existingRequests, newRequest];
      localStorage.setItem('farmerServiceRequests', JSON.stringify(updatedRequests));
      
    } catch (error) {
      console.error('Error submitting IPM routine:', error);
      setErrors({ submit: error.message || 'Failed to submit IPM routine. Please try again.' });
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
            <h2 className="title-submitted">IPM Routine Scheduled!</h2>
            <p className="text-submitted">
              Your IPM routine request has been received. Our agent will coordinate the pest management activities and contact you to confirm the schedule.
            </p>
            <div className="summary-container">
              <p className="summary-text">
                <strong>Scheduled Date:</strong> {formData.scheduledDate}<br />
                <strong>Farm Size:</strong> {formData.farmSize} hectares<br />
                <strong>Target Pests:</strong> {formData.pestType.join(", ")}<br />
                <strong>IPM Methods:</strong> {formData.ipmMethod.join(", ")}<br />
                <strong>Labor Required:</strong> {formData.laborRequired} workers<br />
                <strong>Severity Level:</strong> {formData.severity}<br />
                {formData.followUpDate && (
                  <><strong>Follow-up Date:</strong> {formData.followUpDate}<br /></>
                )}
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

      {/* Pest Type Modal */}
      {showPestModal && (
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
          onClick={() => setShowPestModal(false)}
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
                Select Pest Types
              </h2>
              <button
                onClick={() => setShowPestModal(false)}
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
              {pestTypeOptions.map((pest) => (
                <label
                  key={pest}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: formData.pestType.includes(pest) ? '#f0f9ff' : '#f9fafb',
                    border: formData.pestType.includes(pest) ? '2px solid #080a10e3' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.pestType.includes(pest)}
                    onChange={(e) => handlePestChange(pest, e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ 
                    fontSize: '14px',
                    color: '#374151',
                    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                  }}>
                    {pest}
                  </span>
                </label>
              ))}
            </div>

            <button
              onClick={() => setShowPestModal(false)}
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

      {/* IPM Method Modal */}
      {showMethodModal && (
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
          onClick={() => setShowMethodModal(false)}
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
                Select IPM Methods
              </h2>
              <button
                onClick={() => setShowMethodModal(false)}
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
              {ipmMethodOptions.map((method) => (
                <label
                  key={method}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: formData.ipmMethod.includes(method) ? '#f0f9ff' : '#f9fafb',
                    border: formData.ipmMethod.includes(method) ? '2px solid #080a10e3' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.ipmMethod.includes(method)}
                    onChange={(e) => handleMethodChange(method, e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ 
                    fontSize: '14px',
                    color: '#374151',
                    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                  }}>
                    {method}
                  </span>
                </label>
              ))}
            </div>

            <button
              onClick={() => setShowMethodModal(false)}
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
                    backgroundColor: formData.equipmentNeeded.includes(equipment) ? '#f0f9ff' : '#f9fafb',
                    border: formData.equipmentNeeded.includes(equipment) ? '2px solid #080a10e3' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.equipmentNeeded.includes(equipment)}
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
            Schedule IPM Routine
          </h1>
          <p style={{ 
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '30px',
            fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
          }}>
            Request Integrated Pest Management service - Our agent will perform the work on your behalf
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Scheduled Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Scheduled Date<span style={{ color: '#c44' }}>*</span>
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: errors.scheduledDate ? '1px solid #c44' : '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}
              />
            </div>
            {errors.scheduledDate && (
              <p style={{ color: '#c44', fontSize: '13px', marginTop: '-12px', marginLeft: '265px' }}>{errors.scheduledDate}</p>
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

            {/* Pest Type - Modal Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Pest/Disease Type<span style={{ color: '#c44' }}>*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPestModal(true)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: errors.pestType ? '1px solid #c44' : '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: formData.pestType.length > 0 ? '#1f2937' : '#9ca3af',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>
                  {formData.pestType.length > 0 
                    ? `${formData.pestType.length} pest types selected` 
                    : 'Click to select pest types...'}
                </span>
                <span style={{ fontSize: '18px', color: '#080a10e3' }}>▼</span>
              </button>
            </div>
            {errors.pestType && (
              <p style={{ color: '#c44', fontSize: '13px', marginTop: '-12px', marginLeft: '265px' }}>{errors.pestType}</p>
            )}
            {formData.pestType.length > 0 && (
              <div style={{ marginLeft: '265px', marginTop: '-12px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {formData.pestType.map((pest) => (
                    <span 
                      key={pest}
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
                      {pest}
                      <button
                        onClick={() => handlePestChange(pest, false)}
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

            {/* IPM Method - Modal Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                IPM Methods<span style={{ color: '#c44' }}>*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowMethodModal(true)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: errors.ipmMethod ? '1px solid #c44' : '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: formData.ipmMethod.length > 0 ? '#1f2937' : '#9ca3af',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>
                  {formData.ipmMethod.length > 0 
                    ? `${formData.ipmMethod.length} methods selected` 
                    : 'Click to select IPM methods...'}
                </span>
                <span style={{ fontSize: '18px', color: '#080a10e3' }}>▼</span>
              </button>
            </div>
            {errors.ipmMethod && (
              <p style={{ color: '#c44', fontSize: '13px', marginTop: '-12px', marginLeft: '265px' }}>{errors.ipmMethod}</p>
            )}
            {formData.ipmMethod.length > 0 && (
              <div style={{ marginLeft: '265px', marginTop: '-12px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {formData.ipmMethod.map((method) => (
                    <span 
                      key={method}
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
                      {method}
                      <button
                        onClick={() => handleMethodChange(method, false)}
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

            {/* Chemicals Needed */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Chemicals Needed
              </label>
              <input
                type="text"
                value={formData.chemicalsNeeded}
                onChange={(e) => handleInputChange("chemicalsNeeded", e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}
                placeholder="e.g., Organic insecticide, Fungicide..."
              />
            </div>

            {/* Equipment Needed - Modal Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Equipment Needed
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
                  color: formData.equipmentNeeded.length > 0 ? '#1f2937' : '#9ca3af',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>
                  {formData.equipmentNeeded.length > 0 
                    ? `${formData.equipmentNeeded.length} equipment selected` 
                    : 'Click to select equipment...'}
                </span>
                <span style={{ fontSize: '18px', color: '#080a10e3' }}>▼</span>
              </button>
            </div>
            {formData.equipmentNeeded.length > 0 && (
              <div style={{ marginLeft: '265px', marginTop: '-12px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {formData.equipmentNeeded.map((equipment) => (
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

            {/* Labor Required */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Labor Required (workers)<span style={{ color: '#c44' }}>*</span>
              </label>
              <input
                type="number"
                value={formData.laborRequired}
                onChange={(e) => handleInputChange("laborRequired", e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: errors.laborRequired ? '1px solid #c44' : '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}
                placeholder="Enter number of workers needed..."
                min="1"
              />
            </div>
            {errors.laborRequired && (
              <p style={{ color: '#c44', fontSize: '13px', marginTop: '-12px', marginLeft: '265px' }}>{errors.laborRequired}</p>
            )}

            {/* Target Area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Target Area<span style={{ color: '#c44' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.targetArea}
                onChange={(e) => handleInputChange("targetArea", e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: errors.targetArea ? '1px solid #c44' : '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}
                placeholder="e.g., Entire farm, North section, Young trees..."
              />
            </div>
            {errors.targetArea && (
              <p style={{ color: '#c44', fontSize: '13px', marginTop: '-12px', marginLeft: '265px' }}>{errors.targetArea}</p>
            )}

            {/* Severity Level */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Severity Level
              </label>
              <select
                value={formData.severity}
                onChange={(e) => handleInputChange("severity", e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                  cursor: 'pointer'
                }}
              >
                <option value="low">Low - Preventive</option>
                <option value="medium">Medium - Moderate Infestation</option>
                <option value="high">High - Severe Infestation</option>
              </select>
            </div>

            {/* Preventive Measures */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Preventive Measures Taken
              </label>
              <input
                type="text"
                value={formData.preventiveMeasures}
                onChange={(e) => handleInputChange("preventiveMeasures", e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}
                placeholder="e.g., Regular monitoring, Sanitation, Pruning..."
              />
            </div>

            {/* Follow-up Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Follow-up Date
              </label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => handleInputChange("followUpDate", e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}
              />
            </div>

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
                placeholder="Any additional information or specific requirements for the IPM routine..."
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
                {isSubmitting ? 'Submitting...' : 'Submit IPM Routine Request'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
