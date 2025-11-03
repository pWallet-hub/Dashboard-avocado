
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, Plus, Search, Eye, Edit, Trash2, Download, Upload, Phone, Mail, MapPin, 
  Calendar, DollarSign, ShoppingCart, TrendingUp, MessageCircle, CheckCircle, X, 
  Save, FileText, Zap, Heart, Package, Clock 
} from 'lucide-react';
// import './CustomerManagement.css';

const CustomerManagement = () => {
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

  const [customers, setCustomers] = useState([
    {
      id: 'CUST-001',
      firstName: 'Jean-Paul',
      lastName: 'Mugisha',
      email: 'jeanpaul.mugisha@email.com',
      phone: '+250-788-123456',
      type: 'individual',
      status: 'active',
      avatar: '',
      company: '',
      address: {
        street: 'KN 123 St',
        city: 'Kigali',
        state: 'Kigali City',
        zipCode: '',
        country: 'Rwanda'
      },
      preferences: {
        organic: true,
        local: true,
        deliveryMethod: 'delivery',
        communicationMethod: 'email'
      },
      stats: {
        totalOrders: 24,
        totalSpent: 1250750,
        avgOrderValue: 52110,
        lastOrderDate: '2025-08-20',
        memberSince: '2024-03-15',
        loyaltyPoints: 625
      },
      tags: ['premium', 'organic-avocado-lover', 'regular'],
      notes: 'Prefers organic avocados, always orders on Fridays',
      paymentMethods: [
        {
          id: 'pm-001',
          type: 'credit_card',
          last4: '4567',
          brand: 'Visa',
          isDefault: true
        }
      ],
      orders: [
        {
          id: 'ORD-124',
          date: '2025-08-20',
          total: 67500,
          status: 'delivered',
          items: 8
        },
        {
          id: 'ORD-118',
          date: '2025-08-13',
          total: 45250,
          status: 'delivered',
          items: 6
        },
        {
          id: 'ORD-112',
          date: '2025-08-06',
          total: 82000,
          status: 'delivered',
          items: 12
        }
      ],
      communications: [
        {
          id: 'comm-001',
          type: 'email',
          subject: 'Welcome to our organic avocado selection',
          date: '2025-08-15',
          status: 'sent'
        },
        {
          id: 'comm-002',
          type: 'phone',
          subject: 'Avocado order delivery confirmation',
          date: '2025-08-20',
          status: 'completed'
        }
      ]
    },
    {
      id: 'CUST-002',
      firstName: 'Aline',
      lastName: 'Uwera',
      email: 'aline.uwera@email.com',
      phone: '+250-788-234567',
      type: 'individual',
      status: 'active',
      avatar: '',
      company: '',
      address: {
        street: 'KG 456 Ave',
        city: 'Musanze',
        state: 'Northern Province',
        zipCode: '',
        country: 'Rwanda'
      },
      preferences: {
        organic: false,
        local: true,
        deliveryMethod: 'pickup',
        communicationMethod: 'phone'
      },
      stats: {
        totalOrders: 18,
        totalSpent: 892300,
        avgOrderValue: 49570,
        lastOrderDate: '2025-08-22',
        memberSince: '2024-07-20',
        loyaltyPoints: 446
      },
      tags: ['local-avocado-supporter', 'pickup-preferred'],
      notes: 'Prefers local avocados, usually picks up orders',
      paymentMethods: [
        {
          id: 'pm-002',
          type: 'debit_card',
          last4: '8901',
          brand: 'Mastercard',
          isDefault: true
        }
      ],
      orders: [
        {
          id: 'ORD-126',
          date: '2025-08-22',
          total: 38750,
          status: 'ready',
          items: 5
        },
        {
          id: 'ORD-120',
          date: '2025-08-15',
          total: 56500,
          status: 'completed',
          items: 9
        }
      ],
      communications: []
    },
    {
      id: 'CUST-003',
      firstName: 'Eric',
      lastName: 'Niyitegeka',
      email: 'eric.niyitegeka@restaurant.com',
      phone: '+250-788-345678',
      type: 'business',
      status: 'active',
      avatar: '',
      company: 'Avocado Bistro',
      address: {
        street: 'KK 789 Rd',
        city: 'Huye',
        state: 'Southern Province',
        zipCode: '',
        country: 'Rwanda'
      },
      preferences: {
        organic: true,
        local: true,
        deliveryMethod: 'delivery',
        communicationMethod: 'email'
      },
      stats: {
        totalOrders: 45,
        totalSpent: 3250800,
        avgOrderValue: 72240,
        lastOrderDate: '2025-08-21',
        memberSince: '2023-11-10',
        loyaltyPoints: 1625
      },
      tags: ['bulk-avocado-buyer', 'restaurant', 'high-value'],
      notes: 'Restaurant client, orders avocados 2-3 times per week, focuses on fresh avocados',
      paymentMethods: [
        {
          id: 'pm-003',
          type: 'business_account',
          last4: '2345',
          brand: 'American Express',
          isDefault: true
        }
      ],
      orders: [
        {
          id: 'ORD-125',
          date: '2025-08-21',
          total: 125000,
          status: 'delivered',
          items: 15
        },
        {
          id: 'ORD-123',
          date: '2025-08-19',
          total: 98500,
          status: 'delivered',
          items: 12
        }
      ],
      communications: [
        {
          id: 'comm-003',
          type: 'email',
          subject: 'Weekly avocado availability',
          date: '2025-08-19',
          status: 'sent'
        }
      ]
    },
    {
      id: 'CUST-004',
      firstName: 'Marie',
      lastName: 'Kanyange',
      email: 'marie.kanyange@email.com',
      phone: '+250-788-456789',
      type: 'individual',
      status: 'inactive',
      avatar: '',
      company: '',
      address: {
        street: 'KN 321 St',
        city: 'Rwamagana',
        state: 'Eastern Province',
        zipCode: '',
        country: 'Rwanda'
      },
      preferences: {
        organic: true,
        local: false,
        deliveryMethod: 'delivery',
        communicationMethod: 'email'
      },
      stats: {
        totalOrders: 8,
        totalSpent: 320450,
        avgOrderValue: 40060,
        lastOrderDate: '2025-06-15',
        memberSince: '2025-02-28',
        loyaltyPoints: 160
      },
      tags: ['inactive', 'potential-win-back'],
      notes: 'Has not ordered avocados in over 2 months, potential win-back candidate',
      paymentMethods: [
        {
          id: 'pm-004',
          type: 'credit_card',
          last4: '6789',
          brand: 'Visa',
          isDefault: true
        }
      ],
      orders: [
        {
          id: 'ORD-089',
          date: '2025-06-15',
          total: 42300,
          status: 'delivered',
          items: 7
        }
      ],
      communications: [
        {
          id: 'comm-004',
          type: 'email',
          subject: 'We miss you! Special avocado offer inside',
          date: '2025-07-20',
          status: 'sent'
        }
      ]
    },
    {
      id: 'CUST-005',
      firstName: 'Patrick',
      lastName: 'Habimana',
      email: 'patrick.habimana@email.com',
      phone: '+250-788-567890',
      type: 'individual',
      status: 'new',
      avatar: '',
      company: '',
      address: {
        street: 'KG 654 Ave',
        city: 'Rubavu',
        state: 'Western Province',
        zipCode: '',
        country: 'Rwanda'
      },
      preferences: {
        organic: false,
        local: true,
        deliveryMethod: 'pickup',
        communicationMethod: 'phone'
      },
      stats: {
        totalOrders: 2,
        totalSpent: 75500,
        avgOrderValue: 37750,
        lastOrderDate: '2025-08-18',
        memberSince: '2025-08-10',
        loyaltyPoints: 38
      },
      tags: ['new-customer', 'onboarding'],
      notes: 'New customer, second avocado order placed recently',
      paymentMethods: [
        {
          id: 'pm-005',
          type: 'credit_card',
          last4: '1234',
          brand: 'Mastercard',
          isDefault: true
        }
      ],
      orders: [
        {
          id: 'ORD-119',
          date: '2025-08-18',
          total: 43250,
          status: 'delivered',
          items: 6
        },
        {
          id: 'ORD-115',
          date: '2025-08-12',
          total: 32250,
          status: 'delivered',
          items: 4
        }
      ],
      communications: [
        {
          id: 'comm-005',
          type: 'email',
          subject: 'Welcome to our farm fresh avocado community!',
          date: '2025-08-10',
          status: 'sent'
        }
      ]
    }
  ]);

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
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'inactive': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'new': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'blocked': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'sent': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
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
      case 'delivered': return 'text-emerald-600';
      case 'ready': return 'text-indigo-600';
      case 'completed': return 'text-emerald-600';
      case 'pending': return 'text-amber-600';
      case 'cancelled': return 'text-rose-600';
      default: return 'text-gray-600';
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    if (modalType === 'add') {
      const newCustomer = {
        ...formData,
        id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
        stats: {
          totalOrders: 0,
          totalSpent: 0,
          avgOrderValue: 0,
          lastOrderDate: null,
          memberSince: new Date().toISOString().split('T')[0],
          loyaltyPoints: 0
        },
        orders: [],
        communications: [],
        paymentMethods: []
      };
      setCustomers([...customers, newCustomer]);
    } else if (modalType === 'edit') {
      setCustomers(customers.map(c => 
        c.id === selectedCustomer.id ? formData : c
      ));
      setSelectedCustomer(formData);
    }
    setIsLoading(false);
    setShowModal(false);
  };

  const handleDelete = (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      setCustomers(customers.filter(c => c.id !== customerId));
      if (selectedCustomer && selectedCustomer.id === customerId) {
        setActiveView('list');
        setSelectedCustomer(null);
      }
    }
  };

  const CustomerModal = useMemo(() => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-4xl sm:h-[90vh] overflow-y-auto shadow-2xl transform transition-all animate-slideUp">
        <div className="p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-lime-50">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-emerald-800 font-poppins">
              {modalType === 'add' ? 'Add New Avocado Customer' : 'Edit Avocado Customer'}
            </h3>
            <button 
              onClick={() => setShowModal(false)}
              className="text-emerald-500 hover:text-emerald-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-emerald-800 font-poppins">Personal Information</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
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
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
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
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  aria-required="true"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">Customer Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
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
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
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
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-emerald-800 font-poppins">Address</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">Street Address</label>
                <input
                  type="text"
                  value={formData.address?.street || ''}
                  onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">City</label>
                  <input
                    type="text"
                    value={formData.address?.city || ''}
                    onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">Province</label>
                  <input
                    type="text"
                    value={formData.address?.state || ''}
                    onChange={(e) => handleNestedInputChange('address', 'state', e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
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
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-poppins">Country</label>
                  <select
                    value={formData.address?.country || 'Rwanda'}
                    onChange={(e) => handleNestedInputChange('address', 'country', e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  >
                    <option value="Rwanda">Rwanda</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Kenya">Kenya</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-semibold text-emerald-800 mb-4 font-poppins">Avocado Preferences</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences?.organic || false}
                        onChange={(e) => handleNestedInputChange('preferences', 'organic', e.target.checked)}
                        className="mr-2 accent-emerald-500 h-5 w-5"
                      />
                      <span className="text-sm font-poppins">Prefers Organic Avocados</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences?.local || false}
                        onChange={(e) => handleNestedInputChange('preferences', 'local', e.target.checked)}
                        className="mr-2 accent-emerald-500 h-5 w-5"
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
                        className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
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
                        className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
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
                className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                placeholder="Any additional notes about this avocado customer..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-emerald-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2 border border-emerald-300 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-all duration-300 font-poppins"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center transition-all duration-300 shadow-md hover:shadow-lg font-poppins"
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
        <div className="p-6 bg-gradient-to-r from-emerald-50 to-lime-50">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveView('list')}
                className="text-emerald-600 hover:text-emerald-800 transition-colors font-medium font-poppins"
                aria-label="Back to customer list"
              >
                ← Back to List
              </button>
              <h2 className="text-2xl font-bold text-emerald-800 font-poppins">
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </h2>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEditClick(selectedCustomer)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg font-poppins relative group"
                aria-label="Edit customer"
              >
                <Edit className="h-4 w-4 inline mr-2" />
                Edit
                <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-emerald-800 text-white text-xs rounded py-1 px-2">
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
            <div className="border border-emerald-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-emerald-800 mb-4 font-poppins">Customer Information</h3>
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

            <div className="border border-emerald-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-emerald-800 mb-4 font-poppins">Customer Stats</h3>
              <div className="space-y-3 text-gray-700">
                <p><DollarSign className="inline h-4 w-4 mr-1 text-emerald-600" /> Total Spent: {selectedCustomer.stats.totalSpent.toLocaleString()} RWF</p>
                <p><ShoppingCart className="inline h-4 w-4 mr-1 text-emerald-600" /> Total Orders: {selectedCustomer.stats.totalOrders}</p>
                <p><TrendingUp className="inline h-4 w-4 mr-1 text-emerald-600" /> Avg Order: {selectedCustomer.stats.avgOrderValue.toLocaleString()} RWF</p>
                <p><Calendar className="inline h-4 w-4 mr-1 text-emerald-600" /> Last Order: {selectedCustomer.stats.lastOrderDate}</p>
                <p><Zap className="inline h-4 w-4 mr-1 text-emerald-600" /> Loyalty Points: {selectedCustomer.stats.loyaltyPoints}</p>
                <p><Clock className="inline h-4 w-4 mr-1 text-emerald-600" /> Member Since: {selectedCustomer.stats.memberSince}</p>
              </div>
            </div>

            <div className="border border-emerald-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-emerald-800 mb-4 font-poppins">Avocado Preferences</h3>
              <div className="space-y-3 text-gray-700">
                <p><Heart className="inline h-4 w-4 mr-1 text-emerald-600" /> Organic: {selectedCustomer.preferences.organic ? 'Yes' : 'No'}</p>
                <p><MapPin className="inline h-4 w-4 mr-1 text-emerald-600" /> Local: {selectedCustomer.preferences.local ? 'Yes' : 'No'}</p>
                <p><Package className="inline h-4 w-4 mr-1 text-emerald-600" /> Delivery: {selectedCustomer.preferences.deliveryMethod}</p>
                <p><MessageCircle className="inline h-4 w-4 mr-1 text-emerald-600" /> Communication: {selectedCustomer.preferences.communicationMethod}</p>
                <p><FileText className="inline h-4 w-4 mr-1 text-emerald-600" /> Notes: {selectedCustomer.notes || 'None'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-emerald-800 mb-4 font-poppins">Recent Avocado Orders</h3>
            <div className="overflow-x-auto border border-emerald-200 rounded-lg">
              <table className="min-w-full divide-y divide-emerald-100">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase font-poppins">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase font-poppins">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase font-poppins">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase font-poppins">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase font-poppins">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-emerald-100">
                  {selectedCustomer.orders.map((order, index) => (
                    <tr key={order.id} className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-emerald-25'}`}>
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
            <h3 className="text-lg font-semibold text-emerald-800 mb-4 font-poppins">Communication History</h3>
            <div className="overflow-x-auto border border-emerald-200 rounded-lg">
              <table className="min-w-full divide-y divide-emerald-100">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase font-poppins">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase font-poppins">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase font-poppins">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase font-poppins">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase font-poppins">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-emerald-100">
                  {selectedCustomer.communications.map((comm, index) => (
                    <tr key={comm.id} className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-emerald-25'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">{comm.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center">
                          {comm.type === 'email' ? <Mail className="h-4 w-4 mr-2 text-emerald-600" /> : 
                           comm.type === 'phone' ? <Phone className="h-4 w-4 mr-2 text-emerald-600" /> : 
                           <MessageCircle className="h-4 w-4 mr-2 text-emerald-600" />}
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <h2 className="text-2xl font-bold text-emerald-800 flex items-center mb-4 lg:mb-0 font-poppins">
            <Users className="h-7 w-7 mr-3 text-emerald-600" />
            Avocado Customer Management
          </h2>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleAddClick}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 shadow-md hover:shadow-lg font-poppins relative group"
              aria-label="Add new customer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
              <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-emerald-800 text-white text-xs rounded py-1 px-2">
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 shadow-md hover:shadow-lg font-poppins relative group"
              aria-label="Export CSV"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
              <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-emerald-800 text-white text-xs rounded py-1 px-2">
                Export Customer Data
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              placeholder="Search avocado customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 font-poppins"
              aria-label="Search customers"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 font-poppins"
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
              className="px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 font-poppins"
              aria-label="Filter by type"
            >
              <option value="all">All Types</option>
              <option value="individual">Individual</option>
              <option value="business">Business</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 font-poppins"
              aria-label="Sort customers"
            >
              <option value="name">Sort by Name</option>
              <option value="spent">Sort by Total Spent</option>
              <option value="orders">Sort by Orders</option>
              <option value="recent">Sort by Recent Order</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-emerald-200 rounded-lg">
          <table className="min-w-full divide-y divide-emerald-100">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase font-poppins">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase font-poppins">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase font-poppins">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase font-poppins">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase font-poppins">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase font-poppins">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-emerald-100">
              {filteredCustomers.map((customer, index) => (
                <tr key={customer.id} className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-emerald-25'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-emerald-200 flex items-center justify-center">
                        {customer.avatar ? (
                          <img src={customer.avatar} alt={`${customer.firstName} ${customer.lastName}`} className="h-10 w-10 rounded-full" />
                        ) : (
                          <span className="text-emerald-600 font-medium">
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
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setActiveView('detail');
                      }}
                      className="text-emerald-600 hover:text-emerald-800 mr-4 transition-colors relative group"
                      aria-label="View customer details"
                    >
                      <Eye className="h-5 w-5" />
                      <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-emerald-800 text-white text-xs rounded py-1 px-2">
                        View Details
                      </span>
                    </button>
                    <button
                      onClick={() => handleEditClick(customer)}
                      className="text-emerald-600 hover:text-emerald-800 mr-4 transition-colors relative group"
                      aria-label="Edit customer"
                    >
                      <Edit className="h-5 w-5" />
                      <span className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-emerald-800 text-white text-xs rounded py-1 px-2">
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
    <div className="w-full h-screen overflow-hidden bg-gradient-to-b from-lime-50 to-emerald-50">
      {showModal && CustomerModal}
      {activeView === 'list' ? <CustomerListView /> : <CustomerDetailView />}
    </div>
  );
};

export default CustomerManagement;
