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
              {/* Amazon Style Search Bar */}
              <div className="relative flex items-center gap-0 bg-card shadow-lg rounded-lg overflow-hidden border border-border/50 focus-within:border-secondary transition-all">
                <div className="flex-1 relative flex items-center">
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSelect(query)}
                    placeholder="Search for desserts, cakes, and chocolates..."
                    className="w-full bg-transparent pl-6 pr-12 py-4 text-base font-bold text-heading outline-none placeholder:text-muted/40 placeholder:font-medium"
                  />
                  {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => onSelect(query)}
                  className="bg-secondary text-button-text px-8 py-4 hover:bg-secondary/90 transition-all flex items-center justify-center border-l border-border/20 group"
                >
                  <Search size={22} className="group-hover:scale-110 transition-transform" />
                </button>
                <button 
                  onClick={onClose}
                  className="bg-surface text-muted p-4 hover:bg-muted/10 transition-all border-l border-border/20"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Suggestions / Results Area */}
              <div className="mt-8 pb-10">
                
                {/* Main Results */}
                <div className="max-w-3xl mx-auto">
                  {query.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-6 border-b border-border/30 pb-2">
                        <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Search Results ({results.length})</h3>
                        {results.length > 0 && <button onClick={() => navigate(`/shop?search=${encodeURIComponent(query)}`)} className="text-[10px] font-black text-secondary uppercase tracking-widest hover:underline">View All</button>}
                      </div>
                      
                      {results.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                          {results.map((p) => (
                            <div 
                              key={p._id}
                              onClick={() => navigate(`/product/${p.slug}`)}
                              className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border/30 hover:border-secondary cursor-pointer transition-all group shadow-sm hover:shadow-md"
                            >
                              <img src={p.image} alt={p.name} className="w-16 h-16 rounded-lg object-cover" />
                              <div className="flex-1">
                                <p className="font-black text-heading group-hover:text-secondary transition-colors">{p.name}</p>
                                <p className="text-[10px] text-muted font-black uppercase tracking-widest">{p.category}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-primary">₹{p.finalPrice || p.price}</p>
                                <ArrowRight size={16} className="ml-auto mt-1 text-secondary opacity-50 group-hover:opacity-100 transition-all" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-20 text-center">
                          <p className="font-black text-muted uppercase tracking-widest text-xs opacity-50">No matching desserts found</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                       <Search size={48} className="mx-auto mb-6 text-muted/20" />
                       <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Start typing to search our collections</p>
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
