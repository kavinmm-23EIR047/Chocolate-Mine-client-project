import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  ShoppingCart,
  Heart,
  Clock,
  ArrowRight,
  Minus,
  Plus,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Tag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Share2,
  Percent,
  Info,
  Cake,
  Scale,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import productService from '../services/productService';
import reviewService from '../services/reviewService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { cart, addToCart, updateQuantity, applyCoupon, removeCoupon } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewStats, setReviewStats] = useState({ avg: 0, total: 0, list: [] });
  const [imgZoom, setImgZoom] = useState(false);
  const [displayImage, setDisplayImage] = useState('');
  
  // Cake-specific states for variant system
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [customFlavor, setCustomFlavor] = useState('');
  const [customWeight, setCustomWeight] = useState('');
  const [showCustomFlavorInput, setShowCustomFlavorInput] = useState(false);
  const [showCustomWeightInput, setShowCustomWeightInput] = useState(false);

  // ─── FETCH ─────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await productService.getBySlug(slug);
        const prod = res.data.data;
        setProduct(prod);
        
        // Initialize cake selections if product has variants
        if (prod.category === 'cakes' && prod.hasVariants && prod.flavors && prod.flavors.length > 0) {
          setSelectedFlavor(prod.flavors[0]);
          // Set first available weight from variants
          const firstVariant = prod.variants?.find(v => v.flavor === prod.flavors[0].name);
          if (firstVariant) {
            setSelectedWeight(firstVariant.weight);
            setSelectedPrice(firstVariant.price);
            setSelectedStock(firstVariant.stock);
          }
          // Set display image from first flavor's first image
          if (prod.flavors[0].images && prod.flavors[0].images.length > 0) {
            setDisplayImage(prod.flavors[0].images[0]);
          } else {
            setDisplayImage(prod.image);
          }
        } else {
          setDisplayImage(prod.image);
        }

        const related = await productService.getAll({ category: prod.category, limit: 4 });
        setRelatedProducts(related.data.data.filter(p => p._id !== prod._id));

        try {
          const reviewRes = await reviewService.getProductReviews(prod._id);
          const list = reviewRes.data.data.reviews || [];
          if (list.length) {
            const sum = list.reduce((a, b) => a + b.rating, 0);
            setReviewStats({ 
              avg: (sum / list.length).toFixed(1), 
              total: list.length, 
              list: list.filter(r => r.productId === prod._id || r.product === prod._id)
            });
          } else {
            setReviewStats({ avg: prod.ratingsAverage || 0, total: prod.ratingsCount || 0, list: [] });
          }
        } catch {
          setReviewStats({ avg: prod.ratingsAverage || 0, total: prod.ratingsCount || 0, list: [] });
        }
      } catch {
        toast.error('Product not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, navigate]);

  // Handle flavor change
  const handleFlavorChange = (flavor) => {
    setSelectedFlavor(flavor);
    setShowCustomFlavorInput(false);
    setCustomFlavor('');
    
    // Find variant for this flavor with current weight or first available weight
    let variant = product.variants?.find(v => v.flavor === flavor.name && v.weight === selectedWeight);
    if (!variant && product.variants) {
      variant = product.variants.find(v => v.flavor === flavor.name);
    }
    
    if (variant) {
      setSelectedWeight(variant.weight);
      setSelectedPrice(variant.price);
      setSelectedStock(variant.stock);
    }
    
    // Update display image from flavor's images
    if (flavor.images && flavor.images.length > 0) {
      setDisplayImage(flavor.images[0]);
    }
  };
  
  // Handle weight change
  const handleWeightChange = (weight) => {
    setSelectedWeight(weight);
    setShowCustomWeightInput(false);
    setCustomWeight('');
    
    const variant = product.variants?.find(v => v.flavor === selectedFlavor?.name && v.weight === weight);
    if (variant) {
      setSelectedPrice(variant.price);
      setSelectedStock(variant.stock);
    }
  };
  
  // Handle custom flavor input
  const handleCustomFlavorSubmit = () => {
    if (customFlavor.trim()) {
      setSelectedFlavor({ name: customFlavor.trim(), images: [] });
      setShowCustomFlavorInput(false);
      // Price and stock for custom flavor need to be set manually or use default
      setSelectedPrice(product.variants?.[0]?.price || product.price);
    }
  };
  
  // Handle custom weight input
  const handleCustomWeightSubmit = () => {
    if (customWeight.trim()) {
      setSelectedWeight(customWeight.trim());
      setShowCustomWeightInput(false);
    }
  };

  // ─── CART / WISHLIST STATE ──────────────────────────────
  const cartItem = cart?.items?.find(i => i.productId === product?._id);
  const cartQty = cartItem?.qty || 0;
  const isWishlisted = product ? isInWishlist(product._id) : false;

  // ─── PRICE LOGIC ───────────────────────────────────────
  // Use selected price from variant, or regular price for non-cake products
  const currentPrice = product?.category === 'cakes' && selectedPrice 
    ? selectedPrice 
    : Number(product?.price || 0);
    
  const hasOffer = product?.offerPrice && Number(product.offerPrice) > 0 && Number(product.offerPrice) < currentPrice;
  const basePrice = hasOffer ? Number(product.offerPrice) : currentPrice;
  const offerDiscount = currentPrice - basePrice;
  const offerPct = currentPrice > 0 ? Math.round((offerDiscount / currentPrice) * 100) : 0;

  const isCouponApplied =
    cart?.appliedCoupon &&
    product?.coupon?.code &&
    cart.appliedCoupon.toUpperCase() === product.coupon.code.toUpperCase();

  const couponSavings = (() => {
    if (!isCouponApplied || !product?.coupon?.enabled) return 0;
    const c = product.coupon;
    if (c.type === 'percent') return Math.round((basePrice * c.value) / 100);
    if (c.type === 'flat') return Number(c.value);
    return 0;
  })();

  const finalPrice = Math.max(0, basePrice - couponSavings);
  const totalSavings = currentPrice - finalPrice;
  const totalSavingsPct = currentPrice > 0 ? Math.round((totalSavings / currentPrice) * 100) : 0;

  // Check if variant is in stock
  const isInStock = product?.category === 'cakes' 
    ? (selectedStock > 0)
    : (product?.stock > 0);

  // ─── ACTIONS ───────────────────────────────────────────
  const handleAddToCart = async () => {
    try {
      const options = {};
      if (product?.category === 'cakes') {
        if (showCustomFlavorInput && customFlavor) {
          options.flavor = customFlavor;
        } else if (selectedFlavor) {
          options.flavor = selectedFlavor.name;
        }
        
        if (showCustomWeightInput && customWeight) {
          options.weight = customWeight;
        } else if (selectedWeight) {
          options.weight = selectedWeight;
        }
        
        if (!options.flavor || !options.weight) {
          toast.error('Please select flavor and weight');
          return;
        }
      }
      await addToCart(product._id, 1, options);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add');
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/checkout');
  };

  const handleApplyCoupon = async () => {
    try {
      await applyCoupon(product.coupon.code);
      toast.success(`🎉 ${product.coupon.code} applied!`);
    } catch {
      toast.error('Coupon failed');
    }
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
    toast.success('Coupon removed');
  };

  // Get valid flavor images (filter out blob URLs)
  const getFlavorImages = (flavor) => {
    if (!flavor || !flavor.images) return [];
    return flavor.images.filter(img => img && !img.startsWith('blob:'));
  };

  // ─── LOADER ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted font-black uppercase tracking-widest">Loading Delights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-12">
      {/* ── BREADCRUMB ── */}
      <div className="bg-card border-b hidden lg:block">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
            <button onClick={() => navigate('/')} className="hover:text-primary transition">Home</button>
            <ChevronRight size={12} />
            <button onClick={() => navigate(`/shop?category=${product.category}`)} className="hover:text-primary transition capitalize">{product.category}</button>
            <ChevronRight size={12} />
            <span className="text-heading truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-4 lg:px-8 xl:px-12 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
          
          {/* ── LEFT — IMAGE SECTION ── */}
          <div className="w-full space-y-6">
            <div className="relative bg-card lg:rounded-[2.5rem] overflow-hidden border-b lg:border border-border/50 cursor-zoom-in group shadow-premium transition-all duration-500" onClick={() => setImgZoom(!imgZoom)}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={displayImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={displayImage}
                  onError={(e) => { e.target.src = product?.image || ''; }}
                  className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </AnimatePresence>
              
              {offerPct > 0 && (
                <div className="absolute top-6 left-6 bg-sale text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg z-10 uppercase tracking-widest">
                  {offerPct}% OFF
                </div>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}
                className="absolute top-6 right-6 bg-surface/90 backdrop-blur-md shadow-xl p-3 rounded-full hover:scale-110 transition-all z-10 group/heart border border-border/20"
              >
                <Heart 
                  size={24} 
                  fill={isWishlisted ? 'var(--error)' : 'none'} 
                  className={`${isWishlisted ? 'text-error' : 'text-muted'} transition-colors group-hover/heart:text-error`} 
                />
              </button>

              {product.bestseller && (
                <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-secondary text-button-text text-xs font-black px-5 py-2.5 rounded-full uppercase tracking-widest shadow-xl z-10">
                  <Sparkles size={14} fill="currentColor" />
                  Bestseller
                </div>
              )}
            </div>

            {/* Cake Flavor Gallery Thumbnails */}
            {product?.category === 'cakes' && selectedFlavor && getFlavorImages(selectedFlavor).length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {getFlavorImages(selectedFlavor).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setDisplayImage(img)}
                    className="w-20 h-20 rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-all flex-shrink-0"
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Highlights Grid — Larger for PC */}
            <div className="hidden lg:grid grid-cols-3 gap-6">
              {[
                { icon: Truck, label: 'Free Delivery', sub: 'On all orders' },
                { icon: RotateCcw, label: 'Fresh Daily', sub: 'Baked today' },
                { icon: ShieldCheck, label: 'Secure Pay', sub: '100% safe' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-card rounded-3xl border border-border/50 p-6 flex flex-col items-center text-center gap-2 hover:shadow-premium hover:-translate-y-1 transition-all duration-300">
                  <Icon size={28} className="text-primary mb-1" />
                  <p className="text-sm font-black uppercase tracking-wider text-heading">{label}</p>
                  <p className="text-[11px] text-muted font-medium">{sub}</p>
                </div>
              ))}
            </div>

            {/* Info Section — Separated (Moved to Left Side) */}
            <div className="space-y-6 pt-4 hidden lg:block">
              {/* Description Box */}
              <div className="bg-card rounded-[2.5rem] border border-border/50 p-8 shadow-card">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-heading mb-4">Description</h3>
                <p className="text-sm text-muted font-medium leading-relaxed tracking-wide italic">"{product.description}"</p>
              </div>

              {/* Highlights Box */}
              <div className="bg-card rounded-[2.5rem] border border-border/50 p-8 shadow-card">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-heading mb-6">Highlights</h3>
                <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                  {['Freshly Baked', 'Premium Quality', 'Eggless Available', 'No Preservatives', 'Secure Packing', 'Fast Delivery'].map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-success-light flex items-center justify-center border border-success/10 flex-shrink-0">
                        <CheckCircle2 size={12} className="text-success" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-heading">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT — DETAILS (sticky) ── */}
          <div className="w-full lg:sticky lg:top-24 space-y-6 px-1 lg:px-0">
            {/* Main Header Card */}
            <div className="bg-card rounded-[2.5rem] border border-border p-6 lg:p-10 shadow-card hover:shadow-soft transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black text-primary uppercase bg-primary/5 px-4 py-1.5 rounded-full tracking-widest border border-primary/10">
                  {product.category}
                </span>
                <button className="p-2.5 text-muted hover:text-primary transition-colors bg-surface/10 rounded-full"><Share2 size={18} /></button>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-heading leading-[1.1] mb-4 capitalize tracking-tight">{product.name}</h1>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-1.5 bg-success text-white px-3 py-1 rounded-xl text-xs font-black shadow-sm">
                  {reviewStats.avg} <Star size={12} fill="currentColor" />
                </div>
                <span className="text-xs text-muted font-black uppercase tracking-widest">{reviewStats.total} verified ratings</span>
              </div>

              {/* Cake Flavor and Weight Selection for Variant System */}
              {product?.category === 'cakes' && product.hasVariants && (
                <div className="space-y-6 mb-6">
                  {/* Flavor Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Cake size={16} className="text-primary" />
                      <label className="text-[11px] font-black text-muted uppercase tracking-widest">Select Flavor</label>
                    </div>
                    
                    {!showCustomFlavorInput ? (
                      <>
                        <div className="flex flex-wrap gap-3">
                          {product.flavors?.map((flavor, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleFlavorChange(flavor)}
                              className={`px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all ${
                                selectedFlavor?.name === flavor.name
                                  ? 'bg-primary text-white shadow-lg scale-105'
                                  : 'bg-muted/10 text-heading border-2 border-border hover:border-primary/50'
                              }`}
                            >
                              {flavor.name}
                            </button>
                          ))}
                        </div>
                        {product.allowCustomFlavor && (
                          <button
                            onClick={() => setShowCustomFlavorInput(true)}
                            className="text-xs text-primary font-black underline"
                          >
                            + Add Custom Flavor
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customFlavor}
                          onChange={(e) => setCustomFlavor(e.target.value)}
                          placeholder="Enter custom flavor"
                          className="flex-1 bg-input border border-input-border px-4 py-2 rounded-xl text-sm"
                        />
                        <button
                          onClick={handleCustomFlavorSubmit}
                          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setShowCustomFlavorInput(false)}
                          className="px-4 py-2 bg-muted text-white rounded-xl text-xs font-black"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Weight Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Scale size={16} className="text-primary" />
                      <label className="text-[11px] font-black text-muted uppercase tracking-widest">Select Weight</label>
                    </div>
                    
                    {!showCustomWeightInput ? (
                      <>
                        <div className="flex flex-wrap gap-3">
                          {product.weights?.map((weight, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleWeightChange(weight.value)}
                              className={`px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all ${
                                selectedWeight === weight.value
                                  ? 'bg-primary text-white shadow-lg scale-105'
                                  : 'bg-muted/10 text-heading border-2 border-border hover:border-primary/50'
                              }`}
                            >
                              {weight.value}
                            </button>
                          ))}
                        </div>
                        {product.allowCustomWeight && (
                          <button
                            onClick={() => setShowCustomWeightInput(true)}
                            className="text-xs text-primary font-black underline"
                          >
                            + Add Custom Weight
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customWeight}
                          onChange={(e) => setCustomWeight(e.target.value)}
                          placeholder="Enter custom weight (e.g., 2.5 kg)"
                          className="flex-1 bg-input border border-input-border px-4 py-2 rounded-xl text-sm"
                        />
                        <button
                          onClick={handleCustomWeightSubmit}
                          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setShowCustomWeightInput(false)}
                          className="px-4 py-2 bg-muted text-white rounded-xl text-xs font-black"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Stock Status */}
                  {!isInStock && (
                    <div className="text-center py-2 bg-error-light text-error-text rounded-xl text-xs font-black border border-error/10">
                      Out of Stock for this combination
                    </div>
                  )}
                </div>
              )}

              {/* Price Display for Non-Cake Products */}
              {product?.category !== 'cakes' && (
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-4xl font-black text-heading tracking-tighter">{formatCurrency(currentPrice)}</span>
                  {product?.offerPrice && product.offerPrice < product.price && (
                    <span className="text-xl line-through text-muted/40 font-black tracking-tighter">{formatCurrency(product.price)}</span>
                  )}
                </div>
              )}

              {/* Enhanced Price Breakdown for All Products */}
              <div className="space-y-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-black text-heading tracking-tighter">{formatCurrency(finalPrice)}</span>
                  {currentPrice > finalPrice && (
                    <span className="text-xl line-through text-muted/40 font-black tracking-tighter">{formatCurrency(currentPrice)}</span>
                  )}
                  {totalSavingsPct > 0 && (
                    <span className="text-base font-black text-success bg-success-light px-3 py-1 rounded-lg uppercase tracking-wide border border-success/10">
                      {totalSavingsPct}% off
                    </span>
                  )}
                </div>

                <div className="bg-surface/5 rounded-3xl p-6 space-y-3 text-sm font-bold border border-border/20">
                  <div className="flex justify-between text-muted/60 uppercase text-[10px] tracking-widest">
                    <span>MRP (Inclusive of all taxes)</span>
                    <span>{formatCurrency(currentPrice)}</span>
                  </div>
                  {offerDiscount > 0 && (
                    <div className="flex justify-between text-success-text uppercase text-[10px] tracking-widest">
                      <span>Offer Savings</span>
                      <span>- {formatCurrency(offerDiscount)}</span>
                    </div>
                  )}
                  {couponSavings > 0 && (
                    <div className="flex justify-between text-success-text uppercase text-[10px] tracking-widest">
                      <span>Coupon Discount ({product.coupon.code})</span>
                      <span>- {formatCurrency(couponSavings)}</span>
                    </div>
                  )}
                  <div className="border-t border-border/30 pt-3 flex justify-between font-black text-heading text-lg tracking-tight">
                    <span className="uppercase text-[11px] tracking-widest self-center text-muted">Final Price</span>
                    <span>{formatCurrency(finalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Card — Premium Style */}
            {product?.coupon?.enabled && (
              <div className="bg-card rounded-[2.5rem] border border-border p-6 lg:p-8 shadow-card relative overflow-hidden group/coupon">
                <div className="absolute -top-4 -right-4 p-2 opacity-[0.03] rotate-12 transition-transform group-hover/coupon:rotate-45 duration-700">
                  <Percent size={120} />
                </div>
                <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-4">Available Exclusive Offer</p>
                <div className="flex items-center justify-between bg-accent-light/10 border border-accent/20 border-dashed rounded-[1.5rem] p-5 lg:p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-surface p-3 rounded-2xl shadow-premium border border-border/10"><Tag size={20} className="text-accent" /></div>
                    <div>
                      <p className="font-black text-heading text-lg font-mono tracking-widest">{product.coupon.code}</p>
                      <p className="text-[11px] font-black text-accent/70 uppercase tracking-wider">
                        {product.coupon.type === 'percent' ? `${product.coupon.value}% Instant OFF` : `Flat ₹${product.coupon.value} OFF`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={isCouponApplied ? handleRemoveCoupon : handleApplyCoupon}
                    className={`text-[11px] font-black px-6 py-3 rounded-xl transition-all uppercase tracking-widest shadow-premium ${isCouponApplied ? 'bg-card text-error border border-error/20 hover:bg-error-light' : 'bg-primary text-button-text hover:brightness-110 shadow-primary/20'}`}
                  >
                    {isCouponApplied ? 'Remove' : 'Apply'}
                  </button>
                </div>
              </div>
            )}

            {/* Buttons Section */}
            <div className="grid grid-cols-2 gap-4 bg-card rounded-[2.5rem] border border-border p-6 lg:p-8 shadow-card">
              <div className="col-span-2 mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} className={isInStock ? 'text-success' : 'text-error'} />
                <span className={`text-[11px] font-black uppercase tracking-widest ${isInStock ? 'text-success' : 'text-error'}`}>
                  {isInStock ? 'In Stock & Ready to Ship' : 'Out of Stock'}
                </span>
              </div>
              
              {cartQty > 0 ? (
                <div className="flex items-center border-2 border-border/30 rounded-2xl h-16 bg-surface/5">
                  <button onClick={() => updateQuantity(product._id, cartQty - 1)} className="w-16 h-full flex items-center justify-center hover:bg-surface/10 transition text-foreground"><Minus size={20} /></button>
                  <span className="flex-1 text-center font-black text-xl text-heading">{cartQty}</span>
                  <button onClick={() => updateQuantity(product._id, cartQty + 1)} className="w-16 h-full flex items-center justify-center hover:bg-surface/10 transition text-foreground"><Plus size={20} /></button>
                </div>
              ) : (
                <button 
                  onClick={handleAddToCart} 
                  disabled={!isInStock}
                  className={`h-16 border-2 border-primary text-primary font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition flex items-center justify-center gap-3 ${!isInStock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/5'}`}
                >
                  <ShoppingCart size={20} /> {isInStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              )}
              
              <button 
                onClick={handleBuyNow} 
                disabled={!isInStock}
                className={`h-16 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition shadow-premium flex items-center justify-center gap-3 ${
                  isInStock
                    ? 'bg-secondary text-button-text hover:brightness-110 cursor-pointer'
                    : 'bg-muted/20 text-muted/60 cursor-not-allowed shadow-none'
                }`}
              >
                {isInStock ? 'Buy Now' : 'Out of Stock'} <ArrowRight size={20} />
              </button>
            </div>

            {/* Mobile-only Info Section */}
            <div className="space-y-4 block lg:hidden">
              <div className="bg-card rounded-[2rem] border border-border/50 p-6 shadow-card">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-heading mb-4">Description</h3>
                <p className="text-sm text-muted font-medium leading-relaxed tracking-wide italic">"{product.description}"</p>
              </div>
              <div className="bg-card rounded-[2rem] border border-border/50 p-6 shadow-card">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-heading mb-6">Highlights</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                  {['Freshly Baked', 'Premium Quality', 'Eggless Available', 'No Preservatives', 'Secure Packing', 'Fast Delivery'].map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-success-light flex items-center justify-center border border-success/10 flex-shrink-0">
                        <CheckCircle2 size={10} className="text-success" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-heading">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RATINGS & REVIEWS SECTION ── */}
        <div className="mt-12 lg:mt-16 bg-card rounded-[2.5rem] border border-border/50 p-6 lg:p-10 shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-heading mb-2 uppercase tracking-tight">Ratings & Reviews</h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 bg-success text-white px-3 py-1.5 rounded-lg text-lg font-black shadow-sm">
                  {reviewStats.avg} <Star size={16} fill="currentColor" />
                </div>
                <span className="text-sm font-bold text-muted uppercase tracking-widest">{reviewStats.total} Verified Reviews</span>
              </div>
            </div>
          </div>

          {reviewStats.list.length > 0 ? (
            <div className="relative">
              <Swiper
                modules={[Pagination, Autoplay, Navigation]}
                spaceBetween={20}
                slidesPerView={1}
                pagination={{ clickable: true, dynamicBullets: true }}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                  1280: { slidesPerView: 4 },
                }}
                className="pb-16"
              >
                {reviewStats.list.map((rev, i) => (
                  <SwiperSlide key={i}>
                    <div className="bg-surface border border-border/30 rounded-[2rem] p-6 h-full flex flex-col shadow-card hover:shadow-premium transition-shadow duration-300">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, idx) => (
                            <Star key={idx} size={14} fill={idx < rev.rating ? "var(--star)" : "none"} className={idx < rev.rating ? "text-star" : "text-muted/20"} />
                          ))}
                        </div>
                        {rev.rating >= 4 && (
                          <span className="text-[9px] font-black text-success-text bg-success-light border border-success/10 px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-widest">
                            <CheckCircle2 size={10} /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-heading font-medium italic leading-relaxed line-clamp-4 mb-6 flex-1 opacity-90">
                        "{rev.comment}"
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t border-border/20">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                          {rev.userName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="text-xs font-black text-heading capitalize">{rev.userName || 'Verified Customer'}</p>
                          <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">Purchased recently</p>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className="text-center py-20 bg-surface/5 rounded-[2.5rem] border border-dashed border-border/50">
              <Info className="mx-auto text-muted/30 mb-4" size={48} />
              <p className="text-lg font-black text-heading uppercase tracking-widest opacity-30">No reviews yet for this delight</p>
              <p className="text-sm text-muted mt-2">Be the first to share your experience!</p>
            </div>
          )}
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 lg:mt-24 px-5 lg:px-0">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl lg:text-3xl font-black text-heading uppercase tracking-tight">You might also love</h2>
              <Link to="/shop" className="text-xs font-black text-primary uppercase tracking-[0.2em] border-b-2 border-primary/20 pb-1 hover:border-primary transition-all">View All Delights</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
              {relatedProducts.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProductDetails;