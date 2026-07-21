import React, { useState } from "react";
import "../Styles/HarvestingDay.css";
import DashboardHeader from "../../components/Header/DashboardHeader";
import { createHarvestRequest } from '../../services/serviceRequestsService';

const initialFormData = {
  workersNeeded: 1,
  equipmentNeeded: [],
  transportationNeeded: "",
  harvestDateFrom: "",
  harvestDateTo: "",
  harvestImages: []
};

export default function HarvestingDay() {
  const [formData, setFormData] = useState(initialFormData);

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);

  const equipmentOptions = [
    "Harvest Clipper", "Picking Poles", "plastic crates"
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

  // Helper function to calculate date + 5 days using local date parts to prevent timezone offsets
  const calculateFiveDaysLater = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + 5);

    const toYear = date.getFullYear();
    const toMonth = String(date.getMonth() + 1).padStart(2, "0");
    const toDay = String(date.getDate()).padStart(2, "0");
    return `${toYear}-${toMonth}-${toDay}`;
  };

  const handleDateChange = (field, value) => {
    if (field === "harvestDateFrom") {
      const autoEndDate = calculateFiveDaysLater(value);

      setFormData(prev => ({
        ...prev,
        harvestDateFrom: value,
        harvestDateTo: autoEndDate
      }));

      setErrors(prev => ({
        ...prev,
        harvestDateFrom: "",
        harvestDateTo: "",
        harvestDateRange: ""
      }));
    } else {
      handleInputChange(field, value);
    }
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

    if (!formData.workersNeeded || formData.workersNeeded < 1) {
      newErrors.workersNeeded = "Please specify at least 1 worker";
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const harvestRequestData = {
        workersNeeded: parseInt(formData.workersNeeded),
        equipmentNeeded: formData.equipmentNeeded,
        treesToHarvest: parseInt(formData.transportationNeeded),
        harvestDateFrom: formData.harvestDateFrom,
        harvestDateTo: formData.harvestDateTo,
        harvestImages: formData.harvestImages.map(file => file.name),
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

      const response = await createHarvestRequest(harvestRequestData);

      console.log("Harvest request submitted successfully:", response);
      setSubmitted(true);

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

  const handleCancel = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const Icon = {
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  };

  if (submitted) {
    return (
      <div className="hd-scope">
        <div className="hd-confirmWrap">
          <div className="hd-slip">
            <div className="hd-checkCircle">{Icon.check}</div>
            <h2 className="hd-slipTitle">Harvest Plan Submitted!</h2>
            <p className="hd-slipText">
              Your harvest planning request has been received. Our team will coordinate the resources and contact you within 24 hours to confirm the arrangements.
            </p>
            <dl className="hd-slipDetails">
              <div className="hd-slipRow">
                <dt>Harvest Period:</dt>
                <dd>{formData.harvestDateFrom} to {formData.harvestDateTo}</dd>
              </div>
              <div className="hd-slipRow">
                <dt>Workers Needed:</dt>
                <dd>{formData.workersNeeded}</dd>
              </div>
              <div className="hd-slipRow">
                <dt>Equipment Required:</dt>
                <dd>{formData.equipmentNeeded.length > 0 ? formData.equipmentNeeded.join(", ") : "No equipment needed"}</dd>
              </div>
              <div className="hd-slipRow">
                <dt>Trees to Harvest:</dt>
                <dd>{formData.transportationNeeded}</dd>
              </div>
              <div className="hd-slipRow">
                <dt>Images Uploaded:</dt>
                <dd>{formData.harvestImages.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hd-scope">

      {showEquipmentModal && (
        <div className="hd-modalOverlay" onClick={() => setShowEquipmentModal(false)}>
          <div className="hd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hd-modalHead">
              <h2 className="hd-modalTitle">Select Equipment</h2>
              <button className="hd-modalClose" onClick={() => setShowEquipmentModal(false)} aria-label="Close">×</button>
            </div>

            {equipmentOptions.map((equipment) => {
              const checked = formData.equipmentNeeded.includes(equipment);
              return (
                <label key={equipment} className={`hd-equipOption ${checked ? "hd-checked" : ""}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => handleEquipmentChange(equipment, e.target.checked)}
                  />
                  <span>{equipment}</span>
                </label>
              );
            })}

            <button className="hd-modalDone" onClick={() => setShowEquipmentModal(false)}>
              Done ({formData.equipmentNeeded.length} selected)
            </button>
          </div>
        </div>
      )}

      <DashboardHeader />

      <div className="hd-wrap">
        <h1 className="hd-pageTitle">Book Your Harvesting Day</h1>

        <div className="hd-card">

          {/* Harvest Details */}
          <div className="hd-row">
            <div className="hd-rowLabel">
              <h2>Harvest Details</h2>
            </div>
            <div className="hd-rowFields">
              <div>
                <label className="hd-label">How Many VBAs Do You Need<span className="hd-req">*</span></label>
                <input
                  type="number"
                  className={`hd-input ${errors.workersNeeded ? "hd-error" : ""}`}
                  value={formData.workersNeeded}
                  onChange={(e) => handleInputChange("workersNeeded", Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  placeholder="Enter number of workers"
                />
                {errors.workersNeeded && <p className="hd-errorText">{errors.workersNeeded}</p>}
              </div>

              <div>
                <label className="hd-label">How many trees to be harvested?<span className="hd-req">*</span></label>
                <input
                  type="number"
                  className={`hd-input ${errors.transportationNeeded ? "hd-error" : ""}`}
                  value={formData.transportationNeeded}
                  onChange={(e) => handleInputChange("transportationNeeded", e.target.value)}
                  placeholder="Enter number of trees"
                  min="1"
                />
                {errors.transportationNeeded && <p className="hd-errorText">{errors.transportationNeeded}</p>}
              </div>
            </div>
          </div>

          {/* Equipment */}
          <div className="hd-row">
            <div className="hd-rowLabel">
              <h2>Equipment</h2>
              <p className="hd-rowHint">Optional — select anything you don't already have on hand</p>
            </div>
            <div className="hd-rowFields">
              <div>
                <label className="hd-label">Which Equipment do You Need?</label>
                <button
                  type="button"
                  className={`hd-input hd-fileTrigger hd-equipTrigger ${formData.equipmentNeeded.length > 0 ? "hd-hasValue" : ""}`}
                  onClick={() => setShowEquipmentModal(true)}
                >
                  <span>
                    {formData.equipmentNeeded.length > 0
                      ? `${formData.equipmentNeeded.length} equipment selected`
                      : "Click to select equipment..."}
                  </span>
                  <span className="hd-caret">▾</span>
                </button>
                {formData.equipmentNeeded.length > 0 && (
                  <div className="hd-tags">
                    {formData.equipmentNeeded.map((equipment) => (
                      <span key={equipment} className="hd-tag">
                        {equipment}
                        <button onClick={() => handleEquipmentChange(equipment, false)} aria-label={`Remove ${equipment}`}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Harvest Window */}
          <div className="hd-row">
            <div className="hd-rowLabel">
              <h2>Harvest Date Range (5 days window)<span className="hd-req">*</span></h2>
            </div>
            <div className="hd-rowFields">
              <div className="hd-fieldPair">
                <div>
                  <label className="hd-label">From</label>
                  <input
                    type="date"
                    className={`hd-input ${errors.harvestDateFrom ? "hd-error" : ""}`}
                    value={formData.harvestDateFrom}
                    onChange={(e) => handleDateChange("harvestDateFrom", e.target.value)}
                  />
                  {errors.harvestDateFrom && <p className="hd-errorText">{errors.harvestDateFrom}</p>}
                </div>
                <div>
                  <label className="hd-label">To (Auto-calculated 5 days)</label>
                  <input
                    type="date"
                    className={`hd-input ${errors.harvestDateTo ? "hd-error" : ""}`}
                    value={formData.harvestDateTo}
                    readOnly
                  />
                  {errors.harvestDateTo && <p className="hd-errorText">{errors.harvestDateTo}</p>}
                </div>
              </div>
              {errors.harvestDateRange && <p className="hd-errorText">{errors.harvestDateRange}</p>}
            </div>
          </div>

          {/* Photos */}
          <div className="hd-row">
            <div className="hd-rowLabel">
              <h2>Upload pictures of crops ready for harvest</h2>
            </div>
            <div className="hd-rowFields">
              <div>
                <div className="hd-uploadRow">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="hd-fileTrigger">
                    Choose files…
                  </label>
                  <button
                    type="button"
                    className="hd-uploadBtn"
                    onClick={() => document.getElementById("file-upload").click()}
                  >
                    Upload
                  </button>
                </div>
                {formData.harvestImages.length > 0 && (
                  <div>
                    <p className="hd-fileListTitle">Uploaded files:</p>
                    <div className="hd-fileList">
                      {formData.harvestImages.map((file, index) => (
                        <div key={index} className="hd-fileItem">{file.name}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="hd-footer">
            {errors.submit && <p className="hd-submitErr">{errors.submit}</p>}
            <button type="button" className="hd-btnCancel" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              className="hd-submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting…" : "Submit harvest request"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}