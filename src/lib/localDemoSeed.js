import { addDaysISO } from '@/lib/format';
import { cardronaImage } from '@/lib/cardronaImages';
import { accommodationDemoUnits } from '@/lib/accommodationDemoData';
import { cardronaShopCatalog } from '@/lib/cardronaShopCatalog';

const PREFIX = 'cardrona_local_v1:';
const guestNames = ['Ruth Kim', 'Ethan Kovacs', 'Freya Sanderson', 'Aria Patel', 'James Ferris', 'Ryo Nakamura', 'Emma Whitcombe', 'Mia Thornton', 'Amelia Hart', 'Jack Rimu', 'Chloe Bennett', 'Daniel Okafor'];
const guestCountries = ['Seoul, KR', 'Budapest, HU', 'Nelson, NZ', 'London, UK', 'Wellington, NZ', 'Tokyo, JP', 'Auckland, NZ', 'Melbourne, AU', 'Queenstown, NZ', 'Wanaka, NZ', 'Taipei, TW', 'Christchurch, NZ'];
const guests = guestNames.map((full_name, i) => ({
  full_name, email: `${full_name.toLowerCase().replaceAll(' ', '.')}@example.com`, phone: `+64 21 12${String(i).padStart(2, '0')} 1168`, country: guestCountries[i],
  last_visit: addDaysISO(-((i % 5) + 1)), visits: [17, 8, 8, 8, 10, 8, 9, 7, 13, 12, 5, 6][i], marketing_opt_in: i % 3 === 0,
  avatar_url: `https://i.pravatar.cc/120?img=${i + 12}`, face_checkin_status: i % 4 === 0 ? 'Checked in' : 'Not checked in', checkin_status: i % 3 === 0 ? 'Ready for arrival' : 'Not started',
}));

const bookingActivities = ['Lift Pass', 'Event', 'Lesson', 'Accommodation', 'Food & Beverage', 'Transport', 'Rental', 'Lift Pass', 'Accommodation', 'Gift Voucher'];
const bookings = Array.from({ length: 30 }, (_, i) => {
  const guest = guestNames[i % guestNames.length];
  const status = ['Confirmed', 'Pending', 'Confirmed', 'Completed', 'Cancelled'][i % 5];
  const payment = ['Paid', 'Pending', 'Paid', 'Paid', 'Refunded'][i % 5];
  return {
    booking_ref: `CRD-${2657 - i}`, guest_name: guest, email: `${guest.toLowerCase().replaceAll(' ', '.')}@example.com`, phone: `+64 21 124 ${1100 + i}`,
    visit_date: addDaysISO((i % 12) - 4), guests_count: (i % 6) + 1, activity: bookingActivities[i % bookingActivities.length],
    lesson_title: i % 4 === 0 ? 'First timer group lesson' : '', instructor_name: i % 4 === 0 ? 'Ana Silva' : '', pass_type: ['Single Day', 'Season Pass', 'Multi-Day'][i % 3],
    amount: [196, 139, 568, 1368, 254, 89, 386, 1429, 480, 120][i % 10], currency: ['NZD', 'NZD', 'NZD', 'NZD', 'HKD', 'TWD'][i % 6],
    amount_paid: payment === 'Paid' ? [196, 139, 568, 1368, 254, 89, 386, 1429, 480, 120][i % 10] : 0,
    payment_status: payment, payment_method: ['WeChat Pay', 'Visa', 'Mastercard', 'Alipay', 'Cash', 'Account'][i % 6],
    booking_status: status, season: i % 3 ? 'Winter' : 'Summer', channel: ['Online', 'Phone', 'Walk-in', 'Agent'][i % 4],
    guest_country: guestCountries[i % guestCountries.length], waiver_signed: i % 3 !== 0, agent_name: i % 4 === 3 ? 'Queenstown Winter Co' : '', agent_discount: i % 4 === 3 ? 15 : 0,
  };
});

