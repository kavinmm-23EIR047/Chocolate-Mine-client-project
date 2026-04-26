import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, Star, Search, SlidersHorizontal,
  MapPin, Clock, Tag, Truck, ShieldCheck, Phone, ChevronLeft
} from 'lucide-react';
import productService from '../services/productService';
import reviewService from '../services/reviewService';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import { CardSkeleton } from '../components/ui/Skeleton';
import OccasionSection from '../components/home/OccasionSection';
import { useDeliveryLocation } from '../context/LocationContext';
import HomeBanner from '../components/home/HomeBanner';
import api from '../utils/api';


const MINI_ADS = [
  {
    img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80',
    label: 'Same Day Delivery',
    sub: 'Order before 3 PM',
  },
  {
    img: 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=600&q=80',
    label: 'Custom Cakes',
    sub: 'Your design, our craft',
  },
  {
    img: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&q=80',
    label: 'Fresh Daily',
    sub: 'Baked every morning',
  },
];

const TRUST = [
  { icon: <Truck size={15} />, label: 'Free delivery above ₹699' },
  { icon: <MapPin size={15} />, label: 'Coimbatore only · Fresh & local' },
  { icon: <Clock size={15} />, label: 'Same-day delivery · Order by 3 PM' },
  { icon: <ShieldCheck size={15} />, label: 'RazorPay secure checkout' },
  { icon: <Phone size={15} />, label: '24×7 WhatsApp support' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' },
  }),
};

