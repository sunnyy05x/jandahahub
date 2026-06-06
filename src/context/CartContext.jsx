import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'jandahahub_cart';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist cart to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // localStorage full or unavailable — silently fail
    }
  }, [cartItems]);

  const addToCart = useCallback((product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const getDeliveryFee = useCallback(() => {
    const subtotal = getCartTotal();
    return subtotal > 0 && subtotal < 300 ? 20 : 0;
  }, [getCartTotal]);

  const getGrandTotal = useCallback(() => {
    return getCartTotal() + getDeliveryFee();
  }, [getCartTotal, getDeliveryFee]);

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      getDeliveryFee,
      getGrandTotal,
    }),
    [
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      getDeliveryFee,
      getGrandTotal,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
