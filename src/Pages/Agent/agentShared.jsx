/* eslint-disable react/prop-types */
// Shared bits for agent pages that file service requests on a farmer's behalf.
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { listFarmers } from '../../services/usersService';
import { Field, inputClass } from '../../components/Ui/kit';


/** Searchable farmer select. onChange receives the full farmer object (or null). */
export function FarmerPicker({ value, onChange, required }) {
  const [search, setSearch] = useState('');
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listFarmers({ limit: 100, search: search.trim() || undefined });
        if (!cancelled) setFarmers(res?.data || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search]);

  // Keep the selected farmer in the option list even if the search no longer matches
  const options = value && !farmers.some((f) => f.id === value.id) ? [value, ...farmers] : farmers;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="Find farmer">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className={`${inputClass} pl-9`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email or phone" />
        </div>
      </Field>
      <Field label="Farmer" required={required} hint={error ? `Could not load farmers: ${error}` : loading ? 'Loading…' : `${farmers.length} match${farmers.length === 1 ? '' : 'es'}`}>
        <select
          className={inputClass}
          value={value?.id || ''}
          required={required}
          onChange={(e) => onChange(options.find((f) => f.id === e.target.value) || null)}
        >
          <option value="">Select a farmer…</option>
          {options.map((f) => (
            <option key={f.id} value={f.id}>
              {f.full_name}{f.phone ? ` · ${f.phone}` : ''}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}

/** Editable province/district/sector/cell/village inputs. */
export function LocationFields({ value, onChange, requireProvince = true }) {
  const set = (k, v) => onChange({ ...value, [k]: v });
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {['province', 'district', 'sector', 'cell', 'village'].map((k) => (
        <Field key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} required={k === 'province' && requireProvince}>
          <input className={inputClass} value={value[k] || ''} onChange={(e) => set(k, e.target.value)} required={k === 'province' && requireProvince} />
        </Field>
      ))}
    </div>
  );
}
