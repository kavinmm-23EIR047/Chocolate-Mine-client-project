import React from 'react';
import { Truck } from 'lucide-react';

const Loader = ({ fullPage = false }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${fullPage ? 'fixed inset-0 bg-[var(--background)]/80 backdrop-blur-sm z-[9999]' : 'h-64'}`}>
      <div className="relative w-64 h-2 bg-[var(--border)] rounded-full overflow-hidden">
        <div className="absolute top-0 h-full w-12 bg-[var(--secondary)] rounded-full scooter-animation"></div>
      </div>
      <div className="flex items-center gap-2 text-[var(--primary)] font-bold animate-pulse">
        <Truck className="animate-bounce" />
        <span>Delivering Happiness...</span>
      </div>
    </div>
  );
};

export default Loader;
