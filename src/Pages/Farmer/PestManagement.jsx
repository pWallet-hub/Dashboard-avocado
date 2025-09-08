import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import DashboardHeader from "../../components/Header/DashboardHeader";

const PestManagement = () => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    firstPestDisease: '',
    secondPestDisease: '',
    thirdPestDisease: '',
    firstPestDate: '',
    secondPestDate: '',
    thirdPestDate: '',
    firstNoticed: '',
    damageObserved: '',
    damageObservedOther: '',
    controlMethods: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      console.log('Uploading file:', selectedFile.name);
      // Handle file upload logic here
    }
  };

  const validateForm = () => {
    if (!formData.firstPestDisease.trim()) {
      alert('Please enter the 1st Pest or Disease Name (mandatory field)');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Get farmer information from localStorage or use default values
    const farmerName = localStorage.getItem('farmerName') || localStorage.getItem('username') || 'John Doe';
    const farmerPhone = localStorage.getItem('farmerPhone') || '+250 123 456 789';
    const farmerEmail = localStorage.getItem('farmerEmail') || localStorage.getItem('username') || 'farmer@example.com';
    const farmerLocation = localStorage.getItem('farmerLocation') || 'Kigali, Rwanda';

    const newRequest = {
      id: Date.now().toString(),
      type: 'Pest Management',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      farmerName,
      farmerPhone,
      farmerEmail,
      farmerLocation,
      firstPestDisease: formData.firstPestDisease,
      secondPestDisease: formData.secondPestDisease,
      thirdPestDisease: formData.thirdPestDisease,
      firstPestDate: formData.firstPestDate,
      secondPestDate: formData.secondPestDate,
      thirdPestDate: formData.thirdPestDate,
      firstNoticed: formData.firstNoticed,
      damageObserved: formData.damageObserved,
      damageObservedOther: formData.damageObservedOther,
      controlMethods: formData.controlMethods,
      uploadedImage: selectedFile ? selectedFile.name : null
    };

    // Get existing requests from localStorage
    const existingRequests = JSON.parse(localStorage.getItem('farmerServiceRequests') || '[]');
    const updatedRequests = [...existingRequests, newRequest];
    
    // Save to localStorage
    localStorage.setItem('farmerServiceRequests', JSON.stringify(updatedRequests));
    
    console.log('Pest Management request submitted:', newRequest);
    setShowSuccessMessage(true);
  };

  const resetForm = () => {
    setFormData({
      firstPestDisease: '',
      secondPestDisease: '',
      thirdPestDisease: '',
      firstPestDate: '',
      secondPestDate: '',
      thirdPestDate: '',
      firstNoticed: '',
      damageObserved: '',
      damageObservedOther: '',
      controlMethods: ''
    });
    setSelectedFile(null);
    setShowSuccessMessage(false);
  };

  const damageOptions = [
    { value: '', label: 'Select damage observed' },
    { value: 'Fruits Damage', label: 'Fruits Damage' },
    { value: 'Some Leaves Damage', label: 'Some Leaves Damage' },
    { value: 'Tree Trunk Damage', label: 'Tree Trunk Damage' },
    { value: 'Root Rot', label: 'Root Rot' },
    { value: 'Other', label: 'Other' }
  ];

  const renderSuccessMessage = () => (
    <div className="success-page">
      <div className="success-container">
        <div className="success-icon-wrapper">
          <CheckCircle size={64} className="success-icon" />
        </div>
        
        <h2 className="success-title">Pest Management Information Submitted Successfully!</h2>
        <p className="success-message">Thank you! We've received your pest management information.</p>
        
        <button onClick={resetForm} className="success-button">
          Submit Another Request
        </button>
      </div>
    </div>
  );

  if (showSuccessMessage) {
    return renderSuccessMessage();
  }

  return (
    <div className="form-page">
      <DashboardHeader />
      <div className="form-container">
        <h1 className="form-title">
          <span className="underlined">Pest</span> Management
        </h1>
        <div className="explanation-container">
          <div className="explanation-card">
            <div className="decorative-line">
              <div className="line-left"></div>
              <div className="center-dot"></div>
              <div className="line-right"></div>
            </div>
            
            <p className="explanation-text">
              Take your Integrated Pest Management (IPM) to the next level and safeguard our Society's production quality assurance for better market and prices!
            </p>
            
            <div className="animated-dots">
              <div className="dot dot-1"></div>
              <div className="dot dot-2"></div>
              <div className="dot dot-3"></div>
            </div>
          </div>
        </div>
        
        <div className="form-grid">
          <div className="form-field">
            <label className="field-label required">
              <strong>• What Pest or Disease Are You Dealing With?</strong> <span className="mandatory-asterisk">*</span>
            </label>
            <input
              type="text"
              name="firstPestDisease"
              value={formData.firstPestDisease}
              onChange={handleInputChange}
              className="field-input"
              placeholder="Enter pest or disease name"
              required
            />
            {formData.firstPestDisease && (
              <div className="date-question">
                <label className="field-label">
                  • When did you first spot this on your farm?
                </label>
                <input
                  type="date"
                  name="firstPestDate"
                  value={formData.firstPestDate}
                  onChange={handleInputChange}
                  className="field-input date-input"
                />
              </div>
            )}
          </div>

          <div className="form-field">
            <label className="field-label">
              <strong>• What Pest or Disease Are You Dealing With?</strong> <span className="optional-text">(Optional)</span>
            </label>
            <input
              type="text"
              name="secondPestDisease"
              value={formData.secondPestDisease}
              onChange={handleInputChange}
              className="field-input"
              placeholder="Enter pest or disease name (optional)"
            />
            {formData.secondPestDisease && (
              <div className="date-question">
                <label className="field-label">
                  • When did you first spot this on your farm?
                </label>
                <input
                  type="date"
                  name="secondPestDate"
                  value={formData.secondPestDate}
                  onChange={handleInputChange}
                  className="field-input date-input"
                />
              </div>
            )}
          </div>

          <div className="form-field">
            <label className="field-label">
              <strong>• What Pest or Disease Are You Dealing With?</strong> <span className="optional-text">(Optional)</span>
            </label>
            <input
              type="text"
              name="thirdPestDisease"
              value={formData.thirdPestDisease}
              onChange={handleInputChange}
              className="field-input"
              placeholder="Enter pest or disease name (optional)"
            />
            {formData.thirdPestDisease && (
              <div className="date-question">
                <label className="field-label">
                  • When did you first spot this on your farm?
                </label>
                <input
                  type="date"
                  name="thirdPestDate"
                  value={formData.thirdPestDate}
                  onChange={handleInputChange}
                  className="field-input date-input"
                />
              </div>
            )}
          </div>

          <div className="form-field">
            <label className="field-label">
              • When did you first notice the pests?
            </label>
            <input
              type="text"
              name="firstNoticed"
              value={formData.firstNoticed}
              onChange={handleInputChange}
              className="field-input"
              placeholder="e.g., 2 weeks ago, last month..."
            />
          </div>

          <div className="form-field">
            <label className="field-label">
              • What damage have you observed?
            </label>
            <select
              name="damageObserved"
              value={formData.damageObserved}
              onChange={handleInputChange}
              className="field-input"
            >
              {damageOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formData.damageObserved && (
              <input
                type="text"
                name="damageObservedOther"
                value={formData.damageObservedOther}
                onChange={handleInputChange}
                className="field-input"
                placeholder={formData.damageObserved === 'Other' ? "Please specify other damage..." : "Provide details for selected damage..."}
              />
            )}
          </div>

          <div className="form-field">
            <label className="field-label">
              • What pest control methods have you tried?
            </label>
            <input
              type="text"
              name="controlMethods"
              value={formData.controlMethods}
              onChange={handleInputChange}
              className="field-input"
              placeholder="List methods you've already tried..."
            />
          </div>

          <div className="form-field full-width">
            <label className="field-label">
              • Please upload a picture of the pests and crops?
            </label>
            <div className="professional-upload-container">
              <div className="upload-area">
                <input
                  type="file"
                  id="file-input"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden-file-input"
                />
                <label htmlFor="file-input" className="upload-zone">
                  <div className="upload-content">
                    <div className="upload-icon">📁</div>
                    <div className="upload-text">
                      <span className="upload-primary">
                        {selectedFile ? selectedFile.name : 'Click to upload image'}
                      </span>
                      <span className="upload-secondary">
                        or drag and drop your file here
                      </span>
                    </div>
                  </div>
                </label>
              </div>
              {selectedFile && (
                <button 
                  type="button" 
                  onClick={handleUpload}
                  className="professional-upload-button"
                >
                  Upload File
                </button>
              )}
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} className="save-button">
          Save
        </button>
      </div>
    </div>
  );
};

export default PestManagement;