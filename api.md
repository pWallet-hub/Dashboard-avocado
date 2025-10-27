# Dashboard Avocado Backend API Documentation

## 1. Overview

This document provides comprehensive documentation for the Dashboard Avocado Backend API, which serves as the backend for an agricultural management system. The API is built with Node.js, Express, and MongoDB, and provides endpoints for user authentication, user management, product management, order processing, service requests, and analytics.

### Base URL
```
https://dash-api-hnyp.onrender.com/api
```

### Authentication
Most endpoints require authentication using JWT tokens. Tokens should be included in the Authorization header:
```
Authorization: Bearer <token>
```

## 2. API Endpoints Reference

### Authentication Endpoints

#### Register a New User
- **URL**: `/auth/register`
- **Method**: `POST`
- **Access**: Public
- **Description**: Register a new user in the system

##### Request Body
```json
{
  "email": "string (required)",
  "password": "string (required, min 8 characters)",
  "full_name": "string (required)",
  "phone": "string (optional)",
  "role": "string (optional, default: 'farmer', values: 'admin', 'agent', 'farmer', 'shop_manager')",
  "profile": "object (optional)"
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "full_name": "string",
      "role": "string",
      "status": "string"
    }
  },
  "message": "User registered successfully"
}
```

##### Error Responses
- `409`: User with this email already exists
- `500`: Registration failed

#### Login User
- **URL**: `/auth/login`
- **Method**: `POST`
- **Access**: Public
- **Description**: Authenticate a user and generate a JWT token

##### Request Body
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "full_name": "string",
      "role": "string",
      "status": "string"
    }
  },
  "message": "Login successful"
}
```

##### Error Responses
- `401`: Invalid credentials
- `401`: Account is inactive
- `500`: Login failed

#### Logout User
- **URL**: `/auth/logout`
- **Method**: `POST`
- **Access**: Private
- **Description**: Logout user (client-side token invalidation)

##### Success Response
```json
{
  "success": true,
  "data": null,
  "message": "Logout successful"
}
```

#### Refresh Authentication Token
- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Access**: Private
- **Description**: Refresh an expired JWT token using a refresh token

##### Request Body
```json
{
  "refreshToken": "string (required)"
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "full_name": "string",
      "role": "string",
      "status": "string"
    }
  },
  "message": "Token refreshed successfully"
}
```

##### Error Responses
- `400`: Invalid refresh token
- `401`: Refresh token expired
- `500`: Token refresh failed

#### Get Current User Profile
- **URL**: `/auth/profile`
- **Method**: `GET`
- **Access**: Private
- **Description**: Get the profile of the currently authenticated user

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "role": "string",
    "status": "string",
    "profile": "object",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Profile retrieved successfully"
}
```

##### Error Responses
- `404`: User not found
- `500`: Failed to retrieve profile

#### Update Current User Profile
- **URL**: `/auth/profile`
- **Method**: `PUT`
- **Access**: Private
- **Description**: Update the profile of the currently authenticated user

##### Request Body
```json
{
  "full_name": "string (optional)",
  "phone": "string (optional)",
  "profile": "object (optional)"
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "role": "string",
    "status": "string",
    "profile": "object",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Profile updated successfully"
}
```

##### Error Responses
- `404`: User not found
- `500`: Failed to update profile

#### Change User Password
- **URL**: `/auth/password`
- **Method**: `PUT`
- **Access**: Private
- **Description**: Change the password of the currently authenticated user

##### Request Body
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 8 characters)"
}
```

##### Success Response
```json
{
  "success": true,
  "data": null,
  "message": "Password changed successfully"
}
```

##### Error Responses
- `400`: Current password is incorrect
- `404`: User not found
- `500`: Failed to change password

### User Management Endpoints

#### Get All Users
- **URL**: `/users`
- **Method**: `GET`
- **Access**: Private (Admin only)
- **Description**: Get all users with pagination and filtering options

##### Query Parameters
- `page`: integer (default: 1)
- `limit`: integer (default: 10)
- `role`: string (filter by role)
- `status`: string (filter by status)
- `search`: string (search by name or email)

##### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "email": "string",
      "full_name": "string",
      "phone": "string",
      "role": "string",
      "status": "string",
      "profile": "object",
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "pagination": {
    "currentPage": "integer",
    "totalPages": "integer",
    "totalItems": "integer",
    "itemsPerPage": "integer"
  },
  "message": "Users retrieved successfully"
}
```

##### Error Responses
- `500`: Failed to retrieve users

   Create New Agent

URL: /users/agents
Method: POST
Access: Private (Admin only)
Description: Create a new agent with default credentials

Request Body

```json
{
  "full_name": "string (required)",
  "email": "string (required)",
  "phone": "string (optional)",
  "province": "string (optional)",
  "district": "string (optional)",
  "sector": "string (optional)"
}

Response 
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "role": "agent",
    "status": "active",
    "profile": {
      "province": "string",
      "district": "string",
      "service_areas": ["string"]
    },
    "created_at": "date",
    "updated_at": "date",
    "default_password": "AgentPass123!"
  },
  "message": "Agent created successfully"
}

#### Get User by ID
- **URL**: `/users/:id`
- **Method**: `GET`
- **Access**: Private (Admin or self)
- **Description**: Get a specific user by ID

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "role": "string",
    "status": "string",
    "profile": "object",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "User retrieved successfully"
}
```

##### Error Responses
- `403`: Access denied
- `404`: User not found
- `500`: Failed to retrieve user

#### Update User
- **URL**: `/users/:id`
- **Method**: `PUT`
- **Access**: Private (Admin or self)
- **Description**: Update a user's information

##### Request Body
```json
{
  "full_name": "string (optional)",
  "phone": "string (optional)",
  "profile": "object (optional)",
  "role": "string (admin only)",
  "status": "string (admin only)"
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "role": "string",
    "status": "string",
    "profile": "object",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "User updated successfully"
}
```

##### Error Responses
- `403`: Access denied
- `404`: User not found
- `500`: Failed to update user

#### Delete User
- **URL**: `/users/:id`
- **Method**: `DELETE`
- **Access**: Private (Admin only)
- **Description**: Delete a user by ID

##### Success Response
```json
{
  "success": true,
  "data": null,
  "message": "User deleted successfully"
}
```

##### Error Responses
- `400`: Cannot delete your own account
- `404`: User not found
- `500`: Failed to delete user

#### Get All Farmers
- **URL**: `/users/farmers`
- **Method**: `GET`
- **Access**: Private (Admin and agents)
- **Description**: Get all farmers with pagination and filtering options

##### Query Parameters
- `page`: integer (default: 1)
- `limit`: integer (default: 10)
- `status`: string (filter by status)
- `search`: string (search by name or email)

##### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "email": "string",
      "full_name": "string",
      "phone": "string",
      "role": "string",
      "status": "string",
      "profile": "object",
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "pagination": {
    "currentPage": "integer",
    "totalPages": "integer",
    "totalItems": "integer",
    "itemsPerPage": "integer"
  },
  "message": "Farmers retrieved successfully"
}
```

##### Error Responses
- `500`: Failed to retrieve farmers

Create New Farmer

URL: /users/farmers
Method: POST
Access: Private (Admin only)
Description: Create a new farmer with default credentials

Request Body
```json
{
  "full_name": "string (required)",
  "email": "string (required)",
  "phone": "string (optional)",
  "age": "number (optional)",
  "gender": "string (required, values: 'Male', 'Female', 'Other')",
  "marital_status": "string (optional, values: 'Single', 'Married', 'Divorced', 'Widowed')",
  "education_level": "string (optional, values: 'Primary', 'Secondary', 'University', 'None')",
  "province": "string (optional)",
  "district": "string (optional)",
  "sector": "string (optional)",
  "cell": "string (optional)",
  "village": "string (optional)",
  "farm_province": "string (optional)",
  "farm_district": "string (optional)",
  "farm_sector": "string (optional)",
  "farm_cell": "string (optional)",
  "farm_village": "string (optional)",
  "farm_age": "number (optional)",
  "planted": "string (optional)",
  "avocado_type": "string (optional)",
  "mixed_percentage": "number (optional, 0-100)",
  "farm_size": "number (optional)",
  "tree_count": "number (optional)",
  "upi_number": "string (optional)",
  "assistance": "string (optional)"
}

Success Response

{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "role": "farmer",
    "status": "active",
    "profile": {
      "age": "number",
      "gender": "string",
      "marital_status": "string",
      "education_level": "string",
      "province": "string",
      "district": "string",
      "sector": "string",
      "cell": "string",
      "village": "string",
      "farm_details": {
        "farm_location": {
          "province": "string",
          "district": "string",
          "sector": "string",
          "cell": "string",
          "village": "string"
        },
        "farm_age": "number",
        "planted": "string",
        "avocado_type": "string",
        "mixed_percentage": "number",
        "farm_size": "number",
        "tree_count": "number",
        "upi_number": "string",
        "assistance": "string"
      }
    },
    "created_at": "date",
    "updated_at": "date",
    "default_password": "FarmerPass123!"
  },
  "message": "Farmer created successfully"
}
Error Responses
400: User with this email already exists
400: Validation error: [specific validation errors]
500: Failed to create farmer


#### Get All Agents
- **URL**: `/users/agents`
- **Method**: `GET`
- **Access**: Private (Admin only)
- **Description**: Get all agents with pagination and filtering options

##### Query Parameters
- `page`: integer (default: 1)
- `limit`: integer (default: 10)
- `status`: string (filter by status)
- `search`: string (search by name or email)

##### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "email": "string",
      "full_name": "string",
      "phone": "string",
      "role": "string",
      "status": "string",
      "profile": "object",
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "pagination": {
    "currentPage": "integer",
    "totalPages": "integer",
    "totalItems": "integer",
    "itemsPerPage": "integer"
  },
  "message": "Agents retrieved successfully"
}
```

##### Error Responses
- `500`: Failed to retrieve agents

 #### Get Current User Profile

- **URL**: `users/me`
- **Method**: `GET`
- **Access**: Private (Any authenticated user)
- **Description**: Get the profile of the currently authenticated user with flattened farm data structure

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "role": "string",
    "status": "string",
    "profile": {
      "age": "number",
      "gender": "string",
      "marital_status": "string",
      "education_level": "string",
      "id_number": "string",
      "image": "string",
      "province": "string",
      "district": "string",
      "sector": "string",
      "cell": "string",
      "village": "string",
      "farm_age": "number",
      "planted": "string",
      "avocado_type": "string",
      "mixed_percentage": "string",
      "farm_size": "string",
      "tree_count": "number",
      "upi_number": "string",
      "assistance": ["string"],
      "farm_province": "string",
      "farm_district": "string",
      "farm_sector": "string",
      "farm_cell": "string",
      "farm_village": "string"
    },
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Profile retrieved successfully"
}
```
##### Error Responses
- `400`: Unauthorized - Invalid or missing token
- `404`: User not found
- `500`: Failed to retrieve profile


#### Update User Status
- **URL**: `/users/:id/status`
- **Method**: `PUT`
- **Access**: Private (Admin only)
- **Description**: Update a user's status

##### Request Body
```json
{
  "status": "string (required, values: 'active', 'inactive')"
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "role": "string",
    "status": "string",
    "profile": "object",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "User status updated to [status]"
}
```

##### Error Responses
- `400`: Invalid status value
- `404`: User not found
- `500`: Failed to update user status

#### Update User Role
- **URL**: `/users/:id/role`
- **Method**: `PUT`
- **Access**: Private (Admin only)
- **Description**: Update a user's role

##### Request Body
```json
{
  "role": "string (required, values: 'admin', 'agent', 'farmer', 'shop_manager')"
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "full_name": "string",
    "phone": "string",
    "role": "string",
    "status": "string",
    "profile": "object",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "User role updated to [role]"
}
```

##### Error Responses
- `400`: Invalid role value
- `400`: Cannot remove the last admin user
- `404`: User not found
- `500`: Failed to update user role

### Product Management Endpoints

#### Get All Products
- **URL**: `/products`
- **Method**: `GET`
- **Access**: Public
- **Description**: Get all products with pagination and filtering options

##### Query Parameters
- `page`: integer (default: 1)
- `limit`: integer (default: 20)
- `category`: string (filter by category)
- `supplier_id`: string (filter by supplier)
- `status`: string (filter by status)
- `price_min`: number (minimum price filter)
- `price_max`: number (maximum price filter)
- `in_stock`: boolean (filter by stock status)
- `search`: string (search by name, description, or brand)

##### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "category": "string",
      "description": "string",
      "price": "number",
      "quantity": "integer",
      "unit": "string",
      "supplier_id": "string",
      "status": "string",
      "harvest_date": "date",
      "expiry_date": "date",
      "sku": "string",
      "brand": "string",
      "images": ["string"],
      "specifications": "object",
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "pagination": {
    "currentPage": "integer",
    "totalPages": "integer",
    "totalItems": "integer",
    "itemsPerPage": "integer"
  },
  "message": "Products retrieved successfully"
}
```

##### Error Responses
- `500`: Failed to retrieve products

#### Get Product by ID
- **URL**: `/products/:id`
- **Method**: `GET`
- **Access**: Public
- **Description**: Get a specific product by ID

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "category": "string",
    "description": "string",
    "price": "number",
    "quantity": "integer",
    "unit": "string",
    "supplier_id": "string",
    "status": "string",
    "harvest_date": "date",
    "expiry_date": "date",
    "sku": "string",
    "brand": "string",
    "images": ["string"],
    "specifications": "object",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Product retrieved successfully"
}
```

##### Error Responses
- `404`: Product not found
- `500`: Failed to retrieve product

#### Create New Product
- **URL**: `/products`
- **Method**: `POST`
- **Access**: Private (Admin and shop managers)
- **Description**: Create a new product

##### Request Body
```json
{
  "name": "string (required)",
  "category": "string (required)",
  "description": "string (optional)",
  "price": "number (required)",
  "quantity": "integer (required)",
  "unit": "string (required)",
  "supplier_id": "string (required)",
  "status": "string (optional, default: 'available')",
  "harvest_date": "date (optional)",
  "expiry_date": "date (optional)",
  "sku": "string (optional)",
  "brand": "string (optional)",
  "images": ["string"] (optional),
  "specifications": "object (optional)"
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "category": "string",
    "description": "string",
    "price": "number",
    "quantity": "integer",
    "unit": "string",
    "supplier_id": "string",
    "status": "string",
    "harvest_date": "date",
    "expiry_date": "date",
    "sku": "string",
    "brand": "string",
    "images": ["string"],
    "specifications": "object",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Product created successfully"
}
```

##### Error Responses
- `500`: Failed to create product

#### Update Product
- **URL**: `/products/:id`
- **Method**: `PUT`
- **Access**: Private (Admin and shop managers)
- **Description**: Update a product

##### Request Body
```json
{
  "name": "string (optional)",
  "category": "string (optional)",
  "description": "string (optional)",
  "price": "number (optional)",
  "quantity": "integer (optional)",
  "unit": "string (optional)",
  "supplier_id": "string (optional)",
  "status": "string (optional)",
  "harvest_date": "date (optional)",
  "expiry_date": "date (optional)",
  "sku": "string (optional)",
  "brand": "string (optional)",
  "images": ["string"] (optional),
  "specifications": "object (optional)"
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "category": "string",
    "description": "string",
    "price": "number",
    "quantity": "integer",
    "unit": "string",
    "supplier_id": "string",
    "status": "string",
    "harvest_date": "date",
    "expiry_date": "date",
    "sku": "string",
    "brand": "string",
    "images": ["string"],
    "specifications": "object",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Product updated successfully"
}
```

##### Error Responses
- `404`: Product not found
- `500`: Failed to update product

#### Delete Product
- **URL**: `/products/:id`
- **Method**: `DELETE`
- **Access**: Private (Admin only)
- **Description**: Mark a product as discontinued

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "category": "string",
    "description": "string",
    "price": "number",
    "quantity": "integer",
    "unit": "string",
    "supplier_id": "string",
    "status": "string",
    "harvest_date": "date",
    "expiry_date": "date",
    "sku": "string",
    "brand": "string",
    "images": ["string"],
    "specifications": "object",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Product discontinued successfully"
}
```

##### Error Responses
- `404`: Product not found
- `500`: Failed to discontinue product

#### Get Products by Category
- **URL**: `/products/category/:category`
- **Method**: `GET`
- **Access**: Public
- **Description**: Get products by category

##### Query Parameters
- `page`: integer (default: 1)
- `limit`: integer (default: 20)

##### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "category": "string",
      "description": "string",
      "price": "number",
      "quantity": "integer",
      "unit": "string",
      "supplier_id": "string",
      "status": "string",
      "harvest_date": "date",
      "expiry_date": "date",
      "sku": "string",
      "brand": "string",
      "images": ["string"],
      "specifications": "object",
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "pagination": {
    "currentPage": "integer",
    "totalPages": "integer",
    "totalItems": "integer",
    "itemsPerPage": "integer"
  },
  "message": "Products in category [category] retrieved successfully"
}
```

##### Error Responses
- `500`: Failed to retrieve products by category

#### Update Product Stock
- **URL**: `/products/:id/stock`
- **Method**: `PUT`
- **Access**: Private (Admin and shop managers)
- **Description**: Update a product's stock quantity

##### Request Body
```json
{
  "quantity": "integer (required, min: 0)"
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "category": "string",
    "description": "string",
    "price": "number",
    "quantity": "integer",
    "unit": "string",
    "supplier_id": "string",
    "status": "string",
    "harvest_date": "date",
    "expiry_date": "date",
    "sku": "string",
    "brand": "string",
    "images": ["string"],
    "specifications": "object",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Product stock updated successfully"
}
```

##### Error Responses
- `400`: Quantity cannot be negative
- `404`: Product not found
- `500`: Failed to update product stock

### Order Management Endpoints

#### Get All Orders
- **URL**: `/orders`
- **Method**: `GET`
- **Access**: Private (Admin and shop managers)
- **Description**: Get all orders with pagination and filtering options

##### Query Parameters
- `page`: integer (default: 1)
- `limit`: integer (default: 10)
- `customer_id`: string (filter by customer)
- `status`: string (filter by status)
- `payment_status`: string (filter by payment status)
- `date_from`: date (filter by date range)
- `date_to`: date (filter by date range)
- `amount_min`: number (minimum amount filter)
- `amount_max`: number (maximum amount filter)
- `search`: string (search by order number)

##### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "order_number": "string",
      "customer_id": "string",
      "items": [
        {
          "product_id": "string",
          "product_name": "string",
          "unit_price": "number",
          "quantity": "integer",
          "total_price": "number"
        }
      ],
      "subtotal": "number",
      "tax_amount": "number",
      "shipping_cost": "number",
      "discount_amount": "number",
      "total_amount": "number",
      "status": "string",
      "payment_status": "string",
      "payment_method": "string",
      "shipping_address": {
        "full_name": "string",
        "phone": "string",
        "street_address": "string",
        "city": "string",
        "province": "string",
        "postal_code": "string",
        "country": "string"
      },
      "billing_address": {
        "full_name": "string",
        "phone": "string",
        "street_address": "string",
        "city": "string",
        "province": "string",
        "postal_code": "string",
        "country": "string"
      },
      "order_date": "date",
      "expected_delivery_date": "date",
      "delivered_date": "date",
      "notes": "string",
      "tracking_number": "string",
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "pagination": {
    "currentPage": "integer",
    "totalPages": "integer",
    "totalItems": "integer",
    "itemsPerPage": "integer"
  },
  "message": "Orders retrieved successfully"
}
```

##### Error Responses
- `500`: Failed to retrieve orders

#### Get Order by ID
- **URL**: `/orders/:id`
- **Method**: `GET`
- **Access**: Private (Admin, shop managers, and order owner)
- **Description**: Get a specific order by ID

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "order_number": "string",
    "customer_id": "string",
    "items": [
      {
        "product_id": "string",
        "product_name": "string",
        "unit_price": "number",
        "quantity": "integer",
        "total_price": "number"
      }
    ],
    "subtotal": "number",
    "tax_amount": "number",
    "shipping_cost": "number",
    "discount_amount": "number",
    "total_amount": "number",
    "status": "string",
    "payment_status": "string",
    "payment_method": "string",
    "shipping_address": {
      "full_name": "string",
      "phone": "string",
      "street_address": "string",
      "city": "string",
      "province": "string",
      "postal_code": "string",
      "country": "string"
    },
    "billing_address": {
      "full_name": "string",
      "phone": "string",
      "street_address": "string",
      "city": "string",
      "province": "string",
      "postal_code": "string",
      "country": "string"
    },
    "order_date": "date",
    "expected_delivery_date": "date",
    "delivered_date": "date",
    "notes": "string",
    "tracking_number": "string",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Order retrieved successfully"
}
```

