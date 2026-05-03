import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const HomeBanner = () => {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const res = await api.get('/banners/active');
        setBanners(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon "${code}" copied!`);
  };

  if (loading) {
    return (
      <div className="w-full aspect-[21/9] sm:aspect-[3/1] rounded-3xl bg-muted/10 animate-pulse border border-border/20" />
    );
  }

  // Fallback if no banners
  if (banners.length === 0) {
    return (
      <div className="w-full aspect-[21/9] sm:aspect-[3/1] rounded-3xl overflow-hidden relative shadow-lift border border-border/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-chocolate to-espresso flex items-center justify-center px-8">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-32 sm:w-48 object-contain"
          />
        </div>
      </div>
    );
  }

  const slide = banners[current];

  return (
    <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] rounded-3xl overflow-hidden group shadow-lift border border-border/20">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide._id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 cursor-pointer"
          onClick={() => slide.link && (window.location.href = slide.link)}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-footer/90 via-footer/40 to-transparent sm:from-footer/95 sm:via-footer/60" />

          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-14 max-w-[650px]">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-5xl font-black leading-tight mb-3 tracking-tighter text-[#FDE8E4] drop-shadow-lg uppercase"
            >
              {slide.title}
            </motion.h1>

            {slide.link && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4"
              >
                <button className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-2xl text-[11px] sm:text-sm font-black active:scale-95 transition-all duration-300 shadow-xl bg-primary text-button-text hover:bg-primary-hover uppercase tracking-widest">
                  Explore Now
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="p-2 sm:p-3 rounded-full bg-footer/40 hover:bg-footer/60 text-footer-text backdrop-blur-md transition-all pointer-events-auto opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="p-2 sm:p-3 rounded-full bg-footer/40 hover:bg-footer/60 text-footer-text backdrop-blur-md transition-all pointer-events-auto opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(i);
                }}
                className={`h-2.5 rounded-full transition-all duration-500 ${current === i ? 'w-8 bg-footer-text shadow-soft' : 'w-2.5 bg-footer-text/30'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HomeBanner;