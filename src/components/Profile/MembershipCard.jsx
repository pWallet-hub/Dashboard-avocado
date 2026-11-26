import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';

const fmt = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const STATUS = {
  active: { label: 'ACTIVE', cls: 'bg-emerald-400/20 text-emerald-100 ring-emerald-300/40' },
  expiring: { label: 'RENEW SOON', cls: 'bg-amber-400/25 text-amber-100 ring-amber-300/50' },
  expired: { label: 'EXPIRED', cls: 'bg-rose-500/30 text-rose-50 ring-rose-300/60' },
  suspended: { label: 'SUSPENDED', cls: 'bg-slate-400/30 text-slate-50 ring-slate-200/50' },
};

const hasPhoto = (p) => typeof p === 'string' && p.trim() && p !== 'null' && p !== 'undefined';

/* Standard ID-1 card (85.6 × 54 mm, like a bank card). Sizes are in `em` of a
   base font set from the card width, so the card scales on screen and prints
   at its real size. */
const CARD_STYLE = `
.asr-card{position:relative;width:100%;max-width:428px;aspect-ratio:85.6/54;font-size:clamp(9px,3.4vw,13.4px);border-radius:1.1em;overflow:hidden;color:#fff;
  background:radial-gradient(120% 140% at 100% 0%,#2f7a4f 0%,#155e3b 38%,#0b3d2e 75%,#082c21 100%);box-shadow:0 18px 40px -18px rgba(8,44,33,.65),0 2px 6px rgba(0,0,0,.15);
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
.asr-card .pattern{position:absolute;inset:0;opacity:.12;pointer-events:none}
.asr-card .band{position:absolute;left:0;right:0;bottom:0;height:.45em;background:linear-gradient(90deg,#c9a227,#f1d77a 50%,#c9a227)}
@media print{
  @page{size:85.6mm 54mm;margin:0}
  body *{visibility:hidden}
  .asr-print-area,.asr-print-area *{visibility:visible}
  .asr-print-area{position:absolute;left:0;top:0}
  .asr-print-area .asr-card{width:85.6mm;max-width:none;font-size:3.2mm;border-radius:3mm;box-shadow:none;break-after:page;page-break-after:always}
  .asr-print-area .asr-gap{display:none}
}`;

function Pattern() {
  // Avocado halves, drawn very faintly in the background.
  return (
    <svg className="pattern" viewBox="0 0 856 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g fill="none" stroke="#fff" strokeWidth="6">
        <ellipse cx="760" cy="420" rx="120" ry="160" transform="rotate(-25 760 420)" />
        <circle cx="772" cy="450" r="52" />
        <ellipse cx="640" cy="-10" rx="80" ry="110" transform="rotate(30 640 -10)" />
      </g>
    </svg>
  );
}

