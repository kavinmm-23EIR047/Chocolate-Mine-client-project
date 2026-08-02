import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Cake, Plus, Edit2, Trash2, X, Palette, Coffee, ChevronDown } from 'lucide-react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import ThemeBuilder from '../../components/admin/CustomCakes/ThemeBuilder';
import ColorManager from '../../components/admin/CustomCakes/ColorManager';
import FlavourManager from '../../components/admin/CustomCakes/FlavourManager';
import SearchInput from '../../components/ui/SearchInput';

const AdminCustomCakes = () => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbCategories, setDbCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [editingThemeId, setEditingThemeId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('edit') || null;
  }); // null = List view, 'new' = Create view, string = Edit view
  const [showGlobalColors, setShowGlobalColors] = useState(false);
  const [showGlobalFlavours, setShowGlobalFlavours] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (editingThemeId) {
      params.set('edit', editingThemeId);
    } else {
      params.delete('edit');
    }
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    // Only push state if it actually changed to prevent loops
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
          <p className="text-muted text-sm mt-1">Manage themes and their additive pricing configurations.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <button onClick={() => setShowGlobalFlavours(true)} className="flex items-center justify-center gap-2 bg-input border border-border text-heading px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-border/30 transition-all flex-1">
            <Coffee size={16} /> Global Flavours
          </button>
          <button onClick={() => setShowGlobalColors(true)} className="flex items-center justify-center gap-2 bg-input border border-border text-heading px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-border/30 transition-all flex-1">
            <Palette size={16} /> Global Colors
          </button>
          <button onClick={() => setEditingThemeId('new')} className="flex items-center justify-center gap-2 bg-primary text-button-text px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:brightness-110 transition-all flex-1 sm:ml-2">
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

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center font-bold text-muted animate-pulse">Loading themes...</div>
        ) : (
          <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full min-w-[1000px] whitespace-nowrap">
            <thead>
              <tr className="border-b border-border text-left bg-border/20">
                <th className="px-6 py-4 text-xs font-black text-muted uppercase">Theme Name</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase">Categories</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase">Tiers Enabled</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredThemes.map(theme => (
                <tr key={theme._id} className="hover:bg-border/10 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-black text-heading text-sm">{theme.name}</p>
                    <p className="font-bold text-muted text-xs truncate max-w-xs">{theme.description}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1">
                      {theme.category?.length > 0
                        ? theme.category.map(cat => (
                            <span key={cat} className="bg-secondary/10 text-secondary text-[10px] font-black px-2 py-0.5 rounded uppercase">{cat.replace(/-/g, ' ')}</span>
                          ))
                        : <span className="text-muted text-[10px] font-black uppercase">None</span>
                      }
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <button
                      type="button"
                      onClick={() => handleToggleStock(theme)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 ${
                        theme.isActive
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/25'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/40 hover:bg-rose-500/25'
                      }`}
                      title={`Click to turn stock ${theme.isActive ? 'OFF' : 'ON'}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${theme.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      <span>{theme.isActive ? 'STOCK ON' : 'STOCK OFF'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex gap-1">
                      {theme.tiers?.tier1?.isActive && <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase">T1</span>}
                      {theme.tiers?.tier2?.isActive && <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase">T2</span>}
                      {theme.tiers?.tier3?.isActive && <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase">T3</span>}
                      {!theme.tiers?.tier1?.isActive && !theme.tiers?.tier2?.isActive && !theme.tiers?.tier3?.isActive && <span className="text-muted text-[10px] font-black uppercase">None</span>}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingThemeId(theme._id)} className="p-2 text-muted hover:text-heading bg-input rounded-lg hover:bg-border/50 transition-colors" title="Edit Theme">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(theme._id)} className="p-2 text-muted hover:text-red-600 bg-input rounded-lg hover:bg-red-50 transition-colors" title="Delete Theme">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredThemes.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-muted font-bold">
                    No custom cake themes match your search/filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>

          {/* Mobile Accordion */}
          <div className="lg:hidden flex flex-col gap-3 p-4">
            {filteredThemes.length === 0 ? (
              <div className="text-center py-8 text-muted font-bold">
                No custom cake themes match your search/filter parameters.
              </div>
            ) : (
              filteredThemes.map(theme => (
                <details key={`mobile-${theme._id}`} className="bg-card border border-border rounded-2xl overflow-hidden group">
                  <summary className="p-4 flex items-center justify-between cursor-pointer list-none [&::-webkit-details-marker]:hidden bg-border/5">
                    <div>
                      <p className="font-black text-heading text-sm">{theme.name}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleStock(theme);
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs mt-1 ${
                          theme.isActive
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${theme.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span>{theme.isActive ? 'STOCK ON' : 'STOCK OFF'}</span>
                      </button>
                    </div>
                    <ChevronDown size={20} className="text-muted group-open:rotate-180 transition-transform shrink-0" />
                  </summary>
                  
                  <div className="px-4 pb-4 pt-1 space-y-3 bg-border/5">
                    <div className="h-px w-full bg-border/50 mb-3" />
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-muted uppercase tracking-widest">Description</span>
                      <p className="font-bold text-muted text-xs">{theme.description || 'No description'}</p>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/20">
                      <span className="text-[10px] font-black text-muted uppercase tracking-widest">Categories</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {theme.category?.length > 0
                          ? theme.category.map(cat => (
                              <span key={cat} className="bg-secondary/10 text-secondary text-[10px] font-black px-2 py-0.5 rounded uppercase">{cat.replace(/-/g, ' ')}</span>
                            ))
                          : <span className="text-muted text-[10px] font-black uppercase">None</span>
                        }
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/20">
                      <span className="text-[10px] font-black text-muted uppercase tracking-widest">Tiers Enabled</span>
                      <div className="flex gap-1">
                        {theme.tiers?.tier1?.isActive && <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase">T1</span>}
                        {theme.tiers?.tier2?.isActive && <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase">T2</span>}
                        {theme.tiers?.tier3?.isActive && <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase">T3</span>}
                        {!theme.tiers?.tier1?.isActive && !theme.tiers?.tier2?.isActive && !theme.tiers?.tier3?.isActive && <span className="text-muted text-[10px] font-black uppercase">None</span>}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-end gap-2">
                      <button onClick={() => setEditingThemeId(theme._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-border/50 hover:bg-border rounded-lg text-xs font-bold text-heading transition-colors">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(theme._id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-error/10 hover:bg-error/20 text-error rounded-lg text-xs font-bold transition-colors">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </details>
              ))
            )}
          </div>
          </>
        )}
      </div>

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
