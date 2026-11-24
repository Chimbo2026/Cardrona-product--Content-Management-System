const KEY = 'cardrona.entrySource';

export const setEntrySource = (source) => {
  try {
    localStorage.setItem(KEY, source);
  } catch {
    // 本地存储不可用时忽略，保持默认渠道
  }
};

export const getEntrySource = (fallback = '微信搜索') => {
  try {
    return localStorage.getItem(KEY) || fallback;
  } catch {
    return fallback;
  }
};