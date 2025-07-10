import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Wrench, Truck, Calendar, Camera, CheckCircle, ArrowLeft } from 'lucide-react';

export default function HarvestingDay() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    workersNeeded: '',
    workersDetails: '',
    equipmentNeeded: 'no',
    equipmentList: [],
    customEquipment: '',
    transportationNeeded: 'no',
    transportationType: '',
    transportationDetails: '',
    harvestDate: '',
    harvestTime: '',
    harvestImages: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const equipmentOptions = [
    'Harvesting Poles/Pickers',
    'Ladders',
    'Harvesting Bags/Baskets',
    'Pruning Shears',
    'Sorting Trays',
    'Weighing Scales',
    'Protective Gear (Gloves, Hats)',
    'Storage Containers',
    'Other (specify)'
  ];

  const transportationTypes = [
    'Pickup Truck',
    'Large Truck',
    'Motorcycle/Boda Boda',
    'Bicycle',
    'Walking/Manual Carrying',
    'Other (specify)'
  ];

  const stepTitles = [
    'Workers Needed',
    'Equipment Requirements',
    'Transportation',
    'Harvest Schedule',
    'Photo Documentation'
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

  const handleEquipmentChange = (equipment) => {
    setFormData(prev => ({
      ...prev,
      equipmentList: prev.equipmentList.includes(equipment)
        ? prev.equipmentList.filter(e => e !== equipment)
        : [...prev.equipmentList, equipment]
    }));
    if (errors.equipmentList) {
      setErrors(prev => ({
        ...prev,
        equipmentList: ''
      }));
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      harvestImages: [...prev.harvestImages, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      harvestImages: prev.harvestImages.filter((_, i) => i !== index)
    }));
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    switch (currentStep) {
      case 1:
        if (!formData.workersNeeded) {
          newErrors.workersNeeded = 'Please specify how many workers you need';
        }
        if (parseInt(formData.workersNeeded) < 1) {
          newErrors.workersNeeded = 'Number of workers must be at least 1';
        }
        break;
      case 2:
        if (formData.equipmentNeeded === 'yes' && formData.equipmentList.length === 0) {
          newErrors.equipmentList = 'Please select at least one equipment type';
        }
        if (formData.equipmentList.includes('Other (specify)') && !formData.customEquipment.trim()) {
          newErrors.customEquipment = 'Please specify the equipment type';
        }
        break;
      case 3:
        if (formData.transportationNeeded === 'yes') {
          if (!formData.transportationType) {
            newErrors.transportationType = 'Please select a transportation type';
          }
          if (!formData.transportationDetails.trim()) {
            newErrors.transportationDetails = 'Please provide transportation details';
          }
        }
        break;
      case 4:
        if (!formData.harvestDate) {
          newErrors.harvestDate = 'Please select a harvest date';
        }
        if (!formData.harvestTime) {
          newErrors.harvestTime = 'Please select a harvest time';
        }
        break;
      case 5:
        // Images are optional, no validation required
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      setSubmitted(true);
      console.log('Harvesting plan submitted:', formData);
    }
  };

  const progressPercentage = (currentStep / 5) * 100;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 font-poppins">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Harvest Plan Submitted!</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your harvest planning request has been received. Our team will coordinate the resources and contact you within 24 hours to confirm the arrangements.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-emerald-800">
              <strong>Harvest Date:</strong> {formData.harvestDate}<br />
              <strong>Workers Needed:</strong> {formData.workersNeeded}<br />
              <strong>Equipment Required:</strong> {formData.equipmentNeeded === 'yes' ? 'Yes' : 'No'}
            </p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setCurrentStep(1);
              setFormData({
                workersNeeded: '',
                workersDetails: '',
                equipmentNeeded: 'no',
                equipmentList: [],
                customEquipment: '',
                transportationNeeded: 'no',
                transportationType: '',
                transportationDetails: '',
                harvestDate: '',
                harvestTime: '',
                harvestImages: []
              });
              setErrors({});
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Plan Another Harvest
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
            <Calendar className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
            Harvesting Day Planning
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Let us help you plan your avocado harvest by organizing workers, equipment, and transportation for a successful harvest day.
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of 5: {stepTitles[currentStep - 1]}
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
          {/* Step 1: Workers Needed */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-6 h-6 mr-2 text-emerald-600" />
                How many workers do you need?
              </h2>
              <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of workers needed *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g., 5"
                  value={formData.workersNeeded}
                  onChange={(e) => handleInputChange('workersNeeded', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                    errors.workersNeeded ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.workersNeeded && (
                  <p className="mt-2 text-sm text-red-600 animate-shake">{errors.workersNeeded}</p>
                )}
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional details about worker requirements
                </label>
                <textarea
                  placeholder="e.g., Need experienced harvesters, specific skills required, working hours, etc."
                  rows="4"
                  value={formData.workersDetails}
                  onChange={(e) => handleInputChange('workersDetails', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Step 2: Equipment Requirements */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Wrench className="w-6 h-6 mr-2 text-emerald-600" />
                Do you need any specialized equipment?
              </h2>
              <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Equipment needed? *
                </label>
                <div className="space-y-3">
                  <label className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]">
                    <input
                      type="radio"
                      name="equipmentNeeded"
                      value="yes"
                      checked={formData.equipmentNeeded === 'yes'}
                      onChange={(e) => handleInputChange('equipmentNeeded', e.target.value)}
                      className="mr-3 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-gray-700 group-hover:text-emerald-700">Yes, I need equipment</span>
                  </label>
                  <label className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]">
                    <input
                      type="radio"
                      name="equipmentNeeded"
                      value="no"
                      checked={formData.equipmentNeeded === 'no'}
                      onChange={(e) => handleInputChange('equipmentNeeded', e.target.value)}
                      className="mr-3 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-gray-700 group-hover:text-emerald-700">No, I have all needed equipment</span>
                  </label>
                </div>
              </div>
              {formData.equipmentNeeded === 'yes' && (
                <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Select equipment types needed:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {equipmentOptions.map((equipment, index) => (
                      <label
                        key={equipment}
                        className="group flex items-center p-3 border border-gray-200 rounded-lg hover:bg-emerald-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.equipmentList.includes(equipment)}
                          onChange={() => handleEquipmentChange(equipment)}
                          className="mr-3 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-gray-700 text-sm group-hover:text-emerald-700">{equipment}</span>
                      </label>
                    ))}
                  </div>
                  {errors.equipmentList && (
                    <p className="mt-3 text-sm text-red-600 animate-shake">{errors.equipmentList}</p>
                  )}
                  {formData.equipmentList.includes('Other (specify)') && (
                    <div className="mt-6 animate-slide-up">
                      <input
                        type="text"
                        placeholder="Please specify the equipment type"
                        value={formData.customEquipment}
                        onChange={(e) => handleInputChange('customEquipment', e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                          errors.customEquipment ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.customEquipment && (
                        <p className="mt-2 text-sm text-red-600 animate-shake">{errors.customEquipment}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Transportation */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Truck className="w-6 h-6 mr-2 text-emerald-600" />
                Do you need transportation for the harvest crops?
              </h2>
              <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Transportation needed? *
                </label>
                <div className="space-y-3">
                  <label className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]">
                    <input
                      type="radio"
                      name="transportationNeeded"
                      value="yes"
                      checked={formData.transportationNeeded === 'yes'}
                      onChange={(e) => handleInputChange('transportationNeeded', e.target.value)}
                      className="mr-3 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-gray-700 group-hover:text-emerald-700">Yes, I need transportation</span>
                  </label>
                  <label className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-emerald-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]">
                    <input
                      type="radio"
                      name="transportationNeeded"
                      value="no"
                      checked={formData.transportationNeeded === 'no'}
                      onChange={(e) => handleInputChange('transportationNeeded', e.target.value)}
                      className="mr-3 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-gray-700 group-hover:text-emerald-700">No, I have transportation arranged</span>
                  </label>
                </div>
              </div>
              {formData.transportationNeeded === 'yes' && (
                <div className="space-y-6">
                  <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Transportation type needed:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {transportationTypes.map((type, index) => (
                        <label
                          key={type}
                          className="group flex items-center p-3 border border-gray-200 rounded-lg hover:bg-emerald-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <input
                            type="radio"
                            name="transportationType"
                            value={type}
                            checked={formData.transportationType === type}
                            onChange={(e) => handleInputChange('transportationType', e.target.value)}
                            className="mr-3 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-gray-700 text-sm group-hover:text-emerald-700">{type}</span>
                        </label>
                      ))}
                    </div>
                    {errors.transportationType && (
                      <p className="mt-3 text-sm text-red-600 animate-shake">{errors.transportationType}</p>
                    )}
                  </div>
                  <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transportation details *
                    </label>
                    <textarea
                      placeholder="e.g., Estimated crop weight, destination, distance, special requirements, etc."
                      rows="4"
                      value={formData.transportationDetails}
                      onChange={(e) => handleInputChange('transportationDetails', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all duration-200 ${
                        errors.transportationDetails ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.transportationDetails && (
                      <p className="mt-2 text-sm text-red-600 animate-shake">{errors.transportationDetails}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Harvest Schedule */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-emerald-600" />
                When do you want to harvest?
              </h2>
              <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harvest Date *
                </label>
                <input
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                    errors.harvestDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.harvestDate && (
                  <p className="mt-2 text-sm text-red-600 animate-shake">{errors.harvestDate}</p>
                )}
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Start Time *
                </label>
                <input
                  type="time"
                  value={formData.harvestTime}
                  onChange={(e) => handleInputChange('harvestTime', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                    errors.harvestTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.harvestTime && (
                  <p className="mt-2 text-sm text-red-600 animate-shake">{errors.harvestTime}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Photo Upload */}
          {currentStep === 5 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Camera className="w-6 h-6 mr-2 text-emerald-600" />
                Upload pictures of avocados to be harvested
              </h2>
              <p className="text-gray-600 mb-6 animate-slide-up">
                Upload photos of your avocado trees and fruit to help us assess readiness and plan the harvest accordingly.
              </p>
              <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center group">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
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
                    id="harvest-file-upload"
                  />
                  <label
                    htmlFor="harvest-file-upload"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 inline-block"
                  >
                    Choose Files
                  </label>
                </div>
                {formData.harvestImages.length > 0 && (
                  <div className="mt-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Uploaded Images ({formData.harvestImages.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {formData.harvestImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 text-sm text-center px-2">{image.name}</span>
                          </div>
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-all duration-200 transform hover:scale-110"
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
              {currentStep < 5 ? (
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
                  Submit Harvest Plan
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