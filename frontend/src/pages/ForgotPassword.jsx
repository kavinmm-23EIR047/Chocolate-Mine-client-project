import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Key, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP + New Password
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // If redirected from AccountSettings with email pre-filled, skip to step 2
  useEffect(() => {
    if (location.state?.email) {
      setStep(2);
    }
  }, [location.state]);

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/auth/reset-password', { email, otp, password: newPassword });
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.message || 'Invalid OTP or session expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-8 sm:p-12"
        >
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Mail size={32} />
                  </div>
                  <h2 className="text-3xl font-black text-heading mb-2">Forgot Password?</h2>
                  <p className="text-muted font-medium">Enter your email and we'll send you a 6-digit OTP to reset your password.</p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-secondary transition-colors" size={20} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-input border border-border text-heading pl-16 pr-6 py-5 rounded-2xl outline-none focus:border-secondary transition-all font-bold"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full py-5 rounded-2xl shadow-premium"
                    icon={ArrowRight}
                  >
                    SEND RESET OTP
                  </Button>
                </form>

                <div className="text-center pt-4">
                  <Link to="/login" className="text-xs font-black text-muted hover:text-secondary uppercase tracking-widest transition-colors">
                    Back to Login
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-success/10 text-success rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck size={32} />
                  </div>
                  <h2 className="text-3xl font-black text-heading mb-2">Reset Password</h2>
                  <p className="text-muted font-medium">Enter the 6-digit code sent to <span className="text-heading font-bold">{email}</span></p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">6-Digit OTP</label>
                    <div className="relative group">
                      <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-secondary transition-colors" size={20} />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-input border border-border text-heading pl-16 pr-6 py-5 rounded-2xl outline-none focus:border-secondary transition-all font-bold tracking-[0.5em]"
                        placeholder="000000"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">New Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-secondary transition-colors" size={20} />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-input border border-border text-heading pl-16 pr-6 py-5 rounded-2xl outline-none focus:border-secondary transition-all font-bold"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full py-5 rounded-2xl shadow-premium"
                    icon={CheckCircle2}
                  >
                    RESET PASSWORD
                  </Button>
                </form>

                <div className="text-center pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-black text-muted hover:text-secondary uppercase tracking-widest transition-colors"
                  >
                    Try another email
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
