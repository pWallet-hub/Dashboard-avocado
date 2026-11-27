/* Navigation config shared by Sidebar (links) and TopBar (page title / breadcrumb). */
import {
  Home,
  User,
  Users,
  UserCheck,
  FileText,
  ShoppingCart,
  BarChart2,
  Settings,
  ShoppingBag,
  ClipboardList,
  Package,
  TrendingUp,
  Truck,
  Store,
  Calendar,
  Bug,
  MapPin,
  Receipt,
  Trees,
  CalendarClock,
  Cloud,
  FileCheck2,
  QrCode,
  Activity,
  GraduationCap,
  Map,
  MapPinned,
  Globe2,
  LineChart,
  PackageCheck,
  FileSpreadsheet,
  LandPlot,
  ScrollText,
  Compass,
  Sparkles,
  Building2,
  IdCard,
  UserCog,
  Smartphone,
  MapPinOff,
} from 'lucide-react';

/** Normalise 'shop_manager' / 'shop-manager' etc. to the hyphen form used in URLs. */
export const normalizeRole = (role) => (role ? String(role).replace('_', '-') : null);

export const ROLE_LABELS = {
  admin: 'Administrator',
  agent: 'Field Agent (VBA)',
  farmer: 'Farmer',
  'shop-manager': 'Shop Manager',
};

export const homeRouteFor = (role) => {
  switch (normalizeRole(role)) {
    case 'admin':
      return '/dashboard/admin';
    case 'agent':
      return '/dashboard/agent';
    case 'shop-manager':
      return '/dashboard/shop-manager';
    default:
      return '/dashboard/farmer';
  }
};

