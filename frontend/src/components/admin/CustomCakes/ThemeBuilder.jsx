import React, { useState, useEffect } from 'react';
import { Sparkles, Check, X, Image as ImageIcon, Plus, Edit2, Trash2, UploadCloud, Scale, RefreshCw } from 'lucide-react';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';
import compressImage from '../../../utils/compressImage';


const ThemeBuilder = ({ themeId, onBack }) => {
  const [theme, setTheme] = useState({
    name: '',
    description: '',
    isActive: true,
    basePrice: 0,
    displayOrder: 0,
    category: [],
    hasWeights: true,
    enabledStandardWeights: ['1kg', '1.5kg', '2kg', '2.5kg', '3kg'],
    hasCustomWeights: false,
    customWeightPrices: [],
    tiers: {
      tier1: { isActive: true, price: 0 },
      tier2: { isActive: false, price: 0 },
      tier3: { isActive: false, price: 0 }
    },
    flavors: [],
    colors: []
  });

  const [categories, setCategories] = useState([]);

  const [globalColors, setGlobalColors] = useState([]);
  const [globalFlavours, setGlobalFlavours] = useState([]);
  const [themeColors, setThemeColors] = useState([]); // Kept for backwards-compatible loading of old colors if needed

  const [pendingColorMappings, setPendingColorMappings] = useState({});
  const [editingMappingName, setEditingMappingName] = useState(null);
  const [editingFlavourName, setEditingFlavourName] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  


  const [newCustomWeight, setNewCustomWeight] = useState('');
  const [newCustomPrice, setNewCustomPrice] = useState('');

  const handleAddCustomWeightPrice = () => {
    if (!newCustomWeight.trim()) {
      toast.error('Please enter a weight (e.g. 0.5kg)');
      return;
    }
    if (!newCustomPrice || isNaN(newCustomPrice) || parseFloat(newCustomPrice) < 0) {
      toast.error('Please enter a valid price');
      return;
    }
    const newItem = {
      weight: newCustomWeight.trim(),
      price: parseFloat(newCustomPrice)
    };
    setTheme(prev => ({
      ...prev,
      customWeightPrices: [...(prev.customWeightPrices || []), newItem]
    }));
    setNewCustomWeight('');
    setNewCustomPrice('');
  };

  const handleRemoveCustomWeightPrice = (index) => {
    setTheme(prev => ({
      ...prev,
      customWeightPrices: (prev.customWeightPrices || []).filter((_, idx) => idx !== index)
    }));
  };

  useEffect(() => {
    loadData();
  }, [themeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [colorsRes, categoriesRes, flavoursRes] = await Promise.all([
        adminService.getCustomCakeColors(),
        adminService.getCategories({ type: 'custom' }),
        adminService.getCustomCakeFlavours()
      ]);

      const loadedColors = colorsRes.data?.data || [];
      const loadedFlavours = flavoursRes.data?.data || [];
      setCategories(categoriesRes.data?.data || []);
      setGlobalColors(loadedColors);
      setGlobalFlavours(loadedFlavours);

      if (themeId) {
        const themesRes = await adminService.getCustomCakeThemes();
        const existingTheme = themesRes.data.data.find(t => t._id === themeId);
        if (existingTheme) {
          setTheme({
            ...existingTheme,
            category: existingTheme.category || [],
            hasWeights: existingTheme.hasWeights !== undefined ? Boolean(existingTheme.hasWeights) : true,
            enabledStandardWeights: Array.isArray(existingTheme.enabledStandardWeights) && existingTheme.enabledStandardWeights.length > 0
              ? existingTheme.enabledStandardWeights
              : ['1kg', '1.5kg', '2kg', '2.5kg', '3kg'],
            hasCustomWeights: Boolean(existingTheme.hasCustomWeights),
            customWeightPrices: Array.isArray(existingTheme.customWeightPrices) ? existingTheme.customWeightPrices : [],
            flavors: existingTheme.flavors || [],
            colors: existingTheme.colors || []
          });
          setThemeColors(existingTheme.colors || []);
        }
      } else {
        // New theme: auto-select all flavours by default, colors start empty until selected/configured
        setTheme(prev => ({
          ...prev,
          flavors: loadedFlavours.map(f => ({ name: f.name, category: f.category, isActive: true, weights: f.weights })),
          colors: []
        }));
      }
    } catch (error) {
      console.error('Error loading theme builder data:', error);
      toast.error('Failed to load theme data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTheme = async () => {
    if (!theme.name.trim()) return toast.error('Theme name is required');
    try {
      setSaving(true);
      let savedThemeId = themeId;
      
      // Save or Create Theme
      if (themeId) {
        await adminService.updateCustomCakeTheme(themeId, theme);
      } else {
        const res = await adminService.createCustomCakeTheme(theme);
        savedThemeId = res.data.data._id;
      }

      // Fetch the fresh theme to get the newly generated color IDs
      const freshThemesRes = await adminService.getCustomCakeThemes();
      const freshTheme = freshThemesRes.data?.data?.find(t => t._id === savedThemeId);
      if (freshTheme) {
        setTheme(freshTheme);
      }

      // Upload or process pending color images / deletions
      const currentColors = freshTheme?.colors || (themeId ? theme.colors : []) || [];
      const uploadEntries = Object.entries(pendingColorMappings);
      
      if (uploadEntries.length > 0) {
        toast.loading('Processing images...', { id: 'upload-toast' });
        for (const [colorName, data] of uploadEntries) {
          const colorRecord = currentColors.find(c => c.name === colorName);
          if (!colorRecord || !colorRecord._id) continue;

          const hasFilesToUpload = data.files?.tier1 || data.files?.tier2 || data.files?.tier3;
          const hasRemovals = data.removedTiers?.tier1 || data.removedTiers?.tier2 || data.removedTiers?.tier3;

          if (!hasFilesToUpload && !hasRemovals && (data.price === undefined || data.price === '')) continue;

          const formData = new FormData();
          formData.append('price', data.price !== undefined && data.price !== '' ? data.price : (colorRecord.price || 0));
          
          if (data.files?.tier1) formData.append('tier1Image', data.files.tier1);
          else if (data.removedTiers?.tier1) formData.append('tier1Image', 'remove');

          if (data.files?.tier2) formData.append('tier2Image', data.files.tier2);
          else if (data.removedTiers?.tier2) formData.append('tier2Image', 'remove');

          if (data.files?.tier3) formData.append('tier3Image', data.files.tier3);
          else if (data.removedTiers?.tier3) formData.append('tier3Image', 'remove');

          await adminService.uploadCustomCakeThemeColorImages(savedThemeId, colorRecord._id, formData);
        }
        toast.success('Images saved successfully', { id: 'upload-toast' });
      }

      toast.success(themeId ? 'Theme updated successfully' : 'Theme created successfully');
      onBack();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  const handleSetPendingMapping = (colorName, files, price, removedTiers = {}) => {
    setPendingColorMappings(prev => ({
      ...prev,
      [colorName]: {
        files: { ...prev[colorName]?.files, ...files },
        removedTiers: { ...prev[colorName]?.removedTiers, ...removedTiers },
        price: price === '' ? '' : (parseFloat(price) || prev[colorName]?.price || ''),
        previewUrls: { 
          tier1: files.tier1 ? URL.createObjectURL(files.tier1) : prev[colorName]?.previewUrls?.tier1,
          tier2: files.tier2 ? URL.createObjectURL(files.tier2) : prev[colorName]?.previewUrls?.tier2,
          tier3: files.tier3 ? URL.createObjectURL(files.tier3) : prev[colorName]?.previewUrls?.tier3
        }
      }
    }));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
  };

  const handleFileInputChange = async (colorName, field, file) => {
    if (!file) return;

    let processedFile = file;
    let stats = null;
    try {
      processedFile = await compressImage(file);
      const originalSize = file.size;
      const optimizedSize = processedFile.size;
      const reduction = Math.max(0, ((1 - optimizedSize / originalSize) * 100)).toFixed(1);
      stats = { originalSize, optimizedSize, reduction };
    } catch (err) {
      console.warn('Compression fallback:', err);
    }

    const previewUrl = URL.createObjectURL(processedFile);

    // Update pending mappings state
    setPendingColorMappings(prev => {
      const current = prev[colorName] || { files: {}, price: '', previewUrls: {}, removedTiers: {}, imageStats: {} };
      return {
        ...prev,
        [colorName]: {
          ...current,
          files: { ...(current.files || {}), [field]: processedFile },
          previewUrls: { ...(current.previewUrls || {}), [field]: previewUrl },
          removedTiers: { ...(current.removedTiers || {}), [field]: false },
          imageStats: { ...(current.imageStats || {}), [field]: stats }
        }
      };
    });

    // Update local theme.colors image state immediately for visual feedback
    setTheme(prev => ({
      ...prev,
      colors: (prev.colors || []).map(c => {
        if (c.name === colorName) {
          return {
            ...c,
            images: {
              ...(c.images || {}),
              [field]: previewUrl
            }
          };
        }
        return c;
      })
    }));

    // If theme & color exist on server, upload directly so it persists immediately
    const color = (theme.colors || []).find(c => c.name === colorName);
    if (themeId && color?._id) {
      const toastId = `upload-${colorName}-${field}`;
      toast.loading(`Uploading ${field.toUpperCase()} image for ${colorName}...`, { id: toastId });
      try {
        const formData = new FormData();
        formData.append('price', color.price || 0);
        formData.append(`${field}Image`, processedFile);

        const res = await adminService.uploadCustomCakeThemeColorImages(themeId, color._id, formData);
        const savedColor = res.data.data;

        setTheme(prev => ({
          ...prev,
          colors: (prev.colors || []).map(c => c._id === color._id ? { ...c, price: savedColor.price, images: savedColor.images } : c)
        }));

        setPendingColorMappings(prev => {
          const current = prev[colorName];
          if (!current) return prev;
          const nextFiles = { ...(current.files || {}) };
          delete nextFiles[field];
          return {
            ...prev,
            [colorName]: { ...current, files: nextFiles }
          };
        });

        toast.success(`${field.toUpperCase()} image uploaded!`, { id: toastId });
      } catch (err) {
        toast.error(`Upload failed: ${err.response?.data?.message || err.message}`, { id: toastId });
      }
    }
  };

  const handleDeleteTierImage = async (colorName, field) => {
    if (!window.confirm(`Delete the ${field.toUpperCase()} image for ${colorName}?`)) return;

    const colorIndex = (theme.colors || []).findIndex(c => c.name === colorName);
    const color = (theme.colors || [])[colorIndex];

    // If theme & color exist in DB, send server delete request directly
    if (themeId && color?._id) {
      try {
        await adminService.deleteCustomCakeThemeColorTierImage(themeId, color._id, field);
        toast.success(`Deleted ${field.toUpperCase()} image`);
      } catch (err) {
        toast.error('Failed to delete image on server');
        return;
      }
    } else {
      toast.success(`Cleared ${field.toUpperCase()} image`);
    }

    // Clear image from local theme state
    setTheme(prev => ({
      ...prev,
      colors: (prev.colors || []).map(c => {
        if (c.name === colorName) {
          return {
            ...c,
            images: {
              ...(c.images || {}),
              [field]: null
            }
          };
        }
        return c;
      })
    }));

    // Clear from pending state & mark removedTiers flag
    setPendingColorMappings(prev => {
      const current = prev[colorName] || {};
      const files = { ...(current.files || {}) };
      const previewUrls = { ...(current.previewUrls || {}) };
      const removedTiers = { ...(current.removedTiers || {}) };
      
      delete files[field];
      delete previewUrls[field];
      removedTiers[field] = true;

      return {
        ...prev,
        [colorName]: {
          ...current,
          files,
          previewUrls,
          removedTiers,
          price: current.price || 0
        }
      };
    });
  };

  const isMappingReadyToSave = mapping => {
    if (!mapping) return false;
    const fileCount = Object.values(mapping.files || {}).filter(Boolean).length;
    const removeCount = Object.values(mapping.removedTiers || {}).filter(Boolean).length;
    return (fileCount > 0 || removeCount > 0) && (mapping.price || 0) >= 0;
  };

  const handlePriceInputChange = (colorName, price) => {
    setPendingColorMappings(prev => ({
      ...prev,
      [colorName]: {
        ...prev[colorName],
        files: prev[colorName]?.files || {},
        previewUrls: prev[colorName]?.previewUrls || {},
        removedTiers: prev[colorName]?.removedTiers || {},
        price: price === '' ? '' : parseFloat(price)
      }
    }));
  };

  const saveThemeColorMapping = async (colorName, filesOverride, price) => {
    const colorIndex = (theme.colors || []).findIndex(c => c.name === colorName);
    const color = (theme.colors || [])[colorIndex];
    const numericPrice = price === undefined || price === '' ? (color?.price || 0) : (parseFloat(price) || 0);

    const pending = pendingColorMappings[colorName] || {};
    const files = { ...(pending.files || {}), ...(filesOverride || {}) };
    const removedTiers = pending.removedTiers || {};

    if (!themeId || !color?._id) {
      if (numericPrice < 0) {
        throw new Error('Please enter a valid price before saving.');
      }
      handleSetPendingMapping(colorName, files, numericPrice, removedTiers);
      setTheme(prev => ({
        ...prev,
        colors: (prev.colors || []).map(c => {
          if (c.name === colorName) {
            return {
              ...c,
              price: numericPrice,
              images: {
                tier1: files.tier1 ? (pending.previewUrls?.tier1 || URL.createObjectURL(files.tier1)) : (removedTiers.tier1 ? null : c.images?.tier1),
                tier2: files.tier2 ? (pending.previewUrls?.tier2 || URL.createObjectURL(files.tier2)) : (removedTiers.tier2 ? null : c.images?.tier2),
                tier3: files.tier3 ? (pending.previewUrls?.tier3 || URL.createObjectURL(files.tier3)) : (removedTiers.tier3 ? null : c.images?.tier3),
              }
            };
          }
          return c;
        })
      }));
      return null;
    }

    if (numericPrice < 0) {
      throw new Error('Please enter a valid price before saving.');
    }

    const formData = new FormData();
    formData.append('price', numericPrice);
    
    if (files.tier1) formData.append('tier1Image', files.tier1);
    else if (removedTiers.tier1) formData.append('tier1Image', 'remove');

    if (files.tier2) formData.append('tier2Image', files.tier2);
    else if (removedTiers.tier2) formData.append('tier2Image', 'remove');

    if (files.tier3) formData.append('tier3Image', files.tier3);
    else if (removedTiers.tier3) formData.append('tier3Image', 'remove');

    const response = await adminService.uploadCustomCakeThemeColorImages(themeId, color._id, formData);
    const savedColor = response.data.data;

    setTheme(prev => {
      const next = { ...prev };
      next.colors = next.colors.map(c => c._id === color._id ? { ...c, price: savedColor.price, images: savedColor.images } : c);
      return next;
    });
    handleRemovePendingMapping(colorName);
    return savedColor;
  };

  const handleRemovePendingMapping = (colorName) => {
    setPendingColorMappings(prev => {
      const newState = { ...prev };
      delete newState[colorName];
      return newState;
    });
  };

  const handleApplyToAll = async (colorId) => {
    if (!window.confirm('Apply these images and price to all other colors in this theme? This will overwrite existing mappings.')) return;
    try {
      const response = await adminService.applyCustomCakeThemeColorToAll(theme._id, colorId);
      toast.success('Applied to all colors successfully');
      setTheme(prev => ({
        ...prev,
        colors: response.data.data
      }));
    } catch (err) {
      console.error(err);
      toast.error('Failed to apply to all colors');
    }
  };
  
  const handleDeleteThemeColor = async (tcId) => {
    if (!window.confirm('Are you sure you want to delete this mapped image?')) return;
    try {
      await adminService.deleteCustomCakeThemeColor(tcId);
      toast.success('Removed mapping');
      loadData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="p-8 text-center text-muted font-bold animate-pulse">Loading Theme Builder...</div>;

  return (
    <div className="space-y-8 bg-card rounded-2xl p-6 border border-border shadow-sm">
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h3 className="font-black text-heading text-xl flex items-center gap-2">
          <Sparkles className="text-primary" /> {themeId ? 'Edit Theme' : 'Create New Theme'}
        </h3>
        <div className="flex gap-3">
          <button onClick={onBack} className="px-4 py-2 text-sm font-black uppercase text-muted hover:bg-border/20 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSaveTheme} disabled={saving} aria-busy={saving} className="px-6 py-2 bg-primary text-button-text font-black text-sm uppercase tracking-widest rounded-xl hover:brightness-110 flex items-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Check size={16} />} 
            {saving ? 'Saving...' : 'Save Theme'}
          </button>
        </div>
      </div>

      {/* SECTION 1: THEME INFO */}
      <div className="space-y-4 bg-border/5 p-5 rounded-xl border border-border/50">
        <h4 className="font-black text-sm uppercase tracking-wider text-muted mb-2">1. Theme Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-muted uppercase">Theme Name</label>
            <input type="text" value={theme.name} onChange={e => setTheme({...theme, name: e.target.value})} className="w-full bg-input border border-input-border px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold" placeholder="e.g. Teddy Theme" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-muted uppercase">Theme Base Price (₹)</label>
            <input type="number" value={theme.basePrice || 0} onChange={e => setTheme({...theme, basePrice: parseFloat(e.target.value) || 0})} className="w-full bg-input border border-input-border px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="e.g. 500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-muted uppercase">Display Order</label>
            <input type="number" value={theme.displayOrder} onChange={e => setTheme({...theme, displayOrder: parseInt(e.target.value) || 0})} className="w-full bg-input border border-input-border px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-black text-muted uppercase">Description</label>
          <textarea value={theme.description} onChange={e => setTheme({...theme, description: e.target.value})} className="w-full bg-input border border-input-border px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold" rows="2" />
        </div>
        <div className="space-y-3">
          <label className="text-xs font-black text-muted uppercase">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.length > 0
              ? categories.map(c => {
                  const normalized = (c.name || '').toLowerCase();
                  const isSelected = (theme.category || []).includes(normalized);
                  return (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => {
                        const cats = theme.category || [];
                        setTheme({
                          ...theme,
                          category: isSelected
                            ? cats.filter(cat => cat !== normalized)
                            : [...cats, normalized]
                        });
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all border-2 ${
                        isSelected
                          ? 'bg-primary border-primary text-button-text shadow-lift'
                          : 'bg-input border-input-border text-muted hover:border-primary/50'
                      }`}
                    >
                      {c.label || c.name}
                    </button>
                  );
                })
              : <p className="text-xs text-muted italic">Loading categories...</p>
            }
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 bg-card border border-border rounded-2xl shadow-xs mt-3">
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full shrink-0 ${theme.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-heading block">Theme Stock Availability</span>
              <span className="text-[11px] font-bold text-muted">
                {theme.isActive ? '🟢 Stock is ON (Available for order)' : '🔴 Stock is OFF (Disabled for order)'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTheme(prev => ({ ...prev, isActive: !prev.isActive }))}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-2 shrink-0 ${
              theme.isActive
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            <span>{theme.isActive ? 'STOCK ON' : 'STOCK OFF'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: TIERS */}
      <div className="space-y-4 bg-border/5 p-5 rounded-xl border border-border/50">
        <h4 className="font-black text-sm uppercase tracking-wider text-muted mb-2">2. Tier Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['tier1', 'tier2', 'tier3'].map((tier, idx) => (
            <div key={tier} className="flex flex-col gap-3 p-4 bg-card border border-border rounded-xl">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm uppercase">Tier {idx + 1}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={theme.tiers?.[tier]?.isActive} onChange={e => setTheme({...theme, tiers: {...theme.tiers, [tier]: { ...theme.tiers?.[tier], isActive: e.target.checked }}})} />
                  <div className="w-10 h-5 bg-stone-500/30 dark:bg-stone-800 border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                </label>
              </div>
              {theme.tiers?.[tier]?.isActive && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted uppercase">Tier Adjustment Price (₹)</label>
                  <input type="number" value={theme.tiers?.[tier]?.price} onChange={e => setTheme({...theme, tiers: {...theme.tiers, [tier]: { ...theme.tiers?.[tier], price: parseFloat(e.target.value) || 0 }}})} className="w-full bg-input border border-input-border px-3 py-2 rounded-lg text-sm font-bold" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2.5: WEIGHT OPTIONS & PRICING CONFIG */}
      <div className="space-y-6 bg-border/5 p-5 rounded-xl border border-border/50">
        <div className="border-b border-border pb-3">
          <h4 className="font-black text-sm uppercase tracking-wider text-muted flex items-center gap-2">
            <Scale size={18} className="text-primary" />
            Weight Options & Pricing Config
          </h4>
          <p className="text-xs text-muted mt-1">Configure standard weight multipliers or custom weight & specific price combinations for this theme.</p>
        </div>

        {/* Standard Weight Options Toggle */}
        <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/50 shadow-sm">
          <div>
            <h4 className="font-black text-xs uppercase tracking-wider text-heading">Standard Weight Multipliers</h4>
            <p className="text-[11px] text-muted">Enable standard weight choices (1kg, 1.5kg, 2kg, 2.5kg, 3kg, etc.) scaling with base price.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="hasWeights"
              checked={theme.hasWeights !== false}
              onChange={(e) => {
                const checked = e.target.checked;
                setTheme(prev => ({
                  ...prev,
                  hasWeights: checked
                }));
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            <span className={`ml-3 text-xs font-black uppercase ${theme.hasWeights !== false ? 'text-primary' : 'text-muted'}`}>
              {theme.hasWeights !== false ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        {/* Granular Standard Weight Toggles */}
        {theme.hasWeights !== false && (
          <div className="p-4 bg-card rounded-2xl border border-border/50 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-xs uppercase tracking-wider text-heading">Allowed Standard Weight Multipliers</h4>
              <span className="text-[11px] text-muted font-bold">Turn ON or OFF individual standard weights for this theme</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { id: '1kg', label: '1 Kg' },
                { id: '1.5kg', label: '1.5 Kg' },
                { id: '2kg', label: '2 Kg' },
                { id: '2.5kg', label: '2.5 Kg' },
                { id: '3kg', label: '3 Kg' },
              ].map((sw) => {
                const currentEnabled = Array.isArray(theme.enabledStandardWeights) && theme.enabledStandardWeights.length > 0
                  ? theme.enabledStandardWeights
                  : ['1kg', '1.5kg', '2kg', '2.5kg', '3kg'];
                const isSelected = currentEnabled.includes(sw.id) || currentEnabled.includes(sw.label);
                return (
                  <button
                    key={sw.id}
                    type="button"
                    onClick={() => {
                      let nextList;
                      if (isSelected) {
                        nextList = currentEnabled.filter(x => x !== sw.id && x !== sw.label);
                      } else {
                        nextList = [...currentEnabled, sw.id];
                      }
                      setTheme(prev => ({
                        ...prev,
                        enabledStandardWeights: nextList
                      }));
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-primary border-primary text-button-text shadow-sm'
                        : 'bg-input border-input-border text-muted opacity-60 hover:opacity-100 hover:border-primary/50'
                    }`}
                  >
                    <span>{sw.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${isSelected ? 'bg-black/20 text-button-text' : 'bg-border text-muted'}`}>
                      {isSelected ? 'ON' : 'OFF'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Weight & Pricing Toggle */}
        <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/50 shadow-sm">
          <div>
            <h4 className="font-black text-xs uppercase tracking-wider text-heading">Custom Weight & Price Options</h4>
            <p className="text-[11px] text-muted">Set specific weights with custom fixed prices (e.g. 0.5kg = ₹1020, 0.75kg = ₹1450).</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="hasCustomWeights"
              checked={theme.hasCustomWeights || false}
              onChange={(e) => {
                const checked = e.target.checked;
                setTheme(prev => ({
                  ...prev,
                  hasCustomWeights: checked
                }));
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            <span className={`ml-3 text-xs font-black uppercase ${theme.hasCustomWeights ? 'text-primary' : 'text-muted'}`}>
              {theme.hasCustomWeights ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        {/* Custom Weight Prices List & Manager */}
        {theme.hasCustomWeights && (
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-4">
            <h4 className="font-black text-xs uppercase tracking-wider text-primary">Custom Weight & Price List</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newCustomWeight}
                onChange={(e) => setNewCustomWeight(e.target.value)}
                placeholder="Weight (e.g. 0.5kg, 0.75kg)"
                className="bg-input border border-input-border px-3 py-2 rounded-xl text-sm font-bold"
              />
              <input
                type="number"
                value={newCustomPrice}
                onChange={(e) => setNewCustomPrice(e.target.value)}
                placeholder="Price in ₹ (e.g. 1020)"
                className="bg-input border border-input-border px-3 py-2 rounded-xl text-sm font-bold"
              />
              <button
                type="button"
                onClick={handleAddCustomWeightPrice}
                className="flex items-center justify-center gap-2 bg-primary text-button-text px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider hover:brightness-110 transition-all"
              >
                <Plus size={16} /> Add Custom Option
              </button>
            </div>

            {(theme.customWeightPrices || []).length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {(theme.customWeightPrices || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl shadow-sm text-xs font-black text-heading">
                    <span className="text-primary">{item.weight}</span>
                    <span className="text-muted">→</span>
                    <span className="text-emerald-600 font-black">₹{item.price}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomWeightPrice(idx)}
                      className="ml-1 text-muted hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted italic">No custom weight options added yet. Add options above (e.g. 0.5kg - ₹1020).</p>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: COLORS & IMAGES (OPTIONAL) */}
      <div className="space-y-4 bg-border/5 p-5 rounded-xl border border-border/50">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider text-muted">3. Theme Colors & Images (Optional)</h4>
            <p className="text-xs text-muted">Select colors and add tier images if this theme has color options. If none added, default design is used.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => {
              setTheme(prev => ({
                ...prev,
                colors: globalColors.map(c => {
                  const existing = (prev.colors || []).find(tc => tc.name === c.name);
                  if (existing) return existing;
                  const { _id, __v, createdAt, updatedAt, ...rest } = c;
                  return { ...rest, price: 0, images: { tier1: null, tier2: null, tier3: null } };
                })
              }));
            }} className="text-[10px] font-black uppercase tracking-wider text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">Select All</button>
            <button type="button" onClick={() => {
              if (window.confirm('Deselect all colors? This will remove any pending images.')) {
                setTheme(prev => ({ ...prev, colors: [] }));
                setPendingColorMappings({});
              }
            }} className="text-[10px] font-black uppercase tracking-wider text-muted border border-border px-3 py-1.5 rounded-lg hover:bg-border/20 transition-colors">Deselect All</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {globalColors.map((gColor) => {
            const isSelected = (theme.colors || []).some(c => c.name === gColor.name);
            const themeColor = (theme.colors || []).find(c => c.name === gColor.name) || gColor;
            
            const hasImages = isSelected && (themeColor.images?.tier1 || themeColor.images?.tier2 || themeColor.images?.tier3);
            const pending = pendingColorMappings[gColor.name];
            
            return (
              <div key={gColor._id} className={`p-4 bg-card border rounded-xl flex flex-col gap-3 relative overflow-hidden transition-all ${isSelected ? 'border-primary ring-1 ring-primary/30' : 'border-border'}`}>
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: gColor.hexCode }}></div>
                <div className="flex justify-between items-center pl-2">
                  <label className="flex items-center gap-2 cursor-pointer font-black text-sm w-full">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary rounded border-input-border bg-input cursor-pointer"
                      checked={isSelected}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                          setTheme(prev => {
                            const { _id, __v, createdAt, updatedAt, ...rest } = gColor;
                            return {
                              ...prev,
                              colors: [...(prev.colors || []), { ...rest, price: 0, images: { tier1: null, tier2: null, tier3: null } }]
                            };
                          });
                        } else {
                          if (hasImages || pending) {
                            if (!window.confirm(`Remove ${gColor.name} and all its images/prices from this theme?`)) return;
                          }
                          setTheme(prev => ({
                            ...prev,
                            colors: (prev.colors || []).filter(c => c.name !== gColor.name)
                          }));
                          if (pending) handleRemovePendingMapping(gColor.name);
                        }
                      }}
                    />
                    {gColor.name}
                  </label>
                  
                  {isSelected && (hasImages || pending) && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setEditingMappingName(gColor.name)}
                        className="text-muted hover:text-heading hover:bg-border/30 p-1.5 rounded transition-colors"
                        title="Edit base price"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                
                {isSelected && (
                  editingMappingName !== gColor.name ? (
                    <div className="flex flex-col gap-2 pl-2">
                      <div className="grid grid-cols-3 gap-2">
                        {['tier1', 'tier2', 'tier3'].map((tierKey, idx) => {
                          if (!theme.tiers?.[tierKey]?.isActive) return null;
                          const currentImg = pending?.previewUrls?.[tierKey] || themeColor.images?.[tierKey];
                          const stats = pending?.imageStats?.[tierKey];
                          return (
                            <div key={tierKey} className="flex flex-col gap-1">
                              <div className="h-28 bg-border/20 rounded-xl overflow-hidden flex flex-col items-center justify-center relative group border border-border/50">
                                <span className="absolute top-1 left-1 text-[9px] font-black uppercase bg-black/60 text-white px-1.5 py-0.5 rounded z-10">T{idx+1}</span>
                                {currentImg ? (
                                  <>
                                    <img src={currentImg} alt={`Tier ${idx+1}`} className="h-full w-full object-contain p-1" />
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-20">
                                      <label title="Change / Update image" className="p-1.5 bg-primary text-button-text rounded-lg cursor-pointer hover:scale-105 transition-transform shadow-xs flex items-center justify-center">
                                        <UploadCloud size={14} />
                                        <input type="file" accept="image/*" className="hidden" onChange={async e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) await handleFileInputChange(gColor.name, tierKey, file); }} />
                                      </label>
                                      <button 
                                        type="button" 
                                        onClick={() => handleDeleteTierImage(gColor.name, tierKey)} 
                                        className="p-1.5 bg-rose-600 text-white rounded-lg hover:scale-105 transition-transform shadow-xs cursor-pointer flex items-center justify-center" 
                                        title="Delete image"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <label className="w-full h-full flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-primary/10 transition-colors p-2 text-center text-muted hover:text-primary">
                                    <Plus size={16} />
                                    <span className="text-[9px] font-black uppercase">Add Img</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={async e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) await handleFileInputChange(gColor.name, tierKey, file); }} />
                                  </label>
                                )}
                              </div>
                              {stats && (
                                <div className="mt-1 text-left w-full">
                                  <p className="text-[9px] font-black text-secondary uppercase tracking-wider mb-0.5">Image optimized</p>
                                  <div className="rounded-lg bg-input border border-input-border p-1.5 text-[9px] font-bold space-y-0.5 text-heading shadow-xs">
                                    <p>Original Size: {formatFileSize(stats.originalSize)}</p>
                                    <p>Optimized Size: {formatFileSize(stats.optimizedSize)}</p>
                                    <p>Reduction: {stats.reduction}%</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between items-center bg-input px-3 py-2 rounded-lg border border-input-border">
                        <span className="text-xs font-black text-muted uppercase">Base Price</span>
                        <span className="font-black text-primary">₹{pending?.price ?? themeColor.price ?? 0}</span>
                      </div>
                      {themeColor._id && hasImages && !pending && (
                        <button 
                          onClick={() => handleApplyToAll(themeColor._id)}
                          className="w-full mt-1 py-1.5 bg-secondary text-white rounded font-bold text-xs hover:bg-secondary/90 transition-colors cursor-pointer"
                        >
                          Apply to All Colors
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="pl-2 flex flex-col gap-2">
                      <form onSubmit={async e => {
                        e.preventDefault();
                        const price = e.target.price.value;
                        const pendingFiles = pending?.files || {};
                        const files = { ...pendingFiles };
                        if (theme.tiers?.tier1?.isActive && e.target.tier1Image?.files[0]) files.tier1 = e.target.tier1Image.files[0];
                        if (theme.tiers?.tier2?.isActive && e.target.tier2Image?.files[0]) files.tier2 = e.target.tier2Image.files[0];
                        if (theme.tiers?.tier3?.isActive && e.target.tier3Image?.files[0]) files.tier3 = e.target.tier3Image.files[0];
                        try {
                          await saveThemeColorMapping(gColor.name, files, price);
                          toast.success('Mapping saved');
                          setEditingMappingName(null);
                        } catch (error) {
                          toast.error(error.message || error.response?.data?.message || 'Failed to save mapping');
                        }
                      }} className="flex flex-col gap-2">
                        <div className="grid grid-cols-3 gap-2">
                          {['tier1', 'tier2', 'tier3'].map((tierKey, idx) => {
                            if (!theme.tiers?.[tierKey]?.isActive) return null;
                            const currentImg = pending?.previewUrls?.[tierKey] || themeColor.images?.[tierKey];
                            const stats = pending?.imageStats?.[tierKey];
                            return (
                              <div key={tierKey} className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-muted uppercase">Tier {idx+1}</span>
                                {currentImg ? (
                                  <div className="h-24 bg-border/20 rounded-xl overflow-hidden relative group border border-border/60 flex items-center justify-center">
                                    <img src={currentImg} alt={`T${idx+1}`} className="h-full w-full object-contain p-1" />
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 z-20">
                                      <label className="px-2 py-1 bg-primary text-button-text rounded-md text-[9px] font-black uppercase cursor-pointer hover:scale-105 transition-all shadow-xs flex items-center gap-1">
                                        <UploadCloud size={12} /> Replace
                                        <input type="file" name={`${tierKey}Image`} accept="image/*" className="hidden" onChange={async e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) await handleFileInputChange(gColor.name, tierKey, file); }} />
                                      </label>
                                      <button 
                                        type="button" 
                                        onClick={() => handleDeleteTierImage(gColor.name, tierKey)} 
                                        className="px-2 py-1 bg-rose-600 text-white rounded-md text-[9px] font-black uppercase hover:scale-105 transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                      >
                                        <Trash2 size={12} /> Delete
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <label className="h-24 bg-input border-2 border-dashed border-input-border rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all p-2 text-center text-muted hover:text-primary">
                                    <ImageIcon size={18} />
                                    <span className="text-[10px] font-black uppercase">+ Tier {idx+1}</span>
                                    <input type="file" name={`${tierKey}Image`} accept="image/*" className="hidden" onChange={async e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) await handleFileInputChange(gColor.name, tierKey, file); }} />
                                  </label>
                                )}
                                {stats && (
                                  <div className="mt-1 text-left w-full">
                                    <p className="text-[9px] font-black text-secondary uppercase tracking-wider mb-0.5">Image optimized</p>
                                    <div className="rounded-lg bg-input border border-input-border p-1.5 text-[9px] font-bold space-y-0.5 text-heading shadow-xs">
                                      <p>Original Size: {formatFileSize(stats.originalSize)}</p>
                                      <p>Optimized Size: {formatFileSize(stats.optimizedSize)}</p>
                                      <p>Reduction: {stats.reduction}%</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {!theme.tiers?.tier1?.isActive && !theme.tiers?.tier2?.isActive && !theme.tiers?.tier3?.isActive && (
                            <span className="col-span-3 text-xs text-muted text-center py-4">No tiers enabled for this theme.</span>
                          )}
                        </div>
                        <input type="number" name="price" value={pending?.price !== undefined ? pending.price : (themeColor.price || '')} placeholder="Base Price (₹)" required onChange={e => handlePriceInputChange(gColor.name, e.target.value)} className="w-full text-sm font-bold bg-input border border-input-border px-3 py-2 rounded-lg outline-none focus:border-primary/50" />
                        <div className="flex gap-2">
                          <button type="submit" disabled={
                            (!theme.tiers?.tier1?.isActive && !theme.tiers?.tier2?.isActive && !theme.tiers?.tier3?.isActive) ||
                            !(parseFloat(pending?.price !== undefined ? pending.price : themeColor.price) >= 0)
                          } className="flex-1 bg-primary text-button-text px-3 py-2 rounded-lg text-[10px] font-black uppercase hover:brightness-110 disabled:opacity-50">
                            {editingMappingName === gColor.name ? 'Update' : 'Add Mapping'}
                          </button>
                          {editingMappingName === gColor.name && (
                            <button type="button" onClick={() => setEditingMappingName(null)} className="px-3 py-2 bg-input border border-input-border rounded-lg text-[10px] font-black uppercase hover:bg-border/30">Cancel</button>
                          )}
                        </div>
                      </form>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: FLAVOURS */}
      <div className="space-y-4 bg-border/5 p-5 rounded-xl border border-border/50">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider text-muted">4. Theme-Specific Flavours & Weights</h4>
            <p className="text-xs font-bold text-muted mt-1">Select and manage the flavours available exclusively for this theme.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => {
              setTheme(prev => ({
                ...prev,
                flavors: globalFlavours.map(f => {
                  const existing = (prev.flavors || []).find(tf => tf.name === f.name);
                  return existing || { name: f.name, category: f.category, isActive: true, weights: f.weights };
                })
              }));
            }} className="text-[10px] font-black uppercase tracking-wider text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">Select All</button>
            <button type="button" onClick={() => {
              if (window.confirm('Deselect all flavours from this theme?')) {
                setTheme(prev => ({ ...prev, flavors: [] }));
              }
            }} className="text-[10px] font-black uppercase tracking-wider text-muted border border-border px-3 py-1.5 rounded-lg hover:bg-border/20 transition-colors">Deselect All</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-2 mt-4">
          {globalFlavours.map((gFlavour) => {
            const isSelected = (theme.flavors || []).some(f => f.name === gFlavour.name);
            const themeFlavour = (theme.flavors || []).find(f => f.name === gFlavour.name) || gFlavour;

            return (
              <div key={gFlavour._id} className={`p-4 bg-card border rounded-xl flex flex-col gap-3 relative overflow-hidden transition-all ${isSelected ? 'border-primary ring-1 ring-primary/30' : 'border-border'}`}>
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 cursor-pointer font-black text-sm w-full">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary rounded border-input-border bg-input cursor-pointer"
                      checked={isSelected}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                          setTheme(prev => ({
                            ...prev,
                            flavors: [...(prev.flavors || []), { name: gFlavour.name, category: gFlavour.category, isActive: true, weights: gFlavour.weights }]
                          }));
                        } else {
                          if (!window.confirm(`Remove ${gFlavour.name} from this theme?`)) return;
                          
                          setTheme(prev => ({
                            ...prev,
                            flavors: (prev.flavors || []).filter(f => f.name !== gFlavour.name)
                          }));
                        }
                      }}
                    />
                    <span className="uppercase tracking-wider">{gFlavour.name}</span>
                  </label>
                  {isSelected && (
                    <button 
                      onClick={() => setEditingFlavourName(editingFlavourName === gFlavour.name ? null : gFlavour.name)}
                      className="p-1.5 hover:bg-border/30 rounded-lg text-muted hover:text-heading transition-colors"
                      title="Edit Prices"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>

                {isSelected && (
                  editingFlavourName === gFlavour.name ? (
                    <div className="pt-3 border-t border-border mt-2">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const basePrice = parseFloat(e.target.basePrice.value);
                        if (isNaN(basePrice) || basePrice < 0) return toast.error('Invalid base price');
                        
                        const newWeights = [
                          { kg: 1, price: basePrice },
                          { kg: 1.5, price: basePrice * 1.5 },
                          { kg: 2, price: basePrice * 2 },
                          { kg: 2.5, price: basePrice * 2.5 },
                          { kg: 3, price: basePrice * 3 },
                        ];

                        setTheme(prev => ({
                          ...prev,
                          flavors: prev.flavors.map(f => f.name === gFlavour.name ? { ...f, weights: newWeights } : f)
                        }));
                        setEditingFlavourName(null);
                        toast.success('Prices updated');
                      }}>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-primary uppercase">1 Kg Base Price (₹)</label>
                          <input type="number" name="basePrice" defaultValue={themeFlavour.weights?.find(w => w.kg === 1)?.price || 0} required className="w-full bg-input border border-primary/30 px-3 py-2 rounded-lg focus:ring-1 focus:ring-primary outline-none font-bold text-sm" />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button type="submit" className="flex-1 bg-primary text-button-text px-3 py-2 rounded-lg text-[10px] font-black uppercase hover:brightness-110">
                            Save Prices
                          </button>
                          <button type="button" onClick={() => setEditingFlavourName(null)} className="px-3 py-2 bg-input border border-input-border rounded-lg text-[10px] font-black uppercase hover:bg-border/30">
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-primary font-black block">Base: ₹{themeFlavour.weights?.find(w => w.kg === 1)?.price || 0}</span>
                          <span className="text-muted text-[10px] uppercase">Up to ₹{themeFlavour.weights?.find(w => w.kg === 3)?.price || 0} (3Kg)</span>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default ThemeBuilder;
