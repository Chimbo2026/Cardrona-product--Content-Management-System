// Central translation maps for database values (statuses, categories, enum fields).
// Values are stored in English in the database; they are translated at display time only.

const ZH = {
  // Booking statuses
  confirmed: '已确认',
  pending: '待处理',
  completed: '已完成',
  cancelled: '已取消',
  'no-show': '未到场',
  paid: '已支付',
  'partially paid': '部分支付',
  'pay now': '立即支付',
  'pay later': '稍后支付',
  'gift voucher': '礼券',
  'gift vouchers': '礼券',
  'partially redeemed': '部分使用',
  redeemed: '已使用',
  refunded: '已退款',

  // Schedule / roster statuses
  scheduled: '已排期',
  'in progress': '进行中',
  'clocked in': '已打卡上岗',
  late: '迟到',
  absent: '缺勤',
  'on duty': '在岗',
  'off duty': '休息',
  'on leave': '休假',
  sick: '病假',
  available: '可用',
  'on lesson': '授课中',
  'full time': '全职',
  'part time': '兼职',
  casual: '机动',
  'on call': '随叫随到',

  // Lesson / seat statuses
  booked: '已预订',
  attended: '已出席',

  // Lift / trail
  open: '开放',
  closed: '关闭',
  seasonal: '季节性营业',
  restaurant: '餐厅',
  cafe: '咖啡厅',
  bar: '酒吧',
  'treble cone': 'Treble Cone',
  delayed: '延误',
  maintenance: '维护中',

  // Passes
  issued: '已发放',
  active: '使用中',
  unused: '未使用',
  expired: '已过期',

  // Rentals
  reserved: '已预订',
  returned: '已归还',
  overdue: '已逾期',

  // Equipment
  excellent: '优',
  good: '良',
  fair: '一般',
  damaged: '损坏',
  ok: '正常',
  'in service': '维修中',
  retired: '已报废',

  // Accommodation
  occupied: '已入住',
  cleaning: '清洁中',

  // Transport
  'on time': '准点',

  // Incidents / maintenance
  investigating: '调查中',
  resolved: '已解决',
  'on hold': '暂缓',
  'low stock': '库存不足',
  'sold out': '已售罄',
  'not started': '未开始',
  'ready for arrival': '待抵达',

  demo: '演示',
  sunny: '晴',
  fine: '晴朗',
  'partly cloudy': '多云',
  overcast: '阴',
  'light snow': '小雪',
  'snow showers': '阵雪',
  'heavy snow': '大雪',
  'wind hold': '因风停运',
  moderate: '一般',
  poor: '差',

  // Severity / priority
  low: '低',
  medium: '中',
  high: '高',
  critical: '紧急',

  // Activities / revenue categories
  'lift pass': '缆车票',
  'bike rental': '单车租赁',
  'bike rentals': '单车租赁',
  lesson: '课程',
  rental: '租赁',
  accommodation: '住宿',
  event: '活动',
  events: '活动',
  transport: '交通接驳',
  'food & beverage': '餐饮',
  'lift passes': '缆车票',
  lessons: '课程',
  rentals: '租赁',

  // Pass types
  'single day': '单日票',
  'multi-day': '多日票',
  'season pass': '季票',
  'learner pass': '初学者票',
  'sightseeing pass': '观光票',

  // Channels / seasons
  online: '在线',
  phone: '电话',
  'walk-in': '现场办理',
  agent: '渠道代理',
  winter: '冬季',
  summer: '夏季',

  // Lesson attributes
  group: '团体课',
  private: '私教课',
  kids: '儿童课',
  ski: '双板',
  snowboard: '单板',
  both: '双板+单板',
  'first timer': '零基础',
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
  expert: '专家',
  adult: '成人',
  child: '儿童',

  // Equipment categories
  skis: '双板雪板',
  snowboards: '单板雪板',
  boots: '雪鞋',
  helmets: '头盔',
  poles: '雪杖',
  jackets: '雪服',
  pants: '雪裤',
  accessories: '配件',
  'mountain bikes': '山地车',
  'safety equipment': '安全装备',

  // Terrain
  'terrain park': '地形公园',
  chairlift: '吊椅缆车',
  gondola: '吊厢缆车',
  'surface lift': '拖牵索道',
  'magic carpet': '魔毯',

  // Event categories
  'mountain biking': '山地骑行',
  'mountain carting': '山地滑车',
  sightseeing: '观光',
  conference: '会议',
  'special event': '特别活动',
  'winter sport': '冬季运动',

  // Incident types
  safety: '安全',
  injury: '人员受伤',
  equipment: '设备',
  weather: '天气',
  guest: '宾客',
  facility: '设施',

  // Accommodation unit types
  'hotel room': '酒店客房',
  apartment: '公寓',
  chalet: '度假木屋',
  studio: '开放式单间',
  'two bedroom apartment': '两卧室公寓',
  'three bedroom apartment': '三卧室公寓',
  'four bedroom apartment': '四卧室公寓',
  'three bedroom loft': '三卧室阁楼',
  'studio apartment': '单间公寓',

  'rental equipment': '租赁装备',
  building: '建筑设施',
  vehicle: '车辆',
  snowmaking: '造雪',

  // Departments
  'mountain operations': '山地运营',
  'snow school': '滑雪学校',
  'guest services': '宾客服务',
  rentals: '租赁部',
  'food & beverage': '餐饮部',
  maintenance: '维修部',
  transport: '交通接驳',
  administration: '行政管理',
  'lift operations': '缆车运营',
  snowmaking: '造雪车间',
  'snow school instructors': '滑雪学校教练',
  retail: '零售',
  'first aid': '急救站',

  // Refunds
  approved: '已批准',
  rejected: '已拒绝',
  processing: '退款处理中',
  processed: '已退款',
  expired: '已过期',
  failed: '失败',
  card: '银行卡',
  'weather or mountain closure': '天气 / 山地关闭',
  'guest illness or injury': '宾客生病或受伤',
  'change of plans': '行程变更',
  'duplicate or incorrect charge': '重复或错误扣款',
  'service issue': '服务问题',
  'agent cancellation': '代理取消',
  other: '其他',
  'wechat pay': '微信支付',
  'visa/mastercard': '维萨 / 万事达卡',
  visa: '维萨卡',
  mastercard: '万事达卡',
  alipay: '支付宝',
  cash: '现金',
  account: '挂账',
  full: '全额',
  partial: '部分',
  'manual required': '待人工补救',
  'refund window expired': '超出退款时限',
  'transaction not settled': '交易尚未结算',
  'issuer declined': '发卡行拒绝退款',
  'insufficient provider balance': '支付账户余额不足',
  'provider error': '支付渠道错误',
  'store credit': '门店消费额度',
  'bank transfer': '银行转账',
  'guest to contact bank': '宾客联系发卡行',
  'no action': '无需处理',

  // Agents
  onboarding: '洽谈中',
  paused: '已暂停',

  // Shift windows
  morning: '早班',
  afternoon: '午班',
  evening: '晚班',
};

export const tx = (value, lang) => {
  if (value === null || value === undefined || value === '') return value;
  if (lang !== 'zh') return String(value);
  const key = String(value).toLowerCase();
  return ZH[key] ?? String(value);
};

// Department short labels for roster grids
export const DEPT_SHORT_ZH = {
  'Mountain Operations': '山地运营',
  'Snow School': '滑雪学校',
  'Guest Services': '宾客服务',
  Rentals: '租赁部',
  'Food & Beverage': '餐饮部',
  Maintenance: '维修部',
  Transport: '交通接驳',
  Accommodation: '住宿部',
  Administration: '行政',
  'Lift Operations': '缆车运营',
  Snowmaking: '造雪',
  'Snow School Instructors': '教练组',
  Retail: '零售',
  'First Aid': '急救站',
};