/** Navigation grouped into labelled sections, per role. */
export const NAV_SECTIONS = {
  admin: [
    {
      label: 'Overview',
      links: [
        { to: '/dashboard/admin', icon: Home, text: 'Home', exact: true },
        { to: '/dashboard/admin/statistics', icon: BarChart2, text: 'System Usage' },
        { to: '/dashboard/admin/monitoring', icon: Activity, text: 'Monitoring' },
      ],
    },
    {
      label: 'People',
      links: [
        { to: '/dashboard/admin/all-users', icon: UserCog, text: 'All Users & Admins' },
        { to: '/dashboard/admin/users', icon: Users, text: 'Manage Growers' },
        { to: '/dashboard/admin/agents', icon: UserCheck, text: 'Manage Agents' },
        { to: '/dashboard/admin/shop-managers', icon: Store, text: 'Shop Managers' },
        { to: '/dashboard/admin/surveys', icon: FileSpreadsheet, text: 'Import Farmers (Excel)' },
        { to: '/dashboard/admin/activation', icon: Smartphone, text: 'Farmer Activation' },
      ],
    },
    {
      label: 'Farms & Production',
      links: [
        { to: '/dashboard/admin/farms', icon: Trees, text: 'Farms' },
        { to: '/dashboard/admin/farm-map', icon: MapPinned, text: 'Farm Map' },
        { to: '/dashboard/admin/land-issues', icon: MapPinOff, text: 'Land Data Issues' },
        { to: '/dashboard/admin/harvest-lots', icon: PackageCheck, text: 'Harvest Lots' },
        { to: '/dashboard/admin/forecasting', icon: Map, text: 'Regional Forecasting' },
        { to: '/dashboard/admin/diseases', icon: Bug, text: 'Disease Management' },
        { to: '/dashboard/admin/geography', icon: Globe2, text: 'Geography' },
        { to: '/dashboard/admin/facilities', icon: Building2, text: 'Facilities & Infrastructure' },
      ],
    },
    {
      label: 'Market & Sales',
      links: [
        { to: '/dashboard/admin/market-prices', icon: LineChart, text: 'Market Prices' },
        { to: '/dashboard/admin/opportunities', icon: Sparkles, text: 'Opportunities' },
        { to: '/dashboard/admin/shops', icon: ShoppingCart, text: 'Manage Shops' },
        { to: '/dashboard/admin/transactions', icon: Receipt, text: 'Transactions' },
      ],
    },
    {
      label: 'Operations',
      links: [
        { to: '/dashboard/admin/service-requests', icon: ClipboardList, text: 'Service Requests' },
        { to: '/dashboard/admin/reports', icon: FileText, text: 'Report Management' },
        { to: '/dashboard/admin/DocumentReview', icon: FileCheck2, text: 'Document Review' },
        { to: '/dashboard/admin/training', icon: GraduationCap, text: 'Training Content' },
      ],
    },
    {
      label: 'System',
      links: [
        { to: '/dashboard/admin/settings', icon: Settings, text: 'Settings' },
        { to: '/dashboard/admin/logs', icon: ScrollText, text: 'System Logs' },
        { to: '/dashboard/admin/profile', icon: User, text: 'Profile' },
      ],
    },
  ],
  agent: [
    {
      label: 'Overview',
      links: [{ to: '/dashboard/agent', icon: Home, text: 'Home', exact: true }],
    },
    {
      label: 'Farmers',
      links: [
        { to: '/dashboard/agent/FarmerList', icon: Users, text: 'My Farmers' },
        { to: '/dashboard/agent/surveys', icon: FileSpreadsheet, text: 'Import Farmers (Excel)' },
        { to: '/dashboard/agent/activation', icon: Smartphone, text: 'Farmer Activation' },
        { to: '/dashboard/agent/ProfileAccessQR', icon: QrCode, text: 'Farmer QR Access' },
      ],
    },
    {
      label: 'Field Work',
      links: [
        { to: '/dashboard/agent/farms', icon: Trees, text: 'Farms' },
        { to: '/dashboard/agent/farm-map', icon: MapPinned, text: 'Farm Map' },
        { to: '/dashboard/agent/land-issues', icon: MapPinOff, text: 'Land Data Issues' },
        { to: '/dashboard/agent/Visits', icon: CalendarClock, text: 'Farm Visits' },
        { to: '/dashboard/agent/HarvestingPlan', icon: Calendar, text: 'Schedule Harvesting Plan' },
        { to: '/dashboard/agent/IPMRoutine', icon: Bug, text: 'Schedule IPM Routine' },
        { to: '/dashboard/agent/DiseaseCases', icon: Bug, text: 'Disease Cases' },
      ],
    },
    {
      label: 'Harvest & Market',
      links: [
        { to: '/dashboard/agent/harvest-lots', icon: PackageCheck, text: 'Harvest Lots' },
        { to: '/dashboard/agent/Forecasting', icon: TrendingUp, text: 'Harvest Forecasting' },
        { to: '/dashboard/agent/market-prices', icon: LineChart, text: 'Market Prices' },
        { to: '/dashboard/agent/opportunities', icon: Sparkles, text: 'Opportunities' },
        { to: '/dashboard/agent/facilities', icon: Building2, text: 'Facilities & Infrastructure' },
        { to: '/dashboard/agent/Shop', icon: ShoppingBag, text: 'My Shop' },
      ],
    },
    {
      label: 'Records',
      links: [
        { to: '/dashboard/agent/ServiceHistory', icon: ClipboardList, text: 'Service History' },
        { to: '/dashboard/agent/Report', icon: FileText, text: 'Reports' },
        { to: '/dashboard/agent/Documents', icon: FileText, text: 'My Documents' },
        { to: '/dashboard/agent/profile', icon: User, text: 'Profile' },
        { to: '/dashboard/agent/id-card', icon: IdCard, text: 'My ID Card' },
      ],
    },
  ],
  farmer: [
    {
      label: 'Overview',
      links: [{ to: '/dashboard/farmer', icon: Home, text: 'Home', exact: true }],
    },
    {
      label: 'My Farm',
      links: [
        { to: '/dashboard/farmer/my-farm', icon: LandPlot, text: 'My Farms' },
        { to: '/dashboard/farmer/harvest-lots', icon: PackageCheck, text: 'My Harvest Lots' },
        { to: '/dashboard/farmer/nearby', icon: Compass, text: 'Near My Farm' },
        { to: '/dashboard/farmer/Weather', icon: Cloud, text: 'Weather' },
      ],
    },
    {
      label: 'Services',
      links: [
        { to: '/dashboard/farmer/HarvestingDay', icon: Calendar, text: 'Book your Harvesting Day' },
        { to: '/dashboard/farmer/PestManagement', icon: Bug, text: 'Book your Integrated Pest Management Day' },
        { to: '/dashboard/farmer/PropertyEvaluation', icon: MapPin, text: 'Book your Property Evaluation Day' },
        { to: '/dashboard/farmer/my-service-requests', icon: ClipboardList, text: 'My Requests' },
      ],
    },
    {
      label: 'Market',
      links: [
        { to: '/dashboard/farmer/market-prices', icon: LineChart, text: 'Market Prices' },
        { to: '/dashboard/farmer/opportunities', icon: Sparkles, text: 'Opportunities' },
        { to: '/dashboard/farmer/market', icon: ShoppingCart, text: 'Farm Market' },
        { to: '/dashboard/farmer/cart', icon: ShoppingBag, text: 'My Cart' },
      ],
    },
    {
      label: 'Learn & Account',
      links: [
        { to: '/dashboard/farmer/training', icon: GraduationCap, text: 'Training' },
        { to: '/dashboard/farmer/membership-card', icon: IdCard, text: 'My Membership Card' },
        { to: '/dashboard/farmer/profile', icon: User, text: 'Profile' },
      ],
    },
  ],
  'shop-manager': [
    {
      label: 'Overview',
      links: [
        { to: '/dashboard/shop-manager', icon: Store, text: 'Dashboard', exact: true },
        { to: '/dashboard/shop-manager/analytics', icon: BarChart2, text: 'Analytics' },
      ],
    },
    {
      label: 'Sales',
      links: [
        { to: '/dashboard/shop-manager/orders', icon: ShoppingCart, text: 'Orders' },
        { to: '/dashboard/shop-manager/sales', icon: TrendingUp, text: 'Sales' },
        { to: '/dashboard/shop-manager/customers', icon: Users, text: 'Customers' },
      ],
    },
    {
      label: 'Stock',
      links: [
        { to: '/dashboard/shop-manager/inventory', icon: Package, text: 'Inventory' },
        { to: '/dashboard/shop-manager/products', icon: ShoppingBag, text: 'Products' },
        { to: '/dashboard/shop-manager/suppliers', icon: Truck, text: 'Suppliers' },
        { to: '/dashboard/shop-manager/procurement', icon: ClipboardList, text: 'Procurement' },
      ],
    },
    {
      label: 'Market & Account',
      links: [
        { to: '/dashboard/shop-manager/market-prices', icon: LineChart, text: 'Market Prices' },
        { to: '/dashboard/shop-manager/profile', icon: User, text: 'Shop Profile' },
      ],
    },
  ],
};

