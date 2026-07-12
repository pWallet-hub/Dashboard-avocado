
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users, Plus, Search, Eye, Edit, Trash2, Download, Upload, Phone, Mail, MapPin,
  Calendar, DollarSign, ShoppingCart, TrendingUp, MessageCircle, CheckCircle, X,
  Save, FileText, Zap, Heart, Package, Clock
} from 'lucide-react';
import { getShopCustomers, createCustomer, updateCustomer as updateCustomerApi, deleteCustomer as deleteCustomerApi, getCustomerOrders, getCustomerStatistics } from '../../services/marketStorageService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
// import './CustomerManagement.css';

function mapCustomerFromApi(customer) {
  const [firstName = '', ...lastParts] = (customer.name || '').split(' ');
  return {
    id: customer.id,
    firstName: customer.first_name || firstName,
    lastName: customer.last_name || lastParts.join(' '),
    email: customer.email,
    phone: customer.phone,
    type: customer.type || 'individual',
    status: customer.status || 'active',
    avatar: '',
    company: customer.company || '',
    address: customer.address_details || { street: customer.address || '', city: '', state: '', zipCode: '', country: 'Rwanda' },
    preferences: customer.preferences || { organic: false, local: false, deliveryMethod: 'delivery', communicationMethod: 'email' },
    stats: {
      totalOrders: customer.total_orders || 0,
      totalSpent: customer.total_spent || 0,
      avgOrderValue: customer.total_orders ? customer.total_spent / customer.total_orders : 0,
      lastOrderDate: customer.last_order_date,
      memberSince: customer.created_at,
      loyaltyPoints: 0,
    },
    tags: customer.tags || [],
    notes: customer.notes || '',
    paymentMethods: [],
    orders: [],
    communications: [],
  };
}

