import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  MapPin,
  ShoppingBag,
  Settings,
  LogOut,
  Loader2,
  Menu,
  X,
  ChevronRight,
  Heart,
  Star,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Failed to logout');
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { id: 'dashboard', path: '/account/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', path: '/account/orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'notifications', path: '/account/notifications', label: 'Notifications', icon: Bell },
    { id: 'wishlist', path: '/account/wishlist', label: 'My Wishlist', icon: Heart },
    { id: 'profile', path: '/account/profile', label: 'Profile Details', icon: User },
    { id: 'addresses', path: '/account/addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'settings', path: '/account/settings', label: 'Account Settings', icon: Settings },
  ];

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-background pt-3 pb-24 sm:py-6 lg:pt-10">
      <div className="responsive-container px-3 sm:px-6">

        {/* Mobile Header & Horizontal Scrollable Nav Bar */}
        <div className="lg:hidden flex flex-col gap-3 mb-5">
          {/* User Profile Card */}
          <div className="flex items-center justify-between gap-3 bg-[var(--card)] p-3.5 rounded-2xl border border-[var(--border)] shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[var(--primary)] text-[var(--button-text)] flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-[var(--body)] font-black uppercase tracking-widest opacity-70">Account Overview</p>
                <p className="text-sm sm:text-base font-black text-[var(--heading)] truncate">{user?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors shrink-0 cursor-pointer"
              title="Logout"
            >
              {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
            </button>
          </div>

          {/* Horizontal Navigation Pills (Scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'bg-[var(--primary)] text-[var(--button-text)] shadow-sm'
                      : 'bg-[var(--card)] text-[var(--heading)] border border-[var(--border)] hover:border-[var(--primary)]'
                  }`}
                >
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Desktop Sidebar Navigation */}
          <aside className="hidden lg:block lg:w-[280px] tv:w-[320px] shrink-0">
            <div className="sticky top-28 bg-[var(--card)] rounded-3xl p-6 tv:p-8 shadow-sm border border-[var(--border)] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

              {/* Desktop User Info */}
              <div className="flex flex-col items-center text-center mb-8 pt-2">
                <div className="w-20 h-20 rounded-full bg-[var(--primary)] text-[var(--button-text)] flex items-center justify-center font-black text-2xl shadow-lg mb-3 border-4 border-[var(--card)] ring-1 ring-[var(--border)]">
                  {getInitials(user?.name)}
                </div>
                <h2 className="text-xl font-black text-[var(--heading)] leading-tight">{user?.name}</h2>
                <p className="text-[10px] text-[var(--body)] font-black mt-1 uppercase tracking-widest opacity-70">{user?.email}</p>
              </div>

              <nav className="space-y-1.5 relative z-10">
                {navItems.map((item) => {
                  const isActive = location.pathname.includes(item.path);
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className={`
                        w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all group
                        ${isActive
                          ? 'bg-[var(--primary)] text-[var(--button-text)] shadow-sm translate-x-1'
                          : 'text-[var(--heading)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]'
                        }
                      `}
                    >
                      <item.icon size={16} className={isActive ? 'text-[var(--button-text)]' : 'text-[var(--primary)] transition-colors'} />
                      <span>{item.label}</span>
                      {isActive && <ChevronRight size={14} className="ml-auto opacity-70 text-[var(--button-text)]" />}
                    </NavLink>
                  );
                })}

                <div className="pt-4 mt-4 border-t border-[var(--border)]">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl font-black text-xs text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all cursor-pointer disabled:opacity-80 uppercase tracking-widest"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 size={16} className="animate-spin shrink-0" />
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut size={16} className="shrink-0" />
                        <span>Logout</span>
                      </>
                    )}
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content Area — Flat on mobile, Card on desktop */}
          <main className="flex-1 w-full min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="bg-transparent lg:bg-[var(--card)] rounded-none lg:rounded-3xl p-0 lg:p-8 tv:p-12 shadow-none lg:shadow-sm border-0 lg:border border-[var(--border)] min-h-[400px]"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
