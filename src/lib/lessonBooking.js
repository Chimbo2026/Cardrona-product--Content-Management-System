// 滑雪课程预订的定价与选项配置（价格由后台配置统一维护）
export const LESSON_TYPES = [
  {
    id: 'group-ski',
    zh: '团体滑雪课',
    en: 'Group Ski Lesson',
    desc_zh: '最多 6 人小组，与同水平学员一起进阶',
    desc_en: 'Small groups of up to 6, learn with skiers at your level',
    prices: { adult: 129, child: 99 },
  },
  {
    id: 'private-ski',
    zh: '私教滑雪课',
    en: 'Private Ski Lesson',
    desc_zh: '专属教练一对一指导，进度完全按你来',
    desc_en: 'One-to-one coaching, the whole session built around you',
    prices: { adult: 429, child: 349 },
  },
  {
    id: 'group-snowboard',
    zh: '团体单板课',
    en: 'Group Snowboard Lesson',
    desc_zh: '小班单板教学，从推坡到换刃逐步掌握',
    desc_en: 'Small-group snowboarding, from first slide to linked turns',
    prices: { adult: 129, child: 99 },
  },
  {
    id: 'private-snowboard',
    zh: '私教单板课',
    en: 'Private Snowboard Lesson',
    desc_zh: '单板一对一私教，针对性纠正动作',
    desc_en: 'Private snowboard coaching with focused technique fixes',
    prices: { adult: 429, child: 349 },
  },
];

export const AGE_GROUPS = [
  { id: 'adult', zh: '成人', en: 'Adult', note_zh: '13 岁及以上', note_en: '13 years and over' },
  { id: 'child', zh: '儿童', en: 'Child', note_zh: '5–12 岁', note_en: 'Ages 5–12' },
];

export const SKILL_LEVELS = [
  { id: 'first_timer', zh: '初次上雪', en: 'First Timer' },
  { id: 'beginner', zh: '初级', en: 'Beginner' },
  { id: 'intermediate', zh: '中级', en: 'Intermediate' },
  { id: 'advanced', zh: '高级', en: 'Advanced' },
];

export const SESSIONS = [
  { id: 'morning', zh: '上午场 9:00 - 11:00', en: 'Morning Session: 9:00 AM - 11:00 AM', short_zh: '上午场', short_en: 'Morning Session' },
  { id: 'afternoon', zh: '下午场 13:00 - 15:00', en: 'Afternoon Session: 1:00 PM - 3:00 PM', short_zh: '下午场', short_en: 'Afternoon Session' },
];

export const lessonPrice = (typeId, ageId) => {
  const type = LESSON_TYPES.find((item) => item.id === typeId);
  if (!type) return 0;
  return type.prices[ageId] ?? type.prices.adult;
};

export const lessonName = (typeId, lang) => {
  const type = LESSON_TYPES.find((item) => item.id === typeId);
  if (!type) return '';
  return lang === 'en' ? type.en : type.zh;
};