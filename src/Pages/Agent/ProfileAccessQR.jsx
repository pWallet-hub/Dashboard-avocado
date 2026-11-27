import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, RefreshCw, Search, KeyRound, Download, Copy, History, Users, Printer } from 'lucide-react';
import { listFarmers } from '../../services/usersService';
import { getUserQRCode, generateAccessKeyQRCode, regenerateQRToken, getActivityLog } from '../../services/profileAccessService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import {
  Page, PageHeader, Card, Badge, Button, inputClass, EmptyState, ErrorState, Spinner, Table, Td,
} from '../../components/Ui/kit';

const ACTION_TONE = { scanned: 'blue', regenerated: 'amber', expired: 'rose' };
const fmtDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const location = (f) => [f.sector || f.profile?.sector, f.district || f.profile?.district].filter(Boolean).join(', ');

const downloadDataUrl = (dataUrl, filename) => {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/**
 * Farmer QR access: agents look up a farmer, show/print their profile QR
 * card, rotate it if a card is lost, and issue a 7-day access key.
 */
export default function ProfileAccessQR() {
  const toast = useToast();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const myId = localStorage.getItem('id');

  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [farmers, setFarmers] = useState([]);
  const [farmersLoading, setFarmersLoading] = useState(true);
  const [farmersError, setFarmersError] = useState(null);
  const [selected, setSelected] = useState(null);

  const [qr, setQr] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [accessKey, setAccessKey] = useState(null);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [busy, setBusy] = useState(null); // 'regenerate' | 'key'
  const detailRef = useRef(null);

  const loadFarmers = useCallback(async () => {
    setFarmersLoading(true);
    setFarmersError(null);
    try {
      const res = await listFarmers({ limit: 20, ...(query && { search: query }) });
      setFarmers(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setFarmersError(err.response?.data?.message || err.message);
    } finally {
      setFarmersLoading(false);
    }
  }, [query]);

  useEffect(() => { loadFarmers(); }, [loadFarmers]);

  // Debounce the search box into the server-side query
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadQr = useCallback(async (farmerId) => {
    setQrLoading(true);
    setQrError(null);
    try {
      setQr(await getUserQRCode(farmerId));
    } catch (err) {
      setQr(null);
      setQrError(err.message);
    } finally {
      setQrLoading(false);
    }
  }, []);

  const loadActivity = useCallback(async (farmerId) => {
    setActivityLoading(true);
    try {
      const data = await getActivityLog(farmerId);
      setActivity(Array.isArray(data) ? data : []);
    } catch (err) {
      setActivity([]);
      toast.error(err.message);
    } finally {
      setActivityLoading(false);
    }
  }, [toast]);

  const selectFarmer = (f) => {
    setSelected(f);
    setAccessKey(null);
    loadQr(f.id);
    loadActivity(f.id);
    // On phones the detail panel sits below the list — bring it into view
    if (window.innerWidth < 1024) setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const regenerate = async () => {
    const ok = await confirm(
      `Issue a new QR code for ${selected.full_name}? Any printed card with the old code will stop working.`,
      { title: 'Regenerate QR code', confirmLabel: 'Regenerate' }
    );
    if (!ok) return;
    setBusy('regenerate');
    try {
      await regenerateQRToken(selected.id);
      toast.success('New QR code issued');
      await Promise.all([loadQr(selected.id), loadActivity(selected.id)]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };

  const issueKey = async () => {
    setBusy('key');
    try {
      setAccessKey(await generateAccessKeyQRCode(selected.id));
      toast.success('Access key generated (valid 7 days)');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Could not copy — select the text and copy it manually');
    }
  };

  // Print the official membership card (same design everywhere).
  const printCard = () => navigate(`/dashboard/agent/member-card/${selected.id}`);

  return (
    <Page>
      <PageHeader
        icon={QrCode}
        title="Farmer QR Access"
        subtitle="Print a farmer's profile QR card, replace a lost card, or issue a temporary access key."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <Card title="Farmers" padded={false}>
          <div className="border-b border-slate-100 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className={`${inputClass} pl-9`}
                placeholder="Search by name, phone or email…"
                aria-label="Search farmers"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {farmersLoading ? (
            <Spinner label="Loading farmers…" />
          ) : farmersError ? (
            <ErrorState message={farmersError} onRetry={loadFarmers} />
          ) : farmers.length === 0 ? (
            <EmptyState icon={Users} title="No farmers found" description={query ? 'Try a different search.' : 'Register a farmer first.'} />
          ) : (
            <ul className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto">
              {farmers.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => selectFarmer(f)}
                    className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 ${selected?.id === f.id ? 'bg-brand-50' : ''}`}
                  >
                    <p className="truncate text-sm font-medium text-slate-900">{f.full_name || 'Unnamed farmer'}</p>
                    <p className="truncate text-xs text-slate-500">{[f.phone, location(f)].filter(Boolean).join(' · ') || f.email}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!farmersLoading && farmers.length === 20 && (
            <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">Showing the first 20 matches — refine your search.</p>
          )}
        </Card>

        <div ref={detailRef} className="scroll-mt-20 space-y-6">
          {!selected ? (
            <Card>
              <EmptyState icon={QrCode} title="Select a farmer" description="Pick a farmer from the list to see their QR card and access history." />
            </Card>
          ) : (
            <>
              <Card
                title={selected.full_name}
                subtitle={[selected.phone, location(selected)].filter(Boolean).join(' · ')}
                actions={
                  <>
                    <Button variant="secondary" size="sm" icon={RefreshCw} loading={busy === 'regenerate'} disabled={!!busy || qrLoading} onClick={regenerate}>
                      Regenerate QR
                    </Button>
                    <Button size="sm" icon={KeyRound} loading={busy === 'key'} disabled={!!busy} onClick={issueKey}>
                      Generate access key
                    </Button>
                  </>
                }
              >
                {qrLoading ? (
                  <Spinner label="Loading QR code…" />
                ) : qrError ? (
                  <ErrorState message={qrError} onRetry={() => loadQr(selected.id)} />
                ) : qr?.qr_image ? (
                  <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                    <img src={qr.qr_image} alt={`Profile QR code for ${selected.full_name}`} className="h-48 w-48 rounded-xl border border-slate-200 p-2" />
                    <div className="min-w-0 flex-1 space-y-3 text-sm">
                      <p className="text-slate-600">
                        Scanning this code opens the farmer&apos;s profile. Print it on the farmer&apos;s card; regenerate it if the card is lost.
                      </p>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Token</p>
                        <p className="mt-0.5 break-all font-mono text-xs text-slate-700">{qr.qr_code_token}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary" icon={Download} onClick={() => downloadDataUrl(qr.qr_image, `qr-${(selected.full_name || 'farmer').replace(/\W+/g, '-')}.png`)}>
                          Download PNG
                        </Button>
                        <Button size="sm" variant="secondary" icon={Printer} onClick={printCard}>Print membership card</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState icon={QrCode} title="No QR code available" />
                )}
              </Card>

              {accessKey && (
                <Card title="Temporary access key" subtitle={`Valid until ${fmtDate(accessKey.expires_at)}`}>
                  <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                    {accessKey.qr_image && (
                      <img src={accessKey.qr_image} alt="Access key QR code" className="h-40 w-40 rounded-xl border border-slate-200 p-2" />
                    )}
                    <div className="min-w-0 flex-1 space-y-3 text-sm">
                      <p className="text-slate-600">Share this key with {selected.full_name} so they can verify and update their profile. It is shown only once.</p>
                      <p className="break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 ring-1 ring-inset ring-slate-200">{accessKey.access_key}</p>
                      <Button size="sm" variant="secondary" icon={Copy} onClick={() => copy(accessKey.access_key)}>Copy key</Button>
                    </div>
                  </div>
                </Card>
              )}

              <Card title="QR activity" padded={false} actions={<Button size="sm" variant="ghost" icon={RefreshCw} onClick={() => loadActivity(selected.id)} aria-label="Refresh activity">Refresh</Button>}>
                {activityLoading ? (
                  <Spinner label="Loading activity…" />
                ) : activity.length === 0 ? (
                  <EmptyState icon={History} title="No activity yet" description="Scans and regenerations of this farmer's QR code appear here." />
                ) : (
                  <Table head={['Action', 'By', 'When']}>
                    {activity.map((a) => (
                      <tr key={a.id}>
                        <Td><Badge tone={ACTION_TONE[a.action]}>{a.action}</Badge></Td>
                        <Td>{!a.scanned_by ? 'Public scan' : a.scanned_by === myId ? 'You' : 'Another staff member'}</Td>
                        <Td>{fmtDate(a.created_at)}</Td>
                      </tr>
                    ))}
                  </Table>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </Page>
  );
}
