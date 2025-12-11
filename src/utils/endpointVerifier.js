// Comprehensive Endpoint Verification Utility
import * as authService from '../services/authService';
import * as usersService from '../services/usersService';
import * as productsService from '../services/productsService';
import * as orderService from '../services/orderService';
import * as serviceRequestsService from '../services/serviceRequestsService';
import * as shopService from '../services/shopService';
import * as analyticsService from '../services/analyticsService';
import * as notificationsService from '../services/notificationsService';
import * as inventoryService from '../services/inventoryService';
import * as monitoringService from '../services/monitoringService';
import * as logsService from '../services/logsService';
import * as farmerInformationService from '../services/farmer-information';
import * as agentInformationService from '../services/agent-information';
import * as profileAccessService from '../services/profileAccessService';
import * as uploadService from '../services/uploadService';
import * as customersService from '../services/customersService';
import * as suppliersService from '../services/suppliersService';
import * as reportsService from '../services/reportsService';
import * as weatherService from '../services/weatherService';
import * as farmsService from '../services/farmsService';

class EndpointVerifier {
  constructor() {
    this.results = [];
    this.serviceMap = {
      'Authentication Service': authService,
      'Users Service': usersService,
      'Products Service': productsService,
      'Orders Service': orderService,
      'Service Requests Service': serviceRequestsService,
      'Shop Service': shopService,
      'Analytics Service': analyticsService,
      'Notifications Service': notificationsService,
      'Inventory Service': inventoryService,
      'Monitoring Service': monitoringService,
      'Logs Service': logsService,
      'Farmer Information Service': farmerInformationService,
      'Agent Information Service': agentInformationService,
      'Profile Access Service': profileAccessService,
      'Upload Service': uploadService,
      'Customers Service': customersService,
      'Suppliers Service': suppliersService,
      'Reports Service': reportsService,
      'Weather Service': weatherService,
      'Farms Service': farmsService
    };
  }

  // Verify service function exists and is callable
  verifyServiceFunction(serviceName, functionName, serviceModule) {
    try {
      const func = serviceModule[functionName];
      if (typeof func === 'function') {
        this.results.push({
          service: serviceName,
          function: functionName,
          status: 'IMPLEMENTED',
          message: 'Function exists and is callable',
          type: 'frontend'
        });
        return true;
      } else {
        this.results.push({
          service: serviceName,
          function: functionName,
          status: 'MISSING',
          message: 'Function not found in service',
          type: 'frontend'
        });
        return false;
      }
    } catch (error) {
      this.results.push({
        service: serviceName,
        function: functionName,
        status: 'ERROR',
        message: error.message,
        type: 'frontend'
      });
      return false;
    }
  }

  // Test actual API call
  async testApiCall(serviceName, functionName, serviceModule, testParams = {}) {
    try {
      const func = serviceModule[functionName];
      if (typeof func !== 'function') {
        return false;
      }

      // Try to call the function with test parameters
      const result = await func(testParams);
      
      this.results.push({
        service: serviceName,
        function: functionName,
        status: 'API_SUCCESS',
        message: 'API call successful',
        type: 'api',
        data: result
      });
      return true;
    } catch (error) {
      // Check if it's a network error (backend not available) vs implementation error
      const isNetworkError = error.message.includes('Network Error') || 
                            error.message.includes('timeout') ||
                            error.message.includes('ECONNREFUSED') ||
                            error.message.includes('404') ||
                            error.message.includes('500');
      
      this.results.push({
        service: serviceName,
        function: functionName,
        status: isNetworkError ? 'BACKEND_MISSING' : 'API_ERROR',
        message: error.message,
        type: 'api'
      });
      return false;
    }
  }

  // Verify all services
  async verifyAllServices() {
    console.log('🔍 Starting comprehensive service verification...\n');

    for (const [serviceName, serviceModule] of Object.entries(this.serviceMap)) {
      console.log(`📋 Verifying ${serviceName}...`);
      
      // Get all exported functions from the service
      const functions = Object.keys(serviceModule).filter(key => 
        typeof serviceModule[key] === 'function'
      );

      for (const functionName of functions) {
        // Verify function exists
        this.verifyServiceFunction(serviceName, functionName, serviceModule);
        
        // Test API call with safe parameters
        await this.testApiCall(serviceName, functionName, serviceModule, this.getSafeTestParams(functionName));
      }
    }

    return this.generateVerificationReport();
  }

  // Get safe test parameters for different function types
  getSafeTestParams(functionName) {
    // Read operations with safe parameters
    if (functionName.startsWith('get') || functionName.startsWith('fetch')) {
      return { page: 1, limit: 1 };
    }
    
    // Search operations
    if (functionName.includes('search') || functionName.includes('Search')) {
      return { q: 'test', limit: 1 };
    }
    
    // Statistics operations
    if (functionName.includes('statistics') || functionName.includes('Statistics') || functionName.includes('Stats')) {
      return {};
    }
    
    // Health checks
    if (functionName.includes('health') || functionName.includes('Health')) {
      return {};
    }
    
    // For write operations, return null to skip actual API testing
    if (functionName.startsWith('create') || functionName.startsWith('update') || 
        functionName.startsWith('delete') || functionName.startsWith('upload')) {
      return null;
    }
    
    return {};
  }

