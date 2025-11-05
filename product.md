1. Create Product
Create a new product in the system.
Endpoint: POST /api/products
Request Body:
```json
{
  "name": "Drip Irrigation System",
  "category": "irrigation",
  "description": "Complete drip irrigation kit for small to medium farms",
  "price": 250.00,
  "quantity": 50,
  "unit": "piece",
  "supplier_id": "SUP123456",
  "status": "available",
  "harvest_date": "2024-01-15T00:00:00Z",
  "expiry_date": "2026-12-31T00:00:00Z",
  "sku": "IRR-DRI-123456",
  "brand": "AgroFlow",
  "images": [
    "https://example.com/images/product1.jpg"
  ],
  "specifications": {
    "coverage": "1 hectare",
    "material": "UV-resistant plastic",
    "warranty": "2 years"
  }
}
```

Required Fields:

name (string, 2-200 chars)
category (enum: "irrigation", "harvesting", "containers", "pest-management")
price (number, ≥ 0)
quantity (integer, ≥ 0)
unit (enum: "kg", "g", "lb", "oz", "ton", "liter", "ml", "gallon", "piece", "dozen", "box", "bag", "bottle", "can", "packet")
supplier_id (string)

Optional Fields:

description (string, max 1000 chars)
status (enum: "available", "out_of_stock", "discontinued", default: "available")
harvest_date (date, must be in past)
expiry_date (date, must be in future)
sku (string, unique, auto-generated if not provided)
brand (string, max 100 chars)
images (array of valid URLs)
specifications (object, flexible schema)

Response: 201 Created
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Drip Irrigation System",
    "category": "irrigation",
    "description": "Complete drip irrigation kit for small to medium farms",
    "price": 250.00,
    "quantity": 50,
    "unit": "piece",
    "supplier_id": "SUP123456",
    "status": "available",
    "sku": "IRR-DRI-123456",
    "brand": "AgroFlow",
    "images": ["https://example.com/images/product1.jpg"],
    "specifications": {
      "coverage": "1 hectare",
      "material": "UV-resistant plastic",
      "warranty": "2 years"
    },
    "totalValue": 12500.00,
    "stockStatus": "In Stock",
    "created_at": "2025-09-29T10:00:00Z",
    "updated_at": "2025-09-29T10:00:00Z"
  }
}
```
2. Get All Products
Retrieve a list of all products with optional filtering and pagination.
Endpoint: GET /api/products
Query Parameters:

page (number, default: 1) - Page number
limit (number, default: 20, max: 100) - Items per page
category (string) - Filter by category
status (string) - Filter by status
supplier_id (string) - Filter by supplier
min_price (number) - Minimum price filter
max_price (number) - Maximum price filter
sort (string) - Sort field (e.g., "price", "-created_at")

Example Request:
GET /api/products?category=irrigation&status=available&page=1&limit=20&sort=-created_at
Response: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Drip Irrigation System",
      "category": "irrigation",
      "price": 250.00,
      "quantity": 50,
      "unit": "piece",
      "status": "available",
      "stockStatus": "In Stock",
      "created_at": "2025-09-29T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

3. Get Product by ID
Retrieve detailed information about a specific product.
Endpoint: GET /api/products/:id
Response: 200 OK

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Drip Irrigation System",
    "category": "irrigation",
    "description": "Complete drip irrigation kit for small to medium farms",
    "price": 250.00,
    "quantity": 50,
    "unit": "piece",
    "supplier_id": "SUP123456",
    "status": "available",
    "sku": "IRR-DRI-123456",
    "brand": "AgroFlow",
    "images": ["https://example.com/images/product1.jpg"],
    "specifications": {
      "coverage": "1 hectare",
      "material": "UV-resistant plastic",
      "warranty": "2 years"
    },
    "totalValue": 12500.00,
    "stockStatus": "In Stock",
    "created_at": "2025-09-29T10:00:00Z",
    "updated_at": "2025-09-29T10:00:00Z"
  }
}
```
4. Update Product
Update an existing product's information.
Endpoint: PUT /api/products/:id or PATCH /api/products/:id
Request Body: (all fields optional)
```json
{
  "name": "Advanced Drip Irrigation System",
  "price": 275.00,
  "quantity": 45,
  "description": "Updated description",
  "status": "available"
}
Response:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Advanced Drip Irrigation System",
    "price": 275.00,
    "quantity": 45,
    "updated_at": "2025-09-29T11:00:00Z"
  }
}

5. Delete Product
Delete a product from the system.
Endpoint: DELETE /api/products/:id
Response: 
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```



