import { useRef, useState } from 'react';
import { CheckCircle2, Loader2, Phone, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const PhoneVerification = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const sendOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(phone)) return toast.error('Enter a valid 10-digit mobile number.');

    try {
      setLoading(true);
      await api.post('/auth/phone-verification/send-otp', { phone });
      setOtpSent(true);
      setOtp(['', '', '', '', '', '']);
      toast.success('OTP sent to your mobile number.');
      setTimeout(() => otpRefs.current[0]?.focus(), 0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOtp = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Enter the complete 6-digit OTP.');

    try {
      setLoading(true);
      const response = await api.post('/auth/phone-verification/verify-otp', { otp: code });
      updateUser({ ...user, ...response.data.user, phoneVerified: true });
      toast.success('Mobile number verified successfully.');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck size={28} />
        </div>
        <h1 className="text-2xl font-black text-heading">Complete Your Profile</h1>
        <p className="mt-2 text-sm font-medium text-muted">Please verify your mobile number to continue.</p>
        {user?.email && <p className="mt-2 text-xs font-bold text-muted">Signed in as {user.email}</p>}

        {!otpSent ? (
          <form className="mt-7 space-y-5" onSubmit={sendOtp}>
            <label className="block text-xs font-black uppercase tracking-widest text-heading">Mobile number</label>
            <div className="flex gap-2">
              <span className="flex items-center rounded-xl border border-input-border bg-muted/10 px-3 font-black text-heading">+91</span>
              <div className="relative flex-1">
                <Phone className="pointer-events-none absolute left-3 top-3.5 text-muted" size={18} />
                <input
                  autoFocus
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="w-full rounded-xl border border-input-border bg-background py-3 pl-10 pr-3 font-bold text-heading outline-none focus:border-primary"
                />
              </div>
            </div>
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-black uppercase tracking-widest text-button-text disabled:opacity-60">
              {loading && <Loader2 className="animate-spin" size={18} />}
              Send OTP
            </button>
          </form>
        ) : (
          <form className="mt-7 space-y-5" onSubmit={verifyOtp}>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-heading">Enter OTP</p>
              <p className="mt-1 text-xs font-medium text-muted">Sent to +91 {phone}</p>
            </div>
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => { otpRefs.current[index] = element; }}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => updateOtp(index, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Backspace' && !digit && index > 0) otpRefs.current[index - 1]?.focus();
                  }}
                  className="h-12 w-11 rounded-xl border border-input-border bg-background text-center text-lg font-black text-heading outline-none focus:border-primary"
                />
              ))}
            </div>
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-black uppercase tracking-widest text-button-text disabled:opacity-60">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
              Verify OTP
            </button>
            <button type="button" disabled={loading} onClick={() => setOtpSent(false)} className="w-full text-xs font-black uppercase tracking-widest text-primary">
              Change mobile number
            </button>
          </form>
        )}
      </section>
    </main>
  );
};

export default PhoneVerification;
