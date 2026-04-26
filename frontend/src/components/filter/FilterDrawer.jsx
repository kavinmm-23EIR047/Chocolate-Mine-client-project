import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Check, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';

const FilterDrawer = ({ isOpen, onClose, filters, onApply, onReset }) => {
  const [tempFilters, setTempFilters] = useState(filters || {});

  const filterSections = [
    {
      id: 'sort',
      label: 'Sort By',
      options: [
        { value: 'popular', label: 'Popularity' },
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Rating: High to Low' },
        { value: 'discount', label: 'Discount: High to Low' },
      ]
    },
    {
      id: 'dietary',
      label: 'Dietary Preference',
      options: [
        { value: 'veg', label: 'Pure Veg' },
        { value: 'eggless', label: 'Eggless Only' },
      ]
    },
    {
      id: 'delivery',
      label: 'Delivery Type',
      options: [
        { value: 'fast', label: 'Fast Delivery (< 45 mins)' },
        { value: 'scheduled', label: 'Scheduled Delivery' },
      ]
    },
    {
      id: 'price',
      label: 'Price Range',
      options: [
        { value: '0-250', label: 'Less than ₹250' },
        { value: '250-500', label: '₹250 - ₹500' },
        { value: '500-1000', label: '₹500 - ₹1000' },
        { value: '1000+', label: 'Above ₹1000' },
      ]
    }
  ];

  const handleToggle = (section, value) => {
    setTempFilters(prev => {
      const current = prev[section] || [];
      const updated = current.includes(value) 
        ? current.filter(v => v !== value) 
        : [...current, value];
      return { ...prev, [section]: updated };
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-card z-[160] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-heading uppercase tracking-tighter">Filters</h2>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Refine your dessert selection</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted/10 rounded-md transition-all">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-10">
              {filterSections.map((section) => (
                <div key={section.id}>
                  <h3 className="text-xs font-black text-heading uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    {section.label}
                    <div className="flex-1 h-[1px] bg-border/50" />
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {section.options.map((opt) => {
                      const isActive = tempFilters[section.id]?.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleToggle(section.id, opt.value)}
                          className={`flex items-center justify-between p-4 rounded-md border-2 transition-all ${
                            isActive 
                              ? 'border-secondary bg-secondary/5 text-secondary shadow-sm' 
                              : 'border-border/50 hover:border-border text-muted'
                          }`}
                        >
                          <span className="text-sm font-black uppercase tracking-tight">{opt.label}</span>
                          {isActive && <Check size={18} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-muted/5 grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="py-4 font-black tracking-widest uppercase text-xs gap-2"
                onClick={() => { setTempFilters({}); onReset(); }}
              >
                <RotateCcw size={16} />
                Clear All
              </Button>
              <Button 
                className="py-4 font-black tracking-widest uppercase text-xs shadow-premium"
                onClick={() => { onApply(tempFilters); onClose(); }}
              >
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterDrawer;
