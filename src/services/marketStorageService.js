// marketStorageService.js
// Service for localStorage-based market data management

const STORAGE_KEYS = {
  SUPPLIERS: 'marketSuppliers',
  SHOP_INVENTORY: 'shopInventory',
  ORDERS: 'marketOrders',
  FARMER_PRODUCTS: 'farmerProducts',
  TRANSACTIONS: 'farmerToShopTransactions',
  CUSTOMERS: 'shopCustomers',
  SHOP_ORDERS: 'shopOrders',
  SALES_DATA: 'salesData',
  FARMER_DATA: 'farmerData'
};

// Initialize storage with default data if empty
export function initializeStorage() {
  // Initialize suppliers
  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(getDefaultSuppliers()));
  }
  
  // Initialize shop inventory
  if (!localStorage.getItem(STORAGE_KEYS.SHOP_INVENTORY)) {
    localStorage.setItem(STORAGE_KEYS.SHOP_INVENTORY, JSON.stringify([]));
  }
  
  // Initialize orders
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  }
  
  // Initialize farmer products
  if (!localStorage.getItem(STORAGE_KEYS.FARMER_PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.FARMER_PRODUCTS, JSON.stringify([]));
  }
  
  // Initialize transactions
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
  }
  
  // Initialize customers
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
  }
  
  // Initialize shop orders
  if (!localStorage.getItem(STORAGE_KEYS.SHOP_ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.SHOP_ORDERS, JSON.stringify([]));
  }
  
  // Initialize sales data
  if (!localStorage.getItem(STORAGE_KEYS.SALES_DATA)) {
    localStorage.setItem(STORAGE_KEYS.SALES_DATA, JSON.stringify([]));
  }
}

// Get default suppliers data
function getDefaultSuppliers() {
  return [
    {
      id: 'SUP-001',
      name: "Green Valley Farm",
      contactPerson: "John Smith",
      email: "john@greenvalley.com",
      phone: "+1-555-0101",
      category: "Organic Produce",
      location: "California, USA",
      specialization: "Organic Vegetables, Fruits",
      status: "Active",
      joinDate: "2023-01-15",
      totalOrders: 45,
      lastOrderDate: "2024-08-20",
      rating: 4.8,
      deliveryTime: "2-3 days",
      paymentTerms: "Net 30",
      certifications: ["Organic", "Non-GMO"],
      totalSales: 125000,
      performance: {
        avgDeliveryTime: 2.5,
        onTimeRate: 95.2,
        totalRevenue: 125000,
        orderFrequency: 45
      }
    },
    {
      id: 'SUP-002',
      name: "Happy Hens Farm",
      contactPerson: "Sarah Wilson",
      email: "sarah@happyhens.com",
      phone: "+1-555-0202",
      category: "Dairy & Eggs",
      location: "Oregon, USA",
      specialization: "Free-range Eggs, Dairy Products",
      status: "Active",
      joinDate: "2022-08-20",
      totalOrders: 32,
      lastOrderDate: "2024-08-21",
      rating: 4.6,
      deliveryTime: "1-2 days",
      paymentTerms: "Net 15",
      certifications: ["Organic", "Humane Certified"],
      totalSales: 85000,
      performance: {
        avgDeliveryTime: 1.5,
        onTimeRate: 98.1,
        totalRevenue: 85000,
        orderFrequency: 32
      }
    },
    {
      id: 'SUP-003',
      name: "AgriTech Equipment",
      contactPerson: "Mike Chen",
      email: "mike@agritech.com",
      phone: "+1-555-0789",
      category: "Farm Equipment",
      location: "Nebraska, USA",
      specialization: "Tractors, Harvesters, Irrigation Systems",
      status: "Active",
      joinDate: "2023-03-10",
      totalOrders: 8,
      lastOrderDate: "2024-07-22",
      rating: 4.9,
      deliveryTime: "2-3 weeks",
      paymentTerms: "Net 60",
      certifications: ["ISO 9001", "CE Certified"]
    },
    {
      id: 'SUP-004',
      name: "PestGuard Solutions",
      contactPerson: "Lisa Rodriguez",
      email: "lisa@pestguard.com",
      phone: "+1-555-0321",
      category: "Pest Control",
      location: "California, USA",
      specialization: "Herbicides, Insecticides, Fungicides",
      status: "Active",
      joinDate: "2023-06-05",
      totalOrders: 28,
      lastOrderDate: "2024-08-18",
      rating: 4.5,
      deliveryTime: "4-6 days",
      paymentTerms: "Net 30",
      certifications: ["EPA Registered", "FIFRA Compliant"],
      totalSales: 65000,
      performance: {
        avgDeliveryTime: 5,
        onTimeRate: 92.5,
        totalRevenue: 65000,
        orderFrequency: 28
      }
    }
  ];
}

