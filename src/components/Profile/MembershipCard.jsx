/* eslint-disable react/prop-types */
import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const TITLES = {
  farmer: 'Farmer membership card',
  agent: 'Field agent card',
  shop_manager: 'Shop manager card',
  admin: 'Administrator card',
};

/**
 * ASR membership card. Field meaning depends on `role` (kept for backwards
 * compatibility with existing callers):
 *   farmer:       treeCount, propertyId (UPI), location, variety
 *   agent:        variety = specialization
 *   shop_manager: variety = shop name
 */
export default function MembershipCard({ name, treeCount, propertyId, location, variety, profileImage, role = 'farmer', memberSince, status }) {
  const v = (x) => (x === undefined || x === null || x === '' ? '—' : x);
  const fields =
    role === 'farmer'
      ? [
          ['Trees', v(treeCount)],
          ['Land title (UPI)', v(propertyId)],
          ['Location', v(location)],
          ['Variety', v(variety)],
        ]
      : [
          [role === 'agent' ? 'Specialization' : role === 'shop_manager' ? 'Shop' : 'Department', v(variety || (role === 'admin' ? 'Administration' : ''))],
          ['Location', v(location)],
          ['Member since', formatDate(memberSince)],
          ['Status', v(status)],
        ];
  const hasImage = typeof profileImage === 'string' && profileImage.trim() && profileImage !== 'null' && profileImage !== 'undefined';

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-brand-900 text-white shadow-lg">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-2">
          <img src={logo} alt="" className="h-8 w-8 rounded-lg bg-white object-contain p-0.5" />
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-100">Avocado Society of Rwanda</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-brand-200">{TITLES[role] || 'Membership card'}</span>
      </div>
      <div className="flex gap-4 p-5">
        <div className="flex flex-col items-center gap-2">
          <div className="h-20 w-20 overflow-hidden rounded-xl bg-white/10 ring-2 ring-white/20">
            {hasImage ? (
              <img src={profileImage} alt={name || 'Member'} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-brand-100">{(name || 'U').charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{v(name)}</p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
            {fields.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-[10px] uppercase tracking-wide text-brand-200">{label}</dt>
                <dd className="truncate text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
