"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CartItem, NewCartItem } from "@/types";

const CART_STORAGE_KEY = "tqp_cart";

type CartContextValue = {
  items: CartItem[];
  addItem: (item: NewCartItem) => void;
  removeItem: (cartLineId: string) => void;
  updateQuantity: (cartLineId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isHydrated: boolean;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function lineUnitPrice(item: CartItem): number {
  return item.type === "perfume" ? item.unitPrice : item.price;
}

function generateCartLineId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `line_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage on mount
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore corrupted storage
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota/storage errors
    }
  }, [items, isHydrated]);

  function addItem(item: NewCartItem) {
    setItems((prev) => [...prev, { ...item, cartLineId: generateCartLineId() } as CartItem]);
  }

  function removeItem(cartLineId: string) {
    setItems((prev) => prev.filter((i) => i.cartLineId !== cartLineId));
  }

  function updateQuantity(cartLineId: string, quantity: number) {
    setItems((prev) =>
      prev.map((i) => (i.cartLineId === cartLineId ? { ...i, quantity: Math.max(1, quantity) } : i))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + lineUnitPrice(i) * i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, isHydrated }),
    [items, itemCount, subtotal, isHydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
