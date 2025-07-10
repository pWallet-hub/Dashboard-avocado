import React, { useState } from 'react';
import { Droplets, TestTube, FileText, Home, CheckCircle, Upload } from 'lucide-react';

export default function FarmerPropertyEvaluation() {
  const [formData, setFormData] = useState({
    irrigationType: '',
    customIrrigation: '',
    waterSource: '',
    customWaterSource: '',
    irrigationCapacity: '',
    soilTestingDone: '',
    soilTestDate: '',
    soilTestResults: '',
    soilTestLab: '',
    evaluationPurpose: '',
    customPurpose: '',
    additionalDetails: '',
    documents: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const irrigationTypes = [
    'Drip Irrigation',
    'Sprinkler System',
    'Flood Irrigation',
    'Micro-sprinkler',
    'Furrow Irrigation',
    'Manual Watering',
    'Rain-fed Only',
    'Other (specify)'
  ];

  const waterSources = [
    'Borehole/Well',
    'River/Stream',
    'Municipal Water',
    'Dam/Reservoir',
    'Rainwater Harvesting',
    'Spring Water',
    'Other (specify)'
  ];

  const evaluationPurposes = [
    'Property Sale',
    'Bank Loan/Mortgage',
    'Insurance Valuation',
    'Investment Analysis',
    'Estate Planning',
    'Tax Assessment',
    'Partnership Evaluation',
    'Other (specify)'
  ];

  const stepTitles = [
    'Irrigation System',
    'Soil Testing',
    'Evaluation Purpose'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    
    switch (currentStep) {
      case 1:
        if (!formData.irrigationType) {
          newErrors.irrigationType = 'Please select an irrigation type';
        }
        if (formData.irrigationType === 'Other (specify)' && !formData.customIrrigation.trim()) {
          newErrors.customIrrigation = 'Please specify the irrigation type';
        }
        if (!formData.waterSource) {
          newErrors.waterSource = 'Please select a water source';
        }
        if (formData.waterSource === 'Other (specify)' && !formData.customWaterSource.trim()) {
          newErrors.customWaterSource = 'Please specify the water source';
        }
        break;
        
      case 2:
        if (!formData.soilTestingDone) {
          newErrors.soilTestingDone = 'Please indicate if soil testing has been done';
        }
        if (formData.soilTestingDone === 'yes' && !formData.soilTestDate) {
          newErrors.soilTestDate = 'Please provide the soil test date';
        }
        if (formData.soilTestingDone === 'yes' && !formData.soilTestResults.trim()) {
          newErrors.soilTestResults = 'Please provide soil test results summary';
        }
        break;
        
      case 3:
        if (!formData.evaluationPurpose) {
          newErrors.evaluationPurpose = 'Please select the evaluation purpose';
        }
        if (formData.evaluationPurpose === 'Other (specify)' && !formData.customPurpose.trim()) {
          newErrors.customPurpose = 'Please specify the evaluation purpose';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < 3) setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      setSubmitted(true);
      // Here you would typically send the data to your backend
      console.log('Farmer property evaluation submitted:', formData);
    }
  };

  const progressPercentage = (currentStep / 3) * 100;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Farm Property Evaluation Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for providing the farm property evaluation information. Our certified agricultural appraisers will review your submission and contact you within 48 hours to schedule the property visit.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setCurrentStep(1);
              setFormData({
                irrigationType: '',
                customIrrigation: '',
                waterSource: '',
                customWaterSource: '',
                irrigationCapacity: '',
                soilTestingDone: '',
                soilTestDate: '',
                soilTestResults: '',
                soilTestLab: '',
                evaluationPurpose: '',
                customPurpose: '',
                additionalDetails: '',
                documents: []
              });
              setErrors({});
            }}
            className="text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            style={{ backgroundColor: '#1F310A' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#15250A'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#1F310A'}
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#1F310A20' }}>
              <Home className="w-8 h-8" style={{ color: '#1F310A' }} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Farmer Property Evaluation Request
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Help us evaluate your farm property by providing key information about irrigation systems, soil conditions, and evaluation purpose.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of 3: {stepTitles[currentStep - 1]}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="h-3 rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${progressPercentage}%`,
                background: `linear-gradient(to right, #1F310A, #2A4010)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step 1: Irrigation System */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Droplets className="w-6 h-6 mr-2" style={{ color: '#1F310A' }} />
                Farm Irrigation System Information
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Type of Irrigation System *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {irrigationTypes.map((type) => (
                      <label key={type} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="irrigationType"
                          value={type}
                          checked={formData.irrigationType === type}
                          onChange={(e) => handleInputChange('irrigationType', e.target.value)}
                          className="mr-3"
                          style={{ accentColor: '#1F310A' }}
                        />
                        <span className="text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                  {errors.irrigationType && (
                    <p className="mt-2 text-sm text-red-600">{errors.irrigationType}</p>
                  )}
                  {formData.irrigationType === 'Other (specify)' && (
                    <div className="mt-4">
                      <input
                        type="text"
                        placeholder="Please specify the irrigation type"
                        value={formData.customIrrigation}
                        onChange={(e) => handleInputChange('customIrrigation', e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-opacity-50 ${
                          errors.customIrrigation ? 'border-red-500' : 'border-gray-300'
                        }`}
                        style={{ 
                          '--tw-ring-color': '#1F310A',
                          borderColor: errors.customIrrigation ? '#EF4444' : '#D1D5DB'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1F310A';
                          e.target.style.boxShadow = `0 0 0 2px ${('#1F310A')}40`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.customIrrigation ? '#EF4444' : '#D1D5DB';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      {errors.customIrrigation && (
                        <p className="mt-2 text-sm text-red-600">{errors.customIrrigation}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Water Source *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {waterSources.map((source) => (
                      <label key={source} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="waterSource"
                          value={source}
                          checked={formData.waterSource === source}
                          onChange={(e) => handleInputChange('waterSource', e.target.value)}
                          className="mr-3"
                          style={{ accentColor: '#1F310A' }}
                        />
                        <span className="text-gray-700">{source}</span>
                      </label>
                    ))}
                  </div>
                  {errors.waterSource && (
                    <p className="mt-2 text-sm text-red-600">{errors.waterSource}</p>
                  )}
                  {formData.waterSource === 'Other (specify)' && (
                    <div className="mt-4">
                      <input
                        type="text"
                        placeholder="Please specify the water source"
                        value={formData.customWaterSource}
                        onChange={(e) => handleInputChange('customWaterSource', e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-opacity-50 ${
                          errors.customWaterSource ? 'border-red-500' : 'border-gray-300'
                        }`}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1F310A';
                          e.target.style.boxShadow = `0 0 0 2px ${('#1F310A')}40`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.customWaterSource ? '#EF4444' : '#D1D5DB';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      {errors.customWaterSource && (
                        <p className="mt-2 text-sm text-red-600">{errors.customWaterSource}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Irrigation Capacity/Coverage (Optional)
                  </label>
                  <textarea
                    placeholder="e.g., Covers 5 hectares, 2000 liters per hour, operates 6 hours daily"
                    rows="3"
                    value={formData.irrigationCapacity}
                    onChange={(e) => handleInputChange('irrigationCapacity', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-opacity-50"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1F310A';
                      e.target.style.boxShadow = `0 0 0 2px ${('#1F310A')}40`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D1D5DB';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Soil Testing */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <TestTube className="w-6 h-6 mr-2" style={{ color: '#1F310A' }} />
                Farm Soil Testing Information
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Have you done any soil testing on your farm? *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="soilTestingDone"
                        value="yes"
                        checked={formData.soilTestingDone === 'yes'}
                        onChange={(e) => handleInputChange('soilTestingDone', e.target.value)}
                        className="mr-3"
                        style={{ accentColor: '#1F310A' }}
                      />
                      <span className="text-gray-700">Yes, I have soil test results</span>
                    </label>
                    <label className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="soilTestingDone"
                        value="no"
                        checked={formData.soilTestingDone === 'no'}
                        onChange={(e) => handleInputChange('soilTestingDone', e.target.value)}
                        className="mr-3"
                        style={{ accentColor: '#1F310A' }}
                      />
                      <span className="text-gray-700">No, soil testing has not been done</span>
                    </label>
                  </div>
                  {errors.soilTestingDone && (
                    <p className="mt-2 text-sm text-red-600">{errors.soilTestingDone}</p>
                  )}
                </div>

                {formData.soilTestingDone === 'yes' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of soil testing *
                      </label>
                      <input
                        type="date"
                        value={formData.soilTestDate}
                        onChange={(e) => handleInputChange('soilTestDate', e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-opacity-50 ${
                          errors.soilTestDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1F310A';
                          e.target.style.boxShadow = `0 0 0 2px ${('#1F310A')}40`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.soilTestDate ? '#EF4444' : '#D1D5DB';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      {errors.soilTestDate && (
                        <p className="mt-2 text-sm text-red-600">{errors.soilTestDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Laboratory/Testing Organization
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., National Agricultural Laboratory, Private Soil Lab"
                        value={formData.soilTestLab}
                        onChange={(e) => handleInputChange('soilTestLab', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-opacity-50"
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1F310A';
                          e.target.style.boxShadow = `0 0 0 2px ${('#1F310A')}40`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#D1D5DB';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Summary of soil test results *
                      </label>
                      <textarea
                        placeholder="e.g., pH 6.5, high organic matter, adequate nitrogen, low phosphorus, good drainage"
                        rows="4"
                        value={formData.soilTestResults}
                        onChange={(e) => handleInputChange('soilTestResults', e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-opacity-50 ${
                          errors.soilTestResults ? 'border-red-500' : 'border-gray-300'
                        }`}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1F310A';
                          e.target.style.boxShadow = `0 0 0 2px ${('#1F310A')}40`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.soilTestResults ? '#EF4444' : '#D1D5DB';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      {errors.soilTestResults && (
                        <p className="mt-2 text-sm text-red-600">{errors.soilTestResults}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Evaluation Purpose */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2" style={{ color: '#1F310A' }} />
                Farm Property Evaluation Purpose
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What is the purpose of this farm property evaluation? *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {evaluationPurposes.map((purpose) => (
                      <label key={purpose} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="evaluationPurpose"
                          value={purpose}
                          checked={formData.evaluationPurpose === purpose}
                          onChange={(e) => handleInputChange('evaluationPurpose', e.target.value)}
                          className="mr-3"
                          style={{ accentColor: '#1F310A' }}
                        />
                        <span className="text-gray-700">{purpose}</span>
                      </label>
                    ))}
                  </div>
                  {errors.evaluationPurpose && (
                    <p className="mt-2 text-sm text-red-600">{errors.evaluationPurpose}</p>
                  )}
                  {formData.evaluationPurpose === 'Other (specify)' && (
                    <div className="mt-4">
                      <input
                        type="text"
                        placeholder="Please specify the evaluation purpose"
                        value={formData.customPurpose}
                        onChange={(e) => handleInputChange('customPurpose', e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-opacity-50 ${
                          errors.customPurpose ? 'border-red-500' : 'border-gray-300'
                        }`}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1F310A';
                          e.target.style.boxShadow = `0 0 0 2px ${('#1F310A')}40`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.customPurpose ? '#EF4444' : '#D1D5DB';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      {errors.customPurpose && (
                        <p className="mt-2 text-sm text-red-600">{errors.customPurpose}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Farm Details
                  </label>
                  <textarea
                    placeholder="Any additional information about your farm that might be relevant to the evaluation (crops grown, livestock, farm size, etc.)"
                    rows="4"
                    value={formData.additionalDetails}
                    onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-opacity-50"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1F310A';
                      e.target.style.boxShadow = `0 0 0 2px ${('#1F310A')}40`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D1D5DB';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Supporting Documents (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Upload relevant documents (soil test reports, property deeds, farm records, etc.)
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      PDF, DOC, JPG, PNG up to 10MB each
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="document-upload"
                    />
                    <label
                      htmlFor="document-upload"
                      className="text-white font-semibold py-2 px-4 rounded-lg cursor-pointer transition-colors duration-200 inline-block"
                      style={{ backgroundColor: '#1F310A' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#15250A'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#1F310A'}
                    >
                      Choose Files
                    </label>
                  </div>
                  
                  {formData.documents.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Uploaded Documents ({formData.documents.length})
                      </h4>
                      <div className="space-y-2">
                        {formData.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                            <button
                              onClick={() => removeDocument(index)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Previous
              </button>
            )}
            
            <div className="ml-auto">
              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: '#1F310A' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#15250A'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#1F310A'}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: '#1F310A' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#15250A'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#1F310A'}
                >
                  Submit Farm Evaluation Request
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}