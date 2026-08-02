import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    try {
      return localStorage.getItem('deliveryLocation') || 'coimbatore';
    } catch (e) {
      return 'coimbatore';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('deliveryLocation', location);
    } catch (e) {}
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
