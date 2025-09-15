# API Services

This directory contains all the service files that interact with the Dashboard Avocado Backend API.

## New API Services

All services now use the new RESTful API instead of Airtable:

### Authentication Service (`authService.js`)
- `register(userData)` - Register a new user
- `login(credentials)` - Login user
- `logout()` - Logout user
- `getProfile()` - Get current user profile
- `updateProfile(profileData)` - Update current user profile
- `changePassword(passwordData)` - Change user password

### Users Service (`usersService.js`)
- `listUsers(options)` - Get all users (Admin only)
- `getUser(userId)` - Get user by ID
- `updateUser(userId, userData)` - Update user
- `deleteUser(userId)` - Delete user
- `listFarmers(options)` - Get all farmers
- `listAgents(options)` - Get all agents
- `updateUserStatus(userId, status)` - Update user status
- `updateUserRole(userId, role)` - Update user role

### Products Service (`productsService.js`)
- `listProducts(options)` - Get all products
- `getProduct(productId)` - Get product by ID
- `createProduct(productData)` - Create new product
- `updateProduct(productId, productData)` - Update product
- `deleteProduct(productId)` - Delete product (mark as discontinued)
- `getProductsByCategory(category, options)` - Get products by category
- `updateProductStock(productId, quantity)` - Update product stock

### Orders Service (`ordersService.js`)
- `listOrders(options)` - Get all orders
- `getOrder(orderId)` - Get order by ID
- `createOrder(orderData)` - Create new order
- `updateOrder(orderId, orderData)` - Update order
- `deleteOrder(orderId)` - Delete order
- `updateOrderStatus(orderId, status)` - Update order status
- `getOrdersForUser(userId, options)` - Get orders for a specific user

### Service Requests Service (`serviceRequestsService.js`)
- `listServiceRequests(options)` - Get all service requests
- `getServiceRequest(requestId)` - Get service request by ID
- `createServiceRequest(requestData)` - Create new service request
- `updateServiceRequest(requestId, requestData)` - Update service request
- `deleteServiceRequest(requestId)` - Delete service request
- `assignAgentToServiceRequest(requestId, agentData)` - Assign agent to service request
- `updateServiceRequestStatus(requestId, statusData)` - Update service request status
- `submitServiceRequestFeedback(requestId, feedbackData)` - Submit feedback for completed service request
- `getServiceRequestsForFarmer(farmerId, options)` - Get service requests for a specific farmer
- `getServiceRequestsForAgent(agentId, options)` - Get service requests assigned to a specific agent

### Analytics Service (`analyticsService.js`)
- `getDashboardStatistics()` - Get dashboard statistics
- `getSalesAnalytics(options)` - Get sales analytics
- `getProductAnalytics(options)` - Get product analytics
- `getUserAnalytics(options)` - Get user analytics
- `getMonthlyOrderTrends(options)` - Get monthly order trends

## API Client (`apiClient.js`)

The base API client with JWT authentication handling.

## Removed Services

The following Airtable-based services have been removed:
- `airtable.js`
- `airtableApi.js`
- `agentProfilesService.js`
- `cartService.js`
- `customerProfilesService.js`
- `demoData.js`
- `marketStorageService.js`
- `orderLineItemsService.js`

These services are no longer needed as all data is now managed through the new API.