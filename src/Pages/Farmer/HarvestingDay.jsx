import React, { useState } from "react";
import "../Styles/HarvestingDay.css";
import DashboardHeader from "../../components/Header/DashboardHeader";

export default function HarvestingDay() {
  const [formData, setFormData] = useState({
    workersNeeded: "",
    equipmentNeeded: [], // Changed to array for checkbox selection
    equipmentDropdown: "", // New field for dropdown selection
    transportationNeeded: "",
    harvestDateFrom: "",
    harvestDateTo: "",
    harvestImages: []
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEquipmentOptions, setShowEquipmentOptions] = useState(false);

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
    
    // Validate date range if both dates are set
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
      } else {
        setErrors(prev => ({
          ...prev,
          harvestDateRange: ""
        }));
      }
      
      if (toDate < fromDate) {
        setErrors(prev => ({
          ...prev,
          harvestDateRange: "End date must be after start date"
        }));
        return;
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.workersNeeded) newErrors.workersNeeded = "Please specify how many workers you need";
    if (formData.equipmentDropdown === "Yes" && !formData.equipmentNeeded.length) newErrors.equipmentNeeded = "Please select equipment needed";
    if (!formData.equipmentDropdown) newErrors.equipmentDropdown = "Please specify if you need equipment";
    if (!formData.transportationNeeded.trim()) newErrors.transportationNeeded = "Please specify transportation needs";
    if (!formData.harvestDateFrom) newErrors.harvestDateFrom = "Please select harvest start date";
    if (!formData.harvestDateTo) newErrors.harvestDateTo = "Please select harvest end date";
    
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

  const handleSubmit = () => {
    if (validateForm()) {
      // Get farmer information from localStorage or use default values
      const farmerName = localStorage.getItem('farmerName') || 'John Doe';
      const farmerPhone = localStorage.getItem('farmerPhone') || '+250 123 456 789';
      const farmerEmail = localStorage.getItem('farmerEmail') || 'farmer@example.com';
      const farmerLocation = localStorage.getItem('farmerLocation') || 'Kigali, Rwanda';

      const newRequest = {
        id: Date.now().toString(),
        type: 'Harvesting Day',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        farmerName,
        farmerPhone,
        farmerEmail,
        farmerLocation,
        workersNeeded: formData.workersNeeded,
        equipmentNeeded: formData.equipmentNeeded,
        transportationNeeded: formData.transportationNeeded,
        harvestDateFrom: formData.harvestDateFrom,
        harvestDateTo: formData.harvestDateTo,
        harvestImages: formData.harvestImages.map(file => file.name)
      };

      // Get existing requests from localStorage
      const existingRequests = JSON.parse(localStorage.getItem('farmerServiceRequests') || '[]');
      const updatedRequests = [...existingRequests, newRequest];
      
      // Save to localStorage
      localStorage.setItem('farmerServiceRequests', JSON.stringify(updatedRequests));
      
      setSubmitted(true);
      console.log("Harvest plan submitted:", formData);
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
                <strong>Equipment Required:</strong> {formData.equipmentDropdown === "Yes" ? formData.equipmentNeeded.join(", ") : "No equipment needed"}<br />
                <strong>Transportation Needed:</strong> {formData.transportationNeeded}<br />
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
                    {[
                      "Tractors",
                      "Harvesters", 
                      "Plows",
                      "Seeders",
                      "Sprayers",
                      "Irrigation Equipment",
                      "Hand Tools",
                      "Transport Vehicles",
                      "Storage Containers",
                      "Weighing Scales",
                      "Processing Equipment",
                      "Other"
                    ].map((equipment) => (
                      <label key={equipment} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.equipmentNeeded.includes(equipment)}
                          onChange={(e) => {
                            const currentEquipment = formData.equipmentNeeded;
                            const updatedEquipment = e.target.checked
                              ? [...currentEquipment, equipment]
                              : currentEquipment.filter(item => item !== equipment);
                            handleInputChange("equipmentNeeded", updatedEquipment);
                          }}
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
                  type="text"
                  value={formData.transportationNeeded}
                  onChange={(e) => handleInputChange("transportationNeeded", e.target.value)}
                  className={`input-field ${errors.transportationNeeded ? "input-error" : "input-normal"}`}
                  placeholder="Describe transportation needs..."
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
                    accept="image"
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
              <button
                onClick={handleSubmit}
                className="button-submit"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}