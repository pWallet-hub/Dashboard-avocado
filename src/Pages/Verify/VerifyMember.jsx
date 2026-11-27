import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';
import { verifyCard } from '../../services/membershipService';
import { CardFront } from '../../components/Profile/MembershipCard';


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
      <div className="mx-auto w-full max-w-xl">
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
              <div className="bg-slate-50 p-4">
                <CardFront card={card} variant="public" />
              </div>
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
