import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { register } from '../../services/authService';
import { uploadSingle } from '../../services/uploadService';
import { updateFarmerInformation } from '../../services/farmer-information';
import { inputClass } from '../../components/Ui/kit';
import { authButton, AuthMessage } from '../../components/Layout/AuthShell';
import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';
import LocationPicker from '../../components/Location/LocationPicker';

const AVOCADO_TYPES = ['Hass', 'Fuerte', 'Bacon', 'Zutano', 'Mixed'];
const ASSISTANCE_OPTIONS = ['irrigation', 'fertilizers', 'training', 'advisory', 'credit', 'equipment', 'seedlings', 'pest_control'];
const IRRIGATION_SYSTEMS = ['None (rain-fed)', 'Drip irrigation', 'Sprinkler', 'Furrow', 'Manual watering'];
const SOIL_TYPES = ['Loam', 'Clay', 'Sandy', 'Volcanic', 'Silt'];

const initialFormData = {
  // Account (all roles)
  email: '', password: '', full_name: '', phone: '', role: 'farmer',
  // Farmer
  age: '', id_number: '', gender: '', marital_status: '', education_level: '',
  province: '', district: '', sector: '', cell: '', village: '',
  farm_age: '', planted: '', avocado_type: '', mixed_percentage: '', farm_size: '', tree_count: '', upi_number: '',
  farm_province: '', farm_district: '', farm_sector: '', farm_cell: '', farm_village: '',
  assistance: [],
  // Farm record (feeds TreeRecord/DiseaseCase/HarvestForecast/FarmVisit elsewhere in the system)
  organic_certified: false, irrigation_system: '', soil_type: '',
  // Agent
  specialization: '', experience: '', certification: '',
  // Shop manager
  shopName: '', description: '',
};

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, required, full, children }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-sm font-medium text-slate-700">
        <span>{label} {required && <span className="text-rose-600">*</span>}</span>
        <span className="block mt-1">{children}</span>
      </label>
    </div>
  );
}