<!-- farmer information endpoint -->

Farmer Information API Documentation

2. Get Farmer Information
GET /api/farmer-information/
Retrieves complete farmer information including user details and farmer profile.
Headers

Authorization: Bearer <token> (required)

Success Response (200 OK)
```json
{
    "success": true,
    "message": "Farmer information retrieved successfully",
    "data": {
        "farmer_id": "68c7f1cf8b4e787b3dc4946d",
        "user_info": {
            "id": "68c7f1cf8b4e787b3dc4946d",
            "email": "pacific3@gmail.com",
            "full_name": "John Farmer",
            "phone": "+250123456789",
            "status": "active",
            "created_at": "2025-09-15T11:00:31.518Z",
            "updated_at": "2025-10-23T17:56:38.177Z"
        },
        "farmer_profile": {
            "age": 35,
            "gender": "Male",
            "marital_status": "Married",
            "education_level": "Secondary",
            "province": "Eastern",
            "district": "Nyagatare",
            "avocado_type": "Hass",
            "farm_size": 2.5,
            "tree_count": 150,
            "assistance": [],
            "image": null
        }
    },
    "meta": {
        "timestamp": "2025-10-23T19:10:26.077Z",
        "version": "1.0.0"
    }
}
```
Error Responses

401 Unauthorized: User ID not found in token
403 Forbidden: User is not a farmer
404 Not Found: User not found
500 Internal Server Error: Server error

3. Update Farmer Information
PUT /api/farmer-information/
Updates farmer profile information. Creates profile if it doesn't exist (upsert).
Headers

Authorization: Bearer <token> (required)
Content-Type: application/json

Request Body
All fields are optional. Only include fields you want to update.

```json
{
  "age": 35,
  "id_number": "123456789",
  "gender": "male",
  "marital_status": "married",
  "education_level": "secondary",
  "province": "Northern Province",
  "district": "Gakenke",
  "sector": "Ruli",
  "cell": "Mugandu",
  "village": "Nyange",
  "farm_age": 5,
  "planted": "2020-03-15",
  "avocado_type": "Hass",
  "mixed_percentage": 20,
  "farm_size": 2.5,
  "tree_count": 150,
  "upi_number": "UPI123456",
  "farm_province": "Northern Province",
  "farm_district": "Gakenke",
  "farm_sector": "Ruli",
  "farm_cell": "Mugandu",
  "farm_village": "Nyange",
  "assistance": ["irrigation", "fertilizers"],
  "image": "https://example.com/farm-image.jpg"
}
```
Field Descriptions
User Information:

full_name (string): Farmer's full name
phone (string): Phone number
email (string): Email address

Personal Information:

age (number): Age in years
id_number (string): National ID number
gender (string): Gender (e.g., "male", "female")
marital_status (string): Marital status
education_level (string): Education level

Personal Location:

province (string): Province of residence
district (string): District of residence
sector (string): Sector of residence
cell (string): Cell of residence
village (string): Village of residence

Farm Information:

farm_age (number): Age of farm in years
planted (string): Year planted
avocado_type (string): Type of avocado
mixed_percentage (number): Percentage mixed (0-100)
farm_size (number): Farm size in hectares
tree_count (number): Number of trees
upi_number (string): UPI identification number

Farm Location:

farm_province (string): Province where farm is located
farm_district (string): District where farm is located
farm_sector (string): Sector where farm is located
farm_cell (string): Cell where farm is located
farm_village (string): Village where farm is located

Additional Fields:

