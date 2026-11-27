import { createPortal } from 'react-dom';
import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';

/**
 * The one Avocado Society of Rwanda card, used everywhere a card is shown:
 * the card page (farmer / agent / staff), the farmer profile preview, and the
 * public QR check page. ID-1 size (85.6 × 54 mm), official-ID conventions:
 * guilloche security pattern, Rwanda colour stripe, framed portrait, labelled
 * fields, verification seal, and a signature strip on the back.
 */

const fmt = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
};
const year = (value) => (value ? new Date(value).getFullYear() : '—');
const hasPhoto = (p) => typeof p === 'string' && p.trim() && p !== 'null' && p !== 'undefined';

const STATUS = {
  active: { label: 'ACTIVE', bg: '#dcfce7', fg: '#14532d', dot: '#16a34a' },
  expiring: { label: 'RENEW SOON', bg: '#fef3c7', fg: '#78350f', dot: '#d97706' },
  expired: { label: 'EXPIRED', bg: '#ffe4e6', fg: '#881337', dot: '#e11d48' },
  suspended: { label: 'SUSPENDED', bg: '#e2e8f0', fg: '#1e293b', dot: '#64748b' },
};

/* Members: avocado green. Field agents (staff): deep teal. */
const THEME = {
  farmer: {
    title: 'MEMBERSHIP CARD', titleRw: "IKARITA Y'UMUNYAMURYANGO",
    head: 'linear-gradient(120deg,#062e21 0%,#0d4a2f 45%,#166534 80%,#1f7a45 100%)',
    accent: '#166534', soft: '#f0fdf4', line: '#bbf7d0', ink: '#14532d',
  },
  agent: {
    title: 'STAFF IDENTITY CARD', titleRw: "IKARITA Y'UMUKOZI · VBA",
    head: 'linear-gradient(120deg,#04222d 0%,#0a3b4a 45%,#0e5a6e 80%,#14708a 100%)',
    accent: '#0e6377', soft: '#ecfeff', line: '#a5f3fc', ink: '#083344',
  },
};

/* Guilloche: interlaced sine waves, the fine line pattern used on IDs and banknotes. */
const GUILLOCHE = (() => {
  const paths = [];
  for (let k = 0; k < 14; k += 1) {
    let d = '';
    for (let x = 0; x <= 860; x += 10) {
      const y = 70 + Math.sin((x / 860) * Math.PI * 4 + k * 0.45) * (28 + k * 2.2) + Math.sin((x / 860) * Math.PI * 11 + k) * 6;
      d += `${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)} `;
    }
    paths.push(d);
  }
  return paths;
})();

function Guilloche({ className, color = '#fff', opacity = 0.14 }) {
  return (
    <svg className={className} viewBox="0 0 860 140" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="1.1" opacity={opacity}>
        {GUILLOCHE.map((d) => <path key={d} d={d} />)}
      </g>
    </svg>
  );
}

const CARD_STYLE = `
.asr-wrap{width:100%;max-width:580px;container-type:inline-size}
.asr-card{position:relative;width:100%;aspect-ratio:85.6/54;font-size:3.05cqw;border-radius:.85em;overflow:hidden;background:#fff;color:#0f172a;
  box-shadow:0 1px 2px rgba(15,23,42,.08),0 18px 40px -16px rgba(15,23,42,.38);outline:1px solid rgba(15,23,42,.10);
  font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-feature-settings:"tnum";-webkit-print-color-adjust:exact;print-color-adjust:exact}
.asr-card .g-abs{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.asr-card .lbl{font-size:.46em;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#64748b;line-height:1.25}
.asr-card .val{font-size:.76em;font-weight:650;line-height:1.25;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.asr-card .nm{font-weight:800;line-height:1.06;letter-spacing:-.012em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
.asr-card .flag{display:flex;height:.3em}
.asr-card .flag i{flex:1}
@media print{
  @page{size:85.6mm 54mm;margin:0}
  html,body{margin:0!important;padding:0!important;background:#fff!important;width:85.6mm!important;min-height:0!important;height:auto!important}
  body>*:not(.asr-print-root){display:none!important}
  .asr-print-root{display:block!important}
  .asr-print-root *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  .asr-print-root .asr-wrap{max-width:none;width:85.6mm;height:54mm;overflow:hidden;break-inside:avoid;page-break-inside:avoid}
  .asr-print-root .asr-wrap+.asr-wrap{break-before:page;page-break-before:always}
  .asr-print-root .asr-card{width:85.6mm;height:54mm;font-size:2.61mm;border-radius:0;box-shadow:none;outline:none}
}
.asr-print-root{display:none}
`;