const transactions = Array.from({ length: 50 }, (_, i) => ({
  date: addDaysISO(-((i % 90) + 1)), reference: `TXN-CRD-${2657 - i}`, booking_ref: `CRD-${2657 - i}`,
  category: ['Lift Passes', 'Lessons', 'Rentals', 'Accommodation', 'Food & Beverage', 'Events', 'Transport'][i % 7],
  amount: [1429, 1368, 568, 480, 254, 196, 139, 89][i % 8], payment_method: ['Card', 'Eftpos', 'Online', 'Account', 'Cash'][i % 5], status: i % 16 === 0 ? 'Refunded' : 'Paid', season: i % 4 === 0 ? 'Summer' : 'Winter',
}));

const liftPasses = Array.from({ length: 45 }, (_, i) => ({
  pass_number: `${i < 3 ? 'LP' : 'BR'}-${48236 - i}`, product: i < 3 ? 'Lift Pass' : i % 8 === 0 ? 'Bike Rental' : 'Lift Pass', guest_name: guestNames[i % guestNames.length],
  pass_type: ['Season Pass', 'Learner Pass', 'Single Day', 'Multi-Day', 'Sightseeing Pass'][i % 5], pass_product: i % 2 ? 'Winter Saver Season Pass' : 'Winter Unlimited Season Pass',
  season: i % 8 === 0 ? 'Summer' : 'Winter', price: [1429, 399, 139, 387, 65][i % 5], days_valid: i % 5 === 2 ? 1 : 4,
  valid_from: addDaysISO(-2 + (i % 8)), valid_to: addDaysISO(2 + (i % 8)), issue_status: i % 9 === 0 ? 'Pending' : 'Issued',
  usage_status: i % 6 < 3 ? 'Active' : i % 6 === 3 ? 'Unused' : 'Expired',
}));

const events = Array.from({ length: 20 }, (_, i) => ({
  title: ['Night Skiing Experience', 'Kids Snow Festival', 'Ski Area Closing Weekend', 'Alpine Bike Park Opening', 'Corporate Team Day', 'Stargazing Gondola Evening', 'Mountain Bike Skills Clinic'][i % 7],
  category: ['Winter Sport', 'Special Event', 'Winter Sport', 'Mountain Biking', 'Conference', 'Sightseeing', 'Mountain Biking'][i % 7], season: i % 3 === 0 ? 'Summer' : 'Winter', date: addDaysISO(i * 3),
  start_time: ['18:00', '10:00', '08:30', '09:00', '09:00', '21:00', '13:00'][i % 7], end_time: ['21:00', '15:00', '17:00', '16:00', '17:00', '22:30', '15:00'][i % 7],
  capacity: [200, 150, 300, 120, 60, 40, 12][i % 7], booked: [156, 142, 264, 82, 22, 31, 5][i % 7], attended: 0, price: [35, 20, 0, 89, 120, 45, 75][i % 7],
  location: ['Captain’s Basin', 'Beginner Zone', 'Base Area', 'Cardrona Bike Park', 'Cardrona Conference Centre', 'McDougall’s Chondola', 'Bike Park Base'][i % 7], status: 'Scheduled',
}));

const refunds = [
  ['RF-1042', 'Caleb Morton', 'CRD-2656', 6900, 'Failed', 'Refund window expired'],
  ['RF-1002', 'Ethan Kovacs', 'CRD-2643', 254, 'Pending', ''],
  ['RF-1006', 'Amelia Hart', 'CRD-2654', 396, 'Rejected', ''],
  ['RF-1003', 'Amelia Hart', 'CRD-2639', 568, 'Approved', ''],
  ['RF-1005', 'Noah Patterson', 'CRD-2638', 68, 'Processed', ''],
  ['RF-1001', 'Jack Rimu', 'CRD-2644', 120, 'Pending', ''],
  ['RF-1004', 'Chloe Bennett', 'CRD-2641', 1368, 'Approved', ''],
].map(([request_ref, guest_name, booking_ref, amount, status, failure_reason], i) => ({
  request_ref, booking_id: `demo-booking-${i + 1}`, booking_ref, guest_name, guest_email: 'guest@example.com', booking_amount: amount, refund_type: 'Full', amount,
  reason: ['Weather or mountain closure', 'Guest illness or injury', 'Change of plans'][i % 3], method: i % 2 ? 'WeChat Pay' : 'Visa/Mastercard', status, requested_at: new Date(Date.now() - (i + 1) * 86400000).toISOString(), failure_reason,
}));

