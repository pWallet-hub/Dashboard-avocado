import React, { useState } from "react";
import "../Styles/HarvestingDay.css";
import DashboardHeader from "../../components/Header/DashboardHeader";
import { createHarvestRequest } from '../../services/serviceRequestsService';

export default function HarvestingDay() {
  const [formData, setFormData] = useState({
    workersNeeded: "",
    equipmentNeeded: [],
    equipmentDropdown: "",
    transportationNeeded: "",
    harvestDateFrom: "",
    harvestDateTo: "",
    harvestImages: [],
    selectedSizes: [],
    c12c14: "",
    c16c18: "",
    c20c24: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEquipmentOptions, setShowEquipmentOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sizeCategories = [
    { key: 'c12c14', label: 'C12 & C14' },
    { key: 'c16c18', label: 'C16 & C18' },
    { key: 'c20c24', label: 'C20 & C24' }
  ];

  const sizeLabels = {
    'c12c14': 'C12&C14',
    'c16c18': 'C16&C18', 
    'c20c24': 'C20&C24'
  };

  const equipmentOptions = [
    "Tractors", "Harvesters", "Plows", "Seeders", "Sprayers", 
    "Irrigation Equipment", "Hand Tools", "Transport Vehicles", 
    "Storage Containers", "Weighing Scales", "Processing Equipment", "Other"
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

  const handleSizeSelection = (sizeKey, checked) => {
    setFormData(prev => {
      const currentSizes = prev.selectedSizes || [];
      const updatedSizes = checked
        ? [...currentSizes, sizeKey]
        : currentSizes.filter(item => item !== sizeKey);
      
      return {
        ...prev,
        selectedSizes: updatedSizes,
        [sizeKey]: checked ? prev[sizeKey] : ""
      };
    });
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
    
    if (!formData.workersNeeded) {
      newErrors.workersNeeded = "Please specify how many workers you need";
    }
    
    if (!formData.equipmentDropdown) {
      newErrors.equipmentDropdown = "Please specify if you need equipment";
    } else if (formData.equipmentDropdown === "Yes" && !formData.equipmentNeeded.length) {
      newErrors.equipmentNeeded = "Please select equipment needed";
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
    
    // Validate HASS size breakdown percentages
    const selectedSizes = formData.selectedSizes || [];
    if (selectedSizes.length > 0) {
      const totalPercentage = selectedSizes.reduce((total, size) => {
        return total + parseInt(formData[size] || 0);
      }, 0);
      
      if (totalPercentage > 100) {
        newErrors.hassPercentage = "Total percentage cannot exceed 100%";
      }
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
      const selectedSizes = formData.selectedSizes || [];
      
      const harvestRequestData = {
        workersNeeded: parseInt(formData.workersNeeded),
        equipmentNeeded: formData.equipmentDropdown === "Yes" ? formData.equipmentNeeded : [],
        treesToHarvest: parseInt(formData.transportationNeeded),
        harvestDateFrom: formData.harvestDateFrom,
        harvestDateTo: formData.harvestDateTo,
        harvestImages: formData.harvestImages.map(file => file.name), // In real app, upload files first
        hassBreakdown: {
          selectedSizes: selectedSizes,
          c12c14: selectedSizes.includes('c12c14') ? formData.c12c14 : '',
          c16c18: selectedSizes.includes('c16c18') ? formData.c16c18 : '',
          c20c24: selectedSizes.includes('c20c24') ? formData.c20c24 : ''
        },
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

      // Call the API
      const response = await createHarvestRequest(harvestRequestData);
      
      console.log("Harvest request submitted successfully:", response);
      setSubmitted(true);
      
      // Store locally as backup
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

  // Calculate derived values
  const selectedSizes = formData.selectedSizes || [];
  const totalPercentage = selectedSizes.reduce((total, size) => total + parseInt(formData[size] || 0), 0);

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
                <strong>Equipment Required:</strong> {formData.equipmentDropdown === "Yes" ? formData.equipmentNeeded.join(", ") : "No equipment needed"}<br />
                <strong>Trees to Harvest:</strong> {formData.transportationNeeded}<br />
                <strong>Images Uploaded:</strong> {formData.harvestImages.length}<br />
                <strong>HASS Size Breakdown:</strong> {
                  selectedSizes.length > 0
                    ? selectedSizes.map(size => `${sizeLabels[size]}: ${formData[size] || 0}%`).join(', ')
                    : 'Not specified'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fullscreen container-font">
      <DashboardHeader />
      <div className="container-centered">
        <div className="card-form">
          <h1 className="title-form">Harvesting Day</h1>

          <div className="form-sections">
            {/* First Row */}
            <div className="grid-form">
              <div>
                <label className="label-input">
                  • How Many VBAs Do Need 
                </label>
                <select
                  value={formData.workersNeeded}
                  onChange={(e) => handleInputChange("workersNeeded", e.target.value)}
                  className={`input-field ${errors.workersNeeded ? "input-error" : "input-normal"}`}
                >
                  <option value="" disabled>Select number of workers...</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Worker' : 'Workers'}
                    </option>
                  ))}
                </select>
                {errors.workersNeeded && (
                  <p className="error-text">{errors.workersNeeded}</p>
                )}
              </div>

              <div>
                <label className="label-input">
                  • Do you need any specific equipment?
                </label>
                <select
                  value={formData.equipmentDropdown}
                  onChange={(e) => {
                    handleInputChange("equipmentDropdown", e.target.value);
                    setShowEquipmentOptions(e.target.value === "Yes");
                    if (e.target.value === "No") {
                      handleInputChange("equipmentNeeded", []);
                    }
                  }}
                  className={`input-field ${errors.equipmentDropdown ? "input-error" : "input-normal"}`}
                >
                  <option value="" disabled>Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {errors.equipmentDropdown && (
                  <p className="error-text">{errors.equipmentDropdown}</p>
                )}
                
                {showEquipmentOptions && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {equipmentOptions.map((equipment) => (
                      <label key={equipment} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.equipmentNeeded.includes(equipment)}
                          onChange={(e) => handleEquipmentChange(equipment, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700">{equipment}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {errors.equipmentNeeded && (
                  <p className="error-text">{errors.equipmentNeeded}</p>
                )}
              </div>
            </div>

            {/* Second Row */}
            <div className="grid-form">
              <div>
                <label className="label-input">
                  • How many trees to be harvested?
                </label>
                <input
                  type="number"
                  value={formData.transportationNeeded}
                  onChange={(e) => handleInputChange("transportationNeeded", e.target.value)}
                  className={`input-field ${errors.transportationNeeded ? "input-error" : "input-normal"}`}
                  placeholder="Enter number of trees..."
                  min="1"
                />
                {errors.transportationNeeded && (
                  <p className="error-text">{errors.transportationNeeded}</p>
                )}
              </div>

              <div>
                <label className="label-input">
                  Harvest Date Range (Max 5 days)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">From</label>
                    <input
                      type="date"
                      value={formData.harvestDateFrom}
                      onChange={(e) => handleDateChange("harvestDateFrom", e.target.value)}
                      className={`input-field ${errors.harvestDateFrom ? "input-error" : "input-normal"}`}
                    />
                    {errors.harvestDateFrom && (
                      <p className="error-text text-xs">{errors.harvestDateFrom}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">To</label>
                    <input
                      type="date"
                      value={formData.harvestDateTo}
                      onChange={(e) => handleDateChange("harvestDateTo", e.target.value)}
                      className={`input-field ${errors.harvestDateTo ? "input-error" : "input-normal"}`}
                    />
                    {errors.harvestDateTo && (
                      <p className="error-text text-xs">{errors.harvestDateTo}</p>
                    )}
                  </div>
                </div>
                {errors.harvestDateRange && (
                  <p className="error-text">{errors.harvestDateRange}</p>
                )}
              </div>
            </div>

            {/* HASS Size Breakdown Section */}
            <div>
              <label className="label-input">
                • HASS Size Breakdown Percentage
              </label>
              
              {/* Size Category Selection */}
              <div style={{ marginTop: '10px', marginBottom: '15px' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
                  Select size categories to include:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {sizeCategories.map((size) => (
                    <label key={size.key} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size.key)}
                        onChange={(e) => handleSizeSelection(size.key, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700 font-medium">{size.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Percentage Selection Table - Only show if sizes are selected */}
              {selectedSizes.length > 0 && (
                <div style={{
                  border: '2px solid #000',
                  borderCollapse: 'collapse',
                  width: '100%',
                  marginTop: '10px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#e0e0e0' }}>
                        <th style={{ 
                          border: '1px solid #000', 
                          padding: '10px', 
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }} colSpan={selectedSizes.length}>
                          HASS- SIZE BREAKDOWN PERCENTAGE
                        </th>
                      </tr>
                      <tr>
                        {selectedSizes.map((sizeKey) => (
                          <th key={sizeKey} style={{ 
                            border: '1px solid #000', 
                            padding: '8px', 
                            textAlign: 'center',
                            fontWeight: 'bold',
                            backgroundColor: '#f0f0f0'
                          }}>
                            {sizeLabels[sizeKey]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {selectedSizes.map((sizeKey) => (
                          <td key={sizeKey} style={{ 
                            border: '1px solid #000', 
                            padding: '0',
                            textAlign: 'center'
                          }}>
                            <select
                              value={formData[sizeKey]}
                              onChange={(e) => handleInputChange(sizeKey, e.target.value)}
                              style={{
                                width: '100%',
                                border: 'none',
                                padding: '8px',
                                textAlign: 'center',
                                fontSize: '14px',
                                backgroundColor: 'transparent'
                              }}
                            >
                              <option value="">Select %</option>
                              {Array.from({ length: 21 }, (_, i) => i * 5).map((num) => (
                                <option key={num} value={num}>
                                  {num}%
                                </option>
                              ))}
                            </select>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              
              {errors.hassPercentage && (
                <p className="error-text">{errors.hassPercentage}</p>
              )}
              
              {selectedSizes.length > 0 && (
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Total: {totalPercentage}%
                </p>
              )}
            </div>

            {/* File Upload Section */}
            <div>
              <label className="label-input">
                • Please upload pictures of the crops ready for harvest
              </label>
              <div className="file-upload-container">
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="file-input"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="file-upload-label"
                  >
                    <span className="file-upload-text">Choose a file</span>
                  </label>
                </div>
                <button
                  onClick={() => document.getElementById("file-upload").click()}
                  className="button-upload"
                  type="button"
                >
                  Upload
                </button>
              </div>
              {formData.harvestImages.length > 0 && (
                <div className="uploaded-files-container">
                  <p className="uploaded-files-title">Uploaded files:</p>
                  <div className="uploaded-files-list">
                    {formData.harvestImages.map((file, index) => (
                      <div key={index} className="uploaded-file-item">
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="submit-button-container">
              {errors.submit && (
                <p className="error-text mb-4">{errors.submit}</p>
              )}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="button-submit"
              >
                {isSubmitting ? 'Submitting...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}