import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDeliveryLocation } from '../../context/LocationContext';
import api from '../../utils/api';
import { Gift, Heart, Sparkles, Star, ArrowRight, PartyPopper, ChevronLeft, ChevronRight } from 'lucide-react';
import ImageWithSkeleton from '../ui/ImageWithSkeleton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

// Array of dynamic icons to give each card a unique feel
const CARD_ICONS = [Gift, Heart, PartyPopper, Star, Sparkles];

const OccasionSection = () => {
  const [occasions, setOccasions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { location: deliveryCity } = useDeliveryLocation();
  const navigate = useNavigate();
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const occasionRes = await api.get('/occasions?activeOnly=true');
        setOccasions(occasionRes.data.data || []);
      } catch (error) {
        console.error('Error fetching occasion data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [deliveryCity]);

  const handleOccasionClick = (occasionName) => {
    const slug = occasionName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/shop?occasion=${slug}`);
  };

  return (
    <section className="relative py-8 sm:py-16 overflow-hidden bg-transparent border-b border-border/20">
      {/* Subtle Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header with Title & Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[9px] sm:text-xs font-black uppercase tracking-[0.2em] mb-3"
            >
              <Sparkles size={14} className="w-3 h-3 sm:w-4 sm:h-4" /> Celebrations
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-heading tracking-tighter uppercase"
            >
              Shop By Occasion
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-[11px] sm:text-sm text-muted font-medium mt-1"
            >
              Make every milestone unforgettable with handcrafted treats tailored for your special moments.
            </motion.p>
          </div>

          {!loading && occasions.length > 0 && (
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border/80 bg-card hover:bg-primary/10 hover:border-primary/40 text-heading flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer"
                aria-label="Previous occasion"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border/80 bg-card hover:bg-primary/10 hover:border-primary/40 text-heading flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer"
                aria-label="Next occasion"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Swiper Auto-sliding Carousel */}
        {loading ? (
          <div className="flex gap-4 overflow-x-hidden py-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shrink-0 w-[220px] sm:w-[260px] md:w-[280px] lg:w-[300px] rounded-2xl sm:rounded-3xl overflow-hidden animate-pulse aspect-[3/4]">
                <div className="w-full h-full bg-muted/20" />
              </div>
            ))}
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, FreeMode]}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            autoplay={{
              delay: 2800,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            freeMode={true}
            loop={occasions.length > 3}
            slidesPerView="auto"
            spaceBetween={16}
            className="w-full !py-2"
          >
            {occasions.map((occ, idx) => {
              const DynamicIcon = CARD_ICONS[idx % CARD_ICONS.length];

              return (
                <SwiperSlide
                  key={occ._id || idx}
                  className="!w-[220px] sm:!w-[260px] md:!w-[280px] lg:!w-[300px] !flex-shrink-0"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleOccasionClick(occ.label || occ.name)}
                    className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[3/4] cursor-pointer"
                    style={{
                      boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)'
                    }}
                  >
                    {/* Background Image */}
                    <ImageWithSkeleton
                      src={occ.image}
                      alt={occ.label || occ.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      containerClassName="absolute inset-0 w-full h-full"
                      imageWidth={400}
                    />

                    {/* Rich Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />

                    {/* Top Right Floating Icon Badge */}
                    <div className="absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all duration-500 group-hover:bg-primary group-hover:text-button-text group-hover:border-primary group-hover:scale-110 group-hover:-rotate-12 group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]">
                      <DynamicIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                    </div>

                    {/* Bottom Text Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex flex-col justify-end h-full">
                      <div className="transform sm:translate-y-3 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <h3 className="text-base sm:text-2xl font-black text-white uppercase tracking-wider mb-1 sm:mb-2 leading-tight drop-shadow-md">
                          {occ.label || occ.name}
                        </h3>

                        {/* Explore Action */}
                        <div className="hidden sm:flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-500">
                          Explore Collection
                          <ArrowRight size={14} className="transform -translate-x-4 group-hover:translate-x-0 transition-transform duration-500" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}

        {/* View All Button */}
        {occasions.length > 0 && (
          <div className="text-center mt-8 sm:mt-12">
            <button
              onClick={() => navigate('/shop')}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full border-2 border-border/50 text-heading font-black text-[10px] sm:text-xs uppercase tracking-[0.15em] hover:border-primary hover:bg-primary hover:text-button-text transition-all duration-300 active:scale-95 group cursor-pointer"
            >
              View All Occasions
              <ArrowRight size={14} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default OccasionSection;
