import React from 'react';


const Logo = ({ className = "w-12 h-12", variant = "default" }) => {
  const logoPath = "/logo.png";

  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`}>
      <img
        src={logoPath}
        alt="Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default Logo;