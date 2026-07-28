import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, RefreshCw, ShoppingCart, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentFailedModal = ({ isOpen, onClose, reason, orderId }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRetry = () => {
    onClose();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Pop Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-md bg-card text-foreground border border-red-500/30 rounded-3xl shadow-2xl overflow-hidden z-10 cursor-default my-auto"
        >
          {/* Top Decorative Alert Banner */}
          <div className="relative bg-gradient-to-r from-red-600/15 via-rose-500/20 to-red-600/15 p-6 sm:p-7 text-center border-b border-red-500/20">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-muted hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Glowing Icon Container */}
            <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-3">
              <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl animate-pulse" />
              <div className="relative w-full h-full bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
                <AlertOctagon className="w-9 h-9 sm:w-10 sm:h-10 animate-bounce-short" />
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-heading uppercase tracking-tight">
              Payment Failed
            </h3>
            <p className="text-xs sm:text-sm text-red-500 font-bold mt-1">
              Your transaction could not be completed
            </p>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-4 text-left">
            {/* Reason Box */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs sm:text-sm">
              <p className="text-muted font-bold uppercase tracking-wider text-[10px] mb-1">Failure Reason</p>
              <p className="font-semibold text-red-600 dark:text-red-400 break-words leading-relaxed">
                {reason || 'Payment was cancelled or rejected by payment gateway.'}
              </p>
            </div>

            {/* Refund & Safety Guarantee Note */}
            <div className="flex items-start gap-3 bg-surface/50 border border-border/40 rounded-2xl p-3.5 text-xs text-muted">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <p className="font-bold text-foreground">Safe & Secure Assurance</p>
                <p className="text-[11px] text-muted">
                  If any money was deducted from your account, it will be automatically refunded by your bank within <strong>3–5 business days</strong>.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                onClick={handleRetry}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all flex items-center justify-center gap-2 group"
              >
                <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                <span>Try Payment Again</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleViewCart}
                  className="py-2.5 px-3 bg-card border border-border hover:border-primary/40 text-heading font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart size={14} />
                  <span>View Cart</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-2.5 px-3 bg-surface/50 border border-border/40 hover:bg-border/30 text-muted hover:text-foreground font-bold text-xs rounded-xl transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentFailedModal;