const staffNames = ['Ana Silva', 'Jade Miller', 'Paul Everett', 'Sarah Nguyen', 'Sofia Alvarez', 'Dr. Annie Wells', 'Elena Petrova', 'Liam Boyd', 'Priya Sharma', 'Sean Cooper', 'Hugo Lindstrom', 'Rangi Hohepa'];
const departments = ['Accommodation', 'Accommodation', 'Administration', 'Administration', 'Administration', 'First Aid', 'First Aid', 'First Aid', 'First Aid', 'First Aid', 'Lift Operations', 'Maintenance'];
const staff = staffNames.map((full_name, i) => ({ staff_id: `ST-${100 + i}`, full_name, department: departments[i], role: ['Housekeeping Lead', 'Guest Services', 'Coordinator', 'Manager', 'Receptionist', 'Medic', 'Medic', 'First Aid', 'First Aid', 'First Aid', 'Lift Operator', 'Technician'][i], email: `${full_name.toLowerCase().replaceAll(' ', '.')}@cardrona.example`, phone: `+64 21 555 ${1100 + i}`, location: 'Cardrona', availability: i % 4 ? 'Full time' : 'Part time', status: 'Off Duty', hourly_rate: 27 + i }));
const coverage = ['First Aid', 'Food & Beverage', 'Lift Operations', 'Retail', 'Snow School Instructors', 'Snowmaking'].flatMap((department) => ['Morning', 'Afternoon'].map((shift_label) => ({ department, shift_label, min_staff: department === 'First Aid' ? 5 : 2, start_time: shift_label === 'Morning' ? '07:00' : '12:00', end_time: shift_label === 'Morning' ? '12:00' : '18:00' })));

const retailProducts = cardronaShopCatalog;

const agents = [
  ['AG-1234', 'Chimbo Chims', 'Zambia · Ndola', 'Chimwemwe', 'terrain-parks.webp', 10], ['AG-0115', 'Beijing Alpine Travel', 'China · Beijing', 'Wei Zhang', 'mountain-biking.webp', 10],
  ['AG-0134', 'Sydney Snowlink', 'Australia · Sydney', 'Marcus Reid', 'terrain-parks.webp', 5], ['AG-0148', 'Queenstown Winter Co', 'New Zealand · Queenstown', 'Hana Bishop', 'summer-lift-bike-combo.webp', 15],
  ['AG-0121', 'Taipei Summit Holidays', 'Taiwan · Taipei', 'Yu-Ting Lin', 'summer-lift-bike-combo.webp', 10], ['AG-0102', 'Shanghai Snow Journeys', 'China · Shanghai', 'Lina Chen', 'mountain-biking.webp', 15],
].map(([agent_code, company_name, market, contact_name, image, discount_rate], i) => ({ agent_code, company_name, market, contact_name, email: `agent${i + 1}@example.com`, phone: `+64 3 442 88${11 + i}`, discount_rate, currency: 'NZD', status: i === 3 ? 'Onboarding' : 'Active', photo_url: cardronaImage(image) }));

