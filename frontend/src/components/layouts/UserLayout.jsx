import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Truck, Phone, HelpCircle, MapPin, ArrowLeft } from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import Logo from '../Logo';
import MobileBottomNav from '../layout/MobileBottomNav';
import PureVegBadge from '../ui/PureVegBadge';
import NotificationPrompt from '../ui/NotificationPrompt';
import NotificationBanner from '../ui/NotificationBanner';
import CocoaLeavesBackground from '../ui/CocoaLeavesBackground';
import PaymentFailedModal from '../ui/PaymentFailedModal';
import { useAuth } from '../../context/AuthContext';
import PureVegIcon from '../../assets/pure veg.webp';

const UserLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [paymentFailedModalOpen, setPaymentFailedModalOpen] = useState(false);
  const [paymentFailedReason, setPaymentFailedReason] = useState('');
  const [paymentFailedOrderId, setPaymentFailedOrderId] = useState(null);

  useEffect(() => {
    const isPaymentFailedParam = searchParams.get('payment') === 'failed' || searchParams.get('status') === 'failed';
    const isPaymentFailedState = location.state?.paymentFailed;

    if (isPaymentFailedParam || isPaymentFailedState) {
      const reason = location.state?.reason || searchParams.get('reason') || 'Your payment transaction was cancelled or declined.';
      const orderId = location.state?.orderId || searchParams.get('orderId') || null;
      setPaymentFailedReason(reason);
      setPaymentFailedOrderId(orderId);
      setPaymentFailedModalOpen(true);
    }
  }, [location, searchParams]);

  const handleClosePaymentFailedModal = () => {
    setPaymentFailedModalOpen(false);
    if (searchParams.get('payment') === 'failed' || searchParams.get('status') === 'failed') {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('payment');
      newParams.delete('status');
      newParams.delete('reason');
      newParams.delete('orderId');
      setSearchParams(newParams, { replace: true });
    }
    if (location.state?.paymentFailed) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  };

  const isProductPage = location.pathname.startsWith('/product/');
  const isAuthPage = ['/login', '/register', '/forgot-password'].some(path => location.pathname.toLowerCase().startsWith(path));

  const hasPermission = 'Notification' in window && Notification.permission === 'granted';
  const hasFcmToken = user?.fcmTokens && user.fcmTokens.length > 0;
  const showBanner = user && (!hasPermission || !hasFcmToken);

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      {/* ── COCOA LEAF BACKGROUND WATERMARKS (LIGHT THEME: DARK BROWN, DARK THEME: LIGHT BEIGE) ── */}
      <CocoaLeavesBackground />
      <header className={`sticky top-0 z-[200] w-full ${isAuthPage ? 'hidden md:block' : ''}`}>
        <NotificationBanner />
        <Navbar />
      </header>

      {/* ── RESPONSIVE INFO BANNER ── */}
      <div className={`bg-[#4E2820] dark:bg-[#E8D3CB] py-2 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-300 ${isAuthPage ? 'hidden md:block' : ''}`}>

        {/* DESKTOP/TABLET LAYOUT (md and up) */}
        <div className="hidden md:flex items-center justify-between responsive-container gap-4">
          {/* Left: Pure Veg & Eggless */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img src={PureVegIcon} alt="100% Pure Veg" className="w-5 h-5 object-contain shrink-0" />
            <span className="text-xs lg:text-xs xl:text-sm font-black uppercase tracking-[0.12em] text-[#4ade80] dark:text-[#1B5E20] hidden lg:inline-block">100% Pure Veg & Eggless cakes across the store</span>
            <span className="text-xs font-black uppercase tracking-[0.1em] text-[#4ade80] dark:text-[#1B5E20] inline-block lg:hidden">100% Pure Veg & Eggless Store</span>
          </div>

          {/* Center: Delivery */}
          <div className="flex items-center gap-2 text-[#F2E2DB] dark:text-[#120806] text-xs lg:text-xs xl:text-sm font-black uppercase tracking-[0.12em] shrink-0">
            <Truck size={16} className="shrink-0" />
            <span>Delivery in Coimbatore within 3 Hours</span>
          </div>

          {/* Right: Call & Important Routes */}
          <div className="flex items-center gap-4 lg:gap-6 text-xs lg:text-xs xl:text-sm font-black uppercase tracking-[0.12em] text-[#4ade80] dark:text-[#4E2820] shrink-0">
            <a href="tel:+919150670077" className="flex items-center gap-1.5 hover:text-white dark:hover:text-[#120806] transition-colors">
              <Phone size={16} className="shrink-0" /> +91 91506 70077
            </a>
            <Link to="/help" className="flex items-center gap-1.5 hover:text-white dark:hover:text-[#120806] transition-colors">
              <HelpCircle size={15} className="shrink-0" /> Help
            </Link>
            <Link to="/stores" className="flex items-center gap-1.5 hover:text-white dark:hover:text-[#120806] transition-colors">
              <MapPin size={15} className="shrink-0" /> Stores
            </Link>
          </div>
        </div>

        {/* MOBILE LAYOUT (below md) */}
        <div className="flex md:hidden items-center justify-between w-full gap-1 sm:gap-2">
          {/* Left: Pure Veg & Eggless */}
          <div className="flex items-center gap-1 shrink-0">
            <img src={PureVegIcon} alt="100% Pure Veg" className="w-3.5 h-3.5 object-contain shrink-0" />
          </div>

          {/* Center: Delivery */}
          <div className="flex items-center gap-1 text-[#F2E2DB] dark:text-[#120806] text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider mx-0.5 whitespace-nowrap">
            <Truck size={12} className="shrink-0 text-[#F2E2DB] dark:text-[#120806]" />
            <span>3Hrs Delivery in CBE</span>
          </div>

          {/* Right: Phone Call Number & Icon links */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 text-[#4ade80] dark:text-[#4E2820]">
            <a href="tel:+919150670077" className="flex items-center gap-0.5 hover:text-white dark:hover:text-[#120806] transition-colors">
              <Phone size={11} className="shrink-0" />
              <span className="font-black tracking-tight text-[8.5px] sm:text-[9px] whitespace-nowrap">+91 91506 70077</span>
            </a>
            <Link to="/help" className="hover:text-white dark:hover:text-[#120806] transition-colors" title="Help">
              <HelpCircle size={13} />
            </Link>
            <Link to="/stores" className="hover:text-white dark:hover:text-[#120806] transition-colors" title="Stores">
              <MapPin size={13} />
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-grow min-w-0">
        <Outlet />
      </main>
      
      <div className={`${isProductPage ? "hidden lg:block" : "block"} ${isAuthPage ? 'hidden md:block' : ''}`}>
        <Footer />
      </div>
      {!isAuthPage && <MobileBottomNav />}
      <NotificationPrompt />
      <PaymentFailedModal
        isOpen={paymentFailedModalOpen}
        onClose={handleClosePaymentFailedModal}
        reason={paymentFailedReason}
        orderId={paymentFailedOrderId}
      />
    </div>
  );
};

export default UserLayout;