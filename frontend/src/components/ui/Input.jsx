import React from 'react';

const Input = React.forwardRef(
  ({ label, error, icon: Icon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-semibold text-heading">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
          )}
          <input
            ref={ref}
            className={`
              w-full bg-input border border-input-border text-body
              px-4 py-2.5 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary
              transition-all duration-200
              placeholder:text-muted/60
              disabled:opacity-50 disabled:cursor-not-allowed
              ${Icon ? 'pl-10' : ''}
              ${error ? 'border-error ring-1 ring-error/30' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-error font-medium mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
