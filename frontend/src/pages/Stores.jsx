import React from 'react';
import { MapPin, Clock, Store, ExternalLink } from 'lucide-react';

const Stores = () => {
  return (
    <div className="responsive-container py-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-black uppercase tracking-widest mb-6" style={{ color: 'var(--heading)' }}>Our Store</h1>
      <p className="text-muted max-w-lg mb-10">Visit our outlet to experience the magic of freshly baked cakes and premium chocolates.</p>
      
      <div className="w-full max-w-lg">
        <div className="p-6 rounded-2xl flex flex-col items-start text-left gap-3 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary">
              <Store size={20} />
            </div>
            <h3 className="font-bold text-lg">The Chocolate Mine</h3>
          </div>
          <div className="flex items-start gap-2 text-muted text-sm">
            <MapPin size={16} className="shrink-0 mt-0.5" />
            <p>No.7, 3, Race Course Rd, near Codissia Office Building,<br />Anna Silai, Gopalapuram, Coimbatore, Tamil Nadu 641018</p>
          </div>
          <div className="flex items-center gap-2 text-muted text-sm">
            <Clock size={16} className="shrink-0" />
            <p>Mon - Sun: 9:00 AM - 10:00 PM</p>
          </div>
          <a
            href="https://maps.app.goo.gl/1aPW7FVjAmLBnwxc7"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all"
          >
            <ExternalLink size={14} />
            View on Google Maps
          </a>
        </div>
      </div>
    </div>
  );
};

export default Stores;
