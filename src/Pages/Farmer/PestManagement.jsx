import React, { useState } from 'react';
import "../Styles/HarvestingDay.css";
import DashboardHeader from "../../components/Header/DashboardHeader";
import { createPestManagementRequest } from '../../services/serviceRequestsService';
import { uploadSingle } from '../../services/uploadService';

const diseases = [
  { disease: "Root Rot (Phytophthora Root Rot)", symptoms: "Wilting, leaf yellowing, twig dieback, root decay with brown/black rot, stunted trees" },
  { disease: "Anthracnose", symptoms: "Black sunken spots on fruit, lesions on twigs and leaves, postharvest rot" },
  { disease: "Stem-End Rot", symptoms: "Brown to black decay at fruit stem end, extends inward postharvest" },
  { disease: "Cercospora Spot (Leaf and Fruit Spot)", symptoms: "Purplish-brown leaf spots, small dark fruit lesions that crack" },
  { disease: "Scab", symptoms: "Raised corky brown lesions on fruit, leaves, and twigs" },
  { disease: "Botryosphaeria Dieback / Canker", symptoms: "Branch dieback, bark cracking, gumming" },
  { disease: "Powdery Mildew", symptoms: "White powdery growth on young leaves, defoliation, flower abortion" },
  { disease: "Armillaria Root Rot", symptoms: "Honey-colored mushrooms at base, white mycelial mats under bark" },
  { disease: "Bacterial Canker", symptoms: "Water-soaked leaf spots, twig dieback, cankers on stems" },
  { disease: "Bacterial Soft Rot (Postharvest)", symptoms: "Soft, watery fruit decay, foul odor" },
  { disease: "Sunblotch", symptoms: "Yellow streaks on fruit, cracked bark, reduced fruit set, stunted growth" },
  { disease: "Tip Burn / Leaf Burn", symptoms: "Brown leaf tips and margins" },
  { disease: "Fruit Drop", symptoms: "Premature fruit fall" },
  { disease: "Sunburn", symptoms: "Brown patches on fruit and exposed bark" }
];

const pests = [
  { pest: "Fruit fly", damage: "Larvae bore into fruit, causing rotting and early drop" },
  { pest: "Seed weevil", damage: "Larvae feed inside the seed, fruit often drops" },
  { pest: "Avocado seed moth", damage: "Larvae tunnel in seed and pulp" },
  { pest: "Avocado lace bug", damage: "Sucks sap from underside of leaves to yellow stippling, leaf drop" },
  { pest: "Leaf miner", damage: "Mines leaves, distorting growth" },
  { pest: "Thrips", damage: "Feed on fruit epidermis to russeting and scarring" },
  { pest: "Loopers / Caterpillars", damage: "Feed on tender leaves, flowers" },
  { pest: "Whiteflies", damage: "Sap sucking to honeydew to sooty mold" },
  { pest: "Shot hole borer / Ambrosia beetle", damage: "Bore into stems, inoculate fungi to dieback" },
  { pest: "Bark beetle", damage: "Bores into branches; associated with Fusarium fungi" },
  { pest: "Stem borer", damage: "Boring holes in stems and branches" },
  { pest: "Persea mite", damage: "Yellow necrotic spots on underside of leaves; defoliation" },
  { pest: "Avocado brown mite", damage: "Causes bronzing of leaves" },
  { pest: "Root weevil", damage: "Larvae feed on roots, adults notch leaves" },
  { pest: "Root mealybugs", damage: "Suck root sap, promote fungal growth" },
  { pest: "Termites", damage: "Feed on bark, weaken tree base" },
  { pest: "Snails & slugs", damage: "Feed on young shoots and leaves" },
  { pest: "Rodents (rats, squirrels)", damage: "Gnaw fruits, bark, and seedlings" },
  { pest: "Birds (esp. bulbuls, starlings)", damage: "Peck ripe fruits" }
];

