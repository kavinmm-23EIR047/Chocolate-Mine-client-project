import React from 'react';
import { motion } from 'framer-motion';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = PackageOpen, 
  title = "No items found", 
  message = "There are no records or products to show here right now.", 
  action 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center neo-card bg-card-soft/60 border border-border/50 rounded-3xl my-6 max-w-lg mx-auto"
    >
      <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mb-5 shadow-sm border border-border/40 text-secondary">
        <Icon size={38} className="text-secondary" />
      </div>
      <h3 className="text-xl font-bold text-heading mb-2">{title}</h3>
      <p className="text-sm text-muted max-w-md leading-relaxed mb-6">{message}</p>
      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
