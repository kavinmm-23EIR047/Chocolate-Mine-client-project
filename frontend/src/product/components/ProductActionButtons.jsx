import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingCart, ArrowRight, CheckCircle2 } from 'lucide-react';

const ProductActionButtons = ({
  productId,
  cartQty,
  isInStock,
  addingToCart,
  handleUpdateQuantity,
  handleAddToCart,
  handleBuyNow,
  isMobile = false,
  isDeliverable = true,
  cannotDeliverMessage = "Not Deliverable"
}) => {
  if (isMobile) {
    return (
      <div 
        className="lg:hidden fixed inset-x-0 bottom-0 z-[9998] bg-card/95 backdrop-blur-lg border-t border-border/40 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] grid grid-cols-2 gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.3)]"
      >
        {cartQty > 0 ? (
          <div className="flex items-center border border-border/40 rounded-xl h-11 bg-muted/5">
            <button onClick={() => handleUpdateQuantity(productId, cartQty - 1)} className="w-11 h-full flex items-center justify-center hover:bg-muted/10 transition"><Minus size={18} /></button>
            <span className="flex-1 text-center font-black text-base text-heading">{cartQty}</span>
            <button onClick={() => handleUpdateQuantity(productId, cartQty + 1)} className="w-11 h-full flex items-center justify-center hover:bg-muted/10 transition"><Plus size={18} /></button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={!isInStock || !isDeliverable}
            className={`h-11 border-2 border-primary text-primary font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 ${(!isInStock || !isDeliverable) ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
          >
            <ShoppingCart size={17} /> {!isDeliverable ? 'Unavailable' : isInStock ? 'Add to Cart' : 'Sold Out'}
          </button>
        )}

        <button
          onClick={handleBuyNow}
          disabled={!isInStock || !isDeliverable}
          className={`h-11 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 ${(isInStock && isDeliverable)
            ? 'bg-primary text-button-text shadow-primary/20 active:scale-95'
            : 'bg-muted/40 text-muted/60 cursor-not-allowed'
            }`}
        >
          {!isDeliverable ? 'Unavailable' : isInStock ? 'Buy Now' : 'Out of Stock'} <ArrowRight size={17} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:grid grid-cols-2 gap-4 bg-card rounded-[2.5rem] border p-6 xl:p-8 shadow-sm mt-6">
        <div className="col-span-2 mb-2 flex flex-col gap-2">
          {!isDeliverable ? (
            <div className="flex items-center gap-3 bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-xs font-black uppercase tracking-widest text-red-500">
                {cannotDeliverMessage}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-muted/5 p-4 rounded-2xl border border-border/20">
              <div className={`w-2.5 h-2.5 rounded-full ${isInStock ? 'bg-success animate-pulse' : 'bg-error'}`} />
              <span className={`text-xs font-black uppercase tracking-widest ${isInStock ? 'text-success-text' : 'text-error-text'}`}>
                {isInStock ? 'Available' : 'Not Available'}
              </span>
            </div>
          )}
        </div>

        {cartQty > 0 ? (
          <div className="flex items-center border-2 border-border/30 rounded-2xl h-14 xl:h-16 bg-muted/5">
            <button onClick={() => handleUpdateQuantity(productId, cartQty - 1)} className="w-16 h-full flex items-center justify-center hover:bg-muted/10 transition"><Minus size={20} /></button>
            <span className="flex-1 text-center font-black text-lg xl:text-xl text-heading">{cartQty}</span>
            <button onClick={() => handleUpdateQuantity(productId, cartQty + 1)} className="w-16 h-full flex items-center justify-center hover:bg-muted/10 transition"><Plus size={20} /></button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={!isInStock || addingToCart || !isDeliverable}
            className={`h-14 xl:h-16 border-2 border-primary text-primary font-black text-xs xl:text-sm uppercase tracking-widest rounded-2xl transition flex items-center justify-center gap-3 ${(!isInStock || !isDeliverable) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/5'}`}
          >
            {addingToCart ? <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <ShoppingCart size={20} />}
            {!isDeliverable ? 'Unavailable' : isInStock ? 'Add to Cart' : 'Sold Out'}
          </button>
        )}

        {/* Updated from bg-secondary to bg-primary for accessible contrast */}
        <button
          onClick={handleBuyNow}
          disabled={!isInStock || !isDeliverable}
          className={`h-14 xl:h-16 font-black text-xs xl:text-sm uppercase tracking-widest rounded-2xl transition shadow-xl flex items-center justify-center gap-3 ${(isInStock && isDeliverable)
            ? 'bg-primary text-button-text shadow-primary/20 hover:brightness-110 cursor-pointer'
            : 'bg-muted/40 text-muted/60 cursor-not-allowed shadow-none'
            }`}
        >
          {!isDeliverable ? 'Unavailable' : isInStock ? 'Buy Now' : 'Out of Stock'} <ArrowRight size={20} />
        </button>
      </div>

      {cartQty > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 py-3 mt-4 bg-primary/5 rounded-xl border border-primary/10"
        >
          <CheckCircle2 size={16} className="text-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-primary">
            {cartQty} {cartQty === 1 ? 'item' : 'items'} already in your cart
          </span>
        </motion.div>
      )}
    </>
  );
};

export default ProductActionButtons;