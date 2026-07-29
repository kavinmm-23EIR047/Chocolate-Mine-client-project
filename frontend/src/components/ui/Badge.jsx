import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const styles = {
    default: 'bg-zinc-800 text-white font-bold border border-zinc-700 shadow-xs',
    success: 'bg-emerald-700 text-white font-bold border border-emerald-600 shadow-xs',
    error: 'bg-rose-700 text-white font-bold border border-rose-600 shadow-xs',
    secondary: 'bg-amber-700 text-white font-bold border border-amber-600 shadow-xs',
    warning: 'bg-amber-600 text-white font-bold border border-amber-500 shadow-xs',
    info: 'bg-sky-700 text-white font-bold border border-sky-600 shadow-xs',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full
        ${styles[variant] || styles.default}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