assistance (array): Array of assistance types received
image (string): URL or path to farmer/farm image

Success Response (200 OK)
Returns the updated farmer information in the same format as GET endpoint.
Error Responses

401 Unauthorized: User ID not found in token
403 Forbidden: User is not a farmer
404 Not Found: User not found
500 Internal Server Error: Server error

. Create Farmer Profile
POST /api/farmer-information/create
Creates a new farmer profile. Use this for first-time profile creation. Returns error if profile already exists.
Headers

Authorization: Bearer <token> (required)
Content-Type: application/json

Request Body
Same fields as the PUT endpoint. All fields are optional.

```json
{
  "age": 35,
  "id_number": "1198012345678901",
  "gender": "male",
  "farm_size": 2.5,
  "tree_count": 150
}
```
5. Update Tree Count
PUT /api/farmer-information/tree-count
Quick update endpoint specifically for updating tree count. Creates profile if it doesn't exist.
Headers

Authorization: Bearer <token> (required)
Content-Type: application/json

Request Body
```json
{
  "tree_count": 150
}
```
Parameters

tree_count (number, required): Number of trees (must be >= 0)

Success Response (200 OK)
Returns the updated farmer information with the new tree count.
Error Responses

400 Bad Request: Invalid tree count (missing, negative, or not a number)
401 Unauthorized: User ID not found in token
403 Forbidden: User is not a farmer
404 Not Found: User not found
500 Internal Server Error: Server error

# Agent Product Access Documentation

## Overview
This document describes the product management permissions granted to agents in the Dashboard Avocado Backend API. Agents now have the ability to create, read, update, and manage product inventory alongside admins and shop managers.

## Base URL
```
http://localhost:5000/api/products
```

---

## Agent Product Permissions

### Summary Table

| Endpoint | Method | Agent Access | Authentication Required | Other Roles |
|----------|--------|--------------|------------------------|-------------|
| `/api/products` | GET | ✅ Yes (Public) | No | All users |
| `/api/products/:id` | GET | ✅ Yes (Public) | No | All users |
| `/api/products` | POST | ✅ Yes | Yes | admin, shop_manager |
| `/api/products/:id` | PUT | ✅ Yes | Yes | admin, shop_manager |
| `/api/products/:id/stock` | PUT | ✅ Yes | Yes | admin, shop_manager |
| `/api/products/:id` | DELETE | ❌ No | Yes | admin only |

---

## Available Endpoints for Agents

### 1. Get All Products (Public)
**No authentication required** - Agents can browse all products without logging in.

**Endpoint**: `GET /api/products`

**Query Parameters**:
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Items per page (default: 20)
- `category` (string): Filter by category (irrigation, harvesting, containers, pest-management)
- `supplier_id` (string): Filter by supplier ID
- `status` (string): Filter by status (available, out_of_stock, discontinued)
- `price_min` (number): Minimum price filter
- `price_max` (number): Maximum price filter
- `in_stock` (boolean): Filter in-stock items only
- `search` (string): Search by name, description, or brand

**Example Request**:
```bash
curl -X GET "http://localhost:5000/api/products?category=irrigation&in_stock=true&page=1&limit=20"
```

