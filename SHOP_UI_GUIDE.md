# Shop Management UI Guide

## 🎨 Admin Dashboard - ShopView

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  🏪 Shops Management                      [Export] [Add Shop]│
│  Manage shop permissions and settings                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐                                   │
│  │  📊 Total Shops      │                                   │
│  │        12            │                                   │
│  └──────────────────────┘                                   │
├─────────────────────────────────────────────────────────────┤
│  📍 Filter by District                                       │
│  [Select or search district ▼]                             │
├─────────────────────────────────────────────────────────────┤
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│  ┃ ID │ Shop Name │ Description │ Province │ District  ┃ │
│  ┃────┼───────────┼─────────────┼──────────┼───────────┃ │
│  ┃ #1 │ 🅶 Green  │ Premium...  │ Eastern  │ Rwamagana ┃ │
│  ┃    │   Valley  │             │ Province │           ┃ │
│  ┃────┼───────────┼─────────────┼──────────┼───────────┃ │
│  ┃    │ Owner │ Email │ Phone │ Created │ [Delete]    ┃ │
│  ┃────┼───────┼───────┼───────┼─────────┼─────────    ┃ │
│  ┃    │ John  │ john@ │ +250  │ 10/27/25│             ┃ │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└─────────────────────────────────────────────────────────────┘
```

### Add Shop Modal (Admin Only)

```
         ┌───────────────────────────────────┐
         │  Add New Shop                  [×]│
         ├───────────────────────────────────┤
         │                                   │
         │  Shop Name                        │
         │  [________________]               │
         │                                   │
         │  Short Description                │
         │  [________________]               │
         │  [________________]               │
         │                                   │
         │  📍 Location Information          │
         │  ┌─────────────────────────────┐ │
         │  │ Province                     │ │
         │  │ [Select province ▼]         │ │
         │  │                              │ │
         │  │ District                     │ │
         │  │ [Select district ▼]         │ │
         │  └─────────────────────────────┘ │
         │                                   │
         │  👤 Owner Information             │
         │  ┌─────────────────────────────┐ │
         │  │ Owner Name                   │ │
         │  │ [________________]           │ │
         │  │                              │ │
         │  │ 📧 Email Address             │ │
         │  │ [________________]           │ │
         │  │                              │ │
         │  │ 📞 Phone Number              │ │
         │  │ [________________]           │ │
         │  └─────────────────────────────┘ │
         │                                   │
         │       [    Add Shop    ]          │
         └───────────────────────────────────┘
```

---

## 🎨 Shop Manager Dashboard - ShopManagerShopView

### Layout Structure (Similar to Admin, NO Add Shop button)

```
┌─────────────────────────────────────────────────────────────┐
│  🏪 Shops Management                              [Export]   │
│  View and manage all shops                                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐                                   │
│  │  📊 Total Shops      │                                   │
│  │        12            │                                   │
│  └──────────────────────┘                                   │
├─────────────────────────────────────────────────────────────┤
│  📍 Filter by District                                       │
│  [Select or search district ▼]                             │
├─────────────────────────────────────────────────────────────┤
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│  ┃ ID │ Shop Name │ Description │ Province │ District  ┃ │
│  ┃────┼───────────┼─────────────┼──────────┼───────────┃ │
│  ┃ #1 │ 🅶 Green  │ Premium...  │ Eastern  │ Rwamagana ┃ │
│  ┃    │   Valley  │             │ Province │           ┃ │
│  ┃────┼───────────┼─────────────┼──────────┼───────────┃ │
│  ┃    │ Owner │ Email │ Phone │ Created │ Actions     ┃ │
│  ┃────┼───────┼───────┼───────┼─────────┼─────────    ┃ │
│  ┃    │ John  │ john@ │ +250  │ 10/27/25│ [Edit]      ┃ │
│  ┃    │       │       │       │         │ [Delete]    ┃ │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└─────────────────────────────────────────────────────────────┘
```

### Edit Shop Modal (Shop Manager)

```
         ┌───────────────────────────────────┐
         │  Edit Shop                     [×]│
         ├───────────────────────────────────┤
         │                                   │
         │  Shop Name                        │
         │  [Green Valley Avocado Shop____]  │
         │                                   │
         │  Description                      │
         │  [Premium avocado sales and____]  │
         │  [distribution center__________]  │
         │                                   │
         │  Province                         │
         │  [Eastern Province ▼]             │
         │                                   │
         │  District                         │
         │  [Rwamagana ▼]                    │
         │                                   │
         │  Owner Name                       │
         │  [John Doe_____________________]  │
         │                                   │
         │  Owner Email                      │
         │  [john.doe@example.com_________]  │
         │                                   │
         │  Owner Phone                      │
         │  [+250788123456________________]  │
         │                                   │
         │  [  Cancel  ] [  Update Shop  ]   │
         └───────────────────────────────────┘
