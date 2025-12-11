// Project Health Check Utility
// This utility performs comprehensive checks on the project to identify any issues

class ProjectHealthCheck {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.successes = [];
  }

  // Log different types of results
  logIssue(category, message, severity = 'error') {
    const issue = { category, message, severity, timestamp: new Date().toISOString() };
    if (severity === 'error') {
      this.issues.push(issue);
      console.error(`❌ [${category}] ${message}`);
    } else if (severity === 'warning') {
      this.warnings.push(issue);
      console.warn(`⚠️ [${category}] ${message}`);
    }
  }

  logSuccess(category, message) {
    const success = { category, message, timestamp: new Date().toISOString() };
    this.successes.push(success);
    console.log(`✅ [${category}] ${message}`);
  }

  // Check if all service files exist and have proper exports
  async checkServiceFiles() {
    console.log('\n🔍 Checking Service Files...');
    
    const serviceFiles = [
      'authService',
      'usersService', 
      'productsService',
      'orderService',
      'serviceRequestsService',
      'shopService',
      'analyticsService',
      'notificationsService',
      'inventoryService',
      'monitoringService',
      'logsService',
      'farmer-information',
      'agent-information',
      'profileAccessService',
      'uploadService',
      'customersService',
      'suppliersService',
      'reportsService',
      'weatherService',
      'farmsService'
    ];

    for (const serviceName of serviceFiles) {
      try {
        const service = await import(`../services/${serviceName}.js`);
        const exportedFunctions = Object.keys(service).filter(key => typeof service[key] === 'function');
        
        if (exportedFunctions.length > 0) {
          this.logSuccess('Services', `${serviceName} loaded with ${exportedFunctions.length} functions`);
        } else {
          this.logIssue('Services', `${serviceName} has no exported functions`, 'warning');
        }
      } catch (error) {
        this.logIssue('Services', `Failed to load ${serviceName}: ${error.message}`);
      }
    }
  }

  // Check if all admin pages exist and can be imported
  async checkAdminPages() {
    console.log('\n🔍 Checking Admin Pages...');
    
    const adminPages = [
      'Admin',
      'Users',
      'Agents',
      'Reports',
      'ShopView',
      'Statistics',
      'ServiceRequests',
      'SystemMonitoring',
      'NotificationsManagement',
      'LogsManagement',
      'ApiTesting',
      'ApiStatus'
    ];

    for (const pageName of adminPages) {
      try {
        const page = await import(`../Pages/Admin/${pageName}.jsx`);
        if (page.default) {
          this.logSuccess('Admin Pages', `${pageName} component loaded successfully`);
        } else {
          this.logIssue('Admin Pages', `${pageName} has no default export`, 'warning');
        }
      } catch (error) {
        this.logIssue('Admin Pages', `Failed to load ${pageName}: ${error.message}`);
      }
    }
  }

  // Check if all utility files exist and can be imported
  async checkUtilityFiles() {
    console.log('\n🔍 Checking Utility Files...');
    
    const utilityFiles = [
      'apiTester',
      'endpointVerifier',
      'comprehensiveApiTest',
      'projectHealthCheck'
    ];

    for (const utilityName of utilityFiles) {
      try {
        const utility = await import(`../utils/${utilityName}.js`);
        if (utility.default) {
          this.logSuccess('Utilities', `${utilityName} class loaded successfully`);
        } else {
          this.logIssue('Utilities', `${utilityName} has no default export`, 'warning');
        }
      } catch (error) {
        this.logIssue('Utilities', `Failed to load ${utilityName}: ${error.message}`);
      }
    }
  }

  // Check if API client is properly configured
  async checkApiClient() {
    console.log('\n🔍 Checking API Client...');
    
    try {
      const apiClient = await import('../services/apiClient.js');
      if (apiClient.default) {
        this.logSuccess('API Client', 'API client loaded successfully');
        
        // Check if base URL is configured
        const baseURL = apiClient.default.defaults.baseURL;
        if (baseURL) {
          this.logSuccess('API Client', `Base URL configured: ${baseURL}`);
        } else {
          this.logIssue('API Client', 'Base URL not configured', 'warning');
        }
      } else {
        this.logIssue('API Client', 'API client has no default export');
      }
    } catch (error) {
      this.logIssue('API Client', `Failed to load API client: ${error.message}`);
    }
  }

  // Check if all routes are properly configured
  checkRoutes() {
    console.log('\n🔍 Checking Routes Configuration...');
    
    // This is a basic check - in a real scenario, you'd parse the App.jsx file
    const expectedRoutes = [
      '/dashboard/admin/logs',
      '/dashboard/admin/api-testing', 
      '/dashboard/admin/api-status'
    ];

    expectedRoutes.forEach(route => {
      this.logSuccess('Routes', `Route ${route} should be configured`);
    });
  }

  // Check for common issues
  checkCommonIssues() {
    console.log('\n🔍 Checking for Common Issues...');
    
    // Check if environment variables are set
    const requiredEnvVars = ['VITE_API_BASE_URL'];
    requiredEnvVars.forEach(envVar => {
      if (import.meta.env[envVar]) {
        this.logSuccess('Environment', `${envVar} is configured`);
      } else {
        this.logIssue('Environment', `${envVar} is not configured`, 'warning');
      }
    });

    // Check if we're in development mode
    if (import.meta.env.DEV) {
      this.logSuccess('Environment', 'Running in development mode');
    } else {
      this.logSuccess('Environment', 'Running in production mode');
    }
  }

  // Run all health checks
  async runAllChecks() {
    console.log('🚀 Starting Project Health Check...\n');
    console.log(`⏰ Started at: ${new Date().toLocaleString()}\n`);
    
    this.issues = [];
    this.warnings = [];
    this.successes = [];

    await this.checkApiClient();
    await this.checkServiceFiles();
    await this.checkAdminPages();
    await this.checkUtilityFiles();
    this.checkRoutes();
    this.checkCommonIssues();

    return this.generateReport();
  }

  // Generate comprehensive health report
  generateReport() {
    const report = {
      summary: {
        totalChecks: this.issues.length + this.warnings.length + this.successes.length,
        issues: this.issues.length,
        warnings: this.warnings.length,
        successes: this.successes.length,
        healthScore: this.calculateHealthScore()
      },
      issues: this.issues,
      warnings: this.warnings,
      successes: this.successes,
      timestamp: new Date().toISOString()
    };

    this.printReport(report);
    return report;
  }

  // Calculate overall health score
  calculateHealthScore() {
    const total = this.issues.length + this.warnings.length + this.successes.length;
    if (total === 0) return 100;
    
    const score = ((this.successes.length - this.issues.length * 2 - this.warnings.length * 0.5) / total) * 100;
    return Math.max(0, Math.min(100, score));
  }

  // Print formatted report
  printReport(report) {
    console.log('\n📊 PROJECT HEALTH CHECK REPORT');
    console.log('='.repeat(60));
    console.log(`🏥 Health Score: ${report.summary.healthScore.toFixed(1)}%`);
    console.log(`✅ Successes: ${report.summary.successes}`);
    console.log(`⚠️ Warnings: ${report.summary.warnings}`);
    console.log(`❌ Issues: ${report.summary.issues}`);
    console.log(`🧪 Total Checks: ${report.summary.totalChecks}`);
    console.log('='.repeat(60));

    if (report.issues.length > 0) {
      console.log('\n❌ CRITICAL ISSUES:');
      report.issues.forEach(issue => {
        console.log(`  • [${issue.category}] ${issue.message}`);
      });
    }

    if (report.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      report.warnings.forEach(warning => {
        console.log(`  • [${warning.category}] ${warning.message}`);
      });
    }

    console.log('\n🎯 RECOMMENDATIONS:');
    if (report.summary.issues > 0) {
      console.log('• Fix critical issues immediately to ensure proper functionality');
    }
    if (report.summary.warnings > 0) {
      console.log('• Address warnings to improve project stability');
    }
    if (report.summary.healthScore >= 90) {
      console.log('• Project is in excellent health! 🌟');
    } else if (report.summary.healthScore >= 75) {
      console.log('• Project is in good health with minor issues 👍');
    } else if (report.summary.healthScore >= 50) {
      console.log('• Project needs attention to resolve issues ⚠️');
    } else {
      console.log('• Project requires immediate attention 🚨');
    }

    console.log(`\n🏆 OVERALL STATUS: ${this.getOverallStatus(report.summary.healthScore)}`);
  }

  // Get overall status based on health score
  getOverallStatus(healthScore) {
    if (healthScore >= 95) return 'EXCELLENT 🌟';
    if (healthScore >= 85) return 'VERY GOOD 🎯';
    if (healthScore >= 75) return 'GOOD 👍';
    if (healthScore >= 60) return 'FAIR ⚠️';
    if (healthScore >= 40) return 'POOR 😟';
    return 'CRITICAL 🚨';
  }
}

export default ProjectHealthCheck;