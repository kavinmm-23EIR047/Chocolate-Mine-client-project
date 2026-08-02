import { createSlice } from '@reduxjs/toolkit';

const safeGetItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
};

const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
};

const initialState = {
  items: safeGetItem('cartItems', []),
  appliedCoupon: safeGetItem('appliedCoupon', null),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, qty, options, variantPrice, addons } = action.payload;
      const existingItem = state.items.find(
        (item) =>
          item.productId === product._id &&
          JSON.stringify(item.options) === JSON.stringify(options) &&
          JSON.stringify(item.addons) === JSON.stringify(addons)
      );

      if (existingItem) {
        existingItem.qty += qty;
      } else {
        state.items.push({
          productId: product._id,
          name: product.name,
          description: product.description,
          image: product.image,
          category: product.category,
          price: product.price,
          offerPrice: product.offerPrice,
          variantPrice: variantPrice,
          qty,
          options,
          addons: addons || [],
          selectedFlavor: options?.flavor || options?.color || null,
          selectedWeight: options?.weight || null,
          stock: product.stock, // Store initial stock for quick reference
          coupon: product.coupon, // Store coupon details
        });
      }

      // Automatically apply the coupon to the cart if the product has one and no other coupon is currently applied
      if (product.coupon && product.coupon.code) {
        if (!state.appliedCoupon) {
          state.appliedCoupon = String(product.coupon.code).trim().toUpperCase();
          safeSetItem('appliedCoupon', state.appliedCoupon);
        }
      }

      safeSetItem('cartItems', state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.productId !== action.payload);
      
      // Auto-remove applied coupon if no remaining items support it
      if (state.appliedCoupon) {
        const appliedCode = typeof state.appliedCoupon === 'string'
          ? state.appliedCoupon.trim().toUpperCase()
          : state.appliedCoupon.code?.trim().toUpperCase();

        const isCouponStillValid = state.items.some(item => {
          const itemCode = typeof item.coupon === 'string'
            ? item.coupon.trim().toUpperCase()
            : item.coupon?.code?.trim().toUpperCase();
          
          // Must match code AND be enabled on this product
          return itemCode && itemCode === appliedCode && item.coupon?.enabled;
        });

        if (!isCouponStillValid) {
          state.appliedCoupon = null;
          safeRemoveItem('appliedCoupon');
        }
      }

      safeSetItem('cartItems', state.items);
    },
    updateCartQty: (state, action) => {
      const { productId, qty } = action.payload;
      const item = state.items.find((i) => i.productId === productId);
      if (item) {
        if (qty === 0) {
          // If qty is 0, remove the item
          state.items = state.items.filter((i) => i.productId !== productId);
          
          // Auto-remove applied coupon if no remaining items support it
          if (state.appliedCoupon) {
            const appliedCode = typeof state.appliedCoupon === 'string'
              ? state.appliedCoupon.trim().toUpperCase()
              : state.appliedCoupon.code?.trim().toUpperCase();

            const isCouponStillValid = state.items.some(item => {
              const itemCode = typeof item.coupon === 'string'
                ? item.coupon.trim().toUpperCase()
                : item.coupon?.code?.trim().toUpperCase();
              
              // Must match code AND be enabled on this product
              return itemCode && itemCode === appliedCode && item.coupon?.enabled;
            });

            if (!isCouponStillValid) {
              state.appliedCoupon = null;
              safeRemoveItem('appliedCoupon');
            }
          }
        } else {
          item.qty = qty;
        }
      }
      safeSetItem('cartItems', state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.appliedCoupon = null;
      safeRemoveItem('cartItems');
      safeRemoveItem('appliedCoupon');
    },
    setCoupon: (state, action) => {
      state.appliedCoupon = action.payload;
      safeSetItem('appliedCoupon', action.payload);
    },
    updateCartItemAddons: (state, action) => {
      const { productId, addons, options } = action.payload;
      const item = state.items.find(
        (i) =>
          i.productId === productId &&
          JSON.stringify(i.options) === JSON.stringify(options)
      );
      if (item) {
        item.addons = addons || [];
      }
      safeSetItem('cartItems', state.items);
    },
    // Realtime stock sync for cart
    syncCartStock: (state, action) => {
      const { productId, newStock, variantUpdate } = action.payload;
      state.items = state.items.map(item => {
        if (item.productId === productId) {
          if (variantUpdate && item.options?.flavor === variantUpdate.flavor && item.options?.weight === variantUpdate.weight) {
             return { ...item, stock: variantUpdate.newVariantStock };
          } else if (!variantUpdate) {
             return { ...item, stock: newStock };
          }
        }
        return item;
      });
      safeSetItem('cartItems', state.items);
    }
  },
});

export const { addToCart, removeFromCart, updateCartQty, clearCart, setCoupon, updateCartItemAddons, syncCartStock } = cartSlice.actions;
export default cartSlice.reducer;