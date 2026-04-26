import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-primary text-button-text hover:opacity-90 active:scale-95 transition-all',
  secondary: 'bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary/20',
  danger: 'bg-error/10 text-error border border-error/30 hover:bg-error/20',
  success: 'bg-success/10 text-success border border-success/30 hover:bg-success/20',
  ghost: 'bg-transparent hover:bg-border text-body',
  outline: 'bg-transparent border border-input-border text-body hover:bg-input',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-md
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || isLoading || loading}
      {...props}
    >
      {(isLoading || loading) ? (
        <Loader2 size={16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
