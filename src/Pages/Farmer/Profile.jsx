import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getFarmerInformation, updateFarmerInformation } from '../../services/farmer-information';
import './profile.css';

/* ───────────── Icons (no external libs) ───────────── */
const Icon = ({ name, className = 'pf-i' }) => {
  const map = {
    Person: (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 2.5-9 5.5A1.5 1.5 0 0 0 4.5 21h15A1.5 1.5 0 0 0 21 19.5C21 16.5 17 14 12 14Z"/>
      </svg>
    ),
    Map: (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z"/>
      </svg>
    ),
    Leaf: (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M21 3S11 2 6 7s-4 11-4 11 6 2 11-3S21 3 21 3Zm-9 6-2 4"/>
      </svg>
    ),
    Hand: (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M4 11v2a7 7 0 0 0 14 0V6a2 2 0 0 0-4 0v5M10 6v6M7 8v4"/>
      </svg>
    ),
    ID:  (<svg viewBox="0 0 24 24" className={className}><path d="M3 5h18v14H3zM7 9h4M7 13h7"/></svg>),
    Age: (<svg viewBox="0 0 24 24" className={className}><path d="M12 6v6l4 2"/></svg>),
    Gender: (<svg viewBox="0 0 24 24" className={className}><path d="M20 4h-6m6 0-6 6M8 20a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/></svg>),
    Ring: (<svg viewBox="0 0 24 24" className={className}><path d="M12 7a8 8 0 1 0 8 8 8 8 0 0 0-8-8Zm0-4 2 2h-4Z"/></svg>),
    Book: (<svg viewBox="0 0 24 24" className={className}><path d="M5 4h9a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4Z"/></svg>),
    Province: (<svg viewBox="0 0 24 24" className={className}><path d="M4 6h16v12H4z"/></svg>),
    District: (<svg viewBox="0 0 24 24" className={className}><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/></svg>),
    Sector: (<svg viewBox="0 0 24 24" className={className}><path d="M12 3v18M3 12h18"/></svg>),
    Cell: (<svg viewBox="0 0 24 24" className={className}><path d="M7 7h10v10H7z"/></svg>),
    Village: (<svg viewBox="0 0 24 24" className={className}><path d="M4 12 12 4l8 8v8H4zM9 20v-6h6v6"/></svg>),
    Years: (<svg viewBox="0 0 24 24" className={className}><path d="M4 12h16M12 4v16"/></svg>),
    Type: (<svg viewBox="0 0 24 24" className={className}><path d="m4 8 8-4 8 4-8 4-8-4Z"/></svg>),
    Size: (<svg viewBox="0 0 24 24" className={className}><path d="M4 20V4h16v16zM7 7h10v10H7z"/></svg>),
    Trees: (<svg viewBox="0 0 24 24" className={className}><path d="m12 2 5 9h-3l4 7H6l4-7H7l5-9Z"/></svg>),
    UPI: (<svg viewBox="0 0 24 24" className={className}><path d="M3 7h18M3 12h18M3 17h18"/></svg>),
    Plant: (<svg viewBox="0 0 24 24" className={className}><path d="M12 22V12s6-1 6-7C14 5 12 8 12 8S10 5 6 5c0 6 6 7 6 7"/></svg>),
    Mix: (<svg viewBox="0 0 24 24" className={className}><path d="M4 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-8h8"/></svg>),
    Edit: (<svg viewBox="0 0 24 24" className={className}><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75Z"/></svg>),
    Check: (<svg viewBox="0 0 24 24" className={className}><path d="m20 6-11 11L4 12"/></svg>),
    Close: (<svg viewBox="0 0 24 24" className={className}><path d="M6 6l12 12M18 6 6 18"/></svg>)
  };
  return map[name] || null;
};

/* ───────────── Small UI helpers ───────────── */
const InfoRow = ({ icon, label, value }) => (
  <div className="pf-info-row" role="listitem">
    <div className="pf-row-label">
      <Icon name={icon} />
      <span>{label}</span>
    </div>
    <span className="pf-value">{value || '—'}</span>
  </div>
);

const Chip = ({ label, value }) => (
  <div className="pf-chip" title={label}>
    <span className="pf-chip-k">{label}</span>
    <span className="pf-chip-v">{value ?? '—'}</span>
  </div>
);

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formInnerTab, setFormInnerTab] = useState('personal'); // modal tabs

  /* Fetch */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getFarmerInformation();
        const { user_info, farmer_profile } = response.data;

        const profileData = {
          id: user_info.id,
          full_name: user_info.full_name,
          email: user_info.email,
          phone: user_info.phone,
          role: 'farmer',
          status: user_info.status,
          created_at: user_info.created_at,
          updated_at: user_info.updated_at,
          profile: farmer_profile || {},
        };

        setProfile(profileData);
        setFormData({
          full_name: user_info.full_name || '',
          email: user_info.email || '',
          phone: user_info.phone || '',
          age: farmer_profile?.age || '',
          id_number: farmer_profile?.id_number || '',
          gender: farmer_profile?.gender || '',
          marital_status: farmer_profile?.marital_status || '',
          education_level: farmer_profile?.education_level || '',
          province: farmer_profile?.province || '',
          district: farmer_profile?.district || '',
          sector: farmer_profile?.sector || '',
          cell: farmer_profile?.cell || '',
          village: farmer_profile?.village || '',
          farm_age: farmer_profile?.farm_age || '',
          avocado_type: farmer_profile?.avocado_type || '',
          farm_size: farmer_profile?.farm_size || '',
          tree_count: farmer_profile?.tree_count || '',
          upi_number: farmer_profile?.upi_number || '',
          planted: farmer_profile?.planted || '',
          mixed_percentage: farmer_profile?.mixed_percentage || '',
          farm_province: farmer_profile?.farm_province || '',
          farm_district: farmer_profile?.farm_district || '',
          farm_sector: farmer_profile?.farm_sector || '',
          farm_cell: farmer_profile?.farm_cell || '',
          farm_village: farmer_profile?.farm_village || '',
          assistance: farmer_profile?.assistance || []
        });
      } catch (err) {
        setError('Failed to load profile.');
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const fp = profile?.profile || {};

  /* Derived metrics for the summary chips */
  const summary = useMemo(() => ([
    { k: 'Trees', v: fp.tree_count || 0 },
    { k: 'Hectares', v: fp.farm_size || 0 },
    { k: 'Variety', v: fp.avocado_type || '—' },
    { k: 'UPI', v: fp.upi_number || '—' },
  ]), [fp]);

  /* Handlers */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const updateData = {};
      Object.entries(formData).forEach(([k, v]) => {
        if (v === '' || v === null || typeof v === 'undefined') return;
        if (['age', 'farm_age', 'tree_count'].includes(k)) updateData[k] = parseInt(v, 10);
        else if (['farm_size', 'mixed_percentage'].includes(k)) updateData[k] = parseFloat(v);
        else updateData[k] = v;
      });

      const res = await updateFarmerInformation(updateData);
      const { user_info, farmer_profile } = res.data;

      const updatedProfile = {
        ...profile,
        full_name: user_info.full_name,
        email: user_info.email,
        phone: user_info.phone,
        status: user_info.status,
        profile: farmer_profile,
      };

      setProfile(updatedProfile);
      localStorage.setItem('user', JSON.stringify(updatedProfile));
      setSaveSuccess(true);

      // Auto-close with a small delay for UX
      setTimeout(() => {
        setShowModal(false);
        setSaveSuccess(false);
      }, 1200);
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  /* Keyboard navigation for tabs (left/right) */
  const onKeyTabs = useCallback((e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const ids = ['personal', 'location', 'farm', 'assistance'];
    const idx = ids.indexOf(activeTab);
    const next = e.key === 'ArrowRight' ? (idx + 1) % ids.length : (idx - 1 + ids.length) % ids.length;
    setActiveTab(ids[next]);
  }, [activeTab]);

  if (loading) {
    return (
      <div className="pf-loading">
        <div className="pf-spinner"></div>
        <p>Loading profile…</p>
      </div>
    );
  }
  if (error) {
    return <div className="pf-error"><p>{error}</p></div>;
  }
  if (!profile) {
    return <div className="pf-no-data">No profile data.</div>;
  }

  return (
    <div className="pf-container" onKeyDown={onKeyTabs}>
      {/* ── Sticky Summary Bar (minimize scroll) ── */}
      <header className="pf-summary">
        <div className="pf-s-left">
          <div className="pf-avatar sm">
            {fp.image ? <img src={fp.image} alt="Profile" /> : <div className="pf-avatar-fallback">Farmer</div>}
          </div>
          <div>
            <h1 className="pf-name">{profile.full_name}</h1>
            <div className="pf-subline">
              <span>Farmer</span>
              <span>•</span>
              <span>Member since {new Date(profile.created_at).getFullYear()}</span>
            </div>
            <div className="pf-contact-inline">
              <span>{profile.email}</span>
              <span>·</span>
              <span>{profile.phone}</span>
            </div>
          </div>
        </div>
        <div className="pf-s-right">
          {summary.map((c) => <Chip key={c.k} label={c.k} value={c.v} />)}
          <button className="pf-btn pf-primary" onClick={() => setShowModal(true)}>
            <Icon name="Edit" /> Edit
          </button>
        </div>
      </header>

      {/* ── Segmented Tabs (sticky) ── */}
      <div className="pf-tabs pf-sticky">
        {[
          { id: 'personal', label: 'Personal', icon: 'Person' },
          { id: 'location', label: 'Location', icon: 'Map' },
          { id: 'farm', label: 'Farm', icon: 'Leaf' },
          { id: 'assistance', label: 'Assistance', icon: 'Hand' },
        ].map(t => (
          <button
            key={t.id}
            className={`pf-tab-btn ${activeTab === t.id ? 'pf-active' : ''}`}
            onClick={() => setActiveTab(t.id)}
            aria-pressed={activeTab === t.id}
          >
            <Icon name={t.icon} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Content (two-column, dense, limited height) ── */}
      <main className="pf-content clamp">
        {activeTab === 'personal' && (
          <section className="pf-section" aria-labelledby="personal-title">
            <h3 id="personal-title" className="pf-title">Personal Information</h3>
            <div role="list" className="pf-table two-col">
              <InfoRow icon="ID" label="ID Number" value={fp.id_number} />
              <InfoRow icon="Age" label="Age" value={fp.age} />
              <InfoRow icon="Gender" label="Gender" value={fp.gender} />
              <InfoRow icon="Ring" label="Marital Status" value={fp.marital_status} />
              <InfoRow icon="Book" label="Education" value={fp.education_level} />
            </div>
          </section>
        )}

        {activeTab === 'location' && (
          <section className="pf-section" aria-labelledby="loc-title">
            <h3 id="loc-title" className="pf-title">Personal Location</h3>
            <div role="list" className="pf-table two-col">
              <InfoRow icon="Province" label="Province" value={fp.province} />
              <InfoRow icon="District" label="District" value={fp.district} />
              <InfoRow icon="Sector" label="Sector" value={fp.sector} />
              <InfoRow icon="Cell" label="Cell" value={fp.cell} />
              <InfoRow icon="Village" label="Village" value={fp.village} />
            </div>
          </section>
        )}

        {activeTab === 'farm' && (
          <>
            <section className="pf-section" aria-labelledby="farm-d-title">
              <h3 id="farm-d-title" className="pf-title">Farm Details</h3>
              <div role="list" className="pf-table two-col">
                <InfoRow icon="Years" label="Farm Age" value={fp.farm_age ? `${fp.farm_age} yrs` : '—'} />
                <InfoRow icon="Type" label="Avocado Type" value={fp.avocado_type} />
                <InfoRow icon="Size" label="Farm Size (ha)" value={fp.farm_size} />
                <InfoRow icon="Trees" label="Tree Count" value={fp.tree_count} />
                <InfoRow icon="UPI" label="UPI Number" value={fp.upi_number} />
                <InfoRow icon="Plant" label="Planted Year" value={fp.planted} />
                <InfoRow icon="Mix" label="Mixed %" value={fp.mixed_percentage} />
              </div>
            </section>

            <section className="pf-section" aria-labelledby="farm-l-title">
              <h3 id="farm-l-title" className="pf-title">Farm Location</h3>
              <div role="list" className="pf-table two-col">
                <InfoRow icon="Province" label="Province" value={fp.farm_province} />
                <InfoRow icon="District" label="District" value={fp.farm_district} />
                <InfoRow icon="Sector" label="Sector" value={fp.farm_sector} />
                <InfoRow icon="Cell" label="Cell" value={fp.farm_cell} />
                <InfoRow icon="Village" label="Village" value={fp.farm_village} />
              </div>
            </section>
          </>
        )}

        {activeTab === 'assistance' && (
          <section className="pf-section" aria-labelledby="asst-title">
            <h3 id="asst-title" className="pf-title">Assistance Received</h3>
            <div className="pf-tags">
              {Array.isArray(fp.assistance) && fp.assistance.length > 0 ? (
                fp.assistance.map((item, i) => (
                  <span key={i} className="pf-tag">{item}</span>
                ))
              ) : (
                <p className="pf-muted">No assistance recorded</p>
              )}
            </div>
          </section>
        )}
      </main>

      {/* ── Edit Modal (tabbed to reduce scroll) ── */}
      {showModal && (
        <div className="pf-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="pf-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="edit-title">
            <div className="pf-modal-header">
              <h2 id="edit-title">Update Profile</h2>
              <button className="pf-icon-btn" onClick={() => setShowModal(false)} aria-label="Close">
                <Icon name="Close" />
              </button>
            </div>

            <div className="pf-form-tabs">
              {['personal','location','farm','farm_location'].map(id => (
                <button
                  key={id}
                  className={`pf-form-tab ${formInnerTab === id ? 'active' : ''}`}
                  onClick={() => setFormInnerTab(id)}
                >
                  {id === 'personal' && <>Personal</>}
                  {id === 'location' && <>Location</>}
                  {id === 'farm' && <>Farm</>}
                  {id === 'farm_location' && <>Farm Location</>}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="pf-form">
              {saveError && <div className="pf-alert error">{saveError}</div>}
              {saveSuccess && <div className="pf-alert success"><Icon name="Check" /> Saved</div>}

              {formInnerTab === 'personal' && (
                <div className="pf-form-grid">
                  <input name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleInputChange} />
                  <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} />
                  <input name="phone" type="tel" placeholder="Phone" value={formData.phone} onChange={handleInputChange} />
                  <input name="age" type="number" placeholder="Age" value={formData.age} onChange={handleInputChange} />
                  <input name="id_number" placeholder="ID Number" value={formData.id_number} onChange={handleInputChange} />
                  <select name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="">Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                  <select name="marital_status" value={formData.marital_status} onChange={handleInputChange}>
                    <option value="">Marital Status</option>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                  </select>
                  <input name="education_level" placeholder="Education" value={formData.education_level} onChange={handleInputChange} />
                </div>
              )}

              {formInnerTab === 'location' && (
                <div className="pf-form-grid">
                  <input name="province" placeholder="Province" value={formData.province} onChange={handleInputChange} />
                  <input name="district" placeholder="District" value={formData.district} onChange={handleInputChange} />
                  <input name="sector" placeholder="Sector" value={formData.sector} onChange={handleInputChange} />
                  <input name="cell" placeholder="Cell" value={formData.cell} onChange={handleInputChange} />
                  <input name="village" placeholder="Village" value={formData.village} onChange={handleInputChange} />
                </div>
              )}

              {formInnerTab === 'farm' && (
                <div className="pf-form-grid">
                  <input name="farm_age" type="number" placeholder="Farm Age (yrs)" value={formData.farm_age} onChange={handleInputChange} />
                  <input name="avocado_type" placeholder="Avocado Type" value={formData.avocado_type} onChange={handleInputChange} />
                  <input name="farm_size" placeholder="Farm Size (ha)" value={formData.farm_size} onChange={handleInputChange} />
                  <input name="tree_count" type="number" placeholder="Tree Count" value={formData.tree_count} onChange={handleInputChange} />
                  <input name="upi_number" placeholder="UPI Number" value={formData.upi_number} onChange={handleInputChange} />
                  <input name="planted" placeholder="Planted Year" value={formData.planted} onChange={handleInputChange} />
                  <input name="mixed_percentage" placeholder="Mixed %" value={formData.mixed_percentage} onChange={handleInputChange} />
                </div>
              )}

              {formInnerTab === 'farm_location' && (
                <div className="pf-form-grid">
                  <input name="farm_province" placeholder="Province" value={formData.farm_province} onChange={handleInputChange} />
                  <input name="farm_district" placeholder="District" value={formData.farm_district} onChange={handleInputChange} />
                  <input name="farm_sector" placeholder="Sector" value={formData.farm_sector} onChange={handleInputChange} />
                  <input name="farm_cell" placeholder="Cell" value={formData.farm_cell} onChange={handleInputChange} />
                  <input name="farm_village" placeholder="Village" value={formData.farm_village} onChange={handleInputChange} />
                </div>
              )}

              <div className="pf-modal-footer">
                <button type="button" className="pf-btn pf-muted" onClick={() => setShowModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="pf-btn pf-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
