// Market and Shop Local Storage Service
import { lsGet, lsSet, seedIfEmpty, nextId } from './demoData';

// Storage Keys
const STORAGE_KEYS = {
  FARMER_PRODUCTS: 'farmer_products',
  SHOP_INVENTORY: 'shop_inventory',
  SHOP_ORDERS: 'shop_orders',
  SHOP_CUSTOMERS: 'shop_customers',
  SHOP_SUPPLIERS: 'shop_suppliers',
  MARKET_TRANSACTIONS: 'market_transactions',
  FARMER_PROFILE: 'farmer_profile',
  SHOP_PROFILE: 'shop_profile'
};

// Default Data Seeds
const DEFAULT_FARMER_PRODUCTS = [
  {
    id: 1,
    name: 'Organic Avocados',
    category: 'Fruits',
    quantity: 150,
    unit: 'kg',
    pricePerUnit: 25.00,
    harvestDate: '2024-08-20',
    quality: 'Premium',
    farmerId: 'f1',
    farmerName: 'Jean Uwimana',
    location: 'Gasabo, Remera',
    status: 'available',
    description: 'Fresh organic avocados, perfect for export quality'
  },
  {
    id: 2,
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    quantity: 200,
    unit: 'kg',
    pricePerUnit: 15.00,
    harvestDate: '2024-08-21',
    quality: 'Good',
    farmerId: 'f2',
    farmerName: 'Marie Mukamana',
    location: 'Musanze, Cyuve',
    status: 'available',
    description: 'Locally grown fresh tomatoes'
  },
  {
    id: 3,
    name: 'Sweet Corn',
    category: 'Vegetables',
    quantity: 100,
    unit: 'cobs',
    pricePerUnit: 12.00,
    harvestDate: '2024-08-19',
    quality: 'Premium',
    farmerId: 'f1',
    farmerName: 'Jean Uwimana',
    location: 'Gasabo, Remera',
    status: 'available',
    description: 'Sweet and tender corn cobs'
  }
];

const DEFAULT_SHOP_INVENTORY = [
  {
    id: 1,
    name: 'Organic Avocados',
    category: 'Fruits',
    quantity: 45,
    unit: 'kg',
    price: 30.00,
    cost: 25.00,
    minStock: 20,
    supplier: 'Jean Uwimana (Farmer)',
    supplierId: 'f1',
    harvestDate: '2024-08-20',
    expiryDate: '2024-08-30',
    status: 'in-stock',
    sourceType: 'farmer',
    sourceId: 1
  },
  {
    id: 2,
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    quantity: 12,
    unit: 'kg',
    price: 18.00,
    cost: 15.00,
    minStock: 15,
    supplier: 'Marie Mukamana (Farmer)',
    supplierId: 'f2',
    harvestDate: '2024-08-21',
    expiryDate: '2024-08-28',
    status: 'low-stock',
    sourceType: 'farmer',
    sourceId: 2
  }
];

const DEFAULT_SHOP_ORDERS = [
  {
    id: 'ORD-001',
    customer: 'Green Valley Market',
    customerId: 'c1',
    orderDate: '2024-08-22',
    deliveryDate: '2024-08-24',
    status: 'pending',
    totalAmount: 540.00,
    items: [
      { productId: 1, name: 'Organic Avocados', quantity: 15, price: 30.00, total: 450.00 },
      { productId: 2, name: 'Fresh Tomatoes', quantity: 5, price: 18.00, total: 90.00 }
    ],
    paymentStatus: 'pending',
    notes: 'Delivery to main warehouse'
  },
  {
    id: 'ORD-002',
    customer: 'Farm Fresh Store',
    customerId: 'c2',
    orderDate: '2024-08-22',
    deliveryDate: '2024-08-23',
    status: 'processing',
    totalAmount: 216.00,
    items: [
      { productId: 2, name: 'Fresh Tomatoes', quantity: 12, price: 18.00, total: 216.00 }
    ],
    paymentStatus: 'paid',
    notes: 'Express delivery requested'
  }
];

