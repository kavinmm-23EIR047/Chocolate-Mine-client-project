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
    const basePrice = getItemBasePrice(item);
    const couponDiscount = getItemCouponDiscount(item);
    return basePrice - couponDiscount;
  };

  const getItemSavings = (item) => {
    const originalPrice = Number(item.price);
    const finalPrice = getFinalItemPrice(item);
    return originalPrice - finalPrice;
  };

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
    const base = getItemBasePrice(item);
    return sum + (mrp - base) * item.qty;
  }, 0);

  // Coupon Discount = offerPrice - finalPrice (only from coupon)
  const couponDiscount = cartItems.reduce((sum, item) => {
    return sum + getItemCouponDiscount(item) * item.qty;
  }, 0);

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
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <button onClick={() => navigate("/")} className="hover:text-primary">
              Home
            </button>
            <ChevronRight size={14} />
            <span className="font-medium text-gray-900">Shopping Bag</span>
            <span className="ml-auto text-sm font-medium">
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
                  className="bg-white rounded-xl shadow-sm border p-6"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-card-soft flex-shrink-0">

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
                          <p className="text-xs text-gray-500 uppercase mb-1">
                            {item.category}
                          </p>
                          <h3 className="font-bold text-lg capitalize mb-2">
                            {item.name}
                          </h3>

                          {/* Variant Info for Cakes */}
                          {item.selectedFlavor && (
                            <p className="text-xs text-gray-500">Flavor: {item.selectedFlavor}</p>
                          )}
                          {item.selectedWeight && (
                            <p className="text-xs text-gray-500">Weight: {item.selectedWeight}</p>
                          )}

                          {/* Price Display */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-2xl font-bold text-primary">
                              {formatCurrency(finalPrice)}
                            </span>
                            {hasOffer && (
                              <>
                                <span className="line-through text-gray-400">
                                  {formatCurrency(originalPrice)}
                                </span>
                                <span className="text-green-600 text-sm font-medium">
                                  {Math.round(((originalPrice - finalPrice) / originalPrice) * 100)}% OFF
                                </span>
                              </>
                            )}
                          </div>

                          {/* Coupon Applied Badge */}
                          {appliedCouponCode && item.coupon?.enabled &&
                            appliedCouponCode.toUpperCase() === item.coupon.code.toUpperCase() && (
                              <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 rounded text-xs text-green-600 mt-2">
                                <Tag size={12} />
                                <span>{item.coupon.code} applied</span>
                              </div>
                            )}
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center gap-3 border rounded-lg">
                          <button
                            onClick={() => handleQuantityUpdate(item.productId, item.qty - 1)}
                            className="p-2 hover:bg-gray-50 transition rounded-l-lg"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-medium">{item.qty}</span>
                          <button
                            onClick={() => handleQuantityUpdate(item.productId, item.qty + 1)}
                            className="p-2 hover:bg-gray-50 transition rounded-r-lg"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-bold text-primary">
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
              className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all mt-4"
            >
              <ArrowRight size={16} />
              Continue Shopping
            </Link>
          </div>

          {/* RIGHT COLUMN - Order Summary (No Delivery Address) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">

              {/* Price Summary - Without Delivery */}
              <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6">

                <h3 className="font-bold mb-4">PRICE DETAILS</h3>

                <div className="space-y-3 text-sm">

                  {/* MRP */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total MRP</span>
                    <span>{formatCurrency(originalTotal)}</span>
                  </div>

                  {/* Offer Discount (offerPrice vs MRP) */}
                  {offerDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Offer Discount</span>
                      <span>- {formatCurrency(offerDiscount)}</span>
                    </div>
                  )}

                  {/* Coupon Discount */}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon ({appliedCouponCode})</span>
                      <span>- {formatCurrency(couponDiscount)}</span>
                    </div>
                  )}

                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span className="text-gray-700">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>

                  {/* Total savings summary */}
                  {(offerDiscount + couponDiscount) > 0 && (
                    <div className="bg-green-50 rounded-lg px-3 py-2 flex justify-between text-green-700 font-medium">
                      <span>You Save</span>
                      <span>- {formatCurrency(offerDiscount + couponDiscount)}</span>
                    </div>
                  )}

                  <div className="border-t pt-3 mt-1">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount</span>
                      <span className="text-primary">{formatCurrency(subtotal)}</span>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      *Excluding delivery charges & taxes
                    </p>
                  </div>
                </div>

                {/* Info Box */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 text-center">
                    📍 Delivery charges, GST, and convenience fee will be calculated at checkout
                  </p>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={() => navigate("/checkout")}
                  className="w-full mt-4"
                >
                  PROCEED TO CHECKOUT
                  <ArrowRight size={16} className="ml-2" />
                </Button>

                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Shield size={14} /> Secure
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck size={14} /> 100% Fresh
                  </span>
                </div>
              </div>

              {/* Coupon Section */}
              {hasApplicableCoupons && !appliedCouponCode && (
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <Percent size={16} />
                    <span className="font-medium text-sm">Available Coupons</span>
                  </div>
                  <div className="space-y-2">
                    {[...new Set(cartItems.filter(i => i.coupon?.enabled).map(i => i.coupon.code))].map(code => (
                      <div key={code} className="flex items-center justify-between text-sm">
                        <span className="font-mono font-medium">{code}</span>
                        <span className="text-gray-500 text-xs">Apply at checkout</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;