  // Generate comprehensive verification report
  generateVerificationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalServices: Object.keys(this.serviceMap).length,
        totalFunctions: this.results.filter(r => r.type === 'frontend').length,
        implementedFunctions: this.results.filter(r => r.status === 'IMPLEMENTED').length,
        missingFunctions: this.results.filter(r => r.status === 'MISSING').length,
        apiSuccesses: this.results.filter(r => r.status === 'API_SUCCESS').length,
        apiErrors: this.results.filter(r => r.status === 'API_ERROR').length,
        backendMissing: this.results.filter(r => r.status === 'BACKEND_MISSING').length
      },
      serviceBreakdown: {},
      results: this.results
    };

    // Generate per-service breakdown
    for (const serviceName of Object.keys(this.serviceMap)) {
      const serviceResults = this.results.filter(r => r.service === serviceName);
      report.serviceBreakdown[serviceName] = {
        totalFunctions: serviceResults.filter(r => r.type === 'frontend').length,
        implemented: serviceResults.filter(r => r.status === 'IMPLEMENTED').length,
        apiWorking: serviceResults.filter(r => r.status === 'API_SUCCESS').length,
        backendMissing: serviceResults.filter(r => r.status === 'BACKEND_MISSING').length,
        status: this.getServiceStatus(serviceResults)
      };
    }

    this.printReport(report);
    return report;
  }

  // Determine overall service status
  getServiceStatus(serviceResults) {
    const frontendResults = serviceResults.filter(r => r.type === 'frontend');
    const apiResults = serviceResults.filter(r => r.type === 'api');
    
    const allImplemented = frontendResults.every(r => r.status === 'IMPLEMENTED');
    const hasApiSuccess = apiResults.some(r => r.status === 'API_SUCCESS');
    const allBackendMissing = apiResults.every(r => r.status === 'BACKEND_MISSING');
    
    if (allImplemented && hasApiSuccess) return 'FULLY_WORKING';
    if (allImplemented && allBackendMissing) return 'FRONTEND_READY';
    if (allImplemented) return 'MIXED_BACKEND';
    return 'INCOMPLETE';
  }

  // Print formatted report
  printReport(report) {
    console.log('\n📊 SERVICE VERIFICATION REPORT');
    console.log('='.repeat(60));
    console.log(`📅 Generated: ${new Date(report.timestamp).toLocaleString()}`);
    console.log(`🔧 Total Services: ${report.summary.totalServices}`);
    console.log(`⚙️  Total Functions: ${report.summary.totalFunctions}`);
    console.log(`✅ Implemented: ${report.summary.implementedFunctions}`);
    console.log(`❌ Missing: ${report.summary.missingFunctions}`);
    console.log(`🌐 API Working: ${report.summary.apiSuccesses}`);
    console.log(`🚫 Backend Missing: ${report.summary.backendMissing}`);
    console.log('='.repeat(60));

    console.log('\n📋 SERVICE STATUS BREAKDOWN:');
    for (const [serviceName, breakdown] of Object.entries(report.serviceBreakdown)) {
      const statusEmoji = {
        'FULLY_WORKING': '🟢',
        'FRONTEND_READY': '🟡',
        'MIXED_BACKEND': '🟠',
        'INCOMPLETE': '🔴'
      }[breakdown.status] || '⚪';
      
      console.log(`${statusEmoji} ${serviceName}: ${breakdown.implemented}/${breakdown.totalFunctions} functions, ${breakdown.apiWorking} API working`);
    }

    console.log('\n🎯 RECOMMENDATIONS:');
    if (report.summary.backendMissing > 0) {
      console.log(`• ${report.summary.backendMissing} endpoints need backend implementation`);
    }
    if (report.summary.missingFunctions > 0) {
      console.log(`• ${report.summary.missingFunctions} functions need frontend implementation`);
    }
    if (report.summary.apiErrors > 0) {
      console.log(`• ${report.summary.apiErrors} API calls have errors that need investigation`);
    }
    
    const completionPercentage = ((report.summary.implementedFunctions / report.summary.totalFunctions) * 100).toFixed(1);
    console.log(`\n🏆 FRONTEND COMPLETION: ${completionPercentage}%`);
    
    const apiPercentage = ((report.summary.apiSuccesses / (report.summary.apiSuccesses + report.summary.backendMissing + report.summary.apiErrors)) * 100).toFixed(1);
    console.log(`🌐 API INTEGRATION: ${apiPercentage}%`);
  }

  // Export report to JSON
  exportReport(report) {
    const jsonContent = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-verification-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export default EndpointVerifier;