import { createContext, useContext, useEffect, useState } from 'react';
import { tx as txMap } from './i18nMaps';

const LANG_KEY = 'cardrona_lang';

const LangContext = createContext({
  lang: 'zh',
  setLang: /** @type {(lang: string) => void} */ (() => {}),
  t: (zh, en) => zh,
  tx: (v) => txMap(v, 'zh'),
});

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'zh');

  const setLang = (l) => {
    localStorage.setItem(LANG_KEY, l);
    setLangState(l);
  };

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }, [lang]);

  const t = (zh, en) => (lang === 'zh' ? zh : (en ?? zh));
  const tx = (value) => txMap(value, lang);

  return <LangContext.Provider value={{ lang, setLang, t, tx }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
