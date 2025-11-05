# Territory-Based Farmer Filtering

## Overview
The FarmerList component now automatically filters farmers based on the logged-in agent's assigned territories. This ensures agents only see farmers within their designated districts and sectors.

## How It Works

### 1. Agent Territory Fetching
On component mount, the system:
- Fetches the agent's profile using `getAgentInformation()`
- Extracts the `territory` array from `agent_profile.territory`
- Stores territories in `agentTerritories` state

### 2. Farmer Filtering Logic
The `filterFarmersByTerritory()` function:
- Compares each farmer's `profile.district` and `profile.sector`
- Matches against all territories in the agent's `territory` array
- Returns only farmers whose location (district AND sector) matches any agent territory

### 3. Matching Criteria
A farmer is shown if:
```javascript
farmer.profile.district === territory.district 
AND 
farmer.profile.sector === territory.sector
```

### 4. Data Flow
```
Agent Login 
  → Fetch Agent Profile (territory array)
  → Fetch All Farmers from API
  → Filter by Territory (client-side)
  → Display Filtered List
```

## Territory Structure

### Agent Territory Format
```json
{
  "territory": [
    {
      "district": "Gatsibo",
      "sector": "Kageyo",
      "isPrimary": true,
      "assignedDate": "2024-01-15"
    },
    {
      "district": "Gicumbi",
      "sector": "Mutete",
      "isPrimary": false,
      "assignedDate": "2024-02-01"
    }
  ]
}
```

### Farmer Location Format
```json
{
  "profile": {
    "province": "Eastern Province",
    "district": "Gatsibo",
    "sector": "Kageyo"
  }
}
```

## Visual Indicators

### Territory Info Banner
Shows:
- List of all assigned territories (district - sector)
- Primary territory badge
- Count: "X of Y total farmers match your territory"

### Stats Card
- Shows filtered count in main number
- Shows total count below (if different)
- Label changes to "Farmers in Territory"

## Fallback Behavior

### No Territories Assigned
- Shows all farmers (no filtering)
- No territory banner displayed
- Stats show full count

### API Error
- Falls back to showing all farmers
- Logs error to console
- Continues functioning normally

## Benefits

✅ **No Backend Changes Required** - All filtering done client-side
✅ **Real-time Filtering** - Updates immediately when territories change
✅ **Multiple Territories** - Supports agents with multiple district/sector assignments
✅ **Transparent** - Visual indicators show what's being filtered
✅ **Safe Fallback** - Gracefully handles missing data

## Example Scenarios

### Scenario 1: Agent with Single Territory
- Agent assigned: Gatsibo - Kageyo
- Total farmers in system: 8
- Farmers in Gatsibo/Kageyo: 3
- **Result**: Shows 3 farmers

### Scenario 2: Agent with Multiple Territories
- Agent assigned: 
  - Gatsibo - Kageyo (Primary)
  - Gicumbi - Mutete
- Total farmers: 8
- Farmers in Gatsibo/Kageyo: 3
- Farmers in Gicumbi/Mutete: 2
- **Result**: Shows 5 farmers

### Scenario 3: Admin or No Territory
- No territories assigned
- Total farmers: 8
- **Result**: Shows all 8 farmers

## Code Locations

- **Component**: `src/Pages/Agent/FarmerList.jsx`
- **Service**: `src/services/agent-information.js`
- **Filter Function**: Lines ~210-230 in FarmerList.jsx
- **Territory Fetch**: Lines ~145-165 in FarmerList.jsx
- **Visual Indicator**: Lines ~493-525 in FarmerList.jsx
