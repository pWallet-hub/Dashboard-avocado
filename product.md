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

