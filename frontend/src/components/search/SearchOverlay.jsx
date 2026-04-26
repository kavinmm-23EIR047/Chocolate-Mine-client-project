import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(saved);
  }, []);

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await productService.search({ q: val, limit: 5 });
      setResults(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSelect = (q) => {
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    navigate(`/shop?search=${encodeURIComponent(q)}`);
    onClose();
  };

  const trending = ['Belgian Truffle', 'Eggless Cupcakes', 'Fruit Cakes', 'Macaron Box', 'Dark Chocolate'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
          />
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-navbar z-[210] p-6 shadow-2xl"
          >
            <div className="max-w-4xl mx-auto">
              {/* Search Input Bar */}
              <div className="relative flex items-center gap-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-secondary transition-colors" />
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search for your favorite dessert..."
                    className="w-full bg-muted/5 border-2 border-border/50 rounded-md pl-14 pr-6 py-4 text-lg font-black text-heading outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/5 transition-all placeholder:text-muted/40"
                  />
                  {loading && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={onClose}
                  className="p-4 hover:bg-muted/10 rounded-md transition-all text-muted hover:text-heading"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Suggestions / Results Area */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-[1fr_280px] gap-12 pb-10">
                
                {/* Main Results */}
                <div>
                  {query.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-6">Search Results</h3>
                      {results.length > 0 ? (
                        results.map((p) => (
                          <div 
                            key={p._id}
                            onClick={() => navigate(`/product/${p.slug}`)}
                            className="flex items-center gap-4 p-3 rounded-md hover:bg-muted/5 border border-transparent hover:border-border/30 cursor-pointer transition-all group"
                          >
                            <img src={p.image} alt={p.name} className="w-16 h-16 rounded-md object-cover border border-border/50" />
                            <div>
                              <p className="font-black text-heading group-hover:text-secondary transition-colors">{p.name}</p>
                              <p className="text-xs text-muted font-bold uppercase tracking-widest">{p.category}</p>
                            </div>
                            <div className="ml-auto text-right">
                              <p className="font-black text-primary">₹{p.finalPrice || p.price}</p>
                              <ArrowRight size={16} className="ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-secondary" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-10 text-center opacity-50">
                          <Sparkles size={40} className="mx-auto mb-4 text-muted/30" />
                          <p className="font-black text-muted uppercase tracking-widest text-xs">Looking for something sweet...</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {recentSearches.length > 0 && (
                        <div>
                          <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                            <Clock size={14} /> Recent Searches
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            {recentSearches.map((s, i) => (
                              <button 
                                key={i}
                                onClick={() => onSelect(s)}
                                className="px-5 py-2 bg-muted/5 border border-border/50 rounded-full text-xs font-black text-heading hover:border-secondary transition-all"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                          <TrendingUp size={14} /> Popular Near You
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {trending.map((t, i) => (
                            <button 
                              key={i}
                              onClick={() => onSelect(t)}
                              className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-md text-sm font-black text-heading hover:bg-secondary hover:text-white transition-all group"
                            >
                              {t}
                              <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Categories / Quick Links Sidebar */}
                <div className="hidden md:block border-l border-border/50 pl-12">
                   <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-6">Quick Discover</h3>
                   <div className="space-y-6">
                      {['Best Offers', 'New Arrivals', 'Combos', 'Gift Cards'].map((link) => (
                        <button key={link} className="block w-full text-left font-black text-heading hover:text-secondary transition-colors text-sm uppercase tracking-wide">
                          {link}
                        </button>
                      ))}
                   </div>
                   
                   <div className="mt-12 p-6 bg-primary rounded-md text-white text-center shadow-xl">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Weekend Special</p>
                      <h4 className="text-lg font-black mb-4">FREE DELIVERY</h4>
                      <p className="text-[9px] font-bold opacity-60">On orders above ₹599</p>
                   </div>
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