// Supplier management
export function getSuppliers() {
  const suppliers = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
  return suppliers ? JSON.parse(suppliers) : [];
}

export function saveSuppliers(suppliers) {
  localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
}

// Shop inventory management
export function getShopInventory() {
  const inventory = localStorage.getItem(STORAGE_KEYS.SHOP_INVENTORY);
  return inventory ? JSON.parse(inventory) : [];
}

export function updateShopInventory(id, item) {
  const inventory = getShopInventory();
  const index = inventory.findIndex(i => i.id === id);
  if (index !== -1) {
    inventory[index] = { ...inventory[index], ...item };
    localStorage.setItem(STORAGE_KEYS.SHOP_INVENTORY, JSON.stringify(inventory));
  }
  return inventory;
}

export function addToShopInventory(item) {
  const inventory = getShopInventory();
  // Generate a simple ID if not provided
  const newItem = {
    id: item.id || `INV-${Date.now()}`,
    ...item
  };
  inventory.push(newItem);
  localStorage.setItem(STORAGE_KEYS.SHOP_INVENTORY, JSON.stringify(inventory));
  return newItem;
}

export function deleteInventoryItem(id) {
  const inventory = getShopInventory();
  const filteredInventory = inventory.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.SHOP_INVENTORY, JSON.stringify(filteredInventory));
  return filteredInventory;
}

// Order management
export function getOrders() {
  const orders = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return orders ? JSON.parse(orders) : [];
}

export function updateOrder(id, order) {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...order };
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }
  return orders;
}

// Farmer data synchronization
export function syncAllFarmerData() {
  // In a real implementation, this would sync with a backend
  // For now, we'll just ensure the data structures exist
  if (!localStorage.getItem(STORAGE_KEYS.FARMER_DATA)) {
    localStorage.setItem(STORAGE_KEYS.FARMER_DATA, JSON.stringify({}));
  }
  return true;
}

// Shop orders
export function getShopOrders() {
  const orders = localStorage.getItem(STORAGE_KEYS.SHOP_ORDERS);
  return orders ? JSON.parse(orders) : [];
}

// Shop customers
export function getShopCustomers() {
  const customers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
  return customers ? JSON.parse(customers) : [];
}

// Farmer products
export function getFarmerProducts(farmerId) {
  const products = localStorage.getItem(STORAGE_KEYS.FARMER_PRODUCTS);
  const allProducts = products ? JSON.parse(products) : [];
  return allProducts.filter(product => product.farmerId === farmerId);
}

export function addFarmerProduct(product) {
  const products = getFarmerProducts();
  // Generate a simple ID if not provided
  const newProduct = {
    id: product.id || `PROD-${Date.now()}`,
    ...product
  };
  products.push(newProduct);
  localStorage.setItem(STORAGE_KEYS.FARMER_PRODUCTS, JSON.stringify(products));
  return newProduct;
}

// Transactions
export function getFarmerToShopTransactions() {
  const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return transactions ? JSON.parse(transactions) : [];
}

// Sales data
export function getSalesData() {
  const salesData = localStorage.getItem(STORAGE_KEYS.SALES_DATA);
  return salesData ? JSON.parse(salesData) : [];
}

export function getMarketTransactions() {
  return getFarmerToShopTransactions();
}

// Utility functions
export function calculateExpiryDate(harvestDate, category) {
  if (!harvestDate) return '';
  
  const date = new Date(harvestDate);
  
  // Different expiry times based on category
  let daysToAdd = 7; // Default to 1 week
  
  switch (category) {
    case 'Hass Avocados':
    case 'Fuerte Avocados':
    case 'Bacon Avocados':
    case 'Zutano Avocados':
      daysToAdd = 14; // 2 weeks for avocados
      break;
    case 'Avocado Seedlings':
      daysToAdd = 30; // 1 month for seedlings
      break;
    case 'Fertilizers':
      daysToAdd = 365; // 1 year for fertilizers
      break;
    case 'Pesticides':
      daysToAdd = 180; // 6 months for pesticides
      break;
    default:
      daysToAdd = 7; // 1 week default
  }
  
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
}