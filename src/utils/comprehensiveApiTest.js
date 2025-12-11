// Comprehensive API Integration Test Runner
import apiClient from '../services/apiClient';

class ComprehensiveApiTest {
  constructor() {
    this.testResults = [];
    this.startTime = null;
    this.endTime = null;
  }

  // Log test result
  logTest(category, endpoint, method, status, message, data = null, duration = 0) {
    this.testResults.push({
      category,
      endpoint,
      method,
      status,
      message,
      data,
      duration,
      timestamp: new Date().toISOString()
    });

    const statusEmoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${statusEmoji} [${category}] ${method} ${endpoint} - ${message} (${duration}ms)`);
  }

  // Test endpoint with timing
  async testEndpoint(category, endpoint, method = 'GET', data = null, expectedStatus = 200) {
    const startTime = Date.now();
    
    try {
      let response;
      
      switch (method.toUpperCase()) {
        case 'GET':
          response = await apiClient.get(endpoint);
          break;
        case 'POST':
          response = await apiClient.post(endpoint, data);
          break;
        case 'PUT':
          response = await apiClient.put(endpoint, data);
          break;
        case 'DELETE':
          response = await apiClient.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      const duration = Date.now() - startTime;
      
      if (response.status === expectedStatus) {
        this.logTest(category, endpoint, method, 'PASS', 'Request successful', response.data, duration);
        return { success: true, data: response.data, duration };
      } else {
        this.logTest(category, endpoint, method, 'FAIL', `Unexpected status: ${response.status}`, null, duration);
        return { success: false, error: `Unexpected status: ${response.status}`, duration };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const isNetworkError = error.code === 'NETWORK_ERROR' || 
                            error.message.includes('Network Error') ||
                            error.response?.status >= 500;
      
      const status = isNetworkError ? 'NETWORK_ERROR' : 'FAIL';
      this.logTest(category, endpoint, method, status, error.message, null, duration);
      return { success: false, error: error.message, duration };
    }
  }

  // Test authentication endpoints
  async testAuthenticationEndpoints() {
    console.log('\n🔐 Testing Authentication Endpoints...');
    
    // Test login (this will likely fail without valid credentials, but tests the endpoint)
    await this.testEndpoint('Authentication', '/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'testpassword'
    }, 401); // Expect 401 for invalid credentials

    // Test profile (will fail if not authenticated)
    await this.testEndpoint('Authentication', '/auth/profile', 'GET', null, 401);

    // Test verify (will fail if not authenticated)
    await this.testEndpoint('Authentication', '/auth/verify', 'GET', null, 401);
  }

  // Test user management endpoints
  async testUserManagementEndpoints() {
    console.log('\n👥 Testing User Management Endpoints...');
    
    await this.testEndpoint('Users', '/users', 'GET');
    await this.testEndpoint('Users', '/users/farmers', 'GET');
    await this.testEndpoint('Users', '/users/agents', 'GET');
    await this.testEndpoint('Users', '/users/shop-managers', 'GET');
  }

  // Test products endpoints
  async testProductsEndpoints() {
    console.log('\n📦 Testing Products Endpoints...');
    
    await this.testEndpoint('Products', '/products', 'GET');
    await this.testEndpoint('Products', '/products?category=irrigation', 'GET');
    await this.testEndpoint('Products', '/products?category=harvesting', 'GET');
    await this.testEndpoint('Products', '/products?category=containers', 'GET');
    await this.testEndpoint('Products', '/products?category=pest-management', 'GET');
  }

  // Test orders endpoints
  async testOrdersEndpoints() {
    console.log('\n🛒 Testing Orders Endpoints...');
    
    await this.testEndpoint('Orders', '/orders', 'GET');
  }

  // Test service requests endpoints
  async testServiceRequestsEndpoints() {
    console.log('\n🔧 Testing Service Requests Endpoints...');
    
    await this.testEndpoint('Service Requests', '/service-requests/pest-management', 'GET');
    await this.testEndpoint('Service Requests', '/service-requests/property-evaluation', 'GET');
    await this.testEndpoint('Service Requests', '/service-requests/harvest', 'GET');
  }

  // Test shops endpoints
  async testShopsEndpoints() {
    console.log('\n🏪 Testing Shops Endpoints...');
    
    await this.testEndpoint('Shops', '/shops', 'GET');
  }

  // Test analytics endpoints
  async testAnalyticsEndpoints() {
    console.log('\n📊 Testing Analytics Endpoints...');
    
    await this.testEndpoint('Analytics', '/analytics/dashboard', 'GET');
    await this.testEndpoint('Analytics', '/analytics/sales', 'GET');
    await this.testEndpoint('Analytics', '/analytics/products', 'GET');
    await this.testEndpoint('Analytics', '/analytics/users', 'GET');
    await this.testEndpoint('Analytics', '/analytics/orders/monthly', 'GET');
  }

  // Test notifications endpoints
  async testNotificationsEndpoints() {
    console.log('\n🔔 Testing Notifications Endpoints...');
    
    await this.testEndpoint('Notifications', '/notifications', 'GET');
    await this.testEndpoint('Notifications', '/notifications/unread-count', 'GET');
  }

  // Test inventory endpoints
  async testInventoryEndpoints() {
    console.log('\n📋 Testing Inventory Endpoints...');
    
    await this.testEndpoint('Inventory', '/inventory', 'GET');
    await this.testEndpoint('Inventory', '/inventory/low-stock', 'GET');
    await this.testEndpoint('Inventory', '/inventory/out-of-stock', 'GET');
    await this.testEndpoint('Inventory', '/inventory/valuation', 'GET');
  }

  // Test monitoring endpoints
  async testMonitoringEndpoints() {
    console.log('\n🔍 Testing Monitoring Endpoints...');
    
    await this.testEndpoint('Monitoring', '/monitoring/health', 'GET');
    await this.testEndpoint('Monitoring', '/monitoring/metrics', 'GET');
    await this.testEndpoint('Monitoring', '/monitoring/usage', 'GET');
    await this.testEndpoint('Monitoring', '/monitoring/activity', 'GET');
  }

  // Test logs endpoints
  async testLogsEndpoints() {
    console.log('\n📝 Testing Logs Endpoints...');
    
    await this.testEndpoint('Logs', '/logs', 'GET');
    await this.testEndpoint('Logs', '/logs/statistics', 'GET');
    await this.testEndpoint('Logs', '/logs/export', 'GET');
  }

  // Test farmer information endpoints
  async testFarmerInfoEndpoints() {
    console.log('\n🚜 Testing Farmer Information Endpoints...');
    
    await this.testEndpoint('Farmer Info', '/farmer-information', 'GET');
  }

  // Test agent information endpoints
  async testAgentInfoEndpoints() {
    console.log('\n👨‍🌾 Testing Agent Information Endpoints...');
    
    await this.testEndpoint('Agent Info', '/agent-information', 'GET');
  }

  // Test missing endpoints (expected to fail)
  async testMissingEndpoints() {
    console.log('\n❓ Testing Missing Endpoints (Expected to fail)...');
    
    // These should return 404 or similar until backend implements them
    await this.testEndpoint('Missing', '/customers', 'GET', null, 404);
    await this.testEndpoint('Missing', '/suppliers', 'GET', null, 404);
    await this.testEndpoint('Missing', '/reports', 'GET', null, 404);
    await this.testEndpoint('Missing', '/farms', 'GET', null, 404);
    await this.testEndpoint('Missing', '/weather/current', 'GET', null, 404);
  }

  // Test system health endpoints
  async testSystemHealthEndpoints() {
    console.log('\n🏥 Testing System Health Endpoints...');
    
    await this.testEndpoint('Health', '/', 'GET');
    await this.testEndpoint('Health', '/health', 'GET');
    await this.testEndpoint('Health', '/api/welcome', 'GET');
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive API Integration Tests...\n');
    console.log(`🌐 Testing against: ${apiClient.defaults.baseURL}`);
    console.log(`⏰ Started at: ${new Date().toLocaleString()}\n`);
    
    this.startTime = Date.now();
    this.testResults = [];

    // Run all test categories
    await this.testSystemHealthEndpoints();
    await this.testAuthenticationEndpoints();
    await this.testUserManagementEndpoints();
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

    this.endTime = Date.now();
    return this.generateReport();
  }

  // Generate comprehensive test report
  generateReport() {
    const totalDuration = this.endTime - this.startTime;
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    const networkErrors = this.testResults.filter(r => r.status === 'NETWORK_ERROR').length;

    const report = {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        networkErrors,
        successRate: ((passedTests / totalTests) * 100).toFixed(1),
        totalDuration,
        averageDuration: (this.testResults.reduce((sum, r) => sum + r.duration, 0) / totalTests).toFixed(1)
      },
      categories: {},
      results: this.testResults,
      timestamp: new Date().toISOString()
    };

    // Group results by category
    const categories = [...new Set(this.testResults.map(r => r.category))];
    categories.forEach(category => {
      const categoryResults = this.testResults.filter(r => r.category === category);
      report.categories[category] = {
        total: categoryResults.length,
        passed: categoryResults.filter(r => r.status === 'PASS').length,
        failed: categoryResults.filter(r => r.status === 'FAIL').length,
        networkErrors: categoryResults.filter(r => r.status === 'NETWORK_ERROR').length,
        averageDuration: (categoryResults.reduce((sum, r) => sum + r.duration, 0) / categoryResults.length).toFixed(1)
      };
    });

    this.printReport(report);
    return report;
  }

  // Print formatted report
  printReport(report) {
    console.log('\n📊 COMPREHENSIVE API TEST REPORT');
    console.log('='.repeat(60));
    console.log(`⏱️  Total Duration: ${report.summary.totalDuration}ms`);
    console.log(`🧪 Total Tests: ${report.summary.totalTests}`);
    console.log(`✅ Passed: ${report.summary.passedTests} (${report.summary.successRate}%)`);
    console.log(`❌ Failed: ${report.summary.failedTests}`);
    console.log(`🌐 Network Errors: ${report.summary.networkErrors}`);
    console.log(`⚡ Average Response Time: ${report.summary.averageDuration}ms`);
    console.log('='.repeat(60));

    console.log('\n📋 CATEGORY BREAKDOWN:');
    Object.entries(report.categories).forEach(([category, stats]) => {
      const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
      const statusEmoji = successRate > 80 ? '🟢' : successRate > 50 ? '🟡' : '🔴';
      console.log(`${statusEmoji} ${category}: ${stats.passed}/${stats.total} (${successRate}%) - Avg: ${stats.averageDuration}ms`);
    });

    console.log('\n🎯 RECOMMENDATIONS:');
    if (report.summary.networkErrors > 0) {
      console.log(`• ${report.summary.networkErrors} endpoints have network errors - check backend availability`);
    }
    if (report.summary.failedTests > 0) {
      console.log(`• ${report.summary.failedTests} endpoints failed - review authentication and permissions`);
    }
    if (report.summary.successRate < 50) {
      console.log('• Low success rate - verify backend is running and accessible');
    } else if (report.summary.successRate > 80) {
      console.log('• High success rate - API integration is working well!');
    }

    console.log(`\n🏆 OVERALL STATUS: ${this.getOverallStatus(report.summary.successRate)}`);
  }

  // Get overall status based on success rate
  getOverallStatus(successRate) {
    if (successRate >= 90) return 'EXCELLENT 🌟';
    if (successRate >= 75) return 'GOOD 👍';
    if (successRate >= 50) return 'FAIR ⚠️';
    return 'NEEDS ATTENTION 🚨';
  }

  // Export report to JSON
  exportReport(report) {
    const jsonContent = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprehensive-api-test-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export default ComprehensiveApiTest;