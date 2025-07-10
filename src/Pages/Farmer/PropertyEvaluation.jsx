import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, TestTube, FileText, Home, CheckCircle, Upload, ArrowLeft } from 'lucide-react';

export default function FarmerPropertyEvaluation() {
  const navigate = useNavigate();
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
        if (!formData.irrigationType) newErrors.irrigationType = 'Please select an irrigation type';
        if (formData.irrigationType === 'Other (specify)' && !formData.customIrrigation.trim()) {
          newErrors.customIrrigation = 'Please specify the irrigation type';
        }
        if (!formData.waterSource) newErrors.waterSource = 'Please select a water source';
        if (formData.waterSource === 'Other (specify)' && !formData.customWaterSource.trim()) {
          newErrors.customWaterSource = 'Please specify the water source';
        }
        break;
      case 2:
        if (!formData.soilTestingDone) newErrors.soilTestingDone = 'Please indicate if soil testing has been done';
        if (formData.soilTestingDone === 'yes' && !formData.soilTestDate) {
          newErrors.soilTestDate = 'Please provide the soil test date';
        }
        if (formData.soilTestingDone === 'yes' && !formData.soilTestResults.trim()) {
          newErrors.soilTestResults = 'Please provide soil test results summary';
        }
        break;
      case 3:
        if (!formData.evaluationPurpose) newErrors.evaluationPurpose = 'Please select the evaluation purpose';
        if (formData.evaluationPurpose === 'Other (specify)' && !formData.customPurpose.trim()) {
          newErrors.customPurpose = 'Please specify the evaluation purpose';
        }
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      setSubmitted(true);
      console.log('Farmer property evaluation submitted:', formData);
    }
  };

  const progressPercentage = (currentStep / 3) * 100;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 font-poppins">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Evaluation Request Submitted!</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Thank you for submitting your farm property evaluation request. Our appraisers will review your submission and contact you within 48 hours to schedule a visit.
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 font-poppins">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-emerald-600 hover:text-emerald-700 font-semibold transition-all duration-300 transform hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      {/* Header */}
      <div className="relative bg-white shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-green-600/10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center animate-fade-in-down">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
            Farmer Property Evaluation Request
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Provide key information about your farm's irrigation systems, soil conditions, and evaluation purpose to get started.
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of 3: {stepTitles[currentStep - 1]}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up">
          {/* Step 1: Irrigation System */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Droplets className="w-6 h-6 mr-2 text-emerald-600" />
                Farm Irrigation System Information
              </h2>
              <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type of Irrigation System *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {irrigationTypes.map((type, index) => (
                    <label
                      key={type}
                      className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <input
                        type="radio"
                        name="irrigationType"
                        value={type}
                        checked={formData.irrigationType === type}
                        onChange={(e) => handleInputChange('irrigationType', e.target.value)}
                        className="mr-3 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-gray-700 group-hover:text-emerald-700">{type}</span>
                    </label>
                  ))}
                </div>
                {errors.irrigationType && (
                  <p className="mt-3 text-sm text-red-600 animate-shake">{errors.irrigationType}</p>
                )}
                {formData.irrigationType === 'Other (specify)' && (
                  <div className="mt-6 animate-slide-up">
                    <input
                      type="text"
                      placeholder="Please specify the irrigation type"
                      value={formData.customIrrigation}
                      onChange={(e) => handleInputChange('customIrrigation', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                        errors.customIrrigation ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.customIrrigation && (
                      <p className="mt-2 text-sm text-red-600 animate-shake">{errors.customIrrigation}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Water Source *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {waterSources.map((source, index) => (
                    <label
                      key={source}
                      className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <input
                        type="radio"
                        name="waterSource"
                        value={source}
                        checked={formData.waterSource === source}
                        onChange={(e) => handleInputChange('waterSource', e.target.value)}
                        className="mr-3 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-gray-700 group-hover:text-emerald-700">{source}</span>
                    </label>
                  ))}
                </div>
                {errors.waterSource && (
                  <p className="mt-3 text-sm text-red-600 animate-shake">{errors.waterSource}</p>
                )}
                {formData.waterSource === 'Other (specify)' && (
                  <div className="mt-6 animate-slide-up">
                    <input
                      type="text"
                      placeholder="Please specify the water source"
                      value={formData.customWaterSource}
                      onChange={(e) => handleInputChange('customWaterSource', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                        errors.customWaterSource ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.customWaterSource && (
                      <p className="mt-2 text-sm text-red-600 animate-shake">{errors.customWaterSource}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Irrigation Capacity/Coverage (Optional)
                </label>
                <textarea
                  placeholder="e.g., Covers 5 hectares, 2000 liters per hour, operates 6 hours daily"
                  rows="3"
                  value={formData.irrigationCapacity}
                  onChange={(e) => handleInputChange('irrigationCapacity', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Step 2: Soil Testing */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <TestTube className="w-6 h-6 mr-2 text-emerald-600" />
                Farm Soil Testing Information
              </h2>
              <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Have you done any soil testing on your farm? *
                </label>
                <div className="space-y-2">
                  <label className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]">
                    <input
                      type="radio"
                      name="soilTestingDone"
                      value="yes"
                      checked={formData.soilTestingDone === 'yes'}
                      onChange={(e) => handleInputChange('soilTestingDone', e.target.value)}
                      className="mr-3 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-gray-700 group-hover:text-emerald-700">Yes, I have soil test results</span>
                  </label>
                  <label className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]">
                    <input
                      type="radio"
                      name="soilTestingDone"
                      value="no"
                      checked={formData.soilTestingDone === 'no'}
                      onChange={(e) => handleInputChange('soilTestingDone', e.target.value)}
                      className="mr-3 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-gray-700 group-hover:text-emerald-700">No, soil testing has not been done</span>
                  </label>
                </div>
                {errors.soilTestingDone && (
                  <p className="mt-3 text-sm text-red-600 animate-shake">{errors.soilTestingDone}</p>
                )}
              </div>
              {formData.soilTestingDone === 'yes' && (
                <div className="space-y-6">
                  <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of soil testing *
                    </label>
                    <input
                      type="date"
                      value={formData.soilTestDate}
                      onChange={(e) => handleInputChange('soilTestDate', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                        errors.soilTestDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.soilTestDate && (
                      <p className="mt-2 text-sm text-red-600 animate-shake">{errors.soilTestDate}</p>
                    )}
                  </div>
                  <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Laboratory/Testing Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., National Agricultural Laboratory, Private Soil Lab"
                      value={formData.soilTestLab}
                      onChange={(e) => handleInputChange('soilTestLab', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Summary of soil test results *
                    </label>
                    <textarea
                      placeholder="e.g., pH 6.5, high organic matter, adequate nitrogen, low phosphorus, good drainage"
                      rows="4"
                      value={formData.soilTestResults}
                      onChange={(e) => handleInputChange('soilTestResults', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all duration-200 ${
                        errors.soilTestResults ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.soilTestResults && (
                      <p className="mt-2 text-sm text-red-600 animate-shake">{errors.soilTestResults}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Evaluation Purpose */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-emerald-600" />
                Farm Property Evaluation Purpose
              </h2>
              <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What is the purpose of this farm property evaluation? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {evaluationPurposes.map((purpose, index) => (
                    <label
                      key={purpose}
                      className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <input
                        type="radio"
                        name="evaluationPurpose"
                        value={purpose}
                        checked={formData.evaluationPurpose === purpose}
                        onChange={(e) => handleInputChange('evaluationPurpose', e.target.value)}
                        className="mr-3 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-gray-700 group-hover:text-emerald-700">{purpose}</span>
                    </label>
                  ))}
                </div>
                {errors.evaluationPurpose && (
                  <p className="mt-3 text-sm text-red-600 animate-shake">{errors.evaluationPurpose}</p>
                )}
                {formData.evaluationPurpose === 'Other (specify)' && (
                  <div className="mt-6 animate-slide-up">
                    <input
                      type="text"
                      placeholder="Please specify the evaluation purpose"
                      value={formData.customPurpose}
                      onChange={(e) => handleInputChange('customPurpose', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                        errors.customPurpose ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.customPurpose && (
                      <p className="mt-2 text-sm text-red-600 animate-shake">{errors.customPurpose}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Farm Details
                </label>
                <textarea
                  placeholder="Any additional information about your farm that might be relevant to the evaluation (crops grown, livestock, farm size, etc.)"
                  rows="4"
                  value={formData.additionalDetails}
                  onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all duration-200"
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Supporting Documents (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center group">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
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
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 inline-block"
                  >
                    Choose Files
                  </label>
                </div>
                {formData.documents.length > 0 && (
                  <div className="mt-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Uploaded Documents ({formData.documents.length})
                    </h4>
                    <div className="space-y-2">
                      {formData.documents.map((doc, index) => (
                        <div
                          key={index}
                          className="group flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-emerald-50"
                        >
                          <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                          <button
                            onClick={() => removeDocument(index)}
                            className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200 transform hover:scale-110"
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
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Previous
              </button>
            )}
            <div className="ml-auto">
              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Submit Farm Evaluation Request
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-4px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(4px);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}