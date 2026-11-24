// 资料与图片来自 Cardrona / Treble Cone 官网（cardrona-treblecone.com）
const IMG = (path) => `https://images.ctfassets.net/2atbvuhykqrn/${path}?w=900&q=75`;

const CAFES_LINK = 'https://cardrona-treblecone.com/mountains/cafes-restaurants';
const STAYS_LINK = 'https://book.roommanager.com.au/cardrona-onmountain-apartments/accommodation/139133';
const EVENTS_LINK = 'https://cardrona-treblecone.com/events';
const ACTIVITIES_LINK = 'https://cardrona-treblecone.com/cardrona';

export const CAFES = [
  {
    id: 'noodle-bar',
    name: { zh: 'Noodle Bar 面吧', en: 'Noodle Bar' },
    tagline: { zh: '亚洲风味，山上最受欢迎的一碗热汤面', en: 'Asian-inspired deliciousness' },
    location: { zh: '零售店楼上', en: 'Upstairs from the Retail Store' },
    hours: '7:30 – 16:00',
    image: IMG('51Q22mnXQVVik0nZoi2AJ5/4123edbbe6183288069e77e5cfa2848b/Cardrona-noodle-bar-sushi.webp'),
    link: CAFES_LINK,
  },
  {
    id: 'the-mezz',
    name: { zh: 'The Mezz', en: 'The Mezz' },
    tagline: { zh: '鸡尾酒与本地时令食材', en: 'Cocktails and locally sourced food' },
    location: { zh: 'Base Café 楼上', en: 'Upstairs above Base Café' },
    hours: '8:00 – 16:00',
    image: IMG('3tbHE21HTIXfzHY0jE63En/364e4e8a0b39e0d01e4791e06c0a5bd6/Cardrona-the-mezz.webp'),
    link: CAFES_LINK,
  },
  {
    id: 'captains-pizzeria',
    name: { zh: "Captain's Pizzeria", en: "Captain's Pizzeria" },
    tagline: { zh: '滑进滑出的现烤披萨，快速又管饱', en: 'Fast, flavourful grab-and-go dining' },
    location: { zh: "Captain's Basin，经 Shaun's Way 滑入", en: "Captain's Basin, ski in via Shaun's Way" },
    hours: '9:30 – 15:30',
    image: IMG('1mo54Q1bplVqTm16O41GVg/790403975bfcfacc974d05fe21d57829/Cardrona-Restaurant-Captains.webp'),
    link: CAFES_LINK,
  },
  {
    id: 'little-meg',
    name: { zh: 'Little Meg', en: 'Little Meg' },
    tagline: { zh: '热咖啡、小食与冰镇生啤', en: 'Hot coffees, snacks and ice-cold tap beers' },
    location: { zh: 'Valley View 停车场旁', en: 'By the Valley View carpark' },
    hours: '8:00 – 15:00',
    image: IMG('5WAGZVi6CwRnZEW00LbZ84/4ec72862b425f92e50efa289c739d10c/Cardrona-Restaurant-Little-Meg.webp'),
    link: CAFES_LINK,
  },
  {
    id: 'the-lounge',
    name: { zh: 'The Lounge', en: 'The Lounge' },
    tagline: { zh: '现烤酥点与一杯热红酒', en: 'Pastries and mulled wine' },
    location: { zh: 'Base 区，庭院对面', en: 'Base Area, across the courtyard' },
    hours: '8:00 – 16:30',
    image: IMG('4vFA5HuGoSt1ZDI58UZ5K8/e9d52d41bc1f28b103a82d82670701e6/Cardrona-the-lounge-coffee.webp'),
    link: CAFES_LINK,
  },
  {
    id: 'base-cafe',
    name: { zh: 'Base Café', en: 'Base Café' },
    tagline: { zh: '每日「山上大餐」，补足一天能量', en: "Daily 'mountain meals' that fuel you up" },
    location: { zh: '主 Base 楼一层', en: 'Downstairs in the main Base Building' },
    hours: '8:00 – 16:30',
    image: IMG('3Qe1Sa0HcIuVnD5HQvmLfG/e0421885abf854ce57caa59d95256ab1/Cardrona-base-cafe-sangas-pies.webp'),
    link: CAFES_LINK,
  },
];

