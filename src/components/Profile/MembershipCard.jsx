import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';

const fmt = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const year = (value) => (value ? new Date(value).getFullYear() : '—');

const STATUS = {
  active: { label: 'ACTIVE', dot: '#4ade80' },
  expiring: { label: 'RENEW SOON', dot: '#fbbf24' },
  expired: { label: 'EXPIRED', dot: '#fb7185' },
  suspended: { label: 'SUSPENDED', dot: '#cbd5e1' },
};

/* Two looks: farmers (members) are avocado green, field agents (staff) are
   deep teal-navy, so a staff card can never be mistaken for a member card. */
const THEME = {
  farmer: { kind: 'Member', kindRw: 'Umunyamuryango', title: 'Membership card', bg: 'radial-gradient(130% 150% at 100% 0%,#2f7a4f 0%,#155e3b 40%,#0b3d2e 78%,#082c21 100%)', head: 'rgba(0,0,0,.18)', accent: '#f1d77a', muted: 'rgba(209,250,229,.78)' },
  agent: { kind: 'Field Agent', kindRw: 'Umukozi (VBA)', title: 'Staff ID card', bg: 'radial-gradient(130% 150% at 100% 0%,#1f5a6b 0%,#123f52 42%,#0b2a3b 80%,#071d2a 100%)', head: 'rgba(0,0,0,.22)', accent: '#f1d77a', muted: 'rgba(207,236,245,.78)' },
};

const hasPhoto = (p) => typeof p === 'string' && p.trim() && p !== 'null' && p !== 'undefined';

/* Standard ID-1 card (85.6 × 54 mm, like a bank card). Sizes are in `em` of a
   base font set from the card width, so the card scales on screen and prints
   at its real size. Layout is a fixed 3-row grid (header / body / footer) so
   no area stretches into empty space. */
const CARD_STYLE = `
.asr-card{position:relative;width:100%;max-width:428px;aspect-ratio:85.6/54;font-size:clamp(9px,3.4vw,13.4px);border-radius:.95em;overflow:hidden;color:#fff;
  display:grid;grid-template-rows:auto 1fr auto;box-shadow:0 16px 36px -18px rgba(4,30,24,.7),0 2px 5px rgba(0,0,0,.14);
  -webkit-print-color-adjust:exact;print-color-adjust:exact;font-feature-settings:"tnum"}
.asr-card .pattern{position:absolute;inset:0;opacity:.09;pointer-events:none}
.asr-card .band{position:absolute;left:0;right:0;bottom:0;height:.32em;background:linear-gradient(90deg,#b8901c,#f1d77a 50%,#b8901c)}
.asr-card .lbl{font-size:.56em;letter-spacing:.1em;text-transform:uppercase;line-height:1.15}
.asr-card .val{font-size:.86em;font-weight:600;line-height:1.2}
@media print{
  @page{size:85.6mm 54mm;margin:0}
  body *{visibility:hidden}
  .asr-print-area,.asr-print-area *{visibility:visible}
  .asr-print-area{position:absolute;left:0;top:0;display:block!important}
  .asr-print-area .asr-card{width:85.6mm;max-width:none;font-size:3.2mm;border-radius:3mm;box-shadow:none;break-after:page;page-break-after:always}
}`;

function Pattern() {
  // Avocado halves, drawn very faintly in the background.
  return (
    <svg className="pattern" viewBox="0 0 856 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g fill="none" stroke="#fff" strokeWidth="6">
        <ellipse cx="770" cy="430" rx="120" ry="160" transform="rotate(-25 770 430)" />
        <circle cx="782" cy="460" r="52" />
      </g>
    </svg>
  );
}

function Header({ t, status }) {
  const s = STATUS[status] || STATUS.active;
  return (
    <div className="relative flex items-center gap-[.6em] px-[1em] py-[.55em]" style={{ background: t.head }}>
      <img src={logo} alt="" className="h-[2.4em] w-[2.4em] shrink-0 rounded-[.45em] bg-white object-contain p-[.12em]" />
      <div className="min-w-0 flex-1 leading-[1.15]">
        <p className="truncate text-[.82em] font-bold uppercase tracking-[.1em]">Avocado Society of Rwanda</p>
        <p className="truncate text-[.64em]" style={{ color: t.muted }}>{t.title} · {t.kindRw}</p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-[.35em] rounded-full bg-black/25 px-[.6em] py-[.2em] text-[.58em] font-bold tracking-[.1em] ring-1 ring-white/20">
        <span className="h-[.6em] w-[.6em] rounded-full" style={{ background: s.dot }} />{s.label}
      </span>
    </div>
  );
}