/** Front of the card. `card` is the object returned by /api/membership/… */
export function CardFront({ card }) {
  const s = STATUS[card.status] || STATUS.active;
  const place = [card.sector, card.district].filter(Boolean).join(', ') || '—';
  return (
    <div className="asr-card" role="img" aria-label={`Avocado Society of Rwanda membership card of ${card.full_name}, member ${card.member_code}, valid until ${fmt(card.valid_until)}`}>
      <style>{CARD_STYLE}</style>
      <Pattern />
      <div className="relative flex h-full flex-col p-[1.1em] pb-[1.35em]">
        <div className="flex items-start justify-between gap-[.6em]">
          <div className="flex items-center gap-[.55em]">
            <img src={logo} alt="" className="h-[2.4em] w-[2.4em] rounded-[.5em] bg-white object-contain p-[.15em]" />
            <div className="leading-tight">
              <p className="text-[.78em] font-bold uppercase tracking-[.12em]">Avocado Society of Rwanda</p>
              <p className="text-[.62em] text-emerald-100/90">Membership card · Ikarita y&apos;umunyamuryango</p>
            </div>
          </div>
          <span className={`shrink-0 rounded-full px-[.6em] py-[.15em] text-[.6em] font-bold tracking-wider ring-1 ${s.cls}`}>{s.label}</span>
        </div>

        <div className="mt-[.8em] flex min-h-0 flex-1 gap-[.85em]">
          <div className="h-[5.6em] w-[4.6em] shrink-0 overflow-hidden rounded-[.55em] bg-white/10 ring-2 ring-white/30">
            {hasPhoto(card.photo) ? (
              <img src={card.photo} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[2em] font-semibold text-emerald-100">{(card.full_name || 'M').charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[1.15em] font-bold leading-tight">{card.full_name}</p>
            <p className="mt-[.1em] font-mono text-[.85em] tracking-[.08em] text-[#f1d77a]">{card.member_code}</p>
            <p className="mt-[.25em] truncate text-[.7em] text-emerald-50/90">{place}</p>
            <dl className="mt-[.45em] grid grid-cols-3 gap-[.3em] text-[.62em] leading-tight">
              <div><dt className="uppercase tracking-wide text-emerald-200/80">Trees</dt><dd className="text-[1.25em] font-semibold">{Number(card.trees || 0).toLocaleString()}</dd></div>
              <div><dt className="uppercase tracking-wide text-emerald-200/80">Farms</dt><dd className="text-[1.25em] font-semibold">{card.farms || 0}</dd></div>
              <div className="min-w-0"><dt className="uppercase tracking-wide text-emerald-200/80">Variety</dt><dd className="truncate text-[1.25em] font-semibold">{card.varieties?.[0] || '—'}</dd></div>
            </dl>
          </div>
          <div className="flex shrink-0 flex-col items-center justify-start">
            <div className="rounded-[.45em] bg-white p-[.25em]"><img src={card.qr_code} alt="QR code to verify this card" className="h-[5.2em] w-[5.2em]" /></div>
            <span className="mt-[.2em] text-[.5em] uppercase tracking-wider text-emerald-100/80">Scan to verify</span>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-[.6em] text-[.6em] leading-tight">
          <div><span className="uppercase tracking-wide text-emerald-200/80">Valid from</span><p className="text-[1.2em] font-semibold">{fmt(card.valid_from)}</p></div>
          <div><span className="uppercase tracking-wide text-emerald-200/80">Valid until</span><p className="text-[1.2em] font-semibold">{fmt(card.valid_until)}</p></div>
          <div className="text-right"><span className="uppercase tracking-wide text-emerald-200/80">Member since</span><p className="text-[1.2em] font-semibold">{card.member_since ? new Date(card.member_since).getFullYear() : '—'}</p></div>
        </div>
      </div>
      {(card.status === 'expired' || card.status === 'suspended') && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="-rotate-12 rounded-[.3em] border-[.2em] border-rose-200/80 px-[.6em] text-[2.4em] font-black tracking-widest text-rose-100/80">{s.label}</span>
        </div>
      )}
      <div className="band" />
    </div>
  );
}

/** Back of the card: how to check it and what to do if found. */
export function CardBack({ card }) {
  return (
    <div className="asr-card" role="img" aria-label="Back of the membership card">
      <style>{CARD_STYLE}</style>
      <Pattern />
      <div className="relative flex h-full gap-[1em] p-[1.1em] pb-[1.35em]">
        <div className="flex shrink-0 flex-col items-center justify-center">
          <div className="rounded-[.6em] bg-white p-[.35em]"><img src={card.qr_code} alt="QR code to verify this card" className="h-[8.6em] w-[8.6em]" /></div>
          <span className="mt-[.3em] font-mono text-[.62em] tracking-wider text-[#f1d77a]">{card.member_code}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col text-[.66em] leading-snug">
          <p className="text-[1.25em] font-bold">Check this card</p>
          <p className="mt-[.3em] text-emerald-50/90">Scan the QR code with a phone camera. The Avocado Society of Rwanda page shows whether the membership is valid today.</p>
          <p className="mt-[.5em] text-emerald-50/90">This card is personal. It identifies a registered avocado grower and member of the Avocado Society of Rwanda.</p>
          <p className="mt-[.5em] text-emerald-50/90">If found, please hand it to any ASR field agent (VBA).</p>
          <div className="mt-auto flex items-end justify-between gap-[1em]">
            <div className="min-w-0">
              <span className="uppercase tracking-wide text-emerald-200/80">Valid until</span>
              <p className="text-[1.15em] font-semibold">{fmt(card.valid_until)}</p>
            </div>
            <div className="w-[9em] border-t border-white/50 pt-[.15em] text-center text-[.85em] text-emerald-100/80">Member&apos;s signature</div>
          </div>
        </div>
      </div>
      <div className="band" />
    </div>
  );
}

/** Both sides, front first (the print view prints one side per page). */
export default function MembershipCard({ card, showBack = true }) {
  if (!card) return null;
  return (
    <div className="asr-print-area flex flex-col items-center gap-5">
      <CardFront card={card} />
      {showBack && (
        <>
          <span className="asr-gap" />
          <CardBack card={card} />
        </>
      )}
    </div>
  );
}
