import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Search, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition, setAddress }) => {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      
      // Reverse Geocoding
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={DefaultIcon} />
  );
};

const MapSelector = ({ onSelect }) => {
  const [position, setPosition] = useState({ lat: 11.00454, lng: 76.97511 }); 
  const [address, setAddress] = useState("The Chocolate Mine Shop, Coimbatore");

  const handleConfirm = () => {
    onSelect({ position, address });
  };

  return (
    <div className="card-premium overflow-hidden">
      <div className="p-4 bg-[var(--card)] border-b border-[var(--border)]">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search your area..." 
            className="input-field pl-10"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Search className="absolute left-3 top-3 text-[var(--muted)]" size={18} />
        </div>
      </div>

      <div className="h-[300px] sm:h-[400px] relative">
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={position} 
            setPosition={setPosition} 
            setAddress={setAddress} 
          />
        </MapContainer>
        
        <button className="absolute bottom-4 right-4 z-[1000] p-3 bg-[var(--card)] rounded-full shadow-2xl text-[var(--secondary)] border border-[var(--border)] hover:scale-110 transition-transform">
          <Navigation size={24} />
        </button>
      </div>

      <div className="p-4 bg-[var(--card)] flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-[var(--secondary)]/10 text-[var(--secondary)] rounded-lg">
            <MapPin size={24} />
          </div>
          <div className="text-sm">
            <p className="font-black text-[var(--heading)] uppercase tracking-tighter">Deliver to</p>
            <p className="text-[var(--muted)] line-clamp-1 font-bold">{address}</p>
          </div>
        </div>
        <button 
          onClick={handleConfirm}
          className="btn-primary w-full sm:w-auto shadow-premium"
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
};

export default MapSelector;