const DEFAULT_SHOP_CUSTOMERS = [
  {
    id: 'c1',
    name: 'Green Valley Market',
    email: 'orders@greenvalleymarket.com',
    phone: '+250788123001',
    address: '123 Market Street, Kigali',
    district: 'Gasabo',
    totalOrders: 45,
    totalSpent: 12450.75,
    status: 'active',
    registrationDate: '2024-01-15',
    lastOrderDate: '2024-08-22'
  },
  {
    id: 'c2',
    name: 'Farm Fresh Store',
    email: 'purchasing@farmfresh.com',
    phone: '+250788123002',
    address: '456 Fresh Ave, Musanze',
    district: 'Musanze',
    totalOrders: 32,
    totalSpent: 8920.50,
    status: 'active',
    registrationDate: '2024-02-10',
    lastOrderDate: '2024-08-22'
  }
];

const DEFAULT_MARKET_TRANSACTIONS = [
  {
    id: 1,
    type: 'farmer_to_shop',
    farmerId: 'f1',
    farmerName: 'Jean Uwimana',
    shopId: 's1',
    shopName: 'Downtown Agro Shop',
    productId: 1,
    productName: 'Organic Avocados',
    quantity: 50,
    pricePerUnit: 25.00,
    totalAmount: 1250.00,
    transactionDate: '2024-08-20',
    status: 'completed',
    paymentMethod: 'mobile_money'
  },
  {
    id: 2,
    type: 'farmer_to_shop',
    farmerId: 'f2',
    farmerName: 'Marie Mukamana',
    shopId: 's1',
    shopName: 'Downtown Agro Shop',
    productId: 2,
    productName: 'Fresh Tomatoes',
    quantity: 30,
    pricePerUnit: 15.00,
    totalAmount: 450.00,
    transactionDate: '2024-08-21',
    status: 'completed',
    paymentMethod: 'cash'
  }
];

// Service Functions
export class MarketStorageService {
  // Initialize storage with default data
  static initializeStorage() {
    seedIfEmpty(STORAGE_KEYS.FARMER_PRODUCTS, DEFAULT_FARMER_PRODUCTS);
    seedIfEmpty(STORAGE_KEYS.SHOP_INVENTORY, DEFAULT_SHOP_INVENTORY);
    seedIfEmpty(STORAGE_KEYS.SHOP_ORDERS, DEFAULT_SHOP_ORDERS);
    seedIfEmpty(STORAGE_KEYS.SHOP_CUSTOMERS, DEFAULT_SHOP_CUSTOMERS);
    seedIfEmpty(STORAGE_KEYS.MARKET_TRANSACTIONS, DEFAULT_MARKET_TRANSACTIONS);
    seedIfEmpty(STORAGE_KEYS.SHOP_SUPPLIERS, []);
  }

  // Farmer Products Management
  static getFarmerProducts(farmerId = null) {
    const products = lsGet(STORAGE_KEYS.FARMER_PRODUCTS, []);
    return farmerId ? products.filter(p => p.farmerId === farmerId) : products;
  }

  static addFarmerProduct(product) {
    const products = this.getFarmerProducts();
    const newProduct = {
      ...product,
      id: nextId(products),
      status: 'available'
    };
    products.push(newProduct);
    lsSet(STORAGE_KEYS.FARMER_PRODUCTS, products);
    
    // Auto-sync with shop inventory
    this.syncFarmerProductToShop(newProduct);
    
    // Update farmer as supplier
    this.updateFarmerAsSupplier(product.farmerId, product.farmerName, product.location);
    
    return newProduct;
  }

