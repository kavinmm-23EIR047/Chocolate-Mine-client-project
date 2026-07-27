import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';

const OfflineStateBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-warning-light text-warning-text border-b border-warning/40 px-4 py-2 text-xs md:text-sm font-semibold flex items-center justify-center gap-2 relative z-50 shadow-sm"
      >
        <WifiOff size={16} className="text-warning flex-shrink-0 animate-pulse" />
        <span>You are currently offline. Please check your internet connection.</span>
        <button
          onClick={() => window.location.reload()}
          className="ml-2 inline-flex items-center gap-1 underline font-bold hover:opacity-80 transition-opacity"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineStateBanner;