**Response**:
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": "673a1b2c3d4e5f6789abcdef",
      "name": "Drip Irrigation System",
      "category": "irrigation",
      "description": "High-efficiency drip irrigation for avocado farms",
      "price": 45000,
      "quantity": 25,
      "unit": "set",
      "status": "available",
      "brand": "AgroFlow",
      "images": ["https://example.com/images/drip-irrigation.jpg"]
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_items": 45,
    "items_per_page": 20,
    "has_next": true,
    "has_previous": false
  },
  "meta": {
    "timestamp": "2024-11-05T10:45:00Z",
    "version": "1.0.0"
  }
}
```

---

### 2. Get Single Product (Public)
**No authentication required** - View detailed product information.

**Endpoint**: `GET /api/products/:id`

**Example Request**:
```bash
curl -X GET http://localhost:5000/api/products/673a1b2c3d4e5f6789abcdef
```

**Response**:
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": "673a1b2c3d4e5f6789abcdef",
    "name": "Drip Irrigation System",
    "category": "irrigation",
    "description": "High-efficiency drip irrigation for avocado farms",
    "price": 45000,
    "quantity": 25,
    "unit": "set",
    "supplier_id": "SUP12345",
    "status": "available",
    "harvest_date": null,
    "expiry_date": null,
    "sku": "IRR-DRIP-001",
    "brand": "AgroFlow",
    "images": ["https://example.com/images/drip-irrigation.jpg"],
    "specifications": {
      "coverage": "1 hectare",
      "material": "UV-resistant plastic",
      "warranty": "2 years"
    },
    "created_at": "2024-01-15T08:30:00Z",
    "updated_at": "2024-11-05T10:45:00Z"
  },
  "meta": {
    "timestamp": "2024-11-05T10:45:00Z",
    "version": "1.0.0"
  }
}
```

---

### 3. Create Product (Agent Access Granted) ✅

**Endpoint**: `POST /api/products`

**Authentication**: Required (JWT Token)

**Authorized Roles**: `admin`, `shop_manager`, `agent`

**Headers**:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Request Body**:
```json
{
  "name": "Fruit Tree Harvesting Clippers",
  "category": "harvesting",
  "description": "Professional grade harvesting clippers for avocado trees",
  "price": 15000,
  "quantity": 60,
  "unit": "piece",
  "supplier_id": "SUP56457",
  "status": "available",
  "harvest_date": null,
  "expiry_date": null,
  "sku": "HARV-CLIP-001",
  "brand": "FarmTools Pro",
  "images": [
    "https://example.com/images/clippers.jpg"
  ],
  "specifications": {
    "blade_material": "Stainless steel",
    "handle_length": "25cm",
    "warranty": "1 year"
  }
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Product name (must be unique) |
| category | string | Yes | One of: irrigation, harvesting, containers, pest-management |
| description | string | Yes | Product description |
| price | number | Yes | Price in RWF (must be positive) |
| quantity | number | Yes | Stock quantity (non-negative integer) |
| unit | string | Yes | Unit of measurement (e.g., piece, set, kg, liter) |
| supplier_id | string | No | Supplier identifier |
| status | string | No | available, out_of_stock, discontinued (default: available) |
| harvest_date | date | No | Harvest date for perishable items |
| expiry_date | date | No | Expiry date for perishable items |
| sku | string | No | Stock Keeping Unit code |
| brand | string | No | Product brand name |
| images | array | No | Array of image URLs |
| specifications | object | No | Additional product specifications |

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "673b2c3d4e5f6789abcdef01",
    "name": "Fruit Tree Harvesting Clippers",
    "category": "harvesting",
    "description": "Professional grade harvesting clippers for avocado trees",
    "price": 15000,
    "quantity": 60,
    "unit": "piece",
    "status": "available",
    "sku": "HARV-CLIP-001",
    "brand": "FarmTools Pro",
    "created_at": "2024-11-05T11:00:00Z",
    "updated_at": "2024-11-05T11:00:00Z"
  },
  "meta": {
    "timestamp": "2024-11-05T11:00:00Z",
    "version": "1.0.0"
  }
}
```

**Error Responses**:

- **400 Bad Request**: Duplicate product name
```json
{
  "success": false,
  "message": "Product name already exists",
  "meta": {
    "timestamp": "2024-11-05T11:00:00Z",
    "version": "1.0.0"
  }
}
```

- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User is not an agent, admin, or shop_manager

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_AGENT_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fruit Tree Harvesting Clippers",
    "category": "harvesting",
    "description": "Professional grade harvesting clippers for avocado trees",
    "price": 15000,
    "quantity": 60,
    "unit": "piece",
    "supplier_id": "SUP56457",
    "status": "available",
    "sku": "HARV-CLIP-001",
    "brand": "FarmTools Pro",
    "images": ["https://example.com/images/clippers.jpg"],
    "specifications": {
      "blade_material": "Stainless steel",
      "handle_length": "25cm",
      "warranty": "1 year"
    }
  }'
