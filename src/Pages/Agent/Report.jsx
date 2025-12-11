import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Calendar,
  Eye,
  Plus,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  X,
  Save,
  Upload,
  MapPin,
  Image as ImageIcon,
  File,
  Clock,
  Building,
  BarChart3,
  Award,
  Folder,
  ChevronDown,
} from "lucide-react";

// Import reports service
import { 
  getReports, 
  createReport, 
  updateReport, 
  deleteReport,
  uploadReportAttachments 
} from '../../services/reportsService';

const ProfessionalReportSystem = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledDate: "",
    scheduledTime: "",
    administrativeLocation: "",
    volume: "",
    qualityGrade: "",
    reportType: "inspection",
    priority: "medium",
    notes: "",
  });

  const [files, setFiles] = useState([]);
  const [location, setLocation] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [reports, setReports] = useState([]);
  const [fetchingReports, setFetchingReports] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const qualityGrades = [
    { value: "A+", label: "A+ (Excellent)", color: "bg-green-100 text-green-800" },
    { value: "A", label: "A (Very Good)", color: "bg-green-100 text-green-700" },
    { value: "B+", label: "B+ (Good)", color: "bg-blue-100 text-blue-800" },
    { value: "B", label: "B (Satisfactory)", color: "bg-blue-100 text-blue-700" },
    { value: "C+", label: "C+ (Fair)", color: "bg-yellow-100 text-yellow-800" },
    { value: "C", label: "C (Poor)", color: "bg-orange-100 text-orange-800" },
    { value: "D", label: "D (Unsatisfactory)", color: "bg-red-100 text-red-800" },
  ];

  const reportTypes = [
    { value: "inspection", label: "Quality Inspection", icon: Award },
    { value: "audit", label: "Compliance Audit", icon: CheckCircle },
    { value: "assessment", label: "Performance Assessment", icon: BarChart3 },
    { value: "survey", label: "Field Survey", icon: MapPin },
  ];

  useEffect(() => {
    const fetchReports = async () => {
      setFetchingReports(true);
      try {
        // Fetch actual reports from API using reportsService
        const response = await getReports({
          page: 1,
          limit: 50,
          sort: 'created_at',
          order: 'desc'
        });
        
        if (response.success && response.data) {
          setReports(Array.isArray(response.data) ? response.data : []);
        } else {
          setReports([]);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        setError('Failed to load reports. Please try again.');
        setReports([]);
      } finally {
        setFetchingReports(false);
      }
    };
    fetchReports();
  }, []);

  const reverseGeocode = async (latitude, longitude) => {
    try {
      // Use a real geocoding service like Google Maps API or OpenStreetMap Nominatim
      // For now, return a simple coordinate-based location string
      return `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error("Geocoding error:", error);
      return `Location at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  };

  const validateCurrentStep = useCallback(() => {
    const errors = {};
    
    if (currentStep === 1) {
      if (!formData.title.trim()) errors.title = "Report title is required";
      if (!formData.description.trim()) errors.description = "Description is required";
      if (!formData.reportType) errors.reportType = "Report type is required";
      if (!formData.priority) errors.priority = "Priority level is required";
    }
    
    if (currentStep === 2) {
      if (!formData.scheduledDate) errors.scheduledDate = "Scheduled date is required";
      if (!formData.administrativeLocation.trim())
        errors.administrativeLocation = "Administrative location is required";
      if (formData.volume && isNaN(Number(formData.volume)))
        errors.volume = "Volume must be a valid number";
    }

    if (JSON.stringify(errors) !== JSON.stringify(formErrors)) {
      setFormErrors(errors);
    }

    return Object.keys(errors).length === 0;
  }, [currentStep, formData, formErrors]);

  const validateAllSteps = useCallback(() => {
    let isValid = true;
    const errors = {};
    
    // Validate step 1 fields
    if (!formData.title.trim()) {
      errors.title = "Report title is required";
      isValid = false;
    }
    if (!formData.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    }
    if (!formData.reportType) {
      errors.reportType = "Report type is required";
      isValid = false;
    }
    if (!formData.priority) {
      errors.priority = "Priority level is required";
      isValid = false;
    }
    
    // Validate step 2 fields
    if (!formData.scheduledDate) {
      errors.scheduledDate = "Scheduled date is required";
      isValid = false;
    }
    if (!formData.administrativeLocation.trim()) {
      errors.administrativeLocation = "Administrative location is required";
      isValid = false;
    }
    
    if (JSON.stringify(errors) !== JSON.stringify(formErrors)) {
      setFormErrors(errors);
    }
    return isValid;
  }, [formData, formErrors]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const handleFileUpload = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((file) => file.size <= 10 * 1024 * 1024);
    if (validFiles.length < selectedFiles.length) {
      setError("Some files were too large (max 10MB each)");
    }
    const newFiles = validFiles.map((file) => ({
      file,
      name: file.name,
      type: file.type,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((index) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      prev[index]?.preview && URL.revokeObjectURL(prev[index].preview);
      return newFiles;
    });
  }, []);

  const getCurrentLocation = useCallback(async () => {
    setGpsStatus("loading");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setGpsStatus("error");
      return;
    }
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      const placeName = await reverseGeocode(latitude, longitude);

      setLocation({
        lat: latitude,
        lng: longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString(),
        address: placeName,
        placeName: placeName,
      });

      setGpsStatus("success");
      setSuccess("Location captured successfully");
    } catch (error) {
      setError("Unable to retrieve location: " + error.message);
      setGpsStatus("error");
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const isValid = validateAllSteps();
    if (!isValid) {
      setError("Please fill in all required fields");
      // Find the first step with errors
      if (!formData.title || !formData.description || !formData.reportType || !formData.priority) {
        setCurrentStep(1);
      } else {
        setCurrentStep(2);
      }
      return;
    }
    setShowConfirmation(true);
  }, [formData, validateAllSteps]);

  const confirmSubmission = useCallback(async () => {
    setShowConfirmation(false);
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const reportData = {
        ...formData,
        location: location,
        attachments: files.map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
        })),
      };

      let response;
      if (editingReport) {
        response = await updateReport(editingReport.id, reportData);
        setSuccess("Report updated successfully!");
        setEditingReport(null);
      } else {
        response = await createReport(reportData);
        setSuccess("Report created successfully!");
      }

      // Upload attachments if any
      if (files.length > 0 && response.data?.id) {
        try {
          const fileObjects = files.map(f => f.file).filter(Boolean);
          if (fileObjects.length > 0) {
            await uploadReportAttachments(response.data.id, fileObjects);
          }
        } catch (uploadError) {
          console.error('Error uploading attachments:', uploadError);
          setError('Report saved but failed to upload attachments');
        }
      }

      // Refresh reports list
      const updatedReports = await getReports({
        page: 1,
        limit: 50,
        sort: 'created_at',
        order: 'desc'
      });
      
      if (updatedReports.success && updatedReports.data) {
        setReports(Array.isArray(updatedReports.data) ? updatedReports.data : []);
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        scheduledDate: "",
        scheduledTime: "",
        administrativeLocation: "",
        volume: "",
        qualityGrade: "",
        reportType: "inspection",
        priority: "medium",
        notes: "",
      });
      setFiles((prev) => {
        prev.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
        return [];
      });
      setLocation(null);
      setGpsStatus("idle");
      setShowForm(false);
      setCurrentStep(1);
      
    } catch (error) {
      console.error('Error saving report:', error);
      setError(error.message || 'Failed to save report. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [editingReport, formData, location, files]);

  const handleEdit = useCallback((report) => {
    setEditingReport(report);
    setFormData({
      title: report.title,
      description: report.description,
      scheduledDate: report.scheduledDate,
      scheduledTime: report.scheduledTime,
      administrativeLocation: report.administrativeLocation,
      volume: report.volume,
      qualityGrade: report.qualityGrade,
      reportType: report.reportType,
      priority: report.priority,
      notes: report.notes || "",
    });
    setFiles(
      report.files?.map((f) => ({
        ...f,
        preview: f.type.startsWith("image/") ? `/placeholder.svg?height=100&width=100&text=${f.name}` : null,
      })) || []
    );
    setLocation(report.location);
    setShowForm(true);
    setCurrentStep(1);
  }, []);

  const handleDelete = useCallback((reportId) => {
    setDeleteConfirm(reportId);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteConfirm) {
      try {
        await deleteReport(deleteConfirm);
        
        // Refresh reports list
        const updatedReports = await getReports({
          page: 1,
          limit: 50,
          sort: 'created_at',
          order: 'desc'
        });
        
        if (updatedReports.success && updatedReports.data) {
          setReports(Array.isArray(updatedReports.data) ? updatedReports.data : []);
        }
        
        setSuccess("Report deleted successfully");
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error deleting report:', error);
        setError(error.message || 'Failed to delete report. Please try again.');
        setDeleteConfirm(null);
      }
    }
  }, [deleteConfirm]);

  const nextStep = useCallback(() => {
    const isValid = validateCurrentStep();
    if (currentStep < 3 && isValid) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, validateCurrentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const getFileIcon = useCallback((type) => {
    if (type.startsWith("image/")) return ImageIcon;
    if (type === "application/pdf") return FileText;
    return File;
  }, []);

  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const getStatusColor = useCallback((status) => {
    return status === "completed" ? "text-green-600 bg-green-50" : "text-yellow-600 bg-yellow-50";
  }, []);

  const getStatusIcon = useCallback((status) => {
    return status === "completed" ? CheckCircle : AlertCircle;
  }, []);

  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {Object.keys(formErrors).length > 0 && (
              <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="text-red-800 font-medium mb-2">
                  Please fix the following errors:
                </h4>
                <ul className="list-disc list-inside text-red-700 text-sm">
                  {Object.entries(formErrors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Basic Information</h3>
              <p className="text-gray-600">Enter the fundamental details of your report</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Report Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                    formErrors.title ? "border-red-500" : ""
                  }`}
                  placeholder="Enter report title..."
                  required
                />
                {formErrors.title && <p className="mt-1 text-xs text-red-500">{formErrors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Report Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.reportType}
                  onChange={(e) => handleInputChange("reportType", e.target.value)}
                  className={`w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                    formErrors.reportType ? "border-red-500" : ""
                  }`}
                >
                  {reportTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {formErrors.reportType && <p className="mt-1 text-xs text-red-500">{formErrors.reportType}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                  className={`w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                    formErrors.priority ? "border-red-500" : ""
                  }`}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                {formErrors.priority && <p className="mt-1 text-xs text-red-500">{formErrors.priority}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none ${
                    formErrors.description ? "border-red-500" : ""
                  }`}
                  placeholder="Describe the purpose and scope of this report..."
                  required
                />
                {formErrors.description && <p className="mt-1 text-xs text-red-500">{formErrors.description}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Add any additional notes or comments..."
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            {Object.keys(formErrors).length > 0 && (
              <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="text-red-800 font-medium mb-2">
                  Please fix the following errors:
                </h4>
                <ul className="list-disc list-inside text-red-700 text-sm">
                  {Object.entries(formErrors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Schedule & Location</h3>
              <p className="text-gray-600">Set appointment details and data specifications</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Scheduled Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                      formErrors.scheduledDate ? "border-red-500" : ""
                    }`}
                    required
                  />
                </div>
                {formErrors.scheduledDate && <p className="mt-1 text-xs text-red-500">{formErrors.scheduledDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Scheduled Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => handleInputChange("scheduledTime", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Administrative Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.administrativeLocation}
                  onChange={(e) => handleInputChange("administrativeLocation", e.target.value)}
                  className={`w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                    formErrors.administrativeLocation ? "border-red-500" : ""
                  }`}
                  placeholder="e.g., Manufacturing District - Zone 3, Building A"
                  required
                />
                {formErrors.administrativeLocation && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.administrativeLocation}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Volume/Quantity</label>
                <input
                  type="text"
                  value={formData.volume}
                  onChange={(e) => handleInputChange("volume", e.target.value)}
                  className={`w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                    formErrors.volume ? "border-red-500" : ""
                  }`}
                  placeholder="e.g., 2,500 units, 15,000 sq ft"
                />
                {formErrors.volume && <p className="mt-1 text-xs text-red-500">{formErrors.volume}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quality Grade</label>
                <div className="relative">
                  <select
                    value={formData.qualityGrade}
                    onChange={(e) => handleInputChange("qualityGrade", e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 appearance-none"
                  >
                    <option value="">Select Quality Grade</option>
                    {qualityGrades.map((grade) => (
                      <option key={grade.value} value={grade.value}>
                        {grade.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Files & Location</h3>
              <p className="text-gray-600">Upload supporting documents and capture GPS location</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-4">Upload Files & Images</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to browse</p>
                  <p className="text-sm text-gray-500">Supports: Images, PDF, Word, Excel (Max 10MB each)</p>
                </label>
              </div>
              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-gray-900">Uploaded Files:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {files.map((file, index) => {
                      const IconComponent = getFileIcon(file.type);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex items-center space-x-3">
                            {file.preview ? (
                              <img
                                src={file.preview || "/placeholder.svg"}
                                alt={file.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <IconComponent className="w-12 h-12 text-emerald-600" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{file.name}</p>
                              <p className="text-sm text-gray-500">{file.size}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-700">GPS Location</label>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gpsStatus === "loading"}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
                >
                  {gpsStatus === "loading" ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MapPin size={16} />
                  )}
                  {gpsStatus === "loading" ? "Getting Location..." : "Capture GPS Location"}
                </button>
              </div>
              {location && (
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium text-gray-900">Location Details</span>
                  </div>
                  <div className="mb-2">
                    <h4 className="text-base font-semibold text-emerald-700">{location.address}</h4>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Captured at: {new Date(location.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [currentStep, formData, formErrors, handleInputChange, handleFileUpload, getFileIcon, removeFile, getCurrentLocation, gpsStatus, location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-600">
                Report Management System
              </h1>
              <p className="mt-3 text-lg text-gray-600 max-w-2xl">
                Streamlined reporting with advanced scheduling, file management, and GPS integration
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingReport(null);
                setFormData({
                  title: "",
                  description: "",
                  scheduledDate: "",
                  scheduledTime: "",
                  administrativeLocation: "",
                  volume: "",
                  qualityGrade: "",
                  reportType: "inspection",
                  priority: "medium",
                  notes: "",
                });
                setFiles([]);
                setLocation(null);
                setCurrentStep(1);
                setFormErrors({});
              }}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-xl bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              {editingReport ? "Edit Report" : "New Report"}
            </button>
          </div>
        </div>

        {(success || error) && (
          <div
            className={`mb-6 p-4 rounded-xl border-l-4 ${
              success ? "bg-green-50 border-green-400" : "bg-red-50 border-red-400"
            } transform transition-all duration-300 animate-in fade-in`}
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${success ? "text-green-400" : "text-red-400"}`}>
                {success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${success ? "text-green-800" : "text-red-800"}`}>
                  {success || error}
                </p>
              </div>
              <button
                onClick={() => {
                  setSuccess(null);
                  setError(null);
                }}
                className="ml-auto text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <div className="mb-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingReport ? "Edit Report" : "Create New Report"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex items-center justify-center space-x-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold transition-all duration-200 ${
                        step <= currentStep ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step}
                    </div>
                    <div className="ml-3">
                      <p
                        className={`text-sm font-medium ${
                          step <= currentStep ? "text-emerald-600" : "text-gray-500"
                        }`}
                      >
                        {step === 1 ? "Basic Info" : step === 2 ? "Schedule & Data" : "Files & Location"}
                      </p>
                    </div>
                    {step < 3 && (
                      <div className={`w-20 h-1 mx-4 ${step < currentStep ? "bg-emerald-600" : "bg-gray-200"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="px-8 py-8">{renderStepContent()}</div>
              <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Previous
                  </button>
                  <div className="flex gap-4">
                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={!validateCurrentStep()}
                        className={`px-6 py-3 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 ${
                          validateCurrentStep() ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Next Step
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 ${
                          loading ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save size={20} />
                        )}
                        {loading ? "Processing..." : editingReport ? "Update Report" : "Create Report"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg">
                  <FileText className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Report Dashboard</h2>
              </div>
              <span className="px-4 py-2 text-sm font-medium rounded-full bg-emerald-100 text-emerald-800">
                {reports.length} {reports.length === 1 ? "Report" : "Reports"}
              </span>
            </div>
          </div>
          <div className="overflow-auto max-h-[600px]">
            {fetchingReports ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                  <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600">Loading reports...</p>
              </div>
            ) : reports.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {reports.map((report) => {
                  const StatusIcon = getStatusIcon(report.status);
                  const ReportTypeIcon = reportTypes.find((t) => t.value === report.reportType)?.icon || FileText;

                  return (
                    <div key={report.id} className="p-6 hover:bg-gray-50 transition-all duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                              <ReportTypeIcon className="text-emerald-600" size={24} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.title}</h3>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                                >
                                  <StatusIcon size={14} />
                                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                </span>
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}
                                >
                                  {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)} Priority
                                </span>
                                {report.qualityGrade && (
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                      qualityGrades.find((g) => g.value === report.qualityGrade)?.color
                                    }`}
                                  >
                                    Grade: {report.qualityGrade}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4 line-clamp-2">{report.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar size={16} />
                              <span>
                                {new Date(report.scheduledDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                                {report.scheduledTime && ` at ${report.scheduledTime}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Building size={16} />
                              <span>{report.administrativeLocation}</span>
                            </div>
                            {report.volume && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <BarChart3 size={16} />
                                <span>{report.volume}</span>
                              </div>
                            )}
                            {report.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin size={16} />
                                <span className="font-medium">{report.location.address}</span>
                              </div>
                            )}
                          </div>
                          {report.notes && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Notes:</span> {report.notes}
                              </p>
                            </div>
                          )}
                          {report.files && report.files.length > 0 && (
                            <div className="mt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Folder size={16} className="text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  {report.files.length} file(s) attached
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {report.files.map((file, index) => {
                                  const IconComponent = getFileIcon(file.type);
                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded text-xs"
                                    >
                                      <IconComponent size={14} className="text-gray-500" />
                                      <span className="text-gray-700">{file.name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              Created{" "}
                              {new Date(report.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="ml-6 flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(report)}
                            className="p-2 text-gray-400 rounded-lg hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(report.id)}
                            className="p-2 text-gray-400 rounded-lg hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                          >
                            <Trash2 size={20} />
                          </button>
                          <button
                            className="p-2 text-gray-400 rounded-lg hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
                          >
                            <Eye size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                  <FileText className="text-emerald-600" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports available</h3>
                <p className="text-gray-500 mb-4">Create your first professional report to get started</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Plus size={16} />
                  Create Report
                </button>
              </div>
            )}
          </div>
        </div>

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full m-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="text-red-500" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this report? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full m-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="text-emerald-500" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Confirm Submission</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to submit this report? Please review all information before proceeding.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubmission}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Confirm Submission
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalReportSystem;