# Dashboard Avocado - Frontend Application

A comprehensive agricultural management system frontend built with React and Vite, designed to work with the Dashboard Avocado Backend API.

## 🚀 Features

### Multi-Role Dashboard System
- **Admin Dashboard**: Complete system management, user oversight, analytics
- **Agent Dashboard**: Farmer management, service requests, territory coverage
- **Farmer Dashboard**: Market access, service requests, profile management
- **Shop Manager Dashboard**: Inventory, orders, sales analytics

### Core Functionality
- **Authentication & Authorization**: JWT-based with role-based access control
- **Product Management**: Browse and manage agricultural products by category
- **Service Requests**: Pest management, harvest planning, property evaluation
- **QR Code System**: Profile access and management
- **Real-time Analytics**: Dashboard statistics and reporting
- **File Upload**: Image and document management
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.19
- **Styling**: Tailwind CSS 3.4.17
- **Routing**: React Router DOM 6.26.1
- **HTTP Client**: Axios 1.7.7
- **Icons**: Lucide React 0.453.0
- **Charts**: Recharts 3.1.2
- **QR Code**: QRCode 1.5.4

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Access to Dashboard Avocado Backend API

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dashboard-avocado
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   VITE_API_BASE_URL=https://dash-api-hnyp.onrender.com/api
   VITE_PUBLIC_BASE_URL=http://localhost:5000
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header/         # Navigation components
│   ├── Layout/         # Layout and route protection
│   └── Ui/            # UI components
├── hooks/              # Custom React hooks
│   ├── useAuth.js     # Authentication hook
│   ├── usePagination.js # Pagination hook
│   └── useFormValidation.js # Form validation
├── Pages/              # Page components
│   ├── Admin/         # Admin dashboard pages
│   ├── Agent/         # Agent dashboard pages
│   ├── Farmer/        # Farmer dashboard pages
│   ├── ShopManager/   # Shop manager pages
│   └── Login/         # Authentication pages
├── services/           # API service layer
│   ├── apiClient.js   # Axios configuration
│   ├── authService.js # Authentication services
│   ├── usersService.js # User management
│   ├── productsService.js # Product management
│   └── ...            # Other API services
└── utils/              # Utility functions
    └── errorHandler.js # Error handling utilities
```

## 🔐 Authentication & Authorization

### User Roles
- **admin**: Full system access
- **agent**: Agricultural extension agents
- **farmer**: Farmers using the system
- **shop_manager**: Shop/store managers

### Route Protection
- `ProtectedRoute`: Requires authentication
- `RoleBasedRoute`: Requires specific roles
- Automatic redirection based on user role

## 📱 API Integration

### Service Layer Architecture
All API calls are handled through dedicated service modules:

```javascript
// Example: Using the products service
import { getProducts, createProduct } from '../services/productsService';

const fetchProducts = async () => {
  try {
    const response = await getProducts({ category: 'irrigation' });
    setProducts(response.data);
  } catch (error) {
    console.error('Failed to fetch products:', error.message);
  }
};
```

### Error Handling
Centralized error handling with user-friendly messages:

```javascript
import { handleApiError } from '../utils/errorHandler';

try {
  await apiCall();
} catch (error) {
  const { message } = handleApiError(error);
  setErrorMessage(message);
}
```

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Tailwind CSS for consistent styling
- Adaptive layouts for all screen sizes

### Navigation
- Role-based navigation menus
- Active route highlighting
- Breadcrumb navigation

### Forms & Validation
- Real-time form validation
- Custom validation hooks
- User-friendly error messages

## 📊 Dashboard Features

### Admin Dashboard
- User management (farmers, agents, shop managers)
- System monitoring and health checks
- Analytics and reporting
- Service request management
- Shop oversight

### Agent Dashboard
- Farmer list and management
- Service request handling
- QR code generation for farmers
- Territory-based reporting
- Harvest planning

### Farmer Dashboard
- Product marketplace browsing
- Service request creation (pest management, harvest, property evaluation)
- Profile management
- Request history tracking

### Shop Manager Dashboard
- Inventory management
- Order processing
- Sales analytics
- Customer management
- Product catalog management

## 🔄 State Management

### Authentication Context
Global authentication state using React Context:

```javascript
import { useAuth } from '../hooks/useAuth';

const { user, login, logout, isAuthenticated } = useAuth();
```

### Form State
Custom form validation hook:

```javascript
import { useFormValidation, validationRules } from '../hooks/useFormValidation';

const { values, errors, handleChange, validateAll } = useFormValidation(
  initialValues,
  validationRules
);
```

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Configuration
Ensure all environment variables are properly set:
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_PUBLIC_BASE_URL`: Public assets URL
- `VITE_CLOUDINARY_CLOUD_NAME`: Image upload service

### Performance Optimizations
- Code splitting with React.lazy()
- Image optimization
- Bundle size optimization
- Caching strategies

## 🧪 Development

### Code Quality
- ESLint configuration for code consistency
- Prettier for code formatting
- Component-based architecture

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📚 API Documentation

The frontend is designed to work with the Dashboard Avocado Backend API. Key endpoints include:

- **Authentication**: `/auth/login`, `/auth/register`, `/auth/profile`
- **Users**: `/users`, `/users/farmers`, `/users/agents`
- **Products**: `/products` with category filtering
- **Orders**: `/orders` with status management
- **Service Requests**: `/service-requests/*` for various request types
- **Analytics**: `/analytics/dashboard`, `/analytics/sales`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review the component documentation
- Contact the development team

---

**Built with ❤️ for the Avocado Society of Rwanda**