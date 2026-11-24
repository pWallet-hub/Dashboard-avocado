/* eslint-disable react/prop-types */
/**
 * Shared UI kit — the building blocks every page should use so the app looks
 * consistent. Colours come from the `brand` palette in tailwind.config.js.
 *
 *   <Page>
 *     <PageHeader icon={Map} title="Farm Map" subtitle="…" actions={<Button>…</Button>} />
 *     <StatGrid><StatCard label="Farms" value="120" /></StatGrid>
 *     <Card title="Table"> … </Card>
 *   </Page>
 */
import { Loader2 } from 'lucide-react';

const cx = (...c) => c.filter(Boolean).join(' ');

export const Page = ({ children, className }) => (
  <div className={cx('mx-auto w-full max-w-7xl space-y-6', className)}>{children}</div>
);

export const PageHeader = ({ icon: Icon, title, subtitle, actions }) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export const Card = ({ title, subtitle, actions, children, className, padded = true }) => (
  <section className={cx('rounded-2xl border border-slate-200 bg-white shadow-sm', className)}>
    {(title || actions) && (
      <header className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </header>
    )}
    <div className={padded ? 'p-5' : ''}>{children}</div>
  </section>
);

export const StatGrid = ({ children, cols = 4 }) => (
  <div className={cx('grid grid-cols-1 gap-4 sm:grid-cols-2', cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4')}>{children}</div>
);

export const StatCard = ({ label, value, hint, icon: Icon, tone = 'brand' }) => {
  const tones = {
    brand: 'bg-brand-50 text-brand-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-100 text-slate-700',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 truncate text-2xl font-semibold text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        {Icon && (
          <div className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tones[tone] || tones.brand)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export const Badge = ({ children, tone = 'slate', className }) => {
  const tones = {
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
    brand: 'bg-brand-50 text-brand-700 ring-brand-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    amber: 'bg-amber-50 text-amber-800 ring-amber-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  };
  return (
    <span className={cx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', tones[tone] || tones.slate, className)}>
      {children}
    </span>
  );
};

export const Button = ({ variant = 'primary', size = 'md', icon: Icon, loading, children, className, ...props }) => {
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
    secondary: 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:ring-brand-500',
    ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-brand-500',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500',
  };
  const sizes = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm' };
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
};

export const inputClass =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30';

export const Field = ({ label, hint, required, children, className }) => (
  <label className={cx('block text-sm', className)}>
    <span className="mb-1 block font-medium text-slate-700">
      {label} {required && <span className="text-rose-600">*</span>}
    </span>
    {children}
    {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
  </label>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
    {Icon && (
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon className="h-6 w-6" />
      </div>
    )}
    <p className="font-medium text-slate-900">{title}</p>
    {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
    <Loader2 className="h-5 w-5 animate-spin" /> {label}
  </div>
);

/** Simple responsive table wrapper with consistent header styling. */
export const Table = ({ head, children }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-slate-200 text-sm">
      <thead className="bg-slate-50">
        <tr>
          {head.map((h, i) => (
            <th key={i} scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
    </table>
  </div>
);

export const Td = ({ children, className }) => <td className={cx('whitespace-nowrap px-4 py-3 text-slate-700', className)}>{children}</td>;
