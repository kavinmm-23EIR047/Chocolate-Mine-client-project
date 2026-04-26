import React from 'react';

const Logo = ({ className = "w-12 h-12", variant = "default" }) => {
  // Use the logo from public folder as requested
  // Replace 'logo.png' with the actual filename when provided
  const logoPath = '/logo.png'; 

  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`}>
      <img 
        src={logoPath} 
        alt="The Chocolate Mine" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default Logo;
