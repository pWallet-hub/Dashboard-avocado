import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  MessageCircle,
  UserCheck,
  UserX,
  Clock,
  Award,
  Building,
  CreditCard,
  Package,
  Heart,
  AlertTriangle,
  CheckCircle,
  X,
  Save,
  Send,
  FileText,
  BarChart3,
  Activity,
  Target,
  Zap
} from 'lucide-react';

const CustomerManagement = () => {
  const [activeView, setActiveView] = useState('list');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [formData, setFormData] = useState({});

  const [customers, setCustomers] = useState([
    {
      id: 'CUST-001',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0101',
      type: 'individual',
      status: 'active',
      avatar: '',
      company: '',
      address: {
        street: '123 Main Street',
        city: 'Portland',
        state: 'Oregon',
        zipCode: '97201',
        country: 'USA'
      },
      preferences: {
        organic: true,
        local: true,
        deliveryMethod: 'delivery',
        communicationMethod: 'email'
      },
      stats: {
        totalOrders: 24,
        totalSpent: 1250.75,
        avgOrderValue: 52.11,
        lastOrderDate: '2024-08-20',
        memberSince: '2023-03-15',
        loyaltyPoints: 625
      },
      tags: ['premium', 'organic-lover', 'regular'],
      notes: 'Prefers organic vegetables, always orders on Fridays',
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
          date: '2024-08-20',
          total: 67.50,
          status: 'delivered',
          items: 8
        },
        {
          id: 'ORD-118',
          date: '2024-08-13',
          total: 45.25,
          status: 'delivered',
          items: 6
        },
        {
          id: 'ORD-112',
          date: '2024-08-06',
          total: 82.00,
          status: 'delivered',
          items: 12
        }
      ],
      communications: [
        {
          id: 'comm-001',
          type: 'email',
          subject: 'Welcome to our organic selection',
          date: '2024-08-15',
          status: 'sent'
        },
        {
          id: 'comm-002',
          type: 'phone',
          subject: 'Order delivery confirmation',
          date: '2024-08-20',
          status: 'completed'
        }
      ]
    },
    {
      id: 'CUST-002',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0202',
      type: 'individual',
      status: 'active',
      avatar: '',
      company: '',
      address: {
        street: '456 Oak Avenue',
        city: 'Seattle',
        state: 'Washington',
        zipCode: '98101',
        country: 'USA'
      },
      preferences: {
        organic: false,
        local: true,
        deliveryMethod: 'pickup',
        communicationMethod: 'phone'
      },
      stats: {
        totalOrders: 18,
        totalSpent: 892.30,
        avgOrderValue: 49.57,
        lastOrderDate: '2024-08-22',
        memberSince: '2023-07-20',
        loyaltyPoints: 446
      },
      tags: ['local-supporter', 'pickup-preferred'],
      notes: 'Prefers local produce, usually picks up orders',
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
          date: '2024-08-22',
          total: 38.75,
          status: 'ready',
          items: 5
        },
        {
          id: 'ORD-120',
          date: '2024-08-15',
          total: 56.50,
          status: 'completed',
          items: 9
        }
      ],
      communications: []
    },
    {
      id: 'CUST-003',
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike.chen@restaurant.com',
      phone: '+1-555-0303',
      type: 'business',
      status: 'active',
      avatar: '',
      company: 'Garden Bistro',
      address: {
        street: '789 Business District',
        city: 'San Francisco',
        state: 'California',
        zipCode: '94102',
        country: 'USA'
      },
      preferences: {
        organic: true,
        local: true,
        deliveryMethod: 'delivery',
        communicationMethod: 'email'
      },
      stats: {
        totalOrders: 45,
        totalSpent: 3250.80,
        avgOrderValue: 72.24,
        lastOrderDate: '2024-08-21',
        memberSince: '2022-11-10',
        loyaltyPoints: 1625
      },
      tags: ['bulk-buyer', 'restaurant', 'high-value'],
      notes: 'Restaurant client, orders 2-3 times per week, focuses on fresh ingredients',
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
          date: '2024-08-21',
          total: 125.00,
          status: 'delivered',
          items: 15
        },
        {
          id: 'ORD-123',
          date: '2024-08-19',
          total: 98.50,
          status: 'delivered',
          items: 12
        }
      ],
      communications: [
        {
          id: 'comm-003',
          type: 'email',
          subject: 'Weekly produce availability',
          date: '2024-08-19',
          status: 'sent'
        }
      ]
    },
    {
      id: 'CUST-004',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@email.com',
      phone: '+1-555-0404',
      type: 'individual',
      status: 'inactive',
      avatar: '',
      company: '',
      address: {
        street: '321 Pine Street',
        city: 'Denver',
        state: 'Colorado',
        zipCode: '80201',
        country: 'USA'
      },
      preferences: {
        organic: true,
        local: false,
        deliveryMethod: 'delivery',
        communicationMethod: 'email'
      },
      stats: {
        totalOrders: 8,
        totalSpent: 320.45,
        avgOrderValue: 40.06,
        lastOrderDate: '2024-06-15',
        memberSince: '2024-02-28',
        loyaltyPoints: 160
      },
      tags: ['inactive', 'potential-win-back'],
      notes: 'Has not ordered in over 2 months, potential win-back candidate',
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
          date: '2024-06-15',
          total: 42.30,
          status: 'delivered',
          items: 7
        }
      ],
      communications: [
        {
          id: 'comm-004',
          type: 'email',
          subject: 'We miss you! Special offer inside',
          date: '2024-07-20',
          status: 'sent'
        }
      ]
    },
    {
      id: 'CUST-005',
      firstName: 'Robert',
      lastName: 'Wilson',
      email: 'robert.wilson@email.com',
      phone: '+1-555-0505',
      type: 'individual',
      status: 'new',
      avatar: '',
      company: '',
      address: {
        street: '654 Elm Street',
        city: 'Austin',
        state: 'Texas',
        zipCode: '73301',
        country: 'USA'
      },
      preferences: {
        organic: false,
        local: true,
        deliveryMethod: 'pickup',
        communicationMethod: 'phone'
      },
      stats: {
        totalOrders: 2,
        totalSpent: 75.50,
        avgOrderValue: 37.75,
        lastOrderDate: '2024-08-18',
        memberSince: '2024-08-10',
        loyaltyPoints: 38
      },
      tags: ['new-customer', 'onboarding'],
      notes: 'New customer, second order placed recently',
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
          date: '2024-08-18',
          total: 43.25,
          status: 'delivered',
          items: 6
        },
        {
          id: 'ORD-115',
          date: '2024-08-12',
          total: 32.25,
          status: 'delivered',
          items: 4
        }
      ],
      communications: [
        {
          id: 'comm-005',
          type: 'email',
          subject: 'Welcome to our farm fresh community!',
          date: '2024-08-10',
          status: 'sent'
        }
      ]
    }
  ]);

  // Initialize form data for editing
  useEffect(() => {
    if (modalType === 'edit' && selectedCustomer) {
      setFormData(selectedCustomer);
    } else if (modalType === 'add') {
      setFormData({
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
          country: 'USA'
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
    }
  }, [modalType, selectedCustomer, showModal]);

  // Filter and sort customers
  const filteredCustomers = customers
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
        case 'name': return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'spent': return b.stats.totalSpent - a.stats.totalSpent;
        case 'orders': return b.stats.totalOrders - a.stats.totalOrders;
        case 'recent': return new Date(b.stats.lastOrderDate) - new Date(a.stats.lastOrderDate);
        default: return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
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
      case 'ready': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
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
    setShowModal(false);
  };

  const handleDelete = (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(c => c.id !== customerId));
      if (selectedCustomer && selectedCustomer.id === customerId) {
        setActiveView('list');
        setSelectedCustomer(null);
      }
    }
  };

  const CustomerModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full h-full sm:w-[95vw] sm:h-[95vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">
              {modalType === 'add' ? 'Add New Customer' : 'Edit Customer'}
            </h3>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Personal Information</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                  <select
                    value={formData.type || 'individual'}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status || 'new'}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.company || ''}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Address</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address?.street || ''}
                  onChange={(e) => setFormData({
                    ...formData, 
                    address: {...(formData.address || {}), street: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.address?.city || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      address: {...(formData.address || {}), city: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.address?.state || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      address: {...(formData.address || {}), state: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={formData.address?.zipCode || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      address: {...(formData.address || {}), zipCode: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    value={formData.address?.country || 'USA'}
                    onChange={(e) => setFormData({
                      ...formData, 
                      address: {...(formData.address || {}), country: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
              </div>

              {/* Preferences */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences?.organic || false}
                        onChange={(e) => setFormData({
                          ...formData, 
                          preferences: {...(formData.preferences || {}), organic: e.target.checked}
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm">Prefers Organic</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferences?.local || false}
                        onChange={(e) => setFormData({
                          ...formData, 
                          preferences: {...(formData.preferences || {}), local: e.target.checked}
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm">Prefers Local</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Method</label>
                      <select
                        value={formData.preferences?.deliveryMethod || 'delivery'}
                        onChange={(e) => setFormData({
                          ...formData, 
                          preferences: {...(formData.preferences || {}), deliveryMethod: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="delivery">Delivery</option>
                        <option value="pickup">Pickup</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Communication</label>
                      <select
                        value={formData.preferences?.communicationMethod || 'email'}
                        onChange={(e) => setFormData({
                          ...formData, 
                          preferences: {...(formData.preferences || {}), communicationMethod: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional notes about this customer..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {modalType === 'add' ? 'Add Customer' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const CustomerDetailView = () => (
    <div className="bg-white rounded-lg shadow-md h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setActiveView('list')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to List
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedCustomer.firstName} {selectedCustomer.lastName}
            </h2>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => {
                setModalType('edit');
                setShowModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 inline mr-2" />
              Edit
            </button>
            <button
              onClick={() => handleDelete(selectedCustomer.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 inline mr-2" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Customer Info Card */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <div className="space-y-3">
              <p><strong>Email:</strong> {selectedCustomer.email}</p>
              <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
              <p><strong>Type:</strong> {selectedCustomer.type}</p>
              <p><strong>Status:</strong> 
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${getStatusColor(selectedCustomer.status)}`}>
                  {getStatusIcon(selectedCustomer.status)}
                  <span className="ml-1">{selectedCustomer.status}</span>
                </span>
              </p>
              {selectedCustomer.company && <p><strong>Company:</strong> {selectedCustomer.company}</p>}
              <p><strong>Address:</strong> {`${selectedCustomer.address.street}, ${selectedCustomer.address.city}, ${selectedCustomer.address.state} ${selectedCustomer.address.zipCode}, ${selectedCustomer.address.country}`}</p>
            </div>
          </div>

          {/* Stats Card */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Customer Stats</h3>
            <div className="space-y-3">
              <p><DollarSign className="inline h-4 w-4 mr-1" /> Total Spent: ${selectedCustomer.stats.totalSpent.toFixed(2)}</p>
              <p><ShoppingCart className="inline h-4 w-4 mr-1" /> Total Orders: {selectedCustomer.stats.totalOrders}</p>
              <p><TrendingUp className="inline h-4 w-4 mr-1" /> Avg Order: ${selectedCustomer.stats.avgOrderValue.toFixed(2)}</p>
              <p><Calendar className="inline h-4 w-4 mr-1" /> Last Order: {selectedCustomer.stats.lastOrderDate}</p>
              <p><Award className="inline h-4 w-4 mr-1" /> Loyalty Points: {selectedCustomer.stats.loyaltyPoints}</p>
              <p><Clock className="inline h-4 w-4 mr-1" /> Member Since: {selectedCustomer.stats.memberSince}</p>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Preferences</h3>
            <div className="space-y-3">
              <p><Heart className="inline h-4 w-4 mr-1" /> Organic: {selectedCustomer.preferences.organic ? 'Yes' : 'No'}</p>
              <p><MapPin className="inline h-4 w-4 mr-1" /> Local: {selectedCustomer.preferences.local ? 'Yes' : 'No'}</p>
              <p><Package className="inline h-4 w-4 mr-1" /> Delivery: {selectedCustomer.preferences.deliveryMethod}</p>
              <p><MessageCircle className="inline h-4 w-4 mr-1" /> Communication: {selectedCustomer.preferences.communicationMethod}</p>
              <p><FileText className="inline h-4 w-4 mr-1" /> Notes: {selectedCustomer.notes || 'None'}</p>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedCustomer.orders.map(order => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.items}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Communications Table */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Communication History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedCustomer.communications.map(comm => (
                  <tr key={comm.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{comm.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center">
                        {comm.type === 'email' ? <Mail className="h-4 w-4 mr-2" /> : 
                         comm.type === 'phone' ? <Phone className="h-4 w-4 mr-2" /> : 
                         <MessageCircle className="h-4 w-4 mr-2" />}
                        {comm.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{comm.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{comm.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${getStatusColor(comm.status)}`}>
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

  const CustomerListView = () => (
    <div className="h-full overflow-y-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4 lg:mb-0">
            <Users className="h-7 w-7 mr-3 text-blue-600" />
            Customer Management
          </h2>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => {
                setModalType('add');
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="individual">Individual</option>
              <option value="business">Business</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="spent">Sort by Total Spent</option>
              <option value="orders">Sort by Orders</option>
              <option value="recent">Sort by Recent Order</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {customer.avatar ? (
                          <img src={customer.avatar} alt="" className="h-8 w-8 rounded-full" />
                        ) : (
                          <span className="text-gray-600">
                            {customer.firstName[0]}{customer.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </p>
                        {customer.company && (
                          <p className="text-sm text-gray-500">{customer.company}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${getStatusColor(customer.status)}`}>
                      {getStatusIcon(customer.status)}
                      <span className="ml-1">{customer.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${customer.stats.totalSpent.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setActiveView('detail');
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setModalType('edit');
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
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
    <div className="w-full h-screen overflow-hidden">
      {showModal && <CustomerModal />}
      {activeView === 'list' ? <CustomerListView /> : <CustomerDetailView />}
    </div>
  );
};

export default CustomerManagement;