const CustomerManagement = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const [activeView, setActiveView] = useState('list');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    type: 'individual',
    status: 'new',
    company: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Rwanda'
    },
    preferences: {
      organic: false,
      local: false,
      deliveryMethod: 'delivery',
      communicationMethod: 'email'
    },
    tags: [],
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [customers, setCustomers] = useState([]);

  const loadCustomers = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await getShopCustomers();
      const list = Array.isArray(data) ? data : [];
      setCustomers(list.map(mapCustomerFromApi));
    } catch (error) {
      console.error('Error loading customers:', error);
      setLoadError(error.message || 'Failed to load customers');
      setCustomers([]);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Initialize formData when adding a new customer
  const handleAddClick = useCallback(() => {
    console.log('🟢 handleAddClick called');
    const initialData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      type: 'individual',
      status: 'new',
      company: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Rwanda'
      },
      preferences: {
        organic: false,
        local: false,
        deliveryMethod: 'delivery',
        communicationMethod: 'email'
      },
      tags: [],
      notes: ''
    };
    console.log('🟢 Setting formData:', initialData);
    setFormData(initialData);
    setModalType('add');
    setShowModal(true);
  }, []);

  // Initialize formData when editing a customer
  const handleEditClick = useCallback((customer) => {
    console.log('🟡 handleEditClick called with customer:', customer);
    setFormData({...customer});
    setSelectedCustomer(customer);
    setModalType('edit');
    setShowModal(true);
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    console.log(`📝 Input change: ${field} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle nested input changes (for address and preferences)
  const handleNestedInputChange = useCallback((parent, field, value) => {
    console.log(`📝 Nested input change: ${parent}.${field} = ${value}`);
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers
      .filter(customer => {
        const matchesSearch =
          customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.company.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
        const matchesType = typeFilter === 'all' || customer.type === typeFilter;
        
        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          case 'spent':
            return b.stats.totalSpent - a.stats.totalSpent;
          case 'orders':
            return b.stats.totalOrders - a.stats.totalOrders;
          case 'recent':
            return new Date(b.stats.lastOrderDate) - new Date(a.stats.lastOrderDate);
          default:
            return 0;
        }
      });
  }, [customers, searchTerm, statusFilter, typeFilter, sortBy]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'new': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'blocked': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'sent': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <Clock className="h-4 w-4" />;
      case 'new': return <Zap className="h-4 w-4" />;
      case 'blocked': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'ready': return 'text-indigo-600';
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-amber-600';
      case 'cancelled': return 'text-rose-600';
      default: return 'text-gray-600';
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Backend CustomerStatus only supports active/inactive
    const statusMap = { new: 'active', blocked: 'inactive', active: 'active', inactive: 'inactive' };

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone,
      type: formData.type,
      status: statusMap[formData.status] || 'active',
      company: formData.company,
      address_details: formData.address,
      preferences: formData.preferences,
      tags: formData.tags,
      notes: formData.notes,
    };

    try {
      if (modalType === 'add') {
        await createCustomer(payload);
      } else if (modalType === 'edit') {
        await updateCustomerApi(selectedCustomer.id, payload);
      }
      await loadCustomers();
      setShowModal(false);
      toast.success(`Customer ${modalType === 'add' ? 'added' : 'updated'} successfully!`);
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Error saving customer: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (customerId) => {
    if (!(await confirm('Are you sure you want to delete this customer? This action cannot be undone.'))) return;

    try {
      await deleteCustomerApi(customerId);
      await loadCustomers();
      if (selectedCustomer && selectedCustomer.id === customerId) {
        setActiveView('list');
        setSelectedCustomer(null);
      }
      toast.success('Customer deleted successfully!');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Error deleting customer: ' + error.message);
    }
  };

  const CustomerModal = useMemo(() => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-4xl sm:h-[90vh] overflow-y-auto shadow-2xl transform transition-all animate-slideUp">
        <div className="p-6 border-b border-green-100 bg-gradient-to-r from-green-50 to-lime-50">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-green-800 font-poppins">
              {modalType === 'add' ? 'Add New Avocado Customer' : 'Edit Avocado Customer'}
            </h3>
            <button 
              onClick={() => setShowModal(false)}
              className="text-green-500 hover:text-green-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-green-800 font-poppins">Personal Information</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                    aria-required="true"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                    aria-required="true"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  aria-required="true"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">Customer Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  >
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  >
                    <option value="new">New</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              {formData.type === 'business' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">Company Name</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-green-800 font-poppins">Address</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">Street Address</label>
                <input
                  type="text"
                  value={formData.address?.street || ''}
                  onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">City</label>
                  <input
                    type="text"
                    value={formData.address?.city || ''}
                    onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">Province</label>
                  <input
                    type="text"
                    value={formData.address?.state || ''}
                    onChange={(e) => handleNestedInputChange('address', 'state', e.target.value)}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">ZIP Code</label>
                  <input
                    type="text"
                    value={formData.address?.zipCode || ''}
                    onChange={(e) => handleNestedInputChange('address', 'zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">Country</label>
                  <select
                    value={formData.address?.country || 'Rwanda'}
                    onChange={(e) => handleNestedInputChange('address', 'country', e.target.value)}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  >
                    <option value="Rwanda">Rwanda</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Kenya">Kenya</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-semibold text-green-800 mb-4 font-poppins">Avocado Preferences</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences?.organic || false}
                        onChange={(e) => handleNestedInputChange('preferences', 'organic', e.target.checked)}
                        className="mr-2 accent-green-500 h-5 w-5"
                      />
                      <span className="text-sm font-poppins">Prefers Organic Avocados</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences?.local || false}
                        onChange={(e) => handleNestedInputChange('preferences', 'local', e.target.checked)}
                        className="mr-2 accent-green-500 h-5 w-5"
                      />
                      <span className="text-sm font-poppins">Prefers Local Avocados</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">Delivery Method</label>
                      <select
                        value={formData.preferences?.deliveryMethod || 'delivery'}
                        onChange={(e) => handleNestedInputChange('preferences', 'deliveryMethod', e.target.value)}
                        className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                      >
                        <option value="delivery">Delivery</option>
                        <option value="pickup">Pickup</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">Communication</label>
                      <select
                        value={formData.preferences?.communicationMethod || 'email'}
                        onChange={(e) => handleNestedInputChange('preferences', 'communicationMethod', e.target.value)}
                        className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="sms">SMS</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">Notes</label>
              <textarea
                rows={4}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                placeholder="Any additional notes about this avocado customer..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-green-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-all duration-300 font-poppins"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center transition-all duration-300 shadow-md hover:shadow-lg font-poppins"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {modalType === 'add' ? 'Add Customer' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  ), [modalType, formData, isLoading, handleInputChange, handleNestedInputChange]);

  const CustomerDetailView = () => {
    if (!selectedCustomer) {
      return <p className="p-6 text-red-600 font-poppins">No customer selected. Please go back to the list.</p>;
    }
    return (
      <div className="bg-white rounded-2xl shadow-lg h-full overflow-y-auto transition-all duration-300 hover:shadow-xl animate-fadeIn">
        <div className="p-6 bg-gradient-to-r from-green-50 to-lime-50">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveView('list')}
                className="text-green-600 hover:text-green-800 transition-colors font-medium font-poppins"
                aria-label="Back to customer list"
              >
                ← Back to List
              </button>
              <h2 className="text-2xl font-bold text-green-800 font-poppins">
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </h2>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEditClick(selectedCustomer)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg font-poppins relative group"
                aria-label="Edit customer"
              >
                <Edit className="h-4 w-4 inline mr-2" />
                Edit
                <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-green-800 text-white text-xs rounded py-1 px-2">
                  Edit Customer
                </span>
              </button>
              <button
                onClick={() => handleDelete(selectedCustomer.id)}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all duration-300 shadow-md hover:shadow-lg font-poppins relative group"
                aria-label="Delete customer"
              >
                <Trash2 className="h-4 w-4 inline mr-2" />
                Delete
                <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-rose-800 text-white text-xs rounded py-1 px-2">
                  Delete Customer
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-green-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-green-800 mb-4 font-poppins">Customer Information</h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>Email:</strong> {selectedCustomer.email}</p>
                <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                <p><strong>Type:</strong> {selectedCustomer.type}</p>
                <p><strong>Status:</strong> 
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCustomer.status)}`}>
                    {getStatusIcon(selectedCustomer.status)}
                    <span className="ml-1">{selectedCustomer.status}</span>
                  </span>
                </p>
                {selectedCustomer.company && <p><strong>Company:</strong> {selectedCustomer.company}</p>}
                <p><strong>Address:</strong> {`${selectedCustomer.address.street}, ${selectedCustomer.address.city}, ${selectedCustomer.address.state} ${selectedCustomer.address.zipCode}, ${selectedCustomer.address.country}`}</p>
              </div>
            </div>

            <div className="border border-green-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-green-800 mb-4 font-poppins">Customer Stats</h3>
              <div className="space-y-3 text-gray-700">
                <p><DollarSign className="inline h-4 w-4 mr-1 text-green-600" /> Total Spent: {selectedCustomer.stats.totalSpent.toLocaleString()} RWF</p>
                <p><ShoppingCart className="inline h-4 w-4 mr-1 text-green-600" /> Total Orders: {selectedCustomer.stats.totalOrders}</p>
                <p><TrendingUp className="inline h-4 w-4 mr-1 text-green-600" /> Avg Order: {selectedCustomer.stats.avgOrderValue.toLocaleString()} RWF</p>
                <p><Calendar className="inline h-4 w-4 mr-1 text-green-600" /> Last Order: {selectedCustomer.stats.lastOrderDate}</p>
                <p><Zap className="inline h-4 w-4 mr-1 text-green-600" /> Loyalty Points: {selectedCustomer.stats.loyaltyPoints}</p>
                <p><Clock className="inline h-4 w-4 mr-1 text-green-600" /> Member Since: {selectedCustomer.stats.memberSince}</p>
              </div>
            </div>

            <div className="border border-green-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-green-800 mb-4 font-poppins">Avocado Preferences</h3>
              <div className="space-y-3 text-gray-700">
                <p><Heart className="inline h-4 w-4 mr-1 text-green-600" /> Organic: {selectedCustomer.preferences.organic ? 'Yes' : 'No'}</p>
                <p><MapPin className="inline h-4 w-4 mr-1 text-green-600" /> Local: {selectedCustomer.preferences.local ? 'Yes' : 'No'}</p>
                <p><Package className="inline h-4 w-4 mr-1 text-green-600" /> Delivery: {selectedCustomer.preferences.deliveryMethod}</p>
                <p><MessageCircle className="inline h-4 w-4 mr-1 text-green-600" /> Communication: {selectedCustomer.preferences.communicationMethod}</p>
                <p><FileText className="inline h-4 w-4 mr-1 text-green-600" /> Notes: {selectedCustomer.notes || 'None'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4 font-poppins">Recent Avocado Orders</h3>
            <div className="overflow-x-auto border border-green-200 rounded-lg">
              <table className="min-w-full divide-y divide-green-100">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase font-poppins">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase font-poppins">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase font-poppins">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase font-poppins">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase font-poppins">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-green-100">
                  {selectedCustomer.orders.map((order, index) => (
                    <tr key={order.id} className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-green-25'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{order.total.toLocaleString()} RWF</td>
                      <td className="px-6 py-4 whitespace-nowrap">{order.items}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4 font-poppins">Communication History</h3>
            <div className="overflow-x-auto border border-green-200 rounded-lg">
              <table className="min-w-full divide-y divide-green-100">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase font-poppins">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase font-poppins">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase font-poppins">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase font-poppins">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase font-poppins">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-green-100">
                  {selectedCustomer.communications.map((comm, index) => (
                    <tr key={comm.id} className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-green-25'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">{comm.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center">
                          {comm.type === 'email' ? <Mail className="h-4 w-4 mr-2 text-green-600" /> : 
                           comm.type === 'phone' ? <Phone className="h-4 w-4 mr-2 text-green-600" /> : 
                           <MessageCircle className="h-4 w-4 mr-2 text-green-600" />}
                          {comm.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{comm.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{comm.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(comm.status)}`}>
                          {comm.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CustomerListView = () => (
    <div className="h-full overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        {loadError && (
          <div className="mb-4 p-3 bg-rose-100 border border-rose-300 rounded-lg text-sm text-rose-700 flex justify-between items-center">
            <span>⚠️ {loadError}</span>
            <button onClick={loadCustomers} className="underline font-medium">Retry</button>
          </div>
        )}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <h2 className="text-2xl font-bold text-green-800 flex items-center mb-4 lg:mb-0 font-poppins">
            <Users className="h-7 w-7 mr-3 text-green-600" />
            Avocado Customer Management
          </h2>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleAddClick}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 shadow-md hover:shadow-lg font-poppins relative group"
              aria-label="Add new customer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
              <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-green-800 text-white text-xs rounded py-1 px-2">
                Add New Customer
              </span>
            </button>
            <button 
              className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 shadow-md hover:shadow-lg font-poppins relative group"
              aria-label="Import CSV"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
              <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-lime-800 text-white text-xs rounded py-1 px-2">
                Import Customer Data
              </span>
            </button>
            <button 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 shadow-md hover:shadow-lg font-poppins relative group"
              aria-label="Export CSV"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
              <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-green-800 text-white text-xs rounded py-1 px-2">
                Export Customer Data
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400" />
            <input
              type="text"
              placeholder="Search avocado customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 font-poppins"
              aria-label="Search customers"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 font-poppins"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="new">New</option>
              <option value="blocked">Blocked</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 font-poppins"
              aria-label="Filter by type"
            >
              <option value="all">All Types</option>
              <option value="individual">Individual</option>
              <option value="business">Business</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 font-poppins"
              aria-label="Sort customers"
            >
              <option value="name">Sort by Name</option>
              <option value="spent">Sort by Total Spent</option>
              <option value="orders">Sort by Orders</option>
              <option value="recent">Sort by Recent Order</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-green-200 rounded-lg">
          <table className="min-w-full divide-y divide-green-100">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase font-poppins">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase font-poppins">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase font-poppins">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase font-poppins">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase font-poppins">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase font-poppins">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-green-100">
              {filteredCustomers.map((customer, index) => (
                <tr key={customer.id} className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-green-25'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                        {customer.avatar ? (
                          <img src={customer.avatar} alt={`${customer.firstName} ${customer.lastName}`} className="h-10 w-10 rounded-full" />
                        ) : (
                          <span className="text-green-600 font-medium">
                            {customer.firstName[0]}{customer.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 font-poppins">
                          {customer.firstName} {customer.lastName}
                        </p>
                        {customer.company && (
                          <p className="text-sm text-gray-500 font-poppins">{customer.company}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-poppins">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-poppins">
                    {customer.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(customer.status)}`}>
                      {getStatusIcon(customer.status)}
                      <span className="ml-1">{customer.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-poppins">
                    {customer.stats.totalSpent.toLocaleString()} RWF
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={async () => {
                        setSelectedCustomer(customer);
                        setActiveView('detail');
                        try {
                          const [orders, statistics] = await Promise.all([
                            getCustomerOrders(customer.id),
                            getCustomerStatistics(customer.id),
                          ]);
                          setSelectedCustomer(prev => (prev && prev.id === customer.id) ? {
                            ...prev,
                            orders: (Array.isArray(orders) ? orders : []).map(o => ({
                              id: o.order_number || o.id,
                              date: o.order_date || o.created_at,
                              total: o.total_amount,
                              status: o.status,
                              items: Array.isArray(o.items) ? o.items.length : 0,
                            })),
                            stats: {
                              ...prev.stats,
                              totalOrders: statistics?.total_orders ?? prev.stats.totalOrders,
                              totalSpent: statistics?.total_spent ?? prev.stats.totalSpent,
                              avgOrderValue: statistics?.average_order_value ?? prev.stats.avgOrderValue,
                              lastOrderDate: statistics?.last_order_date ?? prev.stats.lastOrderDate,
                            },
                          } : prev);
                        } catch (error) {
                          console.error('Error loading customer order history:', error);
                        }
                      }}
                      className="text-green-600 hover:text-green-800 mr-4 transition-colors relative group"
                      aria-label="View customer details"
                    >
                      <Eye className="h-5 w-5" />
                      <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-green-800 text-white text-xs rounded py-1 px-2">
                        View Details
                      </span>
                    </button>
                    <button
                      onClick={() => handleEditClick(customer)}
                      className="text-green-600 hover:text-green-800 mr-4 transition-colors relative group"
                      aria-label="Edit customer"
                    >
                      <Edit className="h-5 w-5" />
                      <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-green-800 text-white text-xs rounded py-1 px-2">
                        Edit Customer
                      </span>
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="text-rose-600 hover:text-rose-800 transition-colors relative group"
                      aria-label="Delete customer"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-rose-800 text-white text-xs rounded py-1 px-2">
                        Delete Customer
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-b from-lime-50 to-green-50">
      {showModal && CustomerModal}
      {activeView === 'list' ? <CustomerListView /> : <CustomerDetailView />}
    </div>
  );
};

export default CustomerManagement;