```

---

### 4. Update Product (Agent Access Granted) ✅

**Endpoint**: `PUT /api/products/:id`

**Authentication**: Required (JWT Token)

**Authorized Roles**: `admin`, `shop_manager`, `agent`

**Headers**:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Request Body** (all fields optional):
```json
{
  "name": "Advanced Fruit Tree Harvesting Clippers",
  "description": "Premium professional grade harvesting clippers",
  "price": 18000,
  "quantity": 75,
  "status": "available",
  "brand": "FarmTools Pro Elite",
  "specifications": {
    "blade_material": "Stainless steel - Premium Grade",
    "handle_length": "25cm",
    "warranty": "2 years"
  }
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "673b2c3d4e5f6789abcdef01",
    "name": "Advanced Fruit Tree Harvesting Clippers",
    "category": "harvesting",
    "description": "Premium professional grade harvesting clippers",
    "price": 18000,
    "quantity": 75,
    "unit": "piece",
    "status": "available",
    "brand": "FarmTools Pro Elite",
    "created_at": "2024-11-05T11:00:00Z",
    "updated_at": "2024-11-05T11:30:00Z"
  },
  "meta": {
    "timestamp": "2024-11-05T11:30:00Z",
    "version": "1.0.0"
  }
}
```

**Error Responses**:
- **400 Bad Request**: Duplicate product name
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User is not an agent, admin, or shop_manager
- **404 Not Found**: Product not found

**cURL Example**:
```bash
curl -X PUT http://localhost:5000/api/products/673b2c3d4e5f6789abcdef01 \
  -H "Authorization: Bearer YOUR_AGENT_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 18000,
    "quantity": 75,
    "description": "Premium professional grade harvesting clippers"
  }'
```

---

### 5. Update Product Stock (Agent Access Granted) ✅

**Endpoint**: `PUT /api/products/:id/stock`

**Authentication**: Required (JWT Token)

**Authorized Roles**: `admin`, `shop_manager`, `agent`

**Headers**:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Request Body**:
```json
{
  "quantity": 100
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| quantity | number | Yes | New stock quantity (non-negative integer) |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Product stock updated successfully",
  "data": {
    "id": "673b2c3d4e5f6789abcdef01",
    "name": "Fruit Tree Harvesting Clippers",
    "category": "harvesting",
    "description": "Professional grade harvesting clippers",
    "price": 15000,
    "quantity": 100,
    "unit": "piece",
    "status": "available",
    "created_at": "2024-11-05T11:00:00Z",
    "updated_at": "2024-11-05T12:00:00Z"
  },
  "meta": {
    "timestamp": "2024-11-05T12:00:00Z",
    "version": "1.0.0"
  }
}
```

**Automatic Status Update**:
- If `quantity > 0`: status automatically set to `"available"`
- If `quantity = 0`: status automatically set to `"out_of_stock"`

**Error Responses**:

- **400 Bad Request**: Invalid quantity
```json
{
  "success": false,
  "message": "Quantity must be a non-negative integer",
  "meta": {
    "timestamp": "2024-11-05T12:00:00Z",
    "version": "1.0.0"
  }
}
```

- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User is not an agent, admin, or shop_manager
- **404 Not Found**: Product not found

**cURL Example**:
```bash
curl -X PUT http://localhost:5000/api/products/673b2c3d4e5f6789abcdef01/stock \
  -H "Authorization: Bearer YOUR_AGENT_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 100
  }'
