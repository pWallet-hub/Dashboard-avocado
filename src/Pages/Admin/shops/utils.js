export const errMsg = (e, fallback) =>
  e?.response?.data?.errors?.[0]?.msg || e?.response?.data?.message || e?.message || fallback;

export const rwf = (n) => `${Math.round(Number(n) || 0).toLocaleString()} RWF`;

export const fmtDate = (v, withTime = false) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return withTime ? d.toLocaleString() : d.toLocaleDateString();
};

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'mobile_money', label: 'Mobile money' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'credit_card', label: 'Credit card' },
  { value: 'debit_card', label: 'Debit card' },
  { value: 'check', label: 'Cheque' },
];

// Categories the API accepts when creating a product (validateProductCreation).
export const CREATE_CATEGORIES = [
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'harvesting', label: 'Harvesting' },
  { value: 'containers', label: 'Containers' },
  { value: 'pest-management', label: 'Pest management' },
];

// Every category that can exist in the database (for filtering/display).
export const ALL_CATEGORIES = [
  ...CREATE_CATEGORIES,
  { value: 'seeds', label: 'Seeds' },
  { value: 'fertilizers', label: 'Fertilizers' },
  { value: 'tools', label: 'Tools' },
  { value: 'protection', label: 'Protection' },
  { value: 'produce', label: 'Produce' },
];

export const categoryLabel = (c) => ALL_CATEGORIES.find((x) => x.value === c)?.label || c || '—';

export const UNITS = ['piece', 'kg', 'g', 'ton', 'liter', 'ml', 'box', 'bag', 'bottle', 'can', 'packet', 'dozen', 'lb', 'oz', 'gallon'];

export const PRODUCT_STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'out_of_stock', label: 'Out of stock' },
  { value: 'discontinued', label: 'Discontinued' },
];

export const productStatusTone = { available: 'brand', out_of_stock: 'amber', discontinued: 'slate' };
