import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, MapPin, Search, Leaf } from 'lucide-react';
import { traceLot } from '../../services/harvestLotsService';
import { GRADES, labelFor } from '../../services/marketPricesService';
import { Button, Spinner, inputClass } from '../../components/Ui/kit';

const Row = ({ label, children }) => (
  <div className="flex justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-0">
    <span className="text-slate-500">{label}</span>
    <span className="text-right font-medium text-slate-900">{children}</span>
  </div>
);

/**
 * PUBLIC page (no login): what a buyer or exporter sees after scanning a lot's
 * QR label. Shows origin and quality only — no farmer or price data.
 */
const TraceLot = () => {
  const { lotCode } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(lotCode || '');
  const [lot, setLot] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lotCode) return;
    setLoading(true);
    setError('');
    setLot(null);
    traceLot(lotCode)
      .then(setLot)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [lotCode]);

  const search = (e) => {
    e.preventDefault();
    if (code.trim()) navigate(`/trace/${code.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <Leaf className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Avocado Lot Traceability</h1>
          <p className="mt-1 text-sm text-slate-500">Check where and when a lot of Rwandan avocados was harvested.</p>
        </div>

        <form onSubmit={search} className="mb-6 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="AVO-20260101-ABC123"
            aria-label="Lot code"
            className={`${inputClass} font-mono uppercase`}
          />
          <Button type="submit" icon={Search}>Trace</Button>
        </form>

        {loading && <Spinner label="Looking up lot…" />}
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-center text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>}

        {lot && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className={`flex items-center gap-3 p-5 text-white ${lot.verified ? 'bg-brand-700' : lot.status === 'rejected' ? 'bg-rose-600' : 'bg-slate-500'}`}>
              {lot.verified ? <ShieldCheck className="h-8 w-8 shrink-0" /> : <ShieldAlert className="h-8 w-8 shrink-0" />}
              <div className="min-w-0">
                <p className="truncate font-mono text-sm opacity-90">{lot.lot_code}</p>
                <p className="font-semibold">
                  {lot.verified ? 'Verified by a field agent' : lot.status === 'rejected' ? 'Lot was rejected at inspection' : 'Not yet verified'}
                </p>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-3 flex items-start gap-1.5 text-sm text-slate-700">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span>{[lot.origin.sector, lot.origin.district, lot.origin.province, lot.origin.country].filter(Boolean).join(', ')}</span>
              </div>
              <Row label="Variety">{lot.variety}</Row>
              <Row label="Harvest date">{new Date(lot.harvest_date).toLocaleDateString()}</Row>
              <Row label="Quantity">{Number(lot.quantity_kg).toLocaleString()} kg</Row>
              <Row label="Grade">{labelFor(GRADES, lot.grade)}</Row>
              <Row label="Dry matter (maturity)">
                {lot.dry_matter_pct != null ? (
                  <span className={lot.maturity_passed ? 'text-brand-700' : 'text-rose-600'}>
                    {lot.dry_matter_pct}% {lot.maturity_passed ? '✓ mature' : '✗ below threshold'}
                  </span>
                ) : 'Not tested'}
              </Row>
              <Row label="Organic certified farm">{lot.organic_certified ? 'Yes' : 'No'}</Row>
              {lot.verified_at && <Row label="Verified on">{new Date(lot.verified_at).toLocaleDateString()}</Row>}
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">
          <Link to="/" className="hover:text-slate-600 hover:underline">Sign in to the dashboard</Link>
        </p>
      </div>
    </div>
  );
};

export default TraceLot;