function Photo({ card, t }) {
  return (
    <div className="h-[7.6em] w-[6em] shrink-0 self-center overflow-hidden rounded-[.55em] bg-white/10 ring-[.12em] ring-white/35">
      {hasPhoto(card.photo) ? (
        <img src={card.photo} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[2.6em] font-semibold" style={{ color: t.muted }}>
          {(card.full_name || 'M').charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function Qr({ card, size = '6.6em' }) {
  return (
    <div className="shrink-0 self-center rounded-[.4em] bg-white p-[.2em]">
      <img src={card.qr_code} alt="QR code to verify this card" style={{ width: size, height: size }} className="block" />
    </div>
  );
}

function Field({ label, children, t, className = '' }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="lbl" style={{ color: t.muted }}>{label}</p>
      <p className="val truncate">{children}</p>
    </div>
  );
}

/** Front of the card. `card` is the object returned by /api/membership/… */
export function CardFront({ card }) {
  const agent = card.kind === 'agent';
  const t = agent ? THEME.agent : THEME.farmer;
  const s = STATUS[card.status] || STATUS.active;
  const place = [card.sector, card.district].filter(Boolean).join(', ') || '—';
  const area = card.areas?.length ? card.areas.join(' · ') : place;

  return (
    <div className="asr-card" style={{ background: t.bg }} role="img"
      aria-label={`Avocado Society of Rwanda ${agent ? 'staff ID card' : 'membership card'} of ${card.full_name}, ${card.member_code}`}>
      <style>{CARD_STYLE}</style>
      <Pattern />
      <Header t={t} status={card.status} />

      <div className="relative flex min-h-0 items-center gap-[.85em] px-[1em] py-[.5em]">
        <Photo card={card} t={t} />
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="truncate text-[1.35em] font-bold leading-tight">{card.full_name}</p>
          <p className="font-mono text-[.95em] font-semibold tracking-[.08em]" style={{ color: t.accent }}>{card.member_code}</p>
          {agent ? (
            <>
              <p className="mt-[.15em] truncate text-[.8em] font-medium">{card.role_title || 'Field Agent (VBA)'}{card.specialization ? ` · ${card.specialization}` : ''}</p>
              <Field label="Area served" t={t} className="mt-[.5em]">{area}</Field>
            </>
          ) : (
            <>
              <p className="mt-[.15em] truncate text-[.8em]" style={{ color: t.muted }}>{place}</p>
              <div className="mt-[.5em] grid grid-cols-3 gap-[.4em]">
                <Field label="Trees" t={t}>{Number(card.trees || 0).toLocaleString()}</Field>
                <Field label="Farms" t={t}>{card.farms || 0}</Field>
                <Field label="Variety" t={t}>{card.varieties?.[0] || '—'}</Field>
              </div>
            </>
          )}
        </div>
        <Qr card={card} />
      </div>

      <div className="relative grid grid-cols-3 gap-[.5em] border-t border-white/15 px-[1em] pb-[.65em] pt-[.45em]">
        {agent ? (
          <>
            <Field label="Issued" t={t}>{fmt(card.member_since)}</Field>
            <Field label="Valid" t={t}>While employed</Field>
            <Field label="Scan to verify" t={t} className="text-right">{s.label === 'ACTIVE' ? 'Active staff' : s.label}</Field>
          </>
        ) : (
          <>
            <Field label="Valid from" t={t}>{fmt(card.valid_from)}</Field>
            <Field label="Valid until" t={t}>{fmt(card.valid_until)}</Field>
            <Field label="Member since" t={t} className="text-right">{year(card.member_since)}</Field>
          </>
        )}
      </div>

      {(card.status === 'expired' || card.status === 'suspended') && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="-rotate-12 rounded-[.3em] border-[.2em] border-rose-200/80 bg-rose-950/20 px-[.6em] text-[2.2em] font-black tracking-widest text-rose-100/85">{s.label}</span>
        </div>
      )}
      <div className="band" />
    </div>
  );
}

/** Back of the card: how to check it and what to do if found. */
export function CardBack({ card }) {
  const agent = card.kind === 'agent';
  const t = agent ? THEME.agent : THEME.farmer;
  return (
    <div className="asr-card" style={{ background: t.bg, gridTemplateRows: '1fr' }} role="img" aria-label="Back of the card">
      <style>{CARD_STYLE}</style>
      <Pattern />
      <div className="relative flex min-h-0 items-stretch gap-[1em] px-[1em] pb-[.9em] pt-[.85em]">
        <div className="flex shrink-0 flex-col items-center justify-center gap-[.25em]">
          <Qr card={card} size="10em" />
          <span className="font-mono text-[.8em] font-semibold tracking-wider" style={{ color: t.accent }}>{card.member_code}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between text-[.8em] leading-snug">
          <div className="space-y-[.45em]">
            <p className="text-[1.3em] font-bold leading-tight">Check this card</p>
            <p style={{ color: t.muted }}>Scan the QR code with a phone camera. The ASR page shows {agent ? 'whether this person is an active field agent today' : 'whether the membership is valid today'}.</p>
            <p style={{ color: t.muted }}>
              {agent
                ? 'This card identifies an Avocado Society of Rwanda field agent (VBA). It is personal and must be returned when leaving ASR.'
                : 'This card is personal. It identifies a registered avocado grower and member of the Avocado Society of Rwanda.'}
            </p>
            <p style={{ color: t.muted }}>{agent ? 'If found, please return it to the ASR office.' : 'If found, please hand it to any ASR field agent (VBA).'}</p>
          </div>
          <div className="flex items-end justify-between gap-[1em] pt-[.4em]">
            <div className="min-w-0">
              <p className="lbl" style={{ color: t.muted, fontSize: '.85em' }}>{agent ? 'Issued' : 'Valid until'}</p>
              <p className="text-[1.15em] font-semibold">{fmt(agent ? card.member_since : card.valid_until)}</p>
            </div>
            <div className="w-[9em] border-t border-white/50 pt-[.15em] text-center text-[.85em]" style={{ color: t.muted }}>
              {agent ? 'Holder’s signature' : 'Member’s signature'}
            </div>
          </div>
        </div>
      </div>
      <div className="band" />
    </div>
  );
}

/** Both sides: side by side on wide screens, stacked on phones (print: one side per page). */
export default function MembershipCard({ card, showBack = true }) {
  if (!card) return null;
  return (
    <div className="asr-print-area grid justify-items-center gap-4 2xl:grid-cols-2">
      <CardFront card={card} />
      {showBack && <CardBack card={card} />}
    </div>
  );
}
