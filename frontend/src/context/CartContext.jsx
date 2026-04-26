import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch cart when user changes
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart({ items: [], total: 0 });
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data.data || { items: [], total: 0 });
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1, options = {}) => {
    try {
      const payload = { 
        productId, 
        qty: quantity,
        selectedFlavor: options.flavor || null,
        selectedWeight: options.weight || null
      };
      const response = await api.post('/cart/add', payload);
      setCart(response.data.data);
      return response.data;
    } catch (err) {
      console.error('Failed to add to cart:', err);
      throw err;
    }
  };

  const removeFromCart = async (productId, selectedFlavor = null, selectedWeight = null) => {
    try {
      const response = await api.delete(`/cart/remove/${productId}`, {
        data: { selectedFlavor, selectedWeight }
      });
      setCart(response.data.data);
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      throw err;
    }
  };

  const updateQuantity = async (productId, quantity, selectedFlavor = null, selectedWeight = null) => {
    try {
      const payload = { 
        productId, 
        qty: quantity,
        selectedFlavor: selectedFlavor || null,
        selectedWeight: selectedWeight || null
      };
      const response = await api.put('/cart/update', payload);
      setCart(response.data.data);
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const applyCoupon = async (code) => {
    try {
      const response = await api.post('/cart/apply-coupon', { code });
      setCart(response.data.data);
      return response.data;
    } catch (err) {
      console.error('Failed to apply coupon:', err);
      throw err;
    }
  };

  const removeCoupon = async () => {
    try {
      const response = await api.post('/cart/remove-coupon');
      setCart(response.data.data);
    } catch (err) {
      console.error('Failed to remove coupon:', err);
    }
  };

  const clearCart = async () => {
    try {
      const response = await api.delete('/cart/clear');
      setCart(response.data.data || { items: [], total: 0 });
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      fetchCart, 
      applyCoupon, 
      removeCoupon,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);