import { createContext, useContext, useEffect, useState } from 'react';

const KEY = 'cardrona.cart';

const readCart = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readCart);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(cart));
    } catch {
      // 本地存储不可用时仅在本次会话生效
    }
  }, [cart]);

  const add = (item, size = '', qty = 1) => {
    const key = `${item.id}__${size}`;
    setCart((prev) => {
      const found = prev.find((line) => line.key === key);
      if (found) {
        return prev.map((line) => (line.key === key ? { ...line, qty: line.qty + qty } : line));
      }
      return [...prev, { key, item, size, qty }];
    });
  };

  const remove = (key) => setCart((prev) => prev.filter((line) => line.key !== key));

  const setQty = (key, qty) =>
    setCart((prev) =>
      prev.map((line) => (line.key === key ? { ...line, qty: Math.max(1, qty) } : line)),
    );

  const clear = () => setCart([]);

  const count = cart.reduce((sum, line) => sum + line.qty, 0);

  return (
    <CartContext.Provider value={{ cart, add, remove, setQty, clear, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);