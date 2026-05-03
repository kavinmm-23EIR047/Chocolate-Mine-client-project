import React, { useMemo } from 'react';
import {
  Star,
  Plus,
  Minus,
  Heart,
  ShoppingCart,
  Cake,
  Scale,
  Tag,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import { getCouponUnitDiscount, normalizeCartCoupon } from '../utils/helpers';

function isProductCouponLive(coupon) {
  if (!coupon?.enabled || !String(coupon.code || '').trim()) return false;
  const now = Date.now();
  if (coupon.startDate && new Date(coupon.startDate).getTime() > now) return false;
  if (coupon.endDate && new Date(coupon.endDate).getTime() < now) return false;
  if (coupon.usageLimit != null && Number(coupon.usedCount || 0) >= Number(coupon.usageLimit)) return false;
  return true;
}

function couponBenefitLabel(coupon) {
  if (!coupon) return '';
  if (coupon.type === 'percent') return `${coupon.value}% instant OFF`;
  if (coupon.type === 'flat') return `Flat ₹${coupon.value} OFF`;
  if (coupon.type === 'price') return `Special price ₹${coupon.value}`;
  return 'Extra savings';
}

const ProductCard = ({ product }) => {
  const {
    addToCart,
    updateQuantity,
    cart,
  } = useCart();

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const isLiked =
    isInWishlist(
      product._id
    );

  const cartItem =
    cart.items?.find(
      (item) =>
        item.productId ===
        product._id
    );

  const quantity =
    cartItem?.qty || 0;

  const isOutOfStock =
    product.stock === 0;

  // Check if product has flavours (cake)
  const hasFlavours = product.category === 'cakes' && product.flavours && product.flavours.length > 0;

  // -------------------------
  // PRICE
  // -------------------------

  const mrp = Number(
    product.price || 0
  );

  const hasOffer =
    Number(
      product.offerPrice
    ) > 0 &&
    Number(
      product.offerPrice
    ) < mrp;

  const sellingPrice =
    hasOffer
      ? Number(
        product.offerPrice
      )
      : mrp;

  const discountPct =
    mrp > sellingPrice
      ? Math.round(
        ((mrp -
          sellingPrice) /
          mrp) *
        100
      )
      : 0;

  const offerSave = mrp > sellingPrice ? mrp - sellingPrice : 0;

  const couponLive = useMemo(
    () => isProductCouponLive(product.coupon),
    [product.coupon]
  );

  const couponCodeDisplay = couponLive
    ? String(product.coupon.code).trim().toUpperCase()
    : '';

  const isThisCouponApplied =
    couponLive &&
    normalizeCartCoupon(cart?.appliedCoupon) === normalizeCartCoupon(product.coupon?.code);

  const couponUnitOff = couponLive
    ? getCouponUnitDiscount(sellingPrice, product.coupon)
    : 0;

  const priceWithCoupon = Math.max(0, sellingPrice - couponUnitOff);

  const displayPrice = isThisCouponApplied ? priceWithCoupon : sellingPrice;

  // -------------------------
  // EVENTS
  // -------------------------

  const stop = (
    e
  ) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const add = async (
    e
  ) => {
    stop(e);

    try {
      // For cake products, add with default flavour and weight if available
      let options = {};
      if (hasFlavours && product.flavours[0]) {
        options.flavour = product.flavours[0].name;
        options.weight = product.flavours[0].weightOptions?.[0] || '';
      }
      
      await addToCart(
        product._id,
        1,
        options
      );

      toast.success(
        'Added to cart'
      );
    } catch {
      toast.error(
        'Failed'
      );
    }
  };

  const inc = (
    e
  ) => {
    stop(e);

    updateQuantity(
      product._id,
      quantity + 1
    );
  };

  const dec = (
    e
  ) => {
    stop(e);

    updateQuantity(
      product._id,
      quantity - 1
    );
  };

  const wish = (
    e
  ) => {
    stop(e);

    toggleWishlist(
      product._id
    );
  };

  // Get default flavour badge text
  const getFlavourBadge = () => {
    if (!hasFlavours) return null;
    const flavourCount = product.flavours.length;
    if (flavourCount === 1) {
      return product.flavours[0].name;
    }
    return `${flavourCount} Flavours`;
  };

  const flavourBadge = getFlavourBadge();

  return (
    <div className="group bg-card border border-border/40 rounded-[2.5rem] overflow-hidden hover:shadow-[0_30px_60px_rgba(61,31,26,0.12)] transition-all duration-500 flex flex-col md:flex-row w-full hover:-translate-y-1">
      
      {/* LEFT SIDE: IMAGE SECTION */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block bg-muted/5 overflow-hidden w-full md:w-[35%] shrink-0"
      >
        <div className="h-[280px] md:h-full w-full relative">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-footer/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* BADGES */}
        <div className="absolute left-4 top-4 z-20 flex flex-col gap-2">
          {discountPct > 0 && (
            <span className="w-fit bg-sale px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-button-text shadow-xl backdrop-blur-sm rounded-2xl">
              {discountPct}% OFF
            </span>
          )}
          {product.bestseller && (
            <span className="bg-accent text-primary text-[10px] font-black px-4 py-2 rounded-2xl shadow-xl uppercase tracking-[0.2em] backdrop-blur-sm">
              Bestseller
            </span>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-30">
            <span className="bg-card/90 text-primary border border-border/60 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* RIGHT SIDE: INFO & DESCRIPTION */}
      <div className="p-8 md:p-10 flex flex-col flex-1 bg-card relative">
        {/* WISHLIST (Top Right) */}
        <button
          onClick={wish}
          className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-card/85 backdrop-blur-md border border-border/50 shadow-soft flex items-center justify-center z-20 hover:scale-110 active:scale-95 transition-all duration-300"
        >
          <Heart
            size={22}
            fill={isLiked ? 'var(--error)' : 'none'}
            className={isLiked ? 'text-error' : 'text-foreground'}
          />
        </button>

        <div className="flex flex-col gap-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-secondary font-black">
              {product.category}
            </p>
            {product.ratingsAverage > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-success/5 border border-success/10 rounded-full">
                <span className="text-[12px] font-black text-success">
                  {product.ratingsAverage.toFixed(1)}
                </span>
                <Star size={12} fill="currentColor" className="text-success" />
              </div>
            )}
          </div>

          <Link to={`/product/${product.slug}`}>
            <h3 className="text-2xl md:text-3xl font-black text-heading leading-tight tracking-tight capitalize hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-sm md:text-base text-muted font-medium line-clamp-3 leading-relaxed opacity-80 mt-2">
            {product.description || "Indulge in our premium handcrafted delight, made with the finest ingredients and baked fresh to perfection for your special moments."}
          </p>

          <Link 
            to={`/product/${product.slug}`}
            className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 mt-2 hover:translate-x-2 transition-transform w-fit"
          >
            Click to see full details <Plus size={14} />
          </Link>
        </div>

        {/* BOTTOM SECTION: PRICE & ACTIONS */}
        <div className="mt-auto pt-8 border-t border-border/30 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-3">
              <span className={`text-3xl md:text-4xl font-black tracking-tighter ${isThisCouponApplied ? 'text-coupon' : 'text-primary'}`}>
                ₹{displayPrice}
              </span>
              {(hasOffer || (isThisCouponApplied && sellingPrice !== displayPrice)) && (
                <span className="text-lg font-semibold text-muted/50 line-through">
                  ₹{isThisCouponApplied ? sellingPrice : mrp}
                </span>
              )}
            </div>
            {couponLive && !isThisCouponApplied && (
              <div className="flex items-center gap-2 mt-1">
                <Tag size={14} className="text-coupon" />
                <span className="text-xs font-bold text-muted">Use code <span className="font-black text-primary uppercase">{couponCodeDisplay}</span> for extra savings</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                {quantity > 0 ? (
                  <div className="h-14 px-3 rounded-2xl bg-card shadow-lg border border-border/40 flex items-center gap-4">
                    <button onClick={dec} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-error/10 text-error transition-all"><Minus size={18} /></button>
                    <span className="font-black text-lg min-w-[30px] text-center">{quantity}</span>
                    <button onClick={inc} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-success/10 text-success transition-all"><Plus size={18} /></button>
                  </div>
                ) : (
                  <button
                    onClick={add}
                    className="h-14 px-8 rounded-2xl bg-primary text-button-text font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                  >
                    <ShoppingCart size={20} /> Add to Cart
                  </button>
                )}
              </div>
            )}
            {isOutOfStock && (
              <button disabled className="h-14 px-8 rounded-2xl bg-muted/20 text-muted/50 font-black uppercase tracking-widest cursor-not-allowed">
                Sold Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;