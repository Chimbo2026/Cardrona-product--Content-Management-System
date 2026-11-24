export const CATEGORY_OPTIONS = ['门票', '课程', '租赁', '套餐'];

export const REGION_OPTIONS = ['新西兰', '澳大利亚', '台湾', '香港', '中国大陆', '其他'];

export const SOURCE_OPTIONS = ['微信搜索', '朋友圈分享', '代理推荐', '小程序码', '广告投放'];

export const NATIONALITY_OPTIONS = [
  '新西兰',
  '澳大利亚',
  '中国',
  '中国台湾',
  '中国香港',
  '新加坡',
  '美国',
  '英国',
  '其他',
];

export const STATUS_META = {
  pending_payment: { label: '待支付', tone: 'border-amber-200 bg-amber-100 text-amber-800' },
  confirmed: { label: '已确认', tone: 'border-emerald-200 bg-emerald-100 text-emerald-800' },
  used: { label: '已核销', tone: 'border-slate-200 bg-slate-100 text-slate-600' },
  shipped: { label: '已发货', tone: 'border-sky-200 bg-sky-100 text-sky-800' },
  reschedule_requested: { label: '改期申请中', tone: 'border-sky-200 bg-sky-100 text-sky-800' },
  refund_requested: { label: '退款申请中', tone: 'border-orange-200 bg-orange-100 text-orange-800' },
  refunded: { label: '已退款', tone: 'border-slate-200 bg-slate-100 text-slate-600' },
  cancelled: { label: '已取消', tone: 'border-slate-200 bg-slate-100 text-slate-500' },
};

export const PAYMENT_LABELS = {
  wechat_pay: '微信支付',
  card: '银行卡支付',
  agent_transfer: '代理转账',
};

export const PAYMENT_STATUS_LABELS = {
  unpaid: '未支付',
  paid: '已支付',
  refund_pending: '退款处理中',
  refunded: '已退款',
};

export const SYNC_META = {
  not_connected: { label: 'Aspenware 未接入', tone: 'border-sky-200 bg-sky-50 text-sky-800' },
  pending: { label: '待同步 Aspenware', tone: 'border-amber-200 bg-amber-50 text-amber-800' },
  synced: { label: '已同步 Aspenware', tone: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  failed: { label: '同步失败', tone: 'border-red-200 bg-red-50 text-red-700' },
};

export const AGENT_STATUS_META = {
  pending: { label: '待审核', tone: 'border-amber-200 bg-amber-50 text-amber-800' },
  active: { label: '合作中', tone: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  suspended: { label: '已暂停', tone: 'border-slate-200 bg-slate-100 text-slate-600' },
};

// 雪票、课程与季票均以新西兰元（NZD）计价
export const formatNZD = (value) =>
  `NZ$${Number(value || 0).toLocaleString('en-NZ', { maximumFractionDigits: 2 })}`;

export const formatCNY = formatNZD;

export const toDateKey = (date) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

export const daysBetween = (fromKey, toKey) => {
  if (!fromKey || !toKey) return 1;
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T00:00:00`);
  return Math.max(1, Math.round((to - from) / 86400000) + 1);
};

export const isPeakDate = (dateKey) => {
  if (!dateKey) return false;
  const day = new Date(`${dateKey}T00:00:00`).getDay();
  return day === 0 || day === 6;
};

/* 本地动态定价示例：周末与旺季按 peak_multiplier 上浮。
   接入 Aspenware 后由官方定价接口返回，此处仅作演示。 */
export const unitPriceFor = (product, dateKey) => {
  if (!product) return 0;
  const multiplier = isPeakDate(dateKey) ? Number(product.peak_multiplier || 1) : 1;
  return Math.round(Number(product.price || 0) * multiplier);
};

export const generateOrderNo = () => {
  const d = new Date();
  const stamp = `${d.getFullYear()}${`${d.getMonth() + 1}`.padStart(2, '0')}${`${d.getDate()}`.padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SKI-${stamp}-${rand}`;
};

export const computeDiscount = (code, subtotal) => {
  if (!code) return 0;
  const value = Number(code.value || 0);
  const raw = code.type === 'percent' ? subtotal * (value / 100) : value;
  return Math.min(Math.round(raw), subtotal);
};

export const codeLabel = (code) => {
  if (!code) return '';
  return code.type === 'percent' ? `${code.value}% 折扣` : `立减 ${formatCNY(code.value)}`;
};

export const maskDocument = (value) => {
  if (!value) return '—';
  const text = String(value);
  if (text.length <= 4) return text;
  return `${text.slice(0, 2)}****${text.slice(-2)}`;
};

export const todayKey = () => toDateKey(new Date());