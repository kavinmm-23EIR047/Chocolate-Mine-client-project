import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, Scissors, CheckCircle2, Gift } from 'lucide-react';

const CouponCard = ({ coupon, onApply, isApplied, isSelectable = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative p-6 rounded-md border-2 border-dashed transition-all ${
        isApplied 
          ? 'border-success bg-success/5 shadow-inner' 
          : 'border-secondary/30 bg-secondary/5 hover:border-secondary hover:bg-secondary/10'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-md flex items-center justify-center shadow-lg ${
            isApplied ? 'bg-success text-white' : 'bg-secondary text-white'
          }`}>
            {isApplied ? <CheckCircle2 size={24} /> : <Ticket size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-heading uppercase tracking-tighter leading-none">
                {coupon.code}
              </h3>
              {isApplied && (
                <span className="bg-success/20 text-success text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                  Applied
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-muted mt-2">
              {coupon.description || `Get ${coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '₹' + coupon.discountValue} OFF on your order.`}
            </p>
          </div>
        </div>

        {isSelectable && !isApplied && (
          <button
            onClick={() => onApply(coupon.code)}
            className="px-4 py-2 bg-primary text-button-text text-[10px] font-black rounded-md shadow-md hover:bg-secondary transition-all uppercase tracking-widest"
          >
            Apply
          </button>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[9px] font-bold text-muted uppercase tracking-widest">
          <Gift size={12} className="text-secondary" />
          {coupon.minPurchase ? `Min order: ₹${coupon.minPurchase}` : 'No min order'}
        </div>
        <div className="text-[9px] font-bold text-muted uppercase tracking-widest">
          Expires: {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}
        </div>
      </div>

      {/* Decorative Cutout Dots */}
      <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-background rounded-full border-r border-border/50 shadow-inner" />
      <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-background rounded-full border-l border-border/50 shadow-inner" />
    </motion.div>
  );
};

export default CouponCard;
