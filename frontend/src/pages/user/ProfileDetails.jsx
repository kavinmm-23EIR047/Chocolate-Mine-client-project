import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Edit3 } from 'lucide-react';
import Button from '../../components/ui/Button';

const ProfileDetails = () => {
  const { user } = useAuth();
  
  const defaultAddress = user?.addresses?.find(addr => addr.isDefault) || user?.addresses?.[0];

  const infoItems = [
    { label: 'Full Name', value: user?.name, icon: User },
    { label: 'Email Address', value: user?.email, icon: Mail },
    { label: 'Mobile Number', value: user?.phone || 'Not provided', icon: Phone },
    { label: 'Saved Address', value: defaultAddress ? `${defaultAddress.houseNo}, ${defaultAddress.street}` : 'No address saved', icon: MapPin },
    { label: 'City', value: defaultAddress?.city || 'Not provided', icon: MapPin },
    { label: 'Pincode', value: defaultAddress?.pincode || 'Not provided', icon: MapPin },
    { 
      label: 'Member Since', 
      value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
      }) : 'Recently Joined', 
      icon: Calendar 
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-heading tracking-tight uppercase">Profile Details</h1>
          <p className="text-sm text-muted font-bold mt-1">Your personal account information</p>
        </div>
        <Link to="/account/settings">
          <Button variant="secondary" className="flex items-center gap-2 shadow-sm">
            <Edit3 size={16} />
            EDIT PROFILE
          </Button>
        </Link>
      </div>

      <div className="card-premium p-8 border border-border/50 bg-card-soft rounded-[2.5rem]">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {infoItems.map((item, i) => (
            <div key={i} className="space-y-2 group">
              <div className="flex items-center gap-2 ml-2">
                <item.icon size={14} className="text-primary/60" />
                <label className="text-[10px] font-black text-muted uppercase tracking-widest">{item.label}</label>
              </div>
              <div className="bg-card border border-border/40 p-4 rounded-2xl font-bold text-heading shadow-sm group-hover:border-primary/20 transition-all">

                {item.value || 'Not provided'}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
          <div className="p-3 bg-card rounded-xl shadow-sm text-primary border border-border/50">

            <Edit3 size={20} />
          </div>
          <div>
            <h4 className="font-black text-heading text-sm uppercase tracking-tight">Need to change something?</h4>
            <p className="text-xs text-muted font-medium mt-1">All personal information including your mobile number and saved addresses can be updated in the Account Settings section.</p>
            <Link to="/account/settings" className="inline-block mt-3 text-xs font-black text-primary hover:underline uppercase tracking-widest">
              Go to Account Settings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;