import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import ProductCard from '../../components/ProductCard';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { wishlist, loading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (loading && wishlist.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black text-muted uppercase tracking-widest">Opening your heart list...</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="py-20 text-center space-y-6 max-w-md mx-auto">
        <div className="w-24 h-24 bg-secondary/5 rounded-[2rem] flex items-center justify-center text-secondary mx-auto mb-8">
          <Heart size={48} className="opacity-20" />
        </div>
        <h2 className="text-2xl font-black text-heading uppercase tracking-tighter">Your wishlist is empty</h2>
        <p className="text-sm font-medium text-muted leading-relaxed">
          Seems like you haven't found your sweet match yet. Browse our collection and save what you love!
        </p>
        <Link to="/" className="inline-block pt-4">
          <Button icon={ShoppingBag}>START SHOPPING</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-heading uppercase tracking-tighter">My Wishlist</h2>
          <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">Saved delicacies for later</p>
        </div>
        <span className="bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
          {wishlist.length} Items
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {wishlist.map((product) => (
            <motion.div
              key={product._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative group"
            >
              <ProductCard product={product} />
              
              {/* Overlays for Wishlist Page actions if needed, or just use the card */}
              <button
                onClick={() => toggleWishlist(product._id)}
                className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-md text-error rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Wishlist;
