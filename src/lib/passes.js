// 季票选购配置：付款方案、季票类型与年龄段
export const isSeasonPass = (product) => product?.category === '套餐';

export const PAYMENT_PLANS = [
  {
    key: 'now',
    label: { zh: '立即支付', en: 'Pay Now' },
  },
  {
    key: 'later',
    label: { zh: '先享后付', en: 'Buy Now, Pay Later' },
    desc: {
      zh: '现在只需支付 NZ$100 定金，余款分 4 期支付',
      en: '$100 deposit owed now and the rest paid in four instalments',
    },
    deposit: 100,
    installments: 4,
  },
];

export const PASS_TYPES = [
  {
    key: 'saver',
    label: { zh: '冬季 Saver 季票', en: 'Winter Saver Season Pass' },
    short: { zh: '冬季 Saver 季票', en: 'Winter Saver Pass' },
    title: { zh: 'Saver 季票', en: 'Saver Season Pass' },
    desc: {
      zh: '仅限卡德罗纳 2027 冬季，禁滑日为 2027 年 7 月 5–16 日。',
      en: 'Ski or ride at Cardrona only in Winter 27. Blackout dates apply 5-16 July, 2027.',
    },
    season: 'winter',
    rate: 0.72,
    rule: {
      zh: '我已阅读并接受 Saver 季票的使用规则',
      en: 'I accept the rules of the Winter Saver',
    },
    ageKeys: ['adult', 'child', 'senior'],
  },
  {
    key: 'unlimited',
    label: { zh: '冬季 Unlimited 季票', en: 'Winter Unlimited Season Pass' },
    short: { zh: '冬季 Unlimited 季票', en: 'Winter Unlimited Pass' },
    title: { zh: 'Unlimited 季票', en: 'Unlimited Season Pass' },
    desc: {
      zh: '卡德罗纳与三锥山两地通用，2027 冬季全季无禁滑日。',
      en: 'Ski or ride at both Cardrona and Treble Cone in Winter 27 with no blackout dates.',
    },
    season: 'winter',
    rate: 1,
    ageKeys: ['adult', 'child', 'senior', 'under6', 'over75'],
  },
  {
    key: 'summer',
    label: { zh: '夏季季票', en: 'Summer Season Pass' },
    short: { zh: '夏季季票', en: 'Summer Pass' },
    title: { zh: '夏季季票', en: 'Summer Season Pass' },
    desc: {
      zh: '卡德罗纳夏季全季通行，含缆车、山地车与徒步索道。',
      en: 'Cardrona Summer access: gondola, mountain biking and hiking all season.',
    },
    season: 'summer',
    rate: 1,
    ageKeys: ['adult'],
  },
];

export const AGE_BANDS = [
  { key: 'adult', label: { zh: '成人：18 - 64 岁', en: 'Adult: 18 - 64 yrs' }, short: { zh: '成人', en: 'Adult' }, rate: 1 },
  { key: 'child', label: { zh: '儿童：6 - 17 岁', en: 'Child: 6 - 17 yrs' }, short: { zh: '儿童', en: 'Child' }, rate: 0.28 },
  { key: 'senior', label: { zh: '长者：65 - 74 岁', en: 'Senior: 65 - 74 yrs' }, short: { zh: '长者', en: 'Senior' }, rate: 0.56 },
  { key: 'under6', label: { zh: '6 岁以下：免费', en: 'Under 6 yrs: Free of Charge' }, short: { zh: '6 岁以下', en: 'Under 6yrs' }, rate: 0, free: true },
  { key: 'over75', label: { zh: '75 岁以上：免费', en: 'Over 75 yrs: Free of Charge' }, short: { zh: '75 岁以上', en: '75yrs+' }, rate: 0, free: true },
];

// 订单摘要标题，例如 “(1) Winter Unlimited Season Pass - Adult - Pay Now”
export const cartLineLabel = (passKey, ageKey, planKey, lang = 'zh') => {
  const type = passTypeOf(passKey);
  const band = ageBandOf(ageKey);
  const plan = paymentPlanOf(planKey);
  const parts = [type.label[lang] || type.label.zh];
  if (band) parts.push(band.short?.[lang] || band.short?.zh || band.label[lang] || band.label.zh);
  parts.push(plan.label[lang] || plan.label.zh);
  return `(1) ${parts.join(' - ')}`;
};

export const passTypeOf = (key) => PASS_TYPES.find((item) => item.key === key) || PASS_TYPES[1];
export const ageBandOf = (key) => AGE_BANDS.find((item) => item.key === key) || null;
export const paymentPlanOf = (key) => PAYMENT_PLANS.find((item) => item.key === key) || PAYMENT_PLANS[0];

// 季票价格表（NZD）：季票类型 × 年龄段，可直接调整数值
export const PASS_PRICES = {
  unlimited: { adult: 1429, child: 399, senior: 799, under6: 0, over75: 0 },
  saver: { adult: 1029, child: 280, senior: 559 },
  summer: { adult: 359 },
};

// 产品所属季节，决定季票页展示冬季还是夏季的季票卡
export const seasonOf = (product) => (product?.pass_season === 'summer' ? 'summer' : 'winter');
export const defaultPassKey = (product) => (seasonOf(product) === 'summer' ? 'summer' : 'unlimited');
export const passTypesFor = (product) =>
  PASS_TYPES.filter((item) => item.season === seasonOf(product));

// 季票价格：优先用后台为产品设置的价格，其次用价格表，最后按年龄段系数推算
export const passPrice = (product, passKey, ageKey) => {
  const band = ageBandOf(ageKey);
  if (!band) return 0;
  const override =
    passKey === defaultPassKey(product) ? Number(product?.pass_prices?.[ageKey]) : NaN;
  if (Number.isFinite(override)) return override;
  const fixed = PASS_PRICES[passKey]?.[ageKey];
  if (fixed !== undefined) return fixed;
  return Math.round(Number(product?.price || 0) * passTypeOf(passKey).rate * band.rate);
};

export const passSummary = (passKey, ageKey) => {
  const type = passTypeOf(passKey);
  const band = ageBandOf(ageKey);
  return band ? `${type.title.zh} · ${band.label.zh}` : type.title.zh;
};

export const passSummaryEn = (passKey, ageKey) => {
  const type = passTypeOf(passKey);
  const band = ageBandOf(ageKey);
  return band ? `${type.title.en} · ${band.label.en}` : type.title.en;
};
