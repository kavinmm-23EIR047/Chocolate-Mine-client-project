import React from 'react';

/**
 * Realistic Cocoa Leaf SVG — oblong-elliptic shape with pointed drip-tip,
 * prominent midrib, and paired lateral veins typical of Theobroma cacao.
 */
const CocoaLeaf = ({ className = 'w-full h-full', color = 'currentColor' }) => (
  <svg
    viewBox="0 0 200 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    {/* Petiole (leaf stalk) */}
    <path
      d="M 100,310 C 100,290 98,270 100,250"
      stroke={color} strokeWidth="2.5" strokeLinecap="round"
    />

    {/* Leaf blade — oblong-elliptic, widest near middle, acuminate tip */}
    <path
      d="M 100,250
         C 70,240 30,200 18,150
         C 8,110 12,60 30,35
         C 45,15 70,5 90,2
         C 95,1 100,0 100,0
         C 100,0 105,1 110,2
         C 130,5 155,15 170,35
         C 188,60 192,110 182,150
         C 170,200 130,240 100,250 Z"
      stroke={color} strokeWidth="2" strokeLinejoin="round"
    />

    {/* Midrib — central vein running tip to base */}
    <path
      d="M 100,0 C 100,30 100,120 100,250"
      stroke={color} strokeWidth="1.8" strokeLinecap="round"
    />

    {/* Lateral veins — left side (curved arcs toward margin) */}
    <path d="M 100,40 C 85,35 65,30 45,32" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M 100,75 C 82,68 58,62 35,68" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M 100,110 C 80,102 55,98 30,108" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M 100,145 C 78,138 52,138 28,150" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M 100,180 C 80,175 58,178 40,190" stroke={color} strokeWidth="0.9" strokeLinecap="round" />
    <path d="M 100,215 C 85,212 68,218 55,228" stroke={color} strokeWidth="0.8" strokeLinecap="round" />

    {/* Lateral veins — right side (mirrored) */}
    <path d="M 100,40 C 115,35 135,30 155,32" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M 100,75 C 118,68 142,62 165,68" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M 100,110 C 120,102 145,98 170,108" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M 100,145 C 122,138 148,138 172,150" stroke={color} strokeWidth="1" strokeLinecap="round" />
    <path d="M 100,180 C 120,175 142,178 160,190" stroke={color} strokeWidth="0.9" strokeLinecap="round" />
    <path d="M 100,215 C 115,212 132,218 145,228" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
  </svg>
);

/**
 * Realistic Cocoa Bean SVG — the single seed with its characteristic
 * elongated oval shape and longitudinal groove line.
 */
const CocoaBean = ({ className = 'w-full h-full', color = 'currentColor' }) => (
  <svg
    viewBox="0 0 80 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    {/* Bean body — elongated almond shape */}
    <path
      d="M 40,5
         C 60,10 72,30 74,55
         C 76,80 68,110 55,125
         C 48,133 42,136 40,137
         C 38,136 32,133 25,125
         C 12,110 4,80 6,55
         C 8,30 20,10 40,5 Z"
      stroke={color} strokeWidth="2" strokeLinejoin="round"
    />

    {/* Central groove / seam — characteristic of cocoa beans */}
    <path
      d="M 40,10 C 38,40 39,80 40,132"
      stroke={color} strokeWidth="1.5" strokeLinecap="round"
    />

    {/* Surface texture lines */}
    <path d="M 30,25 C 25,40 24,55 28,70" stroke={color} strokeWidth="0.7" strokeLinecap="round" />
    <path d="M 50,25 C 55,40 56,55 52,70" stroke={color} strokeWidth="0.7" strokeLinecap="round" />
    <path d="M 24,75 C 22,90 24,105 30,118" stroke={color} strokeWidth="0.6" strokeLinecap="round" />
    <path d="M 56,75 C 58,90 56,105 50,118" stroke={color} strokeWidth="0.6" strokeLinecap="round" />
  </svg>
);

