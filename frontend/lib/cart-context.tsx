'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  uuid: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (uuid: string) => void;
  updateQuantity: (uuid: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('guest_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('guest_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.uuid === product.uuid);
      if (existing) {
        return prev.map(item => 
          item.uuid === product.uuid 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        uuid: product.uuid,
        name: product.name,
        price: Number(product.price),
        quantity: quantity,
        image_url: product.image_url
      }];
    });
  };

  const removeFromCart = (uuid: string) => {
    setCart(prev => prev.filter(item => item.uuid !== uuid));
  };

  const updateQuantity = (uuid: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(uuid);
      return;
    }
    setCart(prev => prev.map(item => 
      item.uuid === uuid ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
