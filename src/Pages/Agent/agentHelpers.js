// Best-known location of a farmer (survey-imported farmers keep it in `profile`,
// registered farmers in flat farm_* / province columns).
export const farmerLocation = (f) => {
  if (!f) return { province: '', district: '', sector: '', cell: '', village: '' };
  const p = f.profile || {};
  return {
    province: p.province || f.farm_province || f.province || '',
    district: p.district || f.farm_district || f.district || '',
    sector: p.sector || f.farm_sector || f.sector || '',
    cell: p.cell || f.farm_cell || f.cell || '',
    village: p.village || f.farm_village || f.village || '',
  };
};
