import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, ArrowRight, Sparkles, History, ShoppingBag, ChevronRight } from 'lucide-react';
import ImageWithSkeleton from '../ui/ImageWithSkeleton';
import { useNavigate, Link } from 'react-router-dom';
import productService from '../../services/productService';
import api from '../../utils/api';
import LottieImport from 'lottie-react';
import searchLoaderAnimation from '../../assets/search-loader.json';
import { toSentenceCase } from '../../utils/textUtils';

const Lottie = LottieImport.default || LottieImport;

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('bestsellers'); // 'bestsellers' | 'special' | 'offers'
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const hasLoadedInitialData = useRef(false);
  const navigate = useNavigate();

  // Load Recent Searches & Initial Backend Data on Open
  useEffect(() => {
    if (isOpen) {
      loadRecentSearches();
      if (!hasLoadedInitialData.current) {
        hasLoadedInitialData.current = true;
        fetchBackendProducts();
        fetchTrendingCategories();
      }
    }
  }, [isOpen]);

  const loadRecentSearches = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      setRecentSearches(Array.isArray(saved) ? saved : []);
    } catch {
      setRecentSearches([]);
    }
  };

  // Helper to extract crisp image URL for custom cake themes
  const getThemeImage = (t) => {
    if (t.image && typeof t.image === 'string' && t.image.trim() !== '') return t.image;
    if (t.imageUrl && typeof t.imageUrl === 'string' && t.imageUrl.trim() !== '') return t.imageUrl;
    if (t.thumbnail && typeof t.thumbnail === 'string' && t.thumbnail.trim() !== '') return t.thumbnail;

    if (t.colors && Array.isArray(t.colors)) {
      for (const c of t.colors) {
        if (c && c.images) {
          const cand = c.images.tier1 || c.images.single || c.images.tier2 || c.images.tier3;
          if (cand && typeof cand === 'string' && cand.trim() !== '') {
            return cand;
          }
        }
      }
    }

    if (t.flavors && Array.isArray(t.flavors)) {
      for (const f of t.flavors) {
        if (f && f.image && typeof f.image === 'string' && f.image.trim() !== '') {
          return f.image;
        }
      }
    }

    return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80';
  };

  // Fetch Real Backend Products & Custom Cake Themes via API
  const fetchBackendProducts = async () => {
    try {
      // Render products as soon as the product endpoints respond. Themes are
      // supplementary content and should not hold up the first paint.
      const productsPromise = api.get('/products', { params: { limit: 24 } }).catch(() => ({ data: [] }));
      const bestsellersPromise = api.get('/products', { params: { bestseller: 'true', limit: 20 } }).catch(() => ({ data: [] }));
      const themesPromise = api.get('/custom-cakes/themes').catch(() => ({ data: [] }));

      const prodRes = await productsPromise;
      const rawProds = prodRes.data?.data || prodRes.data || [];

      // Paint the first product cards without waiting for supplementary data.
      const prodsList = Array.isArray(rawProds) ? rawProds : [];

      setAllProducts(prodsList);

      // Apply bestseller flags after the first product paint.
      const bestsRes = await bestsellersPromise;
      const rawBests = bestsRes.data?.data || bestsRes.data || [];
      const bestIds = new Set(rawBests.map(b => String(b._id)));
      const flaggedProducts = prodsList.map(p => ({
        ...p,
        name: toSentenceCase(p.name),
        bestseller: p.bestseller === true || p.isBestseller === true || bestIds.has(String(p._id))
      }));
      setAllProducts(flaggedProducts);

      // Add custom themes when they are ready, without delaying product cards.
      const themesRes = await themesPromise;
      const rawThemes = themesRes.data?.data || themesRes.data || [];
      const mappedThemes = Array.isArray(rawThemes) ? rawThemes.map(t => ({
        _id: t._id,
        id: t._id,
        name: toSentenceCase(t.name),
        image: getThemeImage(t),
        price: t.basePrice || 1120,
        category: ['Custom Cakes'],
        isCustom: true,
        isTheme: true,
        bestseller: t.bestseller === true || t.isBestseller === true || t.isBestSeller === true,
        featured: t.featured === true || t.isFeatured === true
      })) : [];

      const combined = [...flaggedProducts, ...mappedThemes];
      setAllProducts(combined);
    } catch (err) {
      console.error('Failed to fetch backend products:', err);
      setAllProducts([]);
    }
  };

  // Fetch Trending/Categories from Backend
  const fetchTrendingCategories = async () => {
    try {
      const res = await api.get('/categories');
      const cats = res.data?.data || res.data || [];
      const catNames = cats
        .map(c => c.name || c.label)
        .filter(n => n && n.toLowerCase() !== 'all')
        .slice(0, 6);

      setTrending(catNames.length > 0 ? catNames : ['Truffle Cakes', 'Bento Cakes', 'Jar Cakes', 'Eggless Specials']);
    } catch (err) {
      setTrending(['Truffle Cakes', 'Bento Cakes', 'Jar Cakes', 'Eggless Specials']);
    }
  };

  // Filter backend products based on active tab
  const getTabProducts = () => {
    if (!allProducts || allProducts.length === 0) return [];
    
    if (activeTab === 'offers') {
      const offers = allProducts.filter(p => p.offerPrice && Number(p.offerPrice) > 0 && Number(p.offerPrice) < Number(p.price));
      if (offers.length > 0) return offers.slice(0, 4);
      const discounted = allProducts.filter(p => p.coupon?.enabled || p.discountPct > 0);
      return discounted.length > 0 ? discounted.slice(0, 4) : allProducts.filter(p => !p.isCustom).slice(0, 4);
    }

    if (activeTab === 'special') {
      const special = allProducts.filter(p => p.isCustom || p.isTheme || p.featured || p.isFeatured);
      return special.length > 0 ? special.slice(0, 4) : allProducts.slice(0, 4);
    }

    // Bestsellers tab: Only products marked as bestseller in backend
    const realBestsellers = allProducts.filter(p => p.bestseller === true || p.isBestseller === true || p.isBestSeller === true);
    if (realBestsellers.length > 0) {
      return realBestsellers.slice(0, 4);
    }

    // Fallback: If no bestseller is flagged in backend yet, show available top backend products
    return allProducts.slice(0, 4);
  };

  // Debounced Real-time Search
  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await productService.search({ q: trimmedQuery, limit: 6 });
        setResults(res.data?.data || res.data || []);
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('Search error:', err);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleClearInput = () => {
    setQuery('');
    setResults([]);
  };

  const saveSearchTerm = (term) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;
    const updated = [cleanTerm, ...recentSearches.filter(s => s.toLowerCase() !== cleanTerm.toLowerCase())].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    setRecentSearches(updated);
  };

  // Trigger search on selecting recent term or trending item
  const handleSelectQuery = (term) => {
    if (!term.trim()) return;
    saveSearchTerm(term);
    setQuery(term);
  };

  // Direct Submission (Pressing Enter or View All)
  const handleSubmitSearch = (term) => {
    const targetQuery = term || query;
    if (!targetQuery.trim()) return;
    saveSearchTerm(targetQuery);
    navigate(`/shop?search=${encodeURIComponent(targetQuery.trim())}`);
    onClose();
  };

  const removeRecentItem = (e, termToRemove) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== termToRemove);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    setRecentSearches(updated);
  };

  const clearAllRecent = (e) => {
    e.stopPropagation();
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  const tabProducts = getTabProducts();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999]"
          />

          {/* Search Panel Container */}
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed top-0 left-0 right-0 bg-[var(--background)] z-[10000] shadow-2xl border-b border-[var(--border)] overflow-y-auto max-h-[92vh]"
          >
            <div className="max-w-[1600px] mx-auto px-4 sm:px-10 py-6 sm:py-8">

              {/* SEARCH INPUT BAR */}
              <div className="flex items-center gap-3 sm:gap-4 mb-8">
                <div className="flex-1 relative">
                  <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-[var(--primary)] pointer-events-none">
                    <Search size={22} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                  </div>
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitSearch(query)}
                    placeholder="Search for cakes, desserts, bento treats..."
                    className="w-full bg-[var(--card)] border-2 border-[var(--border)] focus:border-[var(--primary)] text-[var(--heading)] placeholder:text-[var(--body)] placeholder:opacity-60 text-base sm:text-xl font-bold pl-12 sm:pl-16 pr-14 py-3.5 sm:py-4.5 rounded-2xl outline-none transition-all shadow-sm"
                  />
                  <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {loading && (
                      <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                    )}
                    {query && (
                      <button
                        onClick={handleClearInput}
                        className="p-1.5 text-[var(--body)] hover:text-[var(--heading)] transition-colors rounded-full hover:bg-[var(--surface)]"
                        title="Clear search"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="flex w-12 h-12 sm:w-14 sm:h-14 items-center justify-center rounded-2xl bg-[var(--card)] border border-[var(--border)] text-[var(--heading)] hover:bg-[var(--primary)] hover:text-[var(--button-text)] hover:border-[var(--primary)] transition-all shadow-sm cursor-pointer shrink-0"
                  aria-label="Close search"
                >
                  <X size={22} />
                </button>
              </div>

              {/* DYNAMIC CONTENT GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">

                {/* SIDEBAR: Recent Searches & Trending Categories */}
                <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <History size={18} className="text-[var(--primary)]" />
                          <h3 className="text-xs font-black text-[var(--heading)] uppercase tracking-wider">Recent Searches</h3>
                        </div>
                        <button onClick={clearAllRecent} className="text-[11px] font-bold text-[var(--muted)] hover:text-[var(--primary)] uppercase tracking-wider transition-colors cursor-pointer">
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((s, i) => (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs font-extrabold uppercase tracking-wide text-[var(--heading)] hover:border-[var(--primary)] transition-all group"
                          >
                            <span
                              onClick={() => handleSelectQuery(s)}
                              className="cursor-pointer hover:text-[var(--primary)] flex items-center gap-1.5"
                            >
                              {s}
                            </span>
                            <button
                              onClick={(e) => removeRecentItem(e, s)}
                              className="text-[var(--muted)] hover:text-red-500 transition-colors p-0.5 rounded-full"
                              title="Remove"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Backend Trending Categories */}
                  <div className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] shadow-sm">
                    <div className="flex items-center gap-2.5 mb-5">
                      <TrendingUp size={18} className="text-[var(--accent)]" />
                      <h3 className="text-xs font-black text-[var(--heading)] uppercase tracking-wider">Trending Categories</h3>
                    </div>
                    <div className="space-y-1.5">
                      {trending.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectQuery(item)}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--button-bg)] hover:text-[var(--button-text)] transition-all group text-left cursor-pointer"
                        >
                          <span className="text-xs sm:text-sm font-bold text-[var(--body)] group-hover:text-[var(--button-text)] uppercase tracking-wide transition-colors">{item}</span>
                          <Sparkles size={14} className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* MAIN SECTION: Dynamic Backend Results / Tabbed Showcase */}
                <div className="lg:col-span-8 order-1 lg:order-2">
                  {query.trim().length > 0 ? (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
                        <h2 className="text-xs font-black text-[var(--primary)] uppercase tracking-widest">
                          {loading ? 'Searching...' : `Matching Delicacies (${results.length})`}
                        </h2>
                        {!loading && results.length > 0 && (
                          <button onClick={() => handleSubmitSearch(query)} className="flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--primary)] uppercase tracking-wider transition-all group cursor-pointer">
                            View All Results <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        )}
                      </div>

                      {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center">
                          <div className="w-28 h-28 sm:w-36 sm:h-36">
                            <Lottie
                              animationData={searchLoaderAnimation}
                              loop={true}
                              autoplay={true}
                            />
                          </div>
                          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mt-2 animate-pulse">
                            Searching for delicacies...
                          </p>
                        </div>
                      ) : results.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {results.map((p) => {
                            const catName = Array.isArray(p.category) ? p.category[0] : (p.category || 'Cake');
                            return (
                              <div
                                key={p._id?.$oid || p._id}
                                onClick={() => {
                                  saveSearchTerm(query);
                                  navigate(`/product/${p.slug || p._id}`);
                                  onClose();
                                }}
                                className="flex items-center gap-4 p-3.5 bg-[var(--card)] rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] cursor-pointer transition-all group shadow-sm hover:shadow-md relative overflow-hidden"
                              >
                                <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-[var(--surface)]">
                                  <ImageWithSkeleton src={p.image} alt={p.name} loading="eager" fetchPriority="high" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" showSparkles={false} imageWidth={200} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-[var(--heading)] text-sm leading-tight truncate group-hover:text-[var(--primary)] transition-colors tracking-tight">{toSentenceCase(p.name)}</p>
                                  <p className="text-[10px] text-[var(--muted)] font-extrabold uppercase tracking-wider mt-1">{catName}</p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-sm font-black text-[var(--primary)]">₹{p.offerPrice || p.price}</span>
                                    {p.offerPrice && p.offerPrice < p.price && (
                                      <span className="text-[11px] line-through text-[var(--muted)] opacity-60">₹{p.price}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ArrowRight size={16} className="text-[var(--primary)]" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-20 text-center bg-[var(--card)] rounded-2xl border border-dashed border-[var(--border)]">
                          <Search size={44} className="mx-auto mb-4 text-[var(--muted)] opacity-40" />
                          <p className="font-extrabold text-[var(--heading)] uppercase tracking-wide text-lg">No matching delicacies</p>
                          <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mt-2">Try different keywords or explore our catalog</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Default Backend Recommended / Bestseller / Offers Grid */
                    <div className="space-y-6 animate-in fade-in duration-500">
                      {/* TAB SELECTOR HEADER */}
                      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 flex-wrap gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => setActiveTab('bestsellers')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                              activeTab === 'bestsellers'
                                ? 'bg-[var(--primary)] text-[var(--button-text)] shadow-sm'
                                : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--heading)]'
                            }`}
                          >
                            🔥 Bestsellers
                          </button>
                          <button
                            onClick={() => setActiveTab('special')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                              activeTab === 'special'
                                ? 'bg-[var(--primary)] text-[var(--button-text)] shadow-sm'
                                : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--heading)]'
                            }`}
                          >
                            🎂 Special Cakes
                          </button>
                          <button
                            onClick={() => setActiveTab('offers')}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                              activeTab === 'offers'
                                ? 'bg-[var(--primary)] text-[var(--button-text)] shadow-sm'
                                : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--heading)]'
                            }`}
                          >
                            ⚡ Offer Cakes
                          </button>
                        </div>

                        <Link
                          to={activeTab === 'offers' ? '/shop?offers=true' : (activeTab === 'bestsellers' ? '/shop?bestseller=true' : '/shop')}
                          onClick={onClose}
                          className="flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--primary)] uppercase tracking-wider transition-all group"
                        >
                          Browse Shop <ShoppingBag size={14} className="group-hover:scale-110 transition-transform" />
                        </Link>
                      </div>

                      {/* PRODUCT GRID */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {tabProducts.length > 0 ? (
                          tabProducts.map((p) => {
                            const isBestsellerProduct = p.bestseller === true || p.isBestseller === true || p.isBestSeller === true;
                            const isOfferProduct = p.offerPrice && p.price && Number(p.offerPrice) < Number(p.price);
                            const discountPct = isOfferProduct ? Math.round(((p.price - p.offerPrice) / p.price) * 100) : 0;

                            let badgeText = null;
                            if (isBestsellerProduct) {
                              badgeText = 'BEST SELLER';
                            } else if (isOfferProduct) {
                              badgeText = `${discountPct}% OFF`;
                            } else if (p.isCustom || p.isTheme) {
                              badgeText = 'SPECIAL CAKE';
                            }

                            return (
                              <div
                                key={p._id?.$oid || p._id}
                                onClick={() => {
                                  if (p.isCustom || p.isTheme) {
                                    navigate('/custom-cake');
                                  } else {
                                    navigate(`/product/${p.slug || p._id}`);
                                  }
                                  onClose();
                                }}
                                className="group cursor-pointer"
                              >
                                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-md mb-2.5 border border-[var(--border)] bg-[var(--card)]">
                                  <ImageWithSkeleton src={p.image} alt={p.name} loading="eager" fetchPriority="high" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" containerClassName="w-full h-full" imageWidth={400} />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-75 group-hover:opacity-90 transition-opacity" />
                                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      {badgeText && (
                                        <span className="px-2 py-0.5 bg-[var(--accent)] text-[#120806] text-[9px] font-black uppercase tracking-widest rounded-md mb-1 inline-block">
                                          {badgeText}
                                        </span>
                                      )}
                                      <p className="text-sm font-extrabold text-white leading-tight tracking-tight line-clamp-1">{toSentenceCase(p.name)}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="text-sm font-black text-white block">
                                        ₹{p.offerPrice || p.price}
                                      </span>
                                      {p.offerPrice && p.offerPrice < p.price && (
                                        <span className="text-[10px] line-through text-white/60 block">
                                          ₹{p.price}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          Array(4).fill(0).map((_, i) => (
                            <div key={i} className="aspect-[16/10] rounded-2xl bg-[var(--card)] animate-pulse" />
                          ))
                        )}
                      </div>

                      {/* Custom Cake Banner */}
                      <div className="p-6 sm:p-7 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shrink-0">
                            <Sparkles size={22} />
                          </div>
                          <div>
                            <p className="font-extrabold text-[var(--heading)] uppercase tracking-tight text-sm">Need a custom masterpiece?</p>
                            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mt-0.5">Handcrafted by our master chefs</p>
                          </div>
                        </div>
                        <button onClick={() => { navigate('/custom-cake'); onClose(); }} className="px-6 py-3 bg-[var(--button-bg)] text-[var(--button-text)] rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-95 active:scale-95 shadow-md transition-all shrink-0 cursor-pointer">Design Your Cake</button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
