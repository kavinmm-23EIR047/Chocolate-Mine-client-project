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

  const { cart, addToCart, updateQuantity, applyCoupon, removeCoupon, fetchCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewStats, setReviewStats] = useState({ avg: 0, total: 0, list: [] });
  const [imgZoom, setImgZoom] = useState(false);
  const [displayImage, setDisplayImage] = useState(null);
  const quantity = 1; // Fixed quantity for product details page
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  
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
      if (!slug) return;
      try {
        setLoading(true);
        const res = await productService.getBySlug(slug);
        const prod = res?.data?.data;
        
        if (!prod) {
          throw new Error('Product not found in database');
        }

        setProduct(prod);
        
        // Initialize cake selections if product has variants
        if (prod.category === 'cakes' && prod.hasVariants && prod.flavors && prod.flavors.length > 0) {
          setSelectedFlavor(prod.flavors[0]);
          const firstVariant = prod.variants?.find(v => v.flavor === prod.flavors[0].name);
          if (firstVariant) {
            setSelectedWeight(firstVariant.weight);
            setSelectedPrice(firstVariant.price);
            setSelectedStock(firstVariant.stock);
          }
          if (prod.flavors[0].images && prod.flavors[0].images.length > 0) {
            setDisplayImage(prod.flavors[0].images[0]);
          } else {
            setDisplayImage(prod.image || null);
          }
        } else {
          setDisplayImage(prod.image || null);
        }

        const related = await productService.getAll({ category: prod.category, limit: 4 });
        if (related?.data?.data) {
          setRelatedProducts(related.data.data.filter(p => p._id !== prod._id));
        }

        try {
          const reviewRes = await reviewService.getProductReviews(prod._id);
          const list = reviewRes.data.data?.reviews || [];
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
        } catch (err) {
          console.warn('Failed to fetch reviews:', err);
          setReviewStats({ avg: prod.ratingsAverage || 0, total: prod.ratingsCount || 0, list: [] });
        }
      } catch (err) {
        console.error('Product fetch error:', err);
        toast.error('Product not found or failed to load');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, navigate]);

  // Handle quantity change - removed as per requirements

  // Handle flavor change
  const handleFlavorChange = (flavor) => {
    setSelectedFlavor(flavor);
    setShowCustomFlavorInput(false);
    setCustomFlavor('');
    
    
    let variant = product.variants?.find(v => v.flavor === flavor.name && v.weight === selectedWeight);
    if (!variant && product.variants) {
      variant = product.variants.find(v => v.flavor === flavor.name);
    }
    
    if (variant) {
      setSelectedWeight(variant.weight);
      setSelectedPrice(variant.price);
      setSelectedStock(variant.stock);
    }
    
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
  const currentVariantFlavor = product?.category === 'cakes' 
    ? (showCustomFlavorInput ? customFlavor : selectedFlavor?.name)
    : null;
  const currentVariantWeight = product?.category === 'cakes'
    ? (showCustomWeightInput ? customWeight : selectedWeight)
    : null;

  // Find cart item with same variant
  const cartItem = cart?.items?.find(i => 
    i.productId === product?._id && 
    (product.category !== 'cakes' || (i.selectedFlavor === currentVariantFlavor && i.selectedWeight === currentVariantWeight))
  );
  const cartQty = cartItem?.qty || 0;
  const isWishlisted = product ? isInWishlist(product._id) : false;

  // ─── PRICE LOGIC ───────────────────────────────────────
  const getCurrentPrice = () => {
    return product?.category === 'cakes' && selectedPrice 
      ? selectedPrice 
      : Number(product?.price || 0);
  };
  
  const currentPrice = getCurrentPrice();
  const hasOffer = product?.offerPrice && Number(product.offerPrice) > 0 && Number(product.offerPrice) < currentPrice;
  const basePrice = hasOffer ? Number(product.offerPrice) : currentPrice;
  const offerDiscount = currentPrice - basePrice;
  const offerPct = currentPrice > 0 ? Math.round((offerDiscount / currentPrice) * 100) : 0;

  // Check if coupon is applied to cart
  const isCouponApplied = cart?.appliedCoupon &&
    product?.coupon?.code &&
    cart.appliedCoupon.toUpperCase() === product.coupon.code.toUpperCase();

  // Calculate discount per unit
  const getCouponSavingsPerUnit = () => {
    if (!isCouponApplied || !product?.coupon?.enabled) return 0;
    const c = product.coupon;
    if (c.type === 'percent') return Math.round((basePrice * c.value) / 100);
    if (c.type === 'flat') return Math.min(basePrice, Number(c.value));
    return 0;
  };

  const couponSavingsPerUnit = getCouponSavingsPerUnit();
  const discountedPricePerUnit = Math.max(0, basePrice - couponSavingsPerUnit);
  
  // Total calculations with quantity
  const totalOriginalPrice = currentPrice * quantity;
  const totalBasePrice = basePrice * quantity;
  const totalOfferDiscount = offerDiscount * quantity;
  const totalCouponDiscount = couponSavingsPerUnit * quantity;
  const totalFinalPrice = discountedPricePerUnit * quantity;
  const totalSavings = totalOriginalPrice - totalFinalPrice;
  const totalSavingsPct = totalOriginalPrice > 0 ? Math.round((totalSavings / totalOriginalPrice) * 100) : 0;

  // Check if variant is in stock
  const isInStock = product?.category === 'cakes' 
    ? (selectedStock > 0)
    : (product?.stock > 0);

  // ─── COUPON ACTIONS ───────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!product?.coupon?.enabled) {
      toast.error('No coupon available for this product');
      return;
    }

    setApplyingCoupon(true);
    
    try {
      const isInCart = cart?.items?.some(item => 
        item.productId === product._id && 
        (product.category !== 'cakes' || 
          (item.selectedFlavor === currentVariantFlavor && 
           item.selectedWeight === currentVariantWeight))
      );

      if (!isInCart && quantity > 0) {
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
        }
        await addToCart(product._id, quantity, options);
        toast.success(`${quantity} item(s) added to cart`);
      }
      
      await applyCoupon(product.coupon.code);
      toast.success(`🎉 ${product.coupon.code} applied!`);
      await fetchCart();
      
    } catch (err) {
      console.error('Coupon application error:', err);
      toast.error(err?.response?.data?.message || 'Failed to apply coupon. Please try again.');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      toast.success('Coupon removed');
      await fetchCart();
    } catch (err) {
      toast.error('Failed to remove coupon');
    }
  };

  // ─── ADD TO CART ───────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!isInStock) {
      toast.error('Out of stock');
      return;
    }
    
    setAddingToCart(true);
    try {
      const options = {};
      if (product?.category === 'cakes') {
        if (showCustomFlavorInput && customFlavor) {
          options.flavor = customFlavor;
        } else if (selectedFlavor) {
          options.flavor = selectedFlavor.name;
        } else {
          toast.error('Please select flavor');
          setAddingToCart(false);
          return;
        }
        
        if (showCustomWeightInput && customWeight) {
          options.weight = customWeight;
        } else if (selectedWeight) {
          options.weight = selectedWeight;
        } else {
          toast.error('Please select weight');
          setAddingToCart(false);
          return;
        }
      }
      
      await addToCart(product._id, 1, options);
      toast.success(`Item added to cart!`);
      await fetchCart();
    } catch (err) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  // ─── BUY NOW ──
  const handleBuyNow = async () => {
    if (!isInStock) {
      toast.error('Out of stock');
      return;
    }
    
    // Validate cake selections before proceeding
    if (product?.category === 'cakes') {
      if (!currentVariantFlavor) {
        toast.error('Please select flavor');
        return;
      }
      if (!currentVariantWeight) {
        toast.error('Please select weight');
        return;
      }
    }

    setAddingToCart(true);
    try {
      const directItem = {
        productId: product._id,
        name: product.name,
        image: displayImage || product.image,
        price: product.price,
        offerPrice: product.offerPrice,
        qty: 1,
        selectedFlavor: currentVariantFlavor,
        selectedWeight: currentVariantWeight,
        coupon: product.coupon,
      };
      
      navigate('/checkout', { state: { directItem } });
    } catch (err) {
      toast.error('Failed to process. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Get valid flavor images
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
      <div className="bg-card border-b border-border hidden lg:block">

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
            <div className="relative bg-card lg:rounded-[2.5rem] overflow-hidden border-b lg:border cursor-zoom-in group shadow-md hover:shadow-xl transition-all duration-500" onClick={() => setImgZoom(!imgZoom)}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={displayImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={displayImage || undefined}
                  onError={(e) => { e.target.src = product?.image || ''; }}
                  className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </AnimatePresence>
              
              {offerPct > 0 && (
                <div className="absolute top-6 left-6 bg-red-600 text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg z-10 uppercase tracking-widest">
                  {offerPct}% OFF
                </div>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}
                className="absolute top-6 right-6 bg-card/90 backdrop-blur-md shadow-xl p-3 rounded-full hover:scale-110 transition-all z-10 group/heart"
              >

                <Heart 
                  size={24} 
                  fill={isWishlisted ? '#ef4444' : 'none'} 
                  className={`${isWishlisted ? 'text-red-500' : 'text-muted'} transition-colors group-hover/heart:text-red-500`} 
                />
              </button>

              {product.bestseller && (
                <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-secondary text-white text-xs font-black px-5 py-2.5 rounded-full uppercase tracking-widest shadow-xl z-10">
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

            {/* Highlights Grid */}
            <div className="hidden lg:grid grid-cols-3 gap-6">
              {[
                { icon: Truck, label: 'Free Delivery', sub: 'On all orders' },
                { icon: RotateCcw, label: 'Fresh Daily', sub: 'Baked today' },
                { icon: ShieldCheck, label: 'Secure Pay', sub: '100% safe' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-card rounded-3xl border p-6 flex flex-col items-center text-center gap-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <Icon size={28} className="text-primary mb-1" />
                  <p className="text-sm font-black uppercase tracking-wider text-heading">{label}</p>
                  <p className="text-[11px] text-muted font-medium">{sub}</p>
                </div>
              ))}
            </div>

            {/* Info Section */}
            <div className="space-y-6 pt-4 hidden lg:block">
              <div className="bg-card rounded-[2.5rem] border border-border/50 p-8 shadow-sm">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-heading mb-4">Description</h3>
                <p className="text-sm text-muted font-medium leading-relaxed tracking-wide italic">"{product.description}"</p>
              </div>

              <div className="bg-card rounded-[2.5rem] border border-border/50 p-8 shadow-sm">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-heading mb-6">Highlights</h3>
                <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                  {['Freshly Baked', 'Premium Quality', 'Eggless Available', 'No Preservatives', 'Secure Packing', 'Fast Delivery'].map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center border border-success/20 flex-shrink-0">

                        <CheckCircle2 size={12} className="text-green-500" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-heading">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT — DETAILS ── */}
          <div className="w-full lg:sticky lg:top-24 space-y-6 px-1 lg:px-0">
            {/* Main Product Info Card */}
            <div className="bg-card rounded-[2.5rem] border border-border/50 p-6 lg:p-10 shadow-sm hover:shadow-md transition-shadow">

              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black text-primary uppercase bg-primary/5 px-4 py-1.5 rounded-full tracking-widest border border-primary/10">
                  {product.category}
                </span>
                <button className="p-2.5 text-muted hover:text-primary transition-colors bg-muted/5 rounded-full"><Share2 size={18} /></button>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-heading leading-[1.1] mb-4 capitalize tracking-tight">{product.name}</h1>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1 rounded-xl text-xs font-black shadow-sm">
                  {reviewStats.avg} <Star size={12} fill="currentColor" />
                </div>
                <span className="text-xs text-muted font-black uppercase tracking-widest">{reviewStats.total} verified ratings</span>
              </div>

              {/* Cake Flavor and Weight Selection */}
              {product?.category === 'cakes' && product.hasVariants && (
                <div className="space-y-6 mb-6">
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
                          className="px-4 py-2 bg-card-soft text-heading rounded-xl text-xs font-black border border-border"
                        >
                          Cancel
                        </button>

                      </div>
                    )}
                  </div>

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
                          className="px-4 py-2 bg-card-soft text-heading rounded-xl text-xs font-black border border-border"
                        >
                          Cancel
                        </button>

                      </div>
                    )}
                  </div>
                  
                  {!isInStock && (
                    <div className="text-center py-2 bg-error/10 text-error rounded-xl text-xs font-black border border-error/20">
                      Out of Stock for this combination
                    </div>

                  )}
                </div>
              )}

              {/* ========== ACTION CARD SECTION ========== */}
              {/* Organized in proper order: Price → Coupon → Quantity → Buttons */}
              <div className="space-y-6">
                {/* 1. PRICE SECTION */}
                <div>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl lg:text-4xl font-black text-heading tracking-tighter">
                      {formatCurrency(totalFinalPrice)}
                    </span>
                    {totalOriginalPrice > totalFinalPrice && (
                      <span className="text-xl line-through text-muted/40 font-black tracking-tighter">
                        {formatCurrency(totalOriginalPrice)}
                      </span>
                    )}
                    {totalSavingsPct > 0 && (
                      <span className="text-base font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg uppercase tracking-wide">
                        Save {totalSavingsPct}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1">Inclusive of all taxes</p>
                </div>

                {/* 2. COUPON SECTION - Stays above quantity */}
                {product?.coupon?.enabled && (
                  <div className="bg-orange-500/10 rounded-2xl border border-orange-500/20 p-4">

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-card p-2 rounded-xl shadow-sm border border-border/50">

                          <Tag size={18} className="text-orange-500" />
                        </div>
                        <div>
                          <p className="font-black text-heading text-sm font-mono">{product.coupon.code}</p>
                          <p className="text-[10px] font-black text-orange-600">
                            {product.coupon.type === 'percent' ? `${product.coupon.value}% OFF` : `Flat ₹${product.coupon.value} OFF`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={isCouponApplied ? handleRemoveCoupon : handleApplyCoupon}
                        disabled={applyingCoupon}
                        className={`text-[10px] font-black px-4 py-2 rounded-xl transition-all uppercase tracking-wider ${
                          isCouponApplied 
                            ? 'bg-card text-error border border-error/30 hover:bg-error/5' 
                            : 'bg-primary text-button-text hover:brightness-110 shadow-sm'

                        } ${applyingCoupon ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {applyingCoupon ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                          isCouponApplied ? 'Remove' : 'Apply'
                        )}
                      </button>
                    </div>
                    {isCouponApplied && (
                      <p className="text-[9px] text-green-600 mt-2 text-center">
                        ✓ Coupon applied! You're saving {formatCurrency(totalCouponDiscount)} on this order
                      </p>
                    )}
                  </div>
                )}

                {/* 3. QUANTITY SECTION - Removed from Product Details */}

                {/* 4. PRICE BREAKDOWN */}
                <div className="bg-muted/5 rounded-2xl p-4 space-y-2 text-sm font-bold border border-border/20">
                  <div className="flex justify-between text-muted/70">
                    <span>Price ({quantity} item{quantity > 1 ? 's' : ''})</span>
                    <span>{formatCurrency(totalBasePrice)}</span>
                  </div>
                  {offerDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Offer Discount</span>
                      <span>- {formatCurrency(totalOfferDiscount)}</span>
                    </div>
                  )}
                  {couponSavingsPerUnit > 0 && isCouponApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon ({product.coupon.code})</span>
                      <span>- {formatCurrency(totalCouponDiscount)}</span>
                    </div>
                  )}
                  <div className="border-t border-border/30 pt-2 flex justify-between font-black text-heading">
                    <span>Total Amount</span>
                    <span className="text-primary">{formatCurrency(totalFinalPrice)}</span>
                  </div>
                </div>

                {/* 5. BUTTONS SECTION - ALWAYS VISIBLE & FIXED BELOW */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className={isInStock ? 'text-green-600' : 'text-red-500'} />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${isInStock ? 'text-green-600' : 'text-red-500'}`}>
                      {isInStock ? 'In Stock & Ready to Ship' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleAddToCart} 
                      disabled={!isInStock || addingToCart}
                      className={`h-14 border-2 border-primary text-primary font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition flex items-center justify-center gap-2 ${
                        !isInStock || addingToCart ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/5'
                      }`}
                    >
                      {addingToCart ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart size={18} /> Add to Cart
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={handleBuyNow} 
                      disabled={!isInStock || addingToCart}
                      className={`h-14 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition shadow-md flex items-center justify-center gap-2 ${
                        isInStock && !addingToCart
                          ? 'bg-secondary text-white shadow-secondary/20 hover:brightness-110 cursor-pointer'
                          : 'bg-muted/40 text-muted/60 cursor-not-allowed shadow-none'
                      }`}
                    >
                      {addingToCart ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>Buy Now <ArrowRight size={16} /></>
                      )}
                    </button>
                  </div>

                  {cartQty > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-2 py-2 bg-primary/5 rounded-xl border border-primary/10"
                    >
                      <CheckCircle2 size={14} className="text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                        {cartQty} {cartQty === 1 ? 'item' : 'items'} already in your cart
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Info Section */}
            <div className="space-y-4 block lg:hidden">
              <div className="bg-card rounded-[2rem] border border-border/50 p-6 shadow-sm">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-heading mb-4">Description</h3>
                <p className="text-sm text-muted font-medium leading-relaxed tracking-wide italic">"{product.description}"</p>
              </div>
              <div className="bg-card rounded-[2rem] border border-border/50 p-6 shadow-sm">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-heading mb-6">Highlights</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                  {['Freshly Baked', 'Premium Quality', 'Eggless Available', 'No Preservatives', 'Secure Packing', 'Fast Delivery'].map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center border border-green-100 flex-shrink-0">
                        <CheckCircle2 size={10} className="text-green-500" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-heading">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ratings & Reviews Section */}
        <div className="mt-12 lg:mt-16 bg-card rounded-[2.5rem] border border-border/50 p-6 lg:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-heading mb-2 uppercase tracking-tight">Ratings & Reviews</h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-lg font-black shadow-sm">
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
                    <div className="bg-background border border-border/30 rounded-[2rem] p-6 h-full flex flex-col shadow-sm hover:shadow-lg transition-shadow duration-300">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, idx) => (
                            <Star key={idx} size={14} fill={idx < rev.rating ? "#16a34a" : "none"} className={idx < rev.rating ? "text-green-600" : "text-muted/20"} />
                          ))}
                        </div>
                        {rev.rating >= 4 && (
                          <span className="text-[9px] font-black text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-widest">
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
            <div className="text-center py-20 bg-muted/5 rounded-[2.5rem] border border-dashed border-border/50">
              <Info className="mx-auto text-muted/30 mb-4" size={48} />
              <p className="text-lg font-black text-heading uppercase tracking-widest opacity-30">No reviews yet for this delight</p>
              <p className="text-sm text-muted mt-2">Be the first to share your experience!</p>
            </div>
          )}
        </div>

        {/* Related Products */}
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