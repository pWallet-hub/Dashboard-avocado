import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import '../Styles/FarmerPropertyEvaluation.css';
import DashboardHeader from "../../components/header/DashboardHeader";

const PropertyEvaluationForm = () => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState({
    irrigationSource: '',
    irrigationTiming: '',
    soilTesting: '',
    visitStartDate: '',
    visitEndDate: '',
    evaluationPurpose: ''
  });

  // Date range picker component
  const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    
    const handleStartDateChange = (e) => {
      const selectedStart = e.target.value;
      onStartDateChange(selectedStart);
      
      // Auto-calculate end date (5 days later)
      if (selectedStart) {
        const startDateObj = new Date(selectedStart);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + 4); // 5-day range (inclusive)
        const endDateString = endDateObj.toISOString().split('T')[0];
        onEndDateChange(endDateString);
      }
    };

    const formatDateRange = () => {
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
      return '';
    };

    return (
      <div className="date-range-picker">
        <div className="date-input-container">
          <div className="date-input-wrapper">
            <label className="date-label">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              min={minDate}
              className="date-input"
            />
          </div>
          
          <div className="date-range-arrow">→</div>
          
          <div className="date-input-wrapper">
            <label className="date-label">End Date (Auto-calculated)</label>
            <input
              type="date"
              value={endDate}
              readOnly
              className="date-input date-input-readonly"
            />
          </div>
        </div>
        
        {startDate && endDate && (
          <div className="selected-range-display">
            <span className="range-icon">📅</span>
            <span className="range-text">Selected Range: <strong>{formatDateRange()}</strong></span>
            <span className="range-days">(5 days)</span>
          </div>
        )}
      </div>
    );
  };

  const handleDateChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset irrigation timing if user changes irrigation source to "No"
      ...(name === 'irrigationSource' && value === 'No' ? { irrigationTiming: '' } : {})
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setShowSuccessMessage(true);
  };

  const resetForm = () => {
    setFormData({
      irrigationSource: '',
      irrigationTiming: '',
      soilTesting: '',
      visitStartDate: '',
      visitEndDate: '',
      evaluationPurpose: ''
    });
    setShowSuccessMessage(false);
  };

  const renderSuccessMessage = () => (
    <div className="success-page">
      <div className="success-container">
        <div className="success-icon-wrapper">
          <CheckCircle size={64} className="success-icon" />
        </div>
        
        <h2 className="success-title">Property Evaluation Submitted Successfully!</h2>
        <p className="success-message">Thank you! We've received your property evaluation request.</p>
        
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
          <span className="underlined">Farmer</span> Property Evaluation
        </h1>
        
        {/* Amazing Explanation Paragraph */}
        <div className="explanation-container">
          <div className="explanation-card">
            <div className="decorative-line">
              <div className="line-left"></div>
              <div className="center-dot"></div>
              <div className="line-right"></div>
            </div>
            
            <p className="explanation-text">
              Take your <span className="highlight-green">farm financials</span> and{' '}
              <span className="highlight-blue">growth</span> to the next level by digitizing your{' '}
              <span className="highlight-purple">plantation property value</span> with our{' '}
              <span className="highlight-gradient">experts</span>.
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
            <label className="field-label">
              • Do you want to upgrade your farm and water irrigation?
            </label>
            <select
              name="irrigationSource"
              value={formData.irrigationSource}
              onChange={handleInputChange}
              className="field-select"
            >
              <option value="">Select an option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            
            {/* Conditional sub-dropdown */}
            {formData.irrigationSource === 'Yes' && (
              <div className="sub-field">
                <label className="sub-field-label">
                  When would you like to upgrade?
                </label>
                <select
                  name="irrigationTiming"
                  value={formData.irrigationTiming}
                  onChange={handleInputChange}
                  className="field-select sub-select"
                >
                  <option value="">Select timing</option>
                  <option value="This Coming Season">This Coming Season</option>
                  <option value="Next Year">Next Year</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-field">
            <label className="field-label">
              • Have you done any soil testing?
            </label>
            
            {/* Soil Testing Introduction */}
            <div className="soil-testing-intro">
              <p className="intro-text">
                Take control of your <span className="highlight-orange">fertilizer input cost</span> and optimize your <span className="highlight-green">cost of production</span> with <span className="highlight-blue">soil testing</span>!
              </p>
            </div>
            
            <input
              type="text"
              name="soilTesting"
              value={formData.soilTesting}
              onChange={handleInputChange}
              className="field-input"
            />
          </div>

          <div className="form-field full-width">
            <label className="field-label">
              • In Which Week Can our Farm Property <br />Specialist Visit Your Farm?
            </label>
            
            {/* Farm Visit Information */}
            
            
            <DateRangePicker
              startDate={formData.visitStartDate}
              endDate={formData.visitEndDate}
              onStartDateChange={(date) => handleDateChange('visitStartDate', date)}
              onEndDateChange={(date) => handleDateChange('visitEndDate', date)}
            />
          </div>

          <div className="form-field full-width">
            <label className="field-label">
              • Do you want us to send you Certified Property Valuation Document?
            </label>
            <div className="farm-visit-info">
              <p className="visit-info-text">
                Certified Property  Valuation papers are stamped by both ASR and an Accredited Property Valuer to be used withing all Banks and MFIs
              </p>
            </div>
            <input
              type="text"
              name="evaluationPurpose"
              value={formData.evaluationPurpose}
              onChange={handleInputChange}
              className="field-input"
            />
          </div>
        </div>

        <button onClick={handleSubmit} className="save-button">
          Save
        </button>
      </div>
    </div>
  );
};

export default PropertyEvaluationForm;