export const stockState = (product) => {
  const onHand = Number(product?.stock_on_hand) || 0;
  const reorder = Number(product?.reorder_level) || 0;
  if (onHand <= 0) return 'Out of stock';
  if (onHand <= reorder) return 'Low stock';
  return 'In stock';
};

export const STOCK_TONES = {
  'In stock': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'Low stock': 'border-amber-200 bg-amber-50 text-amber-800',
  'Out of stock': 'border-rose-200 bg-rose-50 text-rose-700',
};

export const stockLabel = (state, lang) => {
  const map = {
    'In stock': ['有货', 'In stock'],
    'Low stock': ['库存偏低', 'Low stock'],
    'Out of stock': ['缺货', 'Out of stock'],
  };
  const pair = map[state] || [state, state];
  return lang === 'zh' ? pair[0] : pair[1];
};

export const stockValue = (products) =>
  products.reduce((sum, p) => sum + (Number(p.stock_on_hand) || 0) * (Number(p.price) || 0), 0);

export const salesTotals = (sales) => {
  const revenue = sales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const units = sales.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
  return { revenue, units, orders: sales.length };
};

export const salesByProduct = (sales) => {
  const map = new Map();
  sales.forEach((sale) => {
    const key = sale.product_id || sale.product_name;
    const row = map.get(key) || { name: sale.product_name, vendor: sale.vendor, revenue: 0, units: 0 };
    row.revenue += Number(sale.total) || 0;
    row.units += Number(sale.quantity) || 0;
    map.set(key, row);
  });
  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
};

export const salesByCategory = (sales) => {
  const map = new Map();
  sales.forEach((sale) => {
    const key = sale.category || 'Other';
    map.set(key, (map.get(key) || 0) + (Number(sale.total) || 0));
  });
  return [...map.entries()].map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue);
};

export const withinDays = (sales, days) => {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return sales.filter((s) => {
    const at = new Date(s.sold_at || s.created_date).getTime();
    return Number.isFinite(at) && at >= cutoff;
  });
};