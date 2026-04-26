import React from 'react';
import { motion } from 'framer-motion';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ icon: Icon = PackageOpen, title, message, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 bg-border/40 rounded-full flex items-center justify-center mb-6">
        <Icon size={36} className="text-muted" />
      </div>
      <h3 className="text-lg font-bold text-heading mb-2">{title}</h3>
      <p className="text-sm text-muted max-w-md mb-6">{message}</p>
      {action && action}
    </motion.div>
  );
};

export default EmptyState;