export default function PestManagement() {
  const [selectedDisease, setSelectedDisease] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [selectedPest, setSelectedPest] = useState('');
  const [selectedDamage, setSelectedDamage] = useState('');
  const [pestNoticed, setPestNoticed] = useState('');
  const [severity, setSeverity] = useState('');
  const [controlMethods, setControlMethods] = useState('');
  const [primaryImage, setPrimaryImage] = useState(null);
  const [secondaryImage, setSecondaryImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleDiseaseChange = (e) => {
    const index = e.target.value;
    setSelectedDisease(index);
    setSelectedSymptom(index);
    if (errors.disease) {
      setErrors(prev => ({ ...prev, disease: '' }));
    }
  };

  const handleSymptomChange = (e) => {
    const index = e.target.value;
    setSelectedSymptom(index);
    setSelectedDisease(index);
    if (errors.disease) {
      setErrors(prev => ({ ...prev, disease: '' }));
    }
  };

  const handlePestChange = (e) => {
    const index = e.target.value;
    setSelectedPest(index);
    setSelectedDamage(index);
    if (errors.pest) {
      setErrors(prev => ({ ...prev, pest: '' }));
    }
  };

  const handleDamageChange = (e) => {
    const index = e.target.value;
    setSelectedDamage(index);
    setSelectedPest(index);
    if (errors.pest) {
      setErrors(prev => ({ ...prev, pest: '' }));
    }
  };

  const handlePrimaryImage = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPrimaryImage(file);
      setErrors(prev => ({ ...prev, primaryImage: '' }));
    } else if (file) {
      setErrors(prev => ({ ...prev, primaryImage: 'Please upload a valid image file' }));
    }
  };

  const handleSecondaryImage = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSecondaryImage(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedDisease && !selectedPest) {
      newErrors.general = 'Please select at least one disease or pest issue';
    }

    if (!pestNoticed) {
      newErrors.pestNoticed = 'Please select when you noticed the issue';
    }

    if (!primaryImage) {
      newErrors.primaryImage = 'Primary image is required';
    }

    if (!severity) {
      newErrors.severity = 'Please select a severity level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const issueName = selectedDisease !== '' ? diseases[selectedDisease].disease : pests[selectedPest].pest;
      const issueDetails = selectedDisease !== '' ? diseases[selectedDisease].symptoms : pests[selectedPest].damage;

      const attachments = [];
      const primaryUpload = await uploadSingle(primaryImage);
      if (primaryUpload?.data?.url) attachments.push(primaryUpload.data.url);
      if (secondaryImage) {
        const secondaryUpload = await uploadSingle(secondaryImage);
        if (secondaryUpload?.data?.url) attachments.push(secondaryUpload.data.url);
      }

      const location = {
        province: localStorage.getItem('farmerProvince') || 'Eastern Province',
        district: localStorage.getItem('farmerDistrict') || 'Gatsibo',
        sector: localStorage.getItem('farmerSector') || 'Kageyo',
        cell: localStorage.getItem('farmerCell') || 'Karangazi',
        village: localStorage.getItem('farmerVillage') || 'Nyagatare',
      };

      await createPestManagementRequest({
        service_type: 'pest_control',
        title: `Pest & Disease Diagnostic: ${issueName}`,
        description: `Farmer-reported diagnostic for ${issueName}. ${issueDetails}`,
        location,
        pest_management_details: {
          pests_diseases: [{ name: issueName }],
          first_noticed: pestNoticed,
          damage_observed: issueDetails,
          damage_details: issueDetails,
          control_methods_tried: controlMethods,
          severity_level: severity,
        },
        farmer_info: {
          name: localStorage.getItem('farmerName') || 'Unknown Farmer',
          phone: localStorage.getItem('farmerPhone') || '+250 000 000 000',
          location,
        },
        priority: severity === 'critical' ? 'urgent' : severity,
        attachments,
      });

      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || 'Failed to submit diagnosis. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedDisease('');
    setSelectedSymptom('');
    setSelectedPest('');
    setSelectedDamage('');
    setPestNoticed('');
    setSeverity('');
    setControlMethods('');
    setPrimaryImage(null);
    setSecondaryImage(null);
    setErrors({});
    setSubmitError('');
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
            <h2 className="hd-slipTitle">Diagnosis Submitted Successfully!</h2>
            <p className="hd-slipText">
              Thank you for submitting your pest and disease diagnostic form. Our agricultural experts will review your submission and contact you within 24-48 hours with recommendations.
            </p>
            <dl className="hd-slipDetails">
              <div className="hd-slipRow">
                <dt>Selected Issue:</dt>
                <dd>{selectedDisease !== '' ? diseases[selectedDisease].disease : pests[selectedPest].pest}</dd>
              </div>
              <div className="hd-slipRow">
                <dt>First Noticed:</dt>
                <dd>{pestNoticed}</dd>
              </div>
              <div className="hd-slipRow">
                <dt>Severity Level:</dt>
                <dd style={{ textTransform: 'capitalize' }}>{severity}</dd>
              </div>
              <div className="hd-slipRow">
                <dt>Images Attached:</dt>
                <dd>{(primaryImage ? 1 : 0) + (secondaryImage ? 1 : 0)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hd-scope">
      <DashboardHeader />

      <div className="hd-wrap">
        <h1 className="hd-pageTitle">
          Avocado Pest & Disease Diagnostic Plus Regular Agronomic Scouting
        </h1>

        <div className="hd-card">

          {errors.general && <p className="hd-errorText" style={{ padding: '0 0 16px 0', fontSize: '15px' }}>{errors.general}</p>}
          {submitError && <p className="hd-errorText" style={{ padding: '0 0 16px 0', fontSize: '15px' }}>{submitError}</p>}

          {/* Disease Identification */}
          <div className="hd-row">
            <div className="hd-rowLabel">
              <h2>Disease Identification</h2>
              <p className="hd-rowHint">Select by symptoms or directly pick a diagnosed disease</p>
            </div>
            <div className="hd-rowFields">
              <div>
                <label className="hd-label">Select by Symptoms</label>
                <select
                  className="hd-input"
                  value={selectedSymptom}
                  onChange={handleSymptomChange}
                >
                  <option value="">-- Select symptoms --</option>
                  {diseases.map((item, index) => (
                    <option key={index} value={index}>{item.symptoms}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="hd-label">Identified Disease</label>
                <select
                  className="hd-input"
                  value={selectedDisease}
                  onChange={handleDiseaseChange}
                >
                  <option value="">-- Select disease --</option>
                  {diseases.map((item, index) => (
                    <option key={index} value={index}>{item.disease}</option>
                  ))}
                </select>
              </div>

              {selectedDisease !== '' && (
                <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '8px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{diseases[selectedDisease].disease}</p>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{diseases[selectedDisease].symptoms}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pest Identification */}
          <div className="hd-row">
            <div className="hd-rowLabel">
              <h2>Pest Identification</h2>
              <p className="hd-rowHint">Select by observed damage or directly pick an identified pest</p>
            </div>
            <div className="hd-rowFields">
              <div>
                <label className="hd-label">Select by Damage Type</label>
                <select
                  className="hd-input"
                  value={selectedDamage}
                  onChange={handleDamageChange}
                >
                  <option value="">-- Select damage type --</option>
                  {pests.map((item, index) => (
                    <option key={index} value={index}>{item.damage}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="hd-label">Identified Pest</label>
                <select
                  className="hd-input"
                  value={selectedPest}
                  onChange={handlePestChange}
                >
                  <option value="">-- Select pest --</option>
                  {pests.map((item, index) => (
                    <option key={index} value={index}>{item.pest}</option>
                  ))}
                </select>
              </div>

              {selectedPest !== '' && (
                <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '8px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{pests[selectedPest].pest}</p>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{pests[selectedPest].damage}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="hd-row">
            <div className="hd-rowLabel">
              <h2>Additional Details</h2>
              <p className="hd-rowHint">Provide timelines, severity metrics, and historical control attempts</p>
            </div>
            <div className="hd-rowFields">
              <div className="hd-fieldPair">
                <div>
                  <label className="hd-label">When first noticed?<span className="hd-req">*</span></label>
                  <select
                    className={`hd-input ${errors.pestNoticed ? "hd-error" : ""}`}
                    value={pestNoticed}
                    onChange={(e) => {
                      setPestNoticed(e.target.value);
                      if (errors.pestNoticed) setErrors(prev => ({ ...prev, pestNoticed: '' }));
                    }}
                  >
                    <option value="">-- Select timeframe --</option>
                    <option value="this_week">This week</option>
                    <option value="few_weeks">A few weeks ago</option>
                    <option value="2_months">In the last 2 months</option>
                    <option value="last_year">Last year</option>
                  </select>
                  {errors.pestNoticed && <p className="hd-errorText">{errors.pestNoticed}</p>}
                </div>

                <div>
                  <label className="hd-label">Severity Level<span className="hd-req">*</span></label>
                  <select
                    className={`hd-input ${errors.severity ? "hd-error" : ""}`}
                    value={severity}
                    onChange={(e) => {
                      setSeverity(e.target.value);
                      if (errors.severity) setErrors(prev => ({ ...prev, severity: '' }));
                    }}
                  >
                    <option value="">-- Select severity --</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  {errors.severity && <p className="hd-errorText">{errors.severity}</p>}
                </div>
              </div>

              <div>
                <label className="hd-label">Control methods already tried</label>
                <textarea
                  className="hd-input"
                  value={controlMethods}
                  onChange={(e) => setControlMethods(e.target.value)}
                  placeholder="e.g., neem oil, copper spray, traps, sanitation practices..."
                  rows="3"
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Upload Attachments */}
          <div className="hd-row">
            <div className="hd-rowLabel">
              <h2>Upload Media Attachments</h2>
              <p className="hd-rowHint">Clear photos help our agronomists accurately diagnose issues</p>
            </div>
            <div className="hd-rowFields">
              <div>
                <label className="hd-label">Primary Image of Problem<span className="hd-req">*</span></label>
                <div className="hd-uploadRow">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePrimaryImage}
                    style={{ display: "none" }}
                    id="primary-file-upload"
                  />
                  <label htmlFor="primary-file-upload" className="hd-fileTrigger">
                    {primaryImage ? primaryImage.name : "Choose primary image..."}
                  </label>
                  <button
                    type="button"
                    className="hd-uploadBtn"
                    onClick={() => document.getElementById("primary-file-upload").click()}
                  >
                    Browse
                  </button>
                </div>
                {errors.primaryImage && <p className="hd-errorText">{errors.primaryImage}</p>}
              </div>

              <div>
                <label className="hd-label">Additional Image (Optional)</label>
                <div className="hd-uploadRow">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSecondaryImage}
                    style={{ display: "none" }}
                    id="secondary-file-upload"
                  />
                  <label htmlFor="secondary-file-upload" className="hd-fileTrigger">
                    {secondaryImage ? secondaryImage.name : "Choose optional image..."}
                  </label>
                  <button
                    type="button"
                    className="hd-uploadBtn"
                    onClick={() => document.getElementById("secondary-file-upload").click()}
                  >
                    Browse
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Control Actions */}
          <div className="hd-footer">
            <button type="button" className="hd-btnCancel" onClick={handleCancel} disabled={isSubmitting}>
              Reset Form
            </button>
            <button
              type="button"
              className="hd-submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Diagnosis"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}