/**
 * Cocoa Pod SVG — the ridged fruit that holds the beans.
 */
const CocoaPod = ({ className = 'w-full h-full', color = 'currentColor' }) => (
  <svg
    viewBox="0 0 120 260"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    {/* Short stem / peduncle */}
    <path d="M 60,0 L 60,20" stroke={color} strokeWidth="3" strokeLinecap="round" />

    {/* Pod body — elongated ridged fruit */}
    <path
      d="M 60,20
         C 85,30 100,70 100,120
         C 100,170 85,210 70,235
         C 65,243 60,248 60,250
         C 60,248 55,243 50,235
         C 35,210 20,170 20,120
         C 20,70 35,30 60,20 Z"
      stroke={color} strokeWidth="2" strokeLinejoin="round"
    />

    {/* Longitudinal ribs/furrows (5 visible on front) */}
    <path d="M 60,22 C 60,80 60,160 60,248" stroke={color} strokeWidth="1.4" />
    <path d="M 42,28 C 38,80 38,160 48,238" stroke={color} strokeWidth="1" />
    <path d="M 78,28 C 82,80 82,160 72,238" stroke={color} strokeWidth="1" />
    <path d="M 28,50 C 24,100 26,170 42,232" stroke={color} strokeWidth="0.7" strokeDasharray="4 3" />
    <path d="M 92,50 C 96,100 94,170 78,232" stroke={color} strokeWidth="0.7" strokeDasharray="4 3" />
  </svg>
);


/**
 * Full page ambient background with cocoa leaves, beans, and pods
 * scattered at the corners and margins.
 *
 * Responsive: small elements on mobile, medium on tablet/desktop.
 */
