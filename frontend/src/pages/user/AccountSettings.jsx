import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Phone,
  MapPin,
  ChevronRight,
  Lock,
  Check,
  X,
  Bell,
  EyeOff
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

  const handleNotifications = () => {
    toast.success("Notification settings updated!");
  };

  const handleDelete = () => {
    toast.error("Account deletion is disabled for demo purposes.");
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-heading tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted font-bold mt-1">Manage your security and preferences</p>
      </div>

      <div className="space-y-6">
        <div className="card-premium p-6 border border-border/50 bg-card shadow-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-black text-heading text-lg leading-tight">Change Password</h3>
              <p className="text-xs font-bold text-muted mt-1">Ensure your account is using a long, random password to stay secure.</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handlePasswordReset}
            className="w-full sm:w-auto shrink-0 border-2 border-border/60 hover:border-primary text-[10px] font-black tracking-widest uppercase px-8"
            loading={loading}
          >
            RESET PASSWORD
          </Button>
        </div>

        <div className="card-premium p-6 border border-border/50 bg-card shadow-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-info-light flex items-center justify-center text-info shrink-0 border border-info/10">
              <Bell size={24} />
            </div>
            <div>
              <h3 className="font-black text-heading text-lg leading-tight">Notifications</h3>
              <p className="text-xs font-bold text-muted mt-1">Manage email and SMS notifications for orders and offers.</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleNotifications} className="w-full sm:w-auto shrink-0 bg-button-alt-bg text-button-alt-text border-2 border-border/60 hover:border-primary">MANAGE</Button>
        </div>

        <div className="card-premium p-6 border-2 border-error/20 bg-error/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error shrink-0">
              <EyeOff size={24} />
            </div>
            <div>
              <h3 className="font-black text-error text-lg leading-tight">Danger Zone</h3>
              <p className="text-xs font-bold text-error/80 mt-1">Permanently delete your account and all associated data.</p>
            </div>
          </div>
          <button onClick={handleDelete} className="w-full sm:w-auto shrink-0 px-6 py-3 rounded-xl font-black text-xs text-error hover:bg-error hover:text-button-text border border-error transition-all">
            DELETE ACCOUNT
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
