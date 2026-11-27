import { createPortal } from 'react-dom';
import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';

const fmt = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const year = (value) => (value ? new Date(value).getFullYear() : '—');
const hasPhoto = (p) => typeof p === 'string' && p.trim() && p !== 'null' && p !== 'undefined';

const STATUS = {
  active: { label: 'ACTIVE', bg: '#dcfce7', fg: '#166534' },
  expiring: { label: 'RENEW SOON', bg: '#fef3c7', fg: '#92400e' },
  expired: { label: 'EXPIRED', bg: '#ffe4e6', fg: '#9f1239' },
  suspended: { label: 'SUSPENDED', bg: '#e2e8f0', fg: '#334155' },
};

/* Members are avocado green; field agents (staff) are deep teal, so the two
   cards can't be confused at a glance. */
const THEME = {
  farmer: { title: 'MEMBERSHIP CARD', titleRw: "Ikarita y'umunyamuryango", head: 'linear-gradient(115deg,#0b3d2e 0%,#14532d 55%,#1f7a45 100%)', accent: '#15803d', tint: '#f0fdf4', line: '#bbf7d0' },
  agent: { title: 'STAFF ID CARD', titleRw: "Ikarita y'umukozi (VBA)", head: 'linear-gradient(115deg,#082f3d 0%,#0e4a5c 55%,#14708a 100%)', accent: '#0e7490', tint: '#ecfeff', line: '#a5f3fc' },
};

/* Standard ID-1 card (85.6 × 54 mm). Every size is in `em` of a base font
   that follows the card's own width (container query), so the whole card
   scales as one piece on any screen and prints at its real size. */
const CARD_STYLE = `
.asr-wrap{width:100%;max-width:560px;container-type:inline-size}
.asr-card{position:relative;width:100%;aspect-ratio:85.6/54;font-size:3.1cqw;border-radius:.9em;overflow:hidden;background:#fff;color:#0f172a;
  display:grid;grid-template-rows:auto 1fr auto;box-shadow:0 1px 2px rgba(15,23,42,.06),0 14px 34px -14px rgba(15,23,42,.35);outline:1px solid rgba(15,23,42,.08);
  font-family:Inter,ui-sans-serif,system-ui,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-feature-settings:"tnum"}
.asr-card .wm{position:absolute;right:-4%;bottom:-22%;width:46%;opacity:.05;pointer-events:none}
.asr-card .lbl{font-size:.5em;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#64748b;line-height:1.2}
.asr-card .val{font-size:.8em;font-weight:600;line-height:1.25;color:#0f172a}
.asr-card .name{font-weight:800;line-height:1.08;letter-spacing:-.01em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
@media print{
  @page{size:85.6mm 54mm;margin:0}
  html,body{margin:0!important;padding:0!important;background:#fff!important;width:85.6mm!important;min-height:0!important;height:auto!important}
  body>*:not(.asr-print-root){display:none!important}
  .asr-print-root{display:block!important}
  .asr-print-root *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  .asr-print-root .asr-wrap{max-width:none;width:85.6mm;height:54mm;overflow:hidden;break-inside:avoid;page-break-inside:avoid}
  .asr-print-root .asr-wrap+.asr-wrap{break-before:page;page-break-before:always}
  .asr-print-root .asr-card{width:85.6mm;height:54mm;font-size:2.65mm;border-radius:0;box-shadow:none;outline:none}
}
.asr-print-root{display:none}
}`;

function Watermark() {
  // Faint avocado half in the corner of the white body.
  return (
    <svg className="wm" viewBox="0 0 200 240" aria-hidden="true">
      <g fill="none" stroke="#14532d" strokeWidth="10">
        <path d="M100 10c40 0 70 60 80 110 12 60-25 110-80 110S8 180 20 120C30 70 60 10 100 10z" />
        <circle cx="100" cy="150" r="42" />
      </g>
    </svg>
  );
}

