import React from 'react';

const PureVegBadge = ({ size = 22, className = '', hideText = false }) => {
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Official FSSAI Pure Veg Mark: Green Square Box + Green Centered Circle */}
      <span
        style={{ width: `${size}px`, height: `${size}px` }}
        className="inline-flex items-center justify-center border-[2px] border-[#008539] bg-white rounded-[3px] shrink-0 p-[2.5px] shadow-xs"
        title="100% Pure Veg"
      >
        <span className="w-full h-full bg-[#008539] rounded-full" />
      </span>

      {!hideText && (
        <span className="text-xs font-bold uppercase tracking-wider text-[#008539] dark:text-emerald-400">
          Pure Veg
        </span>
      )}
    </span>
  );
};

export default PureVegBadge;