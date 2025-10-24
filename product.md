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

