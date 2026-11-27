import { useId } from 'react';
import { createPortal } from 'react-dom';
import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';

/**
 * The one Avocado Society of Rwanda card, used everywhere a card is shown:
 * the card page (farmer / agent / staff), the farmer profile preview and the
 * public QR check page.
 *
 * Portrait badge (CR80, 54 × 85.6 mm) for a lanyard: a curved brand-colour
 * top with white swoosh arcs, a gold-framed hexagon photo, the name and role
 * pill, a details list and the QR code. The back is full colour with the
 * return notice, signature line and a large QR code.
 */

const fmt = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const year = (value) => (value ? new Date(value).getFullYear() : '—');
const hasPhoto = (p) => typeof p === 'string' && p.trim() && p !== 'null' && p !== 'undefined';

const STATUS = {
  active: { label: 'ACTIVE', bg: '#22c55e', fg: '#fff' },
  expiring: { label: 'RENEW SOON', bg: '#f59e0b', fg: '#1f1300' },
  expired: { label: 'EXPIRED', bg: '#e11d48', fg: '#fff' },
  suspended: { label: 'SUSPENDED', bg: '#64748b', fg: '#fff' },
};

/* Brand colours. Members: avocado green + gold. Field agents (staff): deep teal + gold. */
const THEME = {
  farmer: {
    title: 'Membership Card', titleRw: "Ikarita y'umunyamuryango", role: 'Avocado Grower · Member',
    c1: '#0b3d28', c2: '#15803d', ink: '#0b3d28', accent: '#15803d', soft: '#ecfdf3',
  },
  agent: {
    title: 'Staff Identity Card', titleRw: "Ikarita y'umukozi", role: 'Field Agent (VBA)',
    c1: '#062b38', c2: '#0e7490', ink: '#062b38', accent: '#0e7490', soft: '#ecfeff',
  },
};
const GOLD = '#e9c75a';

const CARD_STYLE = `
.asr-wrap{width:100%;max-width:330px;margin-inline:auto;container-type:inline-size}
.asr-card{position:relative;width:100%;aspect-ratio:54/85.6;font-size:5cqw;border-radius:1.1em;overflow:hidden;background:#fff;color:#0f172a;
  box-shadow:0 2px 4px rgba(15,23,42,.08),0 24px 46px -20px rgba(15,23,42,.5);
  font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-feature-settings:"tnum";-webkit-print-color-adjust:exact;print-color-adjust:exact}
.asr-card .nm{font-weight:800;line-height:1.08;letter-spacing:-.015em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:break-word}
.asr-card .hex{clip-path:polygon(25% 3%,75% 3%,100% 50%,75% 97%,25% 97%,0 50%)}
.asr-card .slot{position:absolute;left:50%;top:.75em;width:4.6em;height:.95em;transform:translateX(-50%);border-radius:1em;background:#f1f5f9;box-shadow:inset 0 .12em .25em rgba(0,0,0,.35)}
@media print{
  @page{size:54mm 85.6mm;margin:0}
  html,body{margin:0!important;padding:0!important;background:#fff!important;width:54mm!important;min-height:0!important;height:auto!important}
  body>*:not(.asr-print-root){display:none!important}
  .asr-print-root{display:block!important}
  .asr-print-root *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  .asr-print-root .asr-wrap{max-width:none;width:54mm;height:85.6mm;overflow:hidden;break-inside:avoid;page-break-inside:avoid}
  .asr-print-root .asr-wrap+.asr-wrap{break-before:page;page-break-before:always}
  .asr-print-root .asr-card{width:54mm;height:85.6mm;font-size:2.7mm;border-radius:0;box-shadow:none}
  .asr-print-root .slot{display:none}
}
.asr-print-root{display:none}
`;
const Styles = () => <style>{CARD_STYLE}</style>;

/** Rwanda colours: sky blue, yellow, green. */
const Flag = ({ className = '' }) => (
  <div className={`flex ${className}`} aria-hidden="true">
    <i className="block flex-[2]" style={{ background: '#00a1de' }} /><i className="block flex-1" style={{ background: '#fad201' }} /><i className="block flex-1" style={{ background: '#20603d' }} />
  </div>
);

