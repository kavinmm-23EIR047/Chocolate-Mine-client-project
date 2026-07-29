import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Gift, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import Logo from '../Logo';
import { getOptimizedCloudinaryUrl } from '../../utils/cloudinary';

const HomeBanner = () => {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allImagesReady, setAllImagesReady] = useState(false);
  const loadedCountRef = useRef(0);
  const totalCountRef = useRef(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const res = await api.get('/banners/active');
        const activeBanners = res.data.data || [];
        setBanners(activeBanners);
        totalCountRef.current = activeBanners.filter(b => b.image).length;

        if (totalCountRef.current === 0) {
          setAllImagesReady(true);
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Track when each slide image finishes loading
  const handleImageLoaded = useCallback(() => {
    loadedCountRef.current += 1;
    if (loadedCountRef.current >= totalCountRef.current) {
      setAllImagesReady(true);
    }
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [banners.length, current]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  const handleBannerClick = (e) => {
    const activeSlide = banners[current];
    if (!activeSlide?.link) return;
    if (e.target.closest('.interactive-action-node')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    if (banners.length > 1 && clickX < rect.width * 0.35) {
      prevSlide();
    } else {
      window.location.href = activeSlide.link;
    }
  };

  if (loading) {
    return (
      <div className="w-full rounded-[16px] sm:rounded-[24px] bg-muted/10 animate-pulse border border-border/20"
        style={{ aspectRatio: '16/5' }} />
    );
  }

  if (banners.length === 0) {
    return (
      <div className="w-full rounded-[16px] sm:rounded-[24px] overflow-hidden relative border border-border/20"
        style={{ aspectRatio: '16/5' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-chocolate to-espresso flex items-center justify-center">
          <Logo className="w-32 h-32" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="banner-root relative w-full overflow-hidden rounded-[16px] sm:rounded-[24px] select-none border-0 sm:border border-border/20 bg-transparent"
      style={{ aspectRatio: 'var(--banner-ratio, 16/9)' }}
    >
      <style>{`
        @media (max-width: 640px) {
          .banner-root { aspect-ratio: 16/4.6 !important; } 
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .banner-root { aspect-ratio: 16/4.5 !important; }
        }
        @media (min-width: 1025px) {
          .banner-root { aspect-ratio: 16/4.2 !important; }
        }
        .premium-glass {
          background: rgba(15, 15, 15, 0.65);
          backdrop-filter: blur(12px) saturate(140%);
          -webkit-backdrop-filter: blur(12px) saturate(140%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }
      `}</style>

      {/* Transparent base layer behind transitions */}
      <div className="absolute inset-0 bg-transparent transition-colors duration-300 -z-10" />

      {/* === ALL SLIDES RENDERED SIMULTANEOUSLY — only opacity toggles === */}
      {banners.map((slide, idx) => {
        const isActive = idx === current;
        const optimizedSrc = getOptimizedCloudinaryUrl(slide.image, 1600);
        // Build responsive srcset: 800w, 1600w, 3200w
        const srcSet = slide.image
          ? [800, 1600, 3200].map(w => `${getOptimizedCloudinaryUrl(slide.image, w)} ${w}w`).join(', ')
          : undefined;

        return (
          <div
            key={slide._id || idx}
            className="absolute inset-0 w-full h-full"
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 10 : 1,
              transition: 'opacity 0.4s ease-in-out',
              pointerEvents: isActive ? 'auto' : 'none',
              cursor: slide.link ? 'pointer' : 'default',
            }}
            onClick={isActive ? handleBannerClick : undefined}
          >
            {/* Banner Image — always mounted, always loaded */}
            {slide.image && (
              <img
                src={optimizedSrc}
                srcSet={srcSet}
                sizes="(max-width: 640px) 600px, (max-width: 1024px) 1000px, 1600px"
                alt={slide.title || 'Banner Image'}
                loading="eager"
                fetchPriority={idx === 0 ? 'high' : 'auto'}
                decoding="async"
                draggable={false}
                onLoad={handleImageLoaded}
                onError={handleImageLoaded}
                className="absolute inset-0 w-full h-full object-cover select-none"
                style={{ objectPosition: 'center center' }}
              />
            )}

            {/* Vignette Gradient Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: [
                  'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)',
                  'linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 70%)',
                ].join(', '),
              }}
            />

            {/* TOP-LEFT: Dynamic Title Badge (Shown on desktop when title exists) */}
            {slide.title && (
              <div
                className="absolute top-0 left-0 right-0 z-10 flex-col items-start justify-start pointer-events-none hidden sm:flex"
                style={{ padding: 'clamp(10px, 3vw, 20px)' }}
              >
                <div className="max-w-[85%] flex flex-col gap-1">
                  {(slide.cornerText || slide.subtitle) && (
                    <span className="font-semibold uppercase tracking-widest text-[8px] sm:text-[9px] text-white/40 pl-0.5 select-none">
                      {slide.cornerText || slide.subtitle}
                    </span>
                  )}
                  <div className="premium-glass flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit pointer-events-auto opacity-80">
                    <Gift size={12} className="text-white shrink-0" />
                    <h2
                      style={{
                        fontSize: 'clamp(10px, 2vw, 13px)',
                        fontWeight: 600,
                        lineHeight: 1.2,
                        letterSpacing: '0.01em',
                        color: '#ffffff',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        margin: 0,
                      }}
                    >
                      {slide.title}
                    </h2>
                  </div>
                </div>
              </div>
            )}

            {/* BOTTOM-RIGHT: Action Button */}
            {slide.buttonText && (
              <div className="interactive-action-node absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 z-20 transition-transform duration-300 hover:scale-[1.02] pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (slide.link) window.location.href = slide.link;
                  }}
                  className="premium-glass flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full font-bold uppercase tracking-wider text-white/80 transition-all duration-200 active:scale-95 hover:bg-white/10 hover:text-white"
                  style={{
                    fontSize: 'clamp(8px, 1.2vw, 10px)',
                    minWidth: 0,
                    minHeight: 0,
                  }}
                >
                  <span>{slide.buttonText}</span>
                  <ArrowRight size={10} className="shrink-0" />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Loading shimmer — only shown until all images finish loading */}
      {!allImagesReady && (
        <div className="absolute inset-0 z-30 overflow-hidden pointer-events-none select-none bg-[var(--card-soft)]">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/15 to-transparent -skew-x-20"
            style={{ animation: 'bannerShimmer 0.85s infinite linear' }}
          />
          <style>{`
            @keyframes bannerShimmer {
              0% { transform: translateX(-150%) skewX(-20deg); }
              100% { transform: translateX(200%) skewX(-20deg); }
            }
          `}</style>
        </div>
      )}

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 items-center interactive-action-node">
          {banners.map((_, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrent(i);
                }
              }}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: current === i ? '16px' : '6px',
                height: '6px',
                borderRadius: '999px',
                background: current === i ? '#fff' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeBanner;

