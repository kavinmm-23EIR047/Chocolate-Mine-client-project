import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────
   Clean SVG Scooter + Delivery Man
   Uses CSS-variable colours so it adapts
   automatically to dark / light themes.
───────────────────────────────────────────── */
const ScooterSVG = () => (
  <svg
    viewBox="0 0 200 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
    aria-hidden="true"
  >
    {/* ── Exhaust puffs (left of scooter) ── */}
    <motion.circle
      cx="10" cy="72" r="4"
      fill="var(--muted)"
      animate={{ opacity: [0, 0.6, 0], cx: [10, -4], cy: [72, 66], r: [4, 7] }}
      transition={{ repeat: Infinity, duration: 0.9, ease: 'easeOut', delay: 0 }}
      style={{ opacity: 0 }}
    />
    <motion.circle
      cx="16" cy="76" r="3"
      fill="var(--muted)"
      animate={{ opacity: [0, 0.5, 0], cx: [16, 2], cy: [76, 69], r: [3, 5] }}
      transition={{ repeat: Infinity, duration: 0.9, ease: 'easeOut', delay: 0.3 }}
      style={{ opacity: 0 }}
    />
    <motion.circle
      cx="12" cy="80" r="2"
      fill="var(--muted)"
      animate={{ opacity: [0, 0.4, 0], cx: [12, -2], cy: [80, 74], r: [2, 4] }}
      transition={{ repeat: Infinity, duration: 0.9, ease: 'easeOut', delay: 0.6 }}
      style={{ opacity: 0 }}
    />

    {/* ── Rear wheel ── */}
    <motion.circle cx="52" cy="88" r="16"
      stroke="var(--primary)" strokeWidth="4" fill="var(--surface)"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
      style={{ transformOrigin: '52px 88px' }}
    />
    <circle cx="52" cy="88" r="4" fill="var(--primary)" />
    <line x1="52" y1="72" x2="52" y2="88" stroke="var(--border)" strokeWidth="1.5" />
    <line x1="52" y1="88" x2="52" y2="104" stroke="var(--border)" strokeWidth="1.5" />
    <line x1="36" y1="88" x2="52" y2="88" stroke="var(--border)" strokeWidth="1.5" />
    <line x1="52" y1="88" x2="68" y2="88" stroke="var(--border)" strokeWidth="1.5" />

    {/* ── Front wheel ── */}
    <motion.circle cx="152" cy="88" r="16"
      stroke="var(--primary)" strokeWidth="4" fill="var(--surface)"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
      style={{ transformOrigin: '152px 88px' }}
    />
    <circle cx="152" cy="88" r="4" fill="var(--primary)" />
    <line x1="152" y1="72" x2="152" y2="88" stroke="var(--border)" strokeWidth="1.5" />
    <line x1="152" y1="88" x2="152" y2="104" stroke="var(--border)" strokeWidth="1.5" />
    <line x1="136" y1="88" x2="152" y2="88" stroke="var(--border)" strokeWidth="1.5" />
    <line x1="152" y1="88" x2="168" y2="88" stroke="var(--border)" strokeWidth="1.5" />

    {/* ── Scooter body ── */}
    {/* under-carriage / footboard */}
    <rect x="55" y="84" width="90" height="8" rx="4" fill="var(--card)" />
    {/* main body panel */}
    <path d="M58 84 C58 70 68 58 80 56 L120 54 C134 54 148 62 152 72 L152 84 Z"
      fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
    {/* seat */}
    <rect x="75" y="46" width="52" height="10" rx="5"
      fill="var(--secondary)" />
    {/* rear guard */}
    <path d="M52 80 C52 72 56 68 60 66 L68 62" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* front fork */}
    <line x1="148" y1="72" x2="144" y2="58" stroke="var(--border)" strokeWidth="3" strokeLinecap="round" />
    {/* handlebar */}
    <line x1="140" y1="52" x2="150" y2="52" stroke="var(--foreground)" strokeWidth="3" strokeLinecap="round" />
    {/* headlight */}
    <circle cx="160" cy="66" r="5" fill="var(--warning)" stroke="var(--warning-light)" strokeWidth="1.5" />
    {/* delivery box on rear */}
    <rect x="60" y="40" width="32" height="22" rx="3"
      fill="var(--primary)" />
    <rect x="62" y="42" width="28" height="18" rx="2"
      fill="var(--primary-hover)" />
    {/* box label stripe */}
    <line x1="76" y1="42" x2="76" y2="60" stroke="var(--primary)" strokeWidth="1.5" />
    <line x1="60" y1="51" x2="92" y2="51" stroke="var(--primary)" strokeWidth="1.5" />

    {/* ── Rider ── */}
    {/* torso */}
    <rect x="108" y="32" width="28" height="24" rx="6"
      fill="var(--secondary)" />
    {/* jacket stripe */}
    <rect x="119" y="32" width="4" height="24" rx="1"
      fill="var(--accent)" opacity="0.7" />
    {/* arm */}
    <path d="M136 40 C142 38 146 44 144 52" stroke="var(--secondary)" strokeWidth="5" strokeLinecap="round" fill="none" />
    {/* hand on handlebar */}
    <circle cx="144" cy="52" r="3" fill="var(--foreground)" />
    {/* leg */}
    <path d="M108 52 C104 60 100 66 96 72" stroke="var(--secondary)" strokeWidth="6" strokeLinecap="round" fill="none" />
    {/* shoe */}
    <ellipse cx="94" cy="74" rx="6" ry="3" fill="var(--foreground)" />

    {/* helmet */}
    <ellipse cx="122" cy="26" rx="16" ry="14" fill="var(--accent)" />
    {/* visor */}
    <path d="M108 28 Q114 36 136 30" stroke="var(--card)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
    {/* helmet shine */}
    <ellipse cx="116" cy="18" rx="4" ry="2.5" fill="white" opacity="0.25" transform="rotate(-20 116 18)" />
  </svg>
);

