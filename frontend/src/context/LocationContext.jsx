import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    return localStorage.getItem('deliveryLocation') || 'coimbatore';
  });

  useEffect(() => {
    localStorage.setItem('deliveryLocation', location);
  }, [location]);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useDeliveryLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useDeliveryLocation must be used within a LocationProvider');
  }
  return context;
};
