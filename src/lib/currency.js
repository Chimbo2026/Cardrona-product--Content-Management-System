// Currencies offered at Stripe checkout. Rates mirror base44/shared/stripe.ts.
export const PAYMENT_CURRENCIES = [
  { code: 'NZD', zh: '新西兰元', en: 'New Zealand dollar', rate: 1, locale: 'en-NZ', digits: 2 },
  { code: 'AUD', zh: '澳元', en: 'Australian dollar', rate: 0.92, locale: 'en-AU', digits: 2 },
  { code: 'TWD', zh: '新台币', en: 'New Taiwan dollar', rate: 19.6, locale: 'zh-TW', digits: 0 },
  { code: 'HKD', zh: '港币', en: 'Hong Kong dollar', rate: 4.75, locale: 'en-HK', digits: 2 },
  { code: 'CNY', zh: '人民币', en: 'Chinese yuan', rate: 4.35, locale: 'zh-CN', digits: 2 },
];

// WeChat Pay settles in CNY; cards use NZD, AUD, TWD or HKD.
export const WECHAT_CURRENCY = 'CNY';

// WeChat Pay refunds close 180 days after the original payment.
export const WECHAT_REFUND_WINDOW_DAYS = 180;

// Guests are charged in the currency of their home region.
const COUNTRY_CURRENCY = {
  'new zealand': 'NZD',
  nz: 'NZD',
  australia: 'AUD',
  au: 'AUD',
  taiwan: 'TWD',
  tw: 'TWD',
  'hong kong': 'HKD',
  'hong kong sar': 'HKD',
  hk: 'HKD',
  china: 'CNY',
  'mainland china': 'CNY',
  '中国': 'CNY',
};

export const currencyForCountry = (country) =>
  COUNTRY_CURRENCY[String(country || '').trim().toLowerCase()] || 'NZD';

export const currencyMeta = (code) =>
  PAYMENT_CURRENCIES.find((c) => c.code === code) || PAYMENT_CURRENCIES[0];

export const convertFromNzd = (amount, code) =>
  Math.round((Number(amount) || 0) * currencyMeta(code).rate * 100) / 100;

export const money = (value, code = 'NZD') => {
  const meta = currencyMeta(code);
  return new Intl.NumberFormat(meta.locale, {
    style: 'currency',
    currency: meta.code,
    maximumFractionDigits: meta.digits,
  }).format(Number(value) || 0);
};