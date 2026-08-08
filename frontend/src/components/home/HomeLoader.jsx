import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cake, Cookie, Gift, Sparkles, ShoppingBag, Heart, Flame, Star, Package } from 'lucide-react';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';

const DEFAULT_ITEMS = [
  { id: 'cakes', name: 'Birthday Cakes', icon: Cake },
  { id: 'chocolates', name: 'Artisan Chocolates', icon: Sparkles },
  { id: 'cookies', name: 'Fresh Cookies', icon: Cookie },
  { id: 'bouquets', name: 'Chocolate Bouquets', icon: Heart },
  { id: 'gifts', name: 'Custom Gift Hampers', icon: Gift },
];

const getCategoryIcon = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('cake')) return Cake;
  if (lower.includes('choc')) return Sparkles;
  if (lower.includes('cookie') || lower.includes('brownie')) return Cookie;
  if (lower.includes('bouquet') || lower.includes('flower')) return Heart;
  if (lower.includes('gift') || lower.includes('combo')) return Gift;
  if (lower.includes('bestseller') || lower.includes('trending')) return Flame;
  if (lower.includes('special') || lower.includes('custom')) return Star;
  return Package;
};

const formatCategoryName = (name, label) => {
  if (label && label.trim() && label.toLowerCase() !== 'all') return label;
  if (!name || name.toLowerCase() === 'all') return 'Fresh Confectionery';
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export default function HomeLoader({ show = false, onFinish, durationMs = 3600 }) {
  const { isDark } = useTheme();
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Fetch real categories / top product names from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchBackendData = async () => {
      try {
        const response = await api.get('/categories', { params: { activeOnly: true } });
        const data = response.data?.data || response.data || [];

        if (Array.isArray(data) && data.length > 0 && isMounted) {
          const mapped = data
            .filter(cat => (cat.active !== false && cat.isActive !== false) && cat.name.toLowerCase() !== 'all')
            .map(cat => ({
              id: cat._id || cat.name,
              name: formatCategoryName(cat.name, cat.label),
              icon: getCategoryIcon(cat.name),
            }));

          if (mapped.length > 0) {
            setItems(mapped);
          }
        }
      } catch (err) {
        console.error('Loader: Failed to fetch backend categories:', err);
      }
    };

    fetchBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Lock body scroll when loader is active
  useEffect(() => {
    document.body.style.overflow = show ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  // Cycle item names and auto finish
  useEffect(() => {
    if (!show) return;

    setIndex(0);

    const stepDuration = 650; // Swap item name every 650ms
    const cycleInterval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, stepDuration);

    const finishTimer = setTimeout(() => {
      onFinishRef.current?.();
    }, durationMs);

    return () => {
      clearInterval(cycleInterval);
      clearTimeout(finishTimer);
    };
  }, [show, durationMs, items.length]);

  const currentItem = items[index] || items[0] || DEFAULT_ITEMS[0];
  const IconComponent = currentItem.icon || Package;

  // High contrast theme colors
  const iconColor = isDark ? 'var(--accent)' : 'var(--primary)';
  const iconBoxBg = isDark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(39, 25, 14, 0.12)';
  const dotBg = isDark ? 'var(--accent)' : 'var(--primary)';

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="fullscreen-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 w-screen h-screen z-[1000000] flex flex-col items-center justify-between py-16 px-6 overflow-hidden select-none bg-[var(--background)]"
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            className="absolute rounded-full blur-[120px] pointer-events-none w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"
            style={{
              background: isDark
                ? 'radial-gradient(circle, var(--accent) 0%, transparent 70%)'
                : 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
            }}
          />

          {/* TOP BRAND TITLE */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center z-10 pt-4"
          >
            <h1 className="text-lg sm:text-2xl font-black uppercase tracking-[0.4em] text-[var(--heading)]">
              The Chocolate Mine
            </h1>
          </motion.div>

          {/* CENTER VECTOR ICON & BACKEND CATEGORY/PRODUCT NAME */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-6 my-auto">
            {/* Swapping Icon Badge */}
            <div
              className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center rounded-3xl overflow-hidden shadow-md border border-[var(--border)]"
              style={{ background: iconBoxBg }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentItem.id}
                  initial={{ opacity: 0, scale: 0.5, y: 14, rotate: -12 }}
                  animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: -14, rotate: 12 }}
                  transition={{ duration: 0.28, ease: 'backOut' }}
                  className="flex items-center justify-center"
                >
                  <IconComponent
                    className="w-14 h-14 sm:w-16 sm:h-16"
                    style={{ color: iconColor }}
                    strokeWidth={2.4}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Swapping Backend Category / Product Name */}
            <div className="h-7 flex items-center justify-center px-4">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentItem.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                  className="text-sm sm:text-base font-black tracking-[0.25em] uppercase text-center text-[var(--heading)] line-clamp-1"
                >
                  {currentItem.name}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* BOTTOM BOUNCING DOTS */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2.5 z-10 pb-6"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{ background: dotBg }}
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.25, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.75,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.18,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}