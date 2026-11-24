import { createContext, useContext, useEffect, useState } from 'react';

const KEY = 'cardrona.passCart';

const readLine = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const value = raw ? JSON.parse(raw) : null;
    return value && value.productId ? value : null;
  } catch {
    return null;
  }
};

// 季票购物车：一次结算一张季票配置
const PassCartContext = createContext(null);

export function PassCartProvider({ children }) {
  const [line, setLine] = useState(readLine);

  useEffect(() => {
    try {
      if (line) localStorage.setItem(KEY, JSON.stringify(line));
      else localStorage.removeItem(KEY);
    } catch {
      // 本地存储不可用时仅在本次会话生效
    }
  }, [line]);

  const clear = () => setLine(null);

  return (
    <PassCartContext.Provider value={{ line, setLine, clear, count: line ? 1 : 0 }}>
      {children}
    </PassCartContext.Provider>
  );
}

export const usePassCart = () => useContext(PassCartContext);