const dining = [
  ['Noodle Bar', 'Restaurant', 'Treble Cone', 'Upstairs from the Retail Store', '8am - 4pm, evening service Tuesday and Saturday', 'Asian fusion, katsu curry, breakfast and lunch', 'noodle-bar.webp', 'Open'],
  ['Captain’s Pizzeria', 'Restaurant', 'Cardrona', 'Captain’s Basin, ski in via Shaun’s Way and Highway 89', '9.30am - 3.30pm', 'Cardrona-famous pizza, pasta, sandwiches and local beer', 'pizzeria.webp', 'Open'],
  ['The Mezz', 'Restaurant', 'Cardrona', 'Upstairs above Base Café', 'From 7.30am, evening service Wednesday, Friday, Sunday', 'Breakfast, lunch, après and dinner', 'the-mezz.webp', 'Open'],
  ['The View', 'Restaurant', 'Cardrona', 'Top of Home Basin Express', '10.30am - 3pm (weather permitting)', 'Local craft beers, fresh pizza and hot chips', 'base-bar.webp', 'Seasonal'],
  ['Summit Kitchen', 'Restaurant', 'Cardrona', 'Top of Home Basin Express', '11am - 3pm', 'Slow-cooked platters, seasonal plates and Central Otago wine', 'base-cafe.webp', 'Open'],
  ['Basin Terrace', 'Restaurant', 'Treble Cone', 'Base building, upper level', '11.30am - 3.30pm (weather permitting)', 'Deck dining, wood-fired pizza and shared plates', 'lounge.webp', 'Seasonal'],
].map(([name, venue_type, mountain, location, opening_hours, offering, image, status], i) => ({ name, venue_type, mountain, location, opening_hours, offering, description: offering, image_url: cardronaImage(image), status, sort_order: i }));

const transport = [
  ['Queenstown — Crown Range Shuttle', 'Queenstown (Athol St)', 'Cardrona Base', '07:00', '17:15', 36, 33, 'Minibus 4', 'Elise Manaia', 'summer-lift-bike-combo.webp', 'Delayed'],
  ['Wānaka — Mountain Express AM', 'Wānaka i-SITE', 'Cardrona Base', '07:15', '16:30', 44, 41, 'Coach 12', 'Bert Kirk', 'summer-lift-bike-combo.webp', 'On Time'],
  ['Pine Trees — Free Mountain Road Shuttle', 'Pine Trees Car Park', 'Cardrona Base', '08:00', '17:00', 22, 18, 'Shuttle 7', 'Bert Kirk', 'terrain-parks.webp', 'On Time'],
  ['Cardrona Valley Shuttle', 'Cardrona Valley', 'Cardrona Mountain Top', '09:00', '16:15', 22, 0, 'Shuttle van', 'Driver TBC', 'base-bar.webp', 'On Time'],
  ['Base — Cardrona Village Loop', 'Cardrona Base', 'Cardrona Village', '13:00', '13:45', 16, 9, 'Shuttle 9', 'Bert Kirk', 'terrain-parks.webp', 'Completed'],
  ['Wānaka — Mountain Express PM', 'Cardrona Base', 'Wānaka i-SITE', '17:00', '', 44, 38, 'Coach 12', 'Elise Manaia', 'summer-lift-bike-combo.webp', 'On Time'],
  ['Queenstown — Return Service', 'Cardrona Base', 'Queenstown (Athol St)', '17:30', '', 36, 29, 'Minibus 4', 'Elise Manaia', 'summer-lift-bike-combo.webp', 'On Time'],
].map(([name, origin, destination, depart_time, return_time, capacity, booked, vehicle, driver, image, status]) => ({ name, origin, destination, depart_time, return_time, capacity, booked, vehicle, driver, price: 20, image_url: cardronaImage(image), status, operating_days: 'Daily' }));

const metrics = Array.from({ length: 35 }, (_, i) => ({
  metric_date: addDaysISO(-Math.floor(i / 7) * 7), campaign: ['Direct booking traffic', 'Winter festival', 'Southern travel agents', 'Cardrona trail guide', 'Beginner lesson bundle', 'Ski & stay packages', 'Early-bird season pass'][i % 7],
  source: ['Direct', 'Display', 'Referral', 'Organic Search', 'Paid Social', 'Paid Search', 'Email'][i % 7], sessions: [2147, 1209, 791, 3701, 2209, 2801, 1734][i % 7],
  new_visitors: 1300, conversions: [131, 13, 43, 107, 53, 90, 80][i % 7], bounce_rate: [30, 66, 41, 31, 59, 45, 40][i % 7], revenue: [68120, 2340, 39560, 33170, 13780, 70200, 33600][i % 7], logged_by: i % 2 ? 'Digital coordinator' : 'Marketing team',
}));