/** Brand top with curved edge and white swoosh arcs (front), or full colour with arcs (back). */
function Backdrop({ t, full = false }) {
  const gid = `asr-bg-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 540 856" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={t.c1} /><stop offset="1" stopColor={t.c2} />
        </linearGradient>
      </defs>
      {full ? (
        <>
          <rect width="540" height="856" fill={`url(#${gid})`} />
          <path d="M-20 140 Q280 40 560 190" fill="none" stroke={GOLD} strokeWidth="4" opacity=".5" />
          <path d="M0 856V700Q270 590 540 700V856Z" fill="#fff" />
          <path d="M-30 690 Q270 560 570 690" fill="none" stroke="#fff" strokeWidth="9" opacity=".9" />
          <path d="M-30 668 Q270 540 570 668" fill="none" stroke={GOLD} strokeWidth="3.5" opacity=".7" />
        </>
      ) : (
        <>
          <path d="M0 0H540V330Q270 440 0 330Z" fill={`url(#${gid})`} />
          <path d="M-30 120 Q120 330 300 370" fill="none" stroke="#fff" strokeWidth="9" opacity=".95" />
          <path d="M600 160 Q430 350 250 372" fill="none" stroke="#fff" strokeWidth="9" opacity=".95" />
          <path d="M-20 60 Q280 -10 560 120" fill="none" stroke={GOLD} strokeWidth="4" opacity=".6" />
          {/* Soft brand corner at the bottom */}
          <path d="M540 856V740Q470 820 360 856Z" fill={t.c2} opacity=".12" />
        </>
      )}
    </svg>
  );
}

function Seal({ ok = true, label }) {
  const id = `asr-seal-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const ink = ok ? '#3f2d00' : '#4c0519';
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor={ok ? '#fff6cf' : '#ffe4e6'} /><stop offset=".55" stopColor={ok ? '#f1d77a' : '#fda4af'} /><stop offset="1" stopColor={ok ? '#b8901c' : '#be123c'} />
        </radialGradient>
      </defs>
      {Array.from({ length: 24 }, (_, i) => (
        <circle key={i} cx={50 + 44 * Math.cos((i / 24) * 2 * Math.PI)} cy={50 + 44 * Math.sin((i / 24) * 2 * Math.PI)} r="6.5" fill={`url(#${id})`} />
      ))}
      <circle cx="50" cy="50" r="42" fill={`url(#${id})`} />
      <circle cx="50" cy="50" r="34" fill="none" stroke={ok ? '#9c7a12' : '#9f1239'} strokeWidth="1.6" />
      <text x="50" y="48" textAnchor="middle" fontSize="16" fontWeight="900" fill={ink} fontFamily="Inter,sans-serif">ASR</text>
      <text x="50" y="63" textAnchor="middle" fontSize="9" fontWeight="800" letterSpacing="1" fill={ink} fontFamily="Inter,sans-serif">{label}</text>
    </svg>
  );
}

function HexPhoto({ card, t }) {
  return (
    <div className="hex relative h-[9.6em] w-[10.8em] p-[.34em]" style={{ background: `linear-gradient(135deg,#fff3c4,${GOLD} 45%,#a8811a)` }}>
      <div className="hex h-full w-full overflow-hidden" style={{ background: `linear-gradient(160deg,${t.soft},#fff)` }}>
        {hasPhoto(card.photo) ? (
          <img src={card.photo} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
        ) : (
          <svg viewBox="0 0 96 86" className="h-full w-full" aria-hidden="true">
            <circle cx="48" cy="34" r="15" fill={t.accent} opacity=".25" />
            <path d="M18 86c3-20 15-29 30-29s27 9 30 29z" fill={t.accent} opacity=".25" />
            <text x="48" y="40" textAnchor="middle" fontSize="18" fontWeight="800" fill={t.accent} fontFamily="Inter,sans-serif">{(card.full_name || 'M').trim().charAt(0).toUpperCase()}</text>
          </svg>
        )}
      </div>
    </div>
  );
}

/** Long names get a smaller size so the whole name fits on two lines. */
const nameSize = (name = '') => (name.length > 30 ? '1.05em' : name.length > 20 ? '1.22em' : '1.42em');

/**
 * Front of the card. `card` is the object from /api/membership/…
 * `variant="public"` (QR check page): a valid / not-valid seal replaces the QR.
 */