export const ACTIVITIES = [
  {
    id: 'terrain-parks',
    name: { zh: '地形公园 Terrain Parks', en: 'Terrain Parks' },
    tagline: {
      zh: '南半球规模最大的地形公园群，共 5 个公园，适合从新手到高手',
      en: 'The most extensive terrain park network in the Southern Hemisphere, five parks in total',
    },
    meta: { zh: '冬季 · 全天开放', en: 'Winter · all day' },
    image: IMG('6AIbbKO7mZVfgnAwadXVj9/3112d54a2da2b54112397131770bf093/W24-events_Imagery-Home_Page_Hero_Image_-_Desktop.webp'),
    link: ACTIVITIES_LINK,
    bookPath: '/tickets',
  },
  {
    id: 'snow-school',
    name: { zh: '雪上运动学校', en: 'Snow Sports School' },
    tagline: {
      zh: '从零基础到进阶，专业教练的小班课与私教课',
      en: 'Refresher lessons or starting from scratch, with seasoned professional instructors',
    },
    meta: { zh: '冬季 · 需提前预约', en: 'Winter · book ahead' },
    image: IMG('134aFEPlQI3ewlkbSMOzfM/87553dcfd227b29cde181dadcf8a4fd5/Cardrona-ski-lesson-desktop.webp'),
    link: 'https://cardrona-treblecone.com/lessons',
    bookPath: '/lessons',
  },
  {
    id: 'sightseeing',
    name: { zh: '观光缆车 Sightseeing', en: 'Sightseeing' },
    tagline: {
      zh: "乘 McDougall's 吊厢缆车上山看雪山全景，婴儿车与轮椅均可通行",
      en: "Ride McDougall's Chondola for alpine views, accessible for prams and wheelchairs",
    },
    meta: { zh: '冬季 · 无需滑雪', en: 'Winter · no skiing needed' },
    image: IMG('4lVSf9z2kBtA80KRCHvh10/9d027eae1ed0ac75b32ebe2432ae728f/Cardrona-Whitestar-Express-Charilift.webp'),
    link: ACTIVITIES_LINK,
    bookPath: '/tickets',
  },
  {
    id: 'summer-biking',
    name: { zh: '夏季山地骑行与徒步', en: 'Summer biking and hiking' },
    tagline: {
      zh: '雪季过后，Cardrona 变身高山单车公园与徒步目的地',
      en: 'When the snow melts, Cardrona turns into an alpine bike park and hiking base',
    },
    meta: { zh: '夏季 · 12 月至 2 月', en: 'Summer · December to February' },
    image: IMG('1JrtycCMxf2BmFEkf6uecj/0fce8d98c94e3451c01f754bc0d5d248/cardrona_summer_biking.webp'),
    link: ACTIVITIES_LINK,
    bookPath: '/tickets',
  },
  {
    id: 'rise-and-shine-run',
    name: { zh: 'Kinisi Rise & Shine 高山越野跑', en: 'Kinisi Rise & Shine Summer Run' },
    tagline: {
      zh: '两站制高山越野跑系列赛，跑过 Cardrona 与 Treble Cone 的高山地形',
      en: 'A two-round mountain running series set in the alpine terrain of Cardrona and Treble Cone',
    },
    meta: { zh: '1 月 8 日 · 多日活动', en: '8 January · multi day event' },
    image: IMG('27ShkZp7DW58tY7cgdcxgd/b183988df0be121627ce09876d51cb3b/Rise_and_Shine_Summer_Run__diegoxbelli_desktop.webp'),
    link: 'https://cardrona-treblecone.com/events/kinisi-rise-shine-summer-run',
    bookUrl: 'https://cardrona-treblecone.com/events/kinisi-rise-shine-summer-run',
  },
];

