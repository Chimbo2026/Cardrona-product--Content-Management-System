// CMS 记录按语言取值：优先读取 _zh / _en 字段，再回退到旧字段。
const suffix = (lang) => (lang === 'en' ? 'en' : 'zh');

export const localizedField = (record, field, lang) => {
  if (!record) return '';
  return record[`${field}_${suffix(lang)}`] || record[field] || '';
};

export const localizedList = (record, field, lang) => {
  if (!record) return [];
  return record[`${field}_${suffix(lang)}`]?.length ? record[`${field}_${suffix(lang)}`] : record[field] || [];
};

export const priceUnitOf = (product, lang) =>
  lang === 'en' ? product?.price_unit_en || '' : product?.price_unit || '';

const CATEGORY_LABELS = {
  门票: { zh: '门票', en: 'Lift pass' },
  课程: { zh: '课程', en: 'Lessons' },
  租赁: { zh: '租赁', en: 'Rentals' },
  套餐: { zh: '套餐', en: 'Packages' },
};

export const categoryLabel = (category, lang) =>
  CATEGORY_LABELS[category]?.[suffix(lang)] || category;

const SHOP_CATEGORY_LABELS = {
  男士: { zh: '男士', en: 'Men' },
  女士: { zh: '女士', en: 'Women' },
  配件: { zh: '配件', en: 'Accessories' },
};

export const shopCategoryLabel = (category, lang) =>
  SHOP_CATEGORY_LABELS[category]?.[suffix(lang)] || category || '';

const NATIONALITY_LABELS = {
  新西兰: { zh: '新西兰', en: 'New Zealand' },
  澳大利亚: { zh: '澳大利亚', en: 'Australia' },
  中国: { zh: '中国', en: 'China' },
  中国台湾: { zh: '中国台湾', en: 'Taiwan' },
  中国香港: { zh: '中国香港', en: 'Hong Kong' },
  新加坡: { zh: '新加坡', en: 'Singapore' },
  美国: { zh: '美国', en: 'United States' },
  英国: { zh: '英国', en: 'United Kingdom' },
  其他: { zh: '其他', en: 'Other' },
};

export const nationalityLabel = (value, lang) =>
  NATIONALITY_LABELS[value]?.[suffix(lang)] || value || '';

const LABEL_GROUPS = {
  status: {
    pending_payment: { zh: '待支付', en: 'Pending payment' },
    confirmed: { zh: '已确认', en: 'Confirmed' },
    used: { zh: '已核销', en: 'Redeemed' },
    shipped: { zh: '已发货', en: 'Shipped' },
    reschedule_requested: { zh: '改期申请中', en: 'Reschedule requested' },
    refund_requested: { zh: '退款申请中', en: 'Refund requested' },
    refunded: { zh: '已退款', en: 'Refunded' },
    cancelled: { zh: '已取消', en: 'Cancelled' },
  },
  payment: {
    wechat_pay: { zh: '微信支付', en: 'WeChat Pay' },
    card: { zh: '银行卡支付', en: 'Card payment' },
    gift_card: { zh: '礼物卡', en: 'Gift card' },
    agent_transfer: { zh: '代理转账', en: 'Agent transfer' },
  },
  paymentStatus: {
    unpaid: { zh: '未支付', en: 'Unpaid' },
    paid: { zh: '已支付', en: 'Paid' },
    refund_pending: { zh: '退款处理中', en: 'Refund in progress' },
    refunded: { zh: '已退款', en: 'Refunded' },
  },
  shipping: {
    顺丰国际直邮: { zh: '顺丰国际直邮', en: 'SF Express International' },
    新西兰酒店配送: { zh: '新西兰酒店配送', en: 'NZ hotel delivery' },
    门店自提: { zh: '门店自提', en: 'Store pickup' },
  },
  sync: {
    not_connected: { zh: 'Aspenware 未接入', en: 'Aspenware not connected' },
    pending: { zh: '待同步 Aspenware', en: 'Queued for Aspenware sync' },
    synced: { zh: '已同步 Aspenware', en: 'Synced to Aspenware' },
    failed: { zh: '同步失败', en: 'Sync failed' },
  },
  source: {
    微信搜索: { zh: '微信搜索', en: 'WeChat search' },
    朋友圈分享: { zh: '朋友圈分享', en: 'Moments share' },
    代理推荐: { zh: '代理推荐', en: 'Agent referral' },
    小程序码: { zh: '小程序码', en: 'Mini app QR code' },
    广告投放: { zh: '广告投放', en: 'Paid ads' },
  },
  agentStatus: {
    pending: { zh: '待审核', en: 'Pending review' },
    active: { zh: '合作中', en: 'Active' },
    suspended: { zh: '已暂停', en: 'Suspended' },
  },
};

export const labelOf = (group, key, lang) =>
  LABEL_GROUPS[group]?.[key]?.[suffix(lang)] || key || '';

export const statusLabel = (key, lang) => labelOf('status', key, lang);
export const paymentLabel = (key, lang) => labelOf('payment', key, lang);
export const paymentStatusLabel = (key, lang) => labelOf('paymentStatus', key, lang);
export const shippingLabel = (key, lang) => labelOf('shipping', key, lang);
export const syncLabel = (key, lang) => labelOf('sync', key, lang);
export const sourceLabel = (key, lang) => labelOf('source', key, lang);
export const agentStatusLabel = (key, lang) => labelOf('agentStatus', key, lang);