##### Error Responses
- `403`: Access denied
- `404`: Order not found
- `500`: Failed to retrieve order

#### Create New Order
- **URL**: `/orders`
- **Method**: `POST`
- **Access**: Private (All authenticated users)
- **Description**: Create a new order

##### Request Body
```json
{
  "items": [
    {
      "product_id": "string (required)",
      "quantity": "integer (required)"
    }
  ],
  "shipping_address": {
    "full_name": "string (required)",
    "phone": "string (required)",
    "street_address": "string (required)",
    "city": "string (required)",
    "province": "string (required)",
    "postal_code": "string (optional)",
    "country": "string (required)"
  },
  "billing_address": {
    "full_name": "string (optional)",
    "phone": "string (optional)",
    "street_address": "string (optional)",
    "city": "string (optional)",
    "province": "string (optional)",
    "postal_code": "string (optional)",
    "country": "string (optional)"
  },
  "notes": "string (optional)"
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "order_number": "string",
    "customer_id": "string",
    "items": [
      {
        "product_id": "string",
        "product_name": "string",
        "unit_price": "number",
        "quantity": "integer",
        "total_price": "number"
      }
    ],
    "subtotal": "number",
    "tax_amount": "number",
    "shipping_cost": "number",
    "discount_amount": "number",
    "total_amount": "number",
    "status": "string",
    "payment_status": "string",
    "payment_method": "string",
    "shipping_address": {
      "full_name": "string",
      "phone": "string",
      "street_address": "string",
      "city": "string",
      "province": "string",
      "postal_code": "string",
      "country": "string"
    },
    "billing_address": {
      "full_name": "string",
      "phone": "string",
      "street_address": "string",
      "city": "string",
      "province": "string",
      "postal_code": "string",
      "country": "string"
    },
    "order_date": "date",
    "expected_delivery_date": "date",
    "delivered_date": "date",
    "notes": "string",
    "tracking_number": "string",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Order created successfully"
}
```

##### Error Responses
- `400`: Insufficient quantity for product
- `400`: Product is out of stock
- `404`: Product not found
- `500`: Failed to create order

#### Update Order
- **URL**: `/orders/:id`
- **Method**: `PUT`
- **Access**: Private (Admin and shop managers)
- **Description**: Update an order

##### Request Body
```json
{
  "items": [
    {
      "product_id": "string",
      "product_name": "string",
      "unit_price": "number",
      "quantity": "integer",
      "total_price": "number"
    }
  ],
  "subtotal": "number",
  "tax_amount": "number",
  "shipping_cost": "number",
  "discount_amount": "number",
  "total_amount": "number",
  "status": "string",
  "payment_status": "string",
  "payment_method": "string",
  "shipping_address": {
    "full_name": "string",
    "phone": "string",
    "street_address": "string",
    "city": "string",
    "province": "string",
    "postal_code": "string",
    "country": "string"
  },
  "billing_address": {
    "full_name": "string",
    "phone": "string",
    "street_address": "string",
    "city": "string",
    "province": "string",
    "postal_code": "string",
    "country": "string"
  },
  "order_date": "date",
  "expected_delivery_date": "date",
  "delivered_date": "date",
  "notes": "string",
  "tracking_number": "string"
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "order_number": "string",
    "customer_id": "string",
    "items": [
      {
        "product_id": "string",
        "product_name": "string",
        "unit_price": "number",
        "quantity": "integer",
        "total_price": "number"
      }
    ],
    "subtotal": "number",
    "tax_amount": "number",
    "shipping_cost": "number",
    "discount_amount": "number",
    "total_amount": "number",
    "status": "string",
    "payment_status": "string",
    "payment_method": "string",
    "shipping_address": {
      "full_name": "string",
      "phone": "string",
      "street_address": "string",
      "city": "string",
      "province": "string",
      "postal_code": "string",
      "country": "string"
    },
    "billing_address": {
      "full_name": "string",
      "phone": "string",
      "street_address": "string",
      "city": "string",
      "province": "string",
      "postal_code": "string",
      "country": "string"
    },
    "order_date": "date",
    "expected_delivery_date": "date",
    "delivered_date": "date",
    "notes": "string",
    "tracking_number": "string",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Order updated successfully"
}
```

##### Error Responses
- `404`: Order not found
- `500`: Failed to update order

#### Delete Order
- **URL**: `/orders/:id`
- **Method**: `DELETE`
- **Access**: Private (Admin only)
- **Description**: Delete an order

##### Success Response
```json
{
  "success": true,
  "data": null,
  "message": "Order deleted successfully"
}
```

##### Error Responses
- `400`: Cannot delete confirmed or processing orders
- `404`: Order not found
- `500`: Failed to delete order

#### Update Order Status
- **URL**: `/orders/:id/status`
- **Method**: `PUT`
- **Access**: Private (Admin and shop managers)
- **Description**: Update an order's status

##### Request Body
```json
{
  "status": "string (required, values: 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')"
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "order_number": "string",
    "customer_id": "string",
    "items": [
      {
        "product_id": "string",
        "product_name": "string",
        "unit_price": "number",
        "quantity": "integer",
        "total_price": "number"
      }
    ],
    "subtotal": "number",
    "tax_amount": "number",
    "shipping_cost": "number",
    "discount_amount": "number",
    "total_amount": "number",
    "status": "string",
    "payment_status": "string",
    "payment_method": "string",
    "shipping_address": {
      "full_name": "string",
      "phone": "string",
      "street_address": "string",
      "city": "string",
      "province": "string",
      "postal_code": "string",
      "country": "string"
    },
    "billing_address": {
      "full_name": "string",
      "phone": "string",
      "street_address": "string",
      "city": "string",
      "province": "string",
      "postal_code": "string",
      "country": "string"
    },
    "order_date": "date",
    "expected_delivery_date": "date",
    "delivered_date": "date",
    "notes": "string",
    "tracking_number": "string",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Order status updated successfully"
}
```

##### Error Responses
- `400`: Invalid status value
- `404`: Order not found
- `500`: Failed to update order status

#### Get Orders for a Specific User
- **URL**: `/orders/user/:userId`
- **Method**: `GET`
- **Access**: Private (Admin, shop managers, and the user themselves)
- **Description**: Get orders for a specific user

##### Query Parameters
- `page`: integer (default: 1)
- `limit`: integer (default: 10)
- `status`: string (filter by status)

##### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "order_number": "string",
      "customer_id": "string",
      "items": [
        {
          "product_id": "string",
          "product_name": "string",
          "unit_price": "number",
          "quantity": "integer",
          "total_price": "number"
        }
      ],
      "subtotal": "number",
      "tax_amount": "number",
      "shipping_cost": "number",
      "discount_amount": "number",
      "total_amount": "number",
      "status": "string",
      "payment_status": "string",
      "payment_method": "string",
      "shipping_address": {
        "full_name": "string",
        "phone": "string",
        "street_address": "string",
        "city": "string",
        "province": "string",
        "postal_code": "string",
        "country": "string"
      },
      "billing_address": {
        "full_name": "string",
        "phone": "string",
        "street_address": "string",
        "city": "string",
        "province": "string",
        "postal_code": "string",
        "country": "string"
      },
      "order_date": "date",
      "expected_delivery_date": "date",
      "delivered_date": "date",
      "notes": "string",
      "tracking_number": "string",
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "pagination": {
    "currentPage": "integer",
    "totalPages": "integer",
    "totalItems": "integer",
    "itemsPerPage": "integer"
  },
  "message": "Orders retrieved successfully"
}
```

##### Error Responses
- `403`: Access denied
- `500`: Failed to retrieve orders

### Service Request Endpoints

#### Get All Service Requests
- **URL**: `/service-requests`
- **Method**: `GET`
- **Access**: Private (Admin, agents, and farmers can view relevant requests)
- **Description**: Get all service requests with pagination and filtering options

##### Query Parameters
- `page`: integer (default: 1)
- `limit`: integer (default: 10)
- `farmer_id`: string (filter by farmer, admin/agent only)
- `agent_id`: string (filter by agent, admin only)
- `service_type`: string (filter by service type)
- `status`: string (filter by status)
- `priority`: string (filter by priority)
- `province`: string (filter by province, admin/agent only)
- `city`: string (filter by city, admin/agent only)
- `date_from`: date (filter by date range)
- `date_to`: date (filter by date range)
- `search`: string (search by title, description, or request number)

##### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "request_number": "string",
      "farmer_id": "string",
      "agent_id": "string",
      "service_type": "string",
      "title": "string",
      "description": "string",
      "priority": "string",
      "status": "string",
      "requested_date": "date",
      "preferred_date": "date",
      "scheduled_date": "date",
      "completed_date": "date",
      "location": {
        "farm_name": "string",
        "street_address": "string",
        "city": "string",
        "province": "string",
        "coordinates": {
          "latitude": "number",
          "longitude": "number"
        },
        "access_instructions": "string"
      },
      "cost_estimate": "number",
      "actual_cost": "number",
      "notes": "string",
      "feedback": {
        "rating": "integer",
        "comment": "string",
        "farmer_satisfaction": "integer",
        "agent_professionalism": "integer",
        "service_quality": "integer",
        "would_recommend": "boolean",
        "submitted_at": "date"
      },
      "attachments": ["string"],
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "pagination": {
    "currentPage": "integer",
    "totalPages": "integer",
    "totalItems": "integer",
    "itemsPerPage": "integer"
  },
  "message": "Service requests retrieved successfully"
}
```