/* ─────────────────────────────────────────────
   Smoke particle
───────────────────────────────────────────── */
const SmokeParticle = ({ delay, x, y, size }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      background: 'var(--muted)',
      opacity: 0,
    }}
    animate={{ opacity: [0, 0.35, 0], x: [-8, -28], y: [0, -14], scale: [0.6, 1.4] }}
    transition={{ repeat: Infinity, duration: 0.85, ease: 'easeOut', delay }}
  />
);

/* ─────────────────────────────────────────────
   ScooterLoader
───────────────────────────────────────────── */
const ScooterLoader = ({ isVisible, text = 'Preparing your sweet order...' }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
        >
          {/* Card container */}
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative bg-card border border-border/40 rounded-3xl shadow-premium px-8 pt-8 pb-10 flex flex-col items-center w-full max-w-sm mx-4"
          >

            {/* Road strip */}
            <div className="relative w-full h-32 mb-2 overflow-hidden">
              {/* dashed road */}
              <div className="absolute bottom-3 left-0 right-0 h-[2px] bg-border/30 rounded-full" />
              {/* road dashes moving */}
              <motion.div
                className="absolute bottom-2.5 flex gap-6"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                style={{ width: '200%' }}
              >
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="h-[3px] w-8 rounded-full bg-border/50 flex-shrink-0" />
                ))}
              </motion.div>

              {/* Scooter bobbing */}
              <motion.div
                className="absolute bottom-5 left-1/2 -translate-x-1/2 w-52"
                animate={{ y: [0, -3, 0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 0.45, ease: 'easeInOut' }}
              >
                <ScooterSVG />
              </motion.div>

              {/* Speed lines */}
              {[16, 28, 22].map((w, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-border/30"
                  style={{ height: 2, width: w, top: 28 + i * 12, left: 0 }}
                  animate={{ x: ['20px', '-60px'], opacity: [0, 0.6, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5, ease: 'linear', delay: i * 0.15 }}
                />
              ))}
            </div>

            {/* Text */}
            <motion.p
              key={text}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-base font-black text-heading tracking-tight text-center leading-snug"
            >
              {text}
            </motion.p>

            {/* Dots */}
            <div className="flex gap-1.5 mt-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                />
              ))}
            </div>

            <p className="mt-3 text-[9px] font-black text-muted uppercase tracking-[0.4em]">
              Packing Happiness
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScooterLoader;