import apiClient from '../services/apiClient';

// API Testing Utility for Dashboard Avocado
class ApiTester {
  constructor() {
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  // Test result logger
  logResult(endpoint, method, status, message, data = null) {
    const result = {
      endpoint,
      method,
      status,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    this.results.push(result);
    this.totalTests++;
    
    if (status === 'PASS') {
      this.passedTests++;
      console.log(`✅ ${method} ${endpoint} - ${message}`);
    } else {
      this.failedTests++;
      console.log(`❌ ${method} ${endpoint} - ${message}`);
    }
  }

  // Test authentication endpoints
  async testAuthEndpoints() {
    console.log('\n🔐 Testing Authentication Endpoints...');
    
    try {
      // Test login endpoint
      const loginResponse = await apiClient.post('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      this.logResult('/auth/login', 'POST', 'PASS', 'Login endpoint accessible');
    } catch (error) {
      this.logResult('/auth/login', 'POST', 'FAIL', `Login failed: ${error.message}`);
    }

    try {
      // Test profile endpoint (requires auth)
      const profileResponse = await apiClient.get('/auth/profile');
      this.logResult('/auth/profile', 'GET', 'PASS', 'Profile endpoint accessible');
    } catch (error) {
      this.logResult('/auth/profile', 'GET', 'FAIL', `Profile failed: ${error.message}`);
    }

    try {
      // Test verify endpoint
      const verifyResponse = await apiClient.get('/auth/verify');
      this.logResult('/auth/verify', 'GET', 'PASS', 'Verify endpoint accessible');
    } catch (error) {
      this.logResult('/auth/verify', 'GET', 'FAIL', `Verify failed: ${error.message}`);
    }
  }

  // Test user management endpoints
  async testUserEndpoints() {
    console.log('\n👥 Testing User Management Endpoints...');
    
    try {
      const usersResponse = await apiClient.get('/users', { params: { page: 1, limit: 10 } });
      this.logResult('/users', 'GET', 'PASS', 'Users list endpoint accessible');
    } catch (error) {
      this.logResult('/users', 'GET', 'FAIL', `Users list failed: ${error.message}`);
    }

    try {
      const farmersResponse = await apiClient.get('/users/farmers');
      this.logResult('/users/farmers', 'GET', 'PASS', 'Farmers list endpoint accessible');
    } catch (error) {
      this.logResult('/users/farmers', 'GET', 'FAIL', `Farmers list failed: ${error.message}`);
    }

    try {
      const agentsResponse = await apiClient.get('/users/agents');
      this.logResult('/users/agents', 'GET', 'PASS', 'Agents list endpoint accessible');
    } catch (error) {
      this.logResult('/users/agents', 'GET', 'FAIL', `Agents list failed: ${error.message}`);
    }
  }

  // Test products endpoints
  async testProductsEndpoints() {
    console.log('\n📦 Testing Products Endpoints...');
    
    try {
      const productsResponse = await apiClient.get('/products', { 
        params: { page: 1, limit: 20, status: 'available' } 
      });
      this.logResult('/products', 'GET', 'PASS', 'Products list endpoint accessible');
    } catch (error) {
      this.logResult('/products', 'GET', 'FAIL', `Products list failed: ${error.message}`);
    }

    // Test product categories
    const categories = ['irrigation', 'harvesting', 'containers', 'pest-management'];
    for (const category of categories) {
      try {
        const categoryResponse = await apiClient.get('/products', { 
          params: { category, limit: 5 } 
        });
        this.logResult(`/products?category=${category}`, 'GET', 'PASS', `${category} products accessible`);
      } catch (error) {
        this.logResult(`/products?category=${category}`, 'GET', 'FAIL', `${category} products failed: ${error.message}`);
      }
    }
  }

  // Test orders endpoints
  async testOrdersEndpoints() {
    console.log('\n🛒 Testing Orders Endpoints...');
    
    try {
      const ordersResponse = await apiClient.get('/orders', { params: { page: 1, limit: 10 } });
      this.logResult('/orders', 'GET', 'PASS', 'Orders list endpoint accessible');
    } catch (error) {
      this.logResult('/orders', 'GET', 'FAIL', `Orders list failed: ${error.message}`);
    }
  }

  // Test service requests endpoints
  async testServiceRequestsEndpoints() {
    console.log('\n🔧 Testing Service Requests Endpoints...');
    
    const serviceTypes = ['pest-management', 'property-evaluation', 'harvest'];
    for (const type of serviceTypes) {
      try {
        const response = await apiClient.get(`/service-requests/${type}`);
        this.logResult(`/service-requests/${type}`, 'GET', 'PASS', `${type} requests accessible`);
      } catch (error) {
        this.logResult(`/service-requests/${type}`, 'GET', 'FAIL', `${type} requests failed: ${error.message}`);
      }
    }
  }

  // Test shops endpoints
  async testShopsEndpoints() {
    console.log('\n🏪 Testing Shops Endpoints...');
    
    try {
      const shopsResponse = await apiClient.get('/shops');
      this.logResult('/shops', 'GET', 'PASS', 'Shops list endpoint accessible');
    } catch (error) {
      this.logResult('/shops', 'GET', 'FAIL', `Shops list failed: ${error.message}`);
    }
  }

  // Test analytics endpoints
  async testAnalyticsEndpoints() {
    console.log('\n📊 Testing Analytics Endpoints...');
    
    const analyticsEndpoints = [
      '/analytics/dashboard',
      '/analytics/sales',
      '/analytics/products',
      '/analytics/users',
      '/analytics/orders/monthly'
    ];

    for (const endpoint of analyticsEndpoints) {
      try {
        const response = await apiClient.get(endpoint);
        this.logResult(endpoint, 'GET', 'PASS', 'Analytics endpoint accessible');
      } catch (error) {
        this.logResult(endpoint, 'GET', 'FAIL', `Analytics failed: ${error.message}`);
      }
    }
  }

  // Test notifications endpoints
  async testNotificationsEndpoints() {
    console.log('\n🔔 Testing Notifications Endpoints...');
    
    try {
      const notificationsResponse = await apiClient.get('/notifications');
      this.logResult('/notifications', 'GET', 'PASS', 'Notifications endpoint accessible');
    } catch (error) {
      this.logResult('/notifications', 'GET', 'FAIL', `Notifications failed: ${error.message}`);
    }

    try {
      const unreadCountResponse = await apiClient.get('/notifications/unread-count');
      this.logResult('/notifications/unread-count', 'GET', 'PASS', 'Unread count endpoint accessible');
    } catch (error) {
      this.logResult('/notifications/unread-count', 'GET', 'FAIL', `Unread count failed: ${error.message}`);
    }
  }

  // Test inventory endpoints
  async testInventoryEndpoints() {
    console.log('\n📋 Testing Inventory Endpoints...');
    
    const inventoryEndpoints = [
      '/inventory',
      '/inventory/low-stock',
      '/inventory/out-of-stock',
      '/inventory/valuation'
    ];

    for (const endpoint of inventoryEndpoints) {
      try {
        const response = await apiClient.get(endpoint);
        this.logResult(endpoint, 'GET', 'PASS', 'Inventory endpoint accessible');
      } catch (error) {
        this.logResult(endpoint, 'GET', 'FAIL', `Inventory failed: ${error.message}`);
      }
    }
  }

  // Test monitoring endpoints
  async testMonitoringEndpoints() {
    console.log('\n🔍 Testing Monitoring Endpoints...');
    
    try {
      const healthResponse = await apiClient.get('/monitoring/health');
      this.logResult('/monitoring/health', 'GET', 'PASS', 'Health check accessible');
    } catch (error) {
      this.logResult('/monitoring/health', 'GET', 'FAIL', `Health check failed: ${error.message}`);
    }

    try {
      const metricsResponse = await apiClient.get('/monitoring/metrics');
      this.logResult('/monitoring/metrics', 'GET', 'PASS', 'Metrics endpoint accessible');
    } catch (error) {
      this.logResult('/monitoring/metrics', 'GET', 'FAIL', `Metrics failed: ${error.message}`);
    }
  }

  // Test logs endpoints
  async testLogsEndpoints() {
    console.log('\n📝 Testing Logs Endpoints...');
    
    try {
      const logsResponse = await apiClient.get('/logs', { params: { limit: 10 } });
      this.logResult('/logs', 'GET', 'PASS', 'Logs endpoint accessible');
    } catch (error) {
      this.logResult('/logs', 'GET', 'FAIL', `Logs failed: ${error.message}`);
    }

    try {
      const statsResponse = await apiClient.get('/logs/statistics');
      this.logResult('/logs/statistics', 'GET', 'PASS', 'Log statistics accessible');
    } catch (error) {
      this.logResult('/logs/statistics', 'GET', 'FAIL', `Log statistics failed: ${error.message}`);
    }
  }

  // Test farmer information endpoints
  async testFarmerInfoEndpoints() {
    console.log('\n🚜 Testing Farmer Information Endpoints...');
    
    try {
      const farmerInfoResponse = await apiClient.get('/farmer-information');
      this.logResult('/farmer-information', 'GET', 'PASS', 'Farmer info endpoint accessible');
    } catch (error) {
      this.logResult('/farmer-information', 'GET', 'FAIL', `Farmer info failed: ${error.message}`);
    }
  }

  // Test agent information endpoints
  async testAgentInfoEndpoints() {
    console.log('\n👨‍🌾 Testing Agent Information Endpoints...');
    
    try {
      const agentInfoResponse = await apiClient.get('/agent-information');
      this.logResult('/agent-information', 'GET', 'PASS', 'Agent info endpoint accessible');
    } catch (error) {
      this.logResult('/agent-information', 'GET', 'FAIL', `Agent info failed: ${error.message}`);
    }
  }

  // Test missing endpoints (should fail until backend implements them)
  async testMissingEndpoints() {
    console.log('\n❓ Testing Missing Endpoints (Expected to fail)...');
    
    const missingEndpoints = [
      { endpoint: '/customers', method: 'GET' },
      { endpoint: '/suppliers', method: 'GET' },
      { endpoint: '/reports', method: 'GET' },
      { endpoint: '/farms', method: 'GET' },
      { endpoint: '/weather/current', method: 'GET' },
      { endpoint: '/logs/export', method: 'GET' }
    ];

    for (const { endpoint, method } of missingEndpoints) {
      try {
        const response = await apiClient.get(endpoint);
        this.logResult(endpoint, method, 'UNEXPECTED_PASS', 'Endpoint exists (backend implemented?)');
      } catch (error) {
        this.logResult(endpoint, method, 'EXPECTED_FAIL', 'Endpoint not implemented (as expected)');
      }
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive API Testing...\n');
    
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;

    await this.testAuthEndpoints();
    await this.testUserEndpoints();
    await this.testProductsEndpoints();
    await this.testOrdersEndpoints();
    await this.testServiceRequestsEndpoints();
    await this.testShopsEndpoints();
    await this.testAnalyticsEndpoints();
    await this.testNotificationsEndpoints();
    await this.testInventoryEndpoints();
    await this.testMonitoringEndpoints();
    await this.testLogsEndpoints();
    await this.testFarmerInfoEndpoints();
    await this.testAgentInfoEndpoints();
    await this.testMissingEndpoints();

    this.generateReport();
  }

  // Generate test report
  generateReport() {
    console.log('\n📊 API Testing Report');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests} (${((this.passedTests / this.totalTests) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${this.failedTests} (${((this.failedTests / this.totalTests) * 100).toFixed(1)}%)`);
    console.log('='.repeat(50));

    // Group results by status
    const passedTests = this.results.filter(r => r.status === 'PASS');
    const failedTests = this.results.filter(r => r.status === 'FAIL');
    const expectedFails = this.results.filter(r => r.status === 'EXPECTED_FAIL');

    console.log('\n✅ Working Endpoints:');
    passedTests.forEach(test => {
      console.log(`  ${test.method} ${test.endpoint}`);
    });

    console.log('\n❌ Failed Endpoints:');
    failedTests.forEach(test => {
      console.log(`  ${test.method} ${test.endpoint} - ${test.message}`);
    });

    console.log('\n⏳ Missing Endpoints (Expected):');
    expectedFails.forEach(test => {
      console.log(`  ${test.method} ${test.endpoint}`);
    });

    return {
      total: this.totalTests,
      passed: this.passedTests,
      failed: this.failedTests,
      results: this.results
    };
  }
}

export default ApiTester;