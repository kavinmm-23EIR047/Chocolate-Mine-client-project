import React, { useMemo, useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  MapPin,
  X,
  Tag,
  Heart,
  ChevronRight,
  Percent,
  Truck,
  Shield,
} from "lucide-react";

import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import { formatCurrency } from "../utils/helpers";
import toast from "react-hot-toast";
import api from "../utils/api";
import MapSelector from "../components/MapSelector";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    loading,
    fetchCart,
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  const [showMap, setShowMap] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: null,
    position: null,
  });
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [distance, setDistance] = useState(0);
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Shop Coordinates
  const SHOP_LAT = 11.004540031168712;
  const SHOP_LNG = 76.97510955713153;

  // ==================== PRICE CALCULATION LOGIC ====================
  // AJIO Style: First apply offerPrice, then apply coupon discount

  const getItemBasePrice = (item) => {
    // Step 1: Check if offerPrice exists and is valid
    const hasOfferPrice = item.offerPrice !== undefined &&
      item.offerPrice !== null &&
      Number(item.offerPrice) > 0 &&
      Number(item.offerPrice) < Number(item.price);

    // Base price = offerPrice if available, otherwise original price
    return hasOfferPrice ? Number(item.offerPrice) : Number(item.price);
  };

  const getItemCouponDiscount = (item) => {
    // Check if coupon is applied globally and this item has valid coupon
    const appliedCoupon = cart?.appliedCoupon;
    if (!appliedCoupon || !item.coupon?.enabled) return 0;

    // Check if applied coupon matches item's coupon
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
    const basePrice = getItemBasePrice(item);
    const couponDiscount = getItemCouponDiscount(item);
    return basePrice - couponDiscount;
  };

  const getItemSavings = (item) => {
    const originalPrice = Number(item.price);
    const finalPrice = getFinalItemPrice(item);
    return originalPrice - finalPrice;
  };

  // ==================== DISTANCE CALCULATION ====================

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
        SHOP_LAT,
        SHOP_LNG,
        deliveryInfo.position.lat,
        deliveryInfo.position.lng
      );
      setDistance(dist);
      const fee = Math.max(30, Math.round(dist * 4));
      setDeliveryFee(fee);
    }
  }, [deliveryInfo.position]);

  // ==================== LOAD DEFAULT ADDRESS ====================

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const res = await api.get("/users/addresses");
        setSavedAddresses(res.data.data);
        const defaultAddr = res.data.data.find(addr => addr.isDefault);
        if (defaultAddr) {
          setDeliveryInfo({
            address: `${defaultAddr.houseNo}, ${defaultAddr.street}, ${defaultAddr.city}`,
            position: { lat: defaultAddr.lat, lng: defaultAddr.lng },
          });
        }
      } catch (err) {
        console.error("Failed to load addresses");
      }
    };
    if (user) loadAddresses();
  }, [user]);

  // ==================== CART CALCULATIONS ====================

  const cartItems = cart?.items || [];
  const appliedCouponCode = cart?.appliedCoupon;

  const subtotal = cartItems.reduce((sum, item) =>
    sum + getFinalItemPrice(item) * item.qty, 0
  );

  const originalTotal = cartItems.reduce((sum, item) =>
    sum + Number(item.price) * item.qty, 0
  );

  // Offer Discount = MRP - offerPrice (before coupon)
  const offerDiscount = cartItems.reduce((sum, item) => {
    const mrp = Number(item.price);
    const base = getItemBasePrice(item); // offerPrice if valid, else price
    return sum + (mrp - base) * item.qty;
  }, 0);

  // Coupon Discount = offerPrice - finalPrice (only from coupon)
  const couponDiscount = cartItems.reduce((sum, item) => {
    return sum + getItemCouponDiscount(item) * item.qty;
  }, 0);

  const gst = Math.round(subtotal * 0.18);
  const convenienceFee = Math.round(subtotal * 0.02);

  const total = subtotal + gst + convenienceFee + (deliveryFee || 0);

  // Check if any coupon is applicable
  const hasApplicableCoupons = cartItems.some(item => item.coupon?.enabled);

  // ==================== ACTIONS ====================

  const handleQuantityUpdate = async (productId, newQty) => {
    if (newQty < 1) {
      await removeFromCart(productId);
      toast.success("Item removed");
    } else {
      await updateQuantity(productId, newQty);
    }
  };

  const handleSelectAddress = (addr) => {
    setDeliveryInfo({
      address: `${addr.houseNo}, ${addr.street}, ${addr.city}`,
      position: { lat: addr.lat, lng: addr.lng },
    });
  };

  // ==================== LOADING ====================

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="h-12 w-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Fresh cakes waiting for you."
          action={
            <Link to="/">
              <Button icon={ArrowRight}>SHOP NOW</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-xs text-muted">
            <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">
              Home
            </button>
            <ChevronRight size={14} />
            <span className="font-bold text-foreground">Shopping Bag</span>
            <span className="ml-auto text-sm font-black text-heading uppercase tracking-widest">
              {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN - Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-2xl font-bold mb-6">MY BAG</h1>

            {cartItems.map((item) => {
              const finalPrice = getFinalItemPrice(item);
              const originalPrice = Number(item.price);
              const itemSavings = getItemSavings(item);
              const hasOffer = originalPrice > finalPrice;

              return (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl shadow-card border border-border/50 p-6"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-surface flex-shrink-0 border border-border/10">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-muted uppercase font-black tracking-widest mb-1">
                            {item.category}
                          </p>
                          <h3 className="font-black text-heading text-lg capitalize mb-2">
                            {item.name}
                          </h3>

                          {/* Price Display */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl font-black text-primary">
                              {formatCurrency(finalPrice)}
                            </span>
                            {hasOffer && (
                              <>
                                <span className="line-through text-muted/60 font-medium">
                                  {formatCurrency(originalPrice)}
                                </span>
                                <span className="text-success text-sm font-black">
                                  {Math.round(((originalPrice - finalPrice) / originalPrice) * 100)}% OFF
                                </span>
                              </>
                            )}
                          </div>

                          {/* Coupon Applied Badge */}
                          {appliedCouponCode && item.coupon?.enabled &&
                            appliedCouponCode.toUpperCase() === item.coupon.code.toUpperCase() && (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-success-light rounded-lg text-[10px] font-black text-success-text border border-success/10 uppercase tracking-widest">
                                <Tag size={12} />
                                <span>{item.coupon.code} applied</span>
                              </div>
                            )}
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-muted/40 hover:text-error transition-colors p-2 hover:bg-error-light rounded-full"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                        <div className="flex items-center gap-3 border border-border rounded-xl bg-surface/5">
                          <button
                            onClick={() => handleQuantityUpdate(item.productId, item.qty - 1)}
                            className="p-2 hover:bg-surface/20 transition rounded-l-xl text-foreground"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-black text-foreground">{item.qty}</span>
                          <button
                            onClick={() => handleQuantityUpdate(item.productId, item.qty + 1)}
                            className="p-2 hover:bg-surface/20 transition rounded-r-xl text-foreground"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-muted font-black uppercase tracking-widest">Item Total</p>
                          <p className="font-black text-heading text-lg">
                            {formatCurrency(finalPrice * item.qty)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Continue Shopping */}
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest hover:gap-3 transition-all mt-4 text-xs"
            >
              <ArrowRight size={16} />
              Continue Shopping
            </Link>
          </div>

          {/* RIGHT COLUMN - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">

              {/* Delivery Address */}
              <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-heading text-xs flex items-center gap-2 uppercase tracking-widest">
                    <MapPin size={18} className="text-primary" />
                    DELIVERY ADDRESS
                  </h3>
                  <button
                    onClick={() => setShowMap(true)}
                    className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline"
                  >
                    CHANGE
                  </button>
                </div>

                {deliveryInfo.address ? (
                  <div className="p-4 bg-surface/5 rounded-xl border border-border/30">
                    <p className="text-sm font-black text-heading">{user?.name || "Guest"}</p>
                    <p className="text-xs text-muted mt-1 leading-relaxed">{deliveryInfo.address}</p>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-2">
                      {distance > 0 && `${distance.toFixed(1)} km away`}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowMap(true)}
                    className="w-full py-4 border-2 border-dashed border-border rounded-xl text-center text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5 transition"
                  >
                    + Add Delivery Address
                  </button>
                )}

                {/* Saved Addresses */}
                {savedAddresses.length > 0 && !deliveryInfo.address && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] text-muted font-black uppercase tracking-widest">Saved Addresses</p>
                    {savedAddresses.slice(0, 2).map((addr) => (
                      <button
                        key={addr._id}
                        onClick={() => handleSelectAddress(addr)}
                        className="w-full text-left p-4 border border-border rounded-xl hover:border-primary transition-all bg-surface/5"
                      >
                        <p className="font-black text-heading text-xs">{addr.fullName}</p>
                        <p className="text-muted text-[11px] mt-1 truncate">
                          {addr.houseNo}, {addr.street}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5">
                <h3 className="font-black text-heading text-xs uppercase tracking-widest mb-4">PRICE DETAILS</h3>

                <div className="space-y-3 text-sm">

                  {/* MRP */}
                  <div className="flex justify-between font-bold">
                    <span className="text-muted text-[11px] uppercase tracking-widest">Total MRP</span>
                    <span className="text-heading">{formatCurrency(originalTotal)}</span>
                  </div>

                  {/* Offer Discount (offerPrice vs MRP) */}
                  {offerDiscount > 0 && (
                    <div className="flex justify-between text-success font-black text-[11px] uppercase tracking-widest">
                      <span>Offer Discount</span>
                      <span>- {formatCurrency(offerDiscount)}</span>
                    </div>
                  )}

                  {/* Coupon Discount */}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-success font-black text-[11px] uppercase tracking-widest">
                      <span>Coupon ({appliedCouponCode})</span>
                      <span>- {formatCurrency(couponDiscount)}</span>
                    </div>
                  )}

                  <div className="border-t border-border/30 pt-2 flex justify-between font-black">
                    <span className="text-muted text-[11px] uppercase tracking-widest">Subtotal</span>
                    <span className="text-heading">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-muted uppercase tracking-widest">Delivery Fee</span>
                    {deliveryFee !== null ? (
                      <span className="text-heading">{formatCurrency(deliveryFee)}</span>
                    ) : (
                      <span className="text-muted/40 italic">Select address</span>
                    )}
                  </div>

                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-muted uppercase tracking-widest">GST (18%)</span>
                    <span className="text-heading">{deliveryFee !== null ? formatCurrency(gst) : "--"}</span>
                  </div>

                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-muted uppercase tracking-widest">Convenience Fee</span>
                    <span className="text-heading">{deliveryFee !== null ? formatCurrency(convenienceFee) : "--"}</span>
                  </div>

                  {/* Total savings summary */}
                  {(offerDiscount + couponDiscount) > 0 && (
                    <div className="bg-success-light rounded-xl px-4 py-3 flex justify-between text-success-text font-black text-xs uppercase tracking-widest border border-success/10">
                      <span>You Save</span>
                      <span>- {formatCurrency(offerDiscount + couponDiscount)}</span>
                    </div>
                  )}

                  <div className="border-t border-border/30 pt-4 mt-2">
                    <div className="flex justify-between font-black text-xl tracking-tight">
                      <span className="text-muted text-[11px] uppercase tracking-widest self-center">Total Amount</span>
                      <span className="text-heading">
                        {deliveryFee !== null ? formatCurrency(total) : "--"}
                      </span>
                    </div>
                    <p className="text-[10px] text-success font-black uppercase tracking-widest mt-2">
                      Inclusive of all taxes
                    </p>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={() => navigate("/checkout")}
                  className="w-full mt-6 bg-secondary text-button-text hover:brightness-110 shadow-premium"
                  disabled={!deliveryInfo.position}
                >
                  PROCEED TO CHECKOUT
                  <ArrowRight size={16} className="ml-2" />
                </Button>

                <div className="flex items-center justify-center gap-4 mt-6 text-[10px] text-muted font-black uppercase tracking-widest">
                  <span className="flex items-center gap-1.5 opacity-60">
                    <Shield size={14} /> Secure
                  </span>
                  <span className="flex items-center gap-1.5 opacity-60">
                    <Truck size={14} /> 100% Fresh
                  </span>
                </div>
              </div>

              {/* Coupon Section */}
              {hasApplicableCoupons && !appliedCouponCode && (
                <div className="bg-accent-light/10 rounded-2xl p-5 border border-accent/20 border-dashed">
                  <div className="flex items-center gap-2 text-accent mb-3">
                    <Percent size={18} />
                    <span className="font-black text-xs uppercase tracking-widest">Available Coupons</span>
                  </div>
                  <div className="space-y-2">
                    {[...new Set(cartItems.filter(i => i.coupon?.enabled).map(i => i.coupon.code))].map(code => (
                      <div key={code} className="flex items-center justify-between text-sm">
                        <span className="font-black text-heading font-mono tracking-widest">{code}</span>
                        <span className="text-muted text-[10px] font-black uppercase tracking-widest">Apply at checkout</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

export default Cart;