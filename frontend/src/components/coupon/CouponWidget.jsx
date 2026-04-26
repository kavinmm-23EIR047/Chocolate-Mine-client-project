import React from 'react';
import { Ticket, Percent, ChevronRight, Zap } from 'lucide-react';

const CouponWidget = ({ coupons = [], onApply }) => {
  if (!coupons || coupons.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-black text-heading uppercase tracking-[0.2em] flex items-center gap-2">
          <Ticket size={14} className="text-secondary" /> Available Offers
        </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {coupons.map((coupon, i) => (
          <div 
            key={i} 
            className="group relative bg-white dark:bg-card border-2 border-dashed border-secondary/30 rounded-sm p-4 hover:border-secondary hover:bg-secondary/5 transition-all cursor-pointer"
            onClick={() => onApply(coupon.code)}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-primary uppercase tracking-tighter">{coupon.code}</span>
                  <span className="bg-success/10 text-success text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest">Active</span>
                </div>
                <p className="text-xs font-bold text-heading leading-tight">{coupon.description}</p>
                <p className="text-[9px] font-black text-muted uppercase mt-2 tracking-widest flex items-center gap-1">
                   <Zap size={10} className="text-secondary" /> T&C Apply
                </p>
              </div>
              <ChevronRight size={16} className="text-muted group-hover:text-secondary group-hover:translate-x-1 transition-all" />
            </div>
            
            {/* Cutout dots */}
            <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-3 h-3 bg-background rounded-full border-r border-border/50" />
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-3 bg-background rounded-full border-l border-border/50" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CouponWidget;