##### Error Responses
- `500`: Failed to retrieve service requests

#### Get Service Request by ID
- **URL**: `/service-requests/:id`
- **Method**: `GET`
- **Access**: Private (Request owner, assigned agent, or admin)
- **Description**: Get a specific service request by ID

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "request_number": "string",
    "farmer_id": "string",
    "agent_id": "string",
    "service_type": "string",
    "title": "string",
    "description": "string",
    "priority": "string",
    "status": "string",
    "requested_date": "date",
    "preferred_date": "date",
    "scheduled_date": "date",
    "completed_date": "date",
    "location": {
      "farm_name": "string",
      "street_address": "string",
      "city": "string",
      "province": "string",
      "coordinates": {
        "latitude": "number",
        "longitude": "number"
      },
      "access_instructions": "string"
    },
    "cost_estimate": "number",
    "actual_cost": "number",
    "notes": "string",
    "feedback": {
      "rating": "integer",
      "comment": "string",
      "farmer_satisfaction": "integer",
      "agent_professionalism": "integer",
      "service_quality": "integer",
      "would_recommend": "boolean",
      "submitted_at": "date"
    },
    "attachments": ["string"],
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Service request retrieved successfully"
}
```

##### Error Responses
- `403`: Access denied
- `404`: Service request not found
- `500`: Failed to retrieve service request

#### Create Harvest-day Request
- **URL**: `/service-requests/harvest`
- **Method**: `POST`
- **Access**: Private (Farmers only)
- **Description**: Create a new harvest-day request
```json
{
  "workersNeeded": "integer (required, min: 1)",
  "equipmentNeeded": "array (optional, array of strings)",
  "treesToHarvest": "integer (required, min: 1)",
  "harvestDateFrom": "string (required, ISO date format)",
  "harvestDateTo": "string (required, ISO date format)",
  "harvestImages": "array (optional, array of image URLs)",
  "hassBreakdown": "object (optional)",
  "location": {
    "province": "string (required)",
    "city": "string (required)",
    "address": "string (required)"
  },
  "priority": "string (optional, default: 'medium', values: 'low', 'medium', 'high', 'urgent')",
  "notes": "string (optional)"
}
```
#### Hass Breakdown Object Structure
```json
{
  "selectedSizes": "array (optional, array of strings)",
  "c12c14": "string (optional, count or percentage)",
  "c16c18": "string (optional, count or percentage)",
  "c20c24": "string (optional, count or percentage)"
}
```
#### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "request_number": "string (format: HRV-{timestamp}-{random})",
    "farmer_id": "string",
    "service_type": "harvest",
    "title": "Harvest Request",
    "description": "string (auto-generated)",
    "status": "pending",
    "priority": "string",
    "requested_date": "date",
    "location": {
      "province": "string",
      "city": "string",
      "address": "string"
    },
    "harvest_details": {
      "workers_needed": "integer",
      "equipment_needed": "array",
      "trees_to_harvest": "integer",
      "harvest_date_from": "date",
      "harvest_date_to": "date",
      "harvest_images": "array",
      "hass_breakdown": "object"
    },
    "notes": "string",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Harvest request submitted successfully"
}
```
#### Error Responses

400: Validation errors (missing required fields, invalid date ranges)
500: Failed to create harvest request

#### Get All Harvest-day Requests
URL: 

Method: GET
Access: Private (Role-based filtering applied)
Description: Retrieve harvest requests with role-based filtering and advanced query options

#### Query Parameters

page: integer (default: 1)
limit: integer (default: 10)
status: string (filter by status)
priority: string (filter by priority)
harvest_date_from: string (ISO date, filter by harvest start date)
harvest_date_to: string (ISO date, filter by harvest end date)

#### Access Rules

Farmers: Only see their own harvest requests
Agents: See assigned requests and unassigned requests
Admins: See all harvest requests

#### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "request_number": "string",
      "farmer_id": "string",
      "agent_id": "string",
      "service_type": "harvest",
      "title": "string",
      "description": "string",
      "status": "string",
      "priority": "string",
      "requested_date": "date",
      "location": "object",
      "harvest_details": {
        "workers_needed": "integer",
        "equipment_needed": "array",
        "trees_to_harvest": "integer",
        "harvest_date_from": "date",
        "harvest_date_to": "date",
        "harvest_images": "array",
        "hass_breakdown": "object",
        "approved_workers": "integer",
        "approved_equipment": "array",
        "actual_workers_used": "integer",
        "actual_harvest_amount": "string",
        "harvest_quality_notes": "string",
        "completion_images": "array"
      },
      "notes": "string",
      "created_at": "date",
      "updated_at": "date",
      "farmer": {
        "id": "string",
        "full_name": "string",
        "email": "string",
        "phone": "string"
      },
      "agent": {
        "id": "string",
        "full_name": "string",
        "email": "string",
        "phone": "string"
      }
    }
  ],
  "pagination": {
    "currentPage": "integer",
    "totalPages": "integer",
    "totalItems": "integer",
    "itemsPerPage": "integer"
  },
  "message": "Harvest requests retrieved successfully"
}
```
Error Responses

500: Failed to retrieve harvest requests
#### Approve Harvest Request

URL: /service-requests/:id/approve
Method: PUT
Access: Private (Admin only)
Description: Approve a harvest request with optional agent assignment and harvest-specific approvals

#### Request Body
```json
{
  "agent_id": "string (optional, valid agent ObjectId)",
  "scheduled_date": "string (optional, ISO date format)",
  "cost_estimate": "number (optional, min: 0)",
  "notes": "string (optional)",
  "approved_workers": "integer (optional, approved worker count)",
  "approved_equipment": "array (optional, approved equipment list)"
}
```
#### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "request_number": "string",
    "farmer_id": "string",
    "agent_id": "string",
    "service_type": "harvest",
    "status": "approved",
    "approved_at": "date",
    "approved_by": "string",
    "scheduled_date": "date",
    "cost_estimate": "number",
    "harvest_details": {
      "workers_needed": "integer",
      "equipment_needed": "array",
      "trees_to_harvest": "integer",
      "harvest_date_from": "date",
      "harvest_date_to": "date",
      "approved_workers": "integer",
      "approved_equipment": "array"
    },
    "notes": "string",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Harvest request approved successfully"
}
```
#### Error Responses

400: Invalid or inactive agent
400: This endpoint is only for harvest requests
404: Service request not found
500: Failed to approve harvest request

#### Reject Harvest Request

URL: /service-requests/:id/reject
Method: PUT
Access: Private (Admin only)
Description: Reject a harvest request with mandatory rejection reason

#### Request Body
```json
{
  "rejection_reason": "string (required)",
  "notes": "string (optional)"
}
```
#### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "request_number": "string",
    "farmer_id": "string",
    "service_type": "harvest",
    "status": "rejected",
    "rejected_at": "date",
    "rejected_by": "string",
    "rejection_reason": "string",
    "notes": "string",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Harvest request rejected"
}
```
#### Error Responses

400: Rejection reason is required
400: This endpoint is only for harvest requests
404: Service request not found
500: Failed to reject harvest request

#### Start Harvest-day Request
URL: /service-requests/:id/start
Method: PUT
Access: Private (Assigned agent only)
Description: Mark a harvest request as started by the assigned agent

#### Request Body
```json
{
  "start_notes": "string (optional)",
  "actual_start_date": "string (optional, ISO date format, defaults to current time)"
}
```
#### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "request_number": "string",
    "farmer_id": "string",
    "agent_id": "string",
    "service_type": "harvest",
    "status": "in_progress",
    "started_at": "date",
    "start_notes": "string",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Harvest request started"
}
```

#### Error Responses

400: This endpoint is only for harvest requests
400: Only approved requests can be started
403: Only assigned agent can start the harvest
404: Service request not found
500: Failed to start harvest request


#### Complete Harvest Request

URL: /service-requests/:id/complete
Method: PUT
Access: Private (Admin or assigned agent)
Description: Mark harvest request as completed with completion details

#### Request Body
```json
{
  "completion_notes": "string (optional)",
  "actual_workers_used": "integer (optional)",
  "actual_harvest_amount": "string (optional, e.g., '500kg', '2 tons')",
  "harvest_quality_notes": "string (optional)",
  "completion_images": "array (optional, array of image URLs)"
}
```
#### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "request_number": "string",
    "farmer_id": "string",
    "agent_id": "string",
    "service_type": "harvest",
    "status": "completed",
    "completed_at": "date",
    "completed_by": "string",
    "completion_notes": "string",
    "harvest_details": {
      "workers_needed": "integer",
      "approved_workers": "integer",
      "actual_workers_used": "integer",
      "trees_to_harvest": "integer",
      "actual_harvest_amount": "string",
      "harvest_quality_notes": "string",
      "completion_images": "array"
    },
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Harvest request marked as completed"
}
```

  ### Pest Management Endpoints
  ### Create Pest Management Request

- **URL** `/service-requests/pest-management`
- **Method**: `POST`
- **Access**: Private (Farmers only)
- **Description**: Create a new pest management/pest control request with       detailed pest information and farmer details

  ### Request Body

  ```json
  {
  "service_type": "pest_control (required, must equal 'pest_control')",
  "title": "string (required, max 200 characters)",
  "description": "string (required, max 1000 characters)",
  "priority": "string (optional, default: 'medium', values: 'low', 'medium', 'high', 'urgent')",
  "preferred_date": "date (optional, ISO date format)",
  "location": {
    "province": "string (required)"
  },
  "pest_management_details": {
    "pests_diseases": [
      {
        "name": "string (required)",
        "first_spotted_date": "string (optional, ISO date format)"
      }
    ],
    "first_noticed": "string (required, max 500 characters)",
    "damage_observed": "string (required)",
    "damage_details": "string (required, max 1000 characters)",
    "control_methods_tried": "string (required, max 1000 characters)",
    "severity_level": "string (required, values: 'low', 'medium', 'high', 'critical')"
  },
  "farmer_info": {
    "name": "string (required)",
    "phone": "string (required)",
    "location": "string (required)"
  },
  "attachments": ["string"] (optional, array of attachment URLs),
  "notes": "string (optional)"
}

 ### Success Response

