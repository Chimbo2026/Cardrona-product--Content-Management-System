// 管理员「顾客视角」预览状态：进入后隐藏管理后台入口，仅保留顾客可见的界面。
const KEY = 'snowline_customer_view';

export const isCustomerView = () => {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export const startCustomerView = () => {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    // 忽略存储不可用的情况
  }
};

export const stopCustomerView = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // 忽略存储不可用的情况
  }
};