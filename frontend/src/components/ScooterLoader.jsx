import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Minimal delivery scooter — fewer strokes, reads clearly at small sizes.
 */
const ScooterMark = () => (
  <svg
    viewBox="0 0 120 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full max-h-[4.5rem]"
    aria-hidden="true"
  >
    {/* Wheels */}
    <motion.g
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
      style={{ transformOrigin: '28px 52px' }}
    >
      <circle cx="28" cy="52" r="11" stroke="var(--primary)" strokeWidth="2.5" fill="var(--card)" />
      <circle cx="28" cy="52" r="3" fill="var(--primary)" />
    </motion.g>
    <motion.g
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
      style={{ transformOrigin: '92px 52px' }}
    >
      <circle cx="92" cy="52" r="11" stroke="var(--primary)" strokeWidth="2.5" fill="var(--card)" />
      <circle cx="92" cy="52" r="3" fill="var(--primary)" />
    </motion.g>
    {/* Deck */}
    <path
      d="M34 48h52c4 0 8 3 9 7l2 6H36l-2-6z"
      fill="var(--card)"
      stroke="var(--border)"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Seat & box */}
    <rect x="38" y="36" width="22" height="12" rx="2" fill="var(--primary)" opacity="0.92" />
    <rect x="58" y="30" width="28" height="14" rx="3" fill="var(--secondary)" />
    {/* Rider hint */}
    <circle cx="78" cy="22" r="9" fill="var(--accent)" opacity="0.85" />
    <path d="M72 34c4 2 8 2 12 0" stroke="var(--card)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    {/* Handlebar */}
    <path d="M88 28h12" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ScooterLoader = ({ isVisible, text = 'Preparing your order…' }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-busy="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background/85 backdrop-blur-[10px]"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="w-full max-w-[320px] rounded-2xl border border-border/50 bg-card/95 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] px-8 py-10 text-center"
          >
            {/* Soft track */}
            <div className="relative mx-auto mb-8 h-16 w-full max-w-[200px]">
              <div className="absolute bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <motion.div
                className="absolute bottom-[7px] left-0 h-[2px] w-12 rounded-full bg-primary/40"
                animate={{ x: [-8, 168] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }}
              />
              <motion.div
                className="absolute bottom-3 left-1/2 w-[7.5rem] -translate-x-1/2"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              >
                <ScooterMark />
              </motion.div>
            </div>

            <p className="text-[15px] font-semibold text-heading leading-snug tracking-tight">
              {text}
            </p>
            <p className="mt-2 text-xs text-muted font-medium">
              Please wait — secure checkout
            </p>

            {/* Indeterminate progress */}
            <div className="relative mt-6 h-1 w-full overflow-hidden rounded-full bg-muted/30">
              <motion.div
                className="absolute left-0 top-0 h-full w-[38%] rounded-full bg-primary"
                animate={{ x: ['-100%', '280%'] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.25,
                  ease: 'linear',
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScooterLoader;
