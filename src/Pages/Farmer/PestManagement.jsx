import React, { useState } from 'react';
import { Upload, Bug, Calendar, AlertTriangle, Shield, Camera } from 'lucide-react';

export default function PestManagement() {
  const [formData, setFormData] = useState({
    pestType: '',
    customPest: '',
    firstNoticed: '',
    noticeDetails: '',
    damageObserved: '',
    controlMethods: [],
    otherMethod: '',
    images: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const commonPests = [
    'Aphids',
    'Thrips',
    'Mites',
    'Fruit Flies',
    'Scale Insects',
    'Caterpillars',
    'Whiteflies',
    'Fungal Diseases',
    'Bacterial Diseases',
    'Other (specify)'
  ];

  const controlMethods = [
    'Chemical Pesticides',
    'Organic Pesticides',
    'Biological Control',
    'Physical Removal',
    'Traps',
    'Pruning',
    'Crop Rotation',
    'None Yet',
    'Other (specify)'
  ];

  const stepTitles = [
    'Pest Type',
    'First Notice',
    'Damage Assessment',
    'Control Methods',
    'Photo Upload'
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

  const handleMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      controlMethods: prev.controlMethods.includes(method)
        ? prev.controlMethods.filter(m => m !== method)
        : [...prev.controlMethods, method]
    }));
    
    // Clear error when user selects a method
    if (errors.controlMethods) {
      setErrors(prev => ({
        ...prev,
        controlMethods: ''
      }));
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    
    switch (currentStep) {
      case 1:
        if (!formData.pestType) {
          newErrors.pestType = 'Please select a pest type';
        }
        if (formData.pestType === 'Other (specify)' && !formData.customPest.trim()) {
          newErrors.customPest = 'Please specify the pest type';
        }
        break;
        
      case 2:
        if (!formData.firstNoticed) {
          newErrors.firstNoticed = 'Please select when you first noticed the pest';
        }
        if (!formData.noticeDetails.trim()) {
          newErrors.noticeDetails = 'Please provide additional details';
        }
        break;
        
      case 3:
        if (!formData.damageObserved.trim()) {
          newErrors.damageObserved = 'Please describe the damage you have observed';
        }
        break;
        
      case 4:
        if (formData.controlMethods.length === 0) {
          newErrors.controlMethods = 'Please select at least one control method';
        }
        if (formData.controlMethods.includes('Other (specify)') && !formData.otherMethod.trim()) {
          newErrors.otherMethod = 'Please specify the control method';
        }
        break;
        
      case 5:
        // Images are optional, but we could add validation here if needed
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < 5) setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      setSubmitted(true);
      // Here you would typically send the data to your backend
      console.log('Form submitted:', formData);
    }
  };

  const progressPercentage = (currentStep / 5) * 100;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for providing the pest management information. Our experts will review your case and contact you within 24 hours with a customized solution.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setCurrentStep(1);
              setFormData({
                pestType: '',
                customPest: '',
                firstNoticed: '',
                noticeDetails: '',
                damageObserved: '',
                controlMethods: [],
                otherMethod: '',
                images: []
              });
              setErrors({});
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Submit Another Assessment
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
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bug className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pest Management Assessment
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Help us understand your pest situation so we can provide the most effective solution for your avocado farm.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of 5: {stepTitles[currentStep - 1]}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step 1: Pest Type */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Bug className="w-6 h-6 mr-2 text-green-600" />
                What pest are you dealing with?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {commonPests.map((pest) => (
                  <label key={pest} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="pestType"
                      value={pest}
                      checked={formData.pestType === pest}
                      onChange={(e) => handleInputChange('pestType', e.target.value)}
                      className="mr-3 text-green-600"
                    />
                    <span className="text-gray-700">{pest}</span>
                  </label>
                ))}
              </div>
              {errors.pestType && (
                <p className="mt-2 text-sm text-red-600">{errors.pestType}</p>
              )}
              {formData.pestType === 'Other (specify)' && (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Please specify the pest type"
                    value={formData.customPest}
                    onChange={(e) => handleInputChange('customPest', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.customPest ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.customPest && (
                    <p className="mt-2 text-sm text-red-600">{errors.customPest}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: First Notice */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-green-600" />
                When did you first notice the pest?
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date first noticed *
                  </label>
                  <input
                    type="date"
                    value={formData.firstNoticed}
                    onChange={(e) => handleInputChange('firstNoticed', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.firstNoticed ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.firstNoticed && (
                    <p className="mt-2 text-sm text-red-600">{errors.firstNoticed}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional details about when/where you noticed it *
                  </label>
                  <textarea
                    placeholder="e.g., First noticed on lower leaves, started after rainy season, etc."
                    rows="4"
                    value={formData.noticeDetails}
                    onChange={(e) => handleInputChange('noticeDetails', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.noticeDetails ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.noticeDetails && (
                    <p className="mt-2 text-sm text-red-600">{errors.noticeDetails}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Damage Observed */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-green-600" />
                What damage have you observed?
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe the damage in detail *
                </label>
                <textarea
                  placeholder="Please describe the damage you've observed (e.g., yellowing leaves, holes in fruit, wilting, spots, etc.)"
                  rows="6"
                  value={formData.damageObserved}
                  onChange={(e) => handleInputChange('damageObserved', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.damageObserved ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.damageObserved && (
                  <p className="mt-2 text-sm text-red-600">{errors.damageObserved}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Control Methods */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-green-600" />
                What pest control methods have you tried?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {controlMethods.map((method) => (
                  <label key={method} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.controlMethods.includes(method)}
                      onChange={() => handleMethodChange(method)}
                      className="mr-3 text-green-600"
                    />
                    <span className="text-gray-700">{method}</span>
                  </label>
                ))}
              </div>
              {errors.controlMethods && (
                <p className="mt-2 text-sm text-red-600">{errors.controlMethods}</p>
              )}
              {formData.controlMethods.includes('Other (specify)') && (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Please specify the control method"
                    value={formData.otherMethod}
                    onChange={(e) => handleInputChange('otherMethod', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.otherMethod ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.otherMethod && (
                    <p className="mt-2 text-sm text-red-600">{errors.otherMethod}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Image Upload */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Camera className="w-6 h-6 mr-2 text-green-600" />
                Upload pictures of pests and crop damage
              </h2>
              <p className="text-gray-600 mb-4">
                Photos are optional but recommended to help our experts provide better recommendations.
              </p>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Click to upload images or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer transition-colors duration-200"
                  >
                    Choose Files
                  </label>
                </div>
                
                {formData.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Uploaded Images ({formData.images.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 text-sm text-center px-2">{image.name}</span>
                          </div>
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
              {currentStep < 5 ? (
                <button
                  onClick={nextStep}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Submit Assessment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}