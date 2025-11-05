# Agent Information API Documentation

## Overview
The Agent Information API provides endpoints for managing agent profiles in the Dashboard Avocado Backend system. Agents can create, retrieve, and update their profile information including location, specialization, certifications, and performance metrics.

## Base URL
```
http://localhost:5000/api/agent-information
```

## Authentication
All endpoints require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Role Requirements
- **Role**: `agent`
- Only users with the `agent` role can access these endpoints
- Attempting to access with other roles will result in a 403 Forbidden error

---

## Endpoints

### 1. Get Agent Profile
Retrieve the current authenticated agent's profile information.

**Endpoint**: `GET /api/agent-information`

**Authentication**: Required

**Headers**:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user_info": {
      "id": "673a1b2c3d4e5f6789abcdef",
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+250788123456",
      "role": "agent",
      "status": "active",
      "created_at": "2023-01-15T08:30:00Z",
      "updated_at": "2024-11-05T10:45:00Z"
    },
    "agent_profile": {
      "agentId": "AGT000001",
      "province": "Eastern Province",
      "district": "Gatsibo",
      "sector": "Kiramuruzi",
      "cell": "Karangazi",
      "village": "Rukomo",
      "specialization": "Avocado Farming Expert",
      "experience": "5 years",
      "certification": "Agricultural Extension Certificate - Level 3",
      "farmersAssisted": 150,
      "totalTransactions": 350,
      "performance": "85%",
      "profileImage": "https://example.com/profile.jpg"
    }
  },
  "meta": {
    "timestamp": "2024-11-05T10:45:00Z",
    "version": "1.0.0"
  }
}
```

**Error Responses**:

- **401 Unauthorized**: Missing or invalid JWT token
```json
{
  "success": false,
  "message": "User ID not found in token",
  "meta": {
    "timestamp": "2024-11-05T10:45:00Z",
    "version": "1.0.0"
  }
}
```

- **403 Forbidden**: User is not an agent
```json
{
  "success": false,
  "message": "Access denied. This endpoint is for agents only",
  "meta": {
    "timestamp": "2024-11-05T10:45:00Z",
    "version": "1.0.0"
  }
}
```

- **404 Not Found**: User not found
```json
{
  "success": false,
  "message": "User not found",
  "meta": {
    "timestamp": "2024-11-05T10:45:00Z",
    "version": "1.0.0"
  }
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:5000/api/agent-information \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2. Create Agent Profile
Create a new agent profile for the authenticated agent (first-time setup).

**Endpoint**: `POST /api/agent-information/create`

**Authentication**: Required

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
  "province": "Eastern Province",
  "district": "Gatsibo",
  "sector": "Kiramuruzi",
  "cell": "Karangazi",
  "village": "Rukomo",
  "specialization": "Avocado Farming Expert",
  "experience": "5 years",
  "certification": "Agricultural Extension Certificate - Level 3",
  "farmersAssisted": 150,
  "totalTransactions": 350,
  "performance": "85%",
  "profileImage": "https://example.com/profile.jpg"
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| province | string | Optional | Agent's operational province |
| district | string | Optional | Agent's operational district |
| sector | string | Optional | Agent's operational sector |
| cell | string | Optional | Agent's operational cell |
| village | string | Optional | Agent's operational village |
| specialization | string | Optional | Agent's area of expertise |
| experience | string | Optional | Years of experience (e.g., "5 years") |
| certification | string | Optional | Professional certifications |
| farmersAssisted | number | Optional | Number of farmers helped (default: 0) |
| totalTransactions | number | Optional | Total transactions completed (default: 0) |
| performance | string | Optional | Performance percentage (e.g., "85%") |
| profileImage | string | Optional | URL to profile image |

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "user_info": {
      "id": "673a1b2c3d4e5f6789abcdef",
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+250788123456",
      "role": "agent",
      "status": "active",
      "created_at": "2023-01-15T08:30:00Z",
      "updated_at": "2024-11-05T10:45:00Z"
    },
    "agent_profile": {
      "agentId": "AGT000001",
      "province": "Eastern Province",
      "district": "Gatsibo",
      "sector": "Kiramuruzi",
      "cell": "Karangazi",
      "village": "Rukomo",
      "specialization": "Avocado Farming Expert",
      "experience": "5 years",
      "certification": "Agricultural Extension Certificate - Level 3",
      "farmersAssisted": 150,
      "totalTransactions": 350,
      "performance": "85%",
      "profileImage": "https://example.com/profile.jpg"
    }
  },
  "meta": {
    "timestamp": "2024-11-05T10:45:00Z",
    "version": "1.0.0"
  }
}
```

**Error Responses**:

- **400 Bad Request**: Profile already exists
```json
{
  "success": false,
  "message": "Agent profile already exists",
  "meta": {
    "timestamp": "2024-11-05T10:45:00Z",
    "version": "1.0.0"
  }
}
```

- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User is not an agent
- **404 Not Found**: User not found

**Notes**:
- The `agentId` is auto-generated in the format `AGT000001`, `AGT000002`, etc.
- All fields in the request body are optional
- Once created, use the UPDATE endpoint to modify the profile

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/agent-information/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "province": "Eastern Province",
    "district": "Gatsibo",
    "sector": "Kiramuruzi",
    "cell": "Karangazi",
    "village": "Rukomo",
    "specialization": "Avocado Farming Expert",
    "experience": "5 years",
    "certification": "Agricultural Extension Certificate - Level 3",
    "farmersAssisted": 150,
    "totalTransactions": 350,
    "performance": "85%",
    "profileImage": "https://example.com/profile.jpg"
  }'
```

