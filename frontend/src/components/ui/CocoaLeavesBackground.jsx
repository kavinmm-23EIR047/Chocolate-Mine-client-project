import React from 'react';

/**
 * Official Chocolate Mine Brochure Style Cocoa Leaves & Pod Vector Component
 * Directly styled after the official menu brochure artwork (top-left & top-right corner cocoa branches with veined cross-hatched leaves and cocoa pods).
 * 
 * Light Theme: Dark Cocoa Brown (#27190e) outline (opacity ~0.14)
 * Dark Theme: Light Beige Cream (#F2EADF) outline (opacity ~0.08)
 */

export const BrochureCocoaBranchLeft = ({ className = "w-full h-full", color = "currentColor" }) => (
  <svg
    viewBox="0 0 320 450"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ stroke: color }}
  >
    {/* Main Curved Stem extending from corner */}
    <path
      d="M10 0 C40 80, 90 180, 120 300 C135 360, 130 410, 120 450"
      strokeWidth="2.2"
      strokeLinecap="round"
    />

    {/* Cocoa Pod (Upper Stem Attachment) */}
    <g transform="translate(45, 80) rotate(15)">
      {/* Pod Body */}
      <path
        d="M0 0 C25 20, 35 60, 25 85 C10 100, -15 90, -28 65 C-35 40, -20 10, 0 0 Z"
        strokeWidth="2"
        fill="none"
      />
      {/* Pod Longitudinal Grooves */}
      <path d="M0 0 C10 25, 12 55, 0 82" strokeWidth="1.3" />
      <path d="M-10 5 C-15 30, -16 55, -12 78" strokeWidth="1.3" />
      <path d="M10 10 C18 32, 18 58, 8 75" strokeWidth="1.1" strokeDasharray="3 2" />
    </g>

    {/* Brochure Leaf 1 - Large Upper Leaf */}
    <g transform="translate(60, 120) rotate(20)">
      <path
        d="M0 0 C45 25, 105 55, 135 110 C85 105, 35 65, 0 0 Z"
        strokeWidth="2"
        fill="none"
      />
      {/* Midrib */}
      <path d="M0 0 C40 25, 85 60, 135 110" strokeWidth="1.6" />
      {/* Cross-Hatched Vein Details (Matching Official Brochure) */}
      <path d="M20 12 M20 12 L35 4 M38 22 L55 10 M55 33 L75 18 M72 45 L95 28 M90 58 L112 40" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M25 15 M25 15 L18 28 M42 26 L32 44 M58 37 L46 58 M76 49 L62 72 M95 62 L80 86" strokeWidth="1.2" strokeLinecap="round" />
    </g>

    {/* Brochure Leaf 2 - Left Hanging Leaf */}
    <g transform="translate(85, 200) rotate(-45)">
      <path
        d="M0 0 C-40 25, -95 60, -120 120 C-75 105, -30 60, 0 0 Z"
        strokeWidth="2"
        fill="none"
      />
      <path d="M0 0 C-35 25, -75 60, -120 120" strokeWidth="1.6" />
      <path d="M-18 12 L-32 3 M-35 22 L-52 8 M-52 34 L-72 16 M-70 48 L-92 26" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M-22 15 L-14 28 M-38 28 L-28 46 M-55 40 L-42 60 M-72 52 L-58 76" strokeWidth="1.2" strokeLinecap="round" />
    </g>

    {/* Brochure Leaf 3 - Lower Right Sprouting Leaf */}
    <g transform="translate(115, 270) rotate(35)">
      <path
        d="M0 0 C35 20, 85 45, 110 95 C70 90, 30 55, 0 0 Z"
        strokeWidth="2"
        fill="none"
      />
      <path d="M0 0 C30 20, 70 50, 110 95" strokeWidth="1.5" />
      <path d="M18 10 L30 3 M32 18 L48 8 M48 28 L66 14 M62 38 L82 22" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M20 12 L14 24 M34 22 L26 38 M48 32 L36 50 M62 42 L50 62" strokeWidth="1.1" strokeLinecap="round" />
    </g>

    {/* Brochure Leaf 4 - Bottom Tip Leaf */}
    <g transform="translate(125, 360) rotate(-15)">
      <path
        d="M0 0 C-25 20, -65 45, -85 85 C-55 75, -20 45, 0 0 Z"
        strokeWidth="1.8"
        fill="none"
      />
      <path d="M0 0 C-22 18, -52 42, -85 85" strokeWidth="1.4" />
      <path d="M-15 10 L-25 3 M-28 18 L-40 8 M-42 26 L-55 14" strokeWidth="1" strokeLinecap="round" />
      <path d="M-18 12 L-10 22 M-30 20 L-20 32 M-45 28 L-32 44" strokeWidth="1" strokeLinecap="round" />
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
