import { createContext, useContext, useEffect, useState } from 'react';
import zhCN from './zh-CN';
import en from './en';

const PACKS = { 'zh-CN': zhCN, en };
const STORAGE_KEY = 'snowline.lang.v2';
const PREFERENCE_VERSION_KEY = 'snowline.lang.preferenceVersion';
const PREFERENCE_VERSION = 'simplified-chinese-2027';

// 旧版保存的英文选择不能覆盖此次简体中文更新；更新后仍记住主动切换。
const detectLang = () => {
  if (typeof localStorage === 'undefined') return 'zh-CN';
  if (localStorage.getItem(PREFERENCE_VERSION_KEY) !== PREFERENCE_VERSION) return 'zh-CN';
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved && PACKS[saved] ? saved : 'zh-CN';
};

const LanguageContext = createContext({
  lang: 'zh-CN',
  setLang: () => {},
  t: (key) => key,
  bi: (zh) => zh,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectLang);

  const setLang = (next) => {
    if (!PACKS[next]) return;
    setLangState(next);
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, next);
  };

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    if (localStorage.getItem(PREFERENCE_VERSION_KEY) === PREFERENCE_VERSION) return;
    setLangState('zh-CN');
    localStorage.setItem(STORAGE_KEY, 'zh-CN');
    localStorage.setItem(PREFERENCE_VERSION_KEY, PREFERENCE_VERSION);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key, vars) => {
    let text = PACKS[lang]?.[key] ?? PACKS['zh-CN'][key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([name, value]) => {
        text = text.split(`{${name}}`).join(String(value));
      });
    }
    return text;
  };

  // Inline bilingual copy: bi('中文', 'English')
  const bi = (zh, en) => (lang === 'en' ? en : zh);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, bi }}>{children}</LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);