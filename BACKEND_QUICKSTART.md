# 🚀 Quick Start - Backend Implementation

## Endpoint to Create

```
GET /api/service-requests/harvest/agent/me
```

## What It Does

Returns all harvest requests created by the authenticated agent (extracted from JWT token).

## Required Headers

```
Authorization: Bearer <jwt_token>
```

## Response Example

```json
{
  "success": true,
  "data": [
    {
      "id": "67890",
      "request_number": "REQ-001",
      "agent_id": "68c7f1428b4e787b3dc49467",
      "farmer_id": "12345",
      "status": "pending",
      "harvest_details": {
        "workers_needed": 5,
        "trees_to_harvest": 100,
        "harvest_date_from": "2024-12-01",
        "harvest_date_to": "2024-12-05"
      },
      "farmer_info": {
        "name": "John Doe",
        "phone": "+250788123456"
      },
      "location": {
        "province": "Eastern",
        "district": "Rwamagana"
      },
      "created_at": "2024-11-06T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 1
  }
}
```

## Database Changes Needed

```sql
-- 1. Add agent_id column
ALTER TABLE service_requests 
ADD COLUMN agent_id VARCHAR(255);

-- 2. Add index for performance
CREATE INDEX idx_agent_id ON service_requests(agent_id);
```

## Implementation Steps

### 1. Update POST Endpoint (Save agent_id)

When creating harvest requests, save the agent_id:

```javascript
// In createHarvestRequest controller
const agentId = req.user.id; // From JWT token

await db.query(`
  INSERT INTO service_requests (
    farmer_id, 
    agent_id,     -- ADD THIS
    service_type,
    harvest_details,
    status
  ) VALUES ($1, $2, 'harvest', $3, 'pending')
`, [farmer_id, agentId, harvest_details]);
```

### 2. Create GET Endpoint

```javascript
// routes/serviceRequests.js
router.get('/harvest/agent/me', authenticateToken, getAgentHarvestRequests);

// controllers/serviceRequestsController.js
exports.getAgentHarvestRequests = async (req, res) => {
  try {
    const agentId = req.user.id; // From JWT middleware
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM service_requests
      WHERE agent_id = $1 AND service_type = 'harvest'
    `, [agentId]);
    
    // Get data with farmer info
    const dataResult = await db.query(`
      SELECT 
        sr.*,
        json_build_object(
          'name', f.name,
          'phone', f.phone,
          'email', f.email
        ) as farmer_info
      FROM service_requests sr
      LEFT JOIN farmers f ON sr.farmer_id = f.id
      WHERE sr.agent_id = $1 AND sr.service_type = 'harvest'
      ORDER BY sr.created_at DESC
      LIMIT $2 OFFSET $3
    `, [agentId, limit, offset]);
    
    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        total_pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving harvest requests'
    });
  }
};
```

## Testing with cURL

```bash
# Replace YOUR_JWT_TOKEN with actual token
curl -X GET "http://localhost:5000/api/service-requests/harvest/agent/me" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Expected Result

- Returns only requests created by the authenticated agent
- Includes farmer information
- Supports pagination
- Orders by newest first

## Full Documentation

See **AGENT_ENDPOINT_GUIDE.md** for complete details including:
- Error handling
- Query parameters (status, date filters)
- Database schema
- Full code examples
- Testing checklist

---

**Questions?** Check AGENT_ENDPOINT_GUIDE.md or contact the frontend team.
