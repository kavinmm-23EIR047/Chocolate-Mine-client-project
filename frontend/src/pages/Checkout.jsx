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
  const [couponInput, setCouponInput] = useState('');
  
  // Prevent duplicate payment attempts
  const isProcessingPayment = useRef(false);

  const [deliveryInfo, setDeliveryInfo] = useState({
    address: null,
    position: null,
  });

  const [deliveryFee, setDeliveryFee] = useState(0);
  const [distance, setDistance] = useState(0);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(new Date());

  const [addressDetails, setAddressDetails] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    houseNo: '',
    street: '',
  });

  const SHOP_LAT = import.meta.env.VITE_SHOP_LAT || 11.004540031168712;
  const SHOP_LNG = import.meta.env.VITE_SHOP_LNG || 76.97510955713153;
  const DELIVERY_RADIUS = import.meta.env.VITE_DELIVERY_RADIUS_KM || 30;

  const [locationValid, setLocationValid] = useState(true);
  const [locationError, setLocationError] = useState('');


  // Define slots with end times for validation
  const slots = [
    { value: '10am-1pm', label: 'Morning (10 AM - 1 PM)', endHour: 13, endMinute: 0 },
    { value: '1pm-4pm', label: 'Afternoon (1 PM - 4 PM)', endHour: 16, endMinute: 0 },
    { value: '4pm-7pm', label: 'Evening (4 PM - 7 PM)', endHour: 19, endMinute: 0 },
    { value: '7pm-10pm', label: 'Night (7 PM - 10 PM)', endHour: 22, endMinute: 0 },
  ];

  const [deliverySlot, setDeliverySlot] = useState(null);

  // Function to check if a slot is available for a given date
  const isSlotAvailableForDate = (slot, date) => {
    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // For future dates (tomorrow or later), all slots are available
    if (selectedDate > currentDate) {
      return true;
    }
    
    // For today, check based on current time
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeDecimal = currentHour + (currentMinute / 60);
    
    // Slot cutoff time = end time - 1 hour
    const cutoffTimeDecimal = slot.endHour - 1;
    
    // Slot is available if current time is before cutoff time
    return currentTimeDecimal < cutoffTimeDecimal;
  };

  // Get slots with availability status for current date
  const getSlotsWithAvailability = () => {
    const todaySlots = slots.map(slot => ({
      ...slot,
      available: isSlotAvailableForDate(slot, deliveryDate)
    }));
    
    // Check if any slot is available today
    const hasAvailableSlot = todaySlots.some(slot => slot.available);
    
    // If no slots available today, auto-switch to tomorrow
    if (!hasAvailableSlot && deliveryDate.toDateString() === new Date().toDateString()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDeliveryDate(tomorrow);
      return slots.map(slot => ({ ...slot, available: true }));
    }
    
    return todaySlots;
  };

  // Get available slots for current date
  const availableSlots = getSlotsWithAvailability();

  // Set default available slot when date changes
  useEffect(() => {
    const firstAvailableSlot = availableSlots.find(slot => slot.available);
    if (firstAvailableSlot) {
      setDeliverySlot(firstAvailableSlot.value);
    } else {
      setDeliverySlot(null);
    }
  }, [deliveryDate]);

  // Handle date change
  const handleDateChange = (increment) => {
    const newDate = new Date(deliveryDate);
    newDate.setDate(newDate.getDate() + increment);
    setDeliveryDate(newDate);
  };

  // Check if today has any available slots
  const hasAvailableSlotsToday = () => {
    const todaySlots = slots.map(slot => isSlotAvailableForDate(slot, new Date()));
    return todaySlots.some(slot => slot);
  };

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
    const validateLocation = async () => {
      if (!deliveryInfo.position) return;

      const dist = calculateDistance(
        SHOP_LAT, SHOP_LNG,
        deliveryInfo.position.lat,
        deliveryInfo.position.lng
      );
      setDistance(dist);
      setDeliveryFee(Math.max(30, Math.round(dist * 4)));

      // Condition B: Distance Check
      if (dist > DELIVERY_RADIUS) {
        setLocationValid(false);
        setLocationError("Delivery available only inside Coimbatore service area (within 30km).");
        return;
      }

      // Condition A: Address Check (Coimbatore)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${deliveryInfo.position.lat}&lon=${deliveryInfo.position.lng}`);
        const data = await res.json();
        const fullAddress = data.display_name || '';
        
        if (!fullAddress.toLowerCase().includes('coimbatore')) {
          setLocationValid(false);
          setLocationError("Delivery available only inside Coimbatore service area.");
          return;
        }

        setLocationValid(true);
        setLocationError('');
      } catch (error) {
        console.error("Location validation error:", error);
        // Fallback to basic check if geocoding fails
        setLocationValid(true); 
      }
    };

    validateLocation();
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

  // Check if address is selected
  const isAddressSelected = deliveryInfo.position !== null;

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

  // Phone number validation (exactly 10 digits)
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
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
    if (!validatePhoneNumber(addressDetails.phone.trim())) {
      toast.error('Please enter a valid 10-digit phone number');
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
    if (!deliverySlot) {
      toast.error('Please select a delivery slot');
      return false;
    }
    
    // Final slot availability check before submission
    const selectedSlot = slots.find(s => s.value === deliverySlot);
    if (selectedSlot && !isSlotAvailableForDate(selectedSlot, deliveryDate)) {
      toast.error('Selected delivery slot is no longer available. Please choose another slot.');
      return false;
    }
    
    if (!locationValid) {
      toast.error(locationError || 'Selected location is outside our service area');
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
    // Prevent duplicate payment attempts
    if (isProcessingPayment.current) {
      toast.error('Payment already in progress. Please wait.');
      return;
    }

    if (!validateForm()) return;

    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Session expired. Please login again.');
      navigate('/login');
      return;
    }

    // Check if Razorpay key is configured
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
        deliveryDate: deliveryDate,
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

      // Create order with backend
      const res = await api.post('/payment/create-order', {
        address: payload.address,
        deliveryDate: payload.deliveryDate,
        deliverySlot: payload.deliverySlot,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { razorpayOrder, orderId } = res.data.data;

      // Validate order response
      if (!razorpayOrder || !razorpayOrder.id) {
        throw new Error('Invalid order response from server');
      }

      clearInterval(loadingInterval);
      setLoading(false);

      // Get prefill data from selected address or user
      const prefillName = addressDetails.fullName || user?.name || '';
      const prefillContact = addressDetails.phone || user?.phone || '';
      const prefillEmail = user?.email || '';

      // Razorpay options
      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'The Chocolate Mine',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
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
        prefill: {
          name: prefillName,
          email: prefillEmail,
          contact: prefillContact,
        },
        theme: { color: '#4A2C2A' },
      };

      const razorpayInstance = new window.Razorpay(options);
      
      razorpayInstance.on('payment.failed', async function (response) {
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

      // ✅ FIX: Only call open() once
      razorpayInstance.open();

    } catch (err) {
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

  // Handle phone number input
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setAddressDetails({ ...addressDetails, phone: value });
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isToday = deliveryDate.toDateString() === new Date().toDateString();
  const showDateSelector = !hasAvailableSlotsToday() && isToday;

  return (
    <div className="min-h-screen bg-background pb-20">

      <ScooterLoader isVisible={loading} text={loaderText} />

      {/* Header */}
      <div className="bg-card border-b border-border/50 sticky top-0 z-20">

        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <button onClick={() => navigate('/cart')} className="hover:text-primary flex items-center gap-1">
              <ArrowLeft size={14} />
              Back to Cart
            </button>
            <ChevronRight size={14} />
            <span className="font-medium text-gray-900">Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN - Forms */}
          <div className="lg:col-span-2 space-y-6">

            {/* Step 1: Delivery Address */}
            <div className="bg-card rounded-[2rem] shadow-sm border border-border/50 overflow-hidden">
              <div className="p-6 border-b border-border/50 bg-card-soft">

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
                  <h2 className="font-bold">Delivery Address</h2>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Saved Addresses</p>
                    <div className="grid gap-3">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr._id}
                          onClick={() => handleSelectAddress(addr)}
                          className={`text-left p-4 border rounded-lg transition-all ${selectedAddressId === addr._id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-primary'
                            }`}
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">{addr.fullName}</span>
                            {selectedAddressId === addr._id && (
                              <CheckCircle2 size={16} className="text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{addr.houseNo}, {addr.street}</p>
                          <p className="text-xs text-gray-400 mt-1">{addr.phone}</p>
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-2 text-gray-500">OR</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowMap(true)}
                  className="w-full p-4 border-2 border-dashed rounded-lg text-center text-primary font-medium hover:bg-gray-50 transition"
                >
                  + Add New Address via Map
                </button>

                {deliveryInfo.position && (
                  <div className={`mt-4 p-4 rounded-lg ${locationValid ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className={`text-sm font-medium ${locationValid ? 'text-green-800' : 'text-red-800'}`}>
                      {locationValid ? 'Delivery Location Selected' : 'Service Area Error'}
                    </p>
                    <p className={`text-xs mt-1 ${locationValid ? 'text-green-600' : 'text-red-600'}`}>{deliveryInfo.address}</p>
                    {locationValid ? (
                      <>
                        <p className="text-xs text-green-500 mt-1">{distance.toFixed(1)} km from our bakery</p>
                        <p className="text-xs text-green-600 mt-1">Delivery Fee: {formatCurrency(deliveryFee)}</p>
                      </>
                    ) : (
                      <p className="text-xs text-red-600 mt-1 font-bold">{locationError}</p>
                    )}
                  </div>
                )}


                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                    <input
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Recipient name"
                      value={addressDetails.fullName}
                      onChange={(e) => setAddressDetails({ ...addressDetails, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number *</label>
                    <input
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="10-digit mobile number"
                      value={addressDetails.phone}
                      onChange={handlePhoneChange}
                      type="tel"
                      maxLength={10}
                    />
                    {addressDetails.phone && !validatePhoneNumber(addressDetails.phone) && (
                      <p className="text-xs text-red-500 mt-1">Please enter a valid 10-digit phone number</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">House/Flat No. *</label>
                    <input
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Apartment, studio, or floor"
                      value={addressDetails.houseNo}
                      onChange={(e) => setAddressDetails({ ...addressDetails, houseNo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Street/Landmark *</label>
                    <input
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Nearby building or area"
                      value={addressDetails.street}
                      onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Slot with Dynamic Validation */}
            <div className="bg-card rounded-[2rem] shadow-sm border border-border/50 overflow-hidden">
              <div className="p-6 border-b border-border/50 bg-card-soft">

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</div>
                  <h2 className="font-bold">Delivery Slot</h2>
                </div>
              </div>
              <div className="p-5">
                {/* Date Selector */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDateChange(-1)}
                      className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50"
                      disabled={deliveryDate <= new Date()}
                    >
                      ←
                    </button>
                    <span className="font-medium text-sm">
                      {formatDate(deliveryDate)}
                      {deliveryDate.toDateString() === new Date().toDateString() && ' (Today)'}
                    </span>
                    <button
                      onClick={() => handleDateChange(1)}
                      className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50"
                    >
                      →
                    </button>
                  </div>
                  {showDateSelector && (
                    <span className="text-xs text-orange-600">
                      No slots available today
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.value}
                      onClick={() => slot.available && setDeliverySlot(slot.value)}
                      disabled={!slot.available}
                      className={`p-4 text-center border rounded-lg transition-all ${
                        deliverySlot === slot.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : slot.available
                            ? 'border-gray-200 hover:border-primary cursor-pointer'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Clock size={18} className="mx-auto mb-2" />
                      <p className="text-xs font-medium">{slot.label}</p>
                      {!slot.available && (
                        <p className="text-[8px] mt-1 text-gray-400">Closed</p>
                      )}
                    </button>
                  ))}
                </div>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  {deliveryDate.toDateString() === new Date().toDateString() 
                    ? 'Slots available until 1 hour before end time'
                    : 'All slots available for future dates'}
                </p>
              </div>
            </div>

            {/* Step 3: Payment - Online Only */}
            <div className="bg-card rounded-[2rem] shadow-sm border border-border/50 overflow-hidden">
              <div className="p-6 border-b border-border/50 bg-card-soft">

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">3</div>
                  <h2 className="font-bold">Payment Method</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="p-5 border border-primary rounded-lg bg-primary/5">
                  <CreditCard size={24} className="mb-3 text-primary" />
                  <p className="font-medium">Online Payment Only</p>
                  <p className="text-xs text-gray-500 mt-1">Cards, UPI, NetBanking via Razorpay</p>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">We only accept online payments for a seamless and secure experience.</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border p-5">
                <h3 className="font-bold mb-4">ORDER SUMMARY</h3>

                <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                  {cartItems.map((item) => (
                    <div 
                      key={`${item.productId}-${item.selectedFlavor || ''}-${item.selectedWeight || ''}`} 
                      className="flex gap-3"
                    >
                      <img src={item.image} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        {item.selectedFlavor && (
                          <p className="text-[10px] text-muted">Flavor: {item.selectedFlavor}</p>
                        )}
                        {item.selectedWeight && (
                          <p className="text-[10px] text-muted">Weight: {item.selectedWeight}</p>
                        )}
                        <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(getFinalItemPrice(item) * item.qty)}</p>
                        {Number(item.price) > getFinalItemPrice(item) && (
                          <p className="text-xs line-through text-gray-400">{formatCurrency(Number(item.price) * item.qty)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 text-sm border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total MRP</span>
                    <span>{formatCurrency(originalTotal)}</span>
                  </div>

                  {offerDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Offer Discount</span>
                      <span>- {formatCurrency(offerDiscount)}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon ({appliedCoupon})</span>
                      <span>- {formatCurrency(couponDiscount)}</span>
                    </div>
                  )}

                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span className="text-gray-700">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>{isAddressSelected ? formatCurrency(deliveryFee) : 'Select address'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">GST (18%)</span>
                    <span>{isAddressSelected ? formatCurrency(gst) : '--'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Convenience Fee</span>
                    <span>{isAddressSelected ? formatCurrency(convenienceFee) : '--'}</span>
                  </div>

                  {(offerDiscount + couponDiscount) > 0 && (
                    <div className="bg-green-50 rounded-lg px-3 py-2 flex justify-between text-green-700 font-medium">
                      <span>You Save</span>
                      <span>- {formatCurrency(offerDiscount + couponDiscount)}</span>
                    </div>
                  )}

                  <div className="border-t pt-3 mt-1">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        {isAddressSelected ? formatCurrency(total) : '--'}
                      </span>
                    </div>
                    {!isAddressSelected && (
                      <p className="text-xs text-orange-600 mt-2 text-center">
                        Please select delivery address to see complete total
                      </p>
                    )}
                  </div>
                </div>

                {availableCoupons.length > 0 && !appliedCoupon && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <Tag size={16} />
                      <span className="font-medium">Apply Coupon</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      />
                      <Button size="sm" onClick={handleApplyCoupon}>APPLY</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {availableCoupons.map((code) => (
                        <button
                          key={code}
                          onClick={() => setCouponInput(code)}
                          className="px-2 py-1 bg-gray-100 rounded text-xs font-mono hover:bg-gray-200"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="text-xs font-medium text-green-800">Coupon Applied</span>
                      <p className="text-sm font-mono font-bold text-green-700">{appliedCoupon}</p>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-xs text-red-600">Remove</button>
                  </div>
                )}

                <Button
                  onClick={handlePlaceOrder}
                  className="w-full mt-6"
                  disabled={!addressDetails.fullName.trim() || !validatePhoneNumber(addressDetails.phone) || !isAddressSelected || !deliverySlot || !locationValid}

                >
                  {`PAY ${isAddressSelected ? formatCurrency(total) : '---'}`}
                </Button>

                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
                  <ShieldCheck size={14} />
                  <span>Secure Transaction</span>
                  <span>•</span>
                  <Truck size={14} />
                  <span>Free cancellation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      <AnimatePresence>
        {showMap && (
          <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] relative overflow-hidden"
            >
              <button
                onClick={() => setShowMap(false)}
                className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-lg"
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