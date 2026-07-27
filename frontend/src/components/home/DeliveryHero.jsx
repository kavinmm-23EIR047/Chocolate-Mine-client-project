import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  Star,
  ShieldCheck,
  Phone,
  PackageCheck,
  Truck,
  ChevronRight,
  Zap,
  Tag,
  BadgeCheck,
  Leaf,
  Sparkles
} from 'lucide-react';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';

import ScooterLightImg from '../../assets/scooter-light.png';
import ScooterDarkImg from '../../assets/scooter-dark.png';

const DELIVERY_FEATURES = [
  { icon: <Clock size={20} />, label: 'Same-Day', sub: 'Delivery' },
  { icon: <Star size={20} />, label: 'Fresh Baked', sub: 'Everyday' },
  { icon: <ShieldCheck size={20} />, label: 'Secure', sub: 'Packaging' },
  { icon: <Phone size={20} />, label: '24/7 Support', sub: "We're here" },
];

const STATS = [
  { icon: <PackageCheck size={20} />, stat: '12K+', label: 'Orders Delivered' },
  { icon: <Star size={20} />, stat: '4.9★', label: 'Customer Rating' },
  { icon: <Clock size={20} />, stat: '30 mins', label: 'Avg. Delivery Time' },
  { icon: <ShieldCheck size={20} />, stat: '100%', label: 'Fresh & Safe' },
  { icon: <Phone size={20} />, stat: '24/7', label: 'Customer Support' },
];

const DeliveryHero = () => {
  const [themes, setThemes] = useState([]);
  const [activeThemeIndex, setActiveThemeIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef(null);
  const { isDark } = useTheme();

  // Determine which scooter to use based on theme
  const scooterImg = isDark ? ScooterDarkImg : ScooterLightImg;

  // Fetch real themes from backend
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await api.get('/custom-cakes/themes');
        const result = response.data;
        if (result.status === 'success') {
          setThemes(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch themes", err);
      }
    };
    fetchThemes();
  }, []);

  // Auto-slider logic (updated to scroll by full container width)
  useEffect(() => {
    if (isHovered || themes.length === 0) return;

    const timer = setInterval(() => {
      if (!sliderRef.current) return;

      const nextIndex = (activeThemeIndex + 1) % themes.length;
      const containerWidth = sliderRef.current.clientWidth;

      sliderRef.current.scrollTo({
        left: nextIndex * containerWidth,
        behavior: 'smooth'
      });

      setActiveThemeIndex(nextIndex);
    }, 3000);

    return () => clearInterval(timer);
  }, [activeThemeIndex, isHovered, themes.length]);

  // Sync pagination dots with manual scroll/swipe
  const handleScroll = (e) => {
    if (!sliderRef.current || themes.length === 0) return;
    const containerWidth = sliderRef.current.clientWidth;
    const newIndex = Math.round(e.target.scrollLeft / containerWidth);
    if (newIndex !== activeThemeIndex && newIndex < themes.length) {
      setActiveThemeIndex(newIndex);
    }
  };

  // Pagination dot click handler
  const scrollToSlide = (index) => {
    if (!sliderRef.current) return;
    const containerWidth = sliderRef.current.clientWidth;
    sliderRef.current.scrollTo({
      left: index * containerWidth,
      behavior: 'smooth'
    });
    setActiveThemeIndex(index);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6">
      {/* MAIN CARD */}
      <section
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-border/20 flex-1 min-w-0 flex flex-col"
        style={{
          background: 'var(--card)',
          boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[100px] opacity-[0.04]" style={{ background: 'var(--primary)' }} />
          <div className="absolute right-1/4 bottom-0 w-64 h-64 rounded-full blur-[80px] opacity-[0.03]" style={{ background: 'var(--accent)' }} />
        </div>

        <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-12 items-stretch gap-4 lg:gap-6 min-h-[380px] sm:min-h-[440px] lg:min-h-[460px]">
          {/* LEFT TEXT CONTENT */}
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-8 xl:p-10 order-2 lg:order-1 relative z-20 text-center lg:text-left lg:col-span-6 xl:col-span-6">
            {/* Priority Service Badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center lg:justify-start gap-2 mb-3"
            >
              <Truck size={15} style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
                Priority Service
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.07 }}
              className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-black leading-snug tracking-tight mb-3"
              style={{ color: 'var(--heading)' }}
            >
              The Best of <span style={{ color: 'var(--primary)' }}>Coimbatore</span> At Your Doorstep in <span style={{ color: 'var(--primary)' }}>3 Hours</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.13 }}
              className="text-xs sm:text-sm font-medium leading-relaxed mb-6 max-w-md mx-auto lg:mx-0"
              style={{ color: 'var(--muted)' }}
            >
              Premium cakes, handcrafted with love and delivered fresh across the city.
            </motion.p>

            {/* Feature Cards Grid (Horizontal card layout: Icon on Left, Text on Right) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16 }}
              className="grid grid-cols-2 gap-3 mb-6 w-full max-w-xl mx-auto lg:mx-0"
            >
              {DELIVERY_FEATURES.map(({ icon, label, sub }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-default group"
                  style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span className="shrink-0 group-hover:scale-110 transition-transform duration-300" style={{ color: 'var(--primary)' }}>
                    {icon}
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider leading-tight" style={{ color: 'var(--heading)' }}>
                      {label}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-medium leading-tight mt-0.5" style={{ color: 'var(--muted)' }}>
                      {sub}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Action Buttons (Strictly Horizontal Side-by-Side) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 w-full lg:w-auto"
            >
              <Link
                to="/shop"
                className="inline-flex flex-1 lg:flex-none items-center justify-center gap-1.5 px-3 sm:px-7 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-[0.12em] sm:tracking-[0.18em] whitespace-nowrap min-w-0 transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--button-text)',
                  boxShadow: '0 8px 20px rgba(var(--primary-rgb),0.25)',
                }}
              >
                Order Now <ChevronRight size={14} />
              </Link>
              <Link
                to="/shop"
                className="flex-1 lg:flex-none text-[10px] sm:text-xs font-bold uppercase tracking-[0.08em] sm:tracking-[0.15em] underline-offset-4 hover:underline whitespace-nowrap min-w-0 text-center lg:text-left transition-all"
                style={{ color: 'var(--muted)' }}
              >
                Explore Products →
              </Link>
            </motion.div>
          </div>

          {/* SCOOTER IMAGE CONTAINER (MAXIMIZED HORIZONTALLY AND VERTICALLY) */}
          <div className="hidden lg:flex relative order-1 lg:order-2 items-center justify-center z-10 lg:col-span-6 xl:col-span-6 p-2 sm:p-4 w-full h-full min-h-[340px] sm:min-h-[400px] lg:min-h-[500px]">
            <motion.img
              src={scooterImg}
              alt="Chocolate Mine Delivery"
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-auto max-h-[480px] sm:max-h-[580px] lg:max-h-[680px] xl:max-h-[780px] object-contain object-center mx-auto my-auto drop-shadow-2xl scale-110 sm:scale-120 lg:scale-115"
              draggable={false}
            />
          </div>
        </div>

        {/* Bottom Bar Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="relative border-t border-border/20 mt-auto"
          style={{ background: 'rgba(var(--primary-rgb), 0.02)' }}
        >
          <div
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4 px-6 py-4"
            style={{ background: 'var(--background)' }}
          >
            <div className="flex flex-col gap-0.5 shrink-0 text-center lg:text-left">
              <span className="text-[8px] font-black uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>
                Pay securely with
              </span>
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-[#3B1E08] dark:text-amber-400" />
                <span className="text-sm font-black tracking-tight" style={{ color: 'var(--heading)' }}>Razorpay</span>
              </div>
            </div>
            <div className="hidden lg:block w-px h-6 shrink-0" style={{ background: 'var(--border)' }} />
            <div className="flex flex-wrap justify-center gap-5">
              {[
                { icon: <ShieldCheck size={12} />, label: '100% Secure', sub: 'Payments' },
                { icon: <Tag size={12} />, label: 'Multiple', sub: 'Options' },
                { icon: <Zap size={12} />, label: 'Instant', sub: 'Confirm' },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-[#3B1E08] dark:text-amber-400">{icon}</span>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight leading-none mb-0.5" style={{ color: 'var(--heading)' }}>{label}</p>
                    <p className="text-[8px] sm:text-[9px] leading-tight" style={{ color: 'var(--muted)' }}>{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border/20" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-border/20 bg-primary/5">
            {STATS.map(({ icon, stat, label }) => (
              <div
                key={label}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 px-4 py-4 group hover:bg-primary/10 transition-colors duration-300 cursor-default text-center sm:text-left"
              >
                <span className="shrink-0 opacity-40 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110" style={{ color: 'var(--primary)' }}>
                  {icon}
                </span>
                <div>
                  <p className="text-sm sm:text-base font-black leading-none" style={{ color: 'var(--heading)' }}>{stat}</p>
                  <p className="text-[9px] sm:text-[10px] font-semibold mt-1 leading-tight" style={{ color: 'var(--muted)' }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CUSTOM CAKES PANEL */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-border/20 flex flex-col lg:w-[320px] xl:w-[360px] shrink-0"
        style={{
          background: 'var(--card)',
          boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)',
        }}
      >
        <div className="px-6 pt-8 pb-4 text-center lg:text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1.5 text-[#3B1E08] dark:text-amber-400">
            Custom Cakes
          </p>
          <h3 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight mb-2" style={{ color: 'var(--heading)' }}>
            Made Just for You
          </h3>
          <p className="text-[11px] sm:text-xs font-medium leading-relaxed" style={{ color: 'var(--muted)' }}>
            Celebrate every moment with a cake as unique as your story. Swipe to explore themes.
          </p>
        </div>

        {/* --- MODIFIED: 100% Width Carousel (Hides Next Slide Completely) --- */}
        <div
          className="w-full pb-2 flex flex-col"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Slider Track */}
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory w-full [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {themes.length > 0 ? (
              themes.map((theme) => (
                <div
                  key={theme._id}
                  className="w-full shrink-0 snap-center px-6" // Padding is inside the 100% width slide now
                >
                  <div className="relative rounded-2xl overflow-hidden group border border-border/10 flex flex-col items-center justify-between bg-primary/5 pb-3 h-full">
                    <div className="px-3 pt-4 w-full flex justify-center items-center h-[160px] sm:h-[180px] overflow-hidden">
                      {theme.image || theme.colors?.[0]?.images?.tier1 || theme.colors?.[0]?.images?.tier2 || theme.colors?.[0]?.images?.tier3 ? (
                        <img
                          src={theme.image || theme.colors?.[0]?.images?.tier1 || theme.colors?.[0]?.images?.tier2 || theme.colors?.[0]?.images?.tier3}
                          alt={theme.name}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="flex items-center justify-center h-full text-5xl">{theme.emoji || '🎂'}</span>
                      )}
                    </div>

                    <div className="px-4 w-full flex flex-col items-center gap-1.5">
                      <p className="text-[12px] sm:text-sm font-black uppercase tracking-wider text-center" style={{ color: 'var(--heading)' }}>
                        {theme.name}
                      </p>

                      <Link
                        to={`/custom-cake?theme=${theme._id}`}
                        className="w-full text-center py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                        style={{
                          background: 'var(--primary)',
                          color: 'var(--button-text)',
                        }}
                      >
                        Order Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full flex justify-center p-6">
                <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {themes.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToSlide(index)}
                className={`transition-all duration-300 rounded-full !min-w-0 !min-h-0 p-0 ${index === activeThemeIndex
                  ? 'w-4 h-1.5 opacity-100'
                  : 'w-1.5 h-1.5 opacity-30 hover:opacity-60'
                  }`}
                style={{ background: 'var(--primary)' }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        {/* ------------------------------------------------ */}

        <div className="flex flex-col gap-4 px-6 py-4 flex-1">
          {[
            { icon: <Sparkles size={14} />, label: 'Custom Flavors', sub: 'Choose your favorite flavors' },
            { icon: <BadgeCheck size={14} />, label: 'Personalized Design', sub: 'Tailored to your special moments' },
            { icon: <PackageCheck size={14} />, label: 'Premium Ingredients', sub: 'Made with the finest ingredients' },
            { icon: <Leaf size={14} />, label: 'Pure Veg & Eggless', sub: '100% vegetarian, eggless options', highlight: true },
          ].map(({ icon, label, sub, highlight }) => (
            <div key={label} className="flex items-start gap-3 group cursor-default">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 ${highlight
                  ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-white/80 dark:bg-white/10 text-[#27190e] dark:text-amber-400 border border-[var(--border)]/40 shadow-sm'
                  }`}
              >
                {icon}
              </div>
              <div className="flex-1">
                <p className={`text-[10px] sm:text-[11px] font-black uppercase tracking-tight leading-tight ${highlight ? 'text-emerald-700 dark:text-emerald-300' : 'text-heading'}`}>
                  {label}
                </p>
                <p className="text-[9px] sm:text-[10px] font-medium leading-snug mt-0.5 text-muted">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM BUTTON */}
        <div className="px-6 pb-8 pt-4 mt-auto">
          <Link
            to="/custom-cake"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'var(--foreground)',
              color: 'var(--background)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
            }}
          >
            See All Custom Cakes <ChevronRight size={14} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default DeliveryHero;
