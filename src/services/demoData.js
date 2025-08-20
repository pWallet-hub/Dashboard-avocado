// Simple demo/localStorage utilities and default seeds for offline/demo mode

const safeParse = (str, fallback) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

export const lsGet = (key, fallback) => {
  const raw = localStorage.getItem(key);
  if (raw === null || raw === undefined) return fallback;
  return safeParse(raw, fallback);
};

export const lsSet = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const seedIfEmpty = (key, seed) => {
  const existing = lsGet(key, null);
  if (!existing || (Array.isArray(existing) && existing.length === 0)) {
    lsSet(key, seed);
    return seed;
  }
  return existing;
};

export const nextId = (arr, idField = 'id') => {
  if (!Array.isArray(arr) || arr.length === 0) return 1;
  const max = Math.max(...arr.map((x) => Number(x[idField]) || 0));
  return max + 1;
};

// Demo Seeds
export const DEMO_FARMERS = [
  {
    id: 'f1',
    firstname: 'Jean',
    lastname: 'Uwimana',
    telephone: '+250788123456',
    age: 34,
    district: 'Gasabo',
    sector: 'Remera',
    cell: 'Rukiri',
    village: 'Karama'
  },
  {
    id: 'f2',
    firstname: 'Marie',
    lastname: 'Mukamana',
    telephone: '+250788765432',
    age: 29,
    district: 'Musanze',
    sector: 'Cyuve',
    cell: 'Rugengabari',
    village: 'Nyange'
  }
];

export const DEMO_USERS = [
  {
    id: 'u1',
    full_name: 'Jean Baptiste Uwimana',
    age: 34,
    telephone: '+250788123456',
    email: 'jean.uwimana@email.com',
    gender: 'Male',
    province: 'Kigali',
    district: 'Gasabo',
    sector: 'Remera',
    cell: 'Rukiri',
    village: 'Karama'
  },
  {
    id: 'u2',
    full_name: 'Marie Claire Mukamana',
    age: 29,
    telephone: '+250788765432',
    email: 'marie.mukamana@email.com',
    gender: 'Female',
    province: 'Northern',
    district: 'Musanze',
    sector: 'Cyuve',
    cell: 'Rugengabari',
    village: 'Nyange'
  }
];

export const DEMO_PRODUCTS = [
  { id: 1, name: 'Laptop', stock: 15 },
  { id: 2, name: 'Mouse', stock: 5 },
  { id: 3, name: 'Keyboard', stock: 0 },
  { id: 4, name: 'Monitor', stock: 8 }
];

export const DEMO_SHOPS = [
  {
    id: 's1',
    name: 'Downtown Agro',
    owner: 'Alice',
    email: 'shop1@example.com',
    phoneNumber: '+250788111111',
    district: 'Gasabo',
    canSell: true
  },
  {
    id: 's2',
    name: 'Green Fields',
    owner: 'Bob',
    email: 'shop2@example.com',
    phoneNumber: '+250788222222',
    district: 'Musanze',
    canSell: false
  }
];