export function CardFront({ card, variant = 'full' }) {
  const agent = card.kind === 'agent';
  const isPublic = variant === 'public';
  const t = agent ? THEME.agent : THEME.farmer;
  const s = STATUS[card.status] || STATUS.active;
  const valid = card.status === 'active' || card.status === 'expiring';
  const place = [card.sector, card.district].filter(Boolean).join(', ') || '—';
  const area = card.areas?.length ? card.areas.join(', ') : place;

  const rows = agent
    ? [['Staff No', card.member_code, true], ['Area', area], ['Issued', fmt(card.member_since)], ['Valid', 'While employed']]
    : [
      ['Member No', card.member_code, true],
      ['Location', place],
      isPublic ? ['Profile', card.profile_verified ? 'Verified by ASR' : 'Registered'] : ['Trees', `${Number(card.trees || 0).toLocaleString()} · ${card.farms || 0} farm${card.farms === 1 ? '' : 's'}`],
      ['Valid until', fmt(card.valid_until)],
    ];

  return (
    <div className="asr-wrap">
      <Styles />
      <div className="asr-card" role="img"
        aria-label={`Avocado Society of Rwanda ${agent ? 'staff identity card' : 'membership card'} of ${card.full_name}, ${card.member_code}`}>
        <Backdrop t={t} />
        <span className="slot" aria-hidden="true" />

        <div className="relative flex h-full flex-col items-center px-[1em] pb-[1em] pt-[2.2em]">
          {/* Brand header */}
          <div className="flex w-full items-center gap-[.45em] text-white">
            <span className="flex h-[2.3em] w-[2.3em] shrink-0 items-center justify-center rounded-full bg-white p-[.12em]" style={{ boxShadow: `0 0 0 .12em ${GOLD}` }}>
              <img src={logo} alt="" className="h-full w-full rounded-full object-contain" />
            </span>
            <div className="min-w-0 flex-1 leading-[1.12]">
              <p className="text-[.66em] font-extrabold uppercase tracking-[.06em]">Avocado Society of Rwanda</p>
              <p className="truncate text-[.46em] font-medium text-white/80">{t.title} · {t.titleRw}</p>
            </div>
            <span className="shrink-0 rounded-full px-[.5em] py-[.15em] text-[.4em] font-extrabold tracking-[.1em]" style={{ background: s.bg, color: s.fg }}>{s.label}</span>
          </div>

          {/* Photo */}
          <div className="mt-[.9em] drop-shadow-[0_.3em_.5em_rgba(0,0,0,.25)]"><HexPhoto card={card} t={t} /></div>

          {/* Name + role */}
          <p className="nm mt-[.45em] w-full text-center" style={{ fontSize: nameSize(card.full_name), color: t.ink }} title={card.full_name}>{card.full_name}</p>
          <span className="mt-[.3em] rounded-full px-[.8em] py-[.18em] text-[.52em] font-bold text-white" style={{ background: `linear-gradient(90deg,${t.c1},${t.c2})` }}>
            {agent ? card.role_title || t.role : t.role}
          </span>

          {/* Details + QR in a tinted panel that fills the rest of the card */}
          <div className="mt-[.7em] flex min-h-0 w-full flex-1 items-center gap-[.55em] rounded-[.8em] px-[.7em] py-[.55em]" style={{ background: t.soft, boxShadow: `inset 0 0 0 .07em ${t.accent}22` }}>
            <ul className="relative flex min-w-0 flex-1 flex-col justify-center gap-[.5em] pl-[1.05em]">
              <span className="absolute bottom-[.55em] left-[.26em] top-[.55em] w-[.13em] rounded-full" style={{ background: t.accent, opacity: 0.35 }} />
              {rows.map(([label, value, mono]) => (
                <li key={label} className="relative leading-[1.15]">
                  <span className="absolute -left-[1.06em] top-[.2em] h-[.62em] w-[.62em] rounded-full ring-[.14em] ring-white" style={{ background: t.accent }} />
                  <p className="text-[.46em] font-bold uppercase tracking-[.12em] text-slate-500">{label}</p>
                  <p className={`truncate text-[.72em] font-extrabold ${mono ? 'font-mono tracking-[.03em]' : 'text-slate-900'}`} style={mono ? { color: t.accent } : undefined}>{value}</p>
                </li>
              ))}
            </ul>
            <div className="flex w-[6em] shrink-0 flex-col items-center gap-[.12em] rounded-[.5em] bg-white p-[.25em] shadow-sm ring-1 ring-slate-200">
              {isPublic || !card.qr_code
                ? <div className="aspect-square w-full"><Seal ok={valid} label={valid ? 'VALID' : 'INVALID'} /></div>
                : <img src={card.qr_code} alt="QR code to verify this card" className="aspect-square w-full" />}
              <span className="text-[.36em] font-extrabold tracking-[.12em] text-slate-500">{isPublic ? (valid ? 'CHECKED TODAY' : 'NOT VALID') : 'SCAN TO VERIFY'}</span>
            </div>
          </div>
        </div>

        <Flag className="absolute inset-x-0 bottom-0 h-[.35em]" />
        {(card.status === 'expired' || card.status === 'suspended') && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="-rotate-[20deg] rounded-[.3em] border-[.16em] border-rose-600/80 bg-white/80 px-[.5em] text-[1.6em] font-black tracking-widest text-rose-600">{s.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Back of the card: full brand colour, return notice, signature, QR. */
export function CardBack({ card }) {
  const agent = card.kind === 'agent';
  const t = agent ? THEME.agent : THEME.farmer;
  return (
    <div className="asr-wrap">
      <Styles />
      <div className="asr-card text-white" role="img" aria-label="Back of the card">
        <Backdrop t={t} full />
        <span className="slot" aria-hidden="true" />

        <div className="relative grid h-full grid-rows-[auto_1fr_auto] px-[1.1em] pb-[1em] pt-[2.2em] text-center">
          <div>
            <p className="text-[.62em] font-medium leading-[1.35] text-white/90">
              If you find this card, please return it to {agent ? 'the Avocado Society of Rwanda office' : 'any ASR field agent (VBA) or the ASR office'}.
            </p>
            <div className="mx-auto mt-[1.3em] w-[80%] border-t-[.08em] border-white/80 pt-[.15em]">
              <p className="text-[.56em] font-semibold tracking-[.08em] text-white/85">{agent ? 'Holder’s signature' : 'Member’s signature'}</p>
            </div>
          </div>

          <div className="flex min-h-0 flex-col items-center justify-center">
            <div className="rounded-[.7em] bg-white p-[.4em] shadow-lg" style={{ boxShadow: `0 0 0 .14em ${GOLD}, 0 .6em 1.2em rgba(0,0,0,.3)` }}>
              <img src={card.qr_code} alt="QR code to verify this card" className="block h-[9.2em] w-[9.2em]" />
            </div>
            <p className="mt-[.35em] font-mono text-[.78em] font-extrabold tracking-[.06em]" style={{ color: GOLD }}>{card.member_code}</p>
            <p className="text-[.46em] font-semibold tracking-[.14em] text-white/85">SCAN TO VERIFY {agent ? 'THIS AGENT' : 'MEMBERSHIP'}</p>
          </div>

          <div className="flex items-center justify-center gap-[.5em] pt-[1.2em] text-left">
            <span className="flex h-[2.4em] w-[2.4em] shrink-0 items-center justify-center rounded-full bg-white p-[.12em]" style={{ boxShadow: `0 0 0 .12em ${GOLD}` }}>
              <img src={logo} alt="" className="h-full w-full rounded-full object-contain" />
            </span>
            <div className="min-w-0 leading-[1.2]">
              <p className="text-[.64em] font-extrabold uppercase tracking-[.05em]" style={{ color: t.ink }}>Avocado Society of Rwanda</p>
              <p className="text-[.48em] font-semibold text-slate-500">{agent ? `Issued ${fmt(card.member_since)}` : `Valid until ${fmt(card.valid_until)} · Since ${year(card.member_since)}`}</p>
            </div>
          </div>
        </div>
        <Flag className="absolute inset-x-0 bottom-0 h-[.35em]" />
      </div>
    </div>
  );
}

/**
 * Both sides, side by side (stacked on narrow screens). For printing, a second
 * copy is placed directly under <body> and everything else is removed from the
 * print layout, so the printout is exactly one side per page at real size.
 */
export default function MembershipCard({ card, showBack = true }) {
  if (!card) return null;
  return (
    <>
      <div className="flex flex-wrap items-start justify-center gap-6">
        <div className="w-[330px] max-w-full"><CardFront card={card} /></div>
        {showBack && <div className="w-[330px] max-w-full"><CardBack card={card} /></div>}
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
