import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  Flame,
  History,
  Menu,
  Sun,
  Moon,
  LogOut,
  Loader2,
  ChevronRight,
  X,
  ShoppingCart,
  Store,
  Volume2,
  VolumeX,
  BellRing
} from 'lucide-react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import staffService from '../../services/staffService';
import Logo from '../Logo';
import NotificationDropdown from '../ui/NotificationDropdown';
import NotificationBanner from '../ui/NotificationBanner';
import NotificationPrompt from '../ui/NotificationPrompt';
import useNotificationSound from '../../hooks/useNotificationSound';
import { getSocket, joinStaffRoom } from '../../sockets/socketManager';
import '../../styles/admin-neobrutalist.css';

const menuItems = [
  { path: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/staff/orders/new', label: 'New Orders', icon: ClipboardList, key: 'confirmedOrders' },
  { path: '/staff/orders/active', label: 'Active Orders', icon: Flame, key: 'outForDeliveryOrders' },
  { path: '/staff/orders/history', label: 'Order History', icon: History, key: 'deliveredOrders' },
  { path: '/staff/orders/create-inshop', label: 'New In-Shop Order', icon: ShoppingCart },
  { path: '/staff/orders/in-shop-history', label: 'In-Shop History', icon: Store, key: 'inShopOrdersCount' },
];

const StaffLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [orderCounts, setOrderCounts] = useState({});
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const socketRef = useRef(null);

  const fetchCounts = async () => {
    try {
      const res = await staffService.getDashboard();
      if (res.data?.data) {
        setOrderCounts(res.data.data);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [location.pathname]);

  const handleStaffLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (e) {
      setIsLoggingOut(false);
    }
  };

  const { playSound, testSounds } = useNotificationSound();

  useEffect(() => {
    const userId = user?.id || user?._id || '';
    joinStaffRoom(userId);

    const rawUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');
    const socketUrl = rawUrl.replace(/\/api\/v\d+.*$/, '');

    socketRef.current = io(socketUrl, {
      transports: ['polling', 'websocket'],
      withCredentials: true
    });

    socketRef.current.on('connect', () => {
      console.log('📡 StaffLayout Socket connected:', socketRef.current.id);
      socketRef.current.emit('join_staff_room', userId);
      socketRef.current.emit('join_staff', userId);
    });

    const handleNewOrder = (data) => {
      console.log('🔔 Staff Real-Time Order Received in Layout:', data);
      
      if (!isMuted) {
        playSound('order', true);
      }

      toast.success(
        <div>
          <p className="font-extrabold text-sm">🔔 New Order Alert!</p>
          <p className="text-xs">Order #{data?.orderNumber || data?.orderId || ''} · ₹{data?.amount || ''}</p>
        </div>,
        {
          duration: 6000,
          position: 'top-right',
          icon: '🎂'
        }
      );

      fetchCounts();
    };

    socketRef.current.on('new_order_confirmed', handleNewOrder);
    socketRef.current.on('new_order_alert', handleNewOrder);
    socketRef.current.on('dashboard_needs_refresh', () => fetchCounts());

    const globalSocket = getSocket();
    if (globalSocket) {
      globalSocket.on('new_order_confirmed', handleNewOrder);
      globalSocket.on('new_order_alert', handleNewOrder);
      globalSocket.on('dashboard_needs_refresh', () => fetchCounts());
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (globalSocket) {
        globalSocket.off('new_order_confirmed', handleNewOrder);
        globalSocket.off('new_order_alert', handleNewOrder);
        globalSocket.off('dashboard_needs_refresh');
      }
    };
  }, [user, isMuted, playSound]);

  return (
    <div className="staff-shell flex flex-col h-screen bg-background overflow-hidden text-heading">
      <NotificationBanner />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="staff-sidebar hidden lg:flex flex-col w-64 bg-card border-r border-border flex-shrink-0">
          <div className="px-5 py-5 border-b border-border">
            <Link to="/staff/dashboard" className="flex items-center gap-3">
              <Logo className="w-8 h-8" />
              <span className="text-lg font-black text-heading tracking-tight">Kitchen Panel</span>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const count = item.key ? orderCounts[item.key] : null;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`staff-nav-link ${isActive ? 'is-active' : ''} flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl font-extrabold text-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-amber-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-md translate-x-1.5 font-black'
                      : 'text-heading/80 hover:bg-border/30 hover:text-heading border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icon
                      size={18}
                      className={isActive ? 'text-white dark:text-slate-950' : 'text-heading/70 group-hover:text-heading transition-transform group-hover:scale-110'}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {count !== null && count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black shrink-0 ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                    }`}>
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border space-y-3">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-all cursor-pointer"
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-stone-700" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-9 h-9 rounded-full bg-amber-900/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 flex items-center justify-center text-sm font-extrabold">
                {getInitials(user?.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-stone-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs font-bold text-stone-500 dark:text-stone-400">Staff</p>
              </div>
            </div>
            <button
              onClick={handleStaffLogout}
              disabled={isLoggingOut}
              className="logout-btn-danger flex items-center justify-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm active:scale-95 transition-all cursor-pointer disabled:opacity-80 mt-2"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white shrink-0" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut size={18} className="text-white shrink-0" />
                  <span>Logout</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="staff-sidebar fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 lg:hidden flex flex-col"
              >
                <div className="px-5 py-6 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Logo className="w-7 h-7" />
                    <span className="text-base font-black text-stone-900 dark:text-white">Kitchen Panel</span>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-xl text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X size={22} />
                  </button>
                </div>
                <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const count = item.key ? orderCounts[item.key] : null;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all ${
                          isActive
                            ? 'bg-amber-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-md font-black'
                            : 'text-stone-800 dark:text-stone-200 hover:bg-amber-500/10 dark:hover:bg-amber-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <item.icon size={18} className={isActive ? 'text-white dark:text-slate-950' : 'text-amber-700 dark:text-amber-400'} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {count !== null && count !== undefined && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-black shrink-0 ${
                            isActive
                              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                              : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                          }`}>
                            {count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-border">
                  <button
                    onClick={handleStaffLogout}
                    disabled={isLoggingOut}
                    className="logout-btn-danger flex items-center justify-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm active:scale-95 transition-all cursor-pointer disabled:opacity-80"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 size={18} className="animate-spin text-white shrink-0" />
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut size={18} className="text-white shrink-0" />
                        <span>Logout</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="staff-topbar h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 hover:bg-border rounded-xl transition-colors lg:hidden"
              >
                <Menu size={20} className="text-heading" />
              </button>
              <div>
                <p className="hidden sm:block text-[11px] font-semibold uppercase tracking-wider text-muted mb-0.5">Workspace / Staff</p>
                <h1 className="text-base sm:text-lg font-bold text-heading">
                {menuItems.find((m) => location.pathname === m.path)?.label || 'Staff'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sound Notifications Toggle Button (Solid Color) */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs border ${
                  isMuted 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600' 
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700'
                }`}
                title={isMuted ? 'Notification Sounds Muted - Click to Unmute' : 'Notification Sounds Active - Click to Mute'}
              >
                {isMuted ? <VolumeX size={15} className="text-white" /> : <Volume2 size={15} className="text-white" />}
                <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound ON'}</span>
              </button>

              {/* Test Notification Sound Button */}
              <button
                onClick={() => testSounds()}
                className="px-3 py-1.5 rounded-xl bg-card hover:bg-border/40 text-heading border border-border/80 transition-all active:scale-95 cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-bold shadow-xs"
                title="Test Notification Sound Chime"
              >
                <BellRing size={15} className="text-primary" />
                <span>Test Sound</span>
              </button>

              {/* Live WebSockets Status Indicator */}
              <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/80 shadow-xs text-xs font-bold text-heading">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Live Synced</span>
              </div>

              <NotificationDropdown />
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-5 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
      <NotificationPrompt />
    </div>
  );
};

export default StaffLayout;
