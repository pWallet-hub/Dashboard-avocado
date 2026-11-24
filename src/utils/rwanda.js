/** Rwanda's provinces and districts (NISR), used for filters and forms. */
export const RWANDA_PROVINCES = ['Kigali City', 'Eastern Province', 'Northern Province', 'Southern Province', 'Western Province'];

export const RWANDA_DISTRICTS = {
  'Kigali City': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  'Southern Province': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
  'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
};

export const ALL_DISTRICTS = Object.values(RWANDA_DISTRICTS).flat().sort();

export const RWANDA_CENTER = [-1.94, 29.87];
export const RWANDA_BOUNDS = [[-2.95, 28.8], [-1.0, 30.95]];
