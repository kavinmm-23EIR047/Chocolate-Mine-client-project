import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const TOKENS = {
  chocolate: '#3B1F1B',
  cream: '#F5E6DA',
  gold: '#C69C6D',
  bgLight: '#FAF8F5',
  bgDark: '#0D0706',
};

/**
 * Side-view delivery scooter — realistic proportions (step-through, rack, fairing),
 * chocolate cargo on rear. Wheels spin; body / headlight breathe subtly.
 */
function RealisticDeliveryScooter({ tone, accent, cream, metal, isDark }) {
  const wheelDur = 0.72;
  return (
    <motion.div
      className="relative h-[5.5rem] w-[11.5rem] sm:h-[6.25rem] sm:w-[13rem]"
      animate={{
        y: [0, -2.2, 0, -1.4, 0],
        rotate: [-0.6, 0.45, -0.35, 0.2, -0.15, 0],
      }}
      transition={{
        duration: 0.42,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <svg
        viewBox="0 0 260 112"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-[0_18px_36px_rgba(59,31,27,0.22)] dark:drop-shadow-[0_22px_44px_rgba(0,0,0,0.55)]"
        aria-hidden
      >
        <defs>
          <linearGradient id="bodyMetal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#4a302c' : tone} />
            <stop offset="50%" stopColor={isDark ? '#2d1815' : '#2a1512'} />
            <stop offset="100%" stopColor={isDark ? '#1a0f0d' : '#3B1F1B'} />
          </linearGradient>
          <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={cream} stopOpacity={0.95} />
            <stop offset="100%" stopColor={cream} stopOpacity={0.75} />
          </linearGradient>
          <linearGradient id="tireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2a2a2a" />
            <stop offset="50%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0d0d0d" />
          </linearGradient>
          <radialGradient id="headGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE8B8" stopOpacity={0.95} />
            <stop offset="70%" stopColor={accent} stopOpacity={0.35} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </radialGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Shadow under scooter */}
        <ellipse cx="130" cy="98" rx="72" ry="6" fill="#000" opacity={isDark ? 0.45 : 0.14} />

        {/* Rear wheel */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: wheelDur, ease: 'linear' }}
          style={{ transformOrigin: '58px 82px' }}
        >
          <circle cx="58" cy="82" r="15" fill="url(#tireGrad)" stroke="#111" strokeWidth="1.2" />
          <circle cx="58" cy="82" r="10" fill={metal} stroke={tone} strokeWidth="0.8" opacity={0.9} />
          <circle cx="58" cy="82" r="3.5" fill="#333" />
          <ellipse cx="58" cy="82" rx="15" ry="4" fill="#000" opacity="0.15" transform="rotate(-8 58 82)" />
        </motion.g>

        {/* Front wheel */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: wheelDur, ease: 'linear' }}
          style={{ transformOrigin: '208px 82px' }}
        >
          <circle cx="208" cy="82" r="15" fill="url(#tireGrad)" stroke="#111" strokeWidth="1.2" />
          <circle cx="208" cy="82" r="10" fill={metal} stroke={tone} strokeWidth="0.8" opacity={0.9} />
          <circle cx="208" cy="82" r="3.5" fill="#333" />
        </motion.g>

        {/* Rear mudguard */}
        <path
          d="M42 78c8-18 28-22 38-8s6 20-4 22"
          stroke={tone}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
        />

        {/* Main body — step-through tunnel */}
        <path
          d="M78 72 L78 52 Q82 38 96 34 L125 32 Q148 30 162 38 L178 44 Q188 48 192 58 L196 72 L188 76 Q170 80 130 78 Q95 78 78 72Z"
          fill="url(#bodyMetal)"
          filter="url(#softShadow)"
        />
        {/* Floorboard */}
        <path
          d="M92 68 L92 58 Q110 54 155 56 L188 62 L192 72 L96 74 Z"
          fill="url(#floorGrad)"
          stroke={tone}
          strokeWidth="0.8"
          strokeOpacity={0.35}
        />
        {/* Side panel highlight */}
        <path
          d="M100 48 Q130 42 158 48"
          stroke={accent}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity={0.45}
        />

        {/* Front fairing & leg shield */}
        <path
          d="M175 36 Q195 32 210 40 L218 52 Q222 62 215 72 L200 76 Q185 70 176 58 Z"
          fill={tone}
          opacity={0.92}
        />
        <path
          d="M178 44 L200 48 L205 58 L182 56 Z"
          fill={cream}
          opacity={0.25}
        />

        {/* Headlight */}
        <ellipse cx="218" cy="48" rx="7" ry="9" fill="#f0f0f0" stroke={tone} strokeWidth="1" />
        <ellipse cx="220" cy="48" rx="4" ry="6" fill="#fffbe8" />
        <motion.g
          animate={{ opacity: [0.45, 0.95, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ellipse cx="222" cy="48" rx="9" ry="11" fill="url(#headGlow)" />
        </motion.g>

        {/* Seat */}
        <path
          d="M115 36 Q135 28 155 34 Q168 38 172 48 L170 56 Q150 52 120 50 Q108 48 108 42 Z"
          fill={tone}
          opacity={0.95}
        />
        <path
          d="M118 40 Q138 36 158 40"
          stroke={accent}
          strokeWidth="1"
          strokeLinecap="round"
          opacity={0.5}
        />

        {/* Rider — helmet + torso */}
        <circle cx="142" cy="22" r="9" fill={cream} stroke={tone} strokeWidth="1.4" />
        <path
          d="M138 30 Q136 40 130 48 L125 58 Q135 54 145 50 L152 38 Z"
          fill={tone}
          opacity={0.88}
        />
        <path
          d="M148 36 L168 40 L172 48"
          stroke={tone}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Handlebar */}
        <path
          d="M176 34 L198 32"
          stroke={tone}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="200" cy="32" r="2.5" fill={tone} />

        {/* Rear rack + chocolate delivery box */}
        <rect x="52" y="24" width="36" height="22" rx="3" fill={tone} stroke={accent} strokeWidth="1.2" opacity={0.98} />
        <rect x="58" y="30" width="24" height="5" rx="1" fill={accent} opacity={0.85} />
        <path d="M70 24 L70 18 Q72 14 78 14 L86 18" stroke={accent} strokeWidth="2" strokeLinecap="round" fill="none" />
        <text
          x="70"
          y="47"
          textAnchor="middle"
          fill={cream}
          fontSize="8"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
          opacity={0.95}
        >
          TCM
        </text>

        {/* Front fender */}
        <path
          d="M193 74 Q208 65 222 72"
          stroke={tone}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity={0.9}
        />

        {/* Exhaust */}
        <path
          d="M88 76 Q75 82 62 84"
          stroke="#555"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={0.7}
        />

        {/* Tail light */}
        <rect x="68" y="58" width="6" height="10" rx="2" fill="#c62828" opacity={0.9} />
      </svg>
    </motion.div>
  );
}

function CocoaTrail({ dark, accent }) {
  const seeds = useMemo(
    () =>
      [...Array(22)].map((_, i) => ({
        id: i,
        left: 46 + (i % 7) * 7,
        top: 35 + (i % 6) * 9,
        delay: i * 0.035,
        size: 2 + (i % 4),
      })),
    []
  );
  const dust = dark ? 'rgba(245,230,218,0.35)' : 'rgba(59,31,27,0.18)';
  const glow = accent;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {seeds.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: p.id % 3 === 0 ? glow : dust,
            opacity: 0.85,
            boxShadow: p.id % 4 === 0 ? `0 0 10px ${glow}` : undefined,
          }}
          animate={{
            opacity: [0, 0.9, 0],
            x: [0, -52 - p.id * 1.5],
            y: [0, (p.id % 2 === 0 ? -1 : 1) * (6 + p.id * 0.2)],
            scale: [0.3, 1.15, 0.2],
          }}
          transition={{
            duration: 0.95 + (p.id % 5) * 0.06,
            repeat: Infinity,
            delay: p.delay,
            ease: [0.33, 1, 0.68, 1],
          }}
        />
      ))}
    </div>
  );
}

