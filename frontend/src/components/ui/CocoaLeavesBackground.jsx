import React from 'react';

/**
 * Botanically Accurate Cocoa Branch Component
 * Updated with oblong-elliptic leaf geometry, acuminate tips, petioles, and cauliflorous pod attachment.
 */

export const BrochureCocoaBranchLeft = ({ className = "w-full h-full", color = "currentColor" }) => (
  <svg
    viewBox="0 0 320 450"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ stroke: color }}
  >
    {/* Main Stem / Branch */}
    <path
      d="M 30,-10 C 50,80 85,180 110,290 C 120,350 115,400 105,450"
      strokeWidth="3.5"
      strokeLinecap="round"
    />

    {/* Cocoa Pod (Hanging on thick woody peduncle from main stem) */}
    <g transform="translate(68, 140) rotate(5)">
      {/* Short Peduncle (Stem) */}
      <path d="M 0,-18 L 0,0" strokeWidth="3" strokeLinecap="round" />

      {/* Pod Body - Elongated, pointed base/tip */}
      <path
        d="M 0,0 C 22,12 30,42 22,75 C 14,96 0,108 -10,112 C -20,108 -34,96 -42,75 C -50,42 -42,12 -20,0 Z"
        strokeWidth="2"
        fill="none"
      />
      {/* Longitudinal Ribs / Furrows */}
      <path d="M -10,0 C 0,30 2,70 -10,112" strokeWidth="1.4" />
      <path d="M -22,2 C -12,32 -10,68 -20,106" strokeWidth="1.2" />
      <path d="M 2,2 C 12,32 10,68 0,106" strokeWidth="1.2" />
      <path d="M -32,12 C -28,38 -26,62 -28,88" strokeWidth="1" strokeDasharray="3 2" />
      <path d="M 12,12 C 8,38 6,62 8,88" strokeWidth="1" strokeDasharray="3 2" />
    </g>

    {/* Leaf 1 - Top Right (Oblong-elliptic with acuminate tip) */}
    <g transform="translate(52, 60) rotate(22)">
      {/* Petiole */}
      <path d="M 0,0 Q 12,6 20,8" strokeWidth="2" strokeLinecap="round" />

      {/* Leaf Blade Outline */}
      <path
        d="M 20,8 C 45,-12 110,-10 160,25 C 175,35 185,42 195,45 C 180,55 165,65 140,70 C 85,82 35,50 20,8 Z"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Central Midrib */}
      <path d="M 20,8 C 70,25 130,38 195,45" strokeWidth="1.8" />

      {/* Secondary Penninerve Veins */}
      <path d="M 45,15 C 60,3 80,2 95,8" strokeWidth="1" strokeLinecap="round" />
      <path d="M 75,23 C 95,10 120,12 135,20" strokeWidth="1" strokeLinecap="round" />
      <path d="M 110,31 C 130,22 152,26 168,34" strokeWidth="1" strokeLinecap="round" />

      <path d="M 50,17 C 42,32 48,48 60,56" strokeWidth="1" strokeLinecap="round" />
      <path d="M 82,25 C 75,44 85,60 100,67" strokeWidth="1" strokeLinecap="round" />
      <path d="M 118,33 C 112,50 125,62 140,67" strokeWidth="1" strokeLinecap="round" />
    </g>

    {/* Leaf 2 - Mid Left (Hanging Leaf) */}
    <g transform="translate(90, 220) rotate(-35)">
      {/* Petiole */}
      <path d="M 0,0 Q -10,8 -18,12" strokeWidth="2" strokeLinecap="round" />

      {/* Leaf Blade Outline */}
      <path
        d="M -18,12 C -40,-5 -95,-2 -140,28 C -152,36 -162,42 -170,44 C -158,52 -142,60 -120,64 C -72,72 -32,45 -18,12 Z"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Midrib */}
      <path d="M -18,12 C -60,26 -115,36 -170,44" strokeWidth="1.8" />

      {/* Veins */}
      <path d="M -40,18 C -52,7 -70,6 -82,12" strokeWidth="1" strokeLinecap="round" />
      <path d="M -68,24 C -85,12 -105,14 -120,22" strokeWidth="1" strokeLinecap="round" />
      <path d="M -42,19 C -36,32 -42,46 -52,53" strokeWidth="1" strokeLinecap="round" />
      <path d="M -72,25 C -66,42 -74,55 -88,61" strokeWidth="1" strokeLinecap="round" />
    </g>

    {/* Leaf 3 - Bottom Right */}
    <g transform="translate(105, 310) rotate(15)">
      {/* Petiole */}
      <path d="M 0,0 Q 10,5 16,7" strokeWidth="2" strokeLinecap="round" />

      {/* Leaf Blade Outline */}
      <path
        d="M 16,7 C 36,-8 85,-6 125,20 C 136,27 144,32 152,34 C 140,41 128,48 108,52 C 65,60 28,36 16,7 Z"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M 16,7 C 55,20 100,28 152,34" strokeWidth="1.5" />

      {/* Veins */}
      <path d="M 38,13 C 50,3 66,2 78,7" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M 62,18 C 76,8 92,9 105,16" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M 40,14 C 34,25 38,37 48,43" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M 65,19 C 60,32 66,43 78,48" strokeWidth="0.9" strokeLinecap="round" />
    </g>
  </svg>
);

export const BrochureCocoaBranchRight = ({ className = "w-full h-full", color = "currentColor" }) => (
  <div className="transform -scale-x-100 w-full h-full">
    <BrochureCocoaBranchLeft className={className} color={color} />
  </div>
);

const CocoaLeavesBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* TOP LEFT CORNER BROCHURE COCOA LEAF BRANCH */}
      <div className="absolute -top-6 -left-6 w-72 sm:w-96 md:w-[420px] lg:w-[480px] opacity-[0.14] dark:opacity-[0.08] text-[var(--primary)] dark:text-[#F2EADF] transition-colors duration-500 pointer-events-none">
        <BrochureCocoaBranchLeft />
      </div>

      {/* TOP RIGHT CORNER BROCHURE COCOA LEAF BRANCH */}
      <div className="absolute -top-6 -right-6 w-72 sm:w-96 md:w-[420px] lg:w-[480px] opacity-[0.14] dark:opacity-[0.08] text-[var(--primary)] dark:text-[#F2EADF] transition-colors duration-500 pointer-events-none">
        <BrochureCocoaBranchRight />
      </div>

      {/* LOWER LEFT MARGIN ACCENT */}
      <div className="absolute top-[52%] -left-12 w-64 sm:w-80 md:w-[360px] opacity-[0.10] dark:opacity-[0.06] text-[var(--primary)] dark:text-[#F2EADF] transition-colors duration-500 transform -rotate-12 pointer-events-none">
        <BrochureCocoaBranchLeft />
      </div>

      {/* LOWER RIGHT MARGIN ACCENT */}
      <div className="absolute top-[68%] -right-12 w-64 sm:w-80 md:w-[360px] opacity-[0.10] dark:opacity-[0.06] text-[var(--primary)] dark:text-[#F2EADF] transition-colors duration-500 transform rotate-12 pointer-events-none">
        <BrochureCocoaBranchRight />
      </div>
    </div>
  );
};

export default CocoaLeavesBackground;