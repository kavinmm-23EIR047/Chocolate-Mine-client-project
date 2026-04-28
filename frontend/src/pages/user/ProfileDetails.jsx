import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ProfileDetails = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await api.put('/users/profile', {
        name: formData.name,
        phone: formData.phone
      });
      
      if (response.data?.data) {
        updateUser(response.data.data);
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-heading tracking-tighter uppercase">Profile Details</h1>
          <p className="text-[11px] text-muted font-black mt-1 uppercase tracking-widest">Manage your personal information</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="bg-primary text-button-text shadow-premium uppercase tracking-widest text-[11px] font-black px-10 py-5">EDIT PROFILE</Button>
        )}
      </div>

      <div className="bg-card rounded-[2.5rem] p-8 sm:p-12 border border-border/40 shadow-premium">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2 block">Full Name</label>
            {isEditing ? (
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-surface border-2 border-border/50 p-5 rounded-2xl font-black text-heading focus:border-primary outline-none transition-all shadow-sm placeholder:text-muted/40"
                placeholder="Enter your full name"
                disabled={loading}
              />
            ) : (
              <div className="bg-surface/30 border border-border/40 p-5 rounded-2xl font-black text-heading shadow-sm min-h-[64px] flex items-center">
                {formData.name || user?.name || 'Not provided'}
              </div>
            )}
          </div>
          
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2 block">Email Address</label>
            <div className="bg-background border border-border/30 p-5 rounded-2xl font-black text-muted/60 cursor-not-allowed shadow-sm min-h-[64px] flex items-center overflow-hidden text-ellipsis">
              {user?.email}
            </div>
            {isEditing && <p className="text-[10px] text-muted ml-2 font-black uppercase tracking-widest mt-2">Email cannot be changed.</p>}
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2 block">Phone Number</label>
            {isEditing ? (
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-surface border-2 border-border/50 p-5 rounded-2xl font-black text-heading focus:border-primary outline-none transition-all shadow-sm placeholder:text-muted/40"
                placeholder="Enter your phone number"
                disabled={loading}
              />
            ) : (
              <div className="bg-surface/30 border border-border/40 p-5 rounded-2xl font-black text-heading shadow-sm min-h-[64px] flex items-center">
                {formData.phone || user?.phone || 'Not provided'}
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2 block">Member Since</label>
            <div className="bg-surface/30 border border-border/40 p-5 rounded-2xl font-black text-heading shadow-sm min-h-[64px] flex items-center">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Recently Joined'}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-12 flex justify-end gap-6 pt-10 border-t border-border/30">
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              className="px-10 py-5 uppercase tracking-widest text-[11px] font-black border-2 border-border"
              disabled={loading}
            >
              CANCEL
            </Button>
            <Button 
              onClick={handleSave} 
              loading={loading}
              className="bg-primary text-button-text px-10 py-5 shadow-premium uppercase tracking-widest text-[11px] font-black"
            >
              SAVE CHANGES
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDetails;