import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const styles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/15 text-success',
    error: 'bg-error/15 text-error',
    secondary: 'bg-secondary/15 text-secondary',
    warning: 'bg-star/15 text-star',
    info: 'bg-primary/15 text-primary',
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