---

### 3. Update Agent Profile
Update the authenticated agent's profile information.

**Endpoint**: `PUT /api/agent-information`

**Authentication**: Required

**Headers**:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Request Body** (All fields are optional):
```json
{
  "full_name": "John Updated Doe",
  "phone": "+250788999888",
  "email": "john.updated@example.com",
  "province": "Western Province",
  "district": "Rubavu",
  "sector": "Gisenyi",
  "cell": "Umuganda",
  "village": "Nyundo",
  "specialization": "Senior Avocado Farming Consultant",
  "experience": "7 years",
  "certification": "Advanced Agricultural Extension Certificate - Level 4",
  "farmersAssisted": 200,
  "totalTransactions": 450,
  "performance": "92%",
  "profileImage": "https://example.com/new-profile.jpg"
}
```

**Minimal Update Example**:
```json
{
  "specialization": "Avocado Quality Control Specialist",
  "experience": "6 years"
}
```

**Field Descriptions**:
| Field | Type | Description |
|-------|------|-------------|
| full_name | string | Update user's full name |
| phone | string | Update user's phone number |
| email | string | Update user's email address |
| province | string | Update operational province |
| district | string | Update operational district |
| sector | string | Update operational sector |
| cell | string | Update operational cell |
| village | string | Update operational village |
| specialization | string | Update area of expertise |
| experience | string | Update years of experience |
| certification | string | Update professional certifications |
| farmersAssisted | number | Update number of farmers helped |
| totalTransactions | number | Update total transactions completed |
| performance | string | Update performance percentage |
| profileImage | string | Update profile image URL |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user_info": {
      "id": "673a1b2c3d4e5f6789abcdef",
      "full_name": "John Updated Doe",
      "email": "john.updated@example.com",
      "phone": "+250788999888",
      "role": "agent",
      "status": "active",
      "created_at": "2023-01-15T08:30:00Z",
      "updated_at": "2024-11-05T11:00:00Z"
    },
    "agent_profile": {
      "agentId": "AGT000001",
      "province": "Western Province",
      "district": "Rubavu",
      "sector": "Gisenyi",
      "cell": "Umuganda",
      "village": "Nyundo",
      "specialization": "Senior Avocado Farming Consultant",
      "experience": "7 years",
      "certification": "Advanced Agricultural Extension Certificate - Level 4",
      "farmersAssisted": 200,
      "totalTransactions": 450,
      "performance": "92%",
      "profileImage": "https://example.com/new-profile.jpg"
    }
  },
  "meta": {
    "timestamp": "2024-11-05T11:00:00Z",
    "version": "1.0.0"
  }
}
```

**Error Responses**:
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User is not an agent
- **404 Not Found**: User not found

**Notes**:
- All fields are optional - only send the fields you want to update
- The `agentId` cannot be changed (it's auto-generated and permanent)
- User basic information (full_name, phone, email) updates the User model
- Other fields update the AgentProfile model
- If no profile exists, it will be created automatically (upsert)

**cURL Example**:
```bash
curl -X PUT http://localhost:5000/api/agent-information \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "specialization": "Senior Avocado Farming Consultant",
    "experience": "7 years",
    "performance": "92%"
  }'
