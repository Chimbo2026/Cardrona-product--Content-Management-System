import { formatCNY } from '@/lib/booking';

// 山地车租赁配置：套餐、车型、尺码与年龄段
export const isBikeRental = (product) => product?.rental_kind === 'bike';

// 半日套餐会出现 .50 这类小数，需要固定两位小数展示
export const bikeMoney = (value) => {
  const amount = Number(value || 0);
  if (Number.isInteger(amount)) return formatCNY(amount);
  return `NZ$${amount.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const BIKE_PACKAGES = [
  { key: 'full', label: { zh: '全天套餐', en: 'Full Day Package' }, rate: 1, note: { zh: '1 天', en: '1 Day' } },
  {
    key: 'half',
    label: { zh: '半日套餐', en: 'Half Day Package' },
    rate: 0.5,
    note: { zh: '周六至周四 13:00 起 / 周五 TGIF 16:00 起', en: 'Sat - Thurs (from 1pm) or Fri TGIF (from 4pm)' },
  },
];

export const BIKE_SIZES = [
  { key: 'small', label: { zh: '小码', en: 'Small' }, detail: { zh: '身高 150 - 163cm', en: 'Rider Height 150 - 163cm' } },
  { key: 'medium', label: { zh: '中码', en: 'Medium' }, detail: { zh: '身高 163 - 177cm', en: 'Rider Height 163 - 177cm' } },
  { key: 'large', label: { zh: '大码', en: 'Large' }, detail: { zh: '身高 177 - 188cm', en: 'Rider Height 177 - 188cm' } },
  { key: 'xlarge', label: { zh: '加大码', en: 'Extra Large' }, detail: { zh: '身高 188cm 以上', en: 'Rider Height 188cm+' } },
];

// 自行车保险附加项：按天计价
export const BIKE_INSURANCE_PRICE = 25;

export const BIKE_AGES = [
  { key: 'adult', label: { zh: '成人', en: 'Adult' }, rate: 1 },
  { key: 'child', label: { zh: '儿童：6 - 17 岁', en: 'Child: 6 - 17 yrs' }, rate: 0.6 },
];

export const bikePackageOf = (key) => BIKE_PACKAGES.find((item) => item.key === key) || BIKE_PACKAGES[0];
export const bikeSizeOf = (key) => BIKE_SIZES.find((item) => item.key === key) || null;
export const bikeAgeOf = (key) => BIKE_AGES.find((item) => item.key === key) || null;

// 车型优先取后台配置，未配置时用产品本身的名称与价格
export const bikeTypesOf = (product) => {
  const types = Array.isArray(product?.bike_types) ? product.bike_types.filter((item) => item?.key) : [];
  if (types.length) return types;
  return [
    {
      key: 'default',
      label_zh: product?.name_zh || product?.name || '',
      label_en: product?.name_en || product?.name || '',
      price: Number(product?.price || 0),
    },
  ];
};

export const bikeTypeOf = (product, key) =>
  bikeTypesOf(product).find((item) => item.key === key) || bikeTypesOf(product)[0];

export const bikeTypeLabel = (type, lang = 'zh') =>
  (lang === 'en' ? type?.label_en : type?.label_zh) || type?.label_zh || type?.label_en || '';

// 单价 = 车型全价 × 年龄段系数 × 套餐系数（半日套餐为 5 折）
export const bikePrice = (product, typeKey, packageKey, ageKey) => {
  const age = bikeAgeOf(ageKey);
  if (!age) return 0;
  const base = Number(bikeTypeOf(product, typeKey)?.price ?? product?.price ?? 0);
  const raw = base * age.rate * bikePackageOf(packageKey).rate;
  return Math.round(raw * 100) / 100;
};

// 订单摘要标题，例如 “(1) 1 Day Lift + Enduro Bike - Medium - Adult”
// 只展示页面上已选择的项目，未选尺码时不出现尺码
export const bikeTitle = (product, { typeKey, sizeKey, ageKey }, lang = 'zh') => {
  const parts = [bikeTypeLabel(bikeTypeOf(product, typeKey), lang)];
  const size = bikeSizeOf(sizeKey);
  if (size) parts.push(size.label[lang] || size.label.zh);
  const age = bikeAgeOf(ageKey);
  if (age) parts.push(age.label[lang] || age.label.zh);
  return `(1) ${parts.join(' - ')}`;
};