# Service Requests Management System

This document describes the new service request management system that allows farmers to submit requests for pest management, harvesting day, and property evaluation services, which are then managed by administrators.

## Features

### For Farmers
- **Pest Management Requests**: Submit requests for pest control services with details about pest type, infestation level, crop type, and farm size
- **Harvesting Day Requests**: Request harvesting assistance with worker count, equipment needs, and transportation requirements
- **Property Evaluation Requests**: Request property evaluation services for irrigation upgrades and soil testing

### For Administrators
- **Request Management Dashboard**: View all service requests in a comprehensive table
- **Request Filtering**: Filter requests by status (pending, approved, rejected, completed) and service type
- **Search Functionality**: Search requests by farmer name, phone, email, or service type
- **Request Details Modal**: View detailed information about each request
- **Status Management**: Approve, reject, or mark requests as completed
- **Statistics Overview**: View request statistics on the admin dashboard

## How It Works

### 1. Farmer Submits Request
- Farmers navigate to the respective service pages (Pest Management, Harvesting Day, Property Evaluation)
- They fill out the request form with relevant details
- Upon submission, the request is saved to localStorage with a "pending" status
- A success message confirms the request has been submitted

### 2. Admin Reviews Requests
- Administrators can access the Service Requests page via the sidebar navigation
- They can view all requests in a table format with filtering and search capabilities
- Clicking "View Details" opens a modal with comprehensive request information
- Admins can approve, reject, or mark requests as completed

### 3. Request Status Flow
- **Pending**: Initial status when request is submitted
- **Approved**: Admin has approved the request
- **Rejected**: Admin has rejected the request
- **Completed**: Service has been completed

## File Structure

```
src/
├── Pages/
│   ├── Admin/
│   │   └── ServiceRequests.jsx          # Main admin service requests page
│   └── Farmer/
│       ├── Pest.jsx                     # Updated with request form
│       ├── HarvestingDay.jsx            # Updated with localStorage saving
│       └── PropertyEvaluation.jsx       # Updated with localStorage saving
├── components/
│   └── Layout/
│       └── Sidebar.jsx                  # Updated with service requests link
├── utils/
│   └── demoData.js                      # Demo data for testing
└── App.jsx                              # Updated with service requests route
```

## Usage Instructions

### For Testing
1. Navigate to the admin dashboard
2. Click on "Service Requests" in the sidebar
3. If no data exists, click "Load Demo Data" to populate sample requests
4. Test the filtering, search, and status management features

### For Farmers
1. Navigate to any of the service pages (Pest Management, Harvesting Day, Property Evaluation)
2. Fill out the request form with your details
3. Submit the request
4. Wait for admin approval and follow-up

### For Administrators
1. Access the Service Requests page from the admin dashboard
2. Review pending requests
3. Click "View Details" to see full request information
4. Use the action buttons to approve, reject, or mark as completed
5. Monitor request statistics on the main admin dashboard

## Technical Details

### Data Storage
- All requests are stored in localStorage under the key `farmerServiceRequests`
- Each request has a unique ID, timestamp, and status tracking
- Farmer information is retrieved from localStorage or uses default values

### Request Structure
```javascript
{
  id: string,
  type: 'Pest Management' | 'Harvesting Day' | 'Property Evaluation',
  status: 'pending' | 'approved' | 'rejected' | 'completed',
  submittedAt: ISO string,
  updatedAt?: ISO string,
  farmerName: string,
  farmerPhone: string,
  farmerEmail: string,
  farmerLocation: string,
  // Service-specific fields...
}
```

### Key Features
- **Real-time Updates**: Changes to request status are immediately reflected
- **Responsive Design**: Works on desktop and mobile devices
- **User-friendly Interface**: Clean, modern UI with intuitive navigation
- **Data Persistence**: Requests persist across browser sessions
- **Demo Data**: Easy testing with sample data

## Future Enhancements
- Email notifications for status changes
- Request history and audit trail
- File upload for supporting documents
- Integration with external APIs
- Advanced reporting and analytics
- Agent assignment and management
