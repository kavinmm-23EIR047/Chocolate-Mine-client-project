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
import Logo from '../Logo';
import NotificationDropdown from '../ui/NotificationDropdown';
import NotificationBanner from '../ui/NotificationBanner';
import NotificationPrompt from '../ui/NotificationPrompt';
import useNotificationSound from '../../hooks/useNotificationSound';
import { getSocket, joinStaffRoom } from '../../sockets/socketManager';

const menuItems = [
  { path: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/staff/orders/new', label: 'New Orders', icon: ClipboardList },
  { path: '/staff/orders/active', label: 'Active Orders', icon: Flame },
  { path: '/staff/orders/history', label: 'Order History', icon: History },
  { path: '/staff/orders/create-inshop', label: 'New In-Shop Order', icon: ShoppingCart },
  { path: '/staff/orders/in-shop-history', label: 'In-Shop History', icon: Store },
];

const StaffLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const socketRef = useRef(null);

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
    };

    socketRef.current.on('new_order_confirmed', handleNewOrder);
    socketRef.current.on('new_order_alert', handleNewOrder);

    const globalSocket = getSocket();
    if (globalSocket) {
      globalSocket.on('new_order_confirmed', handleNewOrder);
      globalSocket.on('new_order_alert', handleNewOrder);
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (globalSocket) {
        globalSocket.off('new_order_confirmed', handleNewOrder);
        globalSocket.off('new_order_alert', handleNewOrder);
      }
    };
  }, [user, isMuted, playSound]);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden text-heading">
      <NotificationBanner />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border flex-shrink-0">
          <div className="px-5 py-6 border-b border-border">
            <Link to="/staff/dashboard" className="flex items-center gap-3">
              <Logo className="w-8 h-8" />
              <span className="text-lg font-black text-heading tracking-tight">Kitchen Panel</span>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all duration-200 group ${
                    isActive
                      ? 'bg-amber-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-md translate-x-1.5 font-black'
                      : 'text-heading/80 hover:bg-border/30 hover:text-heading border border-transparent'
                  }`}
                >
                  <item.icon
                    size={18}
                    className={isActive ? 'text-white dark:text-slate-950' : 'text-heading/70 group-hover:text-heading transition-transform group-hover:scale-110'}
                  />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight size={16} className="ml-auto text-white dark:text-slate-950" />}
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
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
            >
              <LogOut size={18} />
              <span>Logout</span>
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
                className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 lg:hidden flex flex-col"
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
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all ${
                          isActive
                            ? 'bg-amber-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-md font-black'
                            : 'text-stone-800 dark:text-stone-200 hover:bg-amber-500/10 dark:hover:bg-amber-500/20'
                        }`}
                      >
                        <item.icon size={18} className={isActive ? 'text-white dark:text-slate-950' : 'text-amber-700 dark:text-amber-400'} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-border">
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-all"
                  >
                    <LogOut size={18} /><span>Logout</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 hover:bg-border rounded-xl transition-colors lg:hidden"
              >
                <Menu size={20} className="text-heading" />
              </button>
              <h1 className="text-lg font-bold text-heading">
                {menuItems.find((m) => location.pathname === m.path)?.label || 'Staff'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Sound Notifications Toggle Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  isMuted 
                    ? 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400' 
                    : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400'
                }`}
                title={isMuted ? 'Notification Sounds Muted - Click to Unmute' : 'Notification Sounds Active - Click to Mute'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound ON'}</span>
              </button>

              {/* Test Notification Sound Button */}
              <button
                onClick={() => testSounds()}
                className="p-2 rounded-xl bg-card-soft hover:bg-border/40 text-heading border border-border/60 transition-all active:scale-95 cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-bold"
                title="Test Notification Sound Chime"
              >
                <BellRing size={15} className="text-primary" />
                <span>Test Sound</span>
              </button>

              <NotificationDropdown />
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <NotificationPrompt />
    </div>
  );
};

export default StaffLayout;