import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Phone, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import LightLogo from '../assets/light logo.png';

const Register = () => {
  const [step, setStep] = useState(1); // 1 = details, 2 = otp
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
      window.location.href = '/'; 
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
                      {loading ? 'Processing...' : 'Continue'}
                      {!loading && <ArrowRight size={18} />}
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
                      {loading ? 'Verifying...' : 'Verify & Continue'}
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


