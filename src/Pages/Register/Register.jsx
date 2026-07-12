import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { register } from '../../services/authService';
import { uploadSingle } from '../../services/uploadService';

const PROVINCES = ['Kigali', 'Eastern Province', 'Northern Province', 'Southern Province', 'Western Province'];

const DISTRICTS = {
  'Kigali': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  'Southern Province': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
  'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
};

const AVOCADO_TYPES = ['Hass', 'Fuerte', 'Bacon', 'Zutano', 'Mixed'];
const ASSISTANCE_OPTIONS = ['irrigation', 'fertilizers', 'training', 'equipment', 'seedlings', 'pest_control'];
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
      <h3 className="mb-3 text-sm font-bold tracking-wide text-green-700 uppercase">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, required, full, children }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block mb-1 text-sm font-medium text-gray-700">
        <span>{label} {required && <span className="text-red-500">*</span>}</span>
        <span className="block mt-1">{children}</span>
      </label>
    </div>
  );
}

const inputClass = 'w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-green-500';

export default function Register() {
  const [formData, setFormData] = useState(initialFormData);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

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

      if (formData.role === 'farmer' && profileImageFile) {
        const uploadResult = await uploadSingle(profileImageFile);
        if (uploadResult?.data?.url) payload.image = uploadResult.data.url;
      }

      const data = await register(payload);

      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('id', data.user.id);
      localStorage.setItem('username', data.user.email);

      navigate(`/dashboard/${data.user.role.replace('_', '-')}`);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const districtOptions = DISTRICTS[formData.province] || [];
  const farmDistrictOptions = DISTRICTS[formData.farm_province] || [];

  return (
    <div className="flex items-center justify-center min-h-screen py-10 bg-gradient-to-r from-green-400 to-green-500">
      <div className="w-11/12 max-w-3xl p-8 bg-white rounded-lg shadow-lg">
        <div className="mb-6 text-center">
          <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-800 md:text-3xl">
            <UserPlus className="text-green-600" /> Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-500">Tell us about yourself so we can set up your dashboard.</p>
        </div>

        {error && (
          <div className="w-full p-3 mb-4 text-sm text-center text-red-700 bg-red-100 rounded" role="alert">
            {error}
          </div>
        )}

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
                    className={`px-4 py-2 rounded border ${formData.role === opt.value ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'}`}
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
                <Field label="Province" required>
                  <select className={inputClass} value={formData.province} onChange={(e) => { set('province', e.target.value); set('district', ''); }} disabled={loading}>
                    <option value="">Select province</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="District" required>
                  <select className={inputClass} value={formData.district} onChange={(e) => set('district', e.target.value)} disabled={loading || !formData.province}>
                    <option value="">Select district</option>
                    {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Sector">
                  <input className={inputClass} value={formData.sector} onChange={(e) => set('sector', e.target.value)} disabled={loading} />
                </Field>
                <Field label="Cell">
                  <input className={inputClass} value={formData.cell} onChange={(e) => set('cell', e.target.value)} disabled={loading} />
                </Field>
                <Field label="Village">
                  <input className={inputClass} value={formData.village} onChange={(e) => set('village', e.target.value)} disabled={loading} />
                </Field>
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
                    <span className="text-sm font-medium text-gray-700">My farm is certified organic</span>
                  </label>
                </div>
              </Section>

              <Section title="Farm location">
                <Field label="Farm Province">
                  <select className={inputClass} value={formData.farm_province} onChange={(e) => { set('farm_province', e.target.value); set('farm_district', ''); }} disabled={loading}>
                    <option value="">Select province</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Farm District">
                  <select className={inputClass} value={formData.farm_district} onChange={(e) => set('farm_district', e.target.value)} disabled={loading || !formData.farm_province}>
                    <option value="">Select district</option>
                    {farmDistrictOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Farm Sector">
                  <input className={inputClass} value={formData.farm_sector} onChange={(e) => set('farm_sector', e.target.value)} disabled={loading} />
                </Field>
                <Field label="Farm Cell">
                  <input className={inputClass} value={formData.farm_cell} onChange={(e) => set('farm_cell', e.target.value)} disabled={loading} />
                </Field>
                <Field label="Farm Village">
                  <input className={inputClass} value={formData.farm_village} onChange={(e) => set('farm_village', e.target.value)} disabled={loading} />
                </Field>
              </Section>

              <Section title="Assistance needed">
                <Field label="Select any that apply" full>
                  <div className="flex flex-wrap gap-2">
                    {ASSISTANCE_OPTIONS.map(opt => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => toggleAssistance(opt)}
                        className={`px-3 py-1.5 text-sm rounded-full border ${formData.assistance.includes(opt) ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'}`}
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
              <Section title="Territory">
                <Field label="Province" required>
                  <select className={inputClass} value={formData.province} onChange={(e) => { set('province', e.target.value); set('district', ''); }} disabled={loading}>
                    <option value="">Select province</option>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="District" required>
                  <select className={inputClass} value={formData.district} onChange={(e) => set('district', e.target.value)} disabled={loading || !formData.province}>
                    <option value="">Select district</option>
                    {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Sector">
                  <input className={inputClass} value={formData.sector} onChange={(e) => set('sector', e.target.value)} disabled={loading} />
                </Field>
                <Field label="Cell">
                  <input className={inputClass} value={formData.cell} onChange={(e) => set('cell', e.target.value)} disabled={loading} />
                </Field>
                <Field label="Village">
                  <input className={inputClass} value={formData.village} onChange={(e) => set('village', e.target.value)} disabled={loading} />
                </Field>
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
              <Field label="Province" required>
                <select className={inputClass} value={formData.province} onChange={(e) => { set('province', e.target.value); set('district', ''); }} disabled={loading}>
                  <option value="">Select province</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="District" required>
                <select className={inputClass} value={formData.district} onChange={(e) => set('district', e.target.value)} disabled={loading || !formData.province}>
                  <option value="">Select district</option>
                  {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Description" required full>
                <textarea className={inputClass} rows="3" value={formData.description} onChange={(e) => set('description', e.target.value)} disabled={loading} />
              </Field>
            </Section>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 mt-2 text-white rounded ${loading ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account? <Link to="/" className="font-medium text-green-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