function Header({ t, status }) {
  const s = STATUS[status] || STATUS.active;
  return (
    <div className="relative flex items-center gap-[.6em] px-[1em] py-[.55em] text-white" style={{ background: t.head }}>
      <span className="flex h-[2.5em] w-[2.5em] shrink-0 items-center justify-center rounded-full bg-white p-[.15em] shadow-sm">
        <img src={logo} alt="" className="h-full w-full rounded-full object-contain" />
      </span>
      <div className="min-w-0 flex-1 leading-[1.15]">
        <p className="text-[.86em] font-extrabold uppercase tracking-[.08em]">Avocado Society of Rwanda</p>
        <p className="truncate text-[.56em] font-semibold tracking-[.14em] text-white/80">{t.title} · <span className="font-medium normal-case tracking-normal">{t.titleRw}</span></p>
      </div>
      <span className="shrink-0 rounded-full px-[.65em] py-[.22em] text-[.54em] font-bold tracking-[.1em]" style={{ background: s.bg, color: s.fg }}>{s.label}</span>
    </div>
  );
}

function Photo({ card, t }) {
  return (
    <div className="h-full w-[6.4em] shrink-0 overflow-hidden rounded-[.55em] ring-1 ring-slate-200" style={{ background: t.tint }}>
      {hasPhoto(card.photo) ? (
        <img src={card.photo} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[2.8em] font-bold" style={{ color: t.accent }}>
          {(card.full_name || 'M').trim().charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="lbl">{label}</p>
      <p className="val truncate">{children}</p>
    </div>
  );
}

/** Long names get a smaller size so the whole name fits on two lines. */
const nameSize = (name = '') => (name.length > 34 ? '1.02em' : name.length > 22 ? '1.18em' : '1.4em');

/** Front of the card. `card` is the object returned by /api/membership/… */
export function CardFront({ card }) {
  const agent = card.kind === 'agent';
  const t = agent ? THEME.agent : THEME.farmer;
  const s = STATUS[card.status] || STATUS.active;
  const place = [card.sector, card.district].filter(Boolean).join(', ') || '—';
  const area = card.areas?.length ? card.areas.join(', ') : place;

  return (
    <div className="asr-wrap">
      <style>{CARD_STYLE}</style>
      <div className="asr-card" role="img"
        aria-label={`Avocado Society of Rwanda ${agent ? 'staff ID card' : 'membership card'} of ${card.full_name}, ${card.member_code}`}>
        <Header t={t} status={card.status} />

        <div className="relative flex min-h-0 gap-[.85em] px-[1em] py-[.7em]">
          <Watermark />
          <Photo card={card} t={t} />
          <div className="relative flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <p className="lbl">Full name</p>
              <p className="name" style={{ fontSize: nameSize(card.full_name) }} title={card.full_name}>{card.full_name}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-[.7em] gap-y-[.35em]">
              <div className="min-w-0">
                <p className="lbl">{agent ? 'Staff No.' : 'Member No.'}</p>
                <p className="font-mono text-[.9em] font-bold tracking-[.04em]" style={{ color: t.accent }}>{card.member_code}</p>
              </div>
              {agent ? <Field label="Role">{card.role_title || 'Field Agent (VBA)'}</Field> : <Field label="Location">{place}</Field>}
              {agent ? (
                <Field label="Area served" className="col-span-2">{area}</Field>
              ) : (
                <>
                  <Field label="Trees · Farms">{Number(card.trees || 0).toLocaleString()} · {card.farms || 0}</Field>
                  <Field label="Variety">{card.varieties?.length ? card.varieties.slice(0, 2).join(', ') : '—'}</Field>
                </>
              )}
            </div>
          </div>
          <div className="relative flex shrink-0 flex-col items-center justify-center gap-[.25em]">
            <img src={card.qr_code} alt="QR code to verify this card" className="h-[6.6em] w-[6.6em] rounded-[.3em] ring-1 ring-slate-200" />
            <span className="text-[.46em] font-semibold uppercase tracking-[.12em] text-slate-500">Scan to verify</span>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-[.6em] border-t px-[1em] pb-[.55em] pt-[.4em]" style={{ background: t.tint, borderColor: t.line }}>
          {agent ? (
            <>
              <Field label="Issued">{fmt(card.member_since)}</Field>
              <Field label="Valid">While employed</Field>
              <Field label="Status" className="text-right">{s.label === 'ACTIVE' ? 'Active staff' : s.label}</Field>
            </>
          ) : (
            <>
              <Field label="Valid from">{fmt(card.valid_from)}</Field>
              <Field label="Valid until">{fmt(card.valid_until)}</Field>
              <Field label="Member since" className="text-right">{year(card.member_since)}</Field>
            </>
          )}
          <span className="absolute inset-x-0 bottom-0 h-[.22em]" style={{ background: 'linear-gradient(90deg,#b8901c,#f1d77a 50%,#b8901c)' }} />
        </div>

        {(card.status === 'expired' || card.status === 'suspended') && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="-rotate-12 rounded-[.3em] border-[.18em] border-rose-600/70 bg-white/70 px-[.6em] text-[2.2em] font-black tracking-widest text-rose-600/80">{s.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Back of the card: how to check it and what to do if found. */
export function CardBack({ card }) {
  const agent = card.kind === 'agent';
  const t = agent ? THEME.agent : THEME.farmer;
  return (
    <div className="asr-wrap">
      <style>{CARD_STYLE}</style>
      <div className="asr-card" role="img" aria-label="Back of the card" style={{ gridTemplateRows: 'auto 1fr' }}>
        <div className="h-[.55em]" style={{ background: t.head }} />
        <div className="relative flex min-h-0 gap-[1em] px-[1em] pb-[.9em] pt-[.8em]">
          <Watermark />
          <div className="relative flex shrink-0 flex-col items-center justify-center gap-[.3em]">
            <img src={card.qr_code} alt="QR code to verify this card" className="h-[9.6em] w-[9.6em] rounded-[.4em] ring-1 ring-slate-200" />
            <span className="font-mono text-[.78em] font-bold tracking-[.04em]" style={{ color: t.accent }}>{card.member_code}</span>
          </div>
          <div className="relative flex min-w-0 flex-1 flex-col justify-between text-[.74em] leading-snug text-slate-600">
            <div className="space-y-[.5em]">
              <p className="text-[1.3em] font-extrabold text-slate-900">Check this card</p>
              <p>Scan the QR code with a phone camera. The ASR page shows {agent ? 'whether this person is an active field agent today' : 'whether the membership is valid today'}.</p>
              <p>
                {agent
                  ? 'This card identifies an Avocado Society of Rwanda field agent (VBA). It is personal and must be returned when leaving ASR.'
                  : 'This card is personal. It identifies a registered avocado grower and member of the Avocado Society of Rwanda.'}
              </p>
              <p>{agent ? 'If found, please return it to the ASR office.' : 'If found, please hand it to any ASR field agent (VBA).'}</p>
            </div>
            <div className="flex items-end justify-between gap-[1em] pt-[.4em]">
              <div>
                <p className="lbl" style={{ fontSize: '.68em' }}>{agent ? 'Issued' : 'Valid until'}</p>
                <p className="text-[1.1em] font-bold text-slate-900">{fmt(agent ? card.member_since : card.valid_until)}</p>
              </div>
              <div className="w-[10em] border-t border-slate-400 pt-[.2em] text-center text-[.85em] text-slate-500">
                {agent ? 'Holder’s signature' : 'Member’s signature'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Both sides, front first. For printing, a second copy is placed directly
 * under <body> and everything else is removed from the print layout (not just
 * hidden), so the printout is exactly one card side per page — front, then
 * back — at real card size, with colours.
 */
export default function MembershipCard({ card, showBack = true }) {
  if (!card) return null;
  return (
    <>
      <div className="flex flex-col items-center gap-5">
        <CardFront card={card} />
        {showBack && <CardBack card={card} />}
      </div>
      {typeof document !== 'undefined' && createPortal(
        <div className="asr-print-root" aria-hidden="true">
          <CardFront card={card} />
          {showBack && <CardBack card={card} />}
        </div>,
        document.body
      )}
    </>
  );
}