```json
{
  "success": true,
  "data": {
    "id": "string",
    "request_number": "string (format: PC-{timestamp}-{random})",
    "farmer_id": "string",
    "service_type": "pest_control",
    "title": "string",
    "description": "string",
    "status": "pending",
    "priority": "string",
    "requested_date": "date",
    "scheduled_date": "date",
    "location": {
      "province": "string"
    },
    "pest_management_details": {
      "pests_diseases": [
        {
          "name": "string",
          "first_spotted_date": "date"
        }
      ],
      "first_noticed": "string",
      "damage_observed": "string",
      "damage_details": "string",
      "control_methods_tried": "string",
      "severity_level": "string"
    },
    "farmer_info": {
      "name": "string",
      "phone": "string",
      "location": "string"
    },
    "attachments": ["string"],
    "notes": "string",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Pest management request submitted successfully"
}
```
Get All Pest Management Requests

URL: /service-requests/pest-management
Method: GET
Access: Private (Role-based filtering)
Description: Retrieve pest management requests with role-based filtering

Access Rules

Farmers: Only see their own pest management requests
Agents: See assigned requests and unassigned requests
Admins: See all pest management requests

Query Parameters

page: integer (default: 1)
limit: integer (default: 10)
status: string (filter by status)
priority: string (filter by priority)

  ### Success Response
```json
  {
  "success": true,
  "data": [
    {
      "id": "string",
      "request_number": "string",
      "farmer_id": "string",
      "agent_id": "string",
      "service_type": "pest_control",
      "title": "string",
      "description": "string",
      "status": "string",
      "priority": "string",
      "requested_date": "date",
      "scheduled_date": "date",
      "location": {
        "province": "string"
      },
      "pest_management_details": {
        "pests_diseases": [
          {
            "name": "string",
            "first_spotted_date": "date"
          }
        ],
        "first_noticed": "string",
        "damage_observed": "string",
        "damage_details": "string",
        "control_methods_tried": "string",
        "severity_level": "string"
      },
      "farmer_info": {
        "name": "string",
        "phone": "string",
        "location": "string"
      },
      "attachments": ["string"],
      "notes": "string",
      "created_at": "date",
      "updated_at": "date",
      "farmer": {
        "full_name": "string",
        "email": "string",
        "phone": "string"
      },
      "agent": {
        "full_name": "string",
        "email": "string",
        "phone": "string"
      }
    }
  ],
  "pagination": {
    "currentPage": "integer",
    "totalPages": "integer",
    "totalItems": "integer",
    "itemsPerPage": "integer"
  },
  "message": "Pest management requests retrieved successfully"
}
```

Error Responses

401: Unauthorized - Invalid or missing token
500: Failed to retrieve pest management requests

Approve Pest Management Request

URL: /service-requests/:id/approve-pest-management
Method: PUT
Access: Private (Admin only)
Description: Approve a pest management request with optional agent assignment and treatment recommendations

  ### Request Body
```json
{
  "agent_id": "string (optional, valid agent ObjectId)",
  "scheduled_date": "string (optional, ISO date format)",
  "cost_estimate": "number (optional, min: 0)",
  "notes": "string (optional)",
  "recommended_treatment": "string (optional, treatment recommendations)",
  "inspection_priority": "string (optional, inspection priority level)"
}
```
 ### Success Response
 ```json
 {
  "success": true,
  "data": {
    "id": "string",
    "request_number": "string",
    "farmer_id": "string",
    "agent_id": "string",
    "service_type": "pest_control",
    "status": "approved",
    "approved_at": "date",
    "approved_by": "string",
    "scheduled_date": "date",
    "cost_estimate": "number",
    "pest_management_details": {
      "pests_diseases": [
        {
          "name": "string",
          "first_spotted_date": "date"
        }
      ],
      "first_noticed": "string",
      "damage_observed": "string",
      "damage_details": "string",
      "control_methods_tried": "string",
      "severity_level": "string"
    },
    "farmer_info": {
      "name": "string",
      "phone": "string",
      "location": "string"
    },
    "notes": "string (includes recommended treatment and inspection priority)",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Pest management request approved successfully"
}
```
#### Error Responses

400: Invalid or inactive agent
400: This endpoint is only for pest management requests
401: Unauthorized - Invalid or missing token
403: Forbidden - Not an admin
404: Service request not found
500: Failed to approve pest management request

#### Property Evaluation Endpoints
#### Create Property Evaluation Request

- **URL**:`/service-requests/property-evaluation`
- **Method**: `POST`
- **Access**: Private (Farmers only)
- **Description**: Create a new property evaluation request with irrigation details and visit scheduling

### Request Body
```json
{
  "irrigationSource": "Yes",
  "irrigationTiming": "This Coming Season",
  "soilTesting": "Previous soil tests showed pH levels of 6.2 and moderate nitrogen content. Looking for updated analysis including phosphorus and potassium levels.",
  "visitStartDate": "2025-10-15",
  "visitEndDate": "2025-10-19",
  "evaluationPurpose": "Evaluating property for potential irrigation system upgrade and general farm productivity assessment. Need certified valuation for loan application.",
  "priority": "medium",
  "notes": "Property access is available via the main road. Best time for visit is between 8 AM and 4 PM. Two guard dogs on property - please coordinate with farmer before arrival.",
  "location": {
    "province": "Eastern Province",
    "district": "Bugesera",
    "farm_name": "Green Valley Farm",
    "city": "Nyamata",
    "access_instructions": "Enter through the main gate, follow the dirt road for 500m"
  }
}
```
### Validation Rules

visitEndDate must be exactly 5 days after visitStartDate (inclusive range)
visitEndDate must be after visitStartDate
irrigationTiming is required when irrigationSource is 'Yes'

  ### Success Response
  ```json
  {
  "success": true,
  "data": {
    "id": "string",
    "request_number": "string (format: PROP-{timestamp}-{random})",
    "farmer_id": "string",
    "service_type": "other",
    "title": "Property Evaluation Request",
    "description": "string (auto-generated based on irrigation source)",
    "status": "pending",
    "priority": "string",
    "requested_date": "date",
    "property_evaluation_details": {
      "irrigation_source": "string",
      "irrigation_timing": "string",
      "soil_testing": "string",
      "visit_start_date": "date",
      "visit_end_date": "date",
      "evaluation_purpose": "string",
      "certified_valuation_requested": "boolean"
    },
    "notes": "string",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Property evaluation request submitted successfully"
}
```
### Error Responses

400: Validation failed - specific validation errors in response
400: Irrigation timing is required when irrigation source is Yes
400: Visit date range must be exactly 5 days
401: Unauthorized - Invalid or missing token
403: Forbidden - Not a farmer role
500: Failed to create property evaluation request

#### Get All Property Evaluation Requests

URL: /service-requests/property-evaluation
Method: GET
Access: Private (Role-based filtering)
Description: Retrieve property evaluation requests with role-based filtering and date range filtering

#### Access Rules

Farmers: Only see their own property evaluation requests
Agents: See assigned requests and unassigned requests
Admins: See all property evaluation requests

#### Query Parameters

page: integer (default: 1)
limit: integer (default: 10)
status: string (filter by status)
priority: string (filter by priority)
visit_date_from: string (ISO date, filter by visit start date)
visit_date_to: string (ISO date, filter by visit end date)

#### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "request_number": "string",
      "farmer_id": "string",
      "agent_id": "string",
      "service_type": "other",
      "title": "Property Evaluation Request",
      "description": "string",
      "status": "string",
      "priority": "string",
      "requested_date": "date",
      "property_evaluation_details": {
        "irrigation_source": "string",
        "irrigation_timing": "string",
        "soil_testing": "string",
        "visit_start_date": "date",
        "visit_end_date": "date",
        "evaluation_purpose": "string",
        "certified_valuation_requested": "boolean"
      },
      "notes": "string",
      "created_at": "date",
      "updated_at": "date",
      "farmer": {
        "full_name": "string",
        "email": "string",
        "phone": "string"
      },
      "agent": {
        "full_name": "string",
        "email": "string",
        "phone": "string"
      }
    }
  ],
  "pagination": {
    "currentPage": "integer",
    "totalPages": "integer",
    "totalItems": "integer",
    "itemsPerPage": "integer"
  },
  "message": "Property evaluation requests retrieved successfully"
}
```
#### Error Responses

401: Unauthorized - Invalid or missing token
500: Failed to retrieve property evaluation requests

#### Approve Property Evaluation Request

URL: /service-requests/:id/approve-property-evaluation
Method: PUT
Access: Private (Admin only)
Description: Approve a property evaluation request with optional agent assignment and evaluation specifications

#### Request Body
```json
{
  "agent_id": "string (optional, valid agent ObjectId)",
  "scheduled_date": "string (optional, ISO date format)",
  "cost_estimate": "number (optional, min: 0)",
  "notes": "string (optional)",
  "evaluation_type": "string (optional, type of evaluation to be performed)",
  "specialist_required": "boolean (optional, whether specialist is required)"
}
```
### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "request_number": "string",
    "farmer_id": "string",
    "agent_id": "string",
    "service_type": "other",
    "status": "approved",
    "approved_at": "date",
    "approved_by": "string",
    "scheduled_date": "date",
    "cost_estimate": "number",
    "property_evaluation_details": {
      "irrigation_source": "string",
      "irrigation_timing": "string",
      "soil_testing": "string",
      "visit_start_date": "date",
      "visit_end_date": "date",
      "evaluation_purpose": "string",
      "certified_valuation_requested": "boolean"
    },
    "notes": "string (includes evaluation type and specialist requirements)",
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Property evaluation request approved successfully"
}
```
#### Error Responses

400: Invalid or inactive agent
400: This endpoint is only for property evaluation requests
401: Unauthorized - Invalid or missing token
403: Forbidden - Not an admin
404: Service request not found
500: Failed to approve property evaluation request