function SpeedStreaks({ tone, accent }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.55]">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            height: '3px',
            width: `${48 + i * 22}px`,
            top: `${12 + i * 11}%`,
            left: '-5%',
            background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? tone : accent}, transparent)`,
            opacity: 0.35,
          }}
          animate={{
            x: ['-8%', '108%'],
            opacity: [0.08, 0.45, 0.08],
          }}
          transition={{
            duration: 0.38 + i * 0.04,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
}

function RoadSurface({ muted }) {
  return (
    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 overflow-hidden rounded-xl opacity-90">
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${muted}12 40%, ${muted}22 100%)`,
        }}
      />
      <motion.div
        className="absolute bottom-5 left-0 right-0 h-[2px] opacity-40"
        style={{
          background: `repeating-linear-gradient(90deg, ${muted} 0 14px, transparent 14px 28px)`,
        }}
        animate={{ x: [0, -28] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export default function BrandIntroLoader({ show = false, onFinish, logoHoldMs = 2200 }) {
  const { isDark } = useTheme();
  const reduceMotion = useReducedMotion();

  const tone = TOKENS.chocolate;
  const cream = TOKENS.cream;
  const accent = TOKENS.gold;
  const metal = isDark ? '#8B7355' : '#C4B5A0';
  const bg = isDark ? TOKENS.bgDark : TOKENS.bgLight;
  const textPrimary = isDark ? TOKENS.cream : TOKENS.chocolate;
  const textMuted = isDark ? 'rgba(245,230,218,0.72)' : 'rgba(59,31,27,0.5)';
  const glow = isDark ? 'rgba(198,156,109,0.28)' : 'rgba(59,31,27,0.08)';

  const [stage, setStage] = useState('strip');

  useEffect(() => {
    if (!show) {
      setStage('strip');
      return;
    }

    let cancelled = false;

    if (reduceMotion) {
      setStage('reveal');
      const t = window.setTimeout(() => {
        if (!cancelled) onFinish?.();
      }, Math.max(logoHoldMs + 420, 2000));
      return () => {
        cancelled = true;
        window.clearTimeout(t);
      };
    }

    setStage('strip');
    const tRide = window.setTimeout(() => {
      if (!cancelled) setStage('ride');
    }, 600);
    const tReveal = window.setTimeout(() => {
      if (!cancelled) setStage('reveal');
    }, 600 + 3400);
    const tFinish = window.setTimeout(() => {
      if (!cancelled) onFinish?.();
    }, 600 + 3400 + logoHoldMs + 800);

    return () => {
      cancelled = true;
      window.clearTimeout(tRide);
      window.clearTimeout(tReveal);
      window.clearTimeout(tFinish);
    };
  }, [show, reduceMotion, logoHoldMs, onFinish]);

  const ridePhase = stage === 'ride';
  const revealPhase = stage === 'reveal';

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="brand-loader"
          role="status"
          aria-live="polite"
          aria-busy={!revealPhase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[240] flex items-center justify-center overflow-hidden px-5 sm:px-10"
          style={{
            background: bg,
            fontFamily: '"Poppins", "Outfit", system-ui, sans-serif',
          }}
        >
          {/* Ambient + subtle noise grid */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: isDark
                ? `radial-gradient(ellipse 92% 72% at 48% 42%, ${glow}, transparent 58%), radial-gradient(circle at 50% 108%, rgba(0,0,0,0.65), transparent 52%)`
                : `radial-gradient(ellipse 88% 68% at 50% 38%, rgba(245,230,218,0.5), transparent 55%)`,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07] dark:opacity-[0.12]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, ${textMuted} 1px, transparent 0)`,
              backgroundSize: '28px 28px',
            }}
          />

          <div className="relative flex w-full max-w-[min(480px,96vw)] flex-col items-center justify-center">
            {/* Status row */}
            <motion.div
              className="absolute -top-16 left-0 right-0 flex flex-col items-center gap-3 sm:-top-[4.5rem]"
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: revealPhase ? 0 : 1,
                y: revealPhase ? -8 : 0,
              }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5"
                    style={{
                      backgroundColor: accent,
                      boxShadow: `0 0 12px ${accent}66`,
                    }}
                    animate={
                      reduceMotion || revealPhase
                        ? { opacity: 0.4 }
                        : { opacity: [0.25, 1, 0.25], scale: [0.85, 1.12, 0.85] }
                    }
                    transition={{
                      duration: 0.75,
                      repeat: reduceMotion || revealPhase ? 0 : Infinity,
                      delay: i * 0.14,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
              <p
                className="text-[10px] font-black uppercase tracking-[0.35em] opacity-80"
                style={{ color: textMuted }}
              >
                {revealPhase ? '' : ridePhase ? 'On the way…' : 'Preparing route…'}
              </p>
            </motion.div>

            <motion.div
              className="relative mb-8 w-full sm:mb-10"
              animate={{
                opacity: revealPhase ? 0 : 1,
                y: revealPhase ? -20 : 0,
                height: revealPhase ? 0 : 'auto',
                marginBottom: revealPhase ? 0 : undefined,
              }}
              transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
              style={{ overflow: revealPhase ? 'hidden' : 'visible' }}
            >
              <div className="relative mx-auto h-[148px] w-full max-w-[400px] sm:h-[168px]">
                <SpeedStreaks tone={tone} accent={accent} />
                <CocoaTrail dark={isDark} accent={accent} />
                <RoadSurface muted={tone} />

                <div
                  className="absolute bottom-[52px] left-[6%] right-[6%] h-px rounded-full opacity-35"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${textMuted}, transparent)`,
                  }}
                />

                <div className="absolute bottom-[34px] left-[8%] right-[8%] h-1 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/[0.08]">
                  <motion.div
                    className="h-full w-[32%] rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${accent}, ${cream})`,
                      boxShadow: `0 0 16px ${accent}88`,
                    }}
                    animate={
                      reduceMotion || revealPhase ? { x: '10%' } : { x: ['-120%', '260%'] }
                    }
                    transition={{
                      duration: revealPhase ? 0 : 1,
                      repeat: revealPhase ? 0 : Infinity,
                      ease: 'linear',
                    }}
                  />
                </div>

                <AnimatePresence>
                  {ridePhase && (
                    <motion.div
                      key="courier"
                      className="absolute bottom-[38px] left-1/2 will-change-transform"
                      initial={{
                        x: 'calc(-50% - min(58vw, 270px))',
                        y: 12,
                        opacity: 0,
                        scale: 0.88,
                      }}
                      animate={{
                        x: ['calc(-50% - min(58vw, 270px))', '-50%', '-50%'],
                        y: [12, -18, -6],
                        opacity: [0, 1, 1],
                        scale: [0.88, 1, 1],
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.72,
                        filter: 'blur(12px)',
                        transition: { duration: 0.48, ease: [0.65, 0, 0.35, 1] },
                      }}
                      transition={{
                        duration: reduceMotion ? 0 : 3.2,
                        times: reduceMotion ? [1] : [0, 0.58, 1],
                        ease: reduceMotion ? 'linear' : [0.22, 0.82, 0.16, 1],
                      }}
                    >
                      <div className="-translate-x-1/2">
                        <RealisticDeliveryScooter
                          tone={tone}
                          accent={accent}
                          cream={cream}
                          metal={metal}
                          isDark={isDark}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <AnimatePresence>
              {revealPhase && (
                <motion.div
                  key="logo"
                  className="relative flex flex-col items-center text-center"
                  initial={
                    reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.85, y: 22 }
                  }
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.35 } }}
                  transition={{
                    type: 'spring',
                    stiffness: 240,
                    damping: 26,
                    mass: 0.85,
                  }}
                  style={{
                    color: textPrimary,
                    textShadow: isDark
                      ? `0 0 44px ${glow}, 0 2px 22px rgba(0,0,0,0.45)`
                      : `0 2px 28px ${glow}`,
                  }}
                >
                  <motion.span
                    className="mb-2 text-[10px] font-black uppercase tracking-[0.42em] sm:text-[11px]"
                    style={{ color: textMuted }}
                    initial={{ opacity: 0, letterSpacing: '0.52em' }}
                    animate={{ opacity: 1, letterSpacing: '0.42em' }}
                    transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
                  >
                    THE CHOCOLATE
                  </motion.span>

                  <div className="relative overflow-hidden pb-1">
                    <motion.span
                      className="relative z-[1] block text-[2.85rem] font-black leading-none tracking-tight sm:text-[4.1rem]"
                      initial={reduceMotion ? false : { scale: 0.88 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 16,
                      }}
                    >
                      MINE
                    </motion.span>

                    {!reduceMotion && (
                      <motion.div
                        className="pointer-events-none absolute inset-y-[-12%] left-[-40%] w-[55%] skew-x-[-16deg] mix-blend-soft-light opacity-90"
                        initial={{ x: '-30%', opacity: 0 }}
                        animate={{ x: '230%', opacity: [0, 0.55, 0] }}
                        transition={{
                          duration: 1.08,
                          delay: 0.34,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        style={{
                          background: `linear-gradient(
                            100deg,
                            transparent 0%,
                            rgba(245,230,218,0.2) 38%,
                            ${accent}70 50%,
                            rgba(245,230,218,0.16) 62%,
                            transparent 100%
                          )`,
                        }}
                      />
                    )}
                  </div>

                  <motion.p
                    className="mt-5 max-w-[320px] text-center text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-[11px]"
                    style={{ color: textMuted }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.24, duration: 0.5 }}
                  >
                    Fresh · Local · Delivered
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
