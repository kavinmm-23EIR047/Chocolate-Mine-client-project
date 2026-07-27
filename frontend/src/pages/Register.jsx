import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, ArrowLeft, Phone, Eye, EyeOff, Sparkles, CheckCircle2, ShieldCheck, Gift } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const GoogleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      setLoading(true);
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      toast.success('Account created! Welcome to The Chocolate Mine.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--background)] p-4 sm:p-6 lg:p-10 relative">
      {/* Background Glow */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />

      {/* 2-Column Split Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-5xl bg-[var(--card)] border-2 border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10"
      >
        {/* Left Side: Real Website Content & Brand Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#2A160E] via-[#1C0E09] to-[#120806] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r-2 border-[var(--border)]">
          {/* Subtle overlay background */}
          <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/djkfvoxpx/image/upload/v1784866478/categories/k86t1wm1kmkqgkhnirwp.png')] bg-cover bg-center opacity-15 mix-blend-luminosity pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120806] via-[#1C0E09]/85 to-[#2A160E]/80 pointer-events-none" />

          {/* Floating subtle background icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute top-10 right-6 text-amber-400/20 pointer-events-none"
          >
            <Gift size={90} strokeWidth={1} />
          </motion.div>

          {/* Top Back Link */}
          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#DDB68A] hover:text-[#FAF0E6] transition-colors"
            >
              <ArrowLeft size={16} /> Back to Shop
            </Link>
          </div>

          {/* Main Website Content */}
          <div className="relative z-10 my-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A2C18]/60 border border-[#8C5124]/60 text-[#F5E6D3] text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="animate-pulse text-[#DDB68A]" />
              <span>Gourmet Member Club</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white uppercase">
              Join The <br />
              <span className="bg-gradient-to-r from-[#F5E6D3] via-[#DDB68A] to-[#C89D5A] bg-clip-text text-transparent">
                Chocolate Mine Family
              </span>
            </h1>

            <p className="text-xs sm:text-sm font-medium text-white/80 leading-relaxed">
              Create an account to track custom cake orders, save weight preferences, and receive birthday rewards.
            </p>

            {/* Real Store Product Categories */}
            <div className="pt-2 space-y-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#DDB68A]">
                Explore Popular Categories:
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/shop?category=special cakes"
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-[#8C5124]/40 border border-white/15 text-xs font-bold text-[#F5E6D3] transition-all"
                >
                  ⭐ Special Cakes
                </Link>
                <Link
                  to="/shop?category=birthday cakes"
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-[#8C5124]/40 border border-white/15 text-xs font-bold text-[#F5E6D3] transition-all"
                >
                  🎂 Birthday Cakes
                </Link>
                <Link
                  to="/shop?category=bento cakes"
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-[#8C5124]/40 border border-white/15 text-xs font-bold text-[#F5E6D3] transition-all"
                >
                  🍰 Bento Cakes (250g)
                </Link>
              </div>
            </div>

            {/* Member Perks */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                <CheckCircle2 size={15} className="text-[#DDB68A] shrink-0" />
                <span>Save Custom Cake Specs & Messages</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                <CheckCircle2 size={15} className="text-[#DDB68A] shrink-0" />
                <span>Priority Slot Booking & Fast Checkout</span>
              </div>
            </div>
          </div>

          {/* Bottom Security & Brand Footer */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60 font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-emerald-400" /> 256-bit Secure
            </span>
            <span className="font-extrabold text-[#DDB68A]">The Chocolate Mine</span>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 bg-[var(--card)] flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Form Header */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[var(--border)]/40">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--heading)] tracking-tight uppercase">
                  Create Account
                </h2>
                <p className="text-xs font-bold text-[var(--muted)] mt-1">
                  Join our gourmet dessert lovers community
                </p>
              </div>

              {/* Horizontal Pill Switcher */}
              <div className="flex items-center bg-[var(--background)] p-1 rounded-xl border border-[var(--border)] shrink-0">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[var(--muted)] hover:text-[var(--heading)] transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <span className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-[var(--primary)] text-[var(--button-text)] shadow-sm whitespace-nowrap">
                  Register
                </span>
              </div>
            </div>

            {/* Google Sign-up Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#DED0BD] dark:bg-[#1A0E0A] border-2 border-[var(--border)] hover:border-[var(--primary)] text-[#27190e] dark:text-[#F5E6D3] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              <GoogleIcon size={18} />
              <span>Sign Up with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className="w-full border-t border-[var(--border)]/40" />
              <span className="absolute bg-[var(--card)] px-4 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
                OR FILL DETAILS
              </span>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-[var(--heading)] block ml-1">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 text-[#4E321E] dark:text-amber-400/80 pointer-events-none" size={16} />
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className="w-full bg-[#DED0BD] focus:bg-[#E6D9C8] dark:bg-[#1A0E0A] border-2 border-[#A88D6F]/70 dark:border-amber-900/40 text-[#27190e] dark:text-[#F5E6D3] pl-10 pr-4 py-3 rounded-xl outline-none font-bold text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[#665040]/70 dark:placeholder:text-white/40 shadow-inner"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-[var(--heading)] block ml-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 text-[#4E321E] dark:text-amber-400/80 pointer-events-none" size={16} />
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full bg-[#DED0BD] focus:bg-[#E6D9C8] dark:bg-[#1A0E0A] border-2 border-[#A88D6F]/70 dark:border-amber-900/40 text-[#27190e] dark:text-[#F5E6D3] pl-10 pr-4 py-3 rounded-xl outline-none font-bold text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[#665040]/70 dark:placeholder:text-white/40 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-[var(--heading)] block ml-1">
                    Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3.5 text-[#4E321E] dark:text-amber-400/80 pointer-events-none" size={16} />
                    <input
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="w-full bg-[#DED0BD] focus:bg-[#E6D9C8] dark:bg-[#1A0E0A] border-2 border-[#A88D6F]/70 dark:border-amber-900/40 text-[#27190e] dark:text-[#F5E6D3] pl-10 pr-4 py-3 rounded-xl outline-none font-bold text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[#665040]/70 dark:placeholder:text-white/40 shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Passwords Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-[var(--heading)] block ml-1">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 text-[#4E321E] dark:text-amber-400/80 pointer-events-none" size={16} />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-[#DED0BD] focus:bg-[#E6D9C8] dark:bg-[#1A0E0A] border-2 border-[#A88D6F]/70 dark:border-amber-900/40 text-[#27190e] dark:text-[#F5E6D3] pl-10 pr-10 py-3 rounded-xl outline-none font-bold text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[#665040]/70 dark:placeholder:text-white/40 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[#4E321E] dark:text-amber-400 hover:text-[var(--heading)] transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-[var(--heading)] block ml-1">
                    Confirm
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 text-[#4E321E] dark:text-amber-400/80 pointer-events-none" size={16} />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-[#DED0BD] focus:bg-[#E6D9C8] dark:bg-[#1A0E0A] border-2 border-[#A88D6F]/70 dark:border-amber-900/40 text-[#27190e] dark:text-[#F5E6D3] pl-10 pr-10 py-3 rounded-xl outline-none font-bold text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[#665040]/70 dark:placeholder:text-white/40 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 text-[#4E321E] dark:text-amber-400 hover:text-[var(--heading)] transition-colors p-1"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-[var(--primary)] text-[var(--button-text)] hover:brightness-110 font-black text-xs uppercase tracking-widest shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Redirect */}
            <div className="text-center pt-3 border-t border-[var(--border)]/30">
              <p className="text-xs font-bold text-[var(--muted)]">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-black text-[var(--primary)] hover:underline uppercase tracking-wider ml-1"
                >
                  Sign In Here →
                </Link>
              </p>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

