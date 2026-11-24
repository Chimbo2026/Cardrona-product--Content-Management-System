import { SEASON_PASS_PRODUCTS } from '@/lib/constants';

export const DEPOSIT_NZD = 100;

export const PAYMENT_PLANS = [
  {
    value: 'Pay Now',
    en: 'Pay Now',
    zh: '立即支付',
  },
  {
    value: 'Buy Now, Pay Later',
    en: 'Buy Now, Pay Later',
    zh: '先买后付',
    note_en: '$100 deposit owed now and the rest paid in four instalments',
    note_zh: '现在支付 $100 定金，余款分四期支付',
  },
];

export const SEASON_PASS_TYPES = [
  {
    value: 'Winter Saver Season Pass',
    en: 'Winter Saver Season Pass',
    zh: 'Winter Saver 季票',
    detail_en: 'Ski or ride at Cardrona only in Winter 27. Blackout dates apply 5 – 16 July, 2027.',
    detail_zh: '2027 雪季仅限在 Cardrona 滑雪，2027 年 7 月 5 – 16 日为停用日期。',
  },
  {
    value: 'Winter Unlimited Season Pass',
    en: 'Winter Unlimited Season Pass',
    zh: 'Winter Unlimited 季票',
    detail_en: 'Ski or ride at both Cardrona and Treble Cone in Winter 27 with no blackout dates.',
    detail_zh: '2027 雪季可在 Cardrona 与 Treble Cone 无限次滑雪，无停用日期。',
  },
];

export const AGE_OPTIONS = [
  { value: 'Adult', en: 'Adult: 18 – 64 yrs', zh: '成人：18 – 64 岁', priceKey: 'Adult 18–64' },
  { value: 'Child', en: 'Child: 6 – 17 yrs', zh: '儿童：6 – 17 岁', priceKey: 'Child 6–17' },
  { value: 'Senior', en: 'Senior: 65 – 74 yrs', zh: '长者：65 – 74 岁', priceKey: 'Senior 65–74' },
  { value: 'Under 6', en: 'Under 6 yrs: Free of Charge', zh: '6 岁以下：免费', price: 0 },
  { value: 'Over 75', en: 'Over 75 yrs: Free of Charge', zh: '75 岁以上：免费', price: 0 },
];

export const shortPassName = (passType) => passType.replace(' Season Pass', '');

export const ageLabel = (ageValue) => (ageValue === 'Under 6' ? 'Under 6 yrs' : ageValue === 'Over 75' ? 'Over 75 yrs' : ageValue);

export const priceFor = (passType, ageValue) => {
  const option = AGE_OPTIONS.find((a) => a.value === ageValue);
  if (!option) return 0;
  if (typeof option.price === 'number') return option.price;
  const product = SEASON_PASS_PRODUCTS.find((p) => p.value === passType);
  const row = product?.prices.find((r) => r.age === option.priceKey);
  return row ? row.price : 0;
};

export const PAYMENT_PLAN_DETAILS = [
  {
    en: 'Purchase your pass before January 1, 2027: pay a $100 deposit upfront and four payments on January 20, February 17, March 17 and April 14, 2027.',
    zh: '2027 年 1 月 1 日前购买：先付 $100 定金，余款分四期于 2027 年 1 月 20 日、2 月 17 日、3 月 17 日和 4 月 14 日支付。',
  },
  {
    en: 'Purchase your pass between January 1 – January 31, 2027: pay a $100 deposit upfront and four payments on February 17, March 17, April 14 and May 12, 2027.',
    zh: '2027 年 1 月 1 – 31 日购买：先付 $100 定金，余款分四期于 2027 年 2 月 17 日、3 月 17 日、4 月 14 日和 5 月 12 日支付。',
  },
  {
    en: 'Purchase your pass between February 1 – February 28, 2027: pay a $100 deposit upfront and four payments on March 17, April 7, April 28 and May 19, 2027.',
    zh: '2027 年 2 月 1 – 28 日购买：先付 $100 定金，余款分四期于 2027 年 3 月 17 日、4 月 7 日、4 月 28 日和 5 月 19 日支付。',
  },
  {
    en: 'Purchase your pass between March 1 – March 31, 2027: pay a $100 deposit upfront and three payments on April 14, May 5 and May 26, 2027.',
    zh: '2027 年 3 月 1 – 31 日购买：先付 $100 定金，余款分三期于 2027 年 4 月 14 日、5 月 5 日和 5 月 26 日支付。',
  },
  {
    en: 'Purchase your pass between April 1 – April 30, 2027: pay a $100 deposit upfront and three payments on May 5, May 19 and June 2, 2027.',
    zh: '2027 年 4 月 1 – 30 日购买：先付 $100 定金，余款分三期于 2027 年 5 月 5 日、5 月 19 日和 6 月 2 日支付。',
  },
];