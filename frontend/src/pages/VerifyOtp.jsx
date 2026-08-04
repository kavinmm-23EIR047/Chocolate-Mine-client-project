import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const email = location.state?.email || new URLSearchParams(location.search).get('email') || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) navigate('/login', { replace: true });
  }, [email, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifySignup({ email, otp });
      const { user, token } = response.data;
      if (!user?.isVerified || !token) {
        throw new Error('Verification response was incomplete');
      }
      updateUser(user, token);
      toast.success('Account verified successfully!');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await authService.resendSignupOtp(email);
      toast.success('A new OTP was sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-6">
      <div className="w-full max-w-md rounded-3xl bg-[var(--card)] border border-[var(--border)] p-8 shadow-xl">
        <button type="button" onClick={() => navigate('/login')} className="mb-6 text-[var(--muted)] hover:text-[var(--heading)]">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-2xl font-black text-[var(--heading)] uppercase">Verify your email</h1>
        <p className="mt-2 text-sm font-bold text-[var(--muted)]">Enter the 6-digit code sent to {email}.</p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <input
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full rounded-xl border-2 border-[var(--border)] bg-[var(--background)] px-4 py-4 text-center text-2xl font-black tracking-[0.5em] text-[var(--heading)] outline-none focus:border-[var(--primary)]"
            aria-label="Verification OTP"
          />
          <button type="submit" disabled={loading || resending} className="w-full rounded-xl bg-[var(--primary)] px-6 py-4 font-black uppercase tracking-widest text-[var(--button-text)] disabled:opacity-60">
            {loading ? <Loader2 className="mx-auto animate-spin" size={20} /> : 'Verify & Continue'}
          </button>
        </form>

        <button type="button" onClick={resend} disabled={loading || resending} className="mt-5 w-full text-sm font-black text-[var(--primary)] hover:underline disabled:opacity-60">
          {resending ? 'Sending...' : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;
