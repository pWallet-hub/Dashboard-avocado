# Schedule Harvesting Plan & IPM Routine Pages

## Overview
Two new scheduling pages have been created to allow farmers to request advanced agricultural services with agent coordination. Both pages follow the established HarvestingDay.jsx pattern but with different fields and purposes.

---

## 1. Schedule Harvesting Plan

**File:** `src/Pages/Farmer/ScheduleHarvestingPlan.jsx`

### Purpose
Allows farmers to plan their harvest in advance, coordinating resources, labor, equipment, and market arrangements before the actual harvest begins.

### Key Features
- **Planned Harvest Date**: Schedule the harvest date in advance
- **Yield Estimation**: Input estimated yield in kilograms
- **Farm Size**: Specify farm size in hectares
- **Preparation Activities**: Multi-select modal for pre-harvest activities
  - Pruning and trimming
  - Pest control
  - Irrigation check
  - Soil testing
  - Access road preparation
  - Crate preparation
- **Labor Requirement**: Number of workers needed
- **Equipment Selection**: Multi-select modal for required equipment
  - Harvest Clipper
  - Picking Poles
  - Plastic crates
  - Ladders
  - Sorting tables
  - Weighing scale
- **Transport Arrangement**: Optional transport planning
- **Storage Needs**: Cold storage, warehouse requirements
- **Quality Standards**: Export quality, local market, etc.
- **Market Target**: Where the harvest will be sold (required field)
- **Special Instructions**: Additional notes and requirements

### Data Structure
```javascript
{
  plannedHarvestDate: "2024-05-15",
  estimatedYield: 5000,
  farmSize: 2.5,
  preparationNeeded: ["Pruning and trimming", "Pest control"],
  laborRequirement: 10,
  equipmentRequired: ["Harvest Clipper", "Plastic crates"],
  transportArrangement: "Pickup truck",
  storageNeeded: "Cold storage",
  qualityStandards: "Export quality",
  marketTarget: "Export",
  specialInstructions: "...",
  location: {...},
  farmerInfo: {...},
  agentInfo: {...},
  priority: "medium",
  notes: "..."
}
```

### API Endpoint
- **POST** `/service-requests/harvesting-plan`

### Service Function
`createHarvestingPlanRequest(planData)` in `serviceRequestsService.js`

---

## 2. Schedule IPM Routine

**File:** `src/Pages/Farmer/ScheduleIPMRoutine.jsx`

### Purpose
Allows farmers to request Integrated Pest Management (IPM) services where an agent performs pest control work on behalf of the farmer.

### Key Features
- **Scheduled Date**: When the IPM routine should be performed
- **Farm Size**: Area to be treated in hectares
- **Pest/Disease Type**: Multi-select modal for target pests
  - Avocado Thrips
  - Mites
  - Fruit Flies
  - Scale Insects
  - Stem Borers
  - Anthracnose
  - Root Rot
  - Cercospora Spot
  - Other
- **IPM Methods**: Multi-select modal for treatment approaches
  - Biological Control
  - Cultural Practices
  - Mechanical Control
  - Chemical Control
  - Organic Pesticides
  - Traps and Monitoring
  - Pruning Infected Parts
  - Soil Management
- **Chemicals Needed**: Optional specification of required chemicals
- **Equipment Needed**: Multi-select modal for IPM equipment
  - Sprayer
  - Protective Gear
  - Pruning Tools
  - Measuring Equipment
  - Monitoring Traps
  - Safety Equipment
- **Labor Required**: Number of workers needed
- **Target Area**: Specific area description (required)
- **Severity Level**: Dropdown selection
  - Low - Preventive
  - Medium - Moderate Infestation
  - High - Severe Infestation
- **Preventive Measures**: What has already been done
- **Follow-up Date**: Optional date for follow-up inspection
- **Special Instructions**: Additional notes

### Data Structure
```javascript
{
  scheduledDate: "2024-05-20",
  farmSize: 2.5,
  pestType: ["Avocado Thrips", "Mites"],
  ipmMethod: ["Biological Control", "Organic Pesticides"],
  chemicalsNeeded: "Organic insecticide",
  equipmentNeeded: ["Sprayer", "Protective Gear"],
  laborRequired: 3,
  targetArea: "Entire farm",
  severity: "medium",
  preventiveMeasures: "Regular monitoring",
  followUpDate: "2024-06-01",
  specialInstructions: "...",
  location: {...},
  farmerInfo: {...},
  agentInfo: {...},
  priority: "medium",
  notes: "..."
}
```

### API Endpoint
- **POST** `/service-requests/ipm-routine`

### Service Function
`createIPMRoutineRequest(ipmData)` in `serviceRequestsService.js`

---

## Common Features

### Both pages include:

1. **Modal-based Selection UI**
   - Preparation activities modal (Harvesting Plan)
   - Equipment selection modal (both)
   - Pest type modal (IPM Routine)
   - IPM methods modal (IPM Routine)
   - Smooth animations (fadeIn, slideUp)