  static updateFarmerProduct(productId, updates) {
    const products = this.getFarmerProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
      products[index] = { ...products[index], ...updates };
      lsSet(STORAGE_KEYS.FARMER_PRODUCTS, products);
      return products[index];
    }
    return null;
  }

  // Shop Inventory Management
  static getShopInventory() {
    return lsGet(STORAGE_KEYS.SHOP_INVENTORY, []);
  }

  static addToShopInventory(item) {
    const inventory = this.getShopInventory();
    const newItem = {
      ...item,
      id: nextId(inventory)
    };
    inventory.push(newItem);
    lsSet(STORAGE_KEYS.SHOP_INVENTORY, inventory);
    return newItem;
  }

  static updateShopInventory(itemId, updates) {
    const inventory = this.getShopInventory();
    const index = inventory.findIndex(item => item.id === itemId);
    if (index !== -1) {
      inventory[index] = { ...inventory[index], ...updates };
      lsSet(STORAGE_KEYS.SHOP_INVENTORY, inventory);
      return inventory[index];
    }
    return null;
  }

  // Purchase from Farmer to Shop
  static purchaseFromFarmer(farmerId, productId, quantity, shopId = 's1') {
    const farmerProducts = this.getFarmerProducts();
    const shopInventory = this.getShopInventory();
    const transactions = this.getMarketTransactions();

    const farmerProduct = farmerProducts.find(p => p.id === productId && p.farmerId === farmerId);
    if (!farmerProduct || farmerProduct.quantity < quantity) {
      throw new Error('Insufficient product quantity available');
    }

    // Update farmer product quantity
    this.updateFarmerProduct(productId, {
      quantity: farmerProduct.quantity - quantity,
      status: farmerProduct.quantity - quantity === 0 ? 'sold_out' : 'available'
    });

    // Check if product exists in shop inventory
    const existingInventoryItem = shopInventory.find(item => 
      item.sourceType === 'farmer' && item.sourceId === productId
    );

    if (existingInventoryItem) {
      // Update existing inventory
      this.updateShopInventory(existingInventoryItem.id, {
        quantity: existingInventoryItem.quantity + quantity,
        status: 'in-stock'
      });
    } else {
      // Add new inventory item
      this.addToShopInventory({
        name: farmerProduct.name,
        category: farmerProduct.category,
        quantity: quantity,
        unit: farmerProduct.unit,
        price: farmerProduct.pricePerUnit * 1.2, // 20% markup
        cost: farmerProduct.pricePerUnit,
        minStock: 10,
        supplier: `${farmerProduct.farmerName} (Farmer)`,
        supplierId: farmerId,
        harvestDate: farmerProduct.harvestDate,
        expiryDate: this.calculateExpiryDate(farmerProduct.harvestDate, farmerProduct.category),
        status: 'in-stock',
        sourceType: 'farmer',
        sourceId: productId
      });
    }

    // Record transaction
    const transaction = {
      id: nextId(transactions),
      type: 'farmer_to_shop',
      farmerId: farmerId,
      farmerName: farmerProduct.farmerName,
      shopId: shopId,
      shopName: 'Downtown Agro Shop',
      productId: productId,
      productName: farmerProduct.name,
      quantity: quantity,
      pricePerUnit: farmerProduct.pricePerUnit,
      totalAmount: quantity * farmerProduct.pricePerUnit,
      transactionDate: new Date().toISOString().split('T')[0],
      status: 'completed',
      paymentMethod: 'mobile_money'
    };

    transactions.push(transaction);
    lsSet(STORAGE_KEYS.MARKET_TRANSACTIONS, transactions);

    return transaction;
  }

  // Shop Orders Management
  static getShopOrders() {
    return lsGet(STORAGE_KEYS.SHOP_ORDERS, []);
  }

  static addShopOrder(order) {
    const orders = this.getShopOrders();
    const newOrder = {
      ...order,
      id: `ORD-${String(nextId(orders, 'id')).padStart(3, '0')}`
    };
    orders.push(newOrder);
    lsSet(STORAGE_KEYS.SHOP_ORDERS, orders);
    return newOrder;
  }

  static updateShopOrder(orderId, updates) {
    const orders = this.getShopOrders();
    const index = orders.findIndex(order => order.id === orderId);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      lsSet(STORAGE_KEYS.SHOP_ORDERS, orders);
      return orders[index];
    }
    return null;
  }

  // Shop Customers Management
  static getShopCustomers() {
    return lsGet(STORAGE_KEYS.SHOP_CUSTOMERS, []);
  }

  static addShopCustomer(customer) {
    const customers = this.getShopCustomers();
    const newCustomer = {
      ...customer,
      id: `c${nextId(customers)}`,
      registrationDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSpent: 0,
      status: 'active'
    };
    customers.push(newCustomer);
    lsSet(STORAGE_KEYS.SHOP_CUSTOMERS, customers);
    return newCustomer;
  }

  // Market Transactions
  static getMarketTransactions() {
    return lsGet(STORAGE_KEYS.MARKET_TRANSACTIONS, []);
  }

  // Analytics and Reports
  static getDashboardStats() {
    const inventory = this.getShopInventory();
    const orders = this.getShopOrders();
    const customers = this.getShopCustomers();
    const transactions = this.getMarketTransactions();

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const lowStockItems = inventory.filter(item => item.quantity <= item.minStock).length;

    const recentOrders = orders
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      .slice(0, 5);

    const topProducts = inventory
      .map(item => ({
        name: item.name,
        sold: orders.reduce((sum, order) => {
          const orderItem = order.items.find(i => i.productId === item.id);
          return sum + (orderItem ? orderItem.quantity : 0);
        }, 0),
        revenue: orders.reduce((sum, order) => {
          const orderItem = order.items.find(i => i.productId === item.id);
          return sum + (orderItem ? orderItem.total : 0);
        }, 0)
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      lowStockItems,
      recentOrders,
      topProducts
    };
  }

  // Helper Methods
  static calculateExpiryDate(harvestDate, category) {
    const harvest = new Date(harvestDate);
    const daysToAdd = category === 'Fruits' ? 10 : 7; // Fruits last longer
    harvest.setDate(harvest.getDate() + daysToAdd);
    return harvest.toISOString().split('T')[0];
  }

  // Shop Suppliers Management
  static getSuppliers() {
    return lsGet(STORAGE_KEYS.SHOP_SUPPLIERS, []);
  }

  static saveSuppliers(suppliers) {
    lsSet(STORAGE_KEYS.SHOP_SUPPLIERS, suppliers);
    return suppliers;
  }

  static addSupplier(supplier) {
    const suppliers = this.getSuppliers();
    const newSupplier = {
      ...supplier,
      id: `SUP-${String(nextId(suppliers)).padStart(3, '0')}`,
      joinDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSales: 0,
      status: supplier.status || 'Active'
    };
    suppliers.push(newSupplier);
    lsSet(STORAGE_KEYS.SHOP_SUPPLIERS, suppliers);
    return newSupplier;
  }

  static updateSupplier(supplierId, updates) {
    const suppliers = this.getSuppliers();
    const index = suppliers.findIndex(supplier => supplier.id === supplierId);
    if (index !== -1) {
      suppliers[index] = { ...suppliers[index], ...updates };
      lsSet(STORAGE_KEYS.SHOP_SUPPLIERS, suppliers);
      return suppliers[index];
    }
    return null;
  }

  static deleteSupplier(supplierId) {
    const suppliers = this.getSuppliers();
    const filteredSuppliers = suppliers.filter(supplier => supplier.id !== supplierId);
    lsSet(STORAGE_KEYS.SHOP_SUPPLIERS, filteredSuppliers);
    return filteredSuppliers;
  }

  // Get sales data for suppliers
  static getSalesData() {
    const orders = this.getShopOrders();
    return orders.map(order => ({
      id: order.id,
      supplierId: order.supplierId || null,
      amount: order.totalAmount,
      date: order.orderDate
    }));
  }

  static getOrders() {
    return this.getShopOrders();
  }

  // Dynamic Sync Methods
  static syncFarmerProductToShop(farmerProduct) {
    const inventory = this.getShopInventory();
    
    // Check if product already exists in shop inventory
    const existingItem = inventory.find(item => 
      item.sourceType === 'farmer' && item.sourceId === farmerProduct.id
    );
    
    if (!existingItem) {
      // Add new item to shop inventory
      const shopItem = {
        id: nextId(inventory),
        name: farmerProduct.name,
        category: farmerProduct.category,
        quantity: Math.floor(farmerProduct.quantity * 0.3), // Shop takes 30% of farmer's stock
        unit: farmerProduct.unit,
        price: farmerProduct.pricePerUnit * 1.2, // 20% markup
        cost: farmerProduct.pricePerUnit,
        minStock: Math.max(5, Math.floor(farmerProduct.quantity * 0.1)),
        supplier: `${farmerProduct.farmerName} (Farmer)`,
        supplierId: farmerProduct.farmerId,
        harvestDate: farmerProduct.harvestDate,
        expiryDate: this.calculateExpiryDate(farmerProduct.harvestDate, farmerProduct.category),
        status: farmerProduct.quantity > 20 ? 'in-stock' : 'low-stock',
        sourceType: 'farmer',
        sourceId: farmerProduct.id,
        quality: farmerProduct.quality,
        description: farmerProduct.description
      };
      
      inventory.push(shopItem);
      lsSet(STORAGE_KEYS.SHOP_INVENTORY, inventory);
      
      // Create market transaction
      this.createMarketTransaction(farmerProduct, shopItem);
    }
  }
  
  static updateFarmerAsSupplier(farmerId, farmerName, location) {
    const suppliers = this.getSuppliers();
    const existingSupplier = suppliers.find(s => s.id === farmerId);
    
    if (!existingSupplier) {
      const newSupplier = {
        id: farmerId,
        name: `${farmerName} Farm`,
        contactPerson: farmerName,
        email: `${farmerName.toLowerCase().replace(' ', '.')}@farmer.local`,
        phone: `+250788${Math.floor(Math.random() * 900000 + 100000)}`,
        category: "Organic Produce",
        location: location,
        specialization: "Fresh Farm Products",
        status: "Active",
        joinDate: new Date().toISOString().split('T')[0],
        totalOrders: 1,
        lastOrderDate: new Date().toISOString().split('T')[0],
        rating: 4.5 + Math.random() * 0.5,
        deliveryTime: "1-2 days",
        paymentTerms: "Net 15",
        certifications: ["Organic", "Local Farmer"],
        totalSales: 0,
        performance: {
          avgDeliveryTime: 1.5,
          onTimeRate: 95.0,
          totalRevenue: 0,
          orderFrequency: 1
        },
        sourceType: 'farmer'
      };
      
      suppliers.push(newSupplier);
      this.saveSuppliers(suppliers);
    } else {
      // Update existing supplier stats
      existingSupplier.totalOrders += 1;
      existingSupplier.lastOrderDate = new Date().toISOString().split('T')[0];
      existingSupplier.performance.orderFrequency += 1;
      this.saveSuppliers(suppliers);
    }
  }
  
  static createMarketTransaction(farmerProduct, shopItem) {
    const transactions = lsGet(STORAGE_KEYS.MARKET_TRANSACTIONS, []);
    const newTransaction = {
      id: nextId(transactions),
      type: 'farmer_to_shop',
      farmerId: farmerProduct.farmerId,
      farmerName: farmerProduct.farmerName,
      shopId: 's1',
      shopName: 'pWallet Shop Manager',
      productId: farmerProduct.id,
      productName: farmerProduct.name,
      quantity: shopItem.quantity,
      pricePerUnit: farmerProduct.pricePerUnit,
      totalAmount: shopItem.quantity * farmerProduct.pricePerUnit,
      transactionDate: new Date().toISOString().split('T')[0],
      status: 'completed',
      paymentMethod: 'mobile_money'
    };
    
    transactions.push(newTransaction);
    lsSet(STORAGE_KEYS.MARKET_TRANSACTIONS, transactions);
    
    // Update sales data for analytics
    this.updateSalesFromTransaction(newTransaction);
  }
  
  static updateSalesFromTransaction(transaction) {
    const orders = this.getShopOrders();
    
    // Create corresponding shop order
    const newOrder = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      customer: 'Internal Stock Purchase',
      customerId: 'internal',
      orderDate: transaction.transactionDate,
      deliveryDate: transaction.transactionDate,
      status: 'completed',
      totalAmount: transaction.totalAmount,
      items: [{
        productId: transaction.productId,
        productName: transaction.productName,
        quantity: transaction.quantity,
        price: transaction.pricePerUnit,
        total: transaction.totalAmount
      }],
      paymentStatus: 'paid',
      paymentMethod: transaction.paymentMethod,
      notes: `Stock purchase from farmer: ${transaction.farmerName}`,
      supplierId: transaction.farmerId,
      sourceType: 'farmer_purchase'
    };
    
    orders.push(newOrder);
    lsSet(STORAGE_KEYS.SHOP_ORDERS, orders);
  }
  
  static syncAllFarmerData() {
    // Sync all farmer products to shop inventory
    const farmerProducts = this.getFarmerProducts();
    farmerProducts.forEach(product => {
      if (product.status === 'available') {
        this.syncFarmerProductToShop(product);
      }
    });
    
    // Update supplier performance metrics
    this.updateSupplierMetrics();
  }
  
  static updateSupplierMetrics() {
    const suppliers = this.getSuppliers();
    const transactions = lsGet(STORAGE_KEYS.MARKET_TRANSACTIONS, []);
    const orders = this.getShopOrders();
    
    suppliers.forEach(supplier => {
      if (supplier.sourceType === 'farmer') {
        const supplierTransactions = transactions.filter(t => t.farmerId === supplier.id);
        const supplierOrders = orders.filter(o => o.supplierId === supplier.id);
        
        supplier.totalSales = supplierTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
        supplier.totalOrders = supplierTransactions.length;
        supplier.performance.totalRevenue = supplier.totalSales;
        supplier.performance.orderFrequency = supplier.totalOrders;
        
        if (supplierTransactions.length > 0) {
          supplier.lastOrderDate = supplierTransactions
            .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))[0]
            .transactionDate;
        }
      }
    });
    
    this.saveSuppliers(suppliers);
  }
  
  static getFarmerSuppliers() {
    return this.getSuppliers().filter(supplier => supplier.sourceType === 'farmer');
  }
  
  static getMarketTransactions() {
    return lsGet(STORAGE_KEYS.MARKET_TRANSACTIONS, []);
  }
  
  static getFarmerToShopTransactions() {
    return this.getMarketTransactions().filter(t => t.type === 'farmer_to_shop');
  }
  
  // Enhanced analytics for shop dashboard
  static getShopAnalytics() {
    const inventory = this.getShopInventory();
    const orders = this.getShopOrders();
    const transactions = this.getMarketTransactions();
    const farmerProducts = this.getFarmerProducts();
    
    // Farmer-sourced inventory
    const farmerInventory = inventory.filter(item => item.sourceType === 'farmer');
    const farmerRevenue = transactions
      .filter(t => t.type === 'farmer_to_shop')
      .reduce((sum, t) => sum + t.totalAmount, 0);
    
    // Low stock alerts from farmer products
    const lowStockFarmerItems = farmerInventory.filter(item => 
      item.quantity <= item.minStock
    );
    
    // Available farmer products not yet in shop
    const availableFarmerProducts = farmerProducts.filter(product => 
      product.status === 'available' && 
      !inventory.some(item => item.sourceId === product.id)
    );
    
    return {
      ...this.getShopDashboardData(),
      farmerMetrics: {
        totalFarmerSuppliers: this.getFarmerSuppliers().length,
        farmerInventoryItems: farmerInventory.length,
        farmerRevenue: farmerRevenue,
        lowStockFarmerItems: lowStockFarmerItems.length,
        availableFarmerProducts: availableFarmerProducts.length,
        farmerTransactions: transactions.filter(t => t.type === 'farmer_to_shop').length
      },
      availableFarmerProducts,
      lowStockFarmerItems
    };
  }

  // Clear all data (for testing)
  static clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export default MarketStorageService;
