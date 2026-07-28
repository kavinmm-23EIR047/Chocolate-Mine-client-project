import React from 'react';

/**
 * Botanically Accurate Cocoa Leaf (Theobroma cacao) Component
 * Features true obovate-oblong geometry, acuminate drip-tip, 
 * swollen pulvinus petiole joints, and arcuate pinnate venation.
 */
export const CocoaLeaf = ({
  className = "w-64 h-auto",
  color = "currentColor",
  fill = "none"
}: {
  className?: string;
  color?: string;
  fill?: string;
}) => (
  <svg
    viewBox="0 0 200 400"
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ stroke: color }}
  >
    {/* Petiole with Swollen Base & Top Pulvinus */}
    <g id="petiole">
      {/* Lower Pulvinus (Swelling at branch joint) */}
      <path
        d="M 96,385 C 93,375 93,365 95,355"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* Petiole Body */}
      <path
        d="M 95,355 C 97,330 96,305 98,280"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Upper Pulvinus (Swelling at leaf base joint) */}
      <path
        d="M 98,280 C 100,270 99,262 100,255"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </g>

    {/* Main Leaf Blade (Lamina) */}
    <g id="leaf-blade">
      {/* Outer Contour with Acuminate Drip Tip */}
      <path
        d="
          M 100,255 
          C 80,248 50,225 35,185 
          C 18,140 22,85 45,45 
          C 60,20 85,10 98,5 
          C 100,2 100,2 102,5 
          C 115,10 140,20 155,45 
          C 178,85 182,140 165,185 
          C 150,225 120,248 100,255 
          Z
        "
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Central Midrib (Primary Vein) */}
      <path
        d="M 100,255 C 99,190 101,100 100,5"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Secondary Veins (Right Side - Arcuate/Curved) */}
      <g id="veins-right" strokeWidth="1.3" strokeLinecap="round">
        <path d="M 100,230 C 115,222 135,212 146,198" />
        <path d="M 100,200 C 122,190 148,172 160,150" />
        <path d="M 101,165 C 128,152 156,130 166,102" />
        <path d="M 101,130 C 130,115 154,88 158,58" />
        <path d="M 100,95 C 125,80 142,56 142,32" />
        <path d="M 100,60 C 120,46 128,30 125,18" />
      </g>

      {/* Secondary Veins (Left Side - Alternate/Staggered) */}
      <g id="veins-left" strokeWidth="1.3" strokeLinecap="round">
        <path d="M 100,218 C 85,210 65,200 54,186" />
        <path d="M 100,185 C 78,175 52,157 40,135" />
        <path d="M 101,150 C 72,137 44,115 34,87" />
        <path d="M 101,115 C 72,100 48,73 44,43" />
        <path d="M 100,80 C 75,65 58,41 58,17" />
      </g>

      {/* Tertiary Reticulate Veinlets (Subtle interior details) */}
      <g id="tertiary-veins" strokeWidth="0.8" opacity="0.6" strokeLinecap="round">
        <path d="M 120,205 C 128,198 132,195 138,198" />
        <path d="M 125,165 C 135,158 142,155 150,158" />
        <path d="M 75,193 C 68,186 64,183 58,186" />
        <path d="M 70,150 C 60,143 52,140 45,143" />
      </g>
    </g>
  </svg>
);

export default CocoaLeavesBackground.jsx;