const Styles = () => <style>{CARD_STYLE}</style>;

/** Rwanda flag colours: sky blue, yellow, green. */
const FlagStripe = () => (
  <div className="flag" aria-hidden="true"><i style={{ background: '#00a1de', flex: 2 }} /><i style={{ background: '#fad201' }} /><i style={{ background: '#20603d' }} /></div>
);

function Seal({ t, ok = true, label }) {
  // Gold rosette seal, like the stamp on official documents.
  const ring = ok ? '#b8901c' : '#9f1239';
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={`sg-${ok}`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor={ok ? '#fff6cf' : '#ffe4e6'} />
          <stop offset=".55" stopColor={ok ? '#f1d77a' : '#fda4af'} />
          <stop offset="1" stopColor={ok ? '#b8901c' : '#be123c'} />
        </radialGradient>
      </defs>
      <g>
        {Array.from({ length: 24 }, (_, i) => (
          <circle key={i} cx={50 + 44 * Math.cos((i / 24) * 2 * Math.PI)} cy={50 + 44 * Math.sin((i / 24) * 2 * Math.PI)} r="6.5" fill={`url(#sg-${ok})`} />
        ))}
        <circle cx="50" cy="50" r="42" fill={`url(#sg-${ok})`} />
        <circle cx="50" cy="50" r="34" fill="none" stroke={ring} strokeWidth="1.6" />
        <text x="50" y="47" textAnchor="middle" fontSize="15" fontWeight="900" fill={ok ? t.ink : '#4c0519'} fontFamily="Inter,sans-serif">ASR</text>
        <text x="50" y="62" textAnchor="middle" fontSize="8.5" fontWeight="800" letterSpacing="1" fill={ok ? t.ink : '#4c0519'} fontFamily="Inter,sans-serif">{label}</text>
      </g>
    </svg>
  );
}

function Header({ t, status }) {
  const s = STATUS[status] || STATUS.active;
  return (
    <div className="relative overflow-hidden px-[.95em] pb-[.5em] pt-[.5em] text-white" style={{ background: t.head }}>
      <Guilloche className="g-abs" />
      <div className="relative flex items-center gap-[.6em]">
        <span className="flex h-[2.45em] w-[2.45em] shrink-0 items-center justify-center rounded-full bg-white p-[.14em] shadow-[0_0_0_.12em_rgba(241,215,122,.85)]">
          <img src={logo} alt="" className="h-full w-full rounded-full object-contain" />
        </span>
        <div className="min-w-0 flex-1 leading-[1.12]">
          <p className="text-[.9em] font-extrabold uppercase tracking-[.06em]">Avocado Society of Rwanda</p>
          <p className="truncate text-[.5em] font-semibold tracking-[.16em] text-white/80">{t.title} · {t.titleRw}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-[.35em] rounded-full px-[.6em] py-[.22em] text-[.5em] font-extrabold tracking-[.12em]" style={{ background: s.bg, color: s.fg }}>
          <span className="h-[.62em] w-[.62em] rounded-full" style={{ background: s.dot }} />{s.label}
        </span>
      </div>
    </div>
  );
}

