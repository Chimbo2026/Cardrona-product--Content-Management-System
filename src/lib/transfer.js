// 接驳与接送可预订选项（演示价格，NZD 每人）
export const TRANSFERS = [
  {
    id: 'zqn-cardrona-0730',
    route: { zh: '皇后镇 → 卡德罗纳 07:30 班车', en: 'Queenstown → Cardrona 07:30 shuttle' },
    times: ['07:30'],
    price: 45,
  },
  {
    id: 'zqn-cardrona-0900',
    route: { zh: '皇后镇 → 卡德罗纳 09:00 班车', en: 'Queenstown → Cardrona 09:00 shuttle' },
    times: ['09:00'],
    price: 45,
  },
  {
    id: 'wanaka-cardrona',
    route: { zh: '瓦纳卡 → 卡德罗纳 雪场巴士', en: 'Wanaka → Cardrona Snowline Express' },
    times: ['08:00', '09:00', '10:00', '11:00', '12:00'],
    price: 35,
  },
  {
    id: 'airport-transfer',
    route: { zh: '皇后镇机场接送（7 座商务车）', en: 'Queenstown airport transfer (7-seat)' },
    times: ['09:00', '13:00', '17:00'],
    price: 60,
  },
];