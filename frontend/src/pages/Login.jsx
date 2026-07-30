import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowLeft, Eye, EyeOff, Sparkles, Cake, Candy, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login({ email, password });
      toast.success('Welcome back to The Chocolate Mine!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
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
          <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/djkfvoxpx/image/upload/v1784865898/categories/uo822q9gaftknwyldjtg.png')] bg-cover bg-center opacity-15 mix-blend-luminosity pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120806] via-[#1C0E09]/85 to-[#2A160E]/80 pointer-events-none" />

          {/* Floating subtle background icons */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 right-6 text-amber-400/20 pointer-events-none"
          >
            <Cake size={90} strokeWidth={1} />
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-16 left-6 text-amber-500/20 pointer-events-none"
          >
            <Candy size={76} strokeWidth={1} />
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
              <span>The Chocolate Mine</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white uppercase">
              Handcrafted <br />
              <span className="bg-gradient-to-r from-[#F5E6D3] via-[#DDB68A] to-[#C89D5A] bg-clip-text text-transparent">
                Special Cakes & Bento Delights
              </span>
            </h1>

            <p className="text-xs sm:text-sm font-medium text-white/80 leading-relaxed">
              Order fresh custom birthday cakes, bento treats (250g), and signature cocoa creations online.
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

            {/* Bakery Service Features */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                <ShieldCheck size={15} className="text-[#DDB68A] shrink-0" />
                <span>Custom Weight Pricing (250g, 500g, 1kg+)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-white/90">
                <ShieldCheck size={15} className="text-[#DDB68A] shrink-0" />
                <span>Fresh Local Delivery & Live Order Tracking</span>
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
          <div className="max-w-md w-full mx-auto space-y-7">
            
            {/* Form Header */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[var(--border)]/40">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--heading)] tracking-tight uppercase">
                  Sign In
                </h2>
                <p className="text-xs font-bold text-[var(--muted)] mt-1">
                  Log in to manage your orders & profile
                </p>
              </div>

              {/* Horizontal Pill Switcher */}
              <div className="flex items-center bg-[var(--background)] p-1 rounded-xl border border-[var(--border)] shrink-0">
                <span className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-[var(--primary)] text-[var(--button-text)] shadow-sm whitespace-nowrap">
                  Sign In
                </span>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[var(--muted)] hover:text-[var(--heading)] transition-colors whitespace-nowrap"
                >
                  Register
                </Link>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-[var(--heading)] block ml-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 text-[#4E321E] dark:text-amber-400/80 pointer-events-none" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#DED0BD] focus:bg-[#E6D9C8] dark:bg-[#1A0E0A] border-2 border-[#A88D6F]/70 dark:border-amber-900/40 text-[#27190e] dark:text-[#F5E6D3] pl-10 pr-4 py-3 rounded-xl outline-none font-bold text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder:text-[#665040]/70 dark:placeholder:text-white/40 shadow-inner"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-[var(--heading)]">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-black text-[var(--primary)] hover:underline uppercase tracking-wider"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 text-[#4E321E] dark:text-amber-400/80 pointer-events-none" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-[var(--primary)] text-[var(--button-text)] hover:brightness-110 font-black text-xs uppercase tracking-widest shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>Signing In...</span>
                  ) : (
                    <>
                      <LogIn size={16} />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Redirect */}
            <div className="text-center pt-3 border-t border-[var(--border)]/30">
              <p className="text-xs font-bold text-[var(--muted)]">
                New explorer?{' '}
                <Link
                  to="/register"
                  className="font-black text-[var(--primary)] hover:underline uppercase tracking-wider ml-1"
                >
                  Create an account →
                </Link>
              </p>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

