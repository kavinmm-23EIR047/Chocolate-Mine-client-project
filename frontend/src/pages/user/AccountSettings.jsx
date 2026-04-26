import React from 'react';
import { ShieldCheck, Bell, EyeOff } from 'lucide-react';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const AccountSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) return toast.error("User email not found");
    
    try {
      setLoading(true);
      await authService.forgotPassword(user.email);
      toast.success("OTP sent to your email!");
      // Navigate to forgot-password page with email pre-filled
      setTimeout(() => navigate('/forgot-password', { state: { email: user.email } }), 1500);
    } catch (err) {
      toast.error(err.message || "Failed to send reset OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleNotifications = () => {
    toast.success("Notification preferences saved!");
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      toast.error("Account deletion request submitted.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-heading tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted font-bold mt-1">Manage your security and preferences</p>
      </div>

      <div className="space-y-6">
        <div className="card-premium p-6 border border-border/50 bg-[#FAF9F6] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            className="w-full sm:w-auto shrink-0 bg-white"
            loading={loading}
          >
            UPDATE
          </Button>
        </div>

        <div className="card-premium p-6 border border-border/50 bg-[#FAF9F6] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
              <Bell size={24} />
            </div>
            <div>
              <h3 className="font-black text-heading text-lg leading-tight">Notifications</h3>
              <p className="text-xs font-bold text-muted mt-1">Manage email and SMS notifications for orders and offers.</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleNotifications} className="w-full sm:w-auto shrink-0 bg-white">MANAGE</Button>
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
          <button onClick={handleDelete} className="w-full sm:w-auto shrink-0 px-6 py-3 rounded-xl font-black text-xs text-error hover:bg-error hover:text-white border border-error transition-all">
            DELETE ACCOUNT
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
