import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ChevronsLeft, Store } from 'lucide-react';
import { NAV_SECTIONS, ROLE_LABELS, homeRouteFor, detectRole, isLinkActive } from './navConfig';
import logo from '../../assets/image/LOGO_-_Avocado_Society_of_Rwanda.png';
import './Sidebar.css';

const getShopInfo = () => {
  try {
    return JSON.parse(localStorage.getItem('shopInfo') || 'null') || { shopName: 'Shop Manager' };
  } catch {
    return { shopName: 'Shop Manager' };
  }
};

/**
 * App sidebar. Desktop: sticky column that collapses to an icon rail.
 * Mobile: slide-over drawer controlled by Layout (mobileOpen / onMobileClose).
 */
const Sidebar = ({ role: propRole, collapsed = false, onToggleCollapse, mobileOpen = false, onMobileClose }) => {
  const location = useLocation();
  const role = useMemo(() => detectRole(propRole, location.pathname), [propRole, location.pathname]);
  const sections = NAV_SECTIONS[role] || NAV_SECTIONS.farmer;
  const username = localStorage.getItem('username') || '';
  const roleLabel = ROLE_LABELS[role] || role;

  // On mobile the drawer always shows full labels, regardless of the desktop rail state.
  const railClass = collapsed ? 'lg:w-[4.75rem]' : 'lg:w-64';

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${railClass} ${
          mobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className={`flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-4 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
          <Link to={homeRouteFor(role)} className="flex min-w-0 items-center gap-3" onClick={onMobileClose}>
            <img src={logo} alt="Avocado Society of Rwanda" className="h-9 w-9 shrink-0 rounded-lg object-contain ring-1 ring-slate-200" />
            <span className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
              <span className="block truncate text-sm font-semibold text-slate-900">Avocado Society</span>
              <span className="block truncate text-xs text-slate-500">of Rwanda · {roleLabel}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onMobileClose}
            className="ml-auto rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shop panel */}
        {role === 'shop-manager' && (
          <div className={`mx-3 mt-3 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2.5 ${collapsed ? 'lg:hidden' : ''}`}>
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 shrink-0 text-brand-700" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-brand-900">{getShopInfo().shopName || 'Shop Manager'}</p>
                <p className="text-xs text-brand-700">Active shop</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section, i) => (
            <div key={section.label} className={i > 0 ? 'mt-5' : ''}>
              <p className={`mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 ${collapsed ? 'lg:hidden' : ''}`}>
                {section.label}
              </p>
              {collapsed && i > 0 && <div className="mx-3 mb-2 hidden border-t border-slate-100 lg:block" />}
              <ul className="space-y-0.5">
                {section.links.map((link) => {
                  const active = isLinkActive(link, location.pathname);
                  const Icon = link.icon;
                  return (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        onClick={onMobileClose}
                        title={link.text}
                        aria-current={active ? 'page' : undefined}
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                          collapsed ? 'lg:justify-center lg:px-0' : ''
                        } ${
                          active
                            ? 'bg-brand-50 text-brand-800'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{link.text}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer: user + collapse */}
        <div className="shrink-0 border-t border-slate-100 p-3">
          <div className={`flex items-center gap-3 rounded-lg px-2 py-2 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold uppercase text-brand-800">
              {(username || roleLabel).charAt(0)}
            </div>
            <div className={`min-w-0 flex-1 ${collapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate text-sm font-medium text-slate-900">{username || 'Signed in'}</p>
              <p className="truncate text-xs text-slate-500">{roleLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="mt-1 hidden w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronsLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            <span className={collapsed ? 'hidden' : ''}>Collapse</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
