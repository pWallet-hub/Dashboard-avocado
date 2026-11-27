import { useId } from 'react';
import { createPortal } from 'react-dom';
import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';

/**
 * The one Avocado Society of Rwanda card, used everywhere a card is shown:
 * the card page (farmer / agent / staff), the farmer profile preview and the
 * public QR check page. ID-1 size (85.6 × 54 mm).
 *
 * Layout is a fixed grid where every area is filled: a coloured photo panel
 * on the left, and on the right the name, coloured info tiles that stretch to
 * the available height, the QR code and a solid date bar. No empty gaps.
 */

const fmt = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
};
const year = (value) => (value ? new Date(value).getFullYear() : '—');
const hasPhoto = (p) => typeof p === 'string' && p.trim() && p !== 'null' && p !== 'undefined';

const STATUS = {
  active: { label: 'ACTIVE', bg: '#22c55e', fg: '#fff' },
  expiring: { label: 'RENEW SOON', bg: '#f59e0b', fg: '#1f1300' },
  expired: { label: 'EXPIRED', bg: '#e11d48', fg: '#fff' },
  suspended: { label: 'SUSPENDED', bg: '#64748b', fg: '#fff' },
};

/* Members: avocado green with gold. Field agents (staff): deep teal with gold. */
const THEME = {
  farmer: {
    title: 'MEMBERSHIP CARD', titleRw: "Ikarita y'umunyamuryango",
    panel: 'linear-gradient(165deg,#0a3d28 0%,#11603a 55%,#1b7d47 100%)',
    body: 'linear-gradient(135deg,#f3fbf4 0%,#e6f6e9 55%,#fdf8e6 100%)',
    dark: '#0b3d28', accent: '#15803d',
    tiles: ['#dcfce7', '#fef3c7', '#e0f2fe', '#fce7f3'], tileInk: ['#14532d', '#78350f', '#0c4a6e', '#831843'],
    bar: 'linear-gradient(90deg,#0b3d28,#15803d)',
  },
  agent: {
    title: 'STAFF IDENTITY CARD', titleRw: "Ikarita y'umukozi · VBA",
    panel: 'linear-gradient(165deg,#062b38 0%,#0b4a5d 55%,#11677e 100%)',
    body: 'linear-gradient(135deg,#f0fbfd 0%,#e0f4f8 55%,#fdf8e6 100%)',
    dark: '#062b38', accent: '#0e6377',
    tiles: ['#cffafe', '#fef3c7', '#e0e7ff', '#dcfce7'], tileInk: ['#164e63', '#78350f', '#312e81', '#14532d'],
    bar: 'linear-gradient(90deg,#062b38,#0e6377)',
  },
};

/* Fine interlaced waves (guilloche), as on IDs and banknotes. */
const WAVES = (() => {
  const out = [];
  for (let k = 0; k < 12; k += 1) {
    let d = '';
    for (let y = 0; y <= 540; y += 12) {
      const x = 130 + Math.sin((y / 540) * Math.PI * 3 + k * 0.5) * (40 + k * 4) + Math.sin((y / 540) * Math.PI * 9 + k) * 8;
      d += `${y === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y} `;
    }
    out.push(d);
  }
  return out;
})();

function Waves({ color = '#fff', opacity = 0.16 }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 260 540" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="1.2" opacity={opacity}>{WAVES.map((d) => <path key={d} d={d} />)}</g>
    </svg>
  );
}

