import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  X,
  Tag,
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import MapSelector from '../components/MapSelector';
import ScooterLoader from '../components/ScooterLoader';
import Button from '../components/ui/Button';

import { formatCurrency } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, fetchCart, applyCoupon, removeCoupon, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaderText, setLoaderText] = useState('Preparing your order...');
  const [currentStep, setCurrentStep] = useState(1);
  const [couponInput, setCouponInput] = useState('');
  
  // ✅ Prevent duplicate payment attempts
  const isProcessingPayment = useRef(false);

  const [deliveryInfo, setDeliveryInfo] = useState({
    address: null,
    position: null,
  });

  const [deliveryFee, setDeliveryFee] = useState(0);
  const [distance, setDistance] = useState(0);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [addressDetails, setAddressDetails] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    houseNo: '',
    street: '',
  });

  const SHOP_LAT = 11.004540031168712;
  const SHOP_LNG = 76.97510955713153;

  const slots = [
    { value: '10am-1pm', label: 'Morning (10 AM - 1 PM)' },
    { value: '1pm-4pm', label: 'Afternoon (1 PM - 4 PM)' },
    { value: '4pm-7pm', label: 'Evening (4 PM - 7 PM)' },
    { value: '7pm-10pm', label: 'Night (7 PM - 10 PM)' },
  ];

  const [deliverySlot, setDeliverySlot] = useState('4pm-7pm');

  // ==================== PRICE CALCULATION ====================

  const getItemBasePrice = (item) => {
    const hasOfferPrice = item.offerPrice !== undefined &&
      item.offerPrice !== null &&
      Number(item.offerPrice) > 0 &&
      Number(item.offerPrice) < Number(item.price);
    return hasOfferPrice ? Number(item.offerPrice) : Number(item.price);
  };

  const getItemCouponDiscount = (item) => {
    const appliedCoupon = cart?.appliedCoupon;
    if (!appliedCoupon || !item.coupon?.enabled) return 0;
    if (appliedCoupon.toUpperCase() !== item.coupon.code.toUpperCase()) return 0;

    const basePrice = getItemBasePrice(item);

    if (item.coupon.type === 'percent') {
      return Math.round((basePrice * item.coupon.value) / 100);
    }
    if (item.coupon.type === 'flat') {
      return Math.min(basePrice, Number(item.coupon.value));
    }
    return 0;
  };

  const getFinalItemPrice = (item) => {
    return getItemBasePrice(item) - getItemCouponDiscount(item);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (deliveryInfo.position) {
      const dist = calculateDistance(
        SHOP_LAT, SHOP_LNG,
        deliveryInfo.position.lat,
        deliveryInfo.position.lng
      );
      setDistance(dist);
      setDeliveryFee(Math.max(30, Math.round(dist * 4)));
    }
  }, [deliveryInfo.position]);

  const cartItems = cart?.items || [];
  const appliedCoupon = cart?.appliedCoupon;

  const subtotal = cartItems.reduce((sum, item) =>
    sum + getFinalItemPrice(item) * item.qty, 0
  );

  const originalTotal = cartItems.reduce((sum, item) =>
    sum + Number(item.price) * item.qty, 0
  );

  const offerDiscount = cartItems.reduce((sum, item) => {
    const mrp = Number(item.price);
    const base = getItemBasePrice(item);
    return sum + (mrp - base) * item.qty;
  }, 0);

  const couponDiscount = cartItems.reduce((sum, item) => {
    return sum + getItemCouponDiscount(item) * item.qty;
  }, 0);

  const gst = Math.round(subtotal * 0.18);
  const convenienceFee = Math.round(subtotal * 0.02);
  const total = subtotal + deliveryFee + gst + convenienceFee;

  // ==================== FETCH ADDRESSES ====================

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get('/users/addresses');
        setSavedAddresses(res.data.data);
        const defaultAddr = res.data.data.find(a => a.isDefault);
        if (defaultAddr) {
          handleSelectAddress(defaultAddr);
        }
      } catch (err) {
        console.error('Failed to fetch addresses');
      }
    };
    if (user) fetchAddresses();
  }, [user]);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setDeliveryInfo({
      address: `${addr.houseNo}, ${addr.street}, ${addr.city}`,
      position: { lat: addr.lat, lng: addr.lng }
    });
    setAddressDetails({
      fullName: addr.fullName,
      phone: addr.phone,
      houseNo: addr.houseNo,
      street: addr.street
    });
  };

  const validateForm = () => {
    if (!addressDetails.fullName.trim()) {
      toast.error('Please enter full name');
      return false;
    }
    if (!addressDetails.phone.trim()) {
      toast.error('Please enter phone number');
      return false;
    }
    if (!addressDetails.houseNo.trim() && !addressDetails.street.trim() && !deliveryInfo.address) {
      toast.error('Please enter a delivery address');
      return false;
    }
    if (!deliveryInfo.position) {
      toast.error('Please select delivery location on map');
      return false;
    }
    return true;
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return toast.error('Enter coupon code');
    try {
      await applyCoupon(code);
      toast.success(`Coupon ${code} applied!`);
      setCouponInput('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
    toast.success('Coupon removed');
  };

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePlaceOrder = async () => {
    // ✅ Prevent duplicate payment attempts
    if (isProcessingPayment.current) {
      toast.error('Payment already in progress. Please wait.');
      return;
    }

    if (!validateForm()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Session expired. Please login again.');
      navigate('/login');
      return;
    }

    // ✅ Check if Razorpay key is configured
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      toast.error('Payment configuration error. Please contact support.');
      console.error('Razorpay key is missing');
      return;
    }

    try {
      isProcessingPayment.current = true;
      setLoading(true);
      setLoaderText('Preparing your order...');
      
      const loadingInterval = setInterval(() => {
        setLoaderText(prev => {
          const messages = ['Confirming delivery address...', 'Calculating total...', 'Almost there...'];
          const nextIndex = messages.indexOf(prev) + 1;
          return nextIndex < messages.length ? messages[nextIndex] : prev;
        });
      }, 2000);

      const payload = {
        address: {
          fullName: addressDetails.fullName,
          phone: addressDetails.phone,
          houseNo: addressDetails.houseNo,
          street: addressDetails.street || deliveryInfo.address,
          city: 'Coimbatore',
          pincode: '641001',
          lat: deliveryInfo.position?.lat,
          lng: deliveryInfo.position?.lng,
        },
        deliveryDate: new Date(),
        deliverySlot,
      };

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        clearInterval(loadingInterval);
        setLoading(false);
        isProcessingPayment.current = false;
        toast.error('Payment gateway unavailable. Please check your internet connection.');
        return;
      }

      // ✅ Create order with backend
      const res = await api.post('/payment/create-order', {
        address: payload.address,
        deliveryDate: payload.deliveryDate,
        deliverySlot: payload.deliverySlot,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { razorpayOrder, orderId } = res.data.data;

      // ✅ Validate order response
      if (!razorpayOrder || !razorpayOrder.id) {
        throw new Error('Invalid order response from server');
      }

      clearInterval(loadingInterval);
      setLoading(false);

      // ✅ Get prefill data from selected address or user
      const prefillName = addressDetails.fullName || user?.name || '';
      const prefillContact = addressDetails.phone || user?.phone || '';
      const prefillEmail = user?.email || '';

      // ✅ Razorpay options with improved payment methods configuration
      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'The Chocolate Mine',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        // ✅ Explicitly enable all payment methods
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        // ✅ Configure display order - UPI first, then Card
        display: {
          blocks: {
            upi: {
              name: 'Pay with UPI',
              instruments: [
                {
                  method: 'upi',
                  flows: ['collect', 'intent', 'qr']
                }
              ]
            },
            cards: {
              name: 'Credit/Debit Card',
              instruments: [
                {
                  method: 'card',
                  flows: ['inapp']
                }
              ]
            }
          },
          sequence: ['block.upi', 'block.cards'],
          preference: {
            show_default_blocks: true
          }
        },
        handler: async function (response) {
          try {
            // ✅ Prevent duplicate verification
            if (isProcessingPayment.current) return;
            isProcessingPayment.current = true;
            setLoading(true);
            setLoaderText('Verifying your payment...');

            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            await fetchCart();
            setLoading(false);
            isProcessingPayment.current = false;
            toast.success('Payment successful! 🎉');
            navigate('/order-success', { state: { orderId } });
          } catch (verifyErr) {
            setLoading(false);
            isProcessingPayment.current = false;
            console.error('Payment verification error:', verifyErr);
            toast.error(verifyErr?.response?.data?.message || 'Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: async function () {
            // ✅ Always reset loading state when modal closes
            setLoading(false);
            isProcessingPayment.current = false;
            try {
              await api.post('/payment/log-failure', {
                orderId,
                reason: 'User closed payment window',
              });
            } catch (e) {
              console.error('Failed to log payment dismissal', e);
            }
            toast.error('Payment cancelled. You can try again.');
          },
        },
        // ✅ Safe prefill with fallbacks
        prefill: {
          name: prefillName,
          email: prefillEmail,
          contact: prefillContact,
        },
        // ✅ Theme color matching existing project
        theme: { color: '#4A2C2A' },
      };

      const razorpayInstance = new window.Razorpay(options);
      
      // ✅ Allow handler to run
      isProcessingPayment.current = false;
      razorpayInstance.open();

      razorpayInstance.on('payment.failed', async function (response) {
        // ✅ Reset all states on payment failure
        setLoading(false);
        isProcessingPayment.current = false;
        
        try {
          await api.post('/payment/log-failure', {
            orderId,
            reason: response.error?.description || 'Payment failed',
          });
        } catch (e) {
          console.error('Failed to log payment failure', e);
        }
        
        toast.error(`Payment failed: ${response.error?.description || 'Please try again'}`);
      });

      razorpayInstance.open();

    } catch (err) {
      // ✅ Ensure loading state is reset in all error cases
      setLoading(false);
      isProcessingPayment.current = false;
      
      if (err?.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
        return;
      }
      
      console.error('Order creation error:', err);
      toast.error(err?.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      // ✅ Additional safety: reset after 60 seconds if something hangs
      setTimeout(() => {
        if (isProcessingPayment.current) {
          isProcessingPayment.current = false;
          setLoading(false);
          toast.error('Payment timed out. Please try again.');
        }
      }, 60000);
    }
  };

  const availableCoupons = useMemo(() => {
    const coupons = new Set();
    cartItems.forEach(item => {
      if (item.coupon?.enabled) {
        coupons.add(item.coupon.code);
      }
    });
    return Array.from(coupons);
  }, [cartItems]);

  return (
    <div className="min-h-screen bg-background">
      <ScooterLoader isVisible={loading} text={loaderText} />

      {/* Header */}
      <div className="bg-card border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-xs text-muted">
            <button onClick={() => navigate('/cart')} className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft size={14} />
              Back to Cart
            </button>
            <ChevronRight size={14} />
            <span className="font-bold text-foreground">Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN - Forms */}
          <div className="lg:col-span-2 space-y-6">

            {/* Step 1: Delivery Address */}
            <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
              <div className="p-5 border-b border-border/50 bg-surface/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-button-text flex items-center justify-center text-[10px] font-black">1</div>
                  <h2 className="font-black text-heading text-sm uppercase tracking-widest">Delivery Address</h2>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-muted font-black uppercase tracking-widest">Saved Addresses</p>
                    <div className="grid gap-3">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr._id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`text-left p-6 border-2 rounded-[1.5rem] transition-all shadow-sm relative overflow-hidden group ${selectedAddressId === addr._id
                            ? 'border-accent bg-accent/5'
                            : 'border-border/30 hover:border-accent/30 bg-surface/30'
                          }`}
                      >
                        <div className="flex justify-between items-start relative z-10">
                          <div>
                            <span className="font-black text-heading text-base uppercase tracking-tight">{addr.fullName}</span>
                            <p className="text-[10px] text-muted font-black uppercase tracking-widest mt-1 italic">{addr.phone}</p>
                          </div>
                          {selectedAddressId === addr._id && (
                            <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-primary shadow-sm">
                              <CheckCircle2 size={14} />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted font-bold mt-4 line-clamp-2 leading-relaxed relative z-10">{addr.houseNo}, {addr.street}</p>
                        {selectedAddressId === addr._id && (
                          <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full blur-2xl -mr-10 -mt-10" />
                        )}
                      </button>
                    ))}
                    </div>
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/20"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px]">
                        <span className="bg-card px-3 text-muted font-black uppercase tracking-widest">OR</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowMap(true)}
                  className="w-full p-4 border-2 border-dashed border-border rounded-xl text-center text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5 transition-all"
                >
                  + Add New Address via Map
                </button>

                {deliveryInfo.position && (
                  <div className="mt-4 p-4 bg-success-light rounded-xl border border-success/10">
                    <p className="text-xs font-black text-success-text uppercase tracking-widest">Delivery Location Selected</p>
                    <p className="text-[11px] text-success mt-1 font-medium">{deliveryInfo.address}</p>
                    <p className="text-[10px] text-success/60 mt-1 font-bold">{distance.toFixed(1)} km from our bakery</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4 pt-6 border-t border-border/30">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-muted uppercase tracking-widest ml-2">Full Name *</label>
                    <input
                      className="input-field"
                      placeholder="Recipient name"
                      value={addressDetails.fullName}
                      onChange={(e) => setAddressDetails({ ...addressDetails, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-muted uppercase tracking-widest ml-2">Phone Number *</label>
                    <input
                      className="input-field"
                      placeholder="Contact number"
                      value={addressDetails.phone}
                      onChange={(e) => setAddressDetails({ ...addressDetails, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-muted uppercase tracking-widest ml-2">House/Flat No. *</label>
                    <input
                      className="input-field"
                      placeholder="Apartment, studio, or floor"
                      value={addressDetails.houseNo}
                      onChange={(e) => setAddressDetails({ ...addressDetails, houseNo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-muted uppercase tracking-widest ml-2">Street/Landmark *</label>
                    <input
                      className="input-field"
                      placeholder="Nearby building or area"
                      value={addressDetails.street}
                      onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Slot */}
            <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
              <div className="p-5 border-b border-border/50 bg-surface/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-button-text flex items-center justify-center text-[10px] font-black">2</div>
                  <h2 className="font-black text-heading text-sm uppercase tracking-widest">Delivery Slot</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {slots.map((slot) => (
                    <button
                      key={slot.value}
                      onClick={() => setDeliverySlot(slot.value)}
                      className={`p-6 text-center border-2 rounded-2xl transition-all relative overflow-hidden group ${deliverySlot === slot.value
                          ? 'border-accent bg-accent/5 text-accent shadow-sm'
                          : 'border-border/30 hover:border-accent/30 bg-surface/30 text-muted'
                        }`}
                    >
                      <Clock size={20} className={`mx-auto mb-3 transition-transform group-hover:scale-110 ${deliverySlot === slot.value ? 'text-accent' : 'text-muted'}`} />
                      <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{slot.label.split(' (')[0]}</p>
                      <p className="text-[9px] font-bold opacity-60 mt-1">{slot.label.split(' (')[1].replace(')', '')}</p>
                      {deliverySlot === slot.value && (
                        <div className="absolute top-0 right-0 w-12 h-12 bg-accent/5 rounded-full blur-xl -mr-6 -mt-6" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Payment - Online Only */}
            <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
              <div className="p-5 border-b border-border/50 bg-surface/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-button-text flex items-center justify-center text-[10px] font-black">3</div>
                  <h2 className="font-black text-heading text-sm uppercase tracking-widest">Payment Method</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="p-5 border border-primary/30 rounded-2xl bg-primary/5">
                  <CreditCard size={24} className="mb-3 text-primary" />
                  <p className="font-black text-heading text-sm uppercase tracking-widest">Online Payment Only</p>
                  <p className="text-[10px] text-muted font-bold mt-1 uppercase tracking-wider">Cards, UPI, NetBanking via Razorpay</p>
                </div>
                <p className="text-[10px] text-muted/40 mt-4 text-center font-bold uppercase tracking-widest italic">We only accept online payments for a seamless and secure experience.</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
                <h3 className="font-black text-heading text-xs uppercase tracking-widest mb-6">ORDER SUMMARY</h3>

                <div className="max-h-64 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div 
                      key={`${item.productId}-${item.selectedFlavor || ''}-${item.selectedWeight || ''}`} 
                      className="flex gap-4"
                    >
                      <img src={item.image} className="w-14 h-14 rounded-xl object-cover border border-border/10" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-heading truncate uppercase tracking-tight">{item.name}</p>
                        {item.selectedFlavor && (
                          <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">Flavor: {item.selectedFlavor}</p>
                        )}
                        {item.selectedWeight && (
                          <p className="text-[9px] text-muted font-bold uppercase tracking-widest">Weight: {item.selectedWeight}</p>
                        )}
                        <p className="text-[10px] text-muted/60 font-black mt-1">QTY: {item.qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-heading text-sm tracking-tight">{formatCurrency(getFinalItemPrice(item) * item.qty)}</p>
                        {Number(item.price) > getFinalItemPrice(item) && (
                          <p className="text-[10px] line-through text-muted/40 font-bold">{formatCurrency(Number(item.price) * item.qty)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 text-sm border-t border-border/30 pt-6">
                  <div className="flex justify-between font-bold">
                    <span className="text-muted text-[11px] uppercase tracking-widest">Total MRP</span>
                    <span className="text-heading">{formatCurrency(originalTotal)}</span>
                  </div>

                  {offerDiscount > 0 && (
                    <div className="flex justify-between text-success font-black text-[11px] uppercase tracking-widest">
                      <span>Offer Discount</span>
                      <span>- {formatCurrency(offerDiscount)}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-success font-black text-[11px] uppercase tracking-widest">
                      <span>Coupon ({appliedCoupon})</span>
                      <span>- {formatCurrency(couponDiscount)}</span>
                    </div>
                  )}

                  <div className="border-t border-border/30 pt-2 flex justify-between font-black">
                    <span className="text-muted text-[11px] uppercase tracking-widest">Subtotal</span>
                    <span className="text-heading">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-muted uppercase tracking-widest">Delivery Fee</span>
                    <span className="text-heading">{deliveryInfo.position ? formatCurrency(deliveryFee) : '--'}</span>
                  </div>

                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-muted uppercase tracking-widest">GST (18%)</span>
                    <span className="text-heading">{deliveryInfo.position ? formatCurrency(gst) : '--'}</span>
                  </div>

                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-muted uppercase tracking-widest">Convenience Fee</span>
                    <span className="text-heading">{deliveryInfo.position ? formatCurrency(convenienceFee) : '--'}</span>
                  </div>

                  {(offerDiscount + couponDiscount) > 0 && (
                    <div className="bg-success-light rounded-xl px-4 py-3 flex justify-between text-success-text font-black text-xs uppercase tracking-widest border border-success/10">
                      <span>You Save</span>
                      <span>- {formatCurrency(offerDiscount + couponDiscount)}</span>
                    </div>
                  )}

                  <div className="border-t border-border/30 pt-4 mt-2">
                    <div className="flex justify-between font-black text-xl tracking-tight">
                      <span className="text-muted text-[11px] uppercase tracking-widest self-center">Total</span>
                      <span className="text-heading">
                        {deliveryInfo.position ? formatCurrency(total) : '--'}
                      </span>
                    </div>
                  </div>
                </div>

                {availableCoupons.length > 0 && !appliedCoupon && (
                  <div className="mt-6 pt-6 border-t border-border/30">
                    <div className="flex items-center gap-2 text-xs font-black text-muted uppercase tracking-widest mb-4">
                      <Tag size={16} />
                      <span>Apply Coupon</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="input-field font-black uppercase tracking-widest h-12"
                        placeholder="COUPON CODE"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      />
                      <Button onClick={handleApplyCoupon} className="bg-primary text-button-text hover:brightness-110 px-8 h-12">APPLY</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {availableCoupons.map((code) => (
                        <button
                          key={code}
                          onClick={() => setCouponInput(code)}
                          className="px-3 py-1.5 bg-surface/10 rounded-lg text-[10px] font-black text-heading font-mono hover:bg-surface/20 transition-colors uppercase tracking-widest border border-border/10"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="mt-6 p-4 bg-success-light rounded-2xl flex justify-between items-center border border-success/10">
                    <div>
                      <span className="text-[10px] font-black text-success-text uppercase tracking-widest opacity-60">Coupon Applied</span>
                      <p className="text-sm font-mono font-black text-success-text tracking-widest">{appliedCoupon}</p>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-[10px] font-black text-error uppercase tracking-widest hover:underline">Remove</button>
                  </div>
                )}

                <Button
                  onClick={handlePlaceOrder}
                  className="w-full mt-8 bg-secondary text-button-text hover:brightness-110 shadow-premium h-14"
                  disabled={!addressDetails.fullName.trim() || !addressDetails.phone.trim() || !deliveryInfo.position}
                >
                  {`PAY ${deliveryInfo.position ? formatCurrency(total) : ''}`}
                </Button>

                <div className="flex items-center justify-center gap-4 mt-6 text-[10px] text-muted/40 font-black uppercase tracking-widest">
                  <ShieldCheck size={14} />
                  <span>Secure Transaction</span>
                  <span>•</span>
                  <Truck size={14} />
                  <span>Fresh Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      <AnimatePresence>
        {showMap && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-3xl w-full max-w-4xl h-[80vh] relative overflow-hidden shadow-premium border border-border"
            >
              <button
                onClick={() => setShowMap(false)}
                className="absolute top-4 right-4 z-10 bg-surface p-2.5 rounded-full shadow-premium text-foreground hover:bg-muted/10 transition-colors"
              >
                <X size={20} />
              </button>
              <MapSelector
                onSelect={(data) => {
                  setDeliveryInfo(data);
                  setShowMap(false);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;