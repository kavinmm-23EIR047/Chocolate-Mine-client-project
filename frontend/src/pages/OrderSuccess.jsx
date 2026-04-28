import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ArrowRight,
  Package,
  Download,
  Share2,
} from 'lucide-react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import orderService from '../services/orderService';

/* ─────────────────────────────────────────────
   Inline SVG Scooter (no emoji – clean vectors)
   Colours pulled from CSS variables so it works
   in both dark and light themes.
───────────────────────────────────────────── */
const ScooterSVG = () => (
  <svg
    viewBox="0 0 200 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
    aria-hidden="true"
  >
    {/* Rear wheel */}
    <motion.circle
      cx="52" cy="88" r="16"
      stroke="var(--primary)" strokeWidth="4" fill="var(--surface)"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.55, ease: 'linear' }}
      style={{ transformOrigin: '52px 88px' }}
    />
    <circle cx="52" cy="88" r="4" fill="var(--primary)" />
    <line x1="52" y1="72" x2="52" y2="104" stroke="var(--border)" strokeWidth="1.5" />
    <line x1="36" y1="88" x2="68" y2="88" stroke="var(--border)" strokeWidth="1.5" />

    {/* Front wheel */}
    <motion.circle
      cx="152" cy="88" r="16"
      stroke="var(--primary)" strokeWidth="4" fill="var(--surface)"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.55, ease: 'linear' }}
      style={{ transformOrigin: '152px 88px' }}
    />
    <circle cx="152" cy="88" r="4" fill="var(--primary)" />
    <line x1="152" y1="72" x2="152" y2="104" stroke="var(--border)" strokeWidth="1.5" />
    <line x1="136" y1="88" x2="168" y2="88" stroke="var(--border)" strokeWidth="1.5" />

    {/* Body */}
    <rect x="55" y="84" width="90" height="8" rx="4" fill="var(--card)" />
    <path d="M58 84 C58 70 68 58 80 56 L120 54 C134 54 148 62 152 72 L152 84 Z"
      fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
    <rect x="75" y="46" width="52" height="10" rx="5" fill="var(--secondary)" />
    <line x1="148" y1="72" x2="144" y2="58" stroke="var(--border)" strokeWidth="3" strokeLinecap="round" />
    <line x1="140" y1="52" x2="150" y2="52" stroke="var(--foreground)" strokeWidth="3" strokeLinecap="round" />
    {/* headlight */}
    <circle cx="160" cy="66" r="5" fill="var(--warning)" stroke="var(--warning-light)" strokeWidth="1.5" />

    {/* Delivery box */}
    <rect x="60" y="40" width="32" height="22" rx="3" fill="var(--primary)" />
    <rect x="62" y="42" width="28" height="18" rx="2" fill="var(--primary-hover)" />
    <line x1="76" y1="42" x2="76" y2="60" stroke="var(--primary)" strokeWidth="1.5" />
    <line x1="60" y1="51" x2="92" y2="51" stroke="var(--primary)" strokeWidth="1.5" />

    {/* Rider – torso */}
    <rect x="108" y="32" width="28" height="24" rx="6" fill="var(--secondary)" />
    <rect x="119" y="32" width="4" height="24" rx="1" fill="var(--accent)" opacity="0.7" />
    {/* arm */}
    <path d="M136 40 C142 38 146 44 144 52" stroke="var(--secondary)" strokeWidth="5" strokeLinecap="round" fill="none" />
    <circle cx="144" cy="52" r="3" fill="var(--foreground)" />
    {/* leg */}
    <path d="M108 52 C104 60 100 66 96 72" stroke="var(--secondary)" strokeWidth="6" strokeLinecap="round" fill="none" />
    <ellipse cx="94" cy="74" rx="6" ry="3" fill="var(--foreground)" />
    {/* helmet */}
    <ellipse cx="122" cy="26" rx="16" ry="14" fill="var(--accent)" />
    <path d="M108 28 Q114 36 136 30" stroke="var(--card)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
    <ellipse cx="116" cy="18" rx="4" ry="2.5" fill="white" opacity="0.25" transform="rotate(-20 116 18)" />
  </svg>
);

/* ─────────────────────────────────────────────
   Confetti
───────────────────────────────────────────── */
const CONFETTI_COLORS = ['#D4A017', '#3D1F1A', '#EF5350', '#66BB6A', '#FDF4F2'];
const Confetti = () => {
  const particles = Array.from({ length: 40 });
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ top: '-10%', left: `${Math.random() * 100}%`, scale: Math.random() * 0.5 + 0.5, rotate: 0, opacity: 1 }}
          animate={{ top: '110%', rotate: 360 * (Math.random() > 0.5 ? 1 : -1), opacity: [1, 1, 0] }}
          transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, ease: 'linear', delay: Math.random() * 5 }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] }}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   OrderSuccess
