import React from 'react';
import { Star, Check, RotateCcw } from 'lucide-react';

const FilterSidebar = ({ activeFilters, onApply, onReset }) => {
  const sections = [
    {
      id: 'sort',
      label: 'Sort By',
      options: [
        { value: 'popular', label: 'Popularity' },
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Rating' },
      ]
    },
    {
      id: 'price',
      label: 'Price Range',
      options: [
        { value: '0-500', label: 'Under ₹500' },
        { value: '500-1000', label: '₹500 - ₹1000' },
        { value: '1000-2000', label: '₹1000 - ₹2000' },
        { value: '2000+', label: 'Over ₹2000' },
      ]
    },
    {
      id: 'dietary',
      label: 'Dietary',
      options: [
        { value: 'veg', label: 'Pure Veg' },
        { value: 'eggless', label: 'Eggless' },
      ]
    }
  ];

  const handleToggle = (sectionId, value) => {
    const current = activeFilters[sectionId] || [];
    const updated = current.includes(value) 
      ? current.filter(v => v !== value) 
      : [...current, value];
    onApply({ ...activeFilters, [sectionId]: updated });
  };

  return (
    <aside className="hidden lg:block w-72 bg-white dark:bg-card rounded-sm shadow-sm border border-border/10 h-fit sticky top-[100px]">
      <div className="p-4 border-b border-border/30 flex items-center justify-between">
        <h2 className="text-base font-black text-heading uppercase tracking-tighter">Filters</h2>
        <button 
          onClick={onReset}
          className="text-[10px] font-black text-primary hover:text-secondary uppercase tracking-widest flex items-center gap-1"
        >
          <RotateCcw size={12} /> Clear All
        </button>
      </div>

      <div className="divide-y divide-border/30">
        {sections.map((section) => (
          <div key={section.id} className="p-4 py-6">
            <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-4">{section.label}</h3>
            <div className="space-y-3">
              {section.options.map((opt) => {
                const isActive = activeFilters[section.id]?.includes(opt.value);
                return (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                    <div 
                      onClick={() => handleToggle(section.id, opt.value)}
                      className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all ${
                        isActive ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'
                      }`}
                    >
                      {isActive && <Check size={12} className="text-white" strokeWidth={4} />}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-tight transition-colors ${
                      isActive ? 'text-primary' : 'text-heading/70 group-hover:text-heading'
                    }`}>
                      {opt.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {/* Rating Filter Special */}
        <div className="p-4 py-6">
          <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-4">Customer Ratings</h3>
          <div className="space-y-3">
            {[4, 3, 2].map((rating) => (
              <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="hidden" />
                <div className="w-4 h-4 rounded-sm border-2 border-border group-hover:border-primary/50 flex items-center justify-center" />
                <span className="text-xs font-bold text-heading/70 flex items-center gap-1">
                  {rating}★ & above
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
