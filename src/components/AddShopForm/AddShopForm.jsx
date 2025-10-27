import { useState } from 'react';
import { Store, MapPin, User, Phone, Mail } from 'lucide-react';
import { createShop } from '../../services/shopService';

export default function AddShopForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    province: '',
    district: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const provinces = [
    'Kigali',
    'Eastern Province',
    'Northern Province',
    'Southern Province',
    'Western Province'
  ];

  const districts = {
    'Kigali': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
    'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
    'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
    'Southern Province': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
    'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro']
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'province' && { district: '' })
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.shopName || !formData.description || !formData.province || !formData.district || !formData.ownerName || !formData.ownerEmail || !formData.ownerPhone) {
      setError('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.ownerEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    // Phone validation (10-15 digits)
    const phoneRegex = /^[\d+\s()-]{10,15}$/;
    if (!phoneRegex.test(formData.ownerPhone.replace(/\s/g, ''))) {
      setError('Please enter a valid phone number (10-15 digits)');
      return;
    }

    setLoading(true);
    setError(null);

    console.log('Submitting shop data:', formData);

    try {
      const response = await createShop(formData);
      console.log('Create shop response:', response);
      
      if (response.success) {
        alert(`Shop "${formData.shopName}" created successfully!`);
        
        // Reset form
        setFormData({
          shopName: '',
          description: '',
          province: '',
          district: '',
          ownerName: '',
          ownerEmail: '',
          ownerPhone: ''
        });

        // Call success callback to refresh shop list
        if (onSuccess) {
          onSuccess(response.data);
        }

        // Close modal
        if (onClose) {
          onClose();
        }
      } else {
        const errorMsg = response.message || 'Failed to create shop';
        setError(errorMsg);
        alert(`Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error creating shop:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to create shop. Please try again.';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="shopName" className="block text-sm font-semibold text-gray-700 mb-2">
          Shop Name
        </label>
        <input
          type="text"
          id="shopName"
          value={formData.shopName}
          onChange={(e) => handleChange('shopName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder="Enter shop name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Short Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
              placeholder="Brief description of your shop"
            />
          </div>

          <div className="bg-indigo-50 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-800">Location Information</h2>
            </div>

            <div>
              <label htmlFor="province" className="block text-sm font-semibold text-gray-700 mb-2">
                Province
              </label>
              <select
                id="province"
                value={formData.province}
                onChange={(e) => handleChange('province', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="">Select a province</option>
                {provinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="district" className="block text-sm font-semibold text-gray-700 mb-2">
                District
              </label>
              <select
                id="district"
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                disabled={!formData.province}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select a district</option>
                {formData.province && districts[formData.province]?.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">Owner Information</h2>
            </div>

            <div>
              <label htmlFor="ownerName" className="block text-sm font-semibold text-gray-700 mb-2">
                Owner Name
              </label>
              <input
                type="text"
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => handleChange('ownerName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="Full name of shop owner"
              />
            </div>

            <div>
              <label htmlFor="ownerEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                id="ownerEmail"
                value={formData.ownerEmail}
                onChange={(e) => handleChange('ownerEmail', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="owner@example.com"
              />
            </div>

            <div>
              <label htmlFor="ownerPhone" className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <input
          type="tel"
          id="ownerPhone"
          value={formData.ownerPhone}
          onChange={(e) => handleChange('ownerPhone', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
          placeholder="+250 XXX XXX XXX"
        />
      </div>
    </div>

    <button
      onClick={handleSubmit}
      disabled={loading}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      {loading ? 'Creating Shop...' : 'Add Shop'}
    </button>
  </div>
  );
}