const CARD_STYLE = `
.asr-wrap{width:100%;max-width:580px;container-type:inline-size}
.asr-card{position:relative;width:100%;aspect-ratio:85.6/54;font-size:3.05cqw;border-radius:.9em;overflow:hidden;color:#0f172a;
  box-shadow:0 2px 4px rgba(15,23,42,.08),0 22px 44px -18px rgba(15,23,42,.45);
  font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-feature-settings:"tnum";-webkit-print-color-adjust:exact;print-color-adjust:exact}
.asr-card .lbl{font-size:.46em;font-weight:800;letter-spacing:.14em;text-transform:uppercase;line-height:1.2;opacity:.75}
.asr-card .val{font-size:.86em;font-weight:750;line-height:1.15;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:break-word}
.asr-card .nm{font-weight:800;line-height:1.05;letter-spacing:-.015em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
@media print{
  @page{size:85.6mm 54mm;margin:0}
  html,body{margin:0!important;padding:0!important;background:#fff!important;width:85.6mm!important;min-height:0!important;height:auto!important}
  body>*:not(.asr-print-root){display:none!important}
  .asr-print-root{display:block!important}
  .asr-print-root *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  .asr-print-root .asr-wrap{max-width:none;width:85.6mm;height:54mm;overflow:hidden;break-inside:avoid;page-break-inside:avoid}
  .asr-print-root .asr-wrap+.asr-wrap{break-before:page;page-break-before:always}
  .asr-print-root .asr-card{width:85.6mm;height:54mm;font-size:2.61mm;border-radius:0;box-shadow:none}
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

function Seal({ ok = true, label }) {
  // Unique per instance: the print copy must not point at the (hidden) screen copy's gradient.
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

function Photo({ card }) {
  return (
    <div className="relative min-h-0 w-full flex-1 overflow-hidden rounded-[.5em] bg-white/15 ring-[.14em] ring-[#f1d77a]">
      {hasPhoto(card.photo) ? (
        <img src={card.photo} alt="" className="absolute inset-0 h-full w-full object-cover" crossOrigin="anonymous" />
      ) : (
        <svg viewBox="0 0 60 76" preserveAspectRatio="xMidYMax meet" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <circle cx="30" cy="28" r="13" fill="rgba(255,255,255,.55)" />
          <path d="M4 76c2-18 13-26 26-26s24 8 26 26z" fill="rgba(255,255,255,.55)" />
          <text x="30" y="33.5" textAnchor="middle" fontSize="15" fontWeight="800" fill="#0b3d28" fontFamily="Inter,sans-serif">{(card.full_name || 'M').trim().charAt(0).toUpperCase()}</text>
        </svg>
      )}
    </div>
  );
}

function Tile({ label, children, bg, ink, className = '', mono = false }) {
  return (
    <div className={`flex min-h-0 min-w-0 flex-col justify-center gap-[.1em] rounded-[.45em] px-[.55em] py-[.25em] ${className}`} style={{ background: bg, color: ink }}>
      <p className="lbl">{label}</p>
      <p className={`val ${mono ? 'font-mono tracking-[.04em]' : ''}`}>{children}</p>
    </div>
  );
}

/** Long names get a smaller size so the whole name fits on two lines. */
const nameSize = (name = '') => (name.length > 34 ? '.98em' : name.length > 22 ? '1.14em' : '1.36em');

/**
 * Front of the card. `card` is the object from /api/membership/…
 * `variant="public"` (QR check page): a valid / not-valid seal replaces the QR
 * and farm figures are not shown.
 */
export function CardFront({ card, variant = 'full' }) {
  const agent = card.kind === 'agent';
  const isPublic = variant === 'public';
  const t = agent ? THEME.agent : THEME.farmer;
  const s = STATUS[card.status] || STATUS.active;
  const valid = card.status === 'active' || card.status === 'expiring';
  const place = [card.sector, card.district].filter(Boolean).join(', ') || '—';
  const area = card.areas?.length ? card.areas.join(', ') : place;

  const tiles = agent
    ? [['Position', card.role_title || 'Field Agent (VBA)'], ['Area served', area], ['Issued', fmt(card.member_since)], ['Valid', 'While employed']]
    : isPublic
      ? [['Location', place], ['Profile', card.profile_verified ? 'Verified by ASR' : 'Registered'], ['Valid until', fmt(card.valid_until)], ['Member since', year(card.member_since)]]
      : [['Location', place], ['Variety', card.varieties?.length ? card.varieties.slice(0, 2).join(', ') : '—'], ['Trees', Number(card.trees || 0).toLocaleString()], ['Farms', card.farms || 0]];

  return (
    <div className="asr-wrap">
      <Styles />
      <div className="asr-card grid grid-cols-[31%_1fr]" role="img"
        aria-label={`Avocado Society of Rwanda ${agent ? 'staff identity card' : 'membership card'} of ${card.full_name}, ${card.member_code}`}>
        {/* Left: colour panel with logo, photo and number */}
        <div className="relative flex min-h-0 flex-col gap-[.45em] overflow-hidden px-[.7em] pb-[.75em] pt-[.6em] text-white" style={{ background: t.panel }}>
          <Waves />
          <div className="relative flex items-center gap-[.35em]">
            <span className="flex h-[2.1em] w-[2.1em] shrink-0 items-center justify-center rounded-full bg-white p-[.12em] ring-[.12em] ring-[#f1d77a]">
              <img src={logo} alt="" className="h-full w-full rounded-full object-contain" />
            </span>
            <p className="text-[.5em] font-extrabold leading-[1.15] tracking-[.08em]">AVOCADO<br />SOCIETY OF<br />RWANDA</p>
          </div>
          <Photo card={card} />
          <div className="relative rounded-[.4em] bg-black/25 px-[.4em] py-[.22em] text-center">
            <p className="text-[.42em] font-bold tracking-[.16em] text-[#f1d77a]">{agent ? 'STAFF NO.' : 'MEMBER NO.'}</p>
            <p className="font-mono text-[.8em] font-extrabold tracking-[.06em]">{card.member_code}</p>
          </div>
          <Flag className="absolute inset-x-0 bottom-0 h-[.28em]" />
        </div>

        {/* Right: name, tiles, QR, dates */}
        <div className="relative grid min-h-0 grid-rows-[auto_auto_1fr_auto]" style={{ background: t.body }}>
          <div className="flex items-start justify-between gap-[.5em] px-[.75em] pt-[.6em]">
            <div className="min-w-0 leading-[1.15]">
              <p className="text-[.56em] font-extrabold tracking-[.14em]" style={{ color: t.accent }}>{t.title}</p>
              <p className="truncate text-[.48em] font-semibold text-slate-500">{t.titleRw}</p>
            </div>
            <span className="shrink-0 rounded-full px-[.6em] py-[.2em] text-[.48em] font-extrabold tracking-[.12em] shadow-sm" style={{ background: s.bg, color: s.fg }}>{s.label}</span>
          </div>

          <div className="px-[.75em] pt-[.25em]">
            <p className="nm" style={{ fontSize: nameSize(card.full_name), color: t.dark }} title={card.full_name}>{card.full_name}</p>
          </div>

          <div className="flex min-h-0 gap-[.45em] px-[.75em] py-[.45em]">
            <div className="grid min-w-0 flex-1 grid-cols-2 grid-rows-2 gap-[.32em]">
              {tiles.map(([label, value], i) => (
                <Tile key={label} label={label} bg={t.tiles[i]} ink={t.tileInk[i]}>{value}</Tile>
              ))}
            </div>
            <div className="flex w-[6.4em] shrink-0 flex-col items-center justify-center gap-[.15em] rounded-[.45em] bg-white p-[.3em] shadow-sm ring-1 ring-black/5">
              {isPublic || !card.qr_code ? (
                <div className="aspect-square w-full"><Seal ok={valid} label={valid ? 'VALID' : 'INVALID'} /></div>
              ) : (
                <img src={card.qr_code} alt="QR code to verify this card" className="aspect-square w-full" />
              )}
              <span className="text-[.4em] font-extrabold tracking-[.12em] text-slate-500">{isPublic ? (valid ? 'CHECKED TODAY' : 'NOT VALID') : 'SCAN TO VERIFY'}</span>
            </div>
          </div>

          <div className="relative flex items-center gap-[.6em] px-[.75em] py-[.38em] text-white" style={{ background: t.bar }}>
            {agent ? (
              <div className="min-w-0 flex-1">
                <p className="text-[.42em] font-bold tracking-[.14em] text-[#f1d77a]">STATUS</p>
                <p className="text-[.7em] font-extrabold">{valid ? 'ACTIVE FIELD AGENT' : s.label}</p>
              </div>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-[.42em] font-bold tracking-[.14em] text-[#f1d77a]">{isPublic ? 'STATUS' : 'VALID FROM'}</p>
                  <p className="text-[.7em] font-extrabold">{isPublic ? (valid ? 'VALID MEMBER' : s.label) : fmt(card.valid_from)}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[.42em] font-bold tracking-[.14em] text-[#f1d77a]">VALID UNTIL</p>
                  <p className="text-[.7em] font-extrabold">{fmt(card.valid_until)}</p>
                </div>
              </>
            )}
            <div className="-my-[.6em] h-[2.5em] w-[2.5em] shrink-0 drop-shadow"><Seal ok={valid} label={agent ? 'STAFF' : 'MEMBER'} /></div>
          </div>
        </div>

        {(card.status === 'expired' || card.status === 'suspended') && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="-rotate-12 rounded-[.3em] border-[.18em] border-rose-600/80 bg-white/80 px-[.6em] text-[2.2em] font-black tracking-widest text-rose-600">{s.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Back of the card: verification steps and signature strip. */
export function CardBack({ card }) {
  const agent = card.kind === 'agent';
  const t = agent ? THEME.agent : THEME.farmer;
  const steps = [
    ['Scan', 'Point any phone camera at the QR code.'],
    ['Check', agent ? 'The ASR page shows if this agent is active today, with photo.' : 'The ASR page shows if the membership is valid today, with photo.'],
    ['Return', agent ? 'Personal card. If found, return it to the ASR office.' : 'Personal card. If found, hand it to any ASR field agent (VBA).'],
  ];
  return (
    <div className="asr-wrap">
      <Styles />
      <div className="asr-card grid grid-rows-[auto_1fr_auto]" role="img" aria-label="Back of the card" style={{ background: t.body }}>
        <div className="relative overflow-hidden px-[.9em] py-[.45em] text-white" style={{ background: t.bar }}>
          <p className="text-[.5em] font-extrabold tracking-[.18em]">PROPERTY OF THE AVOCADO SOCIETY OF RWANDA</p>
          <p className="text-[.42em] font-semibold tracking-[.14em] text-[#f1d77a]">{agent ? 'STAFF IDENTITY CARD' : 'MEMBERSHIP CARD'} · {card.member_code}</p>
        </div>

        <div className="flex min-h-0 gap-[.6em] px-[.9em] py-[.55em]">
          <div className="flex shrink-0 flex-col items-center justify-center rounded-[.5em] bg-white p-[.3em] shadow-sm ring-1 ring-black/5">
            <img src={card.qr_code} alt="QR code to verify this card" className="block h-[8.2em] w-[8.2em]" />
            <span className="font-mono text-[.62em] font-extrabold tracking-[.05em]" style={{ color: t.accent }}>{card.member_code}</span>
          </div>
          <div className="grid min-w-0 flex-1 grid-rows-3 gap-[.3em]">
            {steps.map(([title, text], i) => (
              <div key={title} className="flex min-h-0 items-center gap-[.45em] rounded-[.45em] px-[.5em]" style={{ background: t.tiles[i], color: t.tileInk[i] }}>
                <span className="flex h-[1.6em] w-[1.6em] shrink-0 items-center justify-center rounded-full text-[.78em] font-black text-white" style={{ background: t.tileInk[i] }}>{i + 1}</span>
                <div className="min-w-0 leading-[1.2]">
                  <p className="text-[.66em] font-extrabold tracking-[.06em]">{title.toUpperCase()}</p>
                  <p className="text-[.64em] font-medium">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-[.9em] pb-[.75em]">
          <div className="flex items-center gap-[.5em]">
            <span className="shrink-0 text-[.44em] font-extrabold tracking-[.14em] text-slate-500">{agent ? 'HOLDER’S' : 'MEMBER’S'}<br />SIGNATURE</span>
            <div className="h-[2em] flex-1 rounded-[.3em] ring-1 ring-slate-300" style={{ background: 'repeating-linear-gradient(135deg,#fff 0 .35em,#f1f5f9 .35em .7em)' }} />
            <span className="shrink-0 text-right text-[.44em] font-extrabold tracking-[.14em] text-slate-500">{agent ? 'ISSUED' : 'VALID UNTIL'}<br /><b className="text-[1.4em] text-slate-900">{fmt(agent ? card.member_since : card.valid_until)}</b></span>
          </div>
        </div>
        <Flag className="absolute inset-x-0 bottom-0 h-[.3em]" />
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
