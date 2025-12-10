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

### Inventory Service (`inventoryService.js`)
- `listInventory(options)` - Get all inventory items
- `getLowStockItems(options)` - Get low stock items
- `getOutOfStockItems(options)` - Get out of stock items
- `adjustStock(adjustmentData)` - Adjust stock levels
- `getInventoryValuation(options)` - Get inventory valuation

### Profile Access Service (`profileAccessService.js`)
- `generateQRCode(userId)` - Generate QR code for user (Agent/Admin)
- `getUserByQRToken(token)` - Get user info by QR token (Public)
- `updateUserViaQR(token, userData)` - Update user via QR scan (Agent/Admin)
- `importUsersFromExcel(file)` - Import users from Excel (Admin)

### Notifications Service (`notificationsService.js`)
- `listNotifications(options)` - List notifications with pagination
- `getNotification(notificationId)` - Get notification by ID
- `getUnreadCount()` - Get unread notifications count
- `markAsRead(notificationId)` - Mark notification as read
- `markAllAsRead()` - Mark all notifications as read
- `deleteNotification(notificationId)` - Delete notification
- `createNotification(notificationData)` - Create notification (Admin)

### Upload Service (`uploadService.js`)
- `uploadSingle(file)` - Upload single file
- `uploadMultiple(files)` - Upload multiple files (max 5)

### System Logs Service (`logsService.js`)
- `getSystemLogs(options)` - View system logs (Admin only)

### System Monitoring Service (`monitoringService.js`)
- `getSystemUsage(period)` - Get system usage statistics (Admin only)
- `getSystemActivity(options)` - Get recent system activity (Admin only)

### Shop Service (`shopService.js`)
- `createShop(shopData)` - Create new shop (Admin)
- `getAllShops()` - Get all shops
- `getShopById(id)` - Get shop by ID
- `updateShop(id, updateData)` - Update shop
- `deleteShop(id)` - Delete shop
- `getShopInventory(shopId, options)` - Get shop's inventory
- `getShopOrders(shopId, options)` - Get shop's orders
- `getShopAnalytics(shopId)` - Get shop analytics

### Farmer Information Service (`farmer-information.js`)
- `getFarmerInformation()` - Get complete farmer information
- `updateFarmerInformation(updateData)` - Update farmer profile
- `createFarmerProfile(profileData)` - Create new farmer profile
- `updateTreeCount(treeCount)` - Update tree count only

### Agent Information Service (`agent-information.js`)
- `getAgentInformation()` - Get agent profile information
- `createAgentProfile(profileData)` - Create agent profile
- `updateAgentInformation(updateData)` - Update agent profile
- `updateAgentPerformance(metricsData)` - Update agent performance metrics

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