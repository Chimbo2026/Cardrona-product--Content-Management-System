// 山上午餐菜单与点餐辅助函数，价格为演示用 NZD 标价
export { formatNZD } from '@/lib/shop';

const dish = (id, name_zh, name_en, price) => ({ id, name_zh, name_en, price });

export const CAFE_MENUS = {
  'noodle-bar': [
    dish('nb-beef-noodle', '红烧牛肉汤面', 'Braised beef noodle soup', 18),
    dish('nb-miso-ramen', '味噌拉面', 'Miso ramen', 17),
    dish('nb-sushi-set', '寿司拼盘（8 件）', 'Sushi set (8 pieces)', 16),
    dish('nb-karaage', '日式炸鸡', 'Karaage chicken', 12),
    dish('nb-green-tea', '冰绿茶', 'Iced green tea', 5),
  ],
  'the-mezz': [
    dish('mz-lamb-burger', '羊肩肉汉堡', 'Slow-cooked lamb shoulder burger', 22),
    dish('mz-truffle-fries', '松露薯条', 'Truffle fries', 12),
    dish('mz-mulled-wine', '热红酒', 'Mulled wine', 12),
    dish('mz-craft-beer', '本地精酿生啤', 'Local craft beer', 11),
  ],
  'captains-pizzeria': [
    dish('cp-margherita', '玛格丽特披萨', 'Margherita pizza', 20),
    dish('cp-pepperoni', '意大利香肠披萨', 'Pepperoni pizza', 22),
    dish('cp-garlic-bread', '蒜香面包', 'Garlic bread', 8),
    dish('cp-cola', '可乐', 'Cola', 4),
  ],
  'little-meg': [
    dish('lm-flat-white', '平白咖啡', 'Flat white', 5.5),
    dish('lm-beef-pie', '牛肉派', 'Beef pie', 9),
    dish('lm-fries', '粗切薯条', 'Chunky fries', 7),
    dish('lm-tap-beer', '冰镇生啤', 'Ice-cold tap beer', 9),
  ],
  'the-lounge': [
    dish('tl-croissant', '黄油可颂', 'Butter croissant', 7),
    dish('tl-hot-choc', '热巧克力', 'Hot chocolate', 6.5),
    dish('tl-mulled-wine', '热红酒', 'Mulled wine', 12),
    dish('tl-cheesecake', '芝士蛋糕', 'Cheesecake', 9),
  ],
  'base-cafe': [
    dish('bc-mountain-meal', '山上大餐（烤鸡 + 沙拉 + 薯条）', 'Mountain meal (roast chicken, salad, fries)', 22),
    dish('bc-fish-chips', '炸鱼薯条', 'Fish and chips', 20),
    dish('bc-veggie-curry', '素食咖喱饭', 'Vegetarian curry', 19),
    dish('bc-kids-meal', '儿童餐', 'Kids meal', 14),
    dish('bc-soft-drink', '汽水', 'Soft drink', 4),
  ],
};

export const generateFoodOrderNo = () => {
  const d = new Date();
  const stamp = `${d.getFullYear()}${`${d.getMonth() + 1}`.padStart(2, '0')}${`${d.getDate()}`.padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `FOOD-${stamp}-${rand}`;
};