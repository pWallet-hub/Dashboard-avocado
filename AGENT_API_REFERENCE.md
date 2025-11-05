# Agent API Quick Reference Guide

## Base URL
```
https://dash-api-hnyp.onrender.com/api
```

## Authentication
All requests require JWT token in header:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

---

## 1. GET Agent Profile

### Request
```http
GET /agent-information
Authorization: Bearer YOUR_JWT_TOKEN
```

### Success Response (200 OK)
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
  }
}
```

### Error Responses
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User is not an agent
- **404 Not Found**: User not found

---

## 2. POST Create Agent Profile

### Request
```http
POST /agent-information/create
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Request Body (All fields optional)
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

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "user_info": { /* same structure as GET */ },
    "agent_profile": { /* same structure as GET */ }
  }
}
```

### Error Responses
- **400 Bad Request**: Profile already exists
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User is not an agent

---

## 3. PUT Update Agent Profile

### Request
```http
PUT /agent-information
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Request Body (All fields optional - send only what you want to update)

#### Full Update Example
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

#### Minimal Update Example
```json
{
  "specialization": "Avocado Quality Control Specialist",
  "experience": "6 years"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user_info": { /* updated user info */ },
    "agent_profile": { /* updated agent profile */ }
  }
}
```

### Error Responses
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User is not an agent
- **404 Not Found**: User not found

---

## 4. PUT Update Performance Metrics

### Request
```http
PUT /agent-information/performance
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Request Body
```json
{
  "farmersAssisted": 250,
  "totalTransactions": 500,
  "performance": "90%"
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Performance metrics updated successfully",
  "data": {
    "user_info": { /* user info */ },
    "agent_profile": { /* updated agent profile with new metrics */ }
  }
}
```

---

## Field Reference

### User Info Fields
| Field | Type | Editable | Description |
|-------|------|----------|-------------|
| id | string | No | User unique identifier |
| full_name | string | Yes | User's full name |
| email | string | Yes | User's email address |
| phone | string | Yes | User's phone number |
| role | string | No | Always "agent" |
| status | string | No | Account status (active/inactive) |
| created_at | date | No | Account creation date |
| updated_at | date | No | Last update date |

### Agent Profile Fields
| Field | Type | Editable | Description |
|-------|------|----------|-------------|
| agentId | string | No | Auto-generated (AGT000001, etc.) |
| province | string | Yes | Operational province |
| district | string | Yes | Operational district |
| sector | string | Yes | Operational sector |
| cell | string | Yes | Operational cell |
| village | string | Yes | Operational village |
| specialization | string | Yes | Area of expertise |
| experience | string | Yes | Years of experience |
| certification | string | Yes | Professional certifications |
| farmersAssisted | number | Yes | Number of farmers helped |
| totalTransactions | number | Yes | Total transactions completed |
| performance | string | Yes | Performance percentage (e.g., "85%") |
| profileImage | string | Yes | Profile image URL |

---

## JavaScript Examples

### Fetch Agent Profile
```javascript
import { getAgentInformation } from './services/agent-information';

const fetchProfile = async () => {
  try {
    const response = await getAgentInformation();
    const { user_info, agent_profile } = response;
    console.log('Agent:', user_info.full_name);
    console.log('ID:', agent_profile.agentId);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Update Agent Profile
```javascript
import { updateAgentInformation } from './services/agent-information';

const updateProfile = async () => {
  try {
    const updateData = {
      full_name: "John Updated",
      phone: "+250788999888",
      specialization: "Senior Consultant",
      experience: "7 years",
      farmersAssisted: 200,
      totalTransactions: 450,
      performance: "92%"
    };
    
    const response = await updateAgentInformation(updateData);
    console.log('Updated successfully:', response);
  } catch (error) {
    console.error('Update failed:', error.message);
  }
};
```

### Update Performance Only
```javascript
import { updateAgentPerformance } from './services/agent-information';

const updateMetrics = async () => {
  try {
    const metrics = {
      farmersAssisted: 250,
      totalTransactions: 500,
      performance: "90%"
    };
    
    const response = await updateAgentPerformance(metrics);
    console.log('Metrics updated:', response);
  } catch (error) {
    console.error('Update failed:', error.message);
  }
};
```

---

## Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful (GET, PUT) |
| 201 | Created | Resource created successfully (POST) |
| 400 | Bad Request | Invalid request data or profile already exists |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User does not have agent role |
| 404 | Not Found | User or resource not found |
| 500 | Server Error | Internal server error |

---

## Notes

1. **Authentication Required**: All endpoints require a valid JWT token
2. **Role Restriction**: Only users with role "agent" can access these endpoints
3. **Auto-generation**: AgentId is automatically generated in sequential format
4. **Upsert Behavior**: Update endpoint creates profile if it doesn't exist
5. **Optional Fields**: All profile fields are optional in POST/PUT requests
6. **Data Types**: Ensure correct types (numbers for counts, strings for text)
7. **Phone Format**: Use international format (e.g., +250788123456)
8. **Performance Format**: Use percentage string (e.g., "85%", "92%")

---

## Error Handling Best Practices

```javascript
const handleAgentOperation = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await getAgentInformation();
    // Process response
    
  } catch (err) {
    console.error('Operation failed:', err);
    
    if (err.message.includes('403')) {
      setError('Access denied. Agent role required.');
    } else if (err.message.includes('401')) {
      setError('Please log in again.');
      // Redirect to login
    } else if (err.message.includes('404')) {
      setError('Profile not found.');
    } else {
      setError(err.message || 'An error occurred');
    }
  } finally {
    setLoading(false);
  }
};
```