const content = [
  ['Products', 'Cardrona Day Pass', 'Lift Passes', 179, 'Published'], ['Products', 'First Timer Package', 'Lessons', 259, 'Published'], ['Products', 'Performance Ski Rental', 'Rentals', 89, 'Published'], ['Products', 'Alpine Chalet — 4 Nights', 'Accommodation', 1680, 'Draft'], ['Products', 'Mountain Carting Session', 'Events', 69, 'Draft'],
  ...['FAQs', 'Mountain Information', 'Translations'].flatMap((section) => Array.from({ length: 5 }, (_, i) => [section, `${section} entry ${i + 1}`, '', 0, i < 3 ? 'Published' : 'Draft'])),
].map(([section, title, category, price, status], sort_order) => ({ section, title, title_zh: title, body: `${title} demonstration content for Cardrona Resort.`, body_zh: `${title} 演示内容。`, category, price, status, sort_order, updated_by: 'Content team' }));

const lifts = [
  ['Archway Quad', 'Chairlift', 'Closed', 1600], ['Big Bear', 'Magic Carpet', 'Open', 400], ['Captain’s Express', 'Chairlift', 'Open', 2400], ['Little Bear', 'Magic Carpet', 'Closed', 300],
  ['McDougall’s Express', 'Chairlift', 'Open', 2200], ['Valley View Quad', 'Chairlift', 'Open', 1800], ['Whitestar Express', 'Chairlift', 'Delayed', 2000], ['Willow Chair', 'Chairlift', 'Maintenance', 1200],
].map(([name, lift_type, status, capacity_per_hour], i) => ({ name, lift_type, status, capacity_per_hour, opened_at: i % 2 ? '08:30' : '08:00', terrain: 'Cardrona', note: status === 'Delayed' ? 'Waiting on wind hold assessment.' : '' }));
const trails = ['Pistol', 'Gold Rush', 'Ride On', 'Little Rippa', 'Highway 89', 'Skyline', 'Arcade', 'Frew’s Freeway', 'Captain’s Run', 'Lime Light', 'Corkscrew', 'Rookie'].map((name, i) => ({ name, difficulty: ['Expert', 'Advanced', 'Beginner', 'Beginner', 'Intermediate', 'Advanced', 'Terrain Park'][i % 7], status: i === 0 ? 'Closed' : 'Open', area: ['Archway', 'Archway', 'Beginner Zone', 'Beginner Zone', 'Captain’s Basin', 'Captain’s Basin', 'Captain’s Basin', 'McDougall’s Basin'][i % 8], length_km: [0.8, 1.4, 0.9, 0.4, 1.8, 2.1, 0.6, 1.6][i % 8], groomed: i % 2 === 0 }));

