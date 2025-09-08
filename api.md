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