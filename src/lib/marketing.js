export const MARKETING_SOURCES = [
  'Organic Search',
  'Paid Search',
  'Paid Social',
  'Email',
  'Referral',
  'Affiliate',
  'Display',
  'Direct',
];

const SOURCE_ZH = {
  'Organic Search': '自然搜索',
  'Paid Search': '付费搜索',
  'Paid Social': '社交媒体广告',
  Email: '电子邮件',
  Referral: '合作推荐',
  Affiliate: '联盟推广',
  Display: '展示广告',
  Direct: '直接访问',
};

export const sourceLabel = (value, lang) =>
  lang === 'zh' ? SOURCE_ZH[value] || value : value;