#### Create New Service Request
- **URL**: `/service-requests`
- **Method**: `POST`
- **Access**: Private (Farmers only)
- **Description**: Create a new service request

##### Request Body
```json
{
  "service_type": "string (required)",
  "title": "string (required)",
  "description": "string (required)",
  "priority": "string (optional, default: 'medium')",
  "preferred_date": "date (optional)",
  "location": {
    "farm_name": "string (optional)",
    "street_address": "string (required)",
    "city": "string (required)",
    "province": "string (required)",
    "coordinates": {
      "latitude": "number (optional)",
      "longitude": "number (optional)"
    },
    "access_instructions": "string (optional)"
  },
  "notes": "string (optional)",
  "attachments": ["string"] (optional)
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "request_number": "string",
    "farmer_id": "string",
    "agent_id": "string",
    "service_type": "string",
    "title": "string",
    "description": "string",
    "priority": "string",
    "status": "string",
    "requested_date": "date",
    "preferred_date": "date",
    "scheduled_date": "date",
    "completed_date": "date",
    "location": {
      "farm_name": "string",
      "street_address": "string",
      "city": "string",
      "province": "string",
      "coordinates": {
        "latitude": "number",
        "longitude": "number"
      },
      "access_instructions": "string"
    },
    "cost_estimate": "number",
    "actual_cost": "number",
    "notes": "string",
    "feedback": {
      "rating": "integer",
      "comment": "string",
      "farmer_satisfaction": "integer",
      "agent_professionalism": "integer",
      "service_quality": "integer",
      "would_recommend": "boolean",
      "submitted_at": "date"
    },
    "attachments": ["string"],
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Service request created successfully"
}
```

##### Error Responses
- `500`: Failed to create service request

#### Update Service Request
- **URL**: `/service-requests/:id`
- **Method**: `PUT`
- **Access**: Private (Request owner or admin)
- **Description**: Update a service request

##### Request Body
```json
{
  "service_type": "string (optional)",
  "title": "string (optional)",
  "description": "string (optional)",
  "priority": "string (optional)",
  "preferred_date": "date (optional)",
  "location": {
    "farm_name": "string (optional)",
    "street_address": "string (optional)",
    "city": "string (optional)",
    "province": "string (optional)",
    "coordinates": {
      "latitude": "number (optional)",
      "longitude": "number (optional)"
    },
    "access_instructions": "string (optional)"
  },
  "notes": "string (optional)",
  "attachments": ["string"] (optional)
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "request_number": "string",
    "farmer_id": "string",
    "agent_id": "string",
    "service_type": "string",
    "title": "string",
    "description": "string",
    "priority": "string",
    "status": "string",
    "requested_date": "date",
    "preferred_date": "date",
    "scheduled_date": "date",
    "completed_date": "date",
    "location": {
      "farm_name": "string",
      "street_address": "string",
      "city": "string",
      "province": "string",
      "coordinates": {
        "latitude": "number",
        "longitude": "number"
      },
      "access_instructions": "string"
    },
    "cost_estimate": "number",
    "actual_cost": "number",
    "notes": "string",
    "feedback": {
      "rating": "integer",
      "comment": "string",
      "farmer_satisfaction": "integer",
      "agent_professionalism": "integer",
      "service_quality": "integer",
      "would_recommend": "boolean",
      "submitted_at": "date"
    },
    "attachments": ["string"],
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Service request updated successfully"
}
```

##### Error Responses
- `400`: Cannot change service type after request is assigned
- `403`: Access denied
- `404`: Service request not found
- `500`: Failed to update service request

#### Delete Service Request
- **URL**: `/service-requests/:id`
- **Method**: `DELETE`
- **Access**: Private (Request owner or admin)
- **Description**: Delete a service request

##### Success Response
```json
{
  "success": true,
  "data": null,
  "message": "Service request deleted successfully"
}
```

##### Error Responses
- `400`: Cannot delete assigned or in-progress service requests
- `403`: Access denied
- `404`: Service request not found
- `500`: Failed to delete service request

#### Assign Agent to Service Request
- **URL**: `/service-requests/:id/assign`
- **Method**: `PUT`
- **Access**: Private (Admin only)
- **Description**: Assign an agent to a service request

##### Request Body
```json
{
  "agent_id": "string (required)",
  "scheduled_date": "date (optional)",
  "cost_estimate": "number (optional)",
  "notes": "string (optional)"
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "request_number": "string",
    "farmer_id": "string",
    "agent_id": "string",
    "service_type": "string",
    "title": "string",
    "description": "string",
    "priority": "string",
    "status": "string",
    "requested_date": "date",
    "preferred_date": "date",
    "scheduled_date": "date",
    "completed_date": "date",
    "location": {
      "farm_name": "string",
      "street_address": "string",
      "city": "string",
      "province": "string",
      "coordinates": {
        "latitude": "number",
        "longitude": "number"
      },
      "access_instructions": "string"
    },
    "cost_estimate": "number",
    "actual_cost": "number",
    "notes": "string",
    "feedback": {
      "rating": "integer",
      "comment": "string",
      "farmer_satisfaction": "integer",
      "agent_professionalism": "integer",
      "service_quality": "integer",
      "would_recommend": "boolean",
      "submitted_at": "date"
    },
    "attachments": ["string"],
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Service request assigned successfully"
}
```

##### Error Responses
- `400`: Invalid or inactive agent
- `404`: Service request not found
- `500`: Failed to assign service request

#### Update Service Request Status
- **URL**: `/service-requests/:id/status`
- **Method**: `PUT`
- **Access**: Private (Request owner, assigned agent, or admin)
- **Description**: Update a service request's status

##### Request Body
```json
{
  "status": "string (required, values: 'pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'on_hold')",
  "notes": "string (optional)"
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "request_number": "string",
    "farmer_id": "string",
    "agent_id": "string",
    "service_type": "string",
    "title": "string",
    "description": "string",
    "priority": "string",
    "status": "string",
    "requested_date": "date",
    "preferred_date": "date",
    "scheduled_date": "date",
    "completed_date": "date",
    "location": {
      "farm_name": "string",
      "street_address": "string",
      "city": "string",
      "province": "string",
      "coordinates": {
        "latitude": "number",
        "longitude": "number"
      },
      "access_instructions": "string"
    },
    "cost_estimate": "number",
    "actual_cost": "number",
    "notes": "string",
    "feedback": {
      "rating": "integer",
      "comment": "string",
      "farmer_satisfaction": "integer",
      "agent_professionalism": "integer",
      "service_quality": "integer",
      "would_recommend": "boolean",
      "submitted_at": "date"
    },
    "attachments": ["string"],
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Service request status updated successfully"
}
```

##### Error Responses
- `400`: Farmers can only cancel pending requests
- `400`: Agents can only update to in_progress, completed, or on_hold
- `400`: This service request cannot be cancelled
- `403`: Access denied
- `404`: Service request not found
- `500`: Failed to update service request status

#### Submit Feedback for Completed Service Request
- **URL**: `/service-requests/:id/feedback`
- **Method**: `POST`
- **Access**: Private (Request owner only)
- **Description**: Submit feedback for a completed service request

##### Request Body
```json
{
  "rating": "integer (required, 1-5)",
  "comment": "string (optional)",
  "farmer_satisfaction": "integer (required, 1-5)",
  "agent_professionalism": "integer (required, 1-5)",
  "service_quality": "integer (required, 1-5)",
  "would_recommend": "boolean (required)"
}
```

##### Success Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "request_number": "string",
    "farmer_id": "string",
    "agent_id": "string",
    "service_type": "string",
    "title": "string",
    "description": "string",
    "priority": "string",
    "status": "string",
    "requested_date": "date",
    "preferred_date": "date",
    "scheduled_date": "date",
    "completed_date": "date",
    "location": {
      "farm_name": "string",
      "street_address": "string",
      "city": "string",
      "province": "string",
      "coordinates": {
        "latitude": "number",
        "longitude": "number"
      },
      "access_instructions": "string"
    },
    "cost_estimate": "number",
    "actual_cost": "number",
    "notes": "string",
    "feedback": {
      "rating": "integer",
      "comment": "string",
      "farmer_satisfaction": "integer",
      "agent_professionalism": "integer",
      "service_quality": "integer",
      "would_recommend": "boolean",
      "submitted_at": "date"
    },
    "attachments": ["string"],
    "created_at": "date",
    "updated_at": "date"
  },
  "message": "Feedback submitted successfully"
}
```

##### Error Responses
- `400`: Feedback can only be submitted for completed requests without existing feedback
- `403`: Access denied
- `404`: Service request not found
- `500`: Failed to submit feedback

#### Get Service Requests for a Specific Farmer
- **URL**: `/service-requests/farmer/:farmerId`
- **Method**: `GET`
- **Access**: Private (Admin, agents, and the farmer themselves)
- **Description**: Get service requests for a specific farmer

##### Query Parameters
- `page`: integer (default: 1)
- `limit`: integer (default: 10)
- `status`: string (filter by status)
- `service_type`: string (filter by service type)

##### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "request_number": "string",
      "farmer_id": "string",
      "agent_id": "string",
      "service_type": "string",
      "title": "string",
      "description": "string",
      "priority": "string",
      "status": "string",
      "requested_date": "date",
      "preferred_date": "date",
      "scheduled_date": "date",
      "completed_date": "date",
      "location": {
        "farm_name": "string",
        "street_address": "string",
        "city": "string",
        "province": "string",
        "coordinates": {
          "latitude": "number",
          "longitude": "number"
        },
        "access_instructions": "string"
      },
      "cost_estimate": "number",
      "actual_cost": "number",
      "notes": "string",
      "feedback": {
        "rating": "integer",
        "comment": "string",
        "farmer_satisfaction": "integer",
        "agent_professionalism": "integer",
        "service_quality": "integer",
        "would_recommend": "boolean",
        "submitted_at": "date"
      },
      "attachments": ["string"],
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "pagination": {
    "currentPage": "integer",
    "totalPages": "integer",
    "totalItems": "integer",
    "itemsPerPage": "integer"
  },
  "message": "Service requests retrieved successfully"
}
```