function Photo({ card, t }) {
  return (
    <div className="relative h-full w-[6.3em] shrink-0 rounded-[.45em] bg-white p-[.18em] shadow-[0_.15em_.5em_rgba(15,23,42,.18)] ring-1 ring-slate-200">
      <div className="h-full w-full overflow-hidden rounded-[.32em]" style={{ background: `linear-gradient(160deg,${t.soft},#fff)` }}>
        {hasPhoto(card.photo) ? (
          <img src={card.photo} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
        ) : (
          <svg viewBox="0 0 60 76" className="h-full w-full" aria-hidden="true">
            <circle cx="30" cy="27" r="12" fill={t.line} />
            <path d="M6 76c2-17 12-25 24-25s22 8 24 25z" fill={t.line} />
            <text x="30" y="32" textAnchor="middle" fontSize="15" fontWeight="800" fill={t.accent} fontFamily="Inter,sans-serif">{(card.full_name || 'M').trim().charAt(0).toUpperCase()}</text>
          </svg>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="lbl">{label}</p>
      <p className="val">{children}</p>
    </div>
  );
}

/** Long names get a smaller size so the whole name fits on two lines. */
const nameSize = (name = '') => (name.length > 34 ? '1em' : name.length > 22 ? '1.16em' : '1.38em');

/**
 * Front of the card. `card` is the object from /api/membership/…
 * `variant="public"` is the QR check page: no QR code (the viewer just scanned
 * it) and no farm figures; a valid / not valid seal takes the QR's place.
 */
export function CardFront({ card, variant = 'full' }) {
  const agent = card.kind === 'agent';
  const isPublic = variant === 'public';
  const t = agent ? THEME.agent : THEME.farmer;
  const s = STATUS[card.status] || STATUS.active;
  const valid = card.status === 'active' || card.status === 'expiring';
  const place = [card.sector, card.district].filter(Boolean).join(', ') || '—';
  const area = card.areas?.length ? card.areas.join(', ') : place;

  return (
    <div className="asr-wrap">
      <Styles />
      <div className="asr-card grid grid-rows-[auto_auto_1fr_auto]" role="img"
        aria-label={`Avocado Society of Rwanda ${agent ? 'staff identity card' : 'membership card'} of ${card.full_name}, ${card.member_code}`}>
        <Header t={t} status={card.status} />
        <FlagStripe />

        <div className="relative flex min-h-0 gap-[.8em] px-[.95em] py-[.62em]">
          <Guilloche className="g-abs" color={t.accent} opacity={0.06} />
          <Photo card={card} t={t} />
          <div className="relative flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <p className="lbl">Full name · Amazina</p>
              <p className="nm" style={{ fontSize: nameSize(card.full_name), color: '#0b1220' }} title={card.full_name}>{card.full_name}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-[.7em] gap-y-[.32em]">
              <div className="min-w-0">
                <p className="lbl">{agent ? 'Staff No.' : 'Member No.'}</p>
                <p className="font-mono text-[.88em] font-extrabold tracking-[.05em]" style={{ color: t.accent }}>{card.member_code}</p>
              </div>
              {agent ? <Field label="Position">{card.role_title || 'Field Agent (VBA)'}</Field> : <Field label="Location">{place}</Field>}
              {agent ? (
                <Field label="Area served" className="col-span-2">{area}</Field>
              ) : isPublic ? (
                <Field label="Profile" className="col-span-2">{card.profile_verified ? 'Farm and identity verified by ASR' : 'Registered grower'}</Field>
              ) : (
                <>
                  <Field label="Trees · Farms">{Number(card.trees || 0).toLocaleString()} · {card.farms || 0}</Field>
                  <Field label="Variety">{card.varieties?.length ? card.varieties.slice(0, 2).join(', ') : '—'}</Field>
                </>
              )}
            </div>
          </div>
          <div className="relative flex w-[6.5em] shrink-0 flex-col items-center justify-center gap-[.22em]">
            {isPublic || !card.qr_code ? (
              <>
                <div className="h-[6em] w-[6em]"><Seal t={t} ok={valid} label={valid ? 'VALID' : 'INVALID'} /></div>
                <span className="text-[.44em] font-bold uppercase tracking-[.14em] text-slate-500">{valid ? 'Checked today' : 'Not valid today'}</span>
              </>
            ) : (
              <>
                <div className="rounded-[.35em] bg-white p-[.18em] ring-1 ring-slate-200">
                  <img src={card.qr_code} alt="QR code to verify this card" className="block h-[5.9em] w-[5.9em]" />
                </div>
                <span className="text-[.44em] font-bold uppercase tracking-[.14em] text-slate-500">Scan to verify</span>
              </>
            )}
          </div>
        </div>

        <div className="relative flex items-end gap-[.7em] border-t px-[.95em] pb-[.55em] pt-[.38em]" style={{ background: t.soft, borderColor: t.line }}>
          <div className="grid min-w-0 flex-1 grid-cols-3 gap-[.6em]">
            {agent ? (
              <>
                <Field label="Issued">{fmt(card.member_since)}</Field>
                <Field label="Valid">WHILE EMPLOYED</Field>
                <Field label="Status">{s.label === 'ACTIVE' ? 'ACTIVE STAFF' : s.label}</Field>
              </>
            ) : (
              <>
                {isPublic ? <Field label="Checked">{fmt(new Date())}</Field> : <Field label="Valid from">{fmt(card.valid_from)}</Field>}
                <Field label="Valid until">{fmt(card.valid_until)}</Field>
                <Field label="Member since">{year(card.member_since)}</Field>
              </>
            )}
          </div>
          {!isPublic && (
            <div className="-mt-[1.6em] h-[2.7em] w-[2.7em] shrink-0 drop-shadow-sm">
              <Seal t={t} ok={valid} label={agent ? 'STAFF' : 'MEMBER'} />
            </div>
          )}
          <span className="absolute inset-x-0 bottom-0 h-[.2em]" style={{ background: 'linear-gradient(90deg,#9c7a12,#f1d77a 30%,#fff3c4 50%,#f1d77a 70%,#9c7a12)' }} />
        </div>

        {(card.status === 'expired' || card.status === 'suspended') && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="-rotate-12 rounded-[.3em] border-[.18em] border-rose-600/70 bg-white/75 px-[.6em] text-[2.2em] font-black tracking-widest text-rose-600/80">{s.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Back of the card: verification, rules, signature strip. */
export function CardBack({ card }) {
  const agent = card.kind === 'agent';
  const t = agent ? THEME.agent : THEME.farmer;
  return (
    <div className="asr-wrap">
      <Styles />
      <div className="asr-card grid grid-rows-[auto_1fr_auto]" role="img" aria-label="Back of the card">
        <div className="relative overflow-hidden px-[.95em] py-[.5em] text-white" style={{ background: t.head }}>
          <Guilloche className="g-abs" />
          <p className="relative text-[.52em] font-bold tracking-[.2em]">PROPERTY OF THE AVOCADO SOCIETY OF RWANDA</p>
          <p className="relative text-[.44em] tracking-[.14em] text-white/75">IF FOUND, PLEASE RETURN TO {agent ? 'THE ASR OFFICE' : 'ANY ASR FIELD AGENT (VBA)'}</p>
        </div>

        <div className="relative flex min-h-0 gap-[.9em] px-[.95em] py-[.6em]">
          <Guilloche className="g-abs" color={t.accent} opacity={0.05} />
          <div className="relative flex shrink-0 flex-col items-center justify-center gap-[.25em]">
            <div className="rounded-[.4em] bg-white p-[.2em] ring-1 ring-slate-200">
              <img src={card.qr_code} alt="QR code to verify this card" className="block h-[8.4em] w-[8.4em]" />
            </div>
            <span className="font-mono text-[.72em] font-extrabold tracking-[.05em]" style={{ color: t.accent }}>{card.member_code}</span>
          </div>
          <div className="relative flex min-w-0 flex-1 flex-col justify-between text-[.68em] leading-snug text-slate-600">
            <div className="space-y-[.45em]">
              <p className="text-[1.25em] font-extrabold text-slate-900">Verify this card</p>
              <p>Scan the QR code with any phone camera. The official ASR page shows {agent ? 'whether this person is an active field agent today' : 'whether the membership is valid today'}, with the holder&apos;s photo.</p>
              <p>{agent
                ? 'This card identifies an ASR field agent (VBA). It is personal, not transferable, and must be returned when leaving ASR.'
                : 'This card is personal and not transferable. It identifies a registered avocado grower and member of the Avocado Society of Rwanda.'}</p>
            </div>
            <div>
              <p className="lbl" style={{ fontSize: '.68em' }}>{agent ? 'Holder’s signature' : 'Member’s signature'}</p>
              <div className="mt-[.2em] h-[2.1em] rounded-[.25em] ring-1 ring-slate-300"
                style={{ background: `repeating-linear-gradient(135deg,#fff 0 .35em,${t.soft} .35em .7em)` }} />
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t px-[.95em] pb-[.5em] pt-[.32em] text-[.5em] font-semibold tracking-[.12em] text-slate-500" style={{ background: t.soft, borderColor: t.line }}>
          <span>{agent ? 'ISSUED' : 'VALID UNTIL'} <b className="ml-[.4em] text-slate-900">{fmt(agent ? card.member_since : card.valid_until)}</b></span>
          <span>AVOCADO SOCIETY OF RWANDA · KIGALI</span>
          <span className="absolute inset-x-0 bottom-0 h-[.3em]"><FlagStripe /></span>
        </div>
      </div>
    </div>
  );
}

/**
 * Both sides, front first. For printing, a second copy is placed directly
 * under <body> and everything else is removed from the print layout, so the
 * printout is exactly one side per page at real card size, with colours.
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
