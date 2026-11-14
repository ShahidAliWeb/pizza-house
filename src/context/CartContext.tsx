import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Pizza } from '../types';
import { api } from '../api';

export type ItemSize = 'Small' | 'Medium' | 'Large' | 'Regular' | 'Single';

interface CartContextType {
  items: CartItem[];
  addItem: (pizza: Pizza, size?: ItemSize, quantity?: number) => void;
  updateQuantity: (pizzaId: string, size: ItemSize, delta: number) => void;
  removeItem: (pizzaId: string, size: ItemSize) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  couponCode: string;
  discountAmount: number;
  couponError: string | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  grandTotal: number;
  totalItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ph_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('ph_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (pizza: Pizza, size: ItemSize = 'Regular', quantity: number = 1) => {
    const effectiveSize = pizza.hasSizes === false ? 'Regular' : (size || 'Regular');
    const sizeKey = effectiveSize.toLowerCase() as 'small' | 'medium' | 'large';
    const unitPrice = pizza.sizes?.[sizeKey] ?? pizza.price ?? pizza.sizes?.medium ?? pizza.sizes?.small ?? 0;

    setItems(prev => {
      const existingIdx = prev.findIndex(item => item.pizza._id === pizza._id && item.size === effectiveSize);
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += quantity;
        return copy;
      } else {
        return [...prev, { pizza, size: effectiveSize, quantity, unitPrice }];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (pizzaId: string, size: ItemSize, delta: number) => {
    setItems(prev => {
      return prev
        .map(item => {
          if (item.pizza._id === pizzaId && item.size === size) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeItem = (pizzaId: string, size: ItemSize) => {
    setItems(prev => prev.filter(item => !(item.pizza._id === pizzaId && item.size === size)));
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    setDiscountAmount(0);
    setCouponError(null);
  };

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? (subtotal >= 2500 ? 0 : 150) : 0;
  const taxAmount = Math.round(subtotal * 0.05);

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      setCouponError('Please enter a coupon code');
      return false;
    }
    try {
      setCouponError(null);
      const res = await api.validateCoupon(code, subtotal);
      setCouponCode(res.code);
      setDiscountAmount(res.discountAmount);
      return true;
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
      setDiscountAmount(0);
      setCouponCode('');
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountAmount(0);
    setCouponError(null);
  };

  const grandTotal = Math.max(0, subtotal + deliveryFee + taxAmount - discountAmount);
  const totalItemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        couponCode,
        discountAmount,
        couponError,
        applyCoupon,
        removeCoupon,
        subtotal,
        deliveryFee,
        taxAmount,
        grandTotal,
        totalItemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
