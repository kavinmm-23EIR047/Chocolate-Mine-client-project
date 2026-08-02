import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import LightLogo from '../assets/light logo.png';
import { signInWithGoogle } from '../firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
    <div className="min-h-screen min-h-[100dvh] w-full flex items-center justify-center bg-gray-50/50 dark:bg-[#0C0503] p-0 sm:p-6 lg:p-10 relative">
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
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Signing In...
                      </>
                    ) : 'Sign In'}
                    {!loading && <ArrowRight size={18} />}
                  </button>
                  
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-[var(--border)]"></div>
                    <span className="flex-shrink-0 mx-4 text-[var(--muted)] text-xs font-bold uppercase tracking-wider">Or</span>
                    <div className="flex-grow border-t border-[var(--border)]"></div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setGoogleLoading(true);
                        await signInWithGoogle();
                        toast.success('Welcome back to The Chocolate Mine!');
                        navigate('/');
                      } catch (err) {
                        toast.error('Google Sign-In failed');
                      } finally {
                        setGoogleLoading(false);
                      }
                    }}
                    disabled={googleLoading || loading}
                    className="w-full py-4 px-6 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-[#222] font-black text-sm uppercase tracking-widest shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {googleLoading ? <Loader2 size={18} className="animate-spin" /> : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    Continue with Google
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