export const STAYS = [
  {
    id: 'studio',
    name: { zh: '一室公寓 Studio', en: 'Studio Apartment' },
    tagline: { zh: '滑进滑出的山上公寓，情侣与小家庭首选', en: 'Ski-in, ski-out on-mountain studio for couples and small families' },
    sleeps: { zh: '可住 2–4 人', en: 'Sleeps 2–4 guests' },
    price: 420,
    features: [
      { zh: '特大床 + 两张单人床', en: 'King size and two single beds' },
      { zh: '含灶台、微波炉与洗碗机的厨房', en: 'Kitchen with stove-top, microwave and dishwasher' },
      { zh: '共用洗衣房与雪具存放', en: 'Shared laundry room and ski storage' },
    ],
    image: IMG('1manlr91A1sNvIXqDJlKPN/0154603a5bd0d5bf87debbaf1052d465/W24-Mountains_Accomodation_Imagery_1600x1600_Studio1.webp'),
    link: STAYS_LINK,
  },
  {
    id: 'two-bedroom',
    name: { zh: '两室公寓', en: 'Two Bedroom Apartment' },
    tagline: { zh: '两间独立卧室，适合朋友同行', en: 'Two separate bedrooms, ideal for travelling with friends' },
    sleeps: { zh: '可住 4–5 人', en: 'Sleeps 4–5 guests' },
    price: 560,
    features: [
      { zh: '特大床 + 两张单人床（可拼成双人床）', en: 'King size and two single beds that can be joined' },
      { zh: '含烤箱、微波炉与洗碗机', en: 'Kitchen with oven, microwave and dishwasher' },
      { zh: '客厅带沙发与智能电视', en: 'Lounge with sofa and smart TV' },
    ],
    image: IMG('Rim7r7iu8pP6VkQogmjiQ/00f54cadc6a6d9b7e16f08c0ed63e504/W24-Mountains_Accomodation_Imagery_1600x1600_2BDR2.webp'),
    link: STAYS_LINK,
  },
  {
    id: 'three-bedroom',
    name: { zh: '三室公寓', en: 'Three Bedroom Apartment' },
    tagline: { zh: '三间卧室加独立卫浴，大团体也住得开', en: 'Three bedrooms plus an ensuite, roomy for larger groups' },
    sleeps: { zh: '可住 6–8 人', en: 'Sleeps 6–8 guests' },
    price: 720,
    features: [
      { zh: '一间带独立卫浴的大床房 + 两间双床房', en: 'Ensuite queen room plus two twin rooms' },
      { zh: '厨房带洗碗机、烤箱与微波炉', en: 'Kitchen with dishwasher, oven and microwave' },
      { zh: '洗衣机与烘干机', en: 'Clothes washer and dryer' },
    ],
    image: IMG('7vz46KDHlhMdkOzVMboJTU/07d89af50d60777bad75585aa18a2d77/W24-Mountains_Accomodation_Imagery_1600x1600_3BDR1.webp'),
    link: STAYS_LINK,
  },
  {
    id: 'three-bedroom-loft',
    name: { zh: '三室阁楼公寓', en: 'Three Bedroom Loft' },
    tagline: { zh: '阁楼层加床位，孩子和小伙伴住在一起', en: 'Loft beds keep the kids together in one space' },
    sleeps: { zh: '最多 8 人', en: 'Up to 8 guests' },
    price: 780,
    features: [
      { zh: '阁楼层设四张单人床，适合孩子同住', en: 'Loft bedroom with four single beds' },
      { zh: '两个卫浴、三个卫生间', en: 'Two bathrooms and three toilets' },
      { zh: '洗衣机与烘干机', en: 'Clothes washer and dryer' },
    ],
    image: IMG('7sTFO803zlym5WdNudjKJX/e1d3b1ed1f5ec4317fb870dbe154ba64/W24-Mountains_Accomodation_Imagery_1600x1600_Loft3.webp'),
    link: STAYS_LINK,
  },
  {
    id: 'four-bedroom',
    name: { zh: '四室公寓', en: 'Four Bedroom Apartment' },
    tagline: { zh: '最大房型、两间独立卫浴，多家庭同游首选', en: 'The largest layout with two ensuites, great for several families' },
    sleeps: { zh: '可住 8–10 人', en: 'Sleeps 8–10 guests' },
    price: 860,
    features: [
      { zh: '两间带独立卫浴的大床房 + 两间双床房', en: 'Two ensuite king rooms plus two twin rooms' },
      { zh: '厨房带洗碗机、烤箱与微波炉', en: 'Kitchen with dishwasher, oven and microwave' },
      { zh: '洗衣机与烘干机', en: 'Clothes washer and dryer' },
    ],
    image: IMG('61fGEFgHTEd04L27L0fTTa/bee8fc6c98feb892dbb0351aa9694941/W24-Mountains_Accomodation_Imagery_1600x1600_4BDR2.webp'),
    link: STAYS_LINK,
  },
];

const isSightseeing = (product) =>
  /观光/.test(`${product.name_zh || ''}${product.name || ''}`);

/* 票券标签：数据来自 Product 实体，点击直接进入预订流程 */
export const TICKET_TABS = [
  {
    key: 'ski-passes',
    label: { zh: '滑雪票', en: 'Ski passes' },
    intro: {
      zh: '单日、连滑与季票，凭电子票直接检票上山。',
      en: 'Day passes, multi-day and season passes, scanned straight at the lift.',
    },
    match: (product) => (product.category === '门票' || product.category === '套餐') && !isSightseeing(product),
  },
  {
    key: 'ride-tickets',
    label: { zh: '缆车票', en: 'Ride tickets' },
    intro: {
      zh: '不滑雪也能坐吊厢缆车上山看雪山全景。',
      en: 'Ride the chondola for alpine views even without skiing.',
    },
    match: (product) => isSightseeing(product),
  },
];

export const OFFICIAL_EVENTS_URL = EVENTS_LINK;