/** Detect the current role: explicit prop → URL → stored user. */
export const detectRole = (propRole, pathname) => {
  if (propRole) return normalizeRole(propRole);
  if (pathname.includes('/admin')) return 'admin';
  if (pathname.includes('/agent')) return 'agent';
  if (pathname.includes('/farmer')) return 'farmer';
  if (pathname.includes('/shop-manager') || pathname.includes('/shop_manager')) return 'shop-manager';
  const storedRole = localStorage.getItem('userRole');
  if (storedRole) return normalizeRole(storedRole);
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.role) return normalizeRole(user.role);
  } catch {
    /* ignore malformed user data */
  }
  return 'farmer';
};

export const isLinkActive = (link, pathname) => {
  const path = pathname.toLowerCase();
  const to = link.to.toLowerCase();
  return link.exact ? path === to || path === `${to}/` : path === to || path.startsWith(`${to}/`);
};

/** Find the nav entry (and its section) for the current URL — used by the TopBar title. */
export const findActiveLink = (role, pathname) => {
  const sections = NAV_SECTIONS[normalizeRole(role)] || NAV_SECTIONS.farmer;
  for (const section of sections) {
    for (const link of section.links) {
      if (isLinkActive(link, pathname)) return { section: section.label, link };
    }
  }
  return null;
};

