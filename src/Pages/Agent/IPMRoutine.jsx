import React, { useState } from 'react';

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

export default function App() {
  const [selectedDisease, setSelectedDisease] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [selectedPest, setSelectedPest] = useState('');
  const [selectedDamage, setSelectedDamage] = useState('');
  const [pestNoticed, setPestNoticed] = useState('');
  const [controlMethods, setControlMethods] = useState('');
  const [primaryImage, setPrimaryImage] = useState(null);
  const [secondaryImage, setSecondaryImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          background: 'white',
          borderRadius: '16px',
          // padding: '48px 32px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #27ae60, #219653)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="40" height="40" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 style={{
            fontSize: '28px',
            color: '#1b5e20',
            marginBottom: '16px',
            fontWeight: '700'
          }}>
            Diagnosis Submitted Successfully!
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#555',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            Thank you for submitting your pest and disease diagnostic form. Our agricultural experts will review your submission and contact you within 24-48 hours with recommendations.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setSelectedDisease('');
              setSelectedSymptom('');
              setSelectedPest('');
              setSelectedDamage('');
              setPestNoticed('');
              setControlMethods('');
              setPrimaryImage(null);
              setSecondaryImage(null);
              setErrors({});
            }}
            style={{
              padding: '14px 32px',
              background: 'linear-gradient(to right, #27ae60, #219653)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Submit Another Diagnosis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      // background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      // padding: '40px 20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '9px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '28px',
            color: '#1b5e20',
            marginBottom: '8px',
            fontWeight: '700',
            letterSpacing: '-0.5px'
          }}>
            Avocado Pest & Disease Diagnostic <br /> Plus Regural Agronomic Scouting
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#666',
            lineHeight: '1.5'
          }}>
            Help us identify and treat issues within  your avocado orchard!
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div style={{
              padding: '14px 16px',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              color: '#c33',
              fontSize: '14px',
              marginBottom: '24px'
            }}>
              {errors.general}
            </div>
          )}

          {/* Diseases Section */}
          <div style={{
            background: '#f9fafb',
            padding: '28px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '2px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '20px',
              color: '#1b5e20',
              marginBottom: '20px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{
                width: '32px',
                height: '32px',
                background: '#27ae60',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: '700'
              }}>1</span>
              Disease Identification
            </h2>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: selectedDisease === '' ? '1fr' : '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Select by Symptoms
                </label>
                <select
                  value={selectedSymptom}
                  onChange={handleSymptomChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '15px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    marginBottom: '20px'
                  }}
                >
                  <option value="">-- Select symptoms --</option>
                  {diseases.map((item, index) => (
                    <option key={index} value={index}>{item.symptoms}</option>
                  ))}
                </select>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    When did you first notice the issue? <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={pestNoticed}
                    onChange={(e) => {
                      setPestNoticed(e.target.value);
                      setErrors(prev => ({ ...prev, pestNoticed: '' }));
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '15px',
                      border: errors.pestNoticed ? '2px solid #ef4444' : '2px solid #d1d5db',
                      borderRadius: '8px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">-- Select timeframe --</option>
                    <option value="this_week">This week</option>
                    <option value="few_weeks">A few weeks ago</option>
                    <option value="2_months">In the last 2 months</option>
                    <option value="last_year">Last year</option>
                  </select>
                  {errors.pestNoticed && (
                    <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{errors.pestNoticed}</p>
                  )}
                </div>
              </div>

              {selectedDisease !== '' && (
                <div style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #e8f5e9 0%, #d4edda 100%)',
                  borderRadius: '8px',
                  border: '1px solid #a5d6a7',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div>
                    <p style={{ fontSize: '13px', color: '#1b5e20', marginBottom: '4px', fontWeight: '600' }}>
                      Disease:
                    </p>
                    <p style={{ fontSize: '14px', color: '#2e7d32' }}>
                      {diseases[selectedDisease].disease}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: '#1b5e20', marginBottom: '4px', fontWeight: '600' }}>
                      Symptoms:
                    </p>
                    <p style={{ fontSize: '14px', color: '#2e7d32' }}>
                      {diseases[selectedDisease].symptoms}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pests Section */}
          <div style={{
            background: '#f9fafb',
            padding: '28px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '2px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '20px',
              color: '#1b5e20',
              marginBottom: '20px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{
                width: '32px',
                height: '32px',
                background: '#27ae60',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: '700'
              }}>2</span>
              Pest Identification
            </h2>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: selectedPest === '' ? '1fr' : '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Select by Damage Type
                </label>
                <select
                  value={selectedDamage}
                  onChange={handleDamageChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '15px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    marginBottom: '20px'
                  }}
                >
                  <option value="">-- Select damage type --</option>
                  {pests.map((item, index) => (
                    <option key={index} value={index}>{item.damage}</option>
                  ))}
                </select>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    When did you first notice the issue? <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={pestNoticed}
                    onChange={(e) => {
                      setPestNoticed(e.target.value);
                      setErrors(prev => ({ ...prev, pestNoticed: '' }));
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '15px',
                      border: errors.pestNoticed ? '2px solid #ef4444' : '2px solid #d1d5db',
                      borderRadius: '8px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">-- Select timeframe --</option>
                    <option value="this_week">This week</option>
                    <option value="few_weeks">A few weeks ago</option>
                    <option value="2_months">In the last 2 months</option>
                    <option value="last_year">Last year</option>
                  </select>
                  {errors.pestNoticed && (
                    <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{errors.pestNoticed}</p>
                  )}
                </div>
              </div>

              {selectedPest !== '' && (
                <div style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                  borderRadius: '8px',
                  border: '1px solid #ffb74d',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div>
                    <p style={{ fontSize: '13px', color: '#e65100', marginBottom: '4px', fontWeight: '600' }}>
                      Pest:
                    </p>
                    <p style={{ fontSize: '14px', color: '#f57c00' }}>
                      {pests[selectedPest].pest}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: '#e65100', marginBottom: '4px', fontWeight: '600' }}>
                      Damage:
                    </p>
                    <p style={{ fontSize: '14px', color: '#f57c00' }}>
                      {pests[selectedPest].damage}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div style={{
            background: '#f9fafb',
            padding: '28px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '2px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '20px',
              color: '#1b5e20',
              marginBottom: '20px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{
                width: '32px',
                height: '32px',
                background: '#27ae60',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: '700'
              }}>3</span>
              Additional Details
            </h2>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Control methods already tried
                </label>
                <textarea
                  value={controlMethods}
                  onChange={(e) => setControlMethods(e.target.value)}
                  placeholder="e.g., neem oil, copper spray, traps, sanitation practices..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '15px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Upload Image of Problem <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePrimaryImage}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    border: errors.primaryImage ? '2px dashed #ef4444' : '2px dashed #d1d5db',
                    borderRadius: '8px',
                    background: '#f9fafb',
                    cursor: 'pointer'
                  }}
                />
                {primaryImage && (
                  <p style={{ color: '#27ae60', fontSize: '14px', marginTop: '8px', fontWeight: '500' }}>
                     Selected: {primaryImage.name}
                  </p>
                )}
                {errors.primaryImage && (
                  <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>{errors.primaryImage}</p>
                )}
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Additional Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSecondaryImage}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    background: '#f9fafb',
                    cursor: 'pointer'
                  }}
                />
                {secondaryImage && (
                  <p style={{ color: '#27ae60', fontSize: '14px', marginTop: '8px', fontWeight: '500' }}>
                    ✓ Selected: {secondaryImage.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: '40%',
              padding: '16px',
              background: 'linear-gradient(to right, #27ae60, #219653)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '17px',
              fontWeight: '700',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 14px rgba(39, 174, 96, 0.4)',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(39, 174, 96, 0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 14px rgba(39, 174, 96, 0.4)';
            }}
          >
            Submit Diagnosis
          </button>
        </form>

        
        
         
       
      </div>
    </div>
  );
}