```

---

## 🎨 Color Scheme

### Gradients
- **Primary Buttons**: Blue gradient `#3b82f6` → `#6366f1`
- **Shop Avatar**: Blue gradient with white letter
- **Stats Card**: Light blue `#dbeafe` → `#bfdbfe`

### Status Colors
- **Delete Button**: Red `#fee2e2` background, `#991b1b` text
- **Edit Button**: Blue `#dbeafe` background, `#1e40af` text
- **Success**: Green tones
- **Error**: Red `#ef4444`

### Text Colors
- **Headings**: `#0f172a` (slate-900)
- **Body**: `#475569` (slate-600)
- **Labels**: `#64748b` (slate-500)

---

## 📊 Data Flow

### Admin Creating Shop
```
User → Click "Add Shop" 
     → Fill Form 
     → Submit 
     → API: POST /api/shops/addshop
     → Success Response
     → Alert "Shop created successfully!"
     → Modal Closes
     → Shops List Refreshes (GET /api/shops)
     → New shop appears in table
```

### Shop Manager Editing Shop
```
User → Click "Edit" on shop row
     → Modal opens with pre-filled data
     → Modify fields
     → Click "Update Shop"
     → API: PUT /api/shops/:id
     → Success Response
     → Alert "Shop updated successfully!"
     → Modal Closes
     → Shops List Refreshes (GET /api/shops)
     → Updated data appears in table
```

### Deleting Shop
```
User → Click "Delete"
     → Confirmation dialog appears
     → Click "OK"
     → API: DELETE /api/shops/:id
     → Success Response
     → Alert "Shop deleted successfully"
     → Shops List Refreshes (GET /api/shops)
     → Shop removed from table
```

---

## 🔄 State Management

### Component States
```javascript
const [shops, setShops] = useState([]);              // Shop list
const [loading, setLoading] = useState(false);        // Loading indicator
const [error, setError] = useState(null);             // Error message
const [selectedDistrict, setSelectedDistrict] = ... // Filter state
const [isAddShopModalOpen, setIsAddShopModalOpen] .. // Modal state
const [isEditModalOpen, setIsEditModalOpen] = ...   // Edit modal state
```

### Loading States
- Initial page load: Shows spinner
- Creating shop: Button shows "Creating Shop..."
- Updating shop: Button shows "Updating..."
- After action: Auto-refresh shop list

---

## ✨ Key Features

### Admin ShopView
- ✅ Create shops (modal form)
- ✅ View all shops (table)
- ✅ Delete shops
- ✅ Export to CSV
- ✅ Filter by district

### Shop Manager ShopView
- ✅ View all shops (table)
- ✅ Edit shops (modal form)
- ✅ Delete shops
- ✅ Export to CSV
- ✅ Filter by district
- ❌ Cannot create shops

---

## 📱 Responsive Design

- Tables scroll horizontally on small screens
- Modals adapt to screen size (max 90vh)
- Grid layouts adjust to available space
- Touch-friendly button sizes
- Mobile-optimized forms

---

## 🎯 User Experience

### Feedback Mechanisms
1. **Success**: Browser alert with success message
2. **Error**: Browser alert with error details
3. **Loading**: Spinner and disabled buttons
4. **Validation**: Inline error messages
5. **Confirmation**: Delete confirmation dialog

### Interactive Elements
- Hover effects on buttons
- Row highlighting on table hover
- Smooth transitions
- Clear visual hierarchy
- Consistent spacing

---

This implementation provides a complete, production-ready shop management system with excellent UX and full API integration! 🚀