const demoCollections = {
  AccommodationUnit: accommodationDemoUnits,
  Guest: guests,
  Booking: bookings,
  Transaction: transactions,
  LiftPass: liftPasses,
  LiftPassProduct: ['Lift Pass', 'Learner Pass', 'Single Day', 'Season Pass', 'Multi-Day', 'Sightseeing Pass'].map((pass_type, i) => ({ name: pass_type, pass_type, season: 'Winter', days_valid: i === 2 ? 1 : 4, price: [1429, 79, 139, 1429, 129, 65][i], active: true })),
  Event: events,
  RefundRequest: refunds,
  RetailProduct: retailProducts,
  RetailSale: retailProducts.slice(0, 10).map((p, i) => ({ product_id: `demo-retail-${i}`, product_name: p.name, sku: p.sku, vendor: p.vendor, category: p.category, quantity: i % 3 + 1, unit_price: p.price, total: p.price * (i % 3 + 1), sold_at: new Date(Date.now() - i * 3600000).toISOString(), channel: i % 2 ? 'In store' : 'Click & collect', payment_method: i % 2 ? 'Card' : 'Cash', guest_name: guestNames[i % guestNames.length] })),
  Staff: staff,
  CoverageRequirement: coverage,
  Agent: agents,
  DiningVenue: dining,
  TransportRoute: transport,
  MarketingMetric: metrics,
  ContentItem: content,
  Lift: lifts,
  Trail: trails,
  WeatherReport: [{ recorded_at: new Date().toISOString(), temp_c: -2, feels_like_c: -6, wind_kmh: 18, wind_direction: 'NW', visibility: 'Good', snow_depth_cm: 148, new_snow_cm: 12, conditions: 'Light snow', source: 'Simulated observation' }],
  Incident: [
    ['Whiteout conditions upper mountain', 'Weather', 'High', 'Whitestar Basin'], ['Guest knee injury at Captain’s Basin', 'Injury', 'High', 'Captain’s Basin'], ['Loose signage near Valley View load', 'Facility', 'Medium', 'Valley View Quad'], ['Water leak in base café', 'Facility', 'Medium', 'Base Café'],
  ].map(([title, incident_type, severity, location], i) => ({ title, incident_type, severity, location, status: i < 3 ? 'Open' : 'Investigating', reported_at: new Date(Date.now() - i * 3600000).toISOString(), reported_by: 'Duty manager', description: 'Fictional demonstration record.' })),
  ChecklistTask: [],
  Shift: [],
  AttendanceRecord: [],
  Lesson: Array.from({ length: 20 }, (_, i) => ({ title: ['First Timer Group', 'Kids Snow School', 'Private Coaching'][i % 3], lesson_category: ['Group', 'Kids', 'Private'][i % 3], discipline: i % 2 ? 'Snowboard' : 'Ski', level: ['First Timer', 'Beginner', 'Intermediate'][i % 3], age_group: i % 2 ? 'Adult' : 'Child', date: addDaysISO((i % 10) - 2), start_time: i % 2 ? '10:00' : '13:00', end_time: i % 2 ? '12:00' : '15:00', duration_mins: 120, capacity: 12, enrolled: 7 + i % 5, price: 179, status: 'Scheduled', meeting_point: 'Beginner Zone', guest_names: guestNames.slice(0, 3), attended: 0, attendance_marked: false })),
  Instructor: ['Ana Silva', 'Jade Miller', 'Paul Everett', 'Sarah Nguyen', 'Sofia Alvarez', 'Elena Petrova'].map((full_name, i) => ({ full_name, instructor_code: `INS-${i + 1}`, photo_url: `https://i.pravatar.cc/160?img=${i + 20}`, discipline: ['Ski', 'Snowboard', 'Both'][i % 3], certification: 'NZSIA Level 2', years_experience: 3 + i, levels: 'Beginner, Intermediate', languages: 'English', availability: i % 3 ? 'Available' : 'On Lesson', rating: 4.7, reviews_count: 38 + i * 7 })),
};

/** Add fictional records once per empty collection in the local browser demo. */
export function seedLocalDemoData() {
  for (const [name, rows] of Object.entries(demoCollections)) {
    const flag = `${PREFIX}seeded:${name}`;
    const key = `${PREFIX}${name}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const isOldSeededRetail = name === 'RetailProduct' && existing.length > 0 && existing.every((row) => row.id?.startsWith('demo-retailproduct-'));
    if (localStorage.getItem(flag) && !isOldSeededRetail) continue;
    if (isOldSeededRetail) {
      const now = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(rows.map((row, index) => ({ ...row, id: `demo-retailproduct-${index + 1}`, created_date: now, updated_date: now }))));
      continue;
    }
    if (existing.length === 0 && rows.length) {
      const now = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(rows.map((row, index) => ({ ...row, id: `demo-${name.toLowerCase()}-${index + 1}`, created_date: now, updated_date: now }))));
    }
    localStorage.setItem(flag, 'done');
  }
}
