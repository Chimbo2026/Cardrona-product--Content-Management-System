export const FEATURE_MAP = [
  {
    key: 'browse',
    title: { zh: '首页与浏览', en: 'Home & browse' },
    desc: {
      zh: '进入小程序的第一屏，先选雪场，再看天气与雪况。',
      en: 'First screen of the mini app: pick a mountain, then check weather and snow.',
    },
    dot: 'bg-primary',
    items: [
      { zh: '雪场切换', en: 'Mountain switch', path: '/' },
      { zh: '天气与雪况', en: 'Weather & snow', path: '/' },
      { zh: '服务入口', en: 'Service shortcuts', path: '/' },
      { zh: '季票推广', en: 'Season pass promo', path: '/tickets' },
      { zh: '活动轮播', en: 'Promo carousel', path: '/resort' },
    ],
  },
  {
    key: 'tickets',
    title: { zh: '雪票与季票', en: 'Passes & season passes' },
    desc: {
      zh: '按票种筛选产品，进入详情查看价格、时长与包含项目。',
      en: 'Filter products by type, open a detail page for price, duration and inclusions.',
    },
    dot: 'bg-rose-600',
    items: [
      { zh: '票种筛选', en: 'Category filter', path: '/tickets' },
      { zh: '产品详情', en: 'Product detail', path: '/tickets' },
      { zh: '季票配置', en: 'Pass configurator', path: '/tickets' },
      { zh: '年龄组定价', en: 'Age-band pricing', path: '/tickets' },
      { zh: '购物车', en: 'Cart', path: '/pass-cart' },
    ],
  },
  {
    key: 'booking',
    title: { zh: '预订与支付', en: 'Booking & payment' },
    desc: {
      zh: '日期与人数、游客信息、免责签名到支付确认的完整下单流程。',
      en: 'Dates and guests, guest details, waiver signature, payment and confirmation.',
    },
    dot: 'bg-emerald-600',
    items: [
      { zh: '日期与人数', en: 'Dates & guests', path: '/tickets' },
      { zh: '游客信息', en: 'Guest details', path: '/tickets' },
      { zh: '折扣码 / 代理价', en: 'Discount / agent rate', path: '/tickets' },
      { zh: '免责签名', en: 'Waiver signature', path: '/tickets' },
      { zh: '微信 / 银行卡 / 转账', en: 'WeChat / card / transfer', path: '/tickets' },
      { zh: '订单确认', en: 'Confirmation', path: '/orders' },
    ],
  },
  {
    key: 'lessons',
    title: { zh: '滑雪课程', en: 'Ski lessons' },
    desc: {
      zh: '课程表、初学者套餐与选课时段，下单后即时确认。',
      en: 'Lesson table, first-timer packages and session picker with instant confirmation.',
    },
    dot: 'bg-sky-600',
    items: [
      { zh: '课程表与价格', en: 'Lessons & prices', path: '/lessons' },
      { zh: '初学者套餐', en: 'First-timer package', path: '/lessons/first-timer' },
      { zh: '选课与时段', en: 'Pick a session', path: '/lessons/book' },
      { zh: '课程结账', en: 'Lesson checkout', path: '/lessons/checkout' },
    ],
  },
  {
    key: 'rentals',
    title: { zh: '装备租赁', en: 'Rentals' },
    desc: {
      zh: '雪具与山地车按尺码和日期配置，取还信息一目了然。',
      en: 'Ski gear and mountain bikes configured by size and date, with pickup details.',
    },
    dot: 'bg-teal-600',
    items: [
      { zh: '雪具配置', en: 'Ski gear setup', path: '/rentals' },
      { zh: '山地车租赁', en: 'Bike rental', path: '/rentals' },
      { zh: '取还与归还', en: 'Pickup & return', path: '/rentals' },
    ],
  },
  {
    key: 'resort',
    title: { zh: '山上吃住玩', en: 'Eat, stay & play' },
    desc: {
      zh: '餐饮点餐、山上住宿、活动预订与雪票信息集中在一个标签页。',
      en: 'Food ordering, on-mountain stays, activities and ticket info in one tabbed page.',
    },
    dot: 'bg-amber-600',
    items: [
      { zh: '餐饮点餐', en: 'Food ordering', path: '/resort' },
      { zh: '山上住宿', en: 'Accommodation', path: '/resort' },
      { zh: '活动预订', en: 'Activities', path: '/resort' },
      { zh: '雪票信息', en: 'Ticket info', path: '/resort' },
    ],
  },
  {
    key: 'shop',
    title: { zh: '山上商店', en: 'Online shop' },
    desc: {
      zh: '服装与配件的商品列表、尺码选择、购物车与配送结算。',
      en: 'Apparel and accessories with sizes, cart, checkout and shipping options.',
    },
    dot: 'bg-violet-600',
    items: [
      { zh: '商品列表', en: 'Shop list', path: '/shop' },
      { zh: '新品上架', en: 'New arrivals', path: '/shop/new' },
      { zh: '尺码与详情', en: 'Sizes & detail', path: '/shop' },
      { zh: '配送与支付', en: 'Shipping & payment', path: '/shop' },
    ],
  },
  {
    key: 'orders',
    title: { zh: '订单与票券', en: 'Orders & tickets' },
    desc: {
      zh: '查看电子票二维码、申请改期或退款，历史订单可随时回溯。',
      en: 'E-ticket QR codes, reschedule and refund requests, full order history.',
    },
    dot: 'bg-indigo-600',
    items: [
      { zh: '我的订单', en: 'My orders', path: '/orders' },
      { zh: '电子票二维码', en: 'E-ticket QR', path: '/orders' },
      { zh: '改期申请', en: 'Reschedule', path: '/orders' },
      { zh: '退款申请', en: 'Refund request', path: '/orders' },
    ],
  },
  {
    key: 'account',
    title: { zh: '账户与代理', en: 'Account & agents' },
    desc: {
      zh: '个人资料、支付方式、收藏与代理门户，管理后台单独入口。',
      en: 'Profile, payment methods, saved items and the agent portal, plus the admin console.',
    },
    dot: 'bg-slate-600',
    items: [
      { zh: '个人资料', en: 'Personal details', path: '/me' },
      { zh: '我的订单', en: 'My bookings', path: '/me' },
      { zh: '支付方式', en: 'Payment methods', path: '/me' },
      { zh: '我的收藏', en: 'Saved items', path: '/favorites' },
      { zh: '代理门户', en: 'Agent portal', path: '/me' },
      { zh: '山地信息与帮助', en: 'Mountain & help', path: '/info' },
      { zh: '管理后台', en: 'Admin console', path: '/admin' },
    ],
  },
];