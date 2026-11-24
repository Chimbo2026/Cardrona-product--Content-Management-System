export const formatNZD = (value) => `NZ$${Number(value || 0).toFixed(2)}`;

export const SHOP_FILTERS = [
  { key: 'new', labelKey: 'shop.title', category: null, onlyNew: true },
  { key: 'all', labelKey: 'shop.all', category: null },
  { key: 'men', labelKey: 'shop.men', category: '男士' },
  { key: 'women', labelKey: 'shop.women', category: '女士' },
  { key: 'accessories', labelKey: 'shop.accessories', category: '配件' },
];

export const generateShopOrderNo = () => {
  const d = new Date();
  const stamp = `${d.getFullYear()}${`${d.getMonth() + 1}`.padStart(2, '0')}${`${d.getDate()}`.padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SHOP-${stamp}-${rand}`;
};