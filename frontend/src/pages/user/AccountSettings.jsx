import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Phone, 
  MapPin, 
  ChevronRight, 
  Lock, 
  Check, 
  X 
} from 'lucide-react';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const AccountSettings = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [activeSection, setActiveSection] = useState(null); // 'profile', 'password'

  const defaultAddress = user?.addresses?.find(addr => addr.isDefault) || user?.addresses?.[0];

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: defaultAddress?.street || '',
    city: defaultAddress?.city || '',
    pincode: defaultAddress?.pincode || ''
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Mobile validation
    if (profileData.phone && !/^\d{10}$/.test(profileData.phone.replace(/\D/g, ''))) {
      return toast.error("Please enter a valid 10-digit mobile number");
    }

    try {
      setLoading(true);
      const res = await api.put('/users/profile', profileData);
      if (res.data?.data) {
        updateUser(res.data.data);
        toast.success("Profile updated successfully!");
        setActiveSection(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return toast.error("User email not found");
    try {
      setLoading(true);
      await authService.forgotPassword(user.email);
      toast.success("OTP sent to your email!");
      setTimeout(() => navigate('/forgot-password', { state: { email: user.email } }), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-heading tracking-tight uppercase">Account Settings</h1>
        <p className="text-sm text-muted font-bold mt-1">Manage your security and profile information</p>
      </div>

      <div className="space-y-6">
        {/* Profile Information Section */}
        <div className={`card-premium border transition-all ${activeSection === 'profile' ? 'border-primary ring-4 ring-primary/5 p-8' : 'border-border/50 bg-[#FAF9F6] p-6 hover:border-primary/20'}`}>
          {activeSection !== 'profile' ? (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-black text-heading text-lg leading-tight uppercase tracking-tight">Edit Profile</h3>
                  <p className="text-xs font-bold text-muted mt-1">Update your name, mobile number, and primary address.</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setActiveSection('profile')} 
                className="w-full sm:w-auto shrink-0 bg-white"
              >
                EDIT
              </Button>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black text-heading text-xl uppercase tracking-tight">Personal Info</h3>
                <button type="button" onClick={() => setActiveSection(null)} className="text-muted hover:text-error transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Full Name</label>
                  <input 
                    type="text" 
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full bg-white border-2 border-border/50 p-4 rounded-2xl font-bold text-heading focus:border-primary outline-none transition-all shadow-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Mobile Number</label>
                  <input 
                    type="tel" 
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full bg-white border-2 border-border/50 p-4 rounded-2xl font-bold text-heading focus:border-primary outline-none transition-all shadow-sm"
                    placeholder="10-digit number"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Primary Address (Street/Area)</label>
                  <input 
                    type="text" 
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    className="w-full bg-white border-2 border-border/50 p-4 rounded-2xl font-bold text-heading focus:border-primary outline-none transition-all shadow-sm"
                    placeholder="e.g. 123, Main Street, Coimbatore"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">City</label>
                  <input 
                    type="text" 
                    value={profileData.city}
                    onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                    className="w-full bg-white border-2 border-border/50 p-4 rounded-2xl font-bold text-heading focus:border-primary outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Pincode</label>
                  <input 
                    type="text" 
                    value={profileData.pincode}
                    onChange={(e) => setProfileData({...profileData, pincode: e.target.value})}
                    className="w-full bg-white border-2 border-border/50 p-4 rounded-2xl font-bold text-heading focus:border-primary outline-none transition-all shadow-sm"
                    placeholder="6-digit code"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" loading={loading} className="flex-1 shadow-lg">
                  <Check size={18} className="mr-2" />
                  SAVE CHANGES
                </Button>
                <Button type="button" variant="outline" onClick={() => setActiveSection(null)} className="flex-1 bg-white">
                  CANCEL
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Security / Password Section */}
        <div className="card-premium p-6 border border-border/50 bg-[#FAF9F6] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/20 transition-all">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="font-black text-heading text-lg leading-tight uppercase tracking-tight">Security</h3>
              <p className="text-xs font-bold text-muted mt-1">Receive a password reset link to your email address.</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handlePasswordReset} 
            className="w-full sm:w-auto shrink-0 bg-white"
            loading={loading}
          >
            RESET PASSWORD
          </Button>
        </div>

        {/* Notification Section (Optional/Existing) */}
        <div className="card-premium p-6 border border-border/50 bg-[#FAF9F6] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/20 transition-all opacity-60">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-black text-heading text-lg leading-tight uppercase tracking-tight">Privacy</h3>
              <p className="text-xs font-bold text-muted mt-1">Manage your account data and privacy settings.</p>
            </div>
          </div>
          <Button variant="outline" className="w-full sm:w-auto shrink-0 bg-white" disabled>MANAGE</Button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
