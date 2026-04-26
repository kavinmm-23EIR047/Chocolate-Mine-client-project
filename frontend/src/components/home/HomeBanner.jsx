import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HomeBanner = ({ banners = [] }) => {
  const [current, setCurrent] = useState(0);

  // Only use backend banners. If none exist, show a simple welcome.
  const hasBanners = banners.length > 0;

  useEffect(() => {
    if (!hasBanners) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length, hasBanners]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  // No banners from backend → simple gradient welcome
  if (!hasBanners) {
    return (
      <div className="w-full aspect-[21/9] sm:aspect-[3/1] rounded-xl overflow-hidden bg-gradient-to-br from-primary via-chocolate to-espresso flex items-center justify-center text-white px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-4xl font-bold mb-2">The Chocolate Mine</h2>
          <p className="text-sm sm:text-base opacity-80">Premium handcrafted cakes & chocolates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] rounded-xl overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <img
            src={banners[current].image}
            alt={banners[current].title || 'Banner'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

          {(banners[current].title || banners[current].subtitle) && (
            <div className="absolute inset-0 flex items-center px-8 sm:px-16">
              <div className="max-w-lg text-white">
                {banners[current].title && (
                  <h2 className="text-2xl sm:text-4xl font-bold mb-2 drop-shadow-lg">
                    {banners[current].title}
                  </h2>
                )}
                {banners[current].subtitle && (
                  <p className="text-sm sm:text-lg opacity-90 drop-shadow-md">
                    {banners[current].subtitle}
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Nav Buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur text-white rounded-full hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur text-white rounded-full hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-all"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HomeBanner;
