import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, ChevronRight, CheckCircle2 } from 'lucide-react';
import { getMyProfileStatus } from '../../services/activationService';

/** Where the farmer fills in each missing item. */
const WHERE = {
  account: '/dashboard/farmer/profile',
  personal: '/dashboard/farmer/profile',
  farm: '/dashboard/farmer/my-farm',
  land: '/dashboard/farmer/my-farm',
};

/**
 * "Complete your profile" checklist for farmers whose account was created from
 * an import: shows what is still missing and links to where to add it.
 * Renders nothing once the profile is complete (or if it cannot be loaded).
 */
export default function ProfileCompletion({ compact = false }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let alive = true;
    getMyProfileStatus().then((s) => alive && setStatus(s)).catch(() => {});
    return () => { alive = false; };
  }, []);

  if (!status || status.complete) return null;
  const required = status.missing.filter((m) => m.key !== 'email');
  if (!required.length) return null;
  const shown = compact ? required.slice(0, 4) : required;

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5" aria-label="Complete your profile">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold text-slate-900">Complete your profile — {status.percent}% done</h2>
            <span className="text-xs text-slate-600">{required.length} {required.length === 1 ? 'item' : 'items'} missing</span>
          </div>
          <p className="mt-0.5 text-sm text-slate-600">
            The Avocado Society registered some of your details already. Add what is missing so we can map your farm and offer you the right services.
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={status.percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${status.percent}%` }} />
          </div>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {shown.map((m) => (
              <li key={m.key}>
                <Link to={WHERE[m.section] || WHERE.personal} className="group flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-800 ring-1 ring-amber-100 hover:ring-amber-300">
                  <span>{m.label}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-amber-700" />
                </Link>
              </li>
            ))}
          </ul>
          {compact && required.length > shown.length && (
            <Link to="/dashboard/farmer/profile" className="mt-2 inline-block text-sm font-medium text-amber-800 hover:underline">
              See all {required.length} missing items
            </Link>
          )}
          {!compact && status.items.some((i) => i.done) && (
            <p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" /> Already on file: {status.items.filter((i) => i.done && i.key !== 'email').map((i) => i.label.split(' (')[0]).join(', ')}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
