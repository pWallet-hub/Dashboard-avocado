/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from 'react';
import { Field, inputClass } from '../Ui/kit';
import { RWANDA_PROVINCES } from '../../utils/rwanda';
import { canonicalDistrict, loadRwanda, makeLookups, matchName, provinceOfDistrict } from '../../utils/rwandaLocations';

const LEVELS = ['province', 'district', 'sector', 'cell', 'village'];
const LABELS = { province: 'Province', district: 'District', sector: 'Sector', cell: 'Cell', village: 'Village' };

/**
 * Cascading Rwanda location dropdowns, from the official list (rwanda package).
 *
 *   <LocationPicker value={loc} onChange={setLoc} depth="village" required="district" />
 *
 * value/onChange: { province, district, sector, cell, village }. Changing a
 * level clears the levels below it. A district fills in its province. Values
 * that were typed by hand before are matched to the official spelling when
 * possible.
 *  - depth:    deepest level shown ('district' | 'sector' | 'cell' | 'village')
 *  - required: levels down to this one are marked required
 *  - columns:  grid columns on wide screens (1–3)
 *  - errors:   { district: 'message', … } shown under each field
 *  - labelPrefix: e.g. 'Farm' → 'Farm province', 'Farm district', …
 */
export default function LocationPicker({ value = {}, onChange, depth = 'village', required = 'district', columns = 2, disabled, errors = {}, idPrefix = 'loc', labelPrefix = '' }) {
  const [rw, setRw] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let live = true;
    loadRwanda().then((m) => live && setRw(m)).catch(() => live && setLoadError(true));
    return () => {
      live = false;
    };
  }, []);

  const lookups = useMemo(() => (rw ? makeLookups(rw) : null), [rw]);
  const shown = LEVELS.slice(0, LEVELS.indexOf(depth) + 1);
  const requiredLevels = LEVELS.slice(0, LEVELS.indexOf(required) + 1);

  // Snap hand-typed legacy values to the official spelling once the list is loaded.
  const v = useMemo(() => {
    const out = { ...value };
    const d = canonicalDistrict(out.district);
    if (d) {
      out.district = d;
      out.province = provinceOfDistrict(d);
    }
    if (lookups && d) {
      out.sector = matchName(lookups.sectors(d), out.sector) || out.sector || '';
      if (out.sector) out.cell = matchName(lookups.cells(d, out.sector), out.cell) || out.cell || '';
      if (out.cell) out.village = matchName(lookups.villages(d, out.sector, out.cell), out.village) || out.village || '';
    }
    return out;
  }, [value, lookups]);

  const options = {
    province: RWANDA_PROVINCES,
    district: lookups ? lookups.districts(v.province) : [],
    sector: lookups && v.district ? lookups.sectors(v.district) : [],
    cell: lookups && v.sector ? lookups.cells(v.district, v.sector) : [],
    village: lookups && v.cell ? lookups.villages(v.district, v.sector, v.cell) : [],
  };

  const set = (level, val) => {
    const next = { ...v, [level]: val };
    LEVELS.slice(LEVELS.indexOf(level) + 1).forEach((l) => {
      next[l] = '';
    });
    if (level === 'district' && val) next.province = provinceOfDistrict(val);
    // Keep any extra keys the caller stores alongside (e.g. farm_name).
    onChange?.({ ...value, ...next });
  };

  const cols = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3' }[columns] || 'sm:grid-cols-2';

  return (
    <div className={`grid gap-3 ${cols}`}>
      {shown.map((level, i) => {
        const parent = i === 0 ? true : Boolean(v[shown[i - 1]]);
        const list = parent ? options[level] : [];
        // Keep a legacy value that is not in the official list visible rather than silently dropping it.
        const extra = v[level] && !list.includes(v[level]) ? [v[level]] : [];
        return (
          <Field key={level} label={labelPrefix ? `${labelPrefix} ${LABELS[level].toLowerCase()}` : LABELS[level]} required={requiredLevels.includes(level)}>
            <select
              id={`${idPrefix}-${level}`}
              className={inputClass}
              value={v[level] || ''}
              disabled={disabled || !parent || (level !== 'province' && !lookups && !loadError)}
              onChange={(e) => set(level, e.target.value)}
            >
              <option value="">
                {!parent ? `Choose ${LABELS[shown[i - 1]].toLowerCase()} first` : level !== 'province' && !lookups && !loadError ? 'Loading…' : `Choose ${LABELS[level].toLowerCase()}`}
              </option>
              {[...extra, ...list].map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {errors[level] && <span className="mt-1 block text-xs text-rose-600">{errors[level]}</span>}
          </Field>
        );
      })}
      {loadError && <p className="text-xs text-rose-600 sm:col-span-2">Could not load the list of places. Check your connection and reload the page.</p>}
    </div>
  );
}
