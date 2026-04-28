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
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-heading tracking-tighter uppercase">Account Settings</h1>
        <p className="text-[11px] text-muted font-black mt-1 uppercase tracking-widest">Manage your security and preferences</p>
      </div>

      <div className="space-y-8">
        <div className="bg-card p-8 rounded-[2.5rem] border border-border/40 shadow-premium flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex gap-6 items-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/10">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="font-black text-heading text-xl leading-tight uppercase tracking-tight">Change Password</h3>
              <p className="text-[11px] font-bold text-muted mt-2 max-w-sm uppercase tracking-widest leading-relaxed">Ensure your account is using a long, random password to stay secure.</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handlePasswordReset} 
            className="w-full sm:w-auto shrink-0 border-2 border-border/60 hover:border-primary text-[10px] font-black tracking-widest uppercase px-8"
            loading={loading}
          >
            UPDATE
          </Button>
        </div>

        <div className="bg-card p-8 rounded-[2.5rem] border border-border/40 shadow-premium flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex gap-6 items-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 border border-blue-500/10">
              <Bell size={28} />
            </div>
            <div>
              <h3 className="font-black text-heading text-xl leading-tight uppercase tracking-tight">Notifications</h3>
              <p className="text-[11px] font-bold text-muted mt-2 max-w-sm uppercase tracking-widest leading-relaxed">Manage email and SMS notifications for orders and offers.</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleNotifications} className="w-full sm:w-auto shrink-0 border-2 border-border/60 hover:border-primary text-[10px] font-black tracking-widest uppercase px-8">MANAGE</Button>
        </div>

        <div className="bg-card p-8 rounded-[2.5rem] border-2 border-error/20 bg-error/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="flex gap-6 items-center relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center text-error shrink-0 border border-error/20">
              <EyeOff size={28} />
            </div>
            <div>
              <h3 className="font-black text-error text-xl leading-tight uppercase tracking-tight">Danger Zone</h3>
              <p className="text-[11px] font-black text-error/60 mt-2 max-w-sm uppercase tracking-widest leading-relaxed">Permanently delete your account and all associated data.</p>
            </div>
          </div>
          <button onClick={handleDelete} className="w-full sm:w-auto shrink-0 px-10 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase text-error hover:bg-error hover:text-white border-2 border-error/50 transition-all shadow-sm">
            DELETE ACCOUNT
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
