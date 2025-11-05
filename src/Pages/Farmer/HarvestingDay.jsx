import React, { useState } from "react";
import "../Styles/HarvestingDay.css";
import DashboardHeader from "../../components/Header/DashboardHeader";
import { createHarvestRequest } from '../../services/serviceRequestsService';

export default function HarvestingDay() {
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
    "Harvest Clipper", "Picking Poles", "plastic crates"
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
      const harvestRequestData = {
        workersNeeded: parseInt(formData.workersNeeded),
        equipmentNeeded: formData.equipmentNeeded,
        treesToHarvest: parseInt(formData.transportationNeeded),
        harvestDateFrom: formData.harvestDateFrom,
        harvestDateTo: formData.harvestDateTo,
        harvestImages: formData.harvestImages.map(file => file.name),
        location: {
          province: localStorage.getItem('farmerProvince') || 'Eastern Province',
          district: localStorage.getItem('farmerDistrict') || 'Gatsibo',
          sector: localStorage.getItem('farmerSector') || 'Kageyo',
          cell: localStorage.getItem('farmerCell') || 'Karangazi',
          village: localStorage.getItem('farmerVillage') || 'Nyagatare'
        },
        priority: 'medium',
        notes: `Ready for harvest. Trees are at full maturity with good fruit quality. Request for ${formData.transportationNeeded} trees requiring ${formData.workersNeeded} workers.`
      };

      const response = await createHarvestRequest(harvestRequestData);
      
      console.log("Harvest request submitted successfully:", response);
      setSubmitted(true);
      
      const farmerName = localStorage.getItem('farmerName') || 'John Doe';
      const farmerPhone = localStorage.getItem('farmerPhone') || '+250 123 456 789';
      const farmerEmail = localStorage.getItem('farmerEmail') || 'farmer@example.com';
      const farmerLocation = localStorage.getItem('farmerLocation') || 'Kigali, Rwanda';

      const newRequest = {
        id: response.id || Date.now().toString(),
        type: 'Harvesting Day',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        farmerName,
        farmerPhone,
        farmerEmail,
        farmerLocation,
        ...harvestRequestData
      };

      const existingRequests = JSON.parse(localStorage.getItem('farmerServiceRequests') || '[]');
      const updatedRequests = [...existingRequests, newRequest];
      localStorage.setItem('farmerServiceRequests', JSON.stringify(updatedRequests));
      
    } catch (error) {
      console.error('Error submitting harvest request:', error);
      setErrors({ submit: error.message || 'Failed to submit harvest request. Please try again.' });
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
            <h2 className="title-submitted">Harvest Plan Submitted!</h2>
            <p className="text-submitted">
              Your harvest planning request has been received. Our team will coordinate the resources and contact you within 24 hours to confirm the arrangements.
            </p>
            <div className="summary-container">
              <p className="summary-text">
                <strong>Harvest Period:</strong> {formData.harvestDateFrom} to {formData.harvestDateTo}<br />
                <strong>Workers Needed:</strong> {formData.workersNeeded}<br />
                <strong>Equipment Required:</strong> {formData.equipmentNeeded.length > 0 ? formData.equipmentNeeded.join(", ") : "No equipment needed"}<br />
                <strong>Trees to Harvest:</strong> {formData.transportationNeeded}<br />
                <strong>Images Uploaded:</strong> {formData.harvestImages.length}
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
              gap: '15px',
              marginBottom: '25px'
            }}>
              {equipmentOptions.map((equipment) => (
                <label 
                  key={equipment} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    padding: '12px',
                    backgroundColor: formData.equipmentNeeded.includes(equipment) ? '#e8f5e9' : '#f5f5f5',
                    borderRadius: '6px',
                    border: formData.equipmentNeeded.includes(equipment) ? '2px solid #080a10e3' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.equipmentNeeded.includes(equipment)}
                    onChange={(e) => handleEquipmentChange(equipment, e.target.checked)}
                    style={{ 
                      marginRight: '12px', 
                      width: '20px', 
                      height: '20px',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ fontSize: '15px', color: '#1f2937' }}>{equipment}</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => setShowEquipmentModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#080a10e3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
              }}
            >
              Done ({formData.equipmentNeeded.length} selected)
            </button>
          </div>
        </div>
      )}

      <DashboardHeader />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0px' }}>
        <div style={{ 
          backgroundColor: '#f5f5f0', 
          padding: '15px 16px',
          borderRadius: '0',
          boxShadow: 'none'
        }}>
          <h1 style={{ 
            textAlign: 'center', 
            fontSize: '28px',
            fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
            color: '#080a10e3',
            marginBottom: '15px',
            fontWeight: 'normal',
            letterSpacing: '0.5px'
          }}>
            Book Your Harvesting Day
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Workers Needed */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                How Many VBAs Do You Need<span style={{ color: '#c44' }}>*</span>
              </label>
              <input
                type="number"
                value={formData.workersNeeded}
                onChange={(e) => handleInputChange("workersNeeded", Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: errors.workersNeeded ? '1px solid #c44' : '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}
                placeholder="Enter number of workers..."
              />
            </div>
            {errors.workersNeeded && (
              <p style={{ color: '#c44', fontSize: '13px', marginTop: '-12px', marginLeft: '265px' }}>{errors.workersNeeded}</p>
            )}

            {/* Equipment Needed - Modal Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                Which Equipment do You Need? 
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

            {/* Trees to Harvest */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                whiteSpace: 'nowrap',
                minWidth: '250px'
              }}>
                How many trees to be harvested?<span style={{ color: '#c44' }}>*</span>
              </label>
              <input
                type="number"
                value={formData.transportationNeeded}
                onChange={(e) => handleInputChange("transportationNeeded", e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: errors.transportationNeeded ? '1px solid #c44' : '1px solid #b8c5b3',
                  borderRadius: '3px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                }}
                placeholder="Enter number of trees..."
                min="1"
              />
            </div>
            {errors.transportationNeeded && (
              <p style={{ color: '#c44', fontSize: '13px', marginTop: '-12px', marginLeft: '265px' }}>{errors.transportationNeeded}</p>
            )}

            {/* Harvest Date Range */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontSize: '15px',
                color: '#080a10e3',
                fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
              }}>
                Harvest Date Range (Max 5 days)<span style={{ color: '#c44' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#374151', marginBottom: '4px', display: 'block' }}>From</label>
                  <input
                    type="date"
                    value={formData.harvestDateFrom}
                    onChange={(e) => handleDateChange("harvestDateFrom", e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.harvestDateFrom ? '1px solid #c44' : '1px solid #b8c5b3',
                      borderRadius: '3px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                    }}
                  />
                  {errors.harvestDateFrom && (
                    <p style={{ color: '#c44', fontSize: '12px', marginTop: '3px' }}>{errors.harvestDateFrom}</p>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#374151', marginBottom: '4px', display: 'block' }}>To</label>
                  <input
                    type="date"
                    value={formData.harvestDateTo}
                    onChange={(e) => handleDateChange("harvestDateTo", e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.harvestDateTo ? '1px solid #c44' : '1px solid #b8c5b3',
                      borderRadius: '3px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                    }}
                  />
                  {errors.harvestDateTo && (
                    <p style={{ color: '#c44', fontSize: '12px', marginTop: '3px' }}>{errors.harvestDateTo}</p>
                  )}
                </div>
              </div>
              {errors.harvestDateRange && (
                <p style={{ color: '#c44', fontSize: '13px', marginTop: '4px' }}>{errors.harvestDateRange}</p>
              )}
            </div>

            {/* File Upload */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <label style={{ 
                  minWidth: '250px',
                  fontSize: '15px',
                  color: '#080a10e3',
                  fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
                  whiteSpace: 'nowrap'
                }}>
                  Upload pictures of crops ready for harvest
                </label>
                <div style={{ flex: 1, display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '1px solid #b8c5b3',
                      borderRadius: '3px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#374151',
                      fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                    }}
                  >
                    Choose files...
                  </label>
                  <button
                    onClick={() => document.getElementById("file-upload").click()}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: '#080a10e3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif'
                    }}
                    type="button"
                  >
                    Upload
                  </button>
                </div>
              </div>
              {formData.harvestImages.length > 0 && (
                <div style={{ marginTop: '10px', marginLeft: '265px' }}>
                  <p style={{ fontSize: '13px', color: '#080a10e3', marginBottom: '5px', fontWeight: '600' }}>
                    Uploaded files:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {formData.harvestImages.map((file, index) => (
                      <div key={index} style={{ 
                        fontSize: '12px', 
                        color: '#374151',
                        padding: '4px 8px',
                        backgroundColor: '#f5f5f0',
                        borderRadius: '2px'
                      }}>
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                {isSubmitting ? 'Submitting...' : 'Submit '}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