```

---

### 4. Update Performance Metrics
Quick update for agent performance metrics only.

**Endpoint**: `PUT /api/agent-information/performance`

**Authentication**: Required

**Headers**:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Request Body** (At least one field required):
```json
{
  "farmersAssisted": 180,
  "totalTransactions": 400,
  "performance": "88%"
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| farmersAssisted | number | Optional | Number of farmers helped |
| totalTransactions | number | Optional | Total transactions completed |
| performance | string | Optional | Performance percentage |

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Performance metrics updated successfully",
  "data": {
    "user_info": {
      "id": "673a1b2c3d4e5f6789abcdef",
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+250788123456",
      "role": "agent",
      "status": "active",
      "created_at": "2023-01-15T08:30:00Z",
      "updated_at": "2024-11-05T10:45:00Z"
    },
    "agent_profile": {
      "agentId": "AGT000001",
      "province": "Eastern Province",
      "district": "Gatsibo",
      "sector": "Kiramuruzi",
      "cell": "Karangazi",
      "village": "Rukomo",
      "specialization": "Avocado Farming Expert",
      "experience": "5 years",
      "certification": "Agricultural Extension Certificate - Level 3",
      "farmersAssisted": 180,
      "totalTransactions": 400,
      "performance": "88%",
      "profileImage": "https://example.com/profile.jpg"
    }
  },
  "meta": {
    "timestamp": "2024-11-05T11:15:00Z",
    "version": "1.0.0"
  }
}
```

**Error Responses**:

- **400 Bad Request**: No valid performance data provided
```json
{
  "success": false,
  "message": "No valid performance data provided",
  "meta": {
    "timestamp": "2024-11-05T10:45:00Z",
    "version": "1.0.0"
  }
}
```

- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User is not an agent
- **404 Not Found**: User not found

**Notes**:
- This is a convenience endpoint for updating only performance-related fields
- At least one field must be provided in the request body
- Use this when you only need to update metrics without changing other profile data

**cURL Example**:
```bash
curl -X PUT http://localhost:5000/api/agent-information/performance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "farmersAssisted": 180,
    "totalTransactions": 400,
    "performance": "88%"
  }'
