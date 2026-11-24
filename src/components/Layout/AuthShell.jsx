/* eslint-disable react/prop-types */
import { Leaf, ShieldCheck, LineChart, Sprout } from 'lucide-react';
import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';

/** Shared two-panel layout for login / forgot / reset password pages. */
export const authInput =
  'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:bg-slate-50';

export const authButton =
  'inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

export const AuthMessage = ({ message, success }) =>
  message ? (
    <div
      role={success ? 'status' : 'alert'}
      className={`rounded-lg px-3 py-2 text-sm ${success ? 'bg-brand-50 text-brand-800 ring-1 ring-brand-200' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'}`}
    >
      {message}
    </div>
  ) : null;

const highlights = [
  { icon: Sprout, text: 'Farm, tree and harvest records in one place' },
  { icon: LineChart, text: 'Live avocado market prices across Rwanda' },
  { icon: ShieldCheck, text: 'Traceable, verified harvest lots for buyers' },
];

const AuthShell = ({ title, subtitle, children, footer }) => (
  <div className="flex min-h-screen bg-slate-50">
    {/* Brand panel */}
    <aside className="relative hidden w-[44%] overflow-hidden bg-brand-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-700/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="relative flex items-center gap-3">
        <img src={logo} alt="" className="h-11 w-11 rounded-xl bg-white object-contain p-1" />
        <span className="text-lg font-semibold text-white">Avocado Society of Rwanda</span>
      </div>
      <div className="relative">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-300">Urakaza neza</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight text-white xl:text-4xl">
          Growing Rwanda&apos;s avocado value chain, together.
        </h2>
        <p className="mt-4 max-w-md text-brand-100/80">
          Ibarura ry&apos;abahinzi bafite ubutaka bakaba bifuza gutera no gukora ubuhinzi bw&apos;avoka by&apos;umwuga.
        </p>
        <ul className="mt-8 space-y-3">
          {highlights.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-brand-50">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Icon className="h-4 w-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
      <p className="relative text-xs text-brand-200/70">© {new Date().getFullYear()} Avocado Society of Rwanda</p>
    </aside>

    {/* Form panel */}
    <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <img src={logo} alt="" className="h-10 w-10 rounded-xl bg-white object-contain p-1 ring-1 ring-slate-200" />
          <span className="font-semibold text-slate-900">Avocado Society of Rwanda</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Leaf className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
      </div>
    </main>
  </div>
);

export default AuthShell;
