import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ArrowRight,
  Package,
  Download,
  Share2,
  CalendarCheck
} from 'lucide-react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import orderService from '../services/orderService';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const orderId = searchParams.get('id') || location.state?.orderId || null;
  const orderNumber = location.state?.orderNumber || orderId;

  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleViewDetails = () => {
    if (orderId) {
      navigate(`/account/orders/${orderId}`);
    }
  };

  /* ----------------------------------------
     CORRECT BACKEND PDF DOWNLOAD
  ---------------------------------------- */
  const handleDownloadInvoice = async () => {
    if (!orderId) {
      alert('Order ID missing');
      return;
    }

    try {
      const res = await orderService.downloadInvoice(orderId);

      const blob = res.data;

      const url = window.URL.createObjectURL(blob);

      const fileName = `Invoice-${orderNumber}.pdf`;

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;

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
        await navigator.share({
          title: 'My Order - The Chocolate Mine',
          text: `View order ${orderNumber}`,
          url: orderUrl
        });
      } else {
        await navigator.clipboard.writeText(orderUrl);
        alert('Order link copied');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4 relative overflow-hidden">

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card-premium p-8 md:p-12 max-w-2xl w-full text-center relative z-10 bg-white"
      >

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
          className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto mb-8 border-4 border-white shadow-xl shadow-success/20"
        >
          <CheckCircle2 size={48} />
        </motion.div>

        <h1 className="text-4xl lg:text-5xl font-black text-heading uppercase tracking-tighter mb-4">
          Order Confirmed!
        </h1>

        <p className="text-sm font-bold text-muted mb-8 leading-relaxed max-w-md mx-auto">
          Payment successful. Your order is confirmed and being prepared.
        </p>

        <div className="bg-[#FAF9F6] border rounded-2xl p-6 mb-8 flex flex-col sm:flex-row gap-6">

          <div className="flex-1 text-left border-b sm:border-b-0 sm:border-r pb-4 sm:pb-0 sm:pr-6">
            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">
              Order Number
            </p>
            <p className="text-xl font-black text-heading uppercase">
              {orderNumber || 'Pending'}
            </p>
          </div>

          <div className="flex-1 text-left">
            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">
              Status
            </p>

            <div className="flex items-center gap-2">
              <CalendarCheck size={18} className="text-success" />
              <p className="text-xl font-black text-success">Confirmed</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">

          <button
            onClick={handleViewDetails}
            className="p-4 rounded-xl border hover:bg-secondary/5"
          >
            <Package size={20} className="mx-auto mb-2" />
            <span className="text-[10px] font-black uppercase">Details</span>
          </button>

          <button
            onClick={handleDownloadInvoice}
            className="p-4 rounded-xl border hover:bg-secondary/5"
          >
            <Download size={20} className="mx-auto mb-2" />
            <span className="text-[10px] font-black uppercase">Invoice</span>
          </button>

          <button
            onClick={handleShareOrder}
            className="p-4 rounded-xl border hover:bg-secondary/5"
          >
            <Share2 size={20} className="mx-auto mb-2" />
            <span className="text-[10px] font-black uppercase">Share</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">

          <Link to="/account/orders" className="flex-1">
            <Button variant="outline" className="w-full bg-[#FAF9F6]">
              VIEW ORDERS
            </Button>
          </Link>

          <Link to="/" className="flex-1">
            <Button className="w-full" icon={ArrowRight}>
              CONTINUE SHOPPING
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;