/* ═══════════════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════════════ */
const Home = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('search') || '';

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [copiedCode, setCopiedCode] = useState('');
  const { location: deliveryCity } = useDeliveryLocation();
  const [activeTrustIndex, setActiveTrustIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const productsPerPage = 10;
  const timerRef = useRef(null);

  /* Responsive Listeners */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* auto-rotate hero & ticker */
  useEffect(() => {
    const trustTimer = setInterval(() => setActiveTrustIndex(s => (s + 1) % TRUST.length), 4000);
    return () => {
      clearInterval(trustTimer);
    };
  }, []);

  /* Fetch categories from backend */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await api.get('/categories');
        const backendCategories = response.data?.data || [];
        
        // Add "All" category at the beginning with a default image
        const allCategory = {
          name: 'All',
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&q=80'
        };
        
        setCategories([allCategory, ...backendCategories]);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to default "All" category only
        setCategories([{
          name: 'All',
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&q=80'
        }]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  /* load backend data */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Using activeCategory for filtering if not searching
        const catFilter = activeCategory !== 'All' ? activeCategory.toLowerCase() : '';

        const [allRes, bestRes, revRes] = await Promise.all([
          productService.getAll({
            q: query,
            category: catFilter,
            location: deliveryCity,
            limit: productsPerPage,
            page,
            sort: sortBy
          }),
          !query ? productService.getAll({ bestseller: 'true', location: deliveryCity, limit: 10 }) : Promise.resolve(null),
          !query ? reviewService.getLatest() : Promise.resolve(null),
        ]);

        const mainItems = allRes?.data?.data || [];
        setProducts(mainItems);
        setTotalProducts(allRes?.data?.total || mainItems.length);

        if (!query) {
          setBestsellers(bestRes?.data?.data || []);
          setReviews(revRes?.data?.data?.reviews || []);
        }
      } catch {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [query, page, sortBy, activeCategory, deliveryCity]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [query, sortBy, activeCategory]);

  const categoryRef = useRef(null);
  const reviewsRef = useRef(null);

  const scrollX = (ref, dir) => {
    if (ref.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    setPage(1);
    const el = document.getElementById('main-catalog');
    if (el) {
      const offset = el.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  const handleSort = (val) => {
    setSortBy(val);
    setPage(1);
  };

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied!`, {
      style: { background: 'var(--primary)', color: 'var(--button-text)', fontWeight: 'bold' }
    });
    setTimeout(() => setCopiedCode(''), 3000);
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  return (
    <div className="min-h-screen bg-background text-body">

      {/* ── TRUST TICKER ─────────────────────────────────────────── */}
      <div className="bg-navbar border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Desktop Grid */}
          <div className="hidden lg:flex items-center justify-between gap-10">
            {TRUST.map((t, i) => (
              <div key={i} className="flex items-center gap-2.5 whitespace-nowrap shrink-0 opacity-90">
                <span className="text-primary">{t.icon}</span>
                <span className="text-[11px] font-black uppercase tracking-wider text-navbar-text">{t.label}</span>
              </div>
            ))}
          </div>

          {/* Mobile Swiper */}
          <div className="lg:hidden relative">
            <div className="overflow-hidden">
              <motion.div
                animate={{ x: `-${activeTrustIndex * 100}%` }}
                className="flex"
              >
                {TRUST.map((t, i) => (
                  <div key={i} className="min-w-full flex items-center justify-center gap-3 py-1">
                    <span className="text-primary">{t.icon}</span>
                    <span className="text-[11px] font-black uppercase tracking-widest text-navbar-text text-center">{t.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>
            {/* Pagination dots for Ticker */}
            <div className="flex justify-center gap-1.5 mt-3">
              {TRUST.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTrustIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${activeTrustIndex === i ? 'bg-primary w-4' : 'bg-border'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>


      <main className="max-w-7xl mx-auto px-4 py-6 pb-32 space-y-16">

        {!query ? (
          <>
            {/* ── HERO BANNER ─────────────────────────────────────────── */}
            <HomeBanner />

            {/* ── DYNAMIC CATEGORY CIRCLES FROM BACKEND ────────────────── */}
            <section className="pt-6 pb-4">
              {categoriesLoading ? (
                <div className="flex flex-wrap justify-center gap-4 sm:gap-10 px-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-muted/20 animate-pulse" />
                      <div className="w-12 h-3 bg-muted/20 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-4 sm:gap-10 px-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => handleCategory(cat.name)}
                      className="flex flex-col items-center gap-3 group outline-none shrink-0"
                    >
                      <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 p-0.5 transition-all duration-500 overflow-hidden shadow-md ${activeCategory === cat.name
                        ? 'border-primary ring-4 ring-primary/10'
                        : 'border-border group-hover:border-primary/50'
                        }`}>
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className={`w-full h-full object-cover rounded-full transition-transform duration-700 ${activeCategory === cat.name ? 'scale-110' : 'group-hover:scale-110'
                            }`}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&q=80';
                          }}
                        />
                      </div>
                      <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors ${activeCategory === cat.name ? 'text-primary' : 'text-muted group-hover:text-primary'
                        }`}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* ── DELIVERY STRIP ───────────────────────────────────────── */}
            <section
              className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm border-2 border-border overflow-hidden relative"
              style={{ background: 'var(--card)' }}
            >
              {/* Subtle background glow to make the strip pop */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

              <div className="flex items-center gap-6 relative z-10">
                <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center p-1 rounded-full border-4 border-card bg-primary/5 shadow-inner">
                  <img
                    src="https://assets-v2.lottiefiles.com/a/2fb1820a-7b6b-48ef-8719-d055a442e43a/pj49dgWhuA.gif"
                    alt="Delivery Scooter"
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-screen"
                  />
                  <div className="absolute top-2 right-2 w-3.5 h-3.5 bg-green-500 rounded-full animate-pulse border-2 border-card shadow-sm" />
                </div>

                <div>
                  <h3 className="font-black text-xl sm:text-2xl tracking-tight uppercase" style={{ color: 'var(--card-text)' }}>
                    Exclusive Local Delivery
                  </h3>
                  <p className="text-sm font-black mt-1 uppercase tracking-[0.15em] flex items-center gap-1 text-primary">
                    <MapPin size={16} /> Delivering across {deliveryCity}
                  </p>
                  <p className="text-[11px] sm:text-xs font-bold opacity-60 uppercase tracking-widest mt-2 max-w-sm" style={{ color: 'var(--card-text)' }}>
                    We bake fresh and hand-deliver straight to your door to guarantee quality in {deliveryCity}. Order before 3 PM for same-day dispatch.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 px-6 py-4 rounded-2xl bg-background border-2 border-border shadow-inner relative z-10">
                <MapPin size={20} className="text-green-600 animate-bounce" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Delivering to</span>
                  <span className="text-sm font-black uppercase tracking-widest text-green-600 capitalize">{deliveryCity}</span>
                </div>
              </div>
            </section>

            {/* ── MINI ADS GRID ────────────────────────────────────────── */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {MINI_ADS.map((ad, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  custom={i}
                  className="relative rounded-3xl overflow-hidden group cursor-pointer shadow-md hover:shadow-2xl transition-all duration-700 border border-border/10"
                  style={{ height: 160 }}
                >
                  <img
                    src={ad.img}
                    alt={ad.label}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div
                    className="absolute inset-0 flex flex-col justify-end p-6"
                    style={{ background: 'linear-gradient(0deg,rgba(21,10,8,0.9) 0%,transparent 70%)' }}
                  >
                    <p className="font-black text-lg leading-tight text-[#FDE8E4] drop-shadow-sm">{ad.label}</p>
                    <p className="text-[11px] mt-1 text-[#FDE8E4]/70 font-bold uppercase tracking-widest">{ad.sub}</p>
                  </div>
                </motion.div>
              ))}
            </section>

            <OccasionSection />

            {/* ── BESTSELLERS ──────────────────────────────────────────── */}
            {bestsellers.length > 0 && (
              <section className="pt-4">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter">Bestsellers</h2>
                    <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">Our most loved creations</p>
                  </div>
                  <Link
                    to="/?search="
                    className="text-xs font-black uppercase tracking-[0.2em] px-6 py-3 rounded-2xl border-2 border-border hover:bg-primary hover:text-button-text transition-all shadow-sm active:scale-95"
                  >
                    Explore All
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {bestsellers.map((p, i) => (
                    <motion.div
                      key={p._id}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true }}
                      custom={i % 5}
                    >
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : null}

        {/* ── MAIN PRODUCT GRID ────────────────────────────────────── */}
        <section className="pt-8" id="main-catalog">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12 border-b-2 border-border pb-10">
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase">
                    {query ? `Results for "${query}"` : activeCategory === 'All' ? 'Our Collection' : activeCategory}
                  </h2>
                  <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mt-1">
                    {loading ? 'Refreshing...' : `${totalProducts} Premium Items`}
                  </p>
                </div>
              </div>


            </div>

            <div className="flex items-center gap-4">
              <SlidersHorizontal size={18} className="text-muted" />
              <select
                value={sortBy}
                onChange={e => handleSort(e.target.value)}
                className="text-[11px] font-black uppercase tracking-[0.15em] rounded-2xl px-6 py-3.5 outline-none transition-all cursor-pointer border-2 bg-card text-card-text border-border focus:border-primary shadow-sm hover:border-primary/50"
              >
                <option value="">Sort: Default</option>
                <option value="newest">Newest First</option>
                <option value="popularity">Popularity</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="ratings">Top Rated</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {loading && products.length === 0 ? (
              Array(10).fill(0).map((_, i) => <CardSkeleton key={i} />)
            ) : products.length > 0 ? (
              products.map((p, i) => (
                <motion.div
                  key={p._id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  custom={i % 5}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-40 text-center card-premium rounded-[2.5rem] border-2 border-dashed border-border/50">
                <Search size={56} className="mx-auto mb-6 opacity-10" />
                <p className="text-2xl font-black uppercase tracking-tighter">No products found</p>
                <p className="text-xs font-bold text-muted mt-3 uppercase tracking-widest">Adjust filters or search query</p>
              </div>
            )}
          </div>

          {/* ─── PAGINATION ─── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-20">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-4 rounded-2xl border-2 border-border hover:bg-primary hover:text-button-text disabled:opacity-20 transition-all shadow-md active:scale-90"
              >
                <ChevronLeft size={28} />
              </button>
              <div className="flex items-center gap-3">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-14 h-14 rounded-2xl border-2 font-black text-sm transition-all active:scale-90 shadow-sm ${page === i + 1
                      ? 'bg-primary text-button-text border-primary shadow-2xl scale-110'
                      : 'bg-card text-card-text border-border hover:border-primary/40'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-4 rounded-2xl border-2 border-border hover:bg-primary hover:text-button-text disabled:opacity-20 transition-all shadow-md active:scale-90"
              >
                <ChevronRight size={28} />
              </button>
            </div>
          )}
        </section>

        {/* ── REVIEWS with Swiper Controls ─────────────────────────── */}
        {!query && (
          <section
            className="rounded-[3rem] border-2 p-10 shadow-sm overflow-hidden group/rev"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6">
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-black tracking-tighter uppercase" style={{ color: 'var(--card-text)' }}>Customer Stories</h2>
                <p className="text-xs font-black opacity-40 uppercase tracking-[0.3em] mt-3">What they say about the mine</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-8 bg-card px-8 py-6 rounded-[2rem] border-2 border-border shadow-sm">
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-black tracking-tighter">
                    {(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1)}
                  </span>
                  <div className="flex flex-col">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < Math.floor((reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1))) ? "var(--primary)" : "none"} className={i < Math.floor((reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1))) ? "text-primary" : "text-border"} />
                      ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">
                      {reviews.length} Verified Reviews
                    </span>
                  </div>
                </div>
                <div className="hidden sm:block w-[2px] h-12 bg-border/50" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 max-w-[200px] leading-relaxed">
                  Real stories from our sweet community
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {reviews.map((r, i) => (
                <div
                  key={i}
                  className="rounded-3xl border-2 p-5 sm:p-8 flex flex-col transition-all hover:border-primary/30 hover:shadow-xl"
                  style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                >
                  <div className="flex gap-1 mb-4 sm:mb-6">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        size={14}
                        fill={j < r.rating ? 'var(--primary)' : 'none'}
                        style={{ color: j < r.rating ? 'var(--primary)' : 'var(--border)' }}
                      />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed mb-6 flex-1 font-medium italic opacity-90" style={{ color: 'var(--body)' }}>
                    "{r.comment}"
                  </p>
                  <div
                    className="flex items-center gap-4 pt-4 border-t-2"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 shadow-lg"
                      style={{ background: 'var(--primary)', color: 'var(--button-text)' }}
                    >
                      {r.userName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-black tracking-tight" style={{ color: 'var(--heading)' }}>{r.userName}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Verified Customer</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>



          </section>
        )}

        {/* ── BOTTOM BANNER ────────────────────────────────────────── */}
        {!query && (
          <section className="rounded-[3rem] overflow-hidden relative shadow-2xl border-4 border-white/10" style={{ height: 200 }}>
            <img
              src="https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=1400&q=80"
              alt="The Chocolate Mine"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-8"
              style={{ background: 'rgba(21,10,8,0.85)' }}
            >
              <h3 className="font-black text-2xl sm:text-4xl mb-3 text-[#FDE8E4] tracking-tighter uppercase">
                Freshly Baked. Securely Paid.
              </h3>
              <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.4em] text-[#FDE8E4]/50">
                Coimbatore · RazorPay · Fresh Daily
              </p>
            </div>
          </section>
        )}

      </main>
    </div>
  );
};

export default Home;