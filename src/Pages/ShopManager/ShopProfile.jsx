import { useCallback, useEffect, useState } from 'react';
import { Store, Wallet, Pencil, RefreshCw } from 'lucide-react';
import { getProfile, updateProfile } from '../../services/authService';
import { getShopWallet, updateShop } from '../../services/shopService';
import { RWANDA_PROVINCES, RWANDA_DISTRICTS, ALL_DISTRICTS } from '../../utils/rwanda';
import { useToast } from '../../components/Ui/Toast';
import {
  Page, PageHeader, Card, Button, Field, inputClass, textareaClass, EmptyState, ErrorState, Spinner, Table, Td, Dialog,
  Pagination, Badge, StatGrid, StatCard,
} from '../../components/Ui/kit';
import { useMyShop, ShopGate, rwf, fmtDate, fmtDateTime, humanize, errMsg } from './shopCommon';

const PHONE_RE = /^\+?[\d\s\-()]{10,15}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Detail = ({ label, value }) => (
  <div><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-0.5 text-sm font-medium text-slate-900">{value || '—'}</dd></div>
);

const ShopProfile = () => {
  const toast = useToast();
  const shopState = useMyShop();
  const { shop, setShop } = shopState;

  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [wallet, setWallet] = useState({ rows: [], pagination: {}, balance: 0, loading: false, error: null });
  const [walletPage, setWalletPage] = useState(1);
  const [editing, setEditing] = useState(null); // 'account' | 'shop'
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    setProfileError(null);
    try {
      setProfile(await getProfile());
    } catch (e) {
      setProfileError(errMsg(e, 'Could not load your profile'));
    }
  }, []);
  useEffect(() => { loadProfile(); }, [loadProfile]);

  const loadWallet = useCallback(async () => {
    if (!shop) return;
    setWallet((w) => ({ ...w, loading: true, error: null }));
    try {
      const res = await getShopWallet(shop.shop_number, { page: walletPage, limit: 10 });
      setWallet({ rows: Array.isArray(res?.data) ? res.data : [], pagination: res?.meta?.pagination || {}, balance: res?.meta?.balance ?? shop.balance ?? 0, loading: false, error: null });
    } catch (e) {
      setWallet((w) => ({ ...w, loading: false, error: errMsg(e, 'Could not load wallet history') }));
    }
  }, [shop, walletPage]);
  useEffect(() => { loadWallet(); }, [loadWallet]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const openAccount = () => { setForm({ full_name: profile?.full_name || '', phone: profile?.phone || '' }); setEditing('account'); };
  const openShop = () => {
    setForm({
      shopName: shop.shopName || '', description: shop.description || '', province: shop.province || '', district: shop.district || '',
      ownerName: shop.ownerName || '', ownerEmail: shop.ownerEmail || '', ownerPhone: shop.ownerPhone || '',
    });
    setEditing('shop');
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing === 'account') {
        if (form.full_name.trim().length < 2) throw new Error('Enter your full name');
        if (form.phone && !PHONE_RE.test(form.phone.trim())) throw new Error('Enter a valid phone number, e.g. +250788123456');
        setProfile(await updateProfile({ full_name: form.full_name.trim(), phone: form.phone.trim() }));
        toast.success('Account updated');
      } else {
        if (form.shopName.trim().length < 2) throw new Error('Shop name must be at least 2 characters');
        if (form.ownerName.trim().length < 2) throw new Error('Owner name must be at least 2 characters');
        if (form.ownerEmail && !EMAIL_RE.test(form.ownerEmail.trim())) throw new Error('Enter a valid owner email');
        if (form.ownerPhone && !PHONE_RE.test(form.ownerPhone.trim())) throw new Error('Enter a valid owner phone, e.g. +250788123456');
        const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, String(v).trim()]));
        const res = await updateShop(shop.shop_number, payload);
        setShop(res?.data || { ...shop, ...payload });
        toast.success('Shop details updated');
      }
      setEditing(null);
    } catch (err) {
      const fieldErr = err?.response?.data?.errors?.[0]?.message;
      toast.error(fieldErr || errMsg(err, 'Could not save changes'));
    } finally {
      setSaving(false);
    }
  };

  const provinceOptions = [...new Set([...RWANDA_PROVINCES, form.province].filter(Boolean))];
  const districtOptions = [...new Set([...(RWANDA_DISTRICTS[form.province] || ALL_DISTRICTS), form.district].filter(Boolean))];

  return (
    <Page>
      <PageHeader icon={Store} title="Shop profile" subtitle="Your account, shop details and wallet" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Your account" actions={profile && <Button variant="secondary" size="sm" icon={Pencil} onClick={openAccount}>Edit</Button>}>
          {profileError ? <ErrorState message={profileError} onRetry={loadProfile} /> : !profile ? <Spinner /> : (
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label="Full name" value={profile.full_name} />
              <Detail label="Email" value={profile.email} />
              <Detail label="Phone" value={profile.phone} />
              <Detail label="Role" value={humanize(profile.role)} />
              <Detail label="Status" value={<Badge tone={profile.status === 'active' ? 'brand' : 'amber'}>{humanize(profile.status)}</Badge>} />
              <Detail label="Member since" value={fmtDate(profile.created_at)} />
            </dl>
          )}
        </Card>

        <Card title="Shop details" actions={shop && <Button variant="secondary" size="sm" icon={Pencil} onClick={openShop}>Edit</Button>}>
          {!shop ? <ShopGate state={shopState} bare /> : (
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label="Shop name" value={shop.shopName} />
              <Detail label="Shop number" value={`#${shop.shop_number}`} />
              <Detail label="Location" value={[shop.district, shop.province].filter(Boolean).join(', ')} />
              <Detail label="Selling" value={<Badge tone={shop.can_sell ? 'brand' : 'rose'}>{shop.can_sell ? 'Allowed' : 'Suspended by admin'}</Badge>} />
              <Detail label="Owner" value={shop.ownerName} />
              <Detail label="Owner contact" value={[shop.ownerPhone, shop.ownerEmail].filter(Boolean).join(' · ')} />
              <div className="sm:col-span-2"><Detail label="Description" value={shop.description} /></div>
            </dl>
          )}
        </Card>
      </div>

      {shop && (
        <>
          <StatGrid cols={3}>
            <StatCard label="Wallet balance" value={rwf(wallet.balance)} icon={Wallet} />
            <StatCard label="Wallet transactions" value={String(wallet.pagination.total ?? 0)} tone="slate" />
            <StatCard label="Shop created" value={fmtDate(shop.created_at)} tone="slate" />
          </StatGrid>
          <Card title="Wallet history" subtitle="Top-ups and adjustments made by administrators" padded={false}
            actions={<Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadWallet} loading={wallet.loading}>Refresh</Button>}>
            {wallet.loading && !wallet.rows.length ? <Spinner /> : wallet.error ? <ErrorState message={wallet.error} onRetry={loadWallet} /> : wallet.rows.length === 0 ? (
              <EmptyState icon={Wallet} title="No wallet transactions yet" description="When an administrator tops up your shop wallet it will show here." />
            ) : (
              <>
                <Table head={['Date', 'Reference', 'Description', 'Method', 'Amount', 'Status']}>
                  {wallet.rows.map((t) => (
                    <tr key={t.id}>
                      <Td>{fmtDateTime(t.created_at)}</Td>
                      <Td className="font-mono text-xs">{t.transaction_number}</Td>
                      <Td className="max-w-xs truncate">{t.description || '—'}</Td>
                      <Td>{humanize(t.payment_method)}</Td>
                      <Td className="font-medium text-slate-900">{rwf(t.amount)}</Td>
                      <Td><Badge tone={t.status === 'completed' ? 'brand' : 'amber'}>{humanize(t.status)}</Badge></Td>
                    </tr>
                  ))}
                </Table>
                <Pagination page={wallet.pagination.page || walletPage} totalPages={wallet.pagination.totalPages} total={wallet.pagination.total} onChange={setWalletPage} />
              </>
            )}
          </Card>
        </>
      )}

      {editing && (
        <Dialog title={editing === 'account' ? 'Edit account' : 'Edit shop details'} onClose={() => !saving && setEditing(null)} size={editing === 'shop' ? 'lg' : 'md'}
          footer={<>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="profile-form" loading={saving}>Save</Button>
          </>}>
          <form id="profile-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            {editing === 'account' ? (
              <>
                <Field label="Full name" required className="sm:col-span-2"><input className={inputClass} value={form.full_name} onChange={set('full_name')} /></Field>
                <Field label="Phone" className="sm:col-span-2"><input type="tel" className={inputClass} value={form.phone} onChange={set('phone')} /></Field>
              </>
            ) : (
              <>
                <Field label="Shop name" required className="sm:col-span-2"><input className={inputClass} value={form.shopName} onChange={set('shopName')} maxLength={200} /></Field>
                <Field label="Province">
                  <select className={inputClass} value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value, district: '' }))}>
                    <option value="">Select…</option>
                    {provinceOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="District">
                  <select className={inputClass} value={form.district} onChange={set('district')}>
                    <option value="">Select…</option>
                    {districtOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Owner name" required><input className={inputClass} value={form.ownerName} onChange={set('ownerName')} /></Field>
                <Field label="Owner phone"><input type="tel" className={inputClass} value={form.ownerPhone} onChange={set('ownerPhone')} /></Field>
                <Field label="Owner email" className="sm:col-span-2"><input type="email" className={inputClass} value={form.ownerEmail} onChange={set('ownerEmail')} /></Field>
                <Field label="Description" className="sm:col-span-2"><textarea className={textareaClass} value={form.description} onChange={set('description')} maxLength={1000} /></Field>
              </>
            )}
          </form>
        </Dialog>
      )}
    </Page>
  );
};

export default ShopProfile;
