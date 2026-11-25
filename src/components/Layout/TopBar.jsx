/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown, Camera, Menu, ChevronRight, Bell } from 'lucide-react';
import { getUnreadCount } from '../../services/notificationsService';
import SettingsModal from '../Settings/SettingsModal';
import { findActiveLink, normalizeRole, ROLE_LABELS, homeRouteFor } from './navConfig';
import './TopBar.css';

const PROFILE_ROUTES = {
  admin: '/dashboard/admin/profile',
  agent: '/dashboard/agent/profile',
  farmer: '/dashboard/farmer/profile',
  'shop-manager': '/dashboard/shop-manager/profile',
};

const TopBar = ({ onLogout, user, onOpenMobileNav }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [profilePicture, setProfilePicture] = useState(
    () => user?.profile?.picture || localStorage.getItem(`profilePic_${user?.email}`) || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  const role = normalizeRole(user?.role || localStorage.getItem('role'));
  const active = findActiveLink(role, location.pathname);
  const pageTitle = active?.link.text || 'Dashboard';
  const displayName = user?.full_name || user?.name || 'N/A';

  // Close the menu on outside click / Escape.
  useEffect(() => {
    if (!showProfileMenu) return undefined;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    const onKey = (e) => e.key === 'Escape' && setShowProfileMenu(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [showProfileMenu]);

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        setProfilePicture(imageDataUrl);
        localStorage.setItem(`profilePic_${user?.email}`, imageDataUrl);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNavigateProfile = () => {
    setShowProfileMenu(false);
    navigate(PROFILE_ROUTES[role] || '/dashboard');
  };

  const menuItem =
    'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:bg-slate-100';

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="-ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Title + breadcrumb */}
      <div className="min-w-0 flex-1">
        <nav aria-label="Breadcrumb" className="hidden items-center gap-1 text-xs text-slate-500 sm:flex">
          <button type="button" onClick={() => navigate(homeRouteFor(role))} className="hover:text-slate-700">
            {ROLE_LABELS[role] || 'Dashboard'}
          </button>
          {active?.section && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span>{active.section}</span>
            </>
          )}
        </nav>
        <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{pageTitle}</h1>
      </div>

      {/* Notifications */}
      <NotificationBell onOpen={() => navigate('/dashboard/notifications')} pathname={location.pathname} />

      {/* User menu */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setShowProfileMenu((v) => !v)}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-haspopup="menu"
          aria-expanded={showProfileMenu}
        >
          {profilePicture ? (
            <img src={profilePicture} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold uppercase text-brand-800">
              {displayName.charAt(0)}
            </span>
          )}
          <span className="hidden max-w-[12rem] truncate text-sm font-medium text-slate-700 md:block">{displayName}</span>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
        </button>

        {showProfileMenu && (
          <div role="menu" className="absolute right-0 mt-2 w-60 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium text-slate-900">{displayName}</p>
              <p className="truncate text-xs text-slate-500">{ROLE_LABELS[role] || role}</p>
            </div>
            <div className="my-1 border-t border-slate-100" />
            <button role="menuitem" onClick={() => fileInputRef.current?.click()} className={menuItem} disabled={isUploading}>
              <Camera className="h-4 w-4 text-slate-400" />
              {isUploading ? 'Uploading…' : 'Upload photo'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden" />
            {uploadError && <p className="px-3 py-1 text-xs text-rose-600">{uploadError}</p>}
            <button role="menuitem" onClick={handleNavigateProfile} className={menuItem}>
              <User className="h-4 w-4 text-slate-400" />
              Profile
            </button>
            <button
              role="menuitem"
              onClick={() => {
                setShowSettings(true);
                setShowProfileMenu(false);
              }}
              className={menuItem}
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Settings
            </button>
            <div className="my-1 border-t border-slate-100" />
            <button role="menuitem" onClick={onLogout} className={`${menuItem} text-rose-600 hover:bg-rose-50`}>
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>

      <SettingsModal user={user} isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </header>
  );
};

export default TopBar;


/** Bell with unread count; refreshes on navigation and every 60 s while the tab is visible. */
function NotificationBell({ onOpen, pathname }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      getUnreadCount()
        .then((d) => { if (!cancelled) setCount(Number(d?.count) || 0); })
        .catch(() => {});
    };
    refresh();
    const t = setInterval(refresh, 60000);
    return () => { cancelled = true; clearInterval(t); };
  }, [pathname]);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      aria-label={count ? `Notifications, ${count} unread` : 'Notifications'}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
