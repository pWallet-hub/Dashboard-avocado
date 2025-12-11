import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import '../Styles/FarmerPropertyEvaluation.css';
import DashboardHeader from "../../components/Header/DashboardHeader";
import { 
  createPropertyEvaluationRequest
} from '../../services/serviceRequestsService';

const PropertyEvaluationForm = ({ requestId = null, mode = 'create' }) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    irrigationSource: '',
    irrigationTiming: '',
    soilTesting: '',
    visitStartDate: '',
    visitEndDate: '',
    evaluationPurpose: '',
    priority: 'medium',
    notes: '',
    farmSize: '',
    cropTypes: '',
    currentIrrigationSystem: '',
    soilType: '',
    waterAccess: '',
    location: {
      street_address: '',
      city: '',
      province: ''
    }
  });

  // Load existing request data for edit mode
  useEffect(() => {
    if (mode === 'edit' && requestId) {
      loadRequestData();
    }
  }, [requestId, mode]);

  const loadRequestData = async () => {
    try {
      setLoading(true);
      setError(null);
      const request = await getPropertyEvaluationRequestById(requestId);
      
      // Map API response to form data
      setFormData({
        irrigationSource: request.irrigationSource || '',
        irrigationTiming: request.irrigationTiming || '',
        soilTesting: request.soilTesting ? 'Yes' : 'No',
        visitStartDate: request.visitStartDate || '',
        visitEndDate: request.visitEndDate || '',
        evaluationPurpose: request.evaluationPurpose || '',
        priority: request.priority || 'medium',
        notes: request.notes || '',
        farmSize: request.property_details?.farm_size || '',
        cropTypes: request.property_details?.crop_types || '',
        currentIrrigationSystem: request.property_details?.current_irrigation_system || '',
        soilType: request.property_details?.soil_type || '',
        waterAccess: request.property_details?.water_access || '',
        location: {
          street_address: request.location?.street_address || '',
          city: request.location?.city || '',
          province: request.location?.province || ''
        }
      });
    } catch (err) {
      console.error('Error loading request data:', err);
      setError('Failed to load request data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    
    // Handle nested location fields
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset irrigation timing if user changes irrigation source to "No"
      ...(name === 'irrigationSource' && value === 'No' ? { irrigationTiming: '' } : {})
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.irrigationSource) {
      errors.push('Irrigation source is required');
    }

    if (!formData.visitStartDate || !formData.visitEndDate) {
      errors.push('Visit dates are required');
    }

    if (!formData.location.street_address || !formData.location.city || !formData.location.province) {
      errors.push('Complete location details are required');
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare request data
      const requestData = {
        irrigationSource: formData.irrigationSource,
        irrigationTiming: formData.irrigationTiming,
        soilTesting: formData.soilTesting === 'Yes',
        visitStartDate: formData.visitStartDate,
        visitEndDate: formData.visitEndDate,
        evaluationPurpose: formData.evaluationPurpose,
        priority: formData.priority,
        notes: formData.notes,
        farmSize: formData.farmSize,
        cropTypes: formData.cropTypes,
        currentIrrigationSystem: formData.currentIrrigationSystem,
        soilType: formData.soilType,
        waterAccess: formData.waterAccess,
        location: formData.location
      };

      let response;
      if (mode === 'edit' && requestId) {
        response = await updatePropertyEvaluationRequest(requestId, requestData);
        console.log('Property evaluation request updated:', response);
      } else {
        response = await createPropertyEvaluationRequest(requestData);
        console.log('Property evaluation request created:', response);
      }

      setShowSuccessMessage(true);
    } catch (err) {
      console.error('Error submitting property evaluation request:', err);
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      irrigationSource: '',
      irrigationTiming: '',
      soilTesting: '',
      visitStartDate: '',
      visitEndDate: '',
      evaluationPurpose: '',
      priority: 'medium',
      notes: '',
      farmSize: '',
      cropTypes: '',
      currentIrrigationSystem: '',
      soilType: '',
      waterAccess: '',
      location: {
        street_address: '',
        city: '',
        province: ''
      }
    });
    setShowSuccessMessage(false);
    setError(null);
  };

  const renderSuccessMessage = () => (
    <div className="success-page">
      <div className="success-container">
        <div className="success-icon-wrapper">
          <CheckCircle size={64} className="success-icon" />
        </div>
        
        <h2 className="success-title">
          Property Evaluation {mode === 'edit' ? 'Updated' : 'Submitted'} Successfully!
        </h2>
        <p className="success-message">
          Thank you! We've {mode === 'edit' ? 'updated' : 'received'} your property evaluation request.
        </p>
        
        <button onClick={resetForm} className="success-button">
          {mode === 'edit' ? 'Make Another Update' : 'Submit Another Request'}
        </button>
      </div>
    </div>
  );

  if (showSuccessMessage) {
    return renderSuccessMessage();
  }

  if (loading && mode === 'edit') {
    return (
      <div className="form-page">
        <DashboardHeader />
        <div className="form-container">
          <div className="loading-spinner">Loading request data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
       <DashboardHeader />
      <div className="form-container">
        <h1 className="form-title">
          <span className="underlined">Farmer</span> Property Evaluation
        </h1>
        
        {/* Display error message */}
        {error && (
          <div className="error-message" style={{ 
            backgroundColor: '#fee', 
            color: '#c33', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}
        
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
          {/* Location Fields */}
          <div className="form-field full-width">
            <label className="field-label">• Property Location</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              <input
                type="text"
                name="location.street_address"
                value={formData.location.street_address}
                onChange={handleInputChange}
                placeholder="Street Address"
                className="field-input"
              />
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleInputChange}
                placeholder="City"
                className="field-input"
              />
            </div>
            <input
              type="text"
              name="location.province"
              value={formData.location.province}
              onChange={handleInputChange}
              placeholder="Province"
              className="field-input"
              style={{ marginTop: '10px' }}
            />
          </div>

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
            
            <select
              name="soilTesting"
              value={formData.soilTesting}
              onChange={handleInputChange}
              className="field-select"
            >
              <option value="">Select an option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-field full-width">
            <label className="field-label">
              • In Which Week Can our Farm Property <br />Specialist Visit Your Farm?
            </label>
            
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
                Certified Property Valuation papers are stamped by both ASR and an Accredited Property Valuer to be used within all Banks and MFIs
              </p>
            </div>
            <input
              type="text"
              name="evaluationPurpose"
              value={formData.evaluationPurpose}
              onChange={handleInputChange}
              className="field-input"
              placeholder="Enter your purpose (e.g., Bank loan, Insurance, etc.)"
            />
          </div>

          {/* Additional Fields for Better Evaluation */}
          <div className="form-field">
            <label className="field-label">• Farm Size (in hectares)</label>
            <input
              type="text"
              name="farmSize"
              value={formData.farmSize}
              onChange={handleInputChange}
              className="field-input"
              placeholder="e.g., 2.5 hectares"
            />
          </div>

          <div className="form-field">
            <label className="field-label">• Current Crop Types</label>
            <input
              type="text"
              name="cropTypes"
              value={formData.cropTypes}
              onChange={handleInputChange}
              className="field-input"
              placeholder="e.g., Maize, Beans, Coffee"
            />
          </div>

          <div className="form-field">
            <label className="field-label">• Priority Level</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="field-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-field full-width">
            <label className="field-label">• Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="field-input"
              rows="3"
              placeholder="Any additional information about your property or specific requirements..."
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit} 
          className="save-button"
          disabled={loading}
        >
          {loading ? 'Submitting...' : (mode === 'edit' ? 'Update Request' : 'Save')}
        </button>
      </div>
    </div>
  );
};

export default PropertyEvaluationForm;