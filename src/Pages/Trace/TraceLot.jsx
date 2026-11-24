import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, MapPin, Search, Leaf } from 'lucide-react';
import { traceLot } from '../../services/harvestLotsService';
import { GRADES, labelFor } from '../../services/marketPricesService';

const Row = ({ label, children }) => (
  <div className="flex justify-between py-2 border-b last:border-0 text-sm">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800 text-right">{children}</span>
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <Leaf className="h-10 w-10 text-green-600 mx-auto" />
          <h1 className="text-2xl font-bold text-green-800 mt-2">Avocado Lot Traceability</h1>
          <p className="text-green-600 text-sm">Check where and when a lot of Rwandan avocados was harvested.</p>
        </div>

        <form onSubmit={search} className="flex gap-2 mb-6">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="AVO-20260101-ABC123"
            aria-label="Lot code"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm uppercase focus:ring-2 focus:ring-green-500"
          />
          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
            <Search className="h-4 w-4 mr-1" />Trace
          </button>
        </form>

        {loading && <p className="text-center text-gray-500">Looking up lot…</p>}
        {error && <p className="text-center text-red-600 bg-red-50 rounded-lg p-4">{error}</p>}

        {lot && (
          <div className="bg-white rounded-xl shadow-lg ring-1 ring-green-100 overflow-hidden">
            <div className={`p-5 flex items-center gap-3 ${lot.verified ? 'bg-green-600' : lot.status === 'rejected' ? 'bg-red-600' : 'bg-gray-500'} text-white`}>
              {lot.verified ? <ShieldCheck className="h-8 w-8" /> : <ShieldAlert className="h-8 w-8" />}
              <div>
                <p className="font-mono text-sm opacity-90">{lot.lot_code}</p>
                <p className="font-semibold">
                  {lot.verified ? 'Verified by a field agent' : lot.status === 'rejected' ? 'Lot was rejected at inspection' : 'Not yet verified'}
                </p>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center text-green-800 mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {[lot.origin.sector, lot.origin.district, lot.origin.province, lot.origin.country].filter(Boolean).join(', ')}
                </span>
              </div>
              <Row label="Variety">{lot.variety}</Row>
              <Row label="Harvest date">{new Date(lot.harvest_date).toLocaleDateString()}</Row>
              <Row label="Quantity">{Number(lot.quantity_kg).toLocaleString()} kg</Row>
              <Row label="Grade">{labelFor(GRADES, lot.grade)}</Row>
              <Row label="Dry matter (maturity)">
                {lot.dry_matter_pct != null ? (
                  <span className={lot.maturity_passed ? 'text-green-700' : 'text-red-600'}>
                    {lot.dry_matter_pct}% {lot.maturity_passed ? '✓ mature' : '✗ below threshold'}
                  </span>
                ) : 'Not tested'}
              </Row>
              <Row label="Organic certified farm">{lot.organic_certified ? 'Yes' : 'No'}</Row>
              {lot.verified_at && <Row label="Verified on">{new Date(lot.verified_at).toLocaleDateString()}</Row>}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          <Link to="/" className="hover:underline">Sign in to the dashboard</Link>
        </p>
      </div>
    </div>
  );
};

export default TraceLot;
