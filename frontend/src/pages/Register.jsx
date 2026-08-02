import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Phone, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import LightLogo from '../assets/light logo.png';
import { signInWithGoogle } from '../firebase';

const Register = () => {
  const [step, setStep] = useState(1); // 1 = details, 2 = otp
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      setLoading(true);
      const res = await authService.signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      if (res.data.requiresOtp) {
        toast.success(res.data.message || 'OTP sent to your email');
        setStep(2);
        setTimer(60);
      } else {
        toast.success('Account created!');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) return toast.error('Please enter complete OTP');
    
    try {
      setLoading(true);
      const res = await authService.verifySignup({
        email: formData.email,
        otp: otpValue
      });
      
      const { user: userData, token } = res.data;
      
      if (token && userData) {
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('user', JSON.stringify(userData));
      }

      toast.success('Account verified and created successfully!');
      navigate('/', { replace: true }); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await authService.resendSignupOtp(formData.email);
      toast.success('OTP resent successfully');
      setTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
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
              Taste the <br /> <span className="text-[#DDB68A]">Magic</span>
            </h1>
            <p className="text-sm font-medium text-white/95 leading-relaxed mb-8 drop-shadow">
              Join The Chocolate Mine family today. Manage your orders, customize your cakes, and get exclusive rewards.
            </p>
          </div>
          
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center text-xs font-bold text-white/60">
            <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-400" /> Secure Registration</span>
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
                <p className="text-white/80 font-bold text-sm mt-1 drop-shadow">Join the family</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="hidden md:block text-center md:text-left mb-8">
                    <h2 className="text-2xl sm:text-3xl font-black text-[var(--heading)] tracking-tight uppercase">Create Account</h2>
                    <p className="text-sm font-bold text-[var(--muted)] mt-1">Please enter your details to sign up</p>
                  </div>

                  <form onSubmit={handleDetailsSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-[var(--heading)] block ml-1">Full Name</label>
                      <div className="relative flex items-center">
                        <User className="absolute left-3.5 text-[var(--muted)] pointer-events-none" size={18} />
                        <input
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Name"
                          className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--heading)] pl-11 pr-4 py-3.5 rounded-xl outline-none font-bold text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder-[#4E2820]/50 dark:placeholder-[#E8D3CB]/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-[var(--heading)] block ml-1">Email Address</label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3.5 text-[var(--muted)] pointer-events-none" size={18} />
                        <input
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@example.com"
                          className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--heading)] pl-11 pr-4 py-3.5 rounded-xl outline-none font-bold text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder-[#4E2820]/50 dark:placeholder-[#E8D3CB]/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-[var(--heading)] block ml-1">Phone Number</label>
                      <div className="relative flex items-center">
                        <Phone className="absolute left-3.5 text-[var(--muted)] pointer-events-none" size={18} />
                        <input
                          name="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="9876543210"
                          className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--heading)] pl-11 pr-4 py-3.5 rounded-xl outline-none font-bold text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder-[#4E2820]/50 dark:placeholder-[#E8D3CB]/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase tracking-wider text-[var(--heading)] block ml-1">Password</label>
                        <div className="relative flex items-center">
                          <Lock className="absolute left-3.5 text-[var(--muted)] pointer-events-none" size={18} />
                          <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--heading)] pl-11 pr-10 py-3.5 rounded-xl outline-none font-bold text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder-[#4E2820]/50 dark:placeholder-[#E8D3CB]/50"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-[var(--muted)] hover:text-[var(--heading)] transition-colors p-1">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase tracking-wider text-[var(--heading)] block ml-1">Confirm</label>
                        <div className="relative flex items-center">
                          <Lock className="absolute left-3.5 text-[var(--muted)] pointer-events-none" size={18} />
                          <input
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--heading)] pl-11 pr-10 py-3.5 rounded-xl outline-none font-bold text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder-[#4E2820]/50 dark:placeholder-[#E8D3CB]/50"
                          />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 text-[var(--muted)] hover:text-[var(--heading)] transition-colors p-1">
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
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
                          Processing...
                        </>
                      ) : 'Continue'}
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
                          toast.success('Welcome to The Chocolate Mine!');
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
                      Already have an account?{' '}
                      <Link to="/login" className="font-black text-[var(--primary)] hover:underline ml-1">Sign In</Link>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 flex flex-col justify-center min-h-[400px]"
                >
                  <button onClick={() => setStep(1)} className="self-start text-[var(--muted)] hover:text-[var(--heading)] transition-colors">
                    <ArrowLeft size={24} />
                  </button>

                  <div className="text-center md:text-left mb-6">
                    <h2 className="text-2xl sm:text-3xl font-black text-[var(--heading)] tracking-tight uppercase">OTP Verification</h2>
                    <p className="text-sm font-bold text-[var(--muted)] mt-2">
                      We've sent a verification code to <br/>
                      <span className="text-[var(--heading)]">{formData.email}</span>
                    </p>
                  </div>

                  <form onSubmit={handleOtpSubmit} className="space-y-8">
                    <div className="flex justify-between gap-2 sm:gap-3">
                      {otp.map((data, index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength="1"
                          ref={(el) => (otpRefs.current[index] = el)}
                          value={data}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-black rounded-xl bg-[var(--background)] border-2 border-[#4E2820] dark:border-[#E8D3CB] text-[var(--heading)] focus:border-[var(--primary)] focus:-translate-y-1 focus:shadow-[0_4px_12px_rgba(212,163,115,0.4)] focus:scale-105 transition-all duration-300 outline-none"
                        />
                      ))}
                    </div>

                    <div className="text-center">
                      <p className="text-xs font-bold text-[var(--muted)]">
                        {timer > 0 ? (
                          `Resend OTP in ${timer}s`
                        ) : (
                          <button type="button" onClick={handleResendOtp} disabled={loading} className="text-[var(--primary)] hover:underline">
                            Resend OTP now
                          </button>
                        )}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 px-6 rounded-xl bg-[var(--primary)] text-[var(--button-text)] hover:brightness-110 font-black text-sm uppercase tracking-widest shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Verifying...
                        </>
                      ) : 'Verify & Continue'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;


