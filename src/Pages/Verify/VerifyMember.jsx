import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';
import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';
import { verifyCard } from '../../services/membershipService';

const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');
const hasPhoto = (p) => typeof p === 'string' && p.trim() && p !== 'null';

const VERDICT = {
  active: { ok: true, title: 'Valid member', text: 'This card belongs to a registered member of the Avocado Society of Rwanda.' },
  expiring: { ok: true, title: 'Valid member', text: 'Valid today. The membership is due for renewal soon.' },
  expired: { ok: false, title: 'Membership expired', text: 'This person was a member, but the card has not been renewed.' },
  suspended: { ok: false, title: 'Membership suspended', text: 'This card is not valid at the moment.' },
};

const AGENT_VERDICT = {
  active: { ok: true, title: 'Active field agent', text: 'This person is a field agent (VBA) of the Avocado Society of Rwanda.' },
  suspended: { ok: false, title: 'Not an active agent', text: 'This staff card is no longer valid. Do not accept services or payments on behalf of ASR.' },
};

/**
 * Public page opened by the QR code on a membership card (/verify/:token).
 * Shows only what is needed to trust the card — no phone or ID numbers.
 */
export default function VerifyMember() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    verifyCard(token)
      .then((card) => setState({ card }))
      .catch((error) => setState({ error: error.message }));
  }, [token]);

  const { card, error, loading } = state;
  const agent = card?.kind === 'agent';
  const v = card ? (agent ? AGENT_VERDICT[card.status] || AGENT_VERDICT.suspended : VERDICT[card.status] || VERDICT.suspended) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-slate-100 px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-5 flex items-center justify-center gap-2">
          <img src={logo} alt="" className="h-10 w-10 rounded-lg bg-white object-contain p-0.5 shadow-sm" />
          <div className="leading-tight">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-900">Avocado Society of Rwanda</p>
            <p className="text-xs text-slate-500">Card check</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
          {loading ? (
            <div className="flex flex-col items-center gap-3 p-10 text-slate-500"><Loader2 className="h-8 w-8 animate-spin" />Checking the card…</div>
          ) : error ? (
            <div className="p-8 text-center">
              <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600"><AlertTriangle className="h-8 w-8" /></span>
              <p className="text-lg font-semibold text-slate-900">Card not recognised</p>
              <p className="mt-1 text-sm text-slate-600">{error}</p>
              <p className="mt-4 text-xs text-slate-500">If you think this is a mistake, contact the Avocado Society of Rwanda or a field agent (VBA).</p>
            </div>
          ) : (
            <>
              <div className={`flex items-center gap-3 px-5 py-4 ${v.ok ? 'bg-brand-600' : 'bg-rose-600'} text-white`}>
                {v.ok ? <CheckCircle2 className="h-8 w-8 shrink-0" /> : <XCircle className="h-8 w-8 shrink-0" />}
                <div>
                  <p className="text-lg font-semibold">{v.title}</p>
                  <p className="text-sm text-white/90">{v.text}</p>
                </div>
              </div>
              <div className="flex gap-4 p-5">
                <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                  {hasPhoto(card.photo) ? (
                    <img src={card.photo} alt={card.full_name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-slate-400">{card.full_name?.charAt(0)}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-slate-900">{card.full_name}</p>
                  <p className="font-mono text-sm text-brand-700">{card.member_code}</p>
                  {agent ? (
                    <>
                      <p className="text-sm font-medium text-slate-700">{card.role_title || 'Field Agent (VBA)'}</p>
                      <p className="text-sm text-slate-600">Area: {card.areas?.length ? card.areas.join(', ') : '—'}</p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-600">{[card.sector, card.district].filter(Boolean).join(', ') || '—'}</p>
                  )}
                  {!agent && card.profile_verified && (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-700"><ShieldCheck className="h-4 w-4" /> Farm and identity verified by ASR</p>
                  )}
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3 border-t border-slate-100 px-5 py-4 text-sm">
                <div><dt className="text-slate-500">{agent ? 'Valid' : 'Valid until'}</dt><dd className="font-medium text-slate-900">{agent ? 'While employed by ASR' : fmt(card.valid_until)}</dd></div>
                <div><dt className="text-slate-500">{agent ? 'Agent since' : 'Member since'}</dt><dd className="font-medium text-slate-900">{card.member_since ? new Date(card.member_since).getFullYear() : '—'}</dd></div>
              </dl>
              <p className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">
                Check that the photo matches the person showing the card. Checked {new Date().toLocaleString('en-GB')}.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
