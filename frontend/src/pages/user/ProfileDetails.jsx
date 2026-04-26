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
                onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
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