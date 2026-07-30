import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowLeft, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import LightLogo from '../assets/light logo.png';

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
      if (err.response?.data?.requiresOtp) {
        toast.error('Please verify your email first.');
        // User could be redirected to an OTP verify page, or login via OTP if implemented.
      } else {
        toast.error(err.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-gray-50/50 dark:bg-[#0C0503] p-0 sm:p-6 lg:p-10 relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full min-h-[100dvh] sm:min-h-0 sm:h-auto sm:max-w-6xl bg-[var(--card)] sm:rounded-3xl sm:shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 sm:border border-[var(--border)]/30"
      >
        {/* Left Side: Brand Panel (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-1/2 relative flex-col justify-center items-center text-white overflow-hidden p-12">
          {/* Background image */}
          <div className="absolute inset-0 bg-[url('/assets/auth-bg.png')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
          
          <div className="relative z-10 text-center w-full max-w-sm">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight uppercase mb-6 text-white drop-shadow-md">
              Welcome <br /> <span className="text-[#DDB68A]">Back</span>
            </h1>
            <p className="text-sm font-medium text-white/95 leading-relaxed mb-8 drop-shadow">
              Sign in to manage your special cake orders, bento delights, and enjoy exclusive member perks.
            </p>
          </div>
          
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center text-xs font-bold text-white/60">
            <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-400" /> Secure Login</span>
            <span>The Chocolate Mine &copy; {new Date().getFullYear()}</span>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="w-full md:w-1/2 flex flex-col justify-start md:justify-center p-6 sm:p-10 lg:p-14 bg-[var(--card)] min-h-[100dvh] sm:min-h-[600px] overflow-y-auto">
          <div className="max-w-sm w-full mx-auto mt-0 md:mt-auto">
            
            {/* Mobile App Style Header */}
            <div className="md:hidden -mx-6 sm:-mx-10 -mt-6 sm:-mt-10 mb-8 rounded-b-[2.5rem] overflow-hidden relative shadow-md h-[260px]">
              <div className="absolute inset-0 bg-[url('/assets/auth-bg.png')] bg-cover bg-center"></div>
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              <Link to="/" className="absolute top-6 left-6 p-2.5 text-white bg-white/20 backdrop-blur-md rounded-full transition-all hover:bg-white/30 active:scale-95 z-10 shadow-lg">
                <ArrowLeft size={20} />
              </Link>

              <div className="absolute bottom-6 left-0 right-0 text-center px-6 z-10 flex flex-col items-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-[1.25rem] bg-white shadow-2xl mb-3 overflow-hidden relative p-2">
                  <img src={LightLogo} alt="The Chocolate Mine" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
                  The Chocolate Mine
                </h1>
                <p className="text-white/80 font-bold text-sm mt-1 drop-shadow">Log in to manage your orders</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="hidden md:block text-center md:text-left mb-8">
                  <h2 className="text-2xl sm:text-3xl font-black text-[var(--heading)] tracking-tight uppercase">Sign In</h2>
                  <p className="text-sm font-bold text-[var(--muted)] mt-1">Please enter your credentials to login</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-[var(--heading)] block ml-1">Email Address</label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 text-[var(--muted)] pointer-events-none" size={18} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--heading)] pl-11 pr-4 py-3.5 rounded-xl outline-none font-bold text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder-[#4E2820]/50 dark:placeholder-[#E8D3CB]/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-[var(--heading)]">Password</label>
                      <Link to="/forgot-password" className="text-[11px] font-black text-[var(--primary)] hover:underline uppercase tracking-wider">
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 text-[var(--muted)] pointer-events-none" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--heading)] pl-11 pr-10 py-3.5 rounded-xl outline-none font-bold text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder-[#4E2820]/50 dark:placeholder-[#E8D3CB]/50"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-[var(--muted)] hover:text-[var(--heading)] transition-colors p-1">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-4 px-6 rounded-xl bg-[var(--primary)] text-[var(--button-text)] hover:brightness-110 font-black text-sm uppercase tracking-widest shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                    {!loading && <ArrowRight size={18} />}
                  </button>
                </form>

                <div className="text-center pt-6 pb-8 md:pb-0">
                  <p className="text-sm font-bold text-[var(--muted)]">
                    New explorer?{' '}
                    <Link to="/register" className="font-black text-[var(--primary)] hover:underline ml-1">Create an account</Link>
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;