───────────────────────────────────────────── */
const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const orderId = searchParams.get('id') || location.state?.orderId || null;
  const orderNumber = location.state?.orderNumber || orderId;

  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const handleViewDetails = () => {
    if (orderId) navigate(`/account/orders/${orderId}`);
  };

  const handleDownloadInvoice = async () => {
    if (!orderId) { alert('Order ID missing'); return; }
    try {
      const res = await orderService.downloadInvoice(orderId);
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Invoice download failed:', err);
      alert('Unable to download invoice');
    }
  };

  const handleShareOrder = async () => {
    const orderUrl = `${window.location.origin}/account/orders/${orderId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My Order - The Chocolate Mine', text: `View order ${orderNumber}`, url: orderUrl });
      } else {
        await navigator.clipboard.writeText(orderUrl);
        alert('Order link copied');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {showConfetti && <Confetti />}

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/10 rounded-full blur-[100px] sm:blur-[120px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-accent/5 rounded-full blur-[100px] sm:blur-[120px] -translate-y-1/2" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-card w-full max-w-lg relative z-10 rounded-[2rem] sm:rounded-[3rem] border border-border/40 shadow-premium overflow-hidden"
      >
        {/* Inner padding */}
        <div className="px-6 sm:px-10 pt-8 sm:pt-12 pb-8 sm:pb-10 flex flex-col items-center text-center">

          {/* Success icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.2 }}
            className="relative w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-6 sm:mb-10"
          >
            <div className="absolute inset-0 bg-success/20 rounded-[1.5rem] sm:rounded-[2.5rem] animate-ping opacity-20" />
            <div className="w-full h-full bg-success/10 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center justify-center text-success border border-success/20 shadow-xl shadow-success/10 relative z-10">
              <CheckCircle2 size={40} className="sm:hidden" />
              <CheckCircle2 size={56} className="hidden sm:block" />
            </div>
          </motion.div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-heading uppercase tracking-tighter mb-4 sm:mb-6 leading-none">
            Order <br /><span className="text-primary">Confirmed!</span>
          </h1>

          <p className="text-[10px] sm:text-[11px] font-black text-muted uppercase tracking-[0.25em] sm:tracking-[0.3em] mb-8 sm:mb-10 leading-relaxed max-w-xs mx-auto opacity-80">
            Payment successful. Your delicacies are being prepared with love.
          </p>

          {/* ── Scooter delivery animation ── */}
          <div className="mb-8 sm:mb-12 relative w-full max-w-[280px] sm:max-w-xs mx-auto">
            {/* Road */}
            <div className="absolute bottom-3 left-0 right-0 h-[2px] bg-border/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full flex gap-4"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                style={{ width: '200%' }}
              >
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="h-full w-6 rounded-full bg-border/60 flex-shrink-0" />
                ))}
              </motion.div>
            </div>

            {/* Scooter bobbing */}
            <motion.div
              className="relative h-20 sm:h-24"
              animate={{ y: [0, -3, 0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 0.45, ease: 'easeInOut' }}
            >
              <ScooterSVG />
            </motion.div>

            {/* Speed lines */}
            {[{ w: 18, t: '20%' }, { w: 26, t: '40%' }, { w: 14, t: '60%' }].map((l, i) => (
              <motion.div
                key={i}
                className="absolute left-0 rounded-full bg-border/40"
                style={{ height: 2, width: l.w, top: l.t }}
                animate={{ x: [4, -40], opacity: [0, 0.7, 0] }}
                transition={{ repeat: Infinity, duration: 0.5, ease: 'linear', delay: i * 0.15 }}
              />
            ))}

            <p className="absolute bottom-0 left-0 right-0 text-[7px] sm:text-[8px] font-black text-muted uppercase tracking-[0.4em] sm:tracking-[0.5em] opacity-40 text-center">
              Delivering Happiness
            </p>
          </div>

          {/* Order info card */}
          <div className="bg-surface/50 border border-border/40 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 mb-6 sm:mb-10 flex flex-col sm:flex-row gap-5 sm:gap-8 w-full text-left">
            <div className="flex-1 sm:border-r border-border/20 pb-4 sm:pb-0 sm:pr-8 border-b sm:border-b-0">
              <p className="text-[9px] sm:text-[10px] font-black text-muted uppercase tracking-widest mb-1.5 opacity-60">
                Order Number
              </p>
              <p className="text-lg sm:text-2xl font-black text-heading uppercase tracking-tight break-all">
                {orderNumber || 'Pending'}
              </p>
            </div>
            <div className="flex-1 sm:pl-4">
              <p className="text-[9px] sm:text-[10px] font-black text-muted uppercase tracking-widest mb-1.5 opacity-60">
                Status
              </p>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(102,187,106,0.5)] flex-shrink-0" />
                <p className="text-lg sm:text-2xl font-black text-success uppercase tracking-tight">Confirmed</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12 w-full">
            {[
              { icon: Package, label: 'Details', action: handleViewDetails },
              { icon: Download, label: 'Invoice', action: handleDownloadInvoice },
              { icon: Share2, label: 'Share', action: handleShareOrder },
            ].map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                onClick={action}
                className="p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-border/30 bg-surface/30 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <Icon size={18} className="mx-auto mb-1.5 sm:mb-2 text-muted group-hover:text-primary transition-colors sm:hidden" />
                <Icon size={22} className="mx-auto mb-1.5 sm:mb-2 text-muted group-hover:text-primary transition-colors hidden sm:block" />
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-muted group-hover:text-primary transition-colors">
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 w-full">
            <Link to="/account/orders" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-12 sm:h-14 border-2 border-border/60 hover:border-primary text-[9px] sm:text-[10px] font-black tracking-widest uppercase px-2"
              >
                VIEW ALL ORDERS
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button
                className="w-full h-12 sm:h-14 bg-primary text-button-text shadow-premium text-[9px] sm:text-[10px] font-black tracking-widest uppercase px-2"
                icon={ArrowRight}
              >
                CONTINUE SHOPPING
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;