export const CocoaLeavesBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">

      {/* ─── LEAF — Top-left corner ─── */}
      <div className="absolute -top-4 -left-3 w-16 sm:w-28 md:w-40 opacity-[0.11] dark:opacity-[0.06] text-[var(--primary)] dark:text-[#F2EADF] transform -rotate-[30deg]">
        <CocoaLeaf />
      </div>

      {/* ─── BEAN — Top, 25% from left ─── */}
      <div className="absolute top-6 left-[22%] w-4 sm:w-6 md:w-8 opacity-[0.09] dark:opacity-[0.05] text-[var(--primary)] dark:text-[#F2EADF] transform rotate-[40deg]">
        <CocoaBean />
      </div>

      {/* ─── LEAF — Top-right corner (mirrored) ─── */}
      <div className="absolute -top-3 -right-4 w-16 sm:w-28 md:w-40 opacity-[0.11] dark:opacity-[0.06] text-[var(--primary)] dark:text-[#F2EADF] transform rotate-[30deg] -scale-x-100">
        <CocoaLeaf />
      </div>

      {/* ─── BEAN — Top, 70% from left ─── */}
      <div className="absolute top-14 right-[18%] w-4 sm:w-6 md:w-8 opacity-[0.08] dark:opacity-[0.04] text-[var(--primary)] dark:text-[#F2EADF] transform -rotate-[25deg]">
        <CocoaBean />
      </div>

      {/* ─── POD — Left edge, 25% from top ─── */}
      <div className="absolute top-[22%] -left-2 w-8 sm:w-12 md:w-16 opacity-[0.09] dark:opacity-[0.05] text-[var(--primary)] dark:text-[#F2EADF] transform -rotate-[15deg]">
        <CocoaPod />
      </div>

      {/* ─── BEAN — Right edge, 30% from top ─── */}
      <div className="absolute top-[28%] right-3 sm:right-5 w-4 sm:w-6 md:w-8 opacity-[0.08] dark:opacity-[0.04] text-[var(--primary)] dark:text-[#F2EADF] transform rotate-[50deg]">
        <CocoaBean />
      </div>

      {/* ─── LEAF — Left edge, 42% from top ─── */}
      <div className="absolute top-[42%] -left-5 w-14 sm:w-24 md:w-34 opacity-[0.09] dark:opacity-[0.05] text-[var(--primary)] dark:text-[#F2EADF] transform rotate-[20deg]">
        <CocoaLeaf />
      </div>

      {/* ─── BEAN — Right edge, 48% from top ─── */}
      <div className="absolute top-[48%] right-2 sm:right-4 w-4 sm:w-6 md:w-8 opacity-[0.07] dark:opacity-[0.04] text-[var(--primary)] dark:text-[#F2EADF] transform -rotate-[35deg]">
        <CocoaBean />
      </div>

      {/* ─── LEAF — Right edge, 55% (mirrored) ─── */}
      <div className="absolute top-[55%] -right-5 w-14 sm:w-24 md:w-34 opacity-[0.09] dark:opacity-[0.05] text-[var(--primary)] dark:text-[#F2EADF] transform -rotate-[25deg] -scale-x-100">
        <CocoaLeaf />
      </div>

      {/* ─── POD — Right edge, 38% ─── */}
      <div className="absolute top-[36%] -right-1 w-8 sm:w-12 md:w-16 opacity-[0.08] dark:opacity-[0.04] text-[var(--primary)] dark:text-[#F2EADF] transform rotate-[12deg]">
        <CocoaPod />
      </div>

      {/* ─── BEAN — Left edge, 62% ─── */}
      <div className="absolute top-[62%] left-3 sm:left-5 w-4 sm:w-6 md:w-8 opacity-[0.08] dark:opacity-[0.04] text-[var(--primary)] dark:text-[#F2EADF] transform rotate-[60deg]">
        <CocoaBean />
      </div>

      {/* ─── POD — Left edge, 72% ─── */}
      <div className="absolute top-[72%] -left-2 w-8 sm:w-12 md:w-16 opacity-[0.08] dark:opacity-[0.04] text-[var(--primary)] dark:text-[#F2EADF] transform rotate-[10deg]">
        <CocoaPod />
      </div>

      {/* ─── LEAF — Bottom-left ─── */}
      <div className="absolute bottom-[10%] -left-4 w-14 sm:w-24 md:w-36 opacity-[0.10] dark:opacity-[0.05] text-[var(--primary)] dark:text-[#F2EADF] transform rotate-[15deg]">
        <CocoaLeaf />
      </div>

      {/* ─── BEAN — Bottom, 30% from left ─── */}
      <div className="absolute bottom-8 left-[28%] w-4 sm:w-6 md:w-8 opacity-[0.07] dark:opacity-[0.04] text-[var(--primary)] dark:text-[#F2EADF] transform -rotate-[45deg]">
        <CocoaBean />
      </div>

      {/* ─── POD — Bottom-right ─── */}
      <div className="absolute bottom-[12%] -right-1 w-8 sm:w-12 md:w-16 opacity-[0.08] dark:opacity-[0.04] text-[var(--primary)] dark:text-[#F2EADF] transform -rotate-[18deg]">
        <CocoaPod />
      </div>

      {/* ─── LEAF — Bottom-right (mirrored) ─── */}
      <div className="absolute -bottom-4 -right-4 w-16 sm:w-28 md:w-38 opacity-[0.10] dark:opacity-[0.05] text-[var(--primary)] dark:text-[#F2EADF] transform rotate-[20deg] -scale-x-100">
        <CocoaLeaf />
      </div>

      {/* ─── BEAN — Bottom, 65% from left ─── */}
      <div className="absolute bottom-6 right-[25%] w-4 sm:w-6 md:w-8 opacity-[0.07] dark:opacity-[0.04] text-[var(--primary)] dark:text-[#F2EADF] transform rotate-[55deg]">
        <CocoaBean />
      </div>
    </div>
  );
};

export default CocoaLeavesBackground;