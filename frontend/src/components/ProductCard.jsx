import React from 'react';
import {
  Star,
  Plus,
  Minus,
  Heart,
  ShoppingCart,
  Cake,
  Scale,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

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
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">

      {/* IMAGE */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block bg-muted/5"
      >
        <div className="h-[180px] sm:h-[210px] lg:h-[220px] xl:h-[240px] w-full">
          <img
            src={
              product.image
            }
            alt={
              product.name
            }
            loading="lazy"
            className="w-full h-full object-contain object-center p-2 transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* OFFER BADGE */}
        {discountPct >
          0 && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg z-20 uppercase tracking-wide">
              {
                discountPct
              }
              % OFF
            </span>
          )}

        {/* BESTSELLER */}
        {product.bestseller && (
          <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg z-20 uppercase tracking-wide">
            Bestseller
          </span>
        )}

        {/* FLAVOUR BADGE for Cakes */}
        {hasFlavours && flavourBadge && (
          <span className="absolute top-2 right-12 bg-primary/90 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg z-20 uppercase tracking-wide flex items-center gap-1">
            <Cake size={10} />
            {flavourBadge}
          </span>
        )}

        {/* WISHLIST */}
        <button
          onClick={wish}
          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center z-20"
        >
          <Heart
            size={16}
            fill={
              isLiked
                ? '#ef4444'
                : 'none'
            }
            className={
              isLiked
                ? 'text-red-500'
                : 'text-muted'
            }
          />
        </button>

        {/* ADD / QTY */}
        {!isOutOfStock && (
          <div className="absolute bottom-2 right-2 z-20">
            <AnimatePresence mode="wait">

              {quantity >
                0 ? (
                <motion.div
                  key="qty"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  className="h-9 px-2 rounded-full bg-white shadow-xl border flex items-center gap-2"
                >
                  <button
                    onClick={
                      dec
                    }
                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted/10"
                  >
                    <Minus
                      size={
                        12
                      }
                    />
                  </button>

                  <span className="font-black text-xs min-w-[16px] text-center">
                    {
                      quantity
                    }
                  </span>

                  <button
                    onClick={
                      inc
                    }
                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted/10"
                  >
                    <Plus
                      size={
                        12
                      }
                    />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="add"
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  onClick={
                    add
                  }
                  className="w-10 h-10 rounded-full bg-primary text-white shadow-xl flex items-center justify-center"
                >
                  <Plus
                    size={
                      18
                    }
                  />
                </motion.button>
              )}

            </AnimatePresence>
          </div>
        )}

        {/* OUT OF STOCK */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-30">
            <span className="bg-card border px-3 py-1 rounded-full text-[10px] font-black uppercase">
              Out Of Stock
            </span>
          </div>
        )}
      </Link>

      {/* INFO */}
      <div className="p-3 flex flex-col gap-1 flex-1">

        <p className="text-[10px] uppercase tracking-widest text-muted font-bold">
          {
            product.category
          }
        </p>

        <Link
          to={`/product/${product.slug}`}
        >
          <h3 className="text-sm font-black text-heading line-clamp-2 capitalize hover:text-primary transition-colors min-h-[38px]">
            {
              product.name
            }
          </h3>
        </Link>

        {/* PRICE */}
        <div className="flex items-center gap-2 flex-wrap mt-1">

          <span className="text-lg font-black text-heading">
            ₹
            {
              sellingPrice
            }
          </span>

          {hasOffer && (
            <span className="text-sm line-through text-muted">
              ₹
              {mrp}
            </span>
          )}

          {product.ratingsAverage >
            0 && (
              <span className="ml-auto bg-green-600 text-white px-2 py-1 rounded-full text-[10px] font-black flex items-center gap-1">
                {product.ratingsAverage.toFixed(
                  1
                )}
                <Star
                  size={
                    10
                  }
                  fill="currentColor"
                />
              </span>
            )}

        </div>
        
        {/* Display flavour count hint for cakes */}
        {hasFlavours && (
          <div className="flex items-center gap-2 mt-1 text-[9px] text-muted font-bold uppercase tracking-widest">
            <Scale size={10} />
            <span>Multiple Options Available</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;