##### Error Responses
- `403`: Access denied
- `500`: Failed to retrieve service requests

#### Get Service Requests Assigned to a Specific Agent
- **URL**: `/service-requests/agent/:agentId`
- **Method**: `GET`
- **Access**: Private (Admin and the agent themselves)
- **Description**: Get service requests assigned to a specific agent

##### Query Parameters
- `page`: integer (default: 1)
- `limit`: integer (default: 10)
- `status`: string (filter by status)
- `service_type`: string (filter by service type)

##### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "request_number": "string",
      "farmer_id": "string",
      "agent_id": "string",
      "service_type": "string",
      "title": "string",
      "description": "string",
      "priority": "string",
      "status": "string",
      "requested_date": "date",
      "preferred_date": "date",
      "scheduled_date": "date",
      "completed_date": "date",
      "location": {
        "farm_name": "string",
        "street_address": "string",
        "city": "string",
        "province": "string",
        "coordinates": {
          "latitude": "number",
          "longitude": "number"
        },
        "access_instructions": "string"
      },
      "cost_estimate": "number",
      "actual_cost": "number",
      "notes": "string",
      "feedback": {
        "rating": "integer",
        "comment": "string",
        "farmer_satisfaction": "integer",
        "agent_professionalism": "integer",
        "service_quality": "integer",
        "would_recommend": "boolean",
        "submitted_at": "date"
      },
      "attachments": ["string"],
      "created_at": "date",
      "updated_at": "date"
    }
  ],
  "pagination": {
    "currentPage": "integer",
    "totalPages": "integer",
    "totalItems": "integer",
    "itemsPerPage": "integer"
  },
  "message": "Service requests retrieved successfully"
}
```

##### Error Responses
- `403`: Access denied
- `500`: Failed to retrieve service requests

### Analytics Endpoints

#### Get Dashboard Statistics
- **URL**: `/analytics/dashboard`
- **Method**: `GET`
- **Access**: Private (Admin and shop managers)
- **Description**: Get dashboard statistics

##### Success Response
```json
{
  "success": true,
  "data": {
    "users": {
      "total": "integer",
      "recent": "integer",
      "byRole": {
        "admin": "integer",
        "agent": "integer",
        "farmer": "integer",
        "shop_manager": "integer"
      }
    },
    "orders": {
      "total": "integer",
      "recent": "integer",
      "revenue": {
        "total": "number",
        "last30Days": "number"
      }
    },
    "products": {
      "total": "integer",
      "inStock": "integer",
      "outOfStock": "integer"
    },
    "serviceRequests": {
      "total": "integer",
      "byStatus": {
        "pending": "integer",
        "assigned": "integer",
        "in_progress": "integer",
        "completed": "integer",
        "cancelled": "integer",
        "on_hold": "integer"
      }
    },
    "topProducts": [
      {
        "id": "string",
        "name": "string",
        "quantitySold": "integer",
        "revenue": "number"
      }
    ]
  },
  "message": "Dashboard statistics retrieved successfully"
}
```

##### Error Responses
- `500`: Failed to retrieve dashboard statistics

#### Get Sales Analytics
- **URL**: `/analytics/sales`
- **Method**: `GET`
- **Access**: Private (Admin and shop managers)
- **Description**: Get sales analytics

##### Query Parameters
- `start_date`: date (optional, default: 30 days ago)
- `end_date`: date (optional, default: today)

##### Success Response
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "string (YYYY-MM-DD)",
      "end": "string (YYYY-MM-DD)"
    },
    "totals": {
      "orders": "integer",
      "revenue": "number",
      "averageOrderValue": "number"
    },
    "trend": [
      {
        "date": "string (YYYY-MM-DD)",
        "orders": "integer",
        "revenue": "number"
      }
    ],
    "topProducts": [
      {
        "id": "string",
        "name": "string",
        "quantitySold": "integer",
        "revenue": "number"
      }
    ]
  },
  "message": "Sales analytics retrieved successfully"
}
```

##### Error Responses
- `400`: Start date must be before end date
- `500`: Failed to retrieve sales analytics

#### Get Product Analytics
- **URL**: `/analytics/products`
- **Method**: `GET`
- **Access**: Private (Admin and shop managers)
- **Description**: Get product analytics

##### Query Parameters
- `start_date`: date (optional, default: 30 days ago)
- `end_date`: date (optional, default: today)

##### Success Response
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "string (YYYY-MM-DD)",
      "end": "string (YYYY-MM-DD)"
    },
    "products": [
      {
        "productId": "string",
        "quantitySold": "integer",
        "revenue": "number",
        "orders": "integer",
        "lastOrdered": "date",
        "productName": "string",
        "category": "string",
        "currentStock": "integer",
        "status": "string"
      }
    ],
    "summary": {
      "totalProductsSold": "integer",
      "totalRevenue": "number",
      "totalOrders": "integer"
    }
  },
  "message": "Product analytics retrieved successfully"
}
```

##### Error Responses
- `500`: Failed to retrieve product analytics

#### Get User Analytics
- **URL**: `/analytics/users`
- **Method**: `GET`
- **Access**: Private (Admin only)
- **Description**: Get user analytics

##### Query Parameters
- `start_date`: date (optional, default: 30 days ago)
- `end_date`: date (optional, default: today)

##### Success Response
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "string (YYYY-MM-DD)",
      "end": "string (YYYY-MM-DD)"
    },
    "registrations": {
      "trend": [
        {
          "date": "string (YYYY-MM-DD)",
          "registrations": "integer",
          "byRole": {
            "admin": "integer",
            "agent": "integer",
            "farmer": "integer",
            "shop_manager": "integer"
          }
        }
      ],
      "total": "integer"
    },
    "activity": {
      "activeUsers": "integer"
    },
    "demographics": {
      "byRole": {
        "admin": "integer",
        "agent": "integer",
        "farmer": "integer",
        "shop_manager": "integer"
      },
      "byStatus": {
        "active": "integer",
        "inactive": "integer"
      }
    }
  },
  "message": "User analytics retrieved successfully"
}
```

##### Error Responses
- `500`: Failed to retrieve user analytics

#### Get Monthly Order Trends
- **URL**: `/analytics/orders/monthly`
- **Method**: `GET`
- **Access**: Private (Admin and shop managers)
- **Description**: Get monthly order trends

##### Query Parameters
- `start_date`: date (optional, default: 12 months ago)
- `end_date`: date (optional, default: today)

##### Success Response
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "string (YYYY-MM-DD)",
      "end": "string (YYYY-MM-DD)"
    },
    "trends": [
      {
        "period": "string (YYYY-MM)",
        "orders": "integer",
        "revenue": "number",
        "averageOrderValue": "number"
      }
    ],
    "summary": {
      "totalOrders": "integer",
      "totalRevenue": "number",
      "overallAverageOrderValue": "number"
    }
  },
  "message": "Monthly order trends retrieved successfully"
}
```

##### Error Responses
- `500`: Failed to retrieve monthly order trends

## 3. Data Models & ORM Mapping

### User Model
```typescript
interface IUser {
  _id: string;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'agent' | 'farmer' | 'shop_manager';
  status: 'active' | 'inactive';
  profile?: {
    age?: number;
    gender?: 'male' | 'female' | 'other';
    province?: string;
    district?: string;
    farm_size?: number;
    crops?: string[];
    specialization?: string[];
    service_areas?: string[];
    experience_years?: number;
    shop_name?: string;
    shop_location?: string;
    business_license?: string;
    farming_experience?: number;
    certification_type?: string;
  };
  created_at: Date;
  updated_at: Date;
}
```

### Product Model
```typescript
interface IProduct {
  _id: string;
  name: string;
  category: 'seeds' | 'fertilizers' | 'pesticides' | 'tools' | 'equipment' | 'produce' | 'organic_inputs' | 'livestock_feed' | 'irrigation' | 'other';
  description?: string;
  price: number;
  quantity: number;
  unit: 'kg' | 'g' | 'lb' | 'oz' | 'ton' | 'liter' | 'ml' | 'gallon' | 'piece' | 'dozen' | 'box' | 'bag' | 'bottle' | 'can' | 'packet';
  supplier_id: string;
  status: 'available' | 'out_of_stock' | 'discontinued';
  harvest_date?: Date;
  expiry_date?: Date;
  sku?: string;
  brand?: string;
  images?: string[];
  specifications?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}
