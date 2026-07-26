import React from 'react';

/**
 * Enhanced Botanical Cocoa Branch Component
 * Redesigned with organic, smoothly curved leaf outlines and natural penninerve veining.
 */

export const BrochureCocoaBranchLeft = ({ className = "w-full h-full", color = "currentColor" }) => (
  <svg
    viewBox="0 0 320 450"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ stroke: color }}
  >
    {/* Main Stem */}
    <path
      d="M10 -10 C35 70, 85 170, 115 280 C130 340, 125 400, 115 450"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Cocoa Pod */}
    <g transform="translate(42, 75) rotate(12)">
      {/* Pod Body */}
      <path
        d="M0 0 C28 18, 38 58, 28 88 C12 105, -12 95, -26 68 C-34 42, -22 10, 0 0 Z"
        strokeWidth="2"
        fill="none"
      />
      {/* Pod Longitudinal Grooves */}
      <path d="M0 0 C12 28, 14 60, 2 85" strokeWidth="1.3" />
      <path d="M-10 6 C-16 32, -18 58, -12 80" strokeWidth="1.3" />
      <path d="M10 12 C19 35, 19 62, 10 78" strokeWidth="1.1" strokeDasharray="3 2" />
      {/* Pod Texture Details */}
      <path d="M-18 42 C-14 44, -12 40, -8 43" strokeWidth="1" />
      <path d="M4 30 C8 32, 12 28, 15 31" strokeWidth="1" />
    </g>

    {/* Leaf 1 - Upper Large Leaf */}
    <g transform="translate(55, 115) rotate(18)">
      {/* Organic Leaf Outline */}
      <path
        d="M 0,0 C 30,-15 80,-10 135,110 C 75,115 25,75 0,0 Z"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Curved Central Midrib */}
      <path d="M 0,0 C 45,30 85,65 135,110" strokeWidth="1.6" />

      {/* Curved Botanical Veins - Top Side */}
      <path d="M 22,12 C 32,5 45,5 50,11" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M 44,25 C 58,16 75,18 82,26" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M 68,41 C 84,30 102,35 110,43" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M 92,60 C 106,50 120,56 126,64" strokeWidth="1.1" strokeLinecap="round" />

      {/* Curved Botanical Veins - Bottom Side */}
      <path d="M 30,17 C 24,30 28,42 34,48" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M 52,31 C 45,46 50,60 58,68" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M 76,47 C 68,64 74,80 84,89" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M 100,67 C 94,80 100,92 108,98" strokeWidth="1.1" strokeLinecap="round" />
    </g>

    {/* Leaf 2 - Left Hanging Leaf */}
    <g transform="translate(82, 195) rotate(-42)">
      <path
        d="M 0,0 C -30,-12 -80,-5 -125,120 C -70,115 -20,70 0,0 Z"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M 0,0 C -40,30 -80,65 -125,120" strokeWidth="1.6" />

      {/* Veins - Upper Side */}
      <path d="M -20,12 C -30,4 -42,5 -48,11" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M -40,25 C -54,15 -70,17 -78,25" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M -62,41 C -78,29 -94,33 -102,42" strokeWidth="1.1" strokeLinecap="round" />

      {/* Veins - Lower Side */}
      <path d="M -26,16 C -20,28 -24,40 -30,46" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M -48,30 C -40,44 -46,58 -52,65" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M -70,46 C -62,62 -68,76 -76,85" strokeWidth="1.1" strokeLinecap="round" />
    </g>

    {/* Leaf 3 - Lower Right Sprouting Leaf */}
    <g transform="translate(112, 265) rotate(32)">
      <path
        d="M 0,0 C 25,-10 68,-8 112,95 C 62,98 22,62 0,0 Z"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M 0,0 C 35,25 70,55 112,95" strokeWidth="1.5" />

      {/* Veins - Upper Side */}
      <path d="M 18,10 C 26,4 38,4 42,9" strokeWidth="1" strokeLinecap="round" />
      <path d="M 36,21 C 48,13 62,14 68,21" strokeWidth="1" strokeLinecap="round" />
      <path d="M 58,36 C 72,26 86,29 93,37" strokeWidth="1" strokeLinecap="round" />

      {/* Veins - Lower Side */}
      <path d="M 24,14 C 19,25 23,35 28,40" strokeWidth="1" strokeLinecap="round" />
      <path d="M 42,26 C 35,38 40,50 46,57" strokeWidth="1" strokeLinecap="round" />
      <path d="M 62,40 C 55,54 60,67 67,74" strokeWidth="1" strokeLinecap="round" />
    </g>

    {/* Leaf 4 - Small Bottom Leaf */}
    <g transform="translate(122, 355) rotate(-18)">
      <path
        d="M 0,0 C -20,-8 -55,-4 -88,85 C -50,80 -15,50 0,0 Z"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M 0,0 C -28,20 -56,45 -88,85" strokeWidth="1.4" />

      {/* Veins */}
      <path d="M -15,9 C -23,3 -32,4 -36,8" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M -30,18 C -40,11 -52,12 -58,18" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M -20,12 C -15,22 -18,30 -22,35" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M -36,22 C -30,33 -35,42 -40,48" strokeWidth="0.9" strokeLinecap="round" />
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