2. **Farmer & Agent Information**
   - Automatically captures farmer details from localStorage
   - Includes agent information for coordination
   - Location data (province, district, sector, cell, village)

3. **Form Validation**
   - Required field validation
   - Number input validation (min values)
   - Array field validation (at least one selected)
   - Comprehensive error messages

4. **Success Screen**
   - Confirmation message
   - Summary of submitted data
   - Professional UI with success icon

5. **Local Storage Integration**
   - Saves requests to localStorage for tracking
   - Maintains user session data
   - Provides offline record

6. **Consistent Styling**
   - Follows existing HarvestingDay.css patterns
   - Inter font family
   - Responsive design
   - Accessible color contrasts

---

## Service Request Functions

### Added to `serviceRequestsService.js`:

```javascript
// HARVESTING PLAN REQUEST FUNCTIONS
export async function createHarvestingPlanRequest(planData) {
  // Validates:
  // - plannedHarvestDate
  // - estimatedYield
  // - farmSize
  // - laborRequirement
  // - marketTarget
  // - location
  
  const response = await apiClient.post('/service-requests/harvesting-plan', planData);
  return extractData(response);
}

// IPM ROUTINE REQUEST FUNCTIONS
export async function createIPMRoutineRequest(ipmData) {
  // Validates:
  // - scheduledDate
  // - farmSize
  // - pestType (array, min 1)
  // - ipmMethod (array, min 1)
  // - laborRequired
  // - targetArea
  // - location
  
  const response = await apiClient.post('/service-requests/ipm-routine', ipmData);
  return extractData(response);
}
```

---

## Differences from HarvestingDay

### Schedule Harvesting Plan vs HarvestingDay:
- **Planning vs Execution**: Harvesting Plan is for advance planning, HarvestingDay is for immediate execution
- **Different Fields**: Includes market target, quality standards, storage needs
- **Preparation Focus**: Emphasizes pre-harvest preparation activities
- **No Images**: Doesn't require crop images (planning phase)

### Schedule IPM Routine:
- **Agent-Performed Service**: Agent does work on behalf of farmer
- **Pest Management Focus**: Specialized for pest/disease control
- **Multiple Treatment Methods**: Supports various IPM approaches
- **Severity Levels**: Categorizes urgency and priority
- **Follow-up Tracking**: Includes follow-up date for effectiveness monitoring

---

## Integration Points

### To add these pages to the application:

1. **Import in App.jsx or Routes file:**
   ```javascript
   import ScheduleHarvestingPlan from './Pages/Farmer/ScheduleHarvestingPlan';
   import ScheduleIPMRoutine from './Pages/Farmer/ScheduleIPMRoutine';
   ```

2. **Add routes:**
   ```javascript
   <Route path="/farmer/schedule-harvesting-plan" element={<ScheduleHarvestingPlan />} />
   <Route path="/farmer/schedule-ipm-routine" element={<ScheduleIPMRoutine />} />
   ```

3. **Add navigation menu items:**
   - Add to farmer sidebar/menu
   - Use appropriate icons (Calendar, Bug/Shield icons from Lucide)
   - Group under "Services" or "Scheduling" section

4. **Update backend:**
   - Implement `/service-requests/harvesting-plan` endpoint
   - Implement `/service-requests/ipm-routine` endpoint
   - Both should accept the data structures shown above

---

## Testing Checklist

- [ ] Form validation works for all required fields
- [ ] Modal selection UI opens and closes properly
- [ ] Selected items display as chips/tags
- [ ] Chips can be removed individually
- [ ] Submit button is disabled while submitting
- [ ] Success screen displays correct summary
- [ ] LocalStorage saves requests properly
- [ ] Farmer and agent info are captured
- [ ] API endpoints respond correctly
- [ ] Error handling displays user-friendly messages

---

## Future Enhancements

1. **Calendar Integration**: Visual date picker with availability checking
2. **Resource Estimation**: Auto-calculate labor and equipment based on farm size
3. **Cost Estimation**: Show estimated costs for services
4. **Agent Assignment**: Allow selection of specific agents
5. **Photo Upload**: Add ability to upload pest/disease photos for IPM
6. **Weather Integration**: Show weather forecasts for planned dates
7. **Notification System**: Alert farmers when agent confirms schedule
8. **History Tracking**: View past harvesting plans and IPM routines
9. **Performance Analytics**: Track yield accuracy vs estimates
10. **Multi-language Support**: Translate for local languages

---

## Notes

- Both pages use the same CSS file as HarvestingDay (`HarvestingDay.css`)
- Service functions follow the same pattern as existing harvest requests
- Error handling is consistent with other service request pages
- The pages are ready for integration once backend endpoints are available
- All validation is client-side; backend should implement its own validation