```

### Order Model
```typescript
interface IOrder {
  _id: string;
  order_number: string;
  customer_id: string;
  items: {
    product_id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    total_price: number;
    specifications?: Record<string, any>;
  }[];
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'cash' | 'mobile_money' | 'bank_transfer' | 'credit_card' | 'debit_card';
  shipping_address: {
    full_name: string;
    phone: string;
    street_address: string;
    city: string;
    province: string;
    postal_code?: string;
    country: string;
  };
  billing_address?: {
    full_name: string;
    phone: string;
    street_address: string;
    city: string;
    province: string;
    postal_code?: string;
    country: string;
  };
  order_date: Date;
  expected_delivery_date?: Date;
  delivered_date?: Date;
  notes?: string;
  tracking_number?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Service Request Model
```typescript
interface IServiceRequest {
  _id: string;
  request_number: string;
  farmer_id: string;
  agent_id?: string;
  service_type: 'crop_consultation' | 'pest_control' | 'soil_testing' | 'irrigation_setup' | 'equipment_maintenance' | 'fertilizer_application' | 'harvest_assistance' | 'market_linkage' | 'training' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  requested_date: Date;
  preferred_date?: Date;
  scheduled_date?: Date;
  completed_date?: Date;
  location: {
    farm_name?: string;
    street_address: string;
    city: string;
    province: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    access_instructions?: string;
  };
  cost_estimate?: number;
  actual_cost?: number;
  notes?: string;
  feedback?: {
    rating: number;
    comment?: string;
    farmer_satisfaction: number;
    agent_professionalism: number;
    service_quality: number;
    would_recommend: boolean;
    submitted_at: Date;
  };
  attachments?: string[];
  created_at: Date;
  updated_at: Date;
}
```

## 4. Deployment Configuration

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/dashboard-avocado

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Application Information
APP_NAME=Dashboard Avocado Backend
APP_VERSION=1.0.0
```

### Production Deployment Steps

1. **Set up MongoDB database**
   - Install MongoDB or use a cloud service like MongoDB Atlas
   - Update `MONGODB_URI` in environment variables

2. **Configure environment variables**
   - Set `NODE_ENV=production`
   - Use a strong `JWT_SECRET`
   - Update `CORS_ORIGIN` to your frontend URL
   - Configure database connection string

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Start the application**
   ```bash
   npm start
   ```

### Docker Deployment (Optional)
Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/dashboard-avocado
      - JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

volumes:
  mongo_data:
```

### API Health Check
- **URL**: `/health`
- **Method**: `GET`
- **Description**: Check the health status of the API

##### Success Response
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "string",
    "uptime": "number",
    "memory": {
      "used": "number",
      "total": "number",
      "percentage": "number"
    }
  },
  "message": "Service is healthy"
}
```

### Rate Limiting
The API implements basic rate limiting to prevent abuse. Excessive requests will result in a 429 (Too Many Requests) response.

### Error Handling
All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "string",
  "message": "string"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Unprocessable Entity
- `429`: Too Many Requests
- `500`: Internal Server Error

## 5. Security Considerations

1. **Authentication**: All protected endpoints require a valid JWT token
2. **Authorization**: Role-based access control ensures users can only access appropriate endpoints
3. **Data Validation**: All input data is validated using express-validator
4. **Password Security**: Passwords are hashed using bcrypt with a cost factor of 12
5. **CORS**: Cross-Origin Resource Sharing is configured to only allow specified origins
6. **Environment Variables**: Sensitive configuration is stored in environment variables, not in code

## 6. Testing

To run tests:
```bash
npm test
```

The test suite includes:
- Unit tests for models and utilities
- Integration tests for API endpoints
- Authentication and authorization tests
- Data validation tests

## 7. Versioning

The API follows semantic versioning (SemVer). Breaking changes will result in a major version bump.

Current version: v1.0.0

## 8. Support

For support, please contact the development team or refer to the project documentation on GitHub.

# Shop Management API Documentation

## Overview
The Shop Management API provides endpoints for managing shops with role-based access control. Only **Admins** can create shops, while both **Admins** and **Shop Managers** can perform other CRUD operations.

## Base URL
```
/api/shops
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Shop (Admin Only)
**POST** `/api/shops/addshop`

**Access**: Admin only

**Request Body**:
```json
{
  "shopName": "string",
  "description": "string",
  "province": "string",
  "district": "string",
  "ownerName": "string",
  "ownerEmail": "string",
  "ownerPhone": "string"
}
```

**Example Request**:
```json
{
  "shopName": "Green Valley Avocado Shop",
  "description": "Premium avocado sales and distribution center",
  "province": "Eastern Province",
  "district": "Rwamagana",
  "ownerName": "John Doe",
  "ownerEmail": "john.doe@example.com",
  "ownerPhone": "+250788123456"
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "shopName": "Green Valley Avocado Shop",
    "description": "Premium avocado sales and distribution center",
    "province": "Eastern Province",
    "district": "Rwamagana",
    "ownerName": "John Doe",
    "ownerEmail": "john.doe@example.com",
    "ownerPhone": "+250788123456",
    "createdBy": "admin_user_id",
    "createdAt": "2025-10-27T10:30:00.000Z",
    "updatedAt": "2025-10-27T10:30:00.000Z"
  },
  "message": "Shop created successfully",
  "meta": {
    "timestamp": "2025-10-27T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

---

### 2. Get All Shops
**GET** `/api/shops`

**Access**: Admin, Shop Manager

**Query Parameters**: None

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "shopName": "Green Valley Avocado Shop",
      "description": "Premium avocado sales and distribution center",
      "province": "Eastern Province",
      "district": "Rwamagana",
      "ownerName": "John Doe",
      "ownerEmail": "john.doe@example.com",
      "ownerPhone": "+250788123456",
      "createdBy": "admin_user_id",
      "createdAt": "2025-10-27T10:30:00.000Z",
      "updatedAt": "2025-10-27T10:30:00.000Z"
    },
    {
      "id": 2,
      "shopName": "Mountain View Shop",
      "description": "Another shop",
      "province": "Northern Province",
      "district": "Musanze",
      "ownerName": "Jane Smith",
      "ownerEmail": "jane@example.com",
      "ownerPhone": "+250788654321",
      "createdBy": "admin_user_id",
      "createdAt": "2025-10-27T11:00:00.000Z",
      "updatedAt": "2025-10-27T11:00:00.000Z"
    }
  ],
  "message": "Shops retrieved successfully",
  "meta": {
    "timestamp": "2025-10-27T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

---

### 3. Get Single Shop
**GET** `/api/shops/:id`

**Access**: Admin, Shop Manager

**URL Parameters**:
- `id` (required): Shop ID (integer)

**Example**: `GET /api/shops/1`

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "shopName": "Green Valley Avocado Shop",
    "description": "Premium avocado sales and distribution center",
    "province": "Eastern Province",
    "district": "Rwamagana",
    "ownerName": "John Doe",
    "ownerEmail": "john.doe@example.com",
    "ownerPhone": "+250788123456",
    "createdBy": "admin_user_id",
    "createdAt": "2025-10-27T10:30:00.000Z",
    "updatedAt": "2025-10-27T10:30:00.000Z"
  },
  "message": "Shop retrieved successfully",
  "meta": {
    "timestamp": "2025-10-27T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

---

### 4. Update Shop
**PUT** `/api/shops/:id`

**Access**: Admin, Shop Manager

**URL Parameters**:
- `id` (required): Shop ID (integer)

**Request Body** (all fields optional):
```json
{
  "shopName": "string",
  "description": "string",
  "province": "string",
  "district": "string",
  "ownerName": "string",
  "ownerEmail": "string",
  "ownerPhone": "string"
}
```

**Example Request**:
```json
{
  "description": "Updated description for the shop",
  "ownerPhone": "+250788654321"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "shopName": "Green Valley Avocado Shop",
    "description": "Updated description for the shop",
    "province": "Eastern Province",
    "district": "Rwamagana",
    "ownerName": "John Doe",
    "ownerEmail": "john.doe@example.com",
    "ownerPhone": "+250788654321",
    "createdBy": "admin_user_id",
    "createdAt": "2025-10-27T10:30:00.000Z",
    "updatedAt": "2025-10-27T11:15:00.000Z"
  },
  "message": "Shop updated successfully",
  "meta": {
    "timestamp": "2025-10-27T11:15:00.000Z",
    "version": "1.0.0"
  }
}
```

---

### 5. Delete Shop
**DELETE** `/api/shops/:id`

**Access**: Admin, Shop Manager

**URL Parameters**:
- `id` (required): Shop ID (integer)

**Example**: `DELETE /api/shops/1`

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "shopName": "Green Valley Avocado Shop",
    "description": "Premium avocado sales and distribution center",
    "province": "Eastern Province",
    "district": "Rwamagana",
    "ownerName": "John Doe",
    "ownerEmail": "john.doe@example.com",
    "ownerPhone": "+250788123456",
    "createdBy": "admin_user_id",
    "createdAt": "2025-10-27T10:30:00.000Z",
    "updatedAt": "2025-10-27T10:30:00.000Z"
  },
  "message": "Shop deleted successfully",
  "meta": {
    "timestamp": "2025-10-27T11:20:00.000Z",
    "version": "1.0.0"
  }
}
```

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Shop name is required",
      "path": "shopName",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token is required",
  "meta": {
    "timestamp": "2025-10-27T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admins only",
  "meta": {
    "timestamp": "2025-10-27T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Shop not found",
  "meta": {
    "timestamp": "2025-10-27T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create shop",
  "meta": {
    "timestamp": "2025-10-27T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

---

## Role-Based Access Control

| Endpoint | Admin | Shop Manager | Farmer | Agent |
|----------|-------|--------------|--------|-------|
| POST /addshop | ✅ | ❌ | ❌ | ❌ |
| GET / | ✅ | ✅ | ❌ | ❌ |
| GET /:id | ✅ | ✅ | ❌ | ❌ |
| PUT /:id | ✅ | ✅ | ❌ | ❌ |
| DELETE /:id | ✅ | ✅ | ❌ | ❌ |

---

## Validation Rules

### Shop Creation (POST /addshop)
- **shopName**: Required, 2-200 characters
- **description**: Required, max 1000 characters
- **province**: Required
- **district**: Required
- **ownerName**: Required, min 2 characters
- **ownerEmail**: Required, valid email format
- **ownerPhone**: Required, valid phone format (10-15 digits)

### Shop Update (PUT /:id)
- All fields are optional
- Same validation rules apply when field is provided

---

## Testing with cURL

### Create a shop (as Admin):
```bash
curl -X POST http://localhost:5000/api/shops/addshop \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "shopName": "Green Valley Avocado Shop",
    "description": "Premium avocado sales and distribution center",
    "province": "Eastern Province",
    "district": "Rwamagana",
    "ownerName": "John Doe",
    "ownerEmail": "john.doe@example.com",
    "ownerPhone": "+250788123456"
  }'
```

### Get all shops:
```bash
curl -X GET http://localhost:5000/api/shops \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update a shop:
```bash
curl -X PUT http://localhost:5000/api/shops/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "description": "Updated shop description"
  }'
```

### Delete a shop:
```bash
curl -X DELETE http://localhost:5000/api/shops/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

1. **In-Memory Storage**: Currently using in-memory storage for demonstration. Replace with a proper database model (MongoDB) in production.

2. **Shop Manager Access**: Shop managers can see all shops created by admins and perform all CRUD operations except creation.

3. **Authentication**: All endpoints require a valid JWT token with appropriate role permissions.

4. **ID Generation**: Shop IDs are automatically generated as auto-incrementing integers (1, 2, 3, ...) in ascending order.

5. **Timestamps**: All shops have `createdAt` and `updatedAt` timestamps that are automatically managed.
