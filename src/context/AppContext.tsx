"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { translations, TranslationKey } from '@/utils/translations';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  restaurant_id?: number;
}

interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  restaurant_id?: number;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  language: 'en' | 'am';
  setLanguage: (lang: 'en' | 'am') => void;
  t: (key: TranslationKey) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [language, setLanguageState] = useState<'en' | 'am'>('en');
  const router = useRouter();

  const setLanguage = (lang: 'en' | 'am') => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  // Load from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedCart = localStorage.getItem('cart');
    const savedLang = localStorage.getItem('language');
    
    if (savedLang === 'en' || savedLang === 'am') {
      setLanguageState(savedLang);
    }
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    if (userData.role === 'restaurant') {
      router.push('/dashboard/restaurant');
    } else if (userData.role === 'driver') {
      router.push('/dashboard/driver');
    } else {
      router.push('/');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const addToCart = (newItem: CartItem) => {
    setCart(prev => {
      // Prevent ordering from multiple restaurants at once for simplicity
      if (prev.length > 0 && prev[0].restaurant_id !== newItem.restaurant_id) {
        alert("You can only order from one restaurant at a time. Your cart has been reset.");
        return [newItem];
      }
      
      const existingItem = prev.find(item => item.id === newItem.id);
      if (existingItem) {
        return prev.map(item => 
          item.id === newItem.id 
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);

  return (
    <AppContext.Provider value={{
      user, token, login, logout, setUser,
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal,
      language, setLanguage, t
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