export default function Register() {
  const [formData, setFormData] = useState(initialFormData);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  /** LocationPicker → form fields with an optional prefix ('farm_'). */
  const setLocation = (prefix) => (l) =>
    setFormData((prev) => ({
      ...prev,
      [`${prefix}province`]: l.province || '', [`${prefix}district`]: l.district || '', [`${prefix}sector`]: l.sector || '',
      [`${prefix}cell`]: l.cell || '', [`${prefix}village`]: l.village || '',
    }));

  const toggleAssistance = (type) => {
    setFormData(prev => ({
      ...prev,
      assistance: prev.assistance.includes(type)
        ? prev.assistance.filter(a => a !== type)
        : [...prev.assistance, type],
    }));
  };

  const validate = () => {
    if (!formData.email || !formData.password || !formData.full_name || !formData.phone) {
      return 'Email, password, full name, and phone are required';
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (formData.role === 'farmer') {
      if (!formData.gender || !formData.province || !formData.district || !formData.farm_size || !formData.avocado_type) {
        return 'Please fill in gender, province, district, farm size, and avocado type';
      }
    } else if (formData.role === 'agent') {
      if (!formData.province || !formData.district || !formData.specialization) {
        return 'Please fill in province, district, and specialization';
      }
    } else if (formData.role === 'shop_manager') {
      if (!formData.shopName || !formData.description || !formData.province || !formData.district) {
        return 'Please fill in shop name, description, province, and district';
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = { ...formData };
      // Numeric fields: send undefined instead of '' so the backend doesn't choke on empty strings.
      ['age', 'farm_age', 'mixed_percentage', 'farm_size', 'tree_count'].forEach((f) => {
        payload[f] = payload[f] === '' ? undefined : Number(payload[f]);
      });

      if (formData.role !== 'farmer') {
        // Farmer-only fields are irrelevant for other roles.
        ['assistance', 'organic_certified'].forEach((f) => delete payload[f]);
      }
      Object.keys(payload).forEach((k) => { if (payload[k] === '') delete payload[k]; });

      const data = await register(payload);

      // Agent / shop-manager sign-ups wait for an administrator to activate them.
      if (data?.pending_approval) {
        navigate('/?registered=pending', { replace: true });
        return;
      }

      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('id', data.user.id);
      localStorage.setItem('username', data.user.email);

      // Uploads require a signed-in user, so the photo is attached right after the account exists.
      if (formData.role === 'farmer' && profileImageFile) {
        try {
          const uploadResult = await uploadSingle(profileImageFile);
          const url = uploadResult?.data?.url;
          if (url) {
            await updateFarmerInformation({ image: url });
            localStorage.setItem(`profilePic_${data.user.email}`, url);
          }
        } catch {
          // Account is created; the photo can be added later from the Profile page.
        }
      }

      navigate(`/dashboard/${data.user.role.replace('_', '-')}`);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <img src={logo} alt="" className="h-10 w-10 rounded-xl bg-white object-contain p-1 ring-1 ring-slate-200" />
          <span className="font-semibold text-slate-900">Avocado Society of Rwanda</span>
        </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <UserPlus className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Tell us about yourself so we can set up your dashboard.</p>
        </div>

        {error && <div className="mb-4"><AuthMessage message={error} /></div>}

        <form onSubmit={handleSubmit}>
          <Section title="I am a...">
            <Field label="Role" required full>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'farmer', label: 'Farmer' },
                  { value: 'agent', label: 'Agent' },
                  { value: 'shop_manager', label: 'Shop Manager' },
                ].map(opt => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => set('role', opt.value)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ring-1 ring-inset ${formData.role === opt.value ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'}`}
                    aria-pressed={formData.role === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>
          </Section>

          <Section title="Account">
            <Field label="Full Name" required>
              <input className={inputClass} value={formData.full_name} onChange={(e) => set('full_name', e.target.value)} disabled={loading} />
            </Field>
            <Field label="Email" required>
              <input type="email" className={inputClass} value={formData.email} onChange={(e) => set('email', e.target.value)} disabled={loading} />
            </Field>
            <Field label="Phone" required>
              <input className={inputClass} value={formData.phone} onChange={(e) => set('phone', e.target.value)} disabled={loading} placeholder="+250788123456" />
            </Field>
            <Field label="Password" required>
              <input type="password" className={inputClass} value={formData.password} onChange={(e) => set('password', e.target.value)} disabled={loading} placeholder="At least 8 characters, mixed case, number, symbol" />
            </Field>
          </Section>

          {formData.role === 'farmer' && (
            <>
              <Section title="Personal details">
                <Field label="Age">
                  <input type="number" min="0" className={inputClass} value={formData.age} onChange={(e) => set('age', e.target.value)} disabled={loading} />
                </Field>
                <Field label="National ID Number">
                  <input className={inputClass} value={formData.id_number} onChange={(e) => set('id_number', e.target.value)} disabled={loading} />
                </Field>
                <Field label="Gender" required>
                  <select className={inputClass} value={formData.gender} onChange={(e) => set('gender', e.target.value)} disabled={loading}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </Field>
                <Field label="Marital Status">
                  <select className={inputClass} value={formData.marital_status} onChange={(e) => set('marital_status', e.target.value)} disabled={loading}>
                    <option value="">Select status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </Field>
                <Field label="Education Level">
                  <select className={inputClass} value={formData.education_level} onChange={(e) => set('education_level', e.target.value)} disabled={loading}>
                    <option value="">Select level</option>
                    <option value="Primary">Primary</option>
                    <option value="Secondary">Secondary</option>
                    <option value="University">University</option>
                    <option value="None">None</option>
                  </select>
                </Field>
                <Field label="Profile Photo">
                  <input
                    type="file"
                    accept="image/*"
                    className={inputClass}
                    onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
                    disabled={loading}
                  />
                </Field>
              </Section>

              <Section title="Personal location">
                <div className="sm:col-span-2">
                  <LocationPicker
                    idPrefix="reg-home"
                    value={{ province: formData.province, district: formData.district, sector: formData.sector, cell: formData.cell, village: formData.village }}
                    onChange={setLocation('')}
                    disabled={loading}
                  />
                </div>
              </Section>

              <Section title="Farm details">
                <Field label="Farm Age (years)">
                  <input type="number" min="0" className={inputClass} value={formData.farm_age} onChange={(e) => set('farm_age', e.target.value)} disabled={loading} />
                </Field>
                <Field label="Year Planted">
                  <input className={inputClass} value={formData.planted} onChange={(e) => set('planted', e.target.value)} disabled={loading} />
                </Field>
                <Field label="Avocado Type" required>
                  <select className={inputClass} value={formData.avocado_type} onChange={(e) => set('avocado_type', e.target.value)} disabled={loading}>
                    <option value="">Select type</option>
                    {AVOCADO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Mixed Percentage (%)">
                  <input type="number" min="0" max="100" className={inputClass} value={formData.mixed_percentage} onChange={(e) => set('mixed_percentage', e.target.value)} disabled={loading} />
                </Field>
                <Field label="Farm Size (hectares)" required>
                  <input type="number" step="0.1" min="0" className={inputClass} value={formData.farm_size} onChange={(e) => set('farm_size', e.target.value)} disabled={loading} />
                </Field>
                <Field label="Tree Count">
                  <input type="number" min="0" className={inputClass} value={formData.tree_count} onChange={(e) => set('tree_count', e.target.value)} disabled={loading} />
                </Field>
                <Field label="UPI Number">
                  <input className={inputClass} value={formData.upi_number} onChange={(e) => set('upi_number', e.target.value)} disabled={loading} />
                </Field>
                <Field label="Irrigation System">
                  <select className={inputClass} value={formData.irrigation_system} onChange={(e) => set('irrigation_system', e.target.value)} disabled={loading}>
                    <option value="">Select irrigation type</option>
                    {IRRIGATION_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Soil Type">
                  <select className={inputClass} value={formData.soil_type} onChange={(e) => set('soil_type', e.target.value)} disabled={loading}>
                    <option value="">Select soil type</option>
                    {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={formData.organic_certified}
                      onChange={(e) => set('organic_certified', e.target.checked)}
                      disabled={loading}
                    />
                    <span className="text-sm font-medium text-slate-700">My farm is certified organic</span>
                  </label>
                </div>
              </Section>

              <Section title="Farm location">
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    className="mb-3 text-xs font-medium text-brand-700 hover:underline"
                    onClick={() => setFormData((f) => ({ ...f, farm_province: f.province, farm_district: f.district, farm_sector: f.sector, farm_cell: f.cell, farm_village: f.village }))}
                  >
                    My farm is where I live
                  </button>
                  <LocationPicker
                    idPrefix="reg-farm"
                    labelPrefix="Farm"
                    required="province"
                    value={{ province: formData.farm_province, district: formData.farm_district, sector: formData.farm_sector, cell: formData.farm_cell, village: formData.farm_village }}
                    onChange={setLocation('farm_')}
                    disabled={loading}
                  />
                </div>
              </Section>

              <Section title="Assistance needed">
                <Field label="Select any that apply" full>
                  <div className="flex flex-wrap gap-2">
                    {ASSISTANCE_OPTIONS.map(opt => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => toggleAssistance(opt)}
                        className={`rounded-full px-3 py-1.5 text-sm capitalize ring-1 ring-inset ${formData.assistance.includes(opt) ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-700 ring-slate-300 hover:bg-slate-50'}`}
                        aria-pressed={formData.assistance.includes(opt)}
                      >
                        {opt.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </Field>
              </Section>
            </>
          )}

          {formData.role === 'agent' && (
            <>
              <Section title="Where you work">
                <div className="sm:col-span-2">
                  <LocationPicker
                    idPrefix="reg-agent"
                    value={{ province: formData.province, district: formData.district, sector: formData.sector, cell: formData.cell, village: formData.village }}
                    onChange={setLocation('')}
                    disabled={loading}
                  />
                  <p className="mt-2 text-xs text-slate-500">An administrator confirms the area you serve when your account is activated.</p>
                </div>
              </Section>

              <Section title="Expertise">
                <Field label="Specialization" required>
                  <input className={inputClass} value={formData.specialization} onChange={(e) => set('specialization', e.target.value)} disabled={loading} placeholder="e.g. Pest Management" />
                </Field>
                <Field label="Experience">
                  <input className={inputClass} value={formData.experience} onChange={(e) => set('experience', e.target.value)} disabled={loading} placeholder="e.g. 5 years" />
                </Field>
                <Field label="Certification">
                  <input className={inputClass} value={formData.certification} onChange={(e) => set('certification', e.target.value)} disabled={loading} />
                </Field>
              </Section>
            </>
          )}

          {formData.role === 'shop_manager' && (
            <Section title="Shop details">
              <Field label="Shop Name" required>
                <input className={inputClass} value={formData.shopName} onChange={(e) => set('shopName', e.target.value)} disabled={loading} />
              </Field>
              <div className="sm:col-span-2">
                <LocationPicker
                  idPrefix="reg-shop"
                  depth="district"
                  value={{ province: formData.province, district: formData.district }}
                  onChange={setLocation('')}
                  disabled={loading}
                />
              </div>
              <Field label="Description" required full>
                <textarea className={inputClass} rows="3" value={formData.description} onChange={(e) => set('description', e.target.value)} disabled={loading} />
              </Field>
            </Section>
          )}

          <button type="submit" disabled={loading} className={authButton}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link to="/" className="font-medium text-brand-700 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
