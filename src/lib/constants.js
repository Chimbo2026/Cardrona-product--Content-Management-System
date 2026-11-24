export const PASS_PRICES = {
  'Single Day': 139,
  'Multi-Day': 129,
  'Season Pass': 1429,
  'Learner Pass': 79,
  'Sightseeing Pass': 65,
};

export const BIKE_PRICES = {
  'Single Day': 89,
  'Multi-Day': 79,
  'Season Pass': 699,
  'Learner Pass': 59,
  'Sightseeing Pass': 45,
};

export const PASS_TYPES = Object.keys(PASS_PRICES);

export const PASS_PRODUCTS = ['Lift Pass', 'Bike Rental'];

// Winter 27 season pass products and adult Pay Now prices, from the Cardrona
// secure store (secure.cardrona-treblecone.com/l/winter-27/p/winter-season-passes).
export const SEASON_PASS_PRODUCTS = [
  {
    value: 'Winter Unlimited Season Pass',
    mountain: 'Cardrona & Treble Cone',
    mountain_zh: 'Cardrona 与 Treble Cone',
    blackout: 'No blackout dates',
    blackout_zh: '无停用日期',
    prices: [
      { age: 'Adult 18–64', age_zh: '成人 18–64', price: 1429 },
      { age: 'Child 6–17', age_zh: '儿童 6–17', price: 399 },
      { age: 'Senior 65–74', age_zh: '长者 65–74', price: 850 },
    ],
  },
  {
    value: 'Winter Saver Season Pass',
    mountain: 'Cardrona only',
    mountain_zh: '仅限 Cardrona',
    blackout: 'Blackouts 5–16 July 2027',
    blackout_zh: '2027 年 7 月 5–16 日停用',
    prices: [
      { age: 'Adult 18–64', age_zh: '成人 18–64', price: 1029 },
      { age: 'Child 6–17', age_zh: '儿童 6–17', price: 319 },
      { age: 'Senior 65–74', age_zh: '长者 65–74', price: 689 },
    ],
  },
];

export const BIKE_TYPES = ['Enduro', 'Downhill', 'Full Suspension'];

export const BIKE_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export const BIKE_INSURANCE_OPTIONS = ['Yes', 'No'];

export const pricesForProduct = (product) => (product === 'Bike Rental' ? BIKE_PRICES : PASS_PRICES);

export const ACTIVITIES = [
  'Lift Pass',
  'Lesson',
  'Rental',
  'Accommodation',
  'Event',
  'Transport',
  'Food & Beverage',
  'Gift Voucher',
];

export const PAYMENT_TERMS = ['Pay now', 'Pay later'];

export const BOOKING_STATUSES = ['Confirmed', 'Pending', 'Completed', 'Cancelled', 'No-show'];
export const PAYMENT_STATUSES = ['Paid', 'Pending', 'Partially Paid', 'Refunded'];
export const CHANNELS = ['Online', 'Phone', 'Walk-in', 'Agent'];
export const SEASONS = ['Winter', 'Summer'];

export const DEPARTMENTS = [
  'Mountain Operations',
  'Snow School',
  'Guest Services',
  'Rentals',
  'Food & Beverage',
  'Maintenance',
  'Transport',
  'Accommodation',
  'Administration',
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const MAINT_STATUSES = ['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'];
export const LIFT_STATUSES = ['Open', 'Closed', 'Delayed', 'Maintenance'];
export const TRAIL_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Terrain Park'];
export const EQUIPMENT_CATEGORIES = [
  'Skis',
  'Snowboards',
  'Boots',
  'Helmets',
  'Poles',
  'Jackets',
  'Pants',
  'Accessories',
  'Mountain Bikes',
  'Safety Equipment',
];
export const DEPARTMENTS_SHORT = {
  'Mountain Operations': 'Operations',
  'Snow School': 'Snow School',
  'Guest Services': 'Guest Services',
  Rentals: 'Rentals',
  'Food & Beverage': 'F&B',
  Maintenance: 'Maintenance',
  Transport: 'Transport',
  Accommodation: 'Accommodation',
  Administration: 'Admin',
};