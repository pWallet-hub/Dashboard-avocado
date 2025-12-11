# Dashboard Avocado Backend API - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [API Endpoints](#api-endpoints)
   - [Welcome & System](#welcome--system)
   - [Authentication](#authentication-endpoints)
   - [User Management](#user-management)
   - [Farmer Information](#farmer-information)
   - [Agent Information](#agent-information)
   - [Profile Access](#profile-access)
   - [Products](#products)
   - [Orders](#orders)
   - [Service Requests](#service-requests)
   - [Shops](#shops)
   - [Inventory](#inventory)
   - [Customers](#customers)
   - [Suppliers](#suppliers)
   - [Reports](#reports)
   - [Farms](#farms)
   - [Weather](#weather)
   - [Analytics](#analytics)
   - [Notifications](#notifications)
   - [Upload](#upload)
   - [Logs](#logs)
   - [Monitoring](#monitoring)

## Overview

The Dashboard Avocado Backend API is a comprehensive agricultural management system that provides endpoints for managing farmers, agents, products, orders, and various agricultural services.

**Base URL:** `https://dash-api-hnyp.onrender.com/api` (development)
**API Version:** Latest
**Environment:** Development/Production

## Authentication

The API uses JWT (JSON Web Token) based authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **admin**: Full system access
- **agent**: Agricultural extension agent
- **farmer**: Farm owner/operator
- **shop_manager**: Shop/store manager

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10,
    "limit": 10
  }
}
```

## Error Handling

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |



## API Endpoints

---

## Welcome & System

### GET /
**Description:** Root endpoint with basic API information
**Access:** Public

**Response:**
```json
{
  "success": true,
  "message": "Welcome to the Dashboard Avocado Backend API",
  "data": {
    "message": "Dashboard Avocado Backend API",
    "version": "1.0.0",
    "documentation": "/api-docs"
  }
}
```

### GET /health
**Description:** Health check endpoint
**Access:** Public

**Response:**
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 3600,
    "memory": {
      "used": 50000000,
      "total": 100000000,
      "percentage": 50
    }
  }
}
```

### GET /api/welcome
**Description:** Welcome endpoint with system overview
**Access:** Public

### GET /api/welcome/stats
**Description:** Detailed system statistics
**Access:** Public

### GET /api-docs
**Description:** API documentation
**Access:** Public

---

## Authentication Endpoints

### POST /api/auth/register
**Description:** Register a new user
**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+250123456789",
  "role": "farmer",
  "profile": {}
}
```

### POST /api/auth/login
**Description:** User login
**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /api/auth/logout
**Description:** User logout
**Access:** Private

### GET /api/auth/profile
**Description:** Get current user profile
**Access:** Private

### PUT /api/auth/profile
**Description:** Update current user profile
**Access:** Private

### PUT /api/auth/password
**Description:** Change user password
**Access:** Private

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### POST /api/auth/refresh
**Description:** Refresh JWT token
**Access:** Private

### GET /api/auth/verify
**Description:** Verify if current token is valid
**Access:** Private

---

## User Management

### GET /api/users
**Description:** Get all users with pagination and filters
**Access:** Private (Admin only)

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `role` (string): Filter by role
- `status` (string): Filter by status
- `search` (string): Search by name or email

### GET /api/users/farmers
**Description:** Get all farmers
**Access:** Private (Admin, Agent)

### POST /api/users/farmers
**Description:** Create new farmer
**Access:** Private (Admin only)

**Request Body:**
```json
{
  "full_name": "John Farmer",
  "email": "farmer@example.com",
  "phone": "+250123456789",
  "gender": "male",
  "age": 35,
  "province": "Eastern",
  "district": "Kayonza",
  "farm_size": 2.5,
  "tree_count": 150
}
```

### GET /api/users/agents
**Description:** Get all agents
**Access:** Private (Admin only)

### POST /api/users/agents
**Description:** Create new agent
**Access:** Private (Admin only)

**Request Body:**
```json
{
  "full_name": "Jane Agent",
  "email": "agent@example.com",
  "phone": "+250123456789",
  "province": "Eastern",
  "district": "Kayonza"
}
```

### GET /api/users/shop-managers
**Description:** Get all shop managers
**Access:** Private (Admin only)

### GET /api/users/me
**Description:** Get current user profile
**Access:** Private

### PUT /api/users/me
**Description:** Update current user profile
**Access:** Private

### GET /api/users/:id
**Description:** Get user by ID
**Access:** Private (Admin or self)

### PUT /api/users/:id
**Description:** Update user
**Access:** Private (Admin or self)

### PUT /api/users/:id/status
**Description:** Update user status
**Access:** Private (Admin only)

**Request Body:**
```json
{
  "status": "active"
}
```

### PUT /api/users/:id/role
**Description:** Update user role
**Access:** Private (Admin only)

**Request Body:**
```json
{
  "role": "agent"
}
```

### DELETE /api/users/:id
**Description:** Delete user
**Access:** Private (Admin only)

---

## Farmer Information

### GET /api/farmer-information
**Description:** Get farmer information and profile
**Access:** Private (Farmers, Agents, Admin)

**Query Parameters:**
- `farmerId` (string): Specific farmer ID (for agents/admin)

### PUT /api/farmer-information
**Description:** Update farmer profile information
**Access:** Private (Farmers, Agents, Admin)

**Request Body:**
```json
{
  "full_name": "Updated Name",
  "age": 35,
  "gender": "male",
  "province": "Eastern",
  "district": "Kayonza",
  "farm_size": 3.0,
  "tree_count": 200,
  "farmerId": "farmer_id_here"
}
```

### POST /api/farmer-information/create
**Description:** Create farmer profile
**Access:** Private (Farmers only)

### PUT /api/farmer-information/tree-count
**Description:** Update tree count
**Access:** Private (Farmers only)

**Request Body:**
```json
{
  "tree_count": 250
}
```

---

## Agent Information

### GET /api/agent-information/test
**Description:** Test endpoint for agent information routes
**Access:** Public

### GET /api/agent-information
**Description:** Get agent information and profile
**Access:** Private (Agents, Admin)

### PUT /api/agent-information
**Description:** Update agent profile information
**Access:** Private (Agents only)

**Request Body:**
```json
{
  "province": "Eastern",
  "territory": [
    {
      "district": "Kayonza",
      "sector": "Kabare",
      "isPrimary": true,
      "assignedDate": "2024-01-01"
    }
  ],
  "specialization": "Avocado farming",
  "experience": "5 years"
}
```

### POST /api/agent-information/create
**Description:** Create agent profile
**Access:** Private (Agents only)

### PUT /api/agent-information/performance
**Description:** Update agent performance metrics
**Access:** Private (Agents only)

**Request Body:**
```json
{
  "statistics": {
    "farmersAssisted": 50,
    "totalTransactions": 100,
    "performance": "85%"
  }
}
```

### POST /api/agent-information/admin/create
**Description:** Create agent profile with full territory (Admin only)
**Access:** Private (Admin only)

### GET /api/agent-information/admin/:userId
**Description:** Get agent profile with full territory details (Admin only)
**Access:** Private (Admin only)

---

## Profile Access

### GET /api/profile-access/qr/:userId
**Description:** Generate QR code for a user
**Access:** Private (Agent, Admin)

### GET /api/profile-access/scan/:token
**Description:** Get user info by scanning QR token
**Access:** Public

### PUT /api/profile-access/scan/:token
**Description:** Update user info by scanning QR token
**Access:** Private (Agent, Admin)

### POST /api/profile-access/bulk-import
**Description:** Import users from Excel/JSON and generate access keys
**Access:** Private (Admin only)

**Request Body:** Multipart form with file upload or JSON array

### POST /api/profile-access/verify-access-key
**Description:** Verify access key and get user info
**Access:** Public

**Request Body:**
```json
{
  "access_key": "XXXX-XXXX-XXXX"
}
```

### PUT /api/profile-access/update-profile
**Description:** Update user profile using access key
**Access:** Public

**Request Body:**
```json
{
  "access_key": "XXXX-XXXX-XXXX",
  "profile_data": {
    "full_name": "Updated Name",
    "phone": "+250123456789"
  }
}
```

### GET /api/profile-access/generate-qr/:userId
**Description:** Generate QR code containing access key for a user
**Access:** Private (Agent, Admin)

---

## Products

### GET /api/products
**Description:** Get all products with filters and pagination
**Access:** Public

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `category` (string): Filter by category (irrigation, harvesting, containers, pest-management)
- `supplier_id` (string): Filter by supplier
- `status` (string): Filter by status
- `price_min` (number): Minimum price filter
- `price_max` (number): Maximum price filter
- `in_stock` (boolean): Filter by stock availability
- `search` (string): Search by name, description, or brand

### GET /api/products/:id
**Description:** Get product by ID
**Access:** Public

### POST /api/products
**Description:** Create new product
**Access:** Private (Admin, Shop Manager, Agent)

**Request Body:**
```json
{
  "name": "Irrigation System",
  "description": "Advanced drip irrigation system",
  "price": 150000,
  "category": "irrigation",
  "quantity": 50,
  "supplier_id": "supplier123",
  "brand": "AgroTech",
  "specifications": {
    "coverage": "1 hectare",
    "material": "PVC"
  }
}
```

### PUT /api/products/:id
**Description:** Update product
**Access:** Private (Admin, Shop Manager, Agent)

### DELETE /api/products/:id
**Description:** Delete product (mark as discontinued)
**Access:** Private (Admin only)

### PUT /api/products/:id/stock
**Description:** Update product stock
**Access:** Private (Admin, Shop Manager, Agent)

**Request Body:**
```json
{
  "quantity": 75,
  "reason": "restock",
  "notes": "New shipment received"
}
```

### GET /api/products/:id/stock-history
**Description:** Get product stock history
**Access:** Private (Admin, Shop Manager)

---

## Orders

### GET /api/orders
**Description:** Get all orders
**Access:** Private (Admin, Shop Manager)

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `customer_id` (string): Filter by customer
- `status` (string): Filter by status
- `payment_status` (string): Filter by payment status
- `date_from` (string): Start date filter
- `date_to` (string): End date filter
- `amount_min` (number): Minimum amount filter
- `amount_max` (number): Maximum amount filter
- `search` (string): Search by order number

### GET /api/orders/:id
**Description:** Get order by ID
**Access:** Private (Admin, Shop Manager, Order owner)

### POST /api/orders
**Description:** Create new order
**Access:** Private (All authenticated users)

**Request Body:**
```json
{
  "items": [
    {
      "product_id": "product123",
      "quantity": 2,
      "specifications": {}
    }
  ],
  "shipping_address": {
    "street": "123 Main St",
    "city": "Kigali",
    "province": "Kigali City"
  },
  "payment_method": "cash",
  "notes": "Urgent delivery"
}
```

### PUT /api/orders/:id
**Description:** Update order
**Access:** Private (Admin, Shop Manager)

### DELETE /api/orders/:id
**Description:** Delete order
**Access:** Private (Admin only)

### PUT /api/orders/:id/status
**Description:** Update order status
**Access:** Private (Admin, Shop Manager)

**Request Body:**
```json
{
  "status": "confirmed"
}
```

### GET /api/orders/user/:userId
**Description:** Get orders for a specific user
**Access:** Private (Admin, Shop Manager, User themselves)

---

## Service Requests

### POST /api/service-requests/pest-management
**Description:** Create pest management request
**Access:** Private (Farmers only)

**Request Body:**
```json
{
  "service_type": "pest_control",
  "title": "Pest Control Request",
  "description": "Need help with aphid infestation",
  "location": {
    "province": "Eastern",
    "district": "Kayonza"
  },
  "pest_management_details": {
    "pests_diseases": [
      {
        "name": "Aphids",
        "first_spotted_date": "2024-01-01"
      }
    ],
    "first_noticed": "Last week",
    "damage_observed": "high",
    "damage_details": "Leaves turning yellow",
    "control_methods_tried": "Organic spray",
    "severity_level": "high"
  },
  "farmer_info": {
    "name": "John Farmer",
    "phone": "+250123456789",
    "location": "Kayonza, Eastern"
  }
}
```

### GET /api/service-requests/pest-management
**Description:** Get all pest management requests
**Access:** Private

### POST /api/service-requests/property-evaluation
**Description:** Create property evaluation request
**Access:** Private (Farmers only)

**Request Body:**
```json
{
  "irrigationSource": "Yes",
  "irrigationTiming": "This Coming Season",
  "soilTesting": "Need soil pH testing",
  "visitStartDate": "2024-02-01",
  "visitEndDate": "2024-02-05",
  "evaluationPurpose": "Irrigation system planning",
  "location": {
    "province": "Eastern",
    "district": "Kayonza"
  }
}
```

### GET /api/service-requests/property-evaluation
**Description:** Get all property evaluation requests
**Access:** Private

### POST /api/service-requests/harvest
**Description:** Create harvest request
**Access:** Private (Farmers, Agents)

**Request Body:**
```json
{
  "workersNeeded": 10,
  "equipmentNeeded": ["ladders", "baskets"],
  "treesToHarvest": 50,
  "harvestDateFrom": "2024-03-01",
  "harvestDateTo": "2024-03-03",
  "location": {
    "province": "Eastern",
    "district": "Kayonza"
  },
  "farmer_id": "farmer123"
}
```

### GET /api/service-requests/harvest
**Description:** Get all harvest requests
**Access:** Private

### GET /api/service-requests/harvest/agent/me
**Description:** Get harvest requests created by authenticated agent
**Access:** Private (Agents only)

### PUT /api/service-requests/:id/approve-pest-management
**Description:** Approve pest management request
**Access:** Private (Admin only)

### PUT /api/service-requests/:id/approve-property-evaluation
**Description:** Approve property evaluation request
**Access:** Private (Admin only)

### PUT /api/service-requests/:id/approve-harvest
**Description:** Approve harvest request
**Access:** Private (Admin only)

### PUT /api/service-requests/:id/complete-harvest
**Description:** Complete harvest request
**Access:** Private (Admin, Agent)

---

## Shops

### POST /api/shops/addshop
**Description:** Create a new shop
**Access:** Private (Admin only)

**Request Body:**
```json
{
  "shopName": "AgroSupply Store",
  "description": "Agricultural supplies and equipment",
  "province": "Eastern",
  "district": "Kayonza",
  "ownerName": "Jane Smith",
  "ownerEmail": "jane@agrosupply.com",
  "ownerPhone": "+250123456789"
}
```

### GET /api/shops
**Description:** Get all shops
**Access:** Private (Admin, Shop Manager)

### GET /api/shops/:id
**Description:** Get shop by ID
**Access:** Private (Admin, Shop Manager)

### PUT /api/shops/:id
**Description:** Update shop
**Access:** Private (Admin, Shop Manager)

### DELETE /api/shops/:id
**Description:** Delete shop
**Access:** Private (Admin, Shop Manager)

### GET /api/shops/:id/inventory
**Description:** Get shop inventory
**Access:** Private (Admin, Shop Manager)

### GET /api/shops/:id/orders
**Description:** Get orders from specific shop
**Access:** Private (Admin, Shop Manager)

### GET /api/shops/:id/analytics
**Description:** Get shop analytics
**Access:** Private (Admin, Shop Manager)

---

## Inventory

### GET /api/inventory
**Description:** Get all inventory
**Access:** Private (Admin)

### GET /api/inventory/low-stock
**Description:** Get low stock items
**Access:** Private (Admin, Shop Manager)

**Query Parameters:**
- `threshold` (number): Stock threshold (default: 10)
- `shopId` (string): Filter by shop

### GET /api/inventory/out-of-stock
**Description:** Get out of stock items
**Access:** Private (Admin, Shop Manager)

### POST /api/inventory/stock-adjustment
**Description:** Adjust stock levels
**Access:** Private (Admin, Shop Manager)

**Request Body:**
```json
{
  "productId": "product123",
  "quantity": 10,
  "reason": "adjustment",
  "notes": "Manual stock correction"
}
```

### GET /api/inventory/valuation
**Description:** Get inventory valuation
**Access:** Private (Admin, Shop Manager)

---

## Customers

### GET /api/customers
**Description:** Get all customers
**Access:** Private (Admin, Shop Manager)

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `shop_id` (string): Filter by shop
- `status` (string): Filter by status
- `search` (string): Search by name, email, or phone

### GET /api/customers/:id
**Description:** Get customer by ID
**Access:** Private (Admin, Shop Manager)

### POST /api/customers
**Description:** Create new customer
**Access:** Private (Admin, Shop Manager)

**Request Body:**
```json
{
  "name": "John Customer",
  "email": "customer@example.com",
  "phone": "+250123456789",
  "shop_id": "shop123",
  "address": {
    "street": "123 Main St",
    "city": "Kigali"
  }
}
```

### PUT /api/customers/:id
**Description:** Update customer
**Access:** Private (Admin, Shop Manager)

### DELETE /api/customers/:id
**Description:** Delete customer
**Access:** Private (Admin only)

### GET /api/customers/:id/orders
**Description:** Get customer orders
**Access:** Private (Admin, Shop Manager)

### GET /api/customers/:id/statistics
**Description:** Get customer statistics
**Access:** Private (Admin, Shop Manager)

### GET /api/customers/search
**Description:** Search customers
**Access:** Private (Admin, Shop Manager)

---

## Suppliers

### GET /api/suppliers
**Description:** Get all suppliers
**Access:** Private (Admin, Shop Manager)

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `province` (string): Filter by province
- `district` (string): Filter by district
- `status` (string): Filter by status
- `search` (string): Search by name, contact person, or email

### GET /api/suppliers/:id
**Description:** Get supplier by ID
**Access:** Private (Admin, Shop Manager)

### POST /api/suppliers
**Description:** Create new supplier
**Access:** Private (Admin only)

**Request Body:**
```json
{
  "name": "AgroSupplier Ltd",
  "contact_person": "Jane Doe",
  "email": "contact@agrosupplier.com",
  "phone": "+250123456789",
  "address": {
    "province": "Eastern",
    "district": "Kayonza",
    "street": "Industrial Area"
  }
}
```

### PUT /api/suppliers/:id
**Description:** Update supplier
**Access:** Private (Admin only)

### DELETE /api/suppliers/:id
**Description:** Delete supplier
**Access:** Private (Admin only)

### GET /api/suppliers/:id/products
**Description:** Get products from specific supplier
**Access:** Private (Admin, Shop Manager)

### GET /api/suppliers/:id/orders
**Description:** Get orders from specific supplier
**Access:** Private (Admin, Shop Manager)

### GET /api/suppliers/by-location
**Description:** Get suppliers by location
**Access:** Private (Admin, Shop Manager)

---

## Reports

### GET /api/reports
**Description:** Get all reports
**Access:** Private (Admin, Agent)

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `agent_id` (string): Filter by agent
- `report_type` (string): Filter by report type
- `status` (string): Filter by status
- `date_from` (string): Start date filter
- `date_to` (string): End date filter

### GET /api/reports/:id
**Description:** Get report by ID
**Access:** Private (Admin, Agent - own reports)

### POST /api/reports
**Description:** Create new report
**Access:** Private (Admin, Agent)

**Request Body:**
```json
{
  "report_type": "farm_visit",
  "title": "Farm Visit Report",
  "description": "Monthly farm inspection",
  "farmer_id": "farmer123",
  "scheduled_date": "2024-02-01",
  "status": "pending"
}
```

### PUT /api/reports/:id
**Description:** Update report
**Access:** Private (Admin, Agent - own reports)

### DELETE /api/reports/:id
**Description:** Delete report
**Access:** Private (Admin only)

### POST /api/reports/:id/attachments
**Description:** Upload report attachments
**Access:** Private (Admin, Agent - own reports)

### GET /api/reports/statistics
**Description:** Get report statistics
**Access:** Private (Admin, Agent)

---

## Farms

### GET /api/farms
**Description:** Get all farms
**Access:** Private (Admin, Agent)

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `crop_type` (string): Filter by crop type
- `province` (string): Filter by province
- `district` (string): Filter by district
- `sector` (string): Filter by sector
- `status` (string): Filter by status

### GET /api/farms/:id
**Description:** Get farm by ID
**Access:** Private (Admin, Agent, Farmer - own farm)

### GET /api/farms/:id/details
**Description:** Get detailed farm information
**Access:** Private (Admin, Agent, Farmer - own farm)

### GET /api/farms/:id/harvest-schedule
**Description:** Get farm harvest schedule
**Access:** Private (Admin, Agent, Farmer - own farm)

### POST /api/farms/:id/purchase-orders
**Description:** Create purchase order from farm
**Access:** Private (Admin, Agent)

**Request Body:**
```json
{
  "quantity": 1000,
  "variety": "Hass",
  "price_per_kg": 500,
  "delivery_date": "2024-03-01",
  "buyer_info": {
    "name": "Export Company",
    "contact": "+250123456789"
  }
}
```

### GET /api/farms/by-location
**Description:** Get farms by location
**Access:** Private (Admin, Agent)

### GET /api/farms/harvest-ready
**Description:** Get farms ready for harvest
**Access:** Private (Admin, Agent)

### GET /api/farms/:id/production-stats
**Description:** Get farm production statistics
**Access:** Private (Admin, Agent, Farmer - own farm)

### GET /api/farms/overview
**Description:** Get farms overview/summary
**Access:** Private (Admin, Agent)

### POST /api/farms
**Description:** Create new farm
**Access:** Private (Admin, Agent)

**Request Body:**
```json
{
  "farmName": "Green Valley Farm",
  "farmer_id": "farmer123",
  "location": {
    "province": "Eastern",
    "district": "Kayonza",
    "sector": "Kabare"
  },
  "crop_type": "avocado",
  "farm_size": 5.0,
  "tree_count": 300
}
```

### PUT /api/farms/:id
**Description:** Update farm
**Access:** Private (Admin, Agent, Farmer - own farm)

### DELETE /api/farms/:id
**Description:** Delete farm
**Access:** Private (Admin only)

---

## Weather

### GET /api/weather/current
**Description:** Get current weather for location
**Access:** Private

**Query Parameters:**
- `location` (string): Location name (required)

### GET /api/weather/forecast
**Description:** Get weather forecast
**Access:** Private

**Query Parameters:**
- `location` (string): Location name (required)
- `days` (number): Number of days (default: 7)

### GET /api/weather/farm-conditions
**Description:** Get farm-specific weather conditions
**Access:** Private

**Query Parameters:**
- `farm_id` (string): Farm ID (required)

### POST /api/weather/multi-location
**Description:** Get weather for multiple locations
**Access:** Private

**Request Body:**
```json
{
  "locations": ["Kigali", "Huye", "Musanze"]
}
```

---

## Analytics

### GET /api/analytics/dashboard
**Description:** Get dashboard statistics
**Access:** Private (Admin, Shop Manager)

### GET /api/analytics/sales
**Description:** Get sales analytics
**Access:** Private (Admin, Shop Manager)

**Query Parameters:**
- `start_date` (string): Start date
- `end_date` (string): End date

### GET /api/analytics/products
**Description:** Get product analytics
**Access:** Private (Admin, Shop Manager)

### GET /api/analytics/users
**Description:** Get user analytics
**Access:** Private (Admin only)

### GET /api/analytics/orders/monthly
**Description:** Get monthly order trends
**Access:** Private (Admin, Shop Manager)

---

## Notifications

### GET /api/notifications
**Description:** Get user notifications
**Access:** Private

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page

### GET /api/notifications/unread-count
**Description:** Get unread notification count
**Access:** Private

### GET /api/notifications/:id
**Description:** Get notification by ID
**Access:** Private

### PUT /api/notifications/:id/read
**Description:** Mark notification as read
**Access:** Private

### PUT /api/notifications/read-all
**Description:** Mark all notifications as read
**Access:** Private

### DELETE /api/notifications/:id
**Description:** Delete notification
**Access:** Private

### POST /api/notifications
**Description:** Create notification (Admin only)
**Access:** Private (Admin only)

**Request Body:**
```json
{
  "recipient_id": "user123",
  "title": "New Message",
  "message": "You have a new message",
  "type": "info"
}
```

---

## Upload

### POST /api/upload
**Description:** Upload a single file
**Access:** Private

**Request:** Multipart form with `file` field

### POST /api/upload/multiple
**Description:** Upload multiple files (max 5)
**Access:** Private

**Request:** Multipart form with `files` field

---

## Logs

### GET /api/logs
**Description:** Get system logs
**Access:** Private (Admin only)

**Query Parameters:**
- `level` (string): Filter by log level
- `limit` (number): Number of logs to return
- `page` (number): Page number

### GET /api/logs/export
**Description:** Export logs to CSV
**Access:** Private (Admin only)

**Query Parameters:**
- `level` (string): Filter by log level
- `start_date` (string): Start date
- `end_date` (string): End date
- `format` (string): Export format (csv)

### DELETE /api/logs/cleanup
**Description:** Clean up old log entries
**Access:** Private (Admin only)

**Request Body:**
```json
{
  "older_than_days": 30
}
```

### GET /api/logs/statistics
**Description:** Get log statistics
**Access:** Private (Admin only)

---

## Monitoring

### GET /api/monitoring/usage
**Description:** Get system usage statistics
**Access:** Private (Admin only)

**Query Parameters:**
- `period` (string): Time period (24h, 7d, 30d)

### GET /api/monitoring/activity
**Description:** Get recent system activity feed
**Access:** Private (Admin only)

**Query Parameters:**
- `limit` (number): Number of activities to return

### GET /api/monitoring/health
**Description:** Comprehensive health check
**Access:** Public

### GET /api/monitoring/metrics
**Description:** Get detailed system metrics
**Access:** Private (Admin only)

### POST /api/monitoring/cleanup
**Description:** Clean up expired access keys and old logs
**Access:** Private (Admin only)

---

## Data Models

### User
```json
{
  "id": "string",
  "email": "string",
  "full_name": "string",
  "phone": "string",
  "role": "admin|agent|farmer|shop_manager",
  "status": "active|inactive",
  "profile": {},
  "created_at": "date",
  "updated_at": "date"
}
```

### Product
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": "number",
  "category": "irrigation|harvesting|containers|pest-management",
  "quantity": "number",
  "status": "available|out_of_stock|discontinued",
  "supplier_id": "string",
  "brand": "string",
  "specifications": {},
  "created_at": "date",
  "updated_at": "date"
}
```

### Order
```json
{
  "id": "string",
  "customer_id": "string",
  "order_number": "string",
  "items": [
    {
      "product_id": "string",
      "product_name": "string",
      "quantity": "number",
      "unit_price": "number",
      "total_price": "number"
    }
  ],
  "subtotal": "number",
  "tax_amount": "number",
  "shipping_cost": "number",
  "total_amount": "number",
  "status": "pending|confirmed|processing|shipped|delivered|cancelled",
  "payment_method": "string",
  "shipping_address": {},
  "created_at": "date",
  "updated_at": "date"
}
```

### Service Request
```json
{
  "id": "string",
  "farmer_id": "string",
  "agent_id": "string",
  "service_type": "pest_control|harvest|other",
  "title": "string",
  "description": "string",
  "request_number": "string",
  "status": "pending|approved|in_progress|completed|cancelled",
  "priority": "low|medium|high|urgent",
  "location": {},
  "created_at": "date",
  "updated_at": "date"
}
```

---




This documentation covers all available endpoints in the Dashboard Avocado Backend API. Each endpoint includes the HTTP method, description, access requirements, and request/response examples where applicable.