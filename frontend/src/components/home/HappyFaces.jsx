import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Smile } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const HAPPY_FACES = [
  {
    id: 'happy-1',
    title: 'A Royal Birthday Celebration 👑',
    tag: 'Birthday Cake',
    image: '/happy-faces/face1.jpg',
    fallbackImage: 'https://res.cloudinary.com/djkfvoxpx/image/upload/v1784865898/categories/uo822q9gaftknwyldjtg.png',
  },
  {
    id: 'happy-2',
    title: 'Wild Jungle Theme Party 🦁',
    tag: 'Jungle Theme',
    image: '/happy-faces/face2.jpg',
    fallbackImage: 'https://res.cloudinary.com/djkfvoxpx/image/upload/v1784866478/categories/k86t1wm1kmkqgkhnirwp.png',
  },
  {
    id: 'happy-3',
    title: 'Sweet Half-Year Milestone 🍓',
    tag: 'Half Birthday',
    image: '/happy-faces/face3.jpg',
    fallbackImage: 'https://res.cloudinary.com/djkfvoxpx/image/upload/v1784865898/categories/uo822q9gaftknwyldjtg.png',
  },
];

const INSTAGRAM_URL = 'https://www.instagram.com/thechocolatemine/';

/* Premium photo frame card — compact & decorative */
function FaceCard({ face, index = 0 }) {
  const tilt = index % 2 === 0 ? 'hover:rotate-[1.5deg]' : 'hover:-rotate-[1.5deg]';

  return (
    <div
      className={`group relative max-w-[260px] mx-auto transition-all duration-500 hover:-translate-y-1.5 ${tilt}`}
    >
      {/* Outer decorative frame */}
      <div
        className="rounded-xl p-[3px]"
        style={{
          background: 'linear-gradient(135deg, rgba(212,175,120,0.5), rgba(180,130,80,0.3), rgba(212,175,120,0.5))',
        }}
      >
        {/* Inner frame body */}
        <div className="bg-card/80 backdrop-blur-sm rounded-[10px] p-1.5 shadow-lg">
          {/* Photo area */}
          <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden">
            <img
              src={face.image}
              alt={face.title}
              className="w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-105"
              style={{ filter: 'contrast(1.06) brightness(1.02) saturate(1.08)' }}
              onError={(e) => { e.currentTarget.src = face.fallbackImage; }}
            />

            {/* Vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.3) 100%),
                  linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 45%)
                `,
              }}
            />

            {/* Tag */}
            <div className="absolute top-2 left-2 z-10">
              <span className="px-2 py-1 bg-black/45 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-wider rounded-full border border-white/15 flex items-center gap-1 shadow">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                {face.tag}
              </span>
            </div>

            {/* Heart */}
            <div className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
            </div>

            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-2.5">
              <h3 className="text-[11px] sm:text-xs font-black tracking-wide leading-snug text-white drop-shadow-lg">
                {face.title}
              </h3>
            </div>
          </div>

          {/* Frame footer — compact */}
          <div className="flex items-center justify-between px-1 pt-1.5 pb-0.5">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center">
                <Heart className="w-2 h-2 fill-white text-white" />
              </div>
              <span className="text-[8px] font-bold text-muted uppercase tracking-wider">@thechocolatemine</span>
            </div>
            <span className="text-[7px] font-bold text-muted/60 tracking-widest">★★★★★</span>
          </div>
        </div>
      </div>

      {/* Corner decorative accents */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary/30 rounded-tl-sm pointer-events-none" />
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary/30 rounded-tr-sm pointer-events-none" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary/30 rounded-bl-sm pointer-events-none" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary/30 rounded-br-sm pointer-events-none" />
    </div>
  );
}

export default function HappyFaces() {
  return (
    <section className="py-10 lg:py-12 bg-transparent border-t border-border/20">
      {/* ── HEADER ── */}
      <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-8 lg:mb-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-black uppercase tracking-widest border border-primary/20 mb-3"
        >
          <Smile className="w-4 h-4 text-accent" />
          <span>Real Smiles & Joy</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-heading leading-tight"
        >
          Happy Faces Of The Chocolate Mine
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-[11px] sm:text-xs font-medium text-muted mt-1.5 max-w-md"
        >
          A glimpse into the wonderful celebrations powered by our handcrafted delicacies!
        </motion.p>
      </div>

      {/* ── MOBILE: Swiper ── */}
      <div className="block md:hidden px-6">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          spaceBetween={12}
          slidesPerView={1}
          className="happy-faces-swiper !pb-9"
        >
          {HAPPY_FACES.map((face, i) => (
            <SwiperSlide key={face.id}>
              <FaceCard face={face} index={i} />
            </SwiperSlide>
          ))}
        </Swiper>

        <style>{`
          .happy-faces-swiper .swiper-pagination-bullet {
            width: 7px;
            height: 7px;
            background: var(--muted);
            opacity: 0.35;
            transition: all 0.3s ease;
          }
          .happy-faces-swiper .swiper-pagination-bullet-active {
            background: var(--accent);
            opacity: 1;
            width: 20px;
            border-radius: 4px;
          }
        `}</style>
      </div>

      {/* ── DESKTOP: 3-Column Grid — constrained width ── */}
      <div className="hidden md:grid md:grid-cols-3 gap-5 lg:gap-6 max-w-3xl mx-auto px-6">
        {HAPPY_FACES.map((face, index) => (
          <motion.div
            key={face.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <FaceCard face={face} index={index} />
          </motion.div>
        ))}
      </div>

      {/* ── FOOTER CTA ── */}
      <div className="mt-8 pt-5 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-0 max-w-3xl mx-auto">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-heading">
              Follow Us On Instagram
            </p>
            <p className="text-[9px] font-medium text-muted">
              Tag @thechocolatemine to get featured!
            </p>
          </div>
        </div>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md shrink-0"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          <span>Follow @thechocolatemine</span>
        </a>
      </div>
    </section>
  );
}