```

---

## Restricted Endpoint (Admin Only)

### Delete/Discontinue Product ❌
**Agents DO NOT have access to this endpoint**

**Endpoint**: `DELETE /api/products/:id`

**Authorized Roles**: `admin` only

This endpoint marks a product as discontinued (soft delete). Only administrators can perform this action.

---

## Valid Product Categories

Agents can create products in the following categories:

| Category | Description | Example Products |
|----------|-------------|------------------|
| `irrigation` | Irrigation systems and equipment | Drip systems, sprinklers, water pipes |
| `harvesting` | Harvesting tools and equipment | Clippers, baskets, ladders, sorting tools |
| `containers` | Storage and transport containers | Crates, boxes, packaging materials |
| `pest-management` | Pest control products | Pesticides, traps, organic treatments |

---

## Product Status Values

| Status | Description | Auto-set When |
|--------|-------------|---------------|
| `available` | Product is in stock and available | quantity > 0 |
| `out_of_stock` | Product is not available | quantity = 0 |
| `discontinued` | Product is no longer sold | Admin deletes product |

---

## Usage Examples for Agents

### Complete Workflow: Agent Creating and Managing Products

#### Step 1: Login as Agent
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "password123"
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "673a1b2c3d4e5f6789abcdef",
      "role": "agent"
    }
  }
}
```

#### Step 2: Browse Existing Products
```bash
curl -X GET "http://localhost:5000/api/products?category=harvesting&in_stock=true"
```

#### Step 3: Create New Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Avocado Sorting Machine",
    "category": "harvesting",
    "description": "Automated avocado sorting by size",
    "price": 250000,
    "quantity": 5,
    "unit": "set"
  }'
```

#### Step 4: Update Product Details
```bash
curl -X PUT http://localhost:5000/api/products/PRODUCT_ID \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "price": 235000,
    "description": "Automated avocado sorting by size - Special discount"
  }'
```

#### Step 5: Update Stock Level
```bash
curl -X PUT http://localhost:5000/api/products/PRODUCT_ID/stock \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 10
  }'
```

---

## Agent Responsibilities

As an agent with product management access, you should:

1. ✅ **Ensure accurate product information** - Verify all details before creating products
2. ✅ **Use correct categories** - Choose appropriate category from the 4 valid options
3. ✅ **Keep stock updated** - Update quantities regularly to reflect actual inventory
4. ✅ **Set competitive prices** - Research market prices before listing
5. ✅ **Add quality images** - Provide clear product images (URLs)
6. ✅ **Write clear descriptions** - Help farmers understand product benefits
7. ✅ **Monitor inventory** - Use stock update endpoint to prevent out-of-stock situations
8. ❌ **Do not delete products** - Only admins can discontinue products

---

## Best Practices for Agents

### Creating Products
- Always provide unique product names
- Include detailed descriptions (50-200 characters recommended)
- Add high-quality image URLs
- Set realistic initial stock quantities
- Include specifications for technical products

### Updating Products
- Update only the fields that need changes (partial updates supported)
- Verify price changes are intentional
- Keep descriptions accurate and up-to-date

### Managing Stock
- Use the dedicated `/stock` endpoint for quick stock updates
- Update stock levels after each sale or restock
- Monitor products with low stock (quantity < 10)

### Error Handling
- Check for duplicate names before creating products
- Ensure valid category names (case-sensitive)
- Verify quantities are non-negative integers
- Keep JWT tokens secure and refresh when expired

---

## Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Product name already exists" | Duplicate product name | Use a unique name or update existing product |
| "Invalid category" | Wrong category value | Use one of: irrigation, harvesting, containers, pest-management |
| "Unauthorized" | Missing/invalid JWT token | Login again to get fresh token |
| "Forbidden" | Wrong user role | Ensure user has agent, shop_manager, or admin role |
| "Quantity must be non-negative" | Negative quantity value | Use 0 or positive integers only |

---

## Changelog

### Version 1.0.0 (November 5, 2025)
- ✅ **Granted agent access to POST /api/products** - Agents can now create products
- ✅ **Granted agent access to PUT /api/products/:id** - Agents can now update products
- ✅ **Granted agent access to PUT /api/products/:id/stock** - Agents can now manage inventory
- ℹ️ GET endpoints remain public (no authentication required)
- ℹ️ DELETE endpoint remains admin-only

---

## Support

- **API Version**: 1.0.0
- **Last Updated**: November 5, 2025
- **Base URL**: http://localhost:5000
- **Environment**: Development

For questions or issues regarding agent product access, please contact the API development team.

