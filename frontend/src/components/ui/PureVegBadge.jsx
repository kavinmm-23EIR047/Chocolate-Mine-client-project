import React from 'react';

const PureVegLabel = ({ size = 12, className = '', hideText = false }) => {
  return (
    <span
      className={`inline-flex items-center ${hideText ? 'p-1' : 'gap-1.5 px-2.5 py-1'
        } bg-[#008539] text-white rounded-full font-sans shrink-0 select-none shadow-sm ${className}`}
    >
      {/* Veg Symbol: White Outer Square with White Inner Dot */}
      <span
        style={{ width: `${size}px`, height: `${size}px` }}
        className="flex items-center justify-center border-2 border-white rounded-[2px] shrink-0 p-[2px]"
      >
        {/* Solid White Inner Dot */}
        <span className="w-full h-full bg-white rounded-full" />
      </span>

      {/* Bold White Text */}
      {!hideText && (
        <span className="text-[10px] font-black uppercase tracking-wider leading-none text-white">
          Pure Veg
        </span>
      )}
    </span>
  );
};

export default PureVegLabel;