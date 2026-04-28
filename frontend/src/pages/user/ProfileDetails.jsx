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
      <div>
        <h1 className="text-3xl font-black text-heading tracking-tight">Profile Details</h1>
        <p className="text-sm text-muted font-bold mt-1">Manage your personal information</p>
      </div>

      <div className="card-premium p-8 border border-border/50 bg-[#FAF9F6]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border-2 border-secondary/20 p-4 rounded-2xl font-bold text-heading focus:border-secondary outline-none transition-all"
                placeholder="Enter your full name"
                disabled={loading}
              />
            ) : (
              <div className="bg-white border border-border/50 p-4 rounded-2xl font-bold text-heading">
                {formData.name || user?.name || 'Not provided'}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Email Address</label>
            <div className="bg-gray-100 border border-border/50 p-4 rounded-2xl font-bold text-muted cursor-not-allowed">
              {user?.email}
            </div>
            {isEditing && <p className="text-[10px] text-muted ml-2 font-bold">Email cannot be changed.</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white border-2 border-secondary/20 p-4 rounded-2xl font-bold text-heading focus:border-secondary outline-none transition-all"
                placeholder="Enter your phone number"
                disabled={loading}
              />
            ) : (
              <div className="bg-white border border-border/50 p-4 rounded-2xl font-bold text-heading">
                {formData.phone || user?.phone || 'Not provided'}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Member Since</label>
            <div className="bg-white border border-border/50 p-4 rounded-2xl font-bold text-heading">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Recently Joined'}
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-end gap-3 pt-6 border-t border-border/50">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="bg-white"
                disabled={loading}
              >
                CANCEL
              </Button>
              <Button
                onClick={handleSave}
                loading={loading}
              >
                SAVE CHANGES
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setIsEditing(true)} className="shadow-sm">
              EDIT PROFILE
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;