```

---

## Data Models

### User Info Object
```typescript
{
  id: string;              // MongoDB ObjectId
  full_name: string;       // Agent's full name
  email: string;           // Agent's email address
  phone?: string;          // Agent's phone number (optional)
  role: string;            // Always "agent" for this endpoint
  status: string;          // Account status (e.g., "active", "inactive")
  created_at: Date;        // Account creation timestamp
  updated_at: Date;        // Last update timestamp
}
```

### Agent Profile Object
```typescript
{
  agentId: string;              // Auto-generated unique ID (AGT000001, AGT000002, etc.)
  province?: string;            // Operational province
  district?: string;            // Operational district
  sector?: string;              // Operational sector
  cell?: string;                // Operational cell
  village?: string;             // Operational village
  specialization?: string;      // Area of expertise
  experience?: string;          // Years of experience
  certification?: string;       // Professional certifications
  farmersAssisted?: number;     // Number of farmers helped (default: 0)
  totalTransactions?: number;   // Total transactions (default: 0)
  performance?: string;         // Performance percentage
  profileImage?: string;        // Profile image URL
}
```

---

## Common Response Structure

### Success Response
```json
{
  "success": true,
  "message": "Descriptive success message",
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-11-05T10:45:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Descriptive error message",
  "meta": {
    "timestamp": "2024-11-05T10:45:00Z",
    "version": "1.0.0"
  }
}
```

---

## HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 OK | Request successful (GET, PUT) |
| 201 Created | Resource created successfully (POST) |
| 400 Bad Request | Invalid request data or duplicate resource |
| 401 Unauthorized | Missing or invalid authentication token |
| 403 Forbidden | Insufficient permissions (not an agent) |
| 404 Not Found | Resource not found |
| 500 Internal Server Error | Server error |

---

## Authentication Flow

1. **Login** to get JWT token:
   ```
   POST /api/auth/login
   ```

2. **Use token** in subsequent requests:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

3. **Token contains**:
   - User ID
   - Role (must be "agent")
   - Expiration time

---

## Agent ID Format

Agent IDs are auto-generated with the following format:
- **Prefix**: `AGT`
- **Number**: 6 digits, zero-padded
- **Examples**: `AGT000001`, `AGT000002`, `AGT000123`, `AGT999999`

The ID is automatically incremented based on the last created agent.

---

## Usage Examples

### Complete Workflow

#### 1. Login as Agent
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "password123"
  }'
```

Response:
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

#### 2. Create Profile (First Time)
```bash
curl -X POST http://localhost:5000/api/agent-information/create \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "province": "Eastern Province",
    "district": "Gatsibo",
    "specialization": "Avocado Farming Expert"
  }'
```

#### 3. Get Current Profile
```bash
curl -X GET http://localhost:5000/api/agent-information \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 4. Update Profile
```bash
curl -X PUT http://localhost:5000/api/agent-information \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "experience": "6 years",
    "certification": "Advanced Level Certificate"
  }'
```

#### 5. Update Performance Metrics
```bash
curl -X PUT http://localhost:5000/api/agent-information/performance \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "farmersAssisted": 200,
    "performance": "90%"
  }'
```

---

## Testing Endpoints

### Using Postman

1. **Set Base URL**: `http://localhost:5000`
2. **Set Authorization**:
   - Type: Bearer Token
   - Token: Your JWT token from login
3. **Set Headers**:
   - Content-Type: application/json

### Using Thunder Client (VS Code)

1. Create new request
2. Select method (GET, POST, PUT)
3. Enter URL
4. Add Authorization header with Bearer token
5. Add request body (for POST/PUT)
6. Send request

---

## Error Handling

### Common Errors

**Profile Already Exists**:
- Occurs when trying to create a profile that already exists
- Solution: Use PUT endpoint to update instead

**Invalid Token**:
- Occurs when JWT token is missing, expired, or invalid
- Solution: Login again to get a new token

**Wrong Role**:
- Occurs when non-agent users try to access agent endpoints
- Solution: Ensure the user has the "agent" role

**Profile Not Found**:
- Occurs when accessing a profile that doesn't exist
- Solution: Create profile first using POST /create endpoint

---

## Best Practices

1. **Always validate token expiration** before making requests
2. **Store JWT token securely** (not in localStorage for production)
3. **Use HTTPS in production** to encrypt data in transit
4. **Handle errors gracefully** with proper error messages
5. **Update only necessary fields** to minimize data transfer
6. **Use the /performance endpoint** for frequent metric updates
7. **Keep profile images optimized** (recommended max 2MB)

---

## Support

For issues or questions:
- **API Version**: 1.0.0
- **Last Updated**: November 5, 2025
- **Server**: http://localhost:5000
- **Environment**: Development

---

## Changelog

### Version 1.0.0 (November 5, 2025)
- Initial release
- GET /api/agent-information - Retrieve agent profile
- POST /api/agent-information/create - Create agent profile
- PUT /api/agent-information - Update agent profile
- PUT /api/agent-information/performance - Update performance metrics
- Auto-generated agent IDs (AGT000001 format)
- JWT authentication required
- Role-based access control (agents only)
