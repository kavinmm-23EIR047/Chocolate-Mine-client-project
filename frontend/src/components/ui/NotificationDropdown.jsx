import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Package, Clock, ShoppingBag, X, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../sockets/socketManager';
import toast from 'react-hot-toast';

const NotificationDropdown = ({ iconClass, buttonClass, showLabel, iconSize = 24 }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const data = res.data.data || [];
      setNotifications(data.slice(0, 5)); // show top 5 in dropdown

      const countRes = await api.get('/notifications/unread-count');
      setUnreadCount(countRes.data.count || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user, isOpen]);

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    if (socket) {
      const handleNewNotification = (data) => {
        setUnreadCount(prev => prev + 1);
        setNotifications(prev => {
          const exists = prev.some(n => n._id === data._id);
          if (exists) return prev;
          return [
            {
              _id: data._id || Date.now().toString(),
              title: data.title,
              message: data.message,
              type: data.type,
              data: data.data || {},
              isRead: false,
              createdAt: data.createdAt || new Date().toISOString()
            },
            ...prev
          ].slice(0, 5);
        });
      };

      socket.on('new_notification', handleNewNotification);

      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch (err) {
      console.error('Failed to clear notifications', err);
      toast.error('Failed to clear notifications');
    }
  };

  const handleNotificationClick = async (notif) => {
    setIsOpen(false);

    if (!notif.isRead) {
      try {
        await api.patch(`/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark read:', err);
      }
    }

    const url = notif.data?.url;
    if (url) {
      navigate(url);
    }
  };

  const getIcon = (type) => {
    const t = String(type).toLowerCase();
    if (t.includes('delivered') || t.includes('success')) return <CheckCircle size={15} className="text-emerald-700 dark:text-green-500" />;
    if (t.includes('preparing') || t.includes('packed')) return <Package size={15} className="text-amber-700 dark:text-yellow-500" />;
    if (t.includes('delivery')) return <ShoppingBag size={15} className="text-blue-700 dark:text-blue-500" />;
    return <Clock size={15} className="text-[#5C4028] dark:text-primary" />;
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button Trigger */}
      <button
        onClick={toggleDropdown}
        className={buttonClass || "relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2"}
        aria-label="Notifications"
      >
        <div className="relative inline-flex items-center justify-center shrink-0">
          <Bell size={iconSize} strokeWidth={1.75} className={iconClass || "text-heading"} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none z-10 shadow-sm notification-dot">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        {showLabel && (
          <span className="text-[10px] sm:text-[11px] font-extrabold text-muted group-hover:text-primary uppercase tracking-wider whitespace-nowrap leading-none transition-colors">
            Alerts
          </span>
        )}
      </button>

      {/* Main Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[80px] left-3 right-3 mx-auto w-auto max-w-[420px] sm:absolute sm:top-full sm:mt-2 sm:left-auto sm:right-0 sm:mx-0 sm:w-[420px] bg-[#E6D2B8] dark:bg-card border border-[#C8B097] dark:border-white/15 rounded-2xl shadow-2xl z-[999] overflow-hidden origin-top"
          >
            {/* Header */}
            <div className="px-3.5 py-3 border-b border-[#C8B097] dark:border-white/10 flex items-center justify-between bg-black/5 dark:bg-white/5">
              <h3 className="font-black text-[#3B2818] dark:text-heading text-xs uppercase tracking-wider">
                Notifications
              </h3>

              {/* Compact Header Actions */}
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="px-1.5 py-1 text-[9px] text-[#5C4028] dark:text-primary font-black uppercase tracking-wider rounded hover:bg-black/5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Mark read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="px-2 py-1 text-[9px] bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-wider rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-xs whitespace-nowrap"
                  >
                    <Trash2 size={10} className="text-white" /> Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 ml-0.5 flex items-center justify-center bg-[#D8C2A8] dark:bg-background rounded-full border border-[#BFA48A] dark:border-white/10 text-[#5C4028] dark:text-muted hover:text-[#3B2818] dark:hover:text-heading hover:bg-[#C8B097] transition-all cursor-pointer shrink-0"
                  aria-label="Close"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* List Items */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar p-2.5">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[#7A5B40] dark:text-muted">
                  <Bell size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-bold">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 rounded-xl flex gap-3 transition-colors cursor-pointer border ${notif.isRead
                          ? 'bg-[#D8C2A8]/60 dark:bg-white/[0.02] border-[#A88B6E]/50 dark:border-white/10'
                          : 'bg-[#D8C2A8] dark:bg-primary/10 border-[#A88B6E] dark:border-primary/30'
                        }`}
                    >
                      <div className="mt-0.5 shrink-0 bg-[#E6D2B8] dark:bg-card rounded-full p-1.5 shadow-xs h-7 w-7 flex items-center justify-center border border-[#A88B6E]/40 dark:border-white/10">
                        {getIcon(notif.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs ${notif.isRead ? 'text-[#3B2818] dark:text-heading font-bold' : 'text-[#24170E] dark:text-primary font-black'}`}>
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-[#5C4028] dark:text-muted font-medium mt-0.5 leading-relaxed whitespace-pre-line line-clamp-3">
                          {notif.message}
                        </p>
                        <p className="text-[9px] text-[#7A5B40] dark:text-muted/70 font-bold mt-1.5 uppercase tracking-wider">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 border-t border-[#C8B097] dark:border-white/10 text-center bg-black/5 dark:bg-white/5">
              <Link
                to="/account/notifications"
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-black uppercase tracking-widest text-[#3B2818] dark:text-primary hover:underline inline-block w-full"
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;