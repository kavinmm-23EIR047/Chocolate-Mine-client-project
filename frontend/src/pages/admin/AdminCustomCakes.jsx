import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Cake, Plus, Edit3, Trash2, X, Palette, Coffee, ChevronDown, ChevronLeft, ChevronRight, Star, Award, EyeOff } from 'lucide-react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import ThemeBuilder from '../../components/admin/CustomCakes/ThemeBuilder';
import ColorManager from '../../components/admin/CustomCakes/ColorManager';
import FlavourManager from '../../components/admin/CustomCakes/FlavourManager';
import SearchInput from '../../components/ui/SearchInput';
import Badge from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/helpers';
import { getOptimizedCloudinaryUrl } from '../../utils/cloudinary';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import Pagination from '../../components/ui/Pagination';

const AdminCustomCakes = () => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbCategories, setDbCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [editingThemeId, setEditingThemeId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('edit') || null;
  }); // null = List view, 'new' = Create view, string = Edit view
  const [showGlobalColors, setShowGlobalColors] = useState(false);
  const [showGlobalFlavours, setShowGlobalFlavours] = useState(false);

  const tableScrollRef = useRef(null);

  const scrollTable = (direction) => {
    if (tableScrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      tableScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Sync state with URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (editingThemeId) {
      params.set('edit', editingThemeId);
    } else {
      params.delete('edit');
    }
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    if (window.location.search !== `?${params.toString()}` && window.location.search !== '') {
      window.history.pushState({ path: newUrl }, '', newUrl);
    } else if (window.location.search === '' && params.toString()) {
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  }, [editingThemeId]);

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setEditingThemeId(params.get('edit') || null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (editingThemeId === null) {
      fetchThemes();
    }
  }, [editingThemeId]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const catRes = await adminService.getCategories();
        setDbCategories(catRes.data?.data || catRes.data || []);
      } catch (err) {
        // ignore
      }
    };
    fetchMeta();
  }, []);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCustomCakeThemes();
      setThemes(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load themes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this theme? It will delete related color mappings and pricing.')) return;
    try {
      await adminService.deleteCustomCakeTheme(id);
      toast.success('Theme deleted successfully');
      fetchThemes();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const availableCategories = useMemo(() => {
    const defaultCustomCategories = [
      { name: 'custom birthday cakes', label: 'Custom Birthday Cakes' },
      { name: 'wedding & anniversary', label: 'Wedding & Anniversary' }
    ];

    const isCustomCategory = (name) => {
      if (!name) return false;
      const clean = name.toLowerCase().replace(/[\s_-]/g, '');
      return clean.includes('custombirthday') || clean.includes('wedding') || clean.includes('anniversary');
    };

    const map = new Map();
    defaultCustomCategories.forEach(item => map.set(item.name, item));

    dbCategories.forEach(c => {
      const val = (c.name || '').toLowerCase();
      if (val && isCustomCategory(val) && !map.has(val)) {
        map.set(val, {
          name: val,
          label: c.label || c.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        });
      }
    });

    return Array.from(map.values());
  }, [dbCategories]);

  const handleToggleStock = async (theme) => {
    try {
      const newStatus = !theme.isActive;
      await adminService.updateCustomCakeTheme(theme._id, { isActive: newStatus });
      toast.success(`Stock status for "${theme.name}" turned ${newStatus ? 'ON (In Stock)' : 'OFF (Out of Stock)'}`);
      setThemes(prev => prev.map(t => t._id === theme._id ? { ...t, isActive: newStatus } : t));
    } catch (err) {
      toast.error('Failed to update theme stock status');
    }
  };

  const getCategoryCount = useCallback((catName) => {
    if (!catName) return themes.length;
    const cleanCat = catName.toLowerCase().replace(/[\s_-]/g, '');
    return themes.filter(t => {
      let cats = [];
      if (Array.isArray(t.category)) cats = t.category;
      else if (typeof t.category === 'string') cats = [t.category];

      return cats.some(c => {
        if (typeof c !== 'string') return false;
        const baseC = c.toLowerCase().replace(/[\s_-]/g, '');
        return baseC.includes(cleanCat) || cleanCat.includes(baseC);
      });
    }).length;
  }, [themes]);

  const filteredThemes = useMemo(() => {
    let result = [...themes];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(t => 
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (Array.isArray(t.category) && t.category.some(c => typeof c === 'string' && c.toLowerCase().includes(q)))
      );
    }

    // Category filter
    if (category) {
      const cleanCat = category.toLowerCase().replace(/[\s_-]/g, '');
      result = result.filter(t => {
        let cats = [];
        if (Array.isArray(t.category)) cats = t.category;
        else if (typeof t.category === 'string') cats = [t.category];

        return cats.some(c => {
          if (typeof c !== 'string') return false;
          const baseC = c.toLowerCase().replace(/[\s_-]/g, '');
          return baseC.includes(cleanCat) || cleanCat.includes(baseC);
        });
      });
    }

    // Status filter
    if (status === 'active') {
      result = result.filter(t => t.isActive === true);
    } else if (status === 'inactive') {
      result = result.filter(t => t.isActive === false);
    }

    // Sort
    result.sort((a, b) => {
      if (sort === '-createdAt') {
        const da = a.createdAt ? new Date(a.createdAt) : 0;
        const db = b.createdAt ? new Date(b.createdAt) : 0;
        return db - da;
      }
      if (sort === 'createdAt') {
        const da = a.createdAt ? new Date(a.createdAt) : 0;
        const db = b.createdAt ? new Date(b.createdAt) : 0;
        return da - db;
      }
      if (sort === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sort === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      return 0;
    });

    return result;
  }, [themes, search, category, status, sort]);

  useEffect(() => {
    setPage(1);
  }, [search, category, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredThemes.length / ITEMS_PER_PAGE));
  const paginatedThemes = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredThemes.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredThemes, page]);

  const getThemeFirstImage = (theme) => {
    if (!theme) return 'https://placehold.co/100x100/3B1A0F/FAF0EC?text=🎂';
    if (Array.isArray(theme.colors) && theme.colors.length > 0) {
      for (const col of theme.colors) {
        if (col) {
          if (col.images?.tier1) return col.images.tier1;
          if (col.images?.tier2) return col.images.tier2;
          if (col.images?.tier3) return col.images.tier3;
          if (col.image) return col.image;
          if (col.imageUrl) return col.imageUrl;
          if (col.tier1Image) return col.tier1Image;
        }
      }
    }
    if (theme.image) return theme.image;
    if (Array.isArray(theme.sampleImages) && theme.sampleImages.length > 0) return theme.sampleImages[0];
    return 'https://placehold.co/100x100/3B1A0F/FAF0EC?text=🎂';
  };

  const getThemeMappedPrice = (theme) => {
    if (!theme) return 0;
    if (Array.isArray(theme.colors) && theme.colors.length > 0) {
      for (const col of theme.colors) {
        if (col) {
          if (col.price && Number(col.price) > 0) return Number(col.price);
          if (col.tier1Price && Number(col.tier1Price) > 0) return Number(col.tier1Price);
        }
      }
    }
    if (Array.isArray(theme.customWeightPrices) && theme.customWeightPrices.length > 0) {
      for (const cwp of theme.customWeightPrices) {
        if (cwp?.price && Number(cwp.price) > 0) return Number(cwp.price);
      }
    }
    if (theme.tiers?.tier1?.price && Number(theme.tiers.tier1.price) > 0) return Number(theme.tiers.tier1.price);
    if (theme.tiers?.tier1?.basePrice && Number(theme.tiers.tier1.basePrice) > 0) return Number(theme.tiers.tier1.basePrice);
    if (theme.tiers?.tier2?.price && Number(theme.tiers.tier2.price) > 0) return Number(theme.tiers.tier2.price);
    if (theme.tiers?.tier3?.price && Number(theme.tiers.tier3.price) > 0) return Number(theme.tiers.tier3.price);
    return Number(theme.basePrice || theme.price || 0);
  };

  if (editingThemeId) {
    return (
      <div className="space-y-6">
        <ThemeBuilder 
          themeId={editingThemeId === 'new' ? null : editingThemeId} 
          onBack={() => setEditingThemeId(null)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-heading flex items-center gap-2">
            <Cake className="text-primary" /> Custom Cakes Themes
          </h2>
          <p className="text-muted text-sm mt-1">Manage custom cake themes and pricing configurations.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <button onClick={() => setShowGlobalFlavours(true)} className="flex items-center justify-center gap-2 bg-input border border-border text-heading px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-border/30 transition-all flex-1 cursor-pointer">
            <Coffee size={16} /> Global Flavours
          </button>
          <button onClick={() => setShowGlobalColors(true)} className="flex items-center justify-center gap-2 bg-input border border-border text-heading px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-border/30 transition-all flex-1 cursor-pointer">
            <Palette size={16} /> Global Colors
          </button>
          <button onClick={() => setEditingThemeId('new')} className="flex items-center justify-center gap-2 bg-primary text-button-text px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all flex-1 sm:ml-2 cursor-pointer shadow-lift">
            <Plus size={18} /> Create New Theme
          </button>
        </div>
      </div>

      {/* ── FILTERING & SEARCH CONTROLS ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput 
            onSearch={setSearch} 
            placeholder="Search themes by name, description, or category..." 
            className="flex-1 max-w-sm" 
          />

          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            className="bg-input border border-input-border text-body px-4 py-2.5 rounded-xl focus:outline-none capitalize font-bold cursor-pointer"
          >
            <option value="">All Categories ({themes.length})</option>
            {availableCategories.map((c) => {
              const count = getCategoryCount(c.name);
              return (
                <option key={c.name} value={c.name}>
                  {c.label} ({count})
                </option>
              );
            })}
          </select>

          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)} 
            className="bg-input border border-input-border text-body px-4 py-2.5 rounded-xl focus:outline-none font-bold cursor-pointer"
          >
            <option value="">All Status ({themes.length})</option>
            <option value="active">Active ({themes.filter(t => t.isActive).length})</option>
            <option value="inactive">Inactive ({themes.filter(t => !t.isActive).length})</option>
          </select>

          <select 
            value={sort} 
            onChange={(e) => setSort(e.target.value)} 
            className="bg-input border border-input-border text-body px-4 py-2.5 rounded-xl focus:outline-none font-bold cursor-pointer"
          >
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
          </select>
        </div>

        {/* Category Quick Filter Pills with Counts */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border cursor-pointer ${
              !category 
                ? 'bg-primary text-button-text border-primary shadow-sm' 
                : 'bg-card border-border text-muted hover:text-heading hover:border-primary/40'
            }`}
          >
            <span>All</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${!category ? 'bg-black/20 text-button-text' : 'bg-border/60 text-heading'}`}>
              {themes.length}
            </span>
          </button>

          {availableCategories.map(c => {
            const count = getCategoryCount(c.name);
            const isActive = category === c.name;
            return (
              <button
                key={c.name}
                onClick={() => setCategory(c.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border capitalize cursor-pointer ${
                  isActive 
                    ? 'bg-primary text-button-text border-primary shadow-sm' 
                    : 'bg-card border-border text-muted hover:text-heading hover:border-primary/40'
                }`}
              >
                <span>{c.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-black/20 text-button-text' : 'bg-border/60 text-heading'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : filteredThemes.length === 0 ? (
        <EmptyState 
          title="No custom cake themes found" 
          message="Start by creating your first theme." 
          action={
            <button onClick={() => setEditingThemeId('new')} className="bg-primary text-button-text px-4 py-2 rounded-xl font-bold text-xs uppercase flex items-center gap-2">
              <Plus size={16} /> Create New Theme
            </button>
          } 
        />
      ) : (
        <>
          {/* Desktop Table matching Products Page layout & styling */}
          <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
            {/* Scroll Controls Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-border/10 border-b border-border/50 text-xs">
              <span className="font-bold text-muted text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <span>SCROLL TABLE</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted font-medium hidden sm:inline">Use scrollbar or buttons:</span>
                <button
                  type="button"
                  onClick={() => scrollTable('left')}
                  className="p-1.5 rounded-lg bg-card hover:bg-primary hover:text-button-text border border-border text-heading transition-all shadow-xs active:scale-95 flex items-center justify-center cursor-pointer"
                  title="Scroll Left"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTable('right')}
                  className="p-1.5 rounded-lg bg-card hover:bg-primary hover:text-button-text border border-border text-heading transition-all shadow-xs active:scale-95 flex items-center justify-center cursor-pointer"
                  title="Scroll Right"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div ref={tableScrollRef} className="overflow-x-auto w-full custom-scrollbar">
              <table className="w-full min-w-[950px] whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border bg-border/20">
                    <th className="text-left px-4 py-3.5 text-xs font-black text-muted uppercase tracking-wider">Theme</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black text-muted uppercase tracking-wider">Category</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black text-muted uppercase tracking-wider">Price</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black text-muted uppercase tracking-wider">Tiers</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black text-muted uppercase tracking-wider">Stock</th>
                    <th className="text-left px-4 py-3.5 text-xs font-black text-muted uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3.5 text-xs font-black text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedThemes.map((theme) => {
                    const imgUrl = getThemeFirstImage(theme);
                    const mappedPrice = getThemeMappedPrice(theme);
                    return (
                      <tr key={theme._id} className="hover:bg-card-soft transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={getOptimizedCloudinaryUrl(imgUrl, 200)} 
                              alt={theme.name} 
                              className="w-12 h-12 rounded-xl object-cover bg-border shadow-xs" 
                              onError={(e) => { e.target.src = 'https://placehold.co/100x100/3B1A0F/FAF0EC?text=🎂'; }} 
                            />
                            <div>
                              <p className="font-bold text-heading text-sm">{theme.name}</p>
                              <p className="text-xs text-muted max-w-xs truncate">{theme.description || theme.slug || 'Custom theme'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {theme.category?.length > 0 ? (
                              theme.category.map(cat => <Badge key={cat}>{cat.replace(/-/g, ' ')}</Badge>)
                            ) : (
                              <Badge>none</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-heading">{formatCurrency(mappedPrice)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {theme.tiers?.tier1?.isActive && <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase">T1</span>}
                            {theme.tiers?.tier2?.isActive && <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase">T2</span>}
                            {theme.tiers?.tier3?.isActive && <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase">T3</span>}
                            {!theme.tiers?.tier1?.isActive && !theme.tiers?.tier2?.isActive && !theme.tiers?.tier3?.isActive && <span className="text-muted text-[10px] font-black uppercase">None</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleToggleStock(theme)}
                            className={`font-black text-xs px-3 py-1 rounded-full shadow-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all ${
                              theme.isActive 
                                ? 'bg-emerald-700 text-white border border-emerald-600' 
                                : 'bg-rose-700 text-white border border-rose-600'
                            }`}
                            title={`Click to turn stock ${theme.isActive ? 'OFF' : 'ON'}`}
                          >
                            {theme.isActive ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {theme.isActive ? (
                              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">Active</span>
                            ) : (
                              <span className="text-xs font-bold text-error flex items-center gap-1"><EyeOff size={12} />Hidden</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2 shrink-0">
                            <button 
                              onClick={() => setEditingThemeId(theme._id)} 
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-400 hover:bg-amber-700 dark:hover:bg-amber-500 dark:hover:text-white rounded-xl text-xs font-black transition-all shadow-xs shrink-0 cursor-pointer active:scale-95 border border-amber-600/30 dark:border-amber-500/20"
                              title="Edit Theme"
                            >
                              <Edit3 size={14} />
                              <span>Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(theme._id)} 
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white dark:bg-rose-500/20 dark:text-rose-400 hover:bg-rose-700 dark:hover:bg-rose-500 dark:hover:text-white rounded-xl text-xs font-black transition-all shadow-xs shrink-0 cursor-pointer active:scale-95 border border-rose-600/30 dark:border-rose-500/20"
                              title="Delete Theme"
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Accordion View matching Products Page mobile view */}
          <div className="md:hidden flex flex-col gap-3">
            {paginatedThemes.map((theme) => {
              const imgUrl = getThemeFirstImage(theme);
              const mappedPrice = getThemeMappedPrice(theme);
              return (
                <details key={`mobile-${theme._id}`} className="bg-card border border-border rounded-2xl overflow-hidden group">
                  <summary className="p-4 flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center gap-3">
                      <img src={getOptimizedCloudinaryUrl(imgUrl, 200)} alt={theme.name} className="w-12 h-12 rounded-xl object-cover bg-border shadow-xs" onError={(e) => { e.target.src = 'https://placehold.co/100x100/3B1A0F/FAF0EC?text=🎂'; }} />
                      <div>
                        <p className="font-bold text-heading text-sm">{theme.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-heading text-xs">{formatCurrency(mappedPrice)}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleToggleStock(theme);
                            }}
                            className={`font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider ${theme.isActive ? 'bg-emerald-700 text-white border border-emerald-600' : 'bg-rose-700 text-white border border-rose-600'}`}
                          >
                            {theme.isActive ? 'In Stock' : 'Out'}
                          </button>
                        </div>
                      </div>
                    </div>
                    <ChevronDown size={20} className="text-muted group-open:rotate-180 transition-transform shrink-0" />
                  </summary>
                  
                  <div className="px-4 pb-4 pt-1 space-y-3">
                    <div className="h-px w-full bg-border/50 mb-3" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-muted uppercase tracking-widest">Categories</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {theme.category?.length > 0 ? (
                          theme.category.map(cat => <Badge key={cat}>{cat.replace(/-/g, ' ')}</Badge>)
                        ) : (
                          <Badge>none</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-muted uppercase tracking-widest">Tiers</span>
                      <div className="flex gap-1">
                        {theme.tiers?.tier1?.isActive && <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase">T1</span>}
                        {theme.tiers?.tier2?.isActive && <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase">T2</span>}
                        {theme.tiers?.tier3?.isActive && <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase">T3</span>}
                        {!theme.tiers?.tier1?.isActive && !theme.tiers?.tier2?.isActive && !theme.tiers?.tier3?.isActive && <span className="text-muted text-[10px] font-black uppercase">None</span>}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setEditingThemeId(theme._id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-400 hover:bg-amber-700 dark:hover:bg-amber-500 dark:hover:text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95 border border-amber-600/30 dark:border-amber-500/20"
                      >
                        <Edit3 size={14} /> <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(theme._id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 text-white dark:bg-rose-500/20 dark:text-rose-400 hover:bg-rose-700 dark:hover:bg-rose-500 dark:hover:text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95 border border-rose-600/30 dark:border-rose-500/20"
                      >
                        <Trash2 size={14} /> <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* Modals for Global Management */}
      {showGlobalColors && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl shadow-xl border border-border">
            <div className="flex justify-end p-4 pb-0 shrink-0">
              <button onClick={() => setShowGlobalColors(false)} className="p-2 bg-input border border-border rounded-full shadow-sm text-muted hover:text-heading transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 pt-2 overflow-y-auto">
              <ColorManager />
            </div>
          </div>
        </div>
      )}
      {showGlobalFlavours && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl shadow-xl border border-border">
            <div className="flex justify-end p-4 pb-0 shrink-0">
              <button onClick={() => setShowGlobalFlavours(false)} className="p-2 bg-input border border-border rounded-full shadow-sm text-muted hover:text-heading transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 pt-2 overflow-y-auto">
              <FlavourManager />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomCakes;
