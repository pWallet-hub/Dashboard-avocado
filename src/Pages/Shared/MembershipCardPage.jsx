/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IdCard, Printer, Link2, ExternalLink, RefreshCw, ShieldCheck, CalendarClock, ScanLine, Store, RotateCcw, AlertTriangle } from 'lucide-react';
import MembershipCard from '../../components/Profile/MembershipCard';
import { getMyCard, getFarmerCard, renewMembership, MEMBERSHIP_STATUS } from '../../services/membershipService';
import { regenerateQRToken } from '../../services/profileAccessService';
import { useToast } from '../../components/Ui/Toast';
import { useConfirm } from '../../components/Ui/ConfirmDialog';
import { Page, PageHeader, Card, Badge, Button, Spinner, ErrorState } from '../../components/Ui/kit';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');
const daysLeft = (d) => (d ? Math.ceil((new Date(d).getTime() - Date.now()) / 864e5) : null);

const STEPS = [
  { icon: Store, title: 'Show it when you sell', text: 'At collection centres, markets and to buyers, show your card to prove you are a registered ASR grower.' },
  { icon: ScanLine, title: 'Anyone can check it', text: 'The buyer scans the QR code with a phone camera. A page shows your name, photo, member number and whether the card is valid today. Your phone number and ID stay private.' },
  { icon: CalendarClock, title: 'Valid for one year', text: 'Your VBA (field agent) or the ASR office renews it every year. You get a notification when it is renewed.' },
  { icon: RotateCcw, title: 'Lost your card?', text: 'Ask your VBA to replace it. The old card stops working immediately and a new QR code is printed.' },
];

/**
 * Membership card page.
 *  - Farmer: /dashboard/farmer/membership-card (their own card)
 *  - Staff:  /dashboard/{admin|agent}/member-card/:userId (print, renew, replace)
 */
export default function MembershipCardPage({ role = 'farmer' }) {
  const { userId } = useParams();
  const toast = useToast();
  const confirm = useConfirm();
  const staff = role === 'admin' || role === 'agent';
  const [state, setState] = useState({ loading: true });
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const card = staff ? await getFarmerCard(userId) : await getMyCard();
      setState({ loading: false, card });
    } catch (error) {
      setState({ loading: false, error: error.message });
    }
  }, [staff, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const card = state.card;
  const meta = card ? MEMBERSHIP_STATUS[card.status] || MEMBERSHIP_STATUS.active : null;
  const left = card ? daysLeft(card.valid_until) : null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(card.verify_url);
      toast.success('Verification link copied');
    } catch {
      toast.error('Could not copy — select the link and copy it by hand');
    }
  };

  const renew = async () => {
    if (!(await confirm(`Renew ${card.full_name}'s membership for one more year?`, { confirmLabel: 'Renew' }))) return;
    setBusy('renew');
    try {
      setState({ loading: false, card: await renewMembership(card.user_id) });
      toast.success('Membership renewed for one year');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy('');
    }
  };

  const replace = async () => {
    if (!(await confirm('Replace this card? The QR code on the old card will stop working at once. Print the new card afterwards.', { confirmLabel: 'Replace card' }))) return;
    setBusy('replace');
    try {
      await regenerateQRToken(card.user_id);
      await load();
      toast.success('New card issued — print it now');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <Page>
      <PageHeader
        icon={IdCard}
        title={staff ? 'Membership card' : 'My membership card'}
        subtitle={staff ? 'Print, renew or replace a farmer’s Avocado Society of Rwanda card.' : 'Your Avocado Society of Rwanda card. Show it proudly when you sell your avocados.'}
        actions={
          card && (
            <>
              <Button icon={Printer} onClick={() => window.print()}>Print card</Button>
              {staff && <Button variant="secondary" icon={CalendarClock} onClick={renew} loading={busy === 'renew'}>Renew 1 year</Button>}
              {staff && <Button variant="secondary" icon={RotateCcw} onClick={replace} loading={busy === 'replace'}>Replace lost card</Button>}
              <Button variant="secondary" icon={RefreshCw} onClick={load} loading={state.loading}>Refresh</Button>
            </>
          )
        }
      />

      {state.loading && !card ? (
        <Card><Spinner label="Loading the card…" /></Card>
      ) : state.error ? (
        <Card><ErrorState message={state.error} onRetry={load} /></Card>
      ) : card ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <Card>
              <MembershipCard card={card} />
              <p className="mt-4 text-center text-xs text-slate-500">
                Prints at the real card size (85.6 × 54 mm), front then back. In the print window choose “Save as PDF” to keep a copy on your phone.
              </p>
            </Card>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <Card title="Status">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Membership</span>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </div>
                <div className="flex items-center justify-between"><span className="text-slate-500">Member number</span><span className="font-mono font-semibold text-slate-900">{card.member_code}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-500">Valid until</span><span className="font-medium text-slate-900">{fmt(card.valid_until)}</span></div>
                {left !== null && left >= 0 && <div className="flex items-center justify-between"><span className="text-slate-500">Days left</span><span className="font-medium text-slate-900">{left}</span></div>}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Profile</span>
                  {card.profile_verified ? <Badge tone="brand"><ShieldCheck className="mr-1 h-3.5 w-3.5" />Verified by ASR</Badge> : <Badge tone="amber">Not yet verified</Badge>}
                </div>
                {(card.status === 'expired' || card.status === 'expiring') && (
                  <p className="flex gap-2 rounded-lg bg-amber-50 p-3 text-amber-900 ring-1 ring-amber-200">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {staff ? 'Renew the membership, then print the card again.' : 'Ask your VBA (field agent) to renew your membership, then print your card again.'}
                  </p>
                )}
                {!card.profile_verified && !staff && (
                  <p className="text-xs text-slate-500">
                    Complete your <Link to="/dashboard/farmer/profile" className="font-medium text-brand-700 hover:underline">profile</Link> and add a photo — your VBA verifies it on the next visit.
                  </p>
                )}
              </div>
            </Card>

            <Card title="Verification link" subtitle="The QR code opens this page.">
              <p className="break-all rounded-lg bg-slate-50 p-2 font-mono text-xs text-slate-700">{card.verify_url}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" icon={Link2} onClick={copyLink}>Copy link</Button>
                <a href={card.verify_url} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  <ExternalLink className="h-3.5 w-3.5" /> Open as a buyer sees it
                </a>
              </div>
            </Card>

            {!staff && (
              <Card title="How to use your card">
                <ul className="space-y-4">
                  {STEPS.map(({ icon: Icon, title, text }) => (
                    <li key={title} className="flex gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Icon className="h-5 w-5" /></span>
                      <div><p className="text-sm font-medium text-slate-900">{title}</p><p className="text-sm text-slate-600">{text}</p></div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      ) : null}
    </Page>
  );
}
