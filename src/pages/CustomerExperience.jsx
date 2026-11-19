import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft, ArrowRight, Bike, Bus, CalendarDays, Check, ChevronRight,
  GraduationCap, Headset, Heart, House, Map, MessageSquare, Mountain, Package,
  ShoppingBag, Ticket, UserRound, X, Minus, Plus,
  BedDouble, Clock3, ShieldCheck, ArrowUpRight,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { customerText, LocalizeCustomerTree } from '@/lib/customerLocale';
import MountainReport from '@/components/customer/MountainReport';
import SightseeingConfigurator from '@/components/customer/SightseeingConfigurator';
import WinterDonationOptions from '@/components/customer/WinterDonationOptions';
import BikePackageConfigurator from '@/components/customer/BikePackageConfigurator';
import SummerProductConfigurator from '@/components/customer/SummerProductConfigurator';
import EarlybirdMultiDayPassConfigurator from '@/components/customer/EarlybirdMultiDayPassConfigurator';
import TransportPlanner from '@/components/customer/TransportPlanner';
import RentalsOverview from '@/components/customer/RentalsOverview';
import TrailMapExplorer from '@/components/customer/TrailMapExplorer';

const STORAGE = 'peak-guest-demo-v1';
const heroPhoto = 'https://assets.simpleviewinc.com/simpleview/image/upload/c_fill%2Cf_jpg%2Cg_xy_center%2Ch_852%2Cq_65%2Cw_640%2Cx_1530%2Cy_1210/v1/clients/queenstownnz/Do_not_use_before_Winter_2025_Family_Ski_Cardrona_93772c40-e340-4b4a-bcd2-7c72598f67a7.jpg';
const cafePhoto = 'https://1.cloudcdn.nz/media/2025/12/Cardrona-Resort-Fero.jpg?br_px=5335%2C4741&tl_px=2017%2C1423';
const lessonPhoto = 'https://images.ctfassets.net/2atbvuhykqrn/5RrCqABuhzQpBcP36dm72M/10282138357bf27782ae8935391b4f21/W24-Mountains_Blog_1600x900_01GrouLesson.webp';
const cardronaImage = (filename) => `${import.meta.env.BASE_URL}images/cardrona/${filename}`;
const resortPhotos = {
  noodleBar: cardronaImage('noodle-bar.webp'),
  lounge: cardronaImage('lounge.webp'),
  pizzeria: cardronaImage('pizzeria.webp'),
  baseCafe: cardronaImage('base-cafe.webp'),
  baseBar: cardronaImage('base-bar.webp'),
  mezz: cardronaImage('the-mezz.webp'),
  littleMeg: cardronaImage('little-meg.webp'),
  terrainParks: cardronaImage('terrain-parks.webp'),
  carting: cardronaImage('carting.webp'),
  biking: cardronaImage('mountain-biking.webp'),
  hiking: cardronaImage('sightseeing.webp'),
  studio: cardronaImage('studio-apartment.webp'),
  twoBedroom: cardronaImage('two-bedroom-apartment.webp'),
  threeBedroom: cardronaImage('three-bedroom-apartment.webp'),
  threeBedroomLoft: cardronaImage('three-bedroom-loft.webp'),
  fourBedroom: cardronaImage('four-bedroom-apartment.webp'),
  summerEarlybird: cardronaImage('summer-earlybird.webp'),
  summerDayPasses: cardronaImage('summer-day-passes.webp'),
  summerLiftBike: cardronaImage('summer-lift-bike-combo.webp'),
  summerBikeRental: cardronaImage('summer-bike-rental.webp'),
  summerPeakToPub: cardronaImage('summer-peak-to-pub.webp'),
  summerCarting: cardronaImage('summer-carting.webp'),
};
const RESORT_LINKS = {
  cafes: 'https://cardrona-treblecone.com/mountains/cafes-restaurants#treble-cone',
  activities: 'https://cardrona-treblecone.com/summer',
  accommodation: 'https://cardrona-treblecone.com/mountains/accommodation',
  all: 'https://cardrona-treblecone.com/mountains',
};
const RESORT_TABS = [
  { id: 'cafes', label: 'Cafés & restaurants', image: resortPhotos.noodleBar },
  { id: 'activities', label: 'Events & activities', image: resortPhotos.biking },
  { id: 'stays', label: 'Accommodation', image: resortPhotos.studio },
];
const CAFE_CARDS = [
  { name: 'Noodle Bar', isOpen: true, location: 'Upstairs from the Retail Store', hours: '8am–4pm; evening service Tuesday and Saturday', offering: 'Lunch and dinner', description: 'Fast, fresh Asian fusion, including katsu curry and seasonal specialties, with mountain views.', image: resortPhotos.noodleBar, link: RESORT_LINKS.cafes, menu: [{ name: 'Braised beef noodle soup', price: 18 }, { name: 'Miso ramen', price: 17 }, { name: 'Sushi set (8 pieces)', price: 16 }, { name: 'Karaage chicken', price: 12 }, { name: 'Iced green tea', price: 5 }] },
  { name: 'The Lounge', isOpen: true, location: 'Base Area, across the courtyard', hours: '8am–4:30pm', offering: 'Barista coffee, soups, and cabinet sweet and savoury snacks', description: 'Relax with a morning brew or après drink and take in the slopeside deck views.', image: resortPhotos.lounge, link: RESORT_LINKS.cafes, menu: [{ name: 'Butter croissant', price: 7 }, { name: 'Hot chocolate', price: 6.5 }, { name: 'Mulled wine', price: 12 }, { name: 'Cheesecake', price: 9 }] },
  { name: "Captain’s Pizzeria", location: "Captain’s Basin; ski in via Shaun’s Way and Highway 89", hours: '9:30am–3:30pm', offering: 'Fast, flavourful grab-and-go dining', description: 'A ski-in, ski-out spot for Cardrona-famous pizza, pasta, sandwiches and pies, with a sunny deck.', image: resortPhotos.pizzeria, link: RESORT_LINKS.cafes, menu: [{ name: 'Margherita pizza', price: 20 }, { name: 'Pepperoni pizza', price: 22 }, { name: 'Garlic bread', price: 8 }, { name: 'Cola', price: 4 }] },
  { name: 'Base Café', location: 'Downstairs in the main Base Building', hours: '8am–4:30pm', offering: 'Daily mountain meals', description: 'Pies, hot chips, salads, sandwiches, and sweet and savoury cabinet treats.', image: resortPhotos.baseCafe, link: RESORT_LINKS.cafes, menu: [{ name: 'Mountain meal (roast chicken, salad, fries)', price: 22 }, { name: 'Fish and chips', price: 20 }, { name: 'Vegetarian curry', price: 19 }, { name: 'Kids meal', price: 14 }, { name: 'Soft drink', price: 4 }] },
  { name: 'Base Bar', location: 'Downstairs between Base Café and rentals', hours: '7:30am–4:30pm', offering: 'Barista coffee, smoothies and bagels', description: 'Grab a breakfast bagel on the go or sit down for a poke bowl and a beer.', image: resortPhotos.baseBar, link: RESORT_LINKS.cafes, menu: [{ name: 'Flat white', price: 5.5 }, { name: 'Bagel', price: 9 }, { name: 'Smoothie', price: 10 }, { name: 'Fresh sandwich', price: 14 }] },
  { name: 'Vista Bar', location: "Top of McDougall’s Chondola", hours: '10:30am–3pm', offering: 'Champagne, craft beer, ganache hot chocolate and cheese boards', description: 'Take a break at the top, enjoy a drink and a cheese board, and look out over the Whakatipu Basin.', image: 'https://images.ctfassets.net/2atbvuhykqrn/1NnPcjJJJo2dcBvKKXzlAp/3158ea0bbd0b3773a8e1e1e5db280c60/Cardrona-vista-bar-cheers.webp', link: RESORT_LINKS.cafes },
  { name: 'Carol’s', location: 'Cardrona Courtyard', hours: '11am–4:20pm (weather permitting)', offering: 'Tasty snacks and lollies', description: 'A courtyard food truck for a quick snack and a cheerful stop between mountain activities.', image: 'https://images.ctfassets.net/2atbvuhykqrn/3wUbU6PBOipCyzKbehUy13/8d16d210f8536af7d47da785d3e6622b/Cardrona-Carols-Duck-Island-ice-cream.webp', link: RESORT_LINKS.cafes },
  { name: 'The Mezz', location: 'Upstairs above Base Café', hours: 'From 7:30am; evening service Wednesday, Friday and Sunday', offering: 'Breakfast, lunch, après and dinner', description: 'A contemporary dining experience with local ingredients, breakfast, share plates and cocktails. Walk-ins are welcome; table bookings are available.', image: resortPhotos.mezz, link: RESORT_LINKS.cafes, menu: [{ name: 'Slow-cooked lamb shoulder burger', price: 22 }, { name: 'Truffle fries', price: 12 }, { name: 'Mulled wine', price: 12 }, { name: 'Local craft beer', price: 11 }] },
  { name: 'Little Meg', location: 'By the Valley View carpark', hours: 'From 8am', offering: 'Hot coffees, snacks and ice-cold tap beers', description: 'A slopeside stop beside Valley View Chairlift for coffee and a toasted sandwich, with an après drink on the way out.', image: resortPhotos.littleMeg, link: RESORT_LINKS.cafes, menu: [{ name: 'Flat white', price: 5.5 }, { name: 'Beef pie', price: 9 }, { name: 'Chunky fries', price: 7 }, { name: 'Ice-cold tap beer', price: 9 }] },
];
const TREBLE_CONE_CAFE_CARDS = [
  { name: 'The View', location: 'Top of Home Basin Express', hours: '10:30am–3pm (weather permitting)', offering: 'Local craft beer, fresh pizza and hot chips', description: 'A relaxed mountain-top stop with panoramic views, pizza and refreshments.', note: 'Weather permitting', image: 'https://images.ctfassets.net/2atbvuhykqrn/620dBIBwkQaKuL57xhtbs/f80573435dc5ee014efee42a922a1f65/treble-cone-the-view.webp', link: RESORT_LINKS.cafes },
  { name: 'TC Bar', location: 'In the base building', hours: '11am–4pm', offering: 'All-day snacks, real fruit ice cream and local alcoholic beverages', description: 'Bar snacks and drinks for a quick refuel or après-ski stop after a day on the slopes.', image: 'https://images.ctfassets.net/2atbvuhykqrn/1JONi2E7rcLimSD3bpkkLD/33553d62b359d6dbb465ec355d7f35c1/Treble-Cone-bar.webp', link: RESORT_LINKS.cafes },
  { name: 'TC Café', location: 'In the base building', hours: '8am–4pm', offering: 'Mountain meals, fresh wraps, pies, fries and drinks', description: 'A quick and tasty refuel, served in compostable packaging.', image: 'https://images.ctfassets.net/2atbvuhykqrn/1MILt9DmPeFbNL6jqXfpPM/39a04175b1105bfaab0d8aea80b2204e/TrebleCone-Restaurant-TC-Cafe.webp', link: RESORT_LINKS.cafes },
];
const ACTIVITY_CARDS = [
  { name: 'Sightseeing', description: 'Take in alpine views across the Southern Alps.', season: 'Summer', image: resortPhotos.hiking, link: RESORT_LINKS.activities, to: '/configure-pass?product=sightseeing' },
  { name: 'Mountain biking', description: 'Ride the trails at New Zealand’s highest mountain bike park.', season: 'Summer · opens 12 December', image: resortPhotos.biking, link: RESORT_LINKS.activities, to: '/configure-pass?product=summer-day-passes' },
  { name: 'Mountain carting', description: 'Take on the downhill carting trails at Cardrona.', season: 'Summer', image: resortPhotos.carting, link: RESORT_LINKS.activities, to: '/configure-pass?product=summer-carting' },
  { name: 'Walking & hiking', description: 'Take a gondola to the summit and explore four alpine walking trails with panoramic Southern Alps views.', season: 'Summer · opens 12 December', image: resortPhotos.hiking, link: 'https://cardrona-treblecone.com/passes/walking-hiking', to: '/configure-pass?product=sightseeing' },
  { name: 'Peak to Pub', description: 'Ride the Chondola uplift, then enjoy a downhill ride back to your car. The package includes a shuttle from Cardrona Valley Road and a bike trailer.', season: 'Summer · shuttle and lift package', image: resortPhotos.summerPeakToPub, link: RESORT_LINKS.activities, to: '/configure-pass?product=peak-to-pub' },
];
const ACCOMMODATION_CARDS = [
  { name: 'Studio Apartment', guests: 'Sleeps 2–4 guests', roomNumber: 'A-101', nightlyRate: 420, description: 'Ski-in, ski-out on-mountain studio for couples and small families.', details: ['King-size and two single beds', 'Kitchen with stove-top, microwave and dishwasher', 'Shared laundry room and ski storage'], image: resortPhotos.studio },
  { name: 'Two Bedroom King Apartment', guests: 'Sleeps 4–5 guests', roomNumber: 'A-102', nightlyRate: 620, description: 'A larger apartment for a family or two couples.', details: ['King bed and two single beds (can be made into a king)', 'Kitchen with oven, microwave and dishwasher', 'Lounge with sofa and smart TV'], image: resortPhotos.twoBedroom },
  { name: 'Three Bedroom Apartment', guests: 'Sleeps 6–8 guests', roomNumber: 'A-103', nightlyRate: 720, description: 'Three bedrooms plus an ensuite, roomy for larger groups.', details: ['Ensuite queen room plus two twin rooms', 'Kitchen with dishwasher, oven and microwave', 'Clothes washer and dryer'], image: resortPhotos.threeBedroom },
  { name: 'Three Bedroom Loft Apartment', guests: 'Up to 8 guests', roomNumber: 'A-104', nightlyRate: 890, description: 'Loft beds keep the kids together in one space.', details: ['Loft bedroom with four single beds', 'Two bathrooms and three toilets', 'Clothes washer and dryer'], image: resortPhotos.threeBedroomLoft },
  { name: 'Two Bedroom Queen Apartment', guests: 'Sleeps 4–5 guests', roomNumber: 'A-201', nightlyRate: 660, description: 'A comfortable two-bedroom apartment for families or friends.', details: ['Queen bedroom and twin bedroom', 'Kitchen and dining space', 'Lounge with mountain views'], image: resortPhotos.fourBedroom },
];
const DEMO_CURRENCY_RATES = { NZD: 1, AUD: 0.91, USD: 0.56, GBP: 0.44, CNY: 4.05 };
const accommodationDateValue = (date, offset = 0) => {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + offset);
  return value;
};
const accommodationISODate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const formatAccommodationDate = (date, lang = 'en') => new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-NZ', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
const products = [
  { id: 'beanie', name: 'Cardrona Limited Beanie', category: 'Accessories', price: 45, image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=900&q=85', tag: 'New' },
  { id: 'hoodie', name: 'Cardrona 2027 Hoodie', category: 'Men', price: 129, image: 'https://www.rossignol.com/dw/image/v2/BJJZ_PRD/on/demandware.static/-/Sites-rossignol-catalog/default/dwbf6d6018/images/large/RLLWS01_100_RGB72DPI_00.jpg?sh=1200&sw=1200', tag: 'New' },
  { id: 'jacket', name: 'Alpine Shell Jacket', category: 'Men', price: 389, image: 'https://cdn.aboutstatic.com/file/images/2446415369aed9ffc31ad6b5fed947d5.jpg?brightness=0.96&expand=1&height=630&quality=75&trim=1&width=1200' },
  { id: 'tee', name: 'Mountain Graphic Tee', category: 'Women', price: 69, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85' },
];
const HOME_FEATURES = [
  { tag: 'Lift passes', tagZh: '雪票', title: 'Find your mountain pass', titleZh: '选择适合您的雪票', detail: 'Day passes and season access', detailZh: '日票与季票', image: heroPhoto, to: '/passes' },
  { tag: 'Lessons', tagZh: '课程', title: 'Your first turns start here', titleZh: '从这里开始您的第一次滑行', detail: 'Private, group and kids lessons', detailZh: '私人、小组及儿童课程', image: lessonPhoto, to: '/lessons' },
  { tag: 'Equipment Hire', tagZh: '装备租赁', title: 'Bike package from NZ$219', titleZh: '山地车套餐 NZ$219 起', detail: 'Lift pass and bike rental', detailZh: '缆车票及山地车租赁', image: heroPhoto, to: '/passes' },
  { tag: 'Mountain shop', tagZh: '山地商店', title: 'Gear for the mountain', titleZh: '山地装备精选', detail: 'New arrivals and essentials', detailZh: '新品与必备装备', image: products[2].image, to: '/shop' },
];
const DEMO_ORDERS = [
  { id: 'SKI-20261112-JXUV', name: '2-Day Consecutive Ticket · Both Mountains', date: '2026-11-13', guests: 1, total: 210.6, status: 'Confirmed', category: 'Ski passes' },
  { id: 'SKI-20261111-Z6S1', name: '2-Day Consecutive Ticket · Both Mountains', date: '2026-11-18', guests: 2, total: 0, status: 'Reschedule requested', category: 'Ski passes' },
  { id: 'RENT-20261110-1016', name: 'Ski equipment rental package', date: '2026-11-13', guests: 1, total: 110, status: 'Confirmed', category: 'Mountain store' },
  { id: 'SKI-20260821-1021', name: 'Single day lift ticket', date: '2026-08-21', guests: 2, total: 418, status: 'Redeemed', category: 'Ski passes' },
  { id: 'RENT-20260706-1018', name: 'Mountain bike rental', date: '2026-07-06', guests: 1, total: 179, status: 'Cancelled', category: 'Mountain store' },
];
const SUMMER_PRODUCTS = [
  { id: 'earlybird-summer', name: 'Earlybird Summer Season Pass', description: 'Unlimited summer mountain visits with an earlybird rate.', price: 'NZ$359 adult', image: resortPhotos.summerEarlybird, to: '/configure-pass?product=earlybird-summer' },
  { id: 'summer-day-passes', name: 'Summer Day Passes', description: 'Full-day, afternoon and Friday evening bike park passes.', price: 'From NZ$65 adult', image: resortPhotos.summerDayPasses, to: '/configure-pass?product=summer-day-passes' },
  { id: 'lift-bike', name: 'Lift Pass and Bike Rental', description: 'A full-day lift ticket and mountain bike rental.', price: 'From NZ$219 adult', image: resortPhotos.summerLiftBike, to: '/bike-configure' },
  { id: 'bike-rental', name: 'Bike Rental', description: 'Enduro, downhill and full suspension options.', price: 'From NZ$174 adult', image: resortPhotos.summerBikeRental, to: '/bike-configure?product=bike-rental' },
  { id: 'peak-to-pub', name: 'Peak to Pub · Lift Pass and Shuttle', description: 'Mountain access with return shuttle travel.', price: 'NZ$49 adult', image: resortPhotos.summerPeakToPub, to: '/configure-pass?product=peak-to-pub' },
  { id: 'summer-carting', name: 'Summer Mountain Carting', description: 'A two-hour downhill cart pass with unlimited uplifts.', price: 'NZ$175 adult', image: resortPhotos.summerCarting, to: '/configure-pass?product=summer-carting' },
];
const WINTER_EARLYBIRD_MULTI_DAY = {
  name: 'Earlybird Multi-Day Passes',
  description: 'Ski or ride at both mountains outside the 5–16 July 2027 blackout period. Use your days whenever you want.',
  image: resortPhotos.terrainParks,
  to: '/configure-pass?product=earlybird-multi-day',
};
const WINTER_DAY_PASSES = [
  { id: 'learners-pass', name: 'Learners Pass', price: 99, details: ['Access to the beginners’ area with conveyors', 'Gentle learner runs', 'A dedicated kids’ conveyor', 'One ride on McDougall’s Chondola (Cardrona only)'] },
  { id: 'half-day-pass', name: 'Half Day Pass', price: 145, details: ['Half a day of skiing or riding from 12:30pm', 'Choose Cardrona or Treble Cone', 'Available on the day of travel only', 'Purchase at ticket offices or the call centre'] },
  { id: 'single-day-pass', name: 'Single Day Pass', price: 184, details: ['One full day skiing or riding', 'Choose Cardrona or Treble Cone', 'Ski or ride on your selected day', 'Buy online and save up to NZ$15'] },
  { id: 'multi-day-pass', name: 'Multi-Day Pass', price: 120, priceLabel: 'From NZ$120', details: ['Access both Cardrona and Treble Cone', 'Ski or ride at both mountains', 'Use anytime during the season', 'The more days you buy, the less you pay'] },
  { id: 'lift-rental-combo', name: 'Lift Pass & Rental Combo', price: 247, details: ['Single or multi-day lift pass', 'Rental skis and boots or snowboard and boots', 'Upgrade to the complete bundle for clothing and accessories', 'The more days you buy, the less you pay'] },
];
const pass = { id: 'winter-season-pass', name: 'Winter Season Pass', price: 1429, description: 'Ski or ride at both Cardrona and Treble Cone in Winter 27 with no blackout dates.', image: heroPhoto };
const CHARITY_LABELS = { seed: 'Plant A Seed', tamariki: 'Ride Tamariki', karearea: 'The Kārearea Project', 'all-in': 'All In' };
const initial = { cart: [], favorites: [], orders: [], accommodationUnits: { 'A-101': 'Occupied', 'A-102': 'Maintenance', 'A-103': 'Available' }, lang: 'en' };

function readStore() {
  try { return { ...initial, ...JSON.parse(localStorage.getItem(STORAGE) || '{}') }; }
  catch { return initial; }
}
function money(value) { return `NZ$${Number(value).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function words(lang, en, zh) { return lang === 'zh' ? zh : en; }

function ToggleLanguage({ lang, setLang, accent = '#5b8199' }) {
  return <div className="flex shrink-0 rounded-full border border-[#e0e3e7] bg-[#f5f5f6] p-1 text-[13px] font-bold" role="group" aria-label={words(lang, 'Language', '语言')}>
    {['zh', 'en'].map((code) => <button key={code} onClick={() => setLang(code)} aria-pressed={lang === code} style={lang === code ? { backgroundColor: accent } : undefined} className={`rounded-full px-3 py-1.5 ${lang === code ? 'text-white' : 'text-[#68717f]'}`}>{code === 'zh' ? '中文' : 'EN'}</button>)}
  </div>;
}

function CustomerHeader({ title, home, onBack, lang, setLang, mountain, setMountain }) {
  if (home) return <header className="sticky top-0 z-30 shrink-0">
      <div className="flex h-[64px] items-center gap-2 bg-[#101829] px-4 text-white">
      <Link to="/" aria-label={words(lang, 'Cardrona home', 'Cardrona 首页')} className="flex min-w-0 items-center gap-2"><span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#c8102e] font-serif text-[8px] font-black leading-[8px] tracking-tight text-white"><span className="inline-block text-left [text-shadow:0.35px_0_currentColor,-0.35px_0_currentColor,0_0.35px_currentColor,0_-0.35px_currentColor]">CAR<br/>DRO<br/>NA</span></span><span className="min-w-0 leading-none"><b className="block text-[13px] tracking-[0.12em]">CARDRONA</b><small className="mt-1 block text-[8px] tracking-[0.28em] text-white/65">TREBLE CONE</small></span></Link><div className="ml-auto"><ToggleLanguage lang={lang} setLang={setLang} accent="#5b8199"/></div>
    </div>
    <div className="flex h-[46px] items-center gap-2.5 border-b border-[#dce3eb] bg-white px-4 py-1.5"><div className="grid h-[36px] min-w-0 flex-1 grid-cols-2 rounded-full bg-[#edf2f3] p-1">{['Cardrona', 'Treble Cone'].map((name) => <button key={name} onClick={() => setMountain(name)} aria-pressed={mountain === name} className={`rounded-full text-[10px] font-bold ${mountain === name ? 'bg-[#243d4b] text-white' : 'text-[#60738d]'}`}>{name}</button>)}</div><span className="shrink-0 text-[7px] font-bold tracking-[0.12em] text-[#516673]">{words(lang, 'SUMMER 26/27', '夏季 26/27')}</span></div>
  </header>;
  return <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center gap-3 border-b border-[#dce3eb] bg-[#f4f7fa]/95 px-4 backdrop-blur sm:h-[96px] sm:px-6"><button onClick={onBack} className="flex h-10 w-10 shrink-0 items-center justify-center text-[#455a74]" aria-label="Go back"><ArrowLeft className="h-6 w-6" /></button><h1 className="min-w-0 flex-1 truncate font-serif text-[21px] font-bold sm:text-[23px]">{customerText(title, lang)}</h1><div className="ml-auto"><ToggleLanguage lang={lang} setLang={setLang} /></div></header>;
}

function HomeFeatureCarousel({ accent = '#5b8199', lang = 'en' }) {
  const railRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(2);

  useEffect(() => {
    const rail = railRef.current;
    if (rail) rail.scrollLeft = rail.clientWidth * 2;
  }, []);

  const updateActive = () => {
    const rail = railRef.current;
    if (rail) setActiveIndex(Math.round(rail.scrollLeft / rail.clientWidth));
  };

  const goTo = (index) => {
    const rail = railRef.current;
    if (rail) rail.scrollTo({ left: rail.clientWidth * index, behavior: 'smooth' });
  };

  return <section aria-label={words(lang, 'Featured mountain activities', '山地精选活动')}>
    <div ref={railRef} onScroll={updateActive} className="flex snap-x snap-mandatory overflow-x-auto rounded-[18px] [scrollbar-width:none]" style={{ scrollbarWidth: 'none' }}>
      {HOME_FEATURES.map((slide) => <Link key={slide.tag} to={slide.to} className="relative block h-[172px] w-full shrink-0 snap-center overflow-hidden rounded-[16px] bg-[#26364c] text-white">
        <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute inset-0 bg-gradient-to-r from-[#101829]/85 via-[#101829]/45 to-transparent" />
        <span className="absolute inset-0 p-4"><small className="inline-block rounded-full bg-white/20 px-2.5 py-1 text-[8px]">{words(lang, slide.tag, slide.tagZh)}</small><span className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white" style={{ backgroundColor: accent }}><ArrowUpRight className="h-4 w-4" /></span><b className="mt-3 block font-serif text-[17px]">{words(lang, slide.title, slide.titleZh)}</b><small className="mt-1 block text-[9px] text-white/80">{words(lang, slide.detail, slide.detailZh)}</small></span>
      </Link>)}
    </div>
    <div className="mt-2.5 flex justify-center gap-1.5" aria-label="Choose a featured slide">
      {HOME_FEATURES.map((slide, index) => <button key={slide.tag} type="button" onClick={() => goTo(index)} aria-label={`Show slide ${index + 1}: ${slide.tag}`} aria-current={activeIndex === index ? 'true' : undefined} className={`h-2 rounded-full transition-all ${activeIndex === index ? 'w-8' : 'w-2 bg-[#cbd4df]'}`} style={activeIndex === index ? { backgroundColor: accent } : undefined} />)}
    </div>
  </section>;
}

function BottomNav({ path, lang, count }) {
  const links = [
    { label: words(lang, 'Home', '首页'), icon: House, to: '/' },
    { label: words(lang, 'Passes', '雪票'), icon: Mountain, to: '/passes' },
    { label: words(lang, 'Book', '预订'), icon: Ticket, to: '/book' },
    { label: words(lang, 'Account', '我的'), icon: UserRound, to: '/account' },
  ];
  return <nav className="sticky bottom-0 z-30 grid h-[64px] shrink-0 grid-cols-4 border-t border-[#d9e1ea] bg-[#f1f6fa]/95 px-1 backdrop-blur sm:h-[120px]" aria-label="Main navigation">
    {links.map(({ label, icon: Icon, to }) => {
      const bookingArea = ['/checkout', '/configure-pass', '/cart', '/bike-configure'].includes(path);
      const active = to === '/' ? path === '/' : to === '/book' ? path === '/book' || bookingArea : path === to || (to === '/shop' && path === '/retail');
      const accent = path === '/' ? '#bd2041' : '#5b8199';
      return <Link key={to} to={to} className={`relative flex flex-col items-center justify-center gap-1 text-[11px] sm:text-[16px] ${active ? 'font-semibold' : 'text-[#68717f]'}`} style={active ? { color: accent } : undefined}><Icon className="h-5 w-5 sm:h-7 sm:w-7" strokeWidth={active ? 2.2 : 1.8} />{label}{to === '/account' && <span className="absolute right-[calc(50%-18px)] top-[4px] flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white" style={{ backgroundColor: accent }}>3</span>}</Link>;
    })}
  </nav>;
}

function Stepper({ current, lang }) {
  const labels = [
    words(lang, 'Pass', '雪票'),
    words(lang, 'Review', '订单'),
    words(lang, 'Details', '资料'),
    words(lang, 'Pay', '付款'),
    words(lang, 'Done', '完成'),
  ];
  return <div className="sticky top-0 z-20 grid grid-cols-5 border-b border-[#d9e1ea] bg-[#f1f6fa]/95 px-2 backdrop-blur">
    {labels.map((label, i) => <div key={label} className={`relative flex min-w-0 items-center justify-center gap-0.5 py-2.5 text-[10px] sm:text-[13px] ${i === current ? 'font-semibold text-[#5b8199]' : 'text-[#718096]'}`}>
      <span className="truncate">{label}</span>{i < current && <Check className="h-3 w-3 shrink-0" />}
      {i === current && <span className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-[#5b8199]" />}
    </div>)}
  </div>;
}

function AccommodationBookingDialog({ booking, onChange, onUnitTypeChange, nights, total, onCancel, onReview, onConfirm }) {
  const { lang } = useLang();
  if (!booking) return null;
  const locked = booking.status !== 'Available';
  const inputClass = 'mt-1.5 h-10 w-full rounded-[13px] border border-[#dce4ed] bg-transparent px-3 text-[11px] text-[#344a64] outline-none focus:border-[#5d829a] disabled:opacity-50';
  const field = (label, key, placeholder, type = 'text', required = false) => <label key={key} className="block">{label}{required && <span className="text-[#5b8199]"> *</span>}<input required={required} disabled={locked} type={type} min={type === 'number' ? 1 : undefined} value={booking[key]} placeholder={placeholder} onChange={(event) => onChange(key, event.target.value)} className={inputClass}/></label>;
  return <LocalizeCustomerTree lang={lang}><div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 sm:items-center sm:p-4"><section role="dialog" aria-modal="true" aria-labelledby="accommodation-booking-title" className="flex max-h-[92dvh] w-full max-w-[430px] flex-col rounded-t-[20px] bg-[#f1f6fa] shadow-2xl sm:rounded-[20px]"><div className="flex shrink-0 items-center justify-between px-5 pt-4"><span className="w-7"/><h2 id="accommodation-booking-title" className="font-serif text-[16px] font-bold text-[#344a64]">{booking.step === 'review' ? 'Review accommodation booking' : 'Book accommodation unit'}</h2><button onClick={onCancel} aria-label="Close booking" className="p-1 text-[#718096]"><X className="h-5 w-5"/></button></div><p className="px-5 pt-1 text-center text-[10px] text-[#718096]">Demonstration accommodation booking.</p><div className="overflow-y-auto px-5 pb-4 pt-3 text-[11px] text-[#526982]">{booking.step === 'review' ? <><p className="mb-4 text-center text-[10px]">Check the details before adding your demo reservation to the cart.</p><img src={booking.stay.image} alt={booking.unitType} className="mb-4 h-36 w-full rounded-[14px] object-cover"/><div className="space-y-3 rounded-[14px] border border-[#dce4ed] bg-white p-4">{[['Room', `${booking.roomNumber} · ${booking.unitType}`], ['Guest', booking.guestName], ['Booking reference', booking.bookingReference], ['Check-in', booking.checkIn], ['Check-out', booking.checkOut], ['Guests', booking.guests], ['Nights', String(nights)], ['Status', booking.status]].map(([label, value]) => <div key={label} className="flex justify-between gap-3 border-b border-[#edf1f5] pb-2 last:border-0 last:pb-0"><span>{label}</span><b className="text-right text-[#344a64]">{value}</b></div>)}<div className="flex justify-between border-t border-[#dce4ed] pt-3 text-[13px]"><b>Total · NZ${booking.nightlyRate} × {nights}</b><b className="text-[#5b8199]">{money(total)}</b></div></div>{booking.notes && <p className="mt-3 rounded-xl bg-white p-3 text-[10px]">Notes: {booking.notes}</p>}</> : <div className="space-y-3">{field('Room number', 'roomNumber', 'A-201', 'text', true)}<label className="block">Unit type <span className="text-[#5b8199]">*</span><select disabled={locked} value={booking.unitType} onChange={(event) => onUnitTypeChange(event.target.value)} className={inputClass}>{ACCOMMODATION_CARDS.map((stay) => <option key={stay.name}>{stay.name}</option>)}</select></label>{field('Nightly rate (NZD)', 'nightlyRate', '860', 'number', true)}{field('Number of guests', 'guests', '2', 'number', true)}<div><span>Room photo</span><div className="mt-1.5 flex items-center gap-3"><img src={booking.stay.image} alt="Room type sample" className="h-14 w-14 rounded-[12px] object-cover"/><span className="text-[10px] leading-4 text-[#718096]">A sample photo of this unit type is shown for reference.</span></div></div>{field('Guest name', 'guestName', 'As shown on your ID')}<label className="block">Booking reference<input disabled={locked} value={booking.bookingReference} onChange={(event) => onChange('bookingReference', event.target.value)} className={inputClass}/></label>{[['Check-in', 'checkIn'], ['Check-out', 'checkOut']].map(([label, key]) => <label key={key} className="block">{label}<input type="date" min={key === 'checkOut' ? booking.checkIn : undefined} disabled={locked} value={booking[key]} onChange={(event) => onChange(key, event.target.value)} className={inputClass}/></label>)}<label className="block">Status <span className="text-[#5b8199]">*</span><select value={booking.status} onChange={(event) => onChange('status', event.target.value)} className={inputClass}>{['Available', 'Occupied', 'Maintenance'].map((status) => <option key={status}>{status}</option>)}</select></label>{locked && <p className="rounded-[13px] border border-amber-300 bg-amber-50 px-3 py-2.5 text-[10px] leading-4 text-amber-800">This unit is {booking.status === 'Occupied' ? 'occupied' : 'under maintenance'}, so the details are locked. Switch back to Available to edit.</p>}<label className="block">Notes<textarea disabled={locked} value={booking.notes} onChange={(event) => onChange('notes', event.target.value)} placeholder="Anything we should know, e.g. high floor or early check-in" className="mt-1.5 min-h-[72px] w-full resize-y rounded-[13px] border border-[#dce4ed] bg-transparent px-3 py-2 text-[11px] leading-4 text-[#344a64] disabled:opacity-50"/></label><div className="border-t border-[#dce4ed] pt-3 text-[10px] text-[#718096]">{nights} {nights === 1 ? 'night' : 'nights'} · {money(Number(booking.nightlyRate || 0))} per night <b className="float-right text-[#344a64]">Total {money(total)}</b></div></div>}</div><div className="flex shrink-0 gap-2 border-t border-[#dce4ed] bg-[#f1f6fa] px-5 py-3">{booking.step === 'review' ? <><button onClick={() => onChange('step', 'details')} className="h-10 flex-1 rounded-full border border-[#dce4ed] text-[11px] font-semibold text-[#344a64]">Back to details</button><button onClick={onConfirm} className="h-10 flex-1 rounded-full bg-[#5b8199] text-[11px] font-semibold text-white">Confirm demo booking</button></> : <><button onClick={onCancel} className="h-10 flex-1 rounded-full border border-[#dce4ed] text-[11px] font-semibold text-[#344a64]">Cancel</button><button disabled={locked || !booking.roomNumber.trim() || !booking.guestName.trim() || Number(booking.nightlyRate) <= 0 || Number(booking.guests) < 1 || new Date(booking.checkOut) <= new Date(booking.checkIn)} onClick={onReview} className="h-10 flex-1 rounded-full bg-[#5b8199] text-[11px] font-semibold text-white disabled:opacity-45">Review booking</button></>}</div></section></div></LocalizeCustomerTree>;
}

function WinterSeasonPassBooking({ onAdd }) {
  const { lang } = useLang();
  const [passType, setPassType] = useState('Winter Saver Season Pass');
  const [ageStage, setAgeStage] = useState('counts');
  const [guestCounts, setGuestCounts] = useState({ 'Adult: 18 - 64 yrs': 1, 'Child: 6 - 17 yrs': 1, 'Senior: 65 - 74 yrs': 0, 'Under 6 yrs: Free of Charge': 0, 'Over 75 yrs: Free of Charge': 0 });
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [foundation, setFoundation] = useState(false);
  const [donations, setDonations] = useState([]);
  const isSaver = passType === 'Winter Saver Season Pass';
  const agePrices = isSaver
    ? { 'Adult: 18 - 64 yrs': 1029, 'Child: 6 - 17 yrs': 319, 'Senior: 65 - 74 yrs': 689 }
    : { 'Adult: 18 - 64 yrs': 1429, 'Child: 6 - 17 yrs': 399, 'Senior: 65 - 74 yrs': 850, 'Under 6 yrs: Free of Charge': 0, 'Over 75 yrs: Free of Charge': 0 };
  const ageEntries = Object.entries(agePrices).map(([label, price]) => ({ label, price, quantity: guestCounts[label] || 0 })).filter((item) => item.quantity > 0);
  const guestCount = ageEntries.reduce((sum, item) => sum + item.quantity, 0);
  const passTotal = ageEntries.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const donationTotal = donations.length * 20 * guestCount;
  const fullTotal = passTotal + donationTotal;
  const canAdd = !isSaver || rulesAccepted;
  const shortPassName = isSaver ? 'Winter Saver Pass' : 'Winter Unlimited Pass';
  const toggleDonation = (id) => setDonations((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const setAgeCount = (label, quantity) => setGuestCounts((current) => ({ ...current, [label]: Math.max(0, quantity) }));
  const choosePassType = (type) => {
    setPassType(type);
    setRulesAccepted(false);
    if (type === 'Winter Saver Season Pass') setGuestCounts((current) => ({ ...current, 'Under 6 yrs: Free of Charge': 0, 'Over 75 yrs: Free of Charge': 0 }));
  };
  const addPass = () => ageEntries.forEach(({ label, price, quantity }) => onAdd({
    id: 'winter-season-pass',
    name: `${shortPassName} - ${label.split(':')[0]} Pay Now`,
    price: price + donations.length * 20,
    quantity,
    image: pass.image,
    ageBand: label,
    detail: [`Full pass total ${money(price)}`, foundation ? 'Cardrona Foundation donation' : '', ...donations.map((id) => `${CHARITY_LABELS[id]} +$20`)].filter(Boolean).join(' · '),
    variant: `${passType}-${label}-${foundation}-${donations.join(',')}`,
  }));

  return <LocalizeCustomerTree lang={lang}><main className="grid grid-cols-1 items-start gap-6 px-4 pb-8 pt-5 sm:px-8">
    <div className="space-y-6">
      {ageStage === 'counts' && <section className="space-y-3">
        <div><h3 className="text-[16px] font-bold">Guests</h3><p className="mt-1 text-[13px] text-[#777]">Choose the number of passes for each age group.</p></div>
        {Object.keys(agePrices).map((label) => <div key={label} className="flex items-center justify-between gap-3 rounded-xl border border-[#dce4ed] bg-white p-3"><span className="min-w-0 text-[14px]">{label}</span><div className="flex h-10 items-center overflow-hidden rounded-lg border border-[#dce4ed]"><button type="button" aria-label={`Remove one ${label}`} disabled={!guestCounts[label]} onClick={() => setAgeCount(label, guestCounts[label] - 1)} className="h-full px-3 text-[#526982] disabled:opacity-35"><Minus className="h-4 w-4"/></button><b className="min-w-8 text-center text-[14px]">{guestCounts[label] || 0}</b><button type="button" aria-label={`Add one ${label}`} onClick={() => setAgeCount(label, (guestCounts[label] || 0) + 1)} className="h-full px-3 text-[#526982]"><Plus className="h-4 w-4"/></button></div></div>)}
        <button type="button" disabled={!guestCount} onClick={() => setAgeStage('options')} className="w-full rounded-xl bg-[#5b8199] px-4 py-3 text-[14px] font-semibold text-white disabled:opacity-40">Continue to pass options</button>
      </section>}

      {ageStage === 'options' && <>
      <section>
        <h3 className="text-[16px] font-bold">Pass Type</h3>
        <div className="mt-2 flex flex-wrap gap-2">{['Winter Saver Season Pass', 'Winter Unlimited Season Pass'].map((type) => <button key={type} type="button" aria-pressed={passType === type} onClick={() => choosePassType(type)} className={`min-h-[62px] max-w-[210px] rounded-xl border px-3 py-3 text-left text-[15px] ${passType === type ? 'border-2 border-[#5b8199] font-bold' : 'border-[#a0a0a0]'}`}>{type}</button>)}</div>
      </section>
      <section>
        <h3 className="text-[16px] font-bold">Payment Plan</h3>
        <p className="mt-1 text-[15px] text-[#777]">Choose your Payment Option</p>
        <div className="mt-2 rounded-xl border-2 border-[#5b8199] px-4 py-3"><b className="block text-[15px]">Pay Now</b></div>
      </section>

      <section>
        <div className="mt-5">
          <b className="block text-[16px]">{isSaver ? 'Winter Saver Season Pass' : 'Unlimited Season Pass'}</b>
          <p className="mt-1 text-[15px] leading-6 text-[#777]">{isSaver ? 'Ski or ride at Cardrona only in Winter 27. Blackout dates apply 5-16 July, 2027' : 'Ski or ride at both Cardrona and Treble Cone in Winter 27 with no blackout dates'}</p>
          {isSaver ? <>
            {!rulesAccepted && <span className="mt-1 block text-[14px] text-red-500">Select One (Required)</span>}
            <label className={`mt-2 flex min-h-[60px] cursor-pointer items-center justify-between rounded-xl border px-4 py-3 ${rulesAccepted ? 'border-[#a0a0a0]' : 'border-[#a0a0a0]'}`}><b className="text-[15px]">I accept the rules of the Winter Saver</b><input type="checkbox" checked={rulesAccepted} onChange={(event) => setRulesAccepted(event.target.checked)} className="h-5 w-5 accent-[#5b8199]"/></label>
          </> : <span className="mt-1 block text-[14px]">Select One (Optional)</span>}
        </div>
      </section>

      <WinterDonationOptions foundation={foundation} onFoundationChange={setFoundation} selected={donations} onToggle={toggleDonation}/>
      <button type="button" onClick={() => setAgeStage('counts')} className="text-[13px] text-[#5b8199] underline">Back to guest counts</button>
      </>}
    </div>

    <aside className="w-full min-w-0 rounded-[20px] border border-[#ddd] bg-white p-5 shadow-[0_8px_18px_rgba(0,0,0,0.10)]">
      <h2 className="font-serif text-[23px] font-bold">Item Summary</h2>
      {canAdd && <div className="mt-4 border-b border-[#cbd7e4] pb-4 text-[15px]">
        {ageEntries.map(({ label, price, quantity }) => <div key={label} className="mb-3"><b className="block">({quantity}) {shortPassName} - {label.split(':')[0]} Pay Now</b><span className="mt-2 block">${(price * quantity).toLocaleString('en-NZ')}</span></div>)}
        {donations.map((id) => <div key={id} className="mt-4"><b className="block">({guestCount}) {CHARITY_LABELS[id]}</b><span className="mt-2 block">${20 * guestCount}</span></div>)}
      </div>}
      {canAdd && <div className="mt-4 flex justify-between text-[23px]"><span>Total</span><b>${fullTotal.toLocaleString('en-NZ')}</b></div>}
      <button type="button" disabled={!canAdd || !guestCount} onClick={addPass} className="mt-4 h-11 w-full rounded-lg bg-[#5b8199] text-[15px] tracking-[0.08em] text-white disabled:bg-[#ccc]">Add {guestCount} {guestCount === 1 ? 'Pass' : 'Passes'} To Cart</button>
    </aside>
  </main></LocalizeCustomerTree>;
}

export default function CustomerExperience() {
  const { lang: appLang, setLang: setAppLang } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState(readStore);
  const [mountain, setMountain] = useState('Cardrona');
  const [filter, setFilter] = useState('All');
  useEffect(() => {
    if (location.pathname === '/passes' && new URLSearchParams(location.search).get('season') === 'summer') {
      setFilter('Summer');
    }
  }, [location.pathname, location.search]);
  useEffect(() => { if (['Sightseeing', 'Lessons', 'Rentals'].includes(filter)) setFilter('All'); }, [filter]);
  const [expandedLiftPass, setExpandedLiftPass] = useState('');
  const [dateFrom, setDateFrom] = useState('2026-11-13');
  const [dateTo, setDateTo] = useState('2026-11-13');
  const [guests, setGuests] = useState(1);
  const [bookingStep, setBookingStep] = useState(0);
  const [payMethod, setPayMethod] = useState('wechat');
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [smsSent, setSmsSent] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState('Pay Now');
  const [passType, setPassType] = useState('Winter Unlimited Season Pass');
  const [age, setAge] = useState('Adult: 18 - 64 yrs');
  const [winterFoundation, setWinterFoundation] = useState(false);
  const [winterDonations, setWinterDonations] = useState([]);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discount, setDiscount] = useState('');
  const [agentLoginOpen, setAgentLoginOpen] = useState(false);
  const [agentCode, setAgentCode] = useState('');
  const [agentError, setAgentError] = useState('');
  const [agentCentreOpen, setAgentCentreOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [ordersPeriod, setOrdersPeriod] = useState('Upcoming');
  const [ordersCategory, setOrdersCategory] = useState('All');
  const [visibleOrders, setVisibleOrders] = useState(3);
  const [helpTab, setHelpTab] = useState('Mountain');
  const [openFaq, setOpenFaq] = useState('');
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [cafeQuantities, setCafeQuantities] = useState({});
  const [cafeNotes, setCafeNotes] = useState('');
  const [accommodationBooking, setAccommodationBooking] = useState(null);
  const [accommodationSearch, setAccommodationSearch] = useState(() => ({ checkIn: accommodationISODate(new Date()), nights: 3, adults: 2, children: 0, infants: 0, currency: 'NZD' }));
  const [accommodationQuantities, setAccommodationQuantities] = useState({});
  const path = location.pathname;
  const productId = new URLSearchParams(location.search).get('product');
  const isSightseeing = productId === 'sightseeing';
  const isHome = path === '/';
  const resortTab = new URLSearchParams(location.search).get('tab');
  const activeResortTab = RESORT_TABS.some((tab) => tab.id === resortTab) ? resortTab : 'cafes';
  const [lang, setLang] = useState(() => localStorage.getItem('cardrona_lang') || appLang || 'en');

  useEffect(() => { localStorage.setItem(STORAGE, JSON.stringify({ ...state, lang })); }, [state, lang]);
  useEffect(() => { if (appLang !== lang) setAppLang(lang); }, [lang, appLang, setAppLang]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); setNotice(''); }, [path]);
  useEffect(() => {
    const selectedDates = path === '/checkout' ? [...new Set(state.cart.map((item) => item.visitDate).filter(Boolean))] : [];
    if (selectedDates.length === 1) { setDateFrom(selectedDates[0]); setDateTo(selectedDates[0]); }
    else if (selectedDates.length > 1) { setDateFrom(selectedDates[0]); setDateTo(selectedDates[selectedDates.length - 1]); }
  }, [path, state.cart]);

  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const bookingName = state.cart.length ? state.cart.map((item) => item.name).join(' + ') : pass.name;
  const bookingDates = [...new Set(state.cart.map((item) => item.visitDate).filter(Boolean))];
  const checkoutDate = bookingDates.length ? bookingDates.join(', ') : state.cart.length ? 'Not required' : dateFrom;
  const winterAdultPrice = passType === 'Winter Saver Season Pass' ? 1029 : 1429;
  const winterPassDescription = passType === 'Winter Saver Season Pass'
    ? 'Cardrona winter access across five basins. Blackout dates apply from 5–16 July 2027.'
    : pass.description;
  const selectedAgePrice = age.startsWith('Child') ? (passType === 'Winter Saver Season Pass' ? 319 : 399) : age.startsWith('Senior') ? (passType === 'Winter Saver Season Pass' ? 689 : 850) : age.includes('Free') ? 0 : winterAdultPrice;
  const configuredPassTotal = selectedAgePrice + winterDonations.length * 20;
  const total = Math.max(0, cartTotal - (discount.toUpperCase() === 'PEAK10' ? cartTotal * 0.1 : 0));
  const bookingTotal = state.cart.length ? total : selectedAgePrice * guests;
  const bookingQuantity = state.cart.length ? state.cart.reduce((sum, item) => sum + (item.id.startsWith('summer-donation-') ? 0 : item.quantity), 0) : guests;
  const checkoutGuestCount = state.cart.length ? Math.max(1, state.cart.reduce((sum, item) => sum + (item.ageBand ? item.quantity : 0), 0)) : guests;
  const addToCart = (item, quantity = 1, extra = {}) => setState((old) => {
    const key = `${item.id}:${extra.variant || ''}`;
    const baseCart = extra.replaceKey ? old.cart.filter((line) => line.key !== extra.replaceKey) : old.cart;
    const existing = baseCart.find((line) => line.key === key);
    const line = { key, id: item.id, name: item.name, price: item.price, image: item.image || '', quantity, detail: extra.detail || '', variant: extra.variant || '', visitDate: extra.visitDate || '', ageBand: extra.ageBand || '' };
    return { ...old, cart: existing ? baseCart.map((x) => x.key === key ? { ...x, quantity: x.quantity + quantity } : x) : [...baseCart, line] };
  });
  const updateQuantity = (key, delta) => setState((old) => ({ ...old, cart: old.cart.map((x) => x.key === key ? { ...x, quantity: Math.max(0, x.quantity + delta) } : x).filter((x) => x.quantity > 0) }));
  const changeBookingGuests = (delta) => {
    setGuests((value) => Math.max(1, Math.min(10, value + delta)));
    if (state.cart.length === 1) updateQuantity(state.cart[0].key, delta);
  };
  const toggleFavorite = (id) => setState((old) => ({ ...old, favorites: old.favorites.includes(id) ? old.favorites.filter((x) => x !== id) : [...old.favorites, id] }));
  const goBack = () => navigate(-1);
  const announce = (message) => { setNotice(message); window.setTimeout(() => setNotice(''), 2200); };
  const startAccommodationBooking = (stay) => {
    const checkOut = accommodationISODate(accommodationDateValue(accommodationSearch.checkIn, Number(accommodationSearch.nights)));
    setAccommodationBooking({ stay, roomNumber: stay.roomNumber, unitType: stay.name, nightlyRate: String(stay.nightlyRate || 860), guests: String(Number(accommodationSearch.adults) + Number(accommodationSearch.children)), guestName: '', bookingReference: `SKI-${accommodationSearch.checkIn.replaceAll('-', '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, checkIn: accommodationSearch.checkIn, checkOut, status: state.accommodationUnits?.[stay.roomNumber] || 'Available', notes: '', step: 'details' });
  };

  const title = ({ '/resort': 'Eat, stay & play', '/passes': 'Passes & packages', '/configure-pass': 'Configure pass', '/bike-configure': 'Bike package', '/book': 'Book', '/checkout': 'Book', '/cart': 'Cart', '/shop': 'New arrivals', '/retail': 'New arrivals', '/rentals': 'Rentals', '/orders': 'Orders', '/account': 'Account', '/login': 'Log in', '/register': 'Create account', '/lessons': 'Ski lessons', '/transport': 'Mountain transport', '/ski': 'Trail map', '/snow-report': 'Snow report', '/support': 'Mountain & help' })[path] || 'Peak';

  function actionBar(label, onClick, amount, disabled = false) {
    return <div className="absolute inset-x-0 bottom-[76px] z-20 mx-auto w-full max-w-[430px] border-t border-[#e2e5e9] bg-[#fafafb]/95 px-4 pb-3 pt-3 backdrop-blur sm:bottom-[120px] sm:px-6 sm:pb-3 sm:pt-2"><div className="mb-1.5 flex items-center justify-between text-[14px] text-[#68717f] sm:mb-2 sm:text-[14px]"><span>Total</span><span className="font-serif text-[23px] text-[#5b8199] sm:text-[21px]">{money(amount)}</span></div><button disabled={disabled} onClick={onClick} className="flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[#5b8199] text-[17px] font-semibold text-white shadow-sm disabled:opacity-50 sm:h-[50px] sm:text-[16px]">{label}<ArrowRight className="h-5 w-5 sm:h-5 sm:w-5" /></button></div>;
  }

  const content = () => {
    if (isHome) return <main className="space-y-3 pb-5">
      <MountainReport mountain={mountain} lang={lang} accent="#bd2041"/>
      <div className="mx-4 flex items-center gap-2 pt-1"><span className="text-[8px] tracking-[0.18em] text-[#8794a0]">{words(lang, 'PLAN YOUR TRIP', '规划行程')}</span><span className="h-px flex-1 bg-[#d9e0e5]"/></div>
      <Link to="/passes" className="mx-4 flex h-[70px] items-center gap-3 rounded-[15px] bg-[#bd2041] px-3.5 text-white shadow-sm"><span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/35 bg-white/10"><Ticket className="h-5 w-5"/></span><span className="min-w-0 flex-1"><b className="block text-[13px] leading-4">{words(lang, 'Plan your mountain trip', '预订雪山之旅')}</b><small className="block text-[9px] text-white/85">{words(lang, 'Tickets, lessons, rentals and more', '雪票、课程、租赁及更多')}</small></span><ArrowRight className="h-4 w-4"/></Link>
      <section className="mx-4 grid grid-cols-4 gap-x-1 gap-y-2 rounded-[16px] border border-[#dce4ed] bg-white px-2 py-3">{[['Passes', '雪票', Ticket, '/passes'], ['Lessons', '课程', GraduationCap, '/lessons'], ['Rentals', '租赁', Package, '/rentals'], ['Transport', '交通', Bus, '/transport'], ['Trail map', '雪道图', Map, '/ski'], ['Shop', '商店', ShoppingBag, '/shop'], ['Accommodation', '住宿', BedDouble, '/resort?tab=stays'], ['Help', '帮助', Headset, '/support']].map(([label, labelZh, Icon, to]) => <Link key={label} to={to} className="flex min-h-[60px] flex-col items-center gap-1.5 text-center text-[9px] font-semibold text-[#66788e]"><span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#f0f3f5] text-[#286a7d]"><Icon className="h-5 w-5" strokeWidth={1.9}/></span>{words(lang, label, labelZh)}</Link>)}</section>
      <section className="mx-4 pt-1">
        <div className="mb-2"><p className="text-[7px] font-bold tracking-[0.2em] text-[#b85b5b]">{words(lang, 'DISCOVER MORE', '发现更多')}</p><div className="mt-0.5 flex items-center justify-between"><h2 className="text-[15px] font-bold leading-5 text-[#233a49]">{words(lang, 'Eat, stay & play', '吃、住、玩')}</h2><Link to="/resort?tab=cafes" className="inline-flex items-center gap-1 text-[8px] font-semibold text-[#15727a]">{words(lang, 'View all', '查看全部')}<ArrowUpRight className="h-3 w-3"/></Link></div></div>
        <div className="grid grid-cols-3 gap-2">{[[resortPhotos.noodleBar, 'Eat', '餐饮', 'cafes'], [resortPhotos.biking, 'Explore', '探索', 'activities'], [resortPhotos.studio, 'Stay', '住宿', 'stays']].map(([image, label, labelZh, tab]) => <Link key={label} to={`/resort?tab=${tab}`} className="overflow-hidden rounded-[12px] border border-[#dce4ed] bg-white"><img src={image} alt="" className="h-[92px] w-full object-cover"/><span className="flex items-center justify-between px-2 py-1.5 text-[8px] font-semibold text-[#233a49]">{words(lang, label, labelZh)}<ArrowUpRight className="h-3 w-3 text-[#15727a]"/></span></Link>)}</div>
      </section>
      <section className="mx-4 pt-1"><div className="mb-2"><p className="text-[7px] font-bold tracking-[0.2em] text-[#b85b5b]">{words(lang, 'ALPINE HIGHLIGHTS', '高山精选')}</p><h2 className="mt-0.5 text-[15px] font-bold leading-5 text-[#233a49]">{words(lang, 'Worth exploring', '探索山地精彩')}</h2></div><HomeFeatureCarousel accent="#bd2041" lang={lang}/></section>
      <Link to="/support" aria-label="Mountain help" className="absolute bottom-[112px] right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#5b8199] text-white shadow-lg"><Headset className="h-6 w-6"/></Link>
    </main>;

    if (path === '/resort') {
      const tabButton = (tab) => <button key={tab.id} onClick={() => navigate(`/resort?tab=${tab.id}`)} aria-pressed={activeResortTab === tab.id} className={`shrink-0 rounded-full px-3.5 py-2 text-[10px] ${activeResortTab === tab.id ? 'bg-[#5b8199] text-white' : 'bg-[#e5ecf4] text-[#61738a]'}`}>{tab.label}</button>;
      if (activeResortTab === 'cafes') return <main className="space-y-3 px-4 pb-6 pt-4">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Eat, stay and play categories">{RESORT_TABS.map(tabButton)}</div>
        <div className="grid grid-cols-2 rounded-full bg-[#dfe7f1] p-1" role="tablist" aria-label="Choose mountain restaurant listings">{['Cardrona', 'Treble Cone'].map((name) => <button key={name} role="tab" aria-selected={mountain === name} onClick={() => setMountain(name)} className={`h-10 rounded-full text-[11px] font-semibold transition-colors ${mountain === name ? 'bg-[#101829] text-white shadow-sm' : 'text-[#60738d]'}`}>{name}</button>)}</div>
        <section className="px-1"><h2 className="font-serif text-[17px] font-bold text-[#344a64]">{mountain} restaurants, cafés &amp; bars</h2><p className="mt-1 text-[10px] leading-4 text-[#718096]">{mountain === 'Cardrona' ? 'Explore cafés, restaurants and bars around the mountain.' : 'Find a quick refuel or a relaxed lunch at Treble Cone.'}</p></section>
        <div className="space-y-3">{(mountain === 'Treble Cone' ? TREBLE_CONE_CAFE_CARDS : CAFE_CARDS).map((cafe) => <article key={`${mountain}-${cafe.name}`} className="overflow-hidden rounded-[17px] border border-[#dce4ed] bg-white shadow-sm"><img src={cafe.image} alt={cafe.name} className="h-[180px] w-full object-cover"/><div className="space-y-1.5 p-3 text-[10px] leading-4 text-[#61738a]">{cafe.isOpen && <div className="mb-1 flex items-center gap-1 text-[9px] font-bold text-[#526982]"><span className="h-2 w-2 rounded-full bg-[#22a447]"/>OPEN</div>}{cafe.note && <div className="mb-1 inline-flex rounded-full bg-[#edf2f7] px-2 py-1 text-[8px] font-semibold text-[#526982]">{cafe.note}</div>}<h3 className="mb-1 font-serif text-[14px] font-semibold text-[#344a64]">{cafe.name}</h3><p><b>Location:</b> {cafe.location}</p><p><b>Opening hours:</b> {cafe.hours}</p><p><b>Offering:</b> {cafe.offering}</p><p className="pt-1">{cafe.description}</p></div></article>)}</div>
        <p className="px-2 text-center text-[9px] leading-4 text-[#718096]">Hours and weather-dependent service can change. Check the <a href={RESORT_LINKS.cafes} target="_blank" rel="noreferrer" className="font-medium text-[#5b8199] underline">official restaurant page</a> for current details.</p>
      </main>;
      if (activeResortTab === 'activities') return <main className="space-y-3 px-4 pb-6 pt-4">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Eat, stay and play categories">{RESORT_TABS.map(tabButton)}</div>
        <div className="space-y-3">{ACTIVITY_CARDS.map((activity) => <article key={activity.name} className="overflow-hidden rounded-[17px] border border-[#dce4ed] bg-white shadow-sm"><img src={activity.image} alt={activity.name} className="h-[190px] w-full object-cover"/><div className="p-3"><h3 className="font-serif text-[14px] font-semibold text-[#344a64]">{activity.name}</h3><p className="mt-1 text-[10px] leading-4 text-[#61738a]">{activity.description}</p><p className="mt-2 text-[9px] text-[#5b8199]">{activity.season}</p><div className="mt-3 flex items-center justify-between"><a href={activity.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-medium text-[#5b8199]">Learn more <ArrowUpRight className="h-3 w-3"/></a><Link to={activity.to} className="rounded-full bg-[#5b8199] px-3.5 py-2 text-[10px] font-semibold text-white">Buy Now</Link></div></div></article>)}</div>
      </main>;
      return <><main className="space-y-3 px-4 pb-6 pt-4">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Eat, stay and play categories">{RESORT_TABS.map(tabButton)}</div>
        <section className="space-y-3 rounded-[17px] border border-[#dce4ed] bg-white p-3 shadow-sm" aria-label="Stay search options">
          <div className="grid grid-cols-[1.35fr_0.8fr] gap-2">
            <label className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-[#718096]">Check in<input type="date" value={accommodationSearch.checkIn} min={accommodationISODate(new Date())} onChange={(event) => { if (event.target.value) setAccommodationSearch((old) => ({ ...old, checkIn: event.target.value })); }} className="mt-1 h-10 w-full rounded-[11px] border border-[#dce4ed] bg-[#f7f9fc] px-2 text-[10px] font-normal normal-case tracking-normal text-[#344a64]"/></label>
            <label className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-[#718096]">Nights<select value={accommodationSearch.nights} onChange={(event) => setAccommodationSearch((old) => ({ ...old, nights: Number(event.target.value) }))} className="mt-1 h-10 w-full rounded-[11px] border border-[#dce4ed] bg-[#f7f9fc] px-2 text-[10px] font-normal normal-case tracking-normal text-[#344a64]">{Array.from({ length: 14 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value} {value === 1 ? 'night' : 'nights'}</option>)}</select></label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[['Adults', 'adults', 1, 10], ['Children', 'children', 0, 10], ['Infants', 'infants', 0, 5]].map(([label, key, min, max]) => <label key={key} className="block text-[9px] font-semibold text-[#718096]">{label}<select value={accommodationSearch[key]} onChange={(event) => setAccommodationSearch((old) => ({ ...old, [key]: Number(event.target.value) }))} className="mt-1 h-9 w-full rounded-[10px] border border-[#dce4ed] bg-[#f7f9fc] px-2 text-[10px] font-normal text-[#344a64]">{Array.from({ length: Number(max) - Number(min) + 1 }, (_, index) => Number(min) + index).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>)}
          </div>
          <label className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-[#718096]">Currency<select value={accommodationSearch.currency} onChange={(event) => setAccommodationSearch((old) => ({ ...old, currency: event.target.value }))} className="mt-1 h-10 w-full rounded-[11px] border border-[#dce4ed] bg-[#f7f9fc] px-2 text-[10px] font-normal normal-case tracking-normal text-[#344a64]">{[['NZD', 'New Zealand dollar'], ['AUD', 'Australian dollar'], ['USD', 'US dollar'], ['GBP', 'British pound'], ['CNY', 'Chinese yuan']].map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}</select></label>
          <p className="text-[9px] leading-4 text-[#718096]">Currency conversions are sample demo rates. Checkout uses NZD.</p>
        </section>
        <div className="flex items-end justify-between px-1"><div><h2 className="font-serif text-[16px] font-bold text-[#344a64]">Available accommodation</h2><p className="mt-1 text-[9px] text-[#718096]">Select a stay to see your demo total.</p></div><span className="text-[9px] text-[#718096]">{ACCOMMODATION_CARDS.length} stays</span></div>
        <div className="space-y-3">{ACCOMMODATION_CARDS.map((stay) => {
          const status = state.accommodationUnits?.[stay.roomNumber] || 'Available';
          const canBook = status === 'Available';
          const quantity = Number(accommodationQuantities[stay.roomNumber] || 0);
          const dates = Array.from({ length: Number(accommodationSearch.nights) }, (_, index) => accommodationDateValue(accommodationSearch.checkIn, index));
          const displayMoney = (nzd) => new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-NZ', { style: 'currency', currency: accommodationSearch.currency, maximumFractionDigits: 0 }).format(nzd * DEMO_CURRENCY_RATES[accommodationSearch.currency]);
          return <article key={stay.roomNumber} className="overflow-hidden rounded-[17px] border border-[#dce4ed] bg-white shadow-sm">
            <img src={stay.image} alt={stay.name} className="h-[145px] w-full object-cover"/>
            <div className="space-y-3 p-3">
              <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="font-serif text-[14px] font-semibold leading-5 text-[#344a64]">{stay.name}</h3><p className="mt-1 text-[9px] text-[#718096]">{stay.guests} <span className="mx-1">·</span> {stay.details[0]}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-semibold ${status === 'Available' ? 'bg-[#e7f4ee] text-[#18845d]' : 'bg-[#edf2f7] text-[#718096]'}`}>{status === 'Occupied' ? 'Sold' : status}</span></div>
              <details className="group text-[9px] text-[#718096]"><summary className="cursor-pointer font-semibold text-[#5b8199]">More info</summary><p className="mt-2 leading-4">{stay.description}</p><ul className="mt-1 space-y-1">{stay.details.map((detail) => <li key={detail}>• {detail}</li>)}</ul></details>
              <div className="rounded-[12px] bg-[#f7f9fc] p-2.5"><div className="mb-2 flex items-center justify-between"><span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#718096]">Nightly availability</span><span className="text-[9px] text-[#718096]">{accommodationSearch.nights} nights</span></div><div className="flex gap-1.5 overflow-x-auto pb-0.5">{dates.map((date) => <div key={date.toISOString()} className="min-w-[78px] flex-1 rounded-[9px] border border-[#e1e7ee] bg-white px-1.5 py-2 text-center"><span className="block text-[8px] text-[#718096]">{formatAccommodationDate(date, lang)}</span><span className={`mt-1 block text-[8px] font-bold ${status === 'Available' ? 'text-[#18845d]' : status === 'Maintenance' ? 'text-[#718096]' : 'text-[#b54750]'}`}>{status === 'Available' ? 'Available' : status === 'Occupied' ? 'Sold' : 'Closed'}</span></div>)}</div></div>
              <div className="flex items-center justify-between gap-2"><span><b className="block font-serif text-[17px] font-semibold text-[#344a64]">{displayMoney(stay.nightlyRate || 860)}</b><small className="text-[8px] text-[#718096]">per night · {accommodationSearch.currency}</small></span><label className="flex items-center gap-2 text-[9px] text-[#718096]">Qty<select aria-label={`Quantity for ${stay.name}`} disabled={!canBook} value={quantity} onChange={(event) => setAccommodationQuantities(event.target.value === '1' ? { [stay.roomNumber]: 1 } : {})} className="h-9 rounded-[10px] border border-[#dce4ed] bg-white px-2 text-[10px] text-[#344a64] disabled:bg-[#f1f4f7]">{[0, 1].map((value) => <option key={value} value={value}>{value}</option>)}</select></label></div>
            </div>
          </article>;
        })}</div>
        {chosenAccommodation && <div className="sticky bottom-0 -mx-4 mt-1 border-t border-[#dce4ed] bg-white/95 px-4 py-3 shadow-[0_-5px_18px_rgba(30,48,68,0.08)] backdrop-blur"><div className="mb-2 flex items-center justify-between gap-2"><span className="min-w-0 text-[9px] text-[#718096]">{chosenAccommodation.name} · {accommodationSearch.nights} nights</span><b className="shrink-0 font-serif text-[16px] text-[#344a64]">{new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-NZ', { style: 'currency', currency: accommodationSearch.currency, maximumFractionDigits: 0 }).format((chosenAccommodation.nightlyRate || 860) * Number(accommodationSearch.nights) * DEMO_CURRENCY_RATES[accommodationSearch.currency])}</b></div><button onClick={() => startAccommodationBooking(chosenAccommodation)} className="h-11 w-full rounded-full bg-[#5b8199] text-[11px] font-semibold text-white">Continue booking</button></div>}
        <p className="px-2 pb-3 text-center text-[9px] leading-4 text-[#718096]">Demo room availability and sample rates only. Check the official site for live inventory and pricing.</p>
      </main>{accommodationBooking && <AccommodationBookingDialog booking={accommodationBooking} onChange={updateAccommodationBooking} onUnitTypeChange={(unitType) => { const stay = ACCOMMODATION_CARDS.find((item) => item.name === unitType); setAccommodationBooking((old) => ({ ...old, stay, unitType: stay.name, roomNumber: stay.roomNumber, nightlyRate: String(stay.nightlyRate || 860), status: state.accommodationUnits?.[stay.roomNumber] || 'Available' })); }} nights={reservationNights} total={reservationTotal} onCancel={() => setAccommodationBooking(null)} onReview={() => updateAccommodationBooking('step', 'review')} onConfirm={confirmAccommodationBooking}/>}</>;

    }

    if (path === '/book') return <main className="space-y-3 px-4 pb-6 pt-4">
      <Link to="/lessons" className="block rounded-[16px] bg-gradient-to-br from-[#58778e] to-[#1d2b40] p-4 text-white">
        <span className="flex items-center justify-between text-[9px] tracking-[0.2em] text-white/70">NEW TO THE SNOW? <GraduationCap className="h-4 w-4" /></span>
        <b className="mt-2 block font-serif text-[20px]">Your first turns start here.</b>
        <span className="mt-2 flex items-center gap-1 text-[11px]">Explore first-timer packages <ArrowRight className="h-3.5 w-3.5" /></span>
      </Link>

      <Link to="/passes" className="block rounded-[16px] bg-gradient-to-br from-[#58778e] to-[#1d2b40] p-4 text-white">
        <div className="flex items-center justify-between text-[8px] tracking-[0.2em] text-white/70"><span className="rounded-full bg-white/15 px-2.5 py-1 tracking-normal">2027 season passes</span><span>LIMITED TIME</span></div>
        <h2 className="mt-3 font-serif text-[19px] italic">2027 season passes on pre-sale</h2>
        <p className="mt-1 text-[11px] leading-4 text-white/75">Early-bird price · Unlimited all season · Treble Cone included</p>
        <div className="mt-3 flex items-center justify-between text-[10px]"><span>◷ Ends in&nbsp; 18d 06:42:11</span><span className="rounded-full bg-white px-3 py-1.5 text-[#5b8199]">View passes →</span></div>
      </Link>

      <section className="grid grid-cols-2 gap-2">
        {[['Lessons', GraduationCap, 'Private, group & kids', '/lessons'], ['Rentals', Package, 'Skis, boards & gear', '/rentals'], ['Transport', Bus, 'Pickup & return travel', '/transport'], ['Stay', BedDouble, 'On-mountain escapes', '/resort?tab=stays']].map(([label, Icon, detail, to]) => <Link key={label} to={to} className="rounded-[16px] border border-[#dce4ed] bg-white p-3.5 text-[#344a64]"><div className="flex items-center justify-between"><Icon className="h-4 w-4 text-[#5b8199]"/><ArrowUpRight className="h-3.5 w-3.5 text-[#9aa8b8]"/></div><b className="mt-2 block text-[12px]">{label}</b><small className="mt-1 block text-[10px] text-[#718096]">{detail}</small></Link>)}
      </section>

      <Link to="/passes?season=summer" className="flex items-center gap-3 rounded-[16px] border border-[#dce4ed] bg-[#eaf0f6] p-3 text-[#344a64]"><Bike className="h-5 w-5 text-[#526d8b]"/><span className="min-w-0 flex-1"><b className="block text-[11px]">Planning a summer visit?</b><small className="block text-[10px] text-[#718096]">Mountain biking, carting & sightseeing</small></span><ChevronRight className="h-4 w-4"/></Link>
      <div className="flex items-center justify-between px-1 text-[10px] text-[#718096]"><span>Just need a lift pass?</span><Link to="/passes" className="font-semibold text-[#5b8199]">Find your pass <ArrowRight className="ml-1 inline h-3 w-3"/></Link></div>
      <section className="grid grid-cols-2 gap-2">{[['Ski booking', Ticket, 'Passes · Lessons · Rentals', '/passes'], ['Mountain shop', ShoppingBag, 'New arrivals · Apparel accessories', '/shop']].map(([label, Icon, detail, to]) => <Link key={label} to={to} className="min-h-[150px] rounded-[16px] bg-gradient-to-br from-[#58778e] to-[#1d2b40] p-3.5 text-white"><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><Icon className="h-5 w-5"/></span><ArrowUpRight className="h-4 w-4 text-white/60"/></div><b className="mt-4 block font-serif text-[16px]">{label}</b><small className="mt-1 block text-[10px] text-white/75">{detail}</small>{label === 'Ski booking' && <span className="mt-2 inline-block rounded-full bg-white/15 px-2.5 py-1 text-[9px]">Live inventory</span>}{label === 'Mountain shop' && <span className="mt-2 inline-block rounded-full bg-white/15 px-2.5 py-1 text-[9px]">Retail</span>}</Link>)}</section>
    </main>;

    if (path === '/passes') return <main className="space-y-4 px-4 pb-6 pt-5 sm:px-8"><div className="flex gap-2 overflow-x-auto pb-1">{['All', 'Lift pass', 'Packages', 'Summer', 'Winter'].map((f) => <button onClick={() => setFilter(f)} key={f} className={`shrink-0 rounded-full px-4 py-2.5 text-[14px] ${filter === f ? 'bg-[#5b8199] text-white' : 'bg-[#f0f1f3] text-[#68717f]'}`}>{f}</button>)}<button className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0f1f3]" aria-label="Cart" onClick={() => navigate('/cart')}><ShoppingBag className="h-5 w-5" /><span className="sr-only">{cartCount}</span></button><button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0f1f3]" aria-label="Favorites" onClick={() => setFilter('Favorites')}><Heart className="h-5 w-5" /></button></div>{filter === 'All' || filter === 'Winter' || filter === 'Packages' || (filter === 'Favorites' && state.favorites.includes(pass.id)) ? <article className="overflow-hidden rounded-[18px] border border-[#e0e3e7] bg-white shadow-sm"><div className="relative"><img src={pass.image} alt="Family skiing at Cardrona" className="h-[150px] w-full object-cover"/><span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-[10px] text-white">Packages</span><button onClick={() => toggleFavorite(pass.id)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white" aria-label="Save pass"><Heart className={`h-5 w-5 ${state.favorites.includes(pass.id) ? 'fill-[#5b8199] text-[#5b8199]' : ''}`} /></button></div><div className="p-3"><h2 className="font-serif text-[16px] font-bold">{pass.name}</h2><p className="mt-1 text-[10px] leading-5 text-[#68717f]">{pass.description} Prices starting from $1,029.</p><p className="mt-2 flex items-center gap-2 text-[10px] text-[#68717f]"><Clock3 className="h-4 w-4" />Winter 27 season</p></div><div className="flex items-center justify-between gap-3 p-3"><span><strong className="font-serif text-[16px] font-normal text-[#5b8199]">{money(1029)}</strong><small className="block text-[10px] text-[#718096]">from / season pass</small></span><button onClick={() => navigate('/configure-pass')} className="flex h-10 items-center gap-2 rounded-full bg-[#5b8199] px-4 text-[12px] font-semibold text-white">Buy Now <ArrowRight className="h-4 w-4" /></button></div></article> : null}{(filter === 'All' || filter === 'Winter' || filter === 'Packages') && <article className="overflow-hidden rounded-[18px] border border-[#dce4ed] bg-white shadow-sm"><img src={WINTER_EARLYBIRD_MULTI_DAY.image} alt="Snowboarder riding Cardrona terrain park" className="h-[170px] w-full object-cover object-[center_25%]"/><div className="p-4"><span className="rounded-full bg-[#e3ebf4] px-2.5 py-1 text-[10px] text-[#526d8b]">Winter · Earlybird</span><h2 className="mt-3 font-serif text-[17px] font-bold text-[#344a64]">{WINTER_EARLYBIRD_MULTI_DAY.name}</h2><p className="mt-1 text-[11px] leading-5 text-[#718096]">{WINTER_EARLYBIRD_MULTI_DAY.description}</p><div className="mt-3 flex items-center justify-between"><b className="font-serif text-[17px] font-normal text-[#5b8199]">From NZ$250</b><button onClick={() => navigate(WINTER_EARLYBIRD_MULTI_DAY.to)} className="rounded-full bg-[#5b8199] px-3 py-2 text-[10px] font-semibold text-white">Buy Now <ArrowRight className="ml-1 inline h-3 w-3"/></button></div></div></article>}{(filter === 'All' || filter === 'Lift pass' || filter === 'Winter') && <section className="space-y-3"><div><h2 className="font-serif text-[22px] font-bold text-[#24344b]">Lift passes</h2><p className="mt-1 text-[11px] text-[#718096]">Choose the pass that suits your day · 2026 pricing</p></div><div className="space-y-3">{WINTER_DAY_PASSES.map((option) => { const expanded = expandedLiftPass !== option.id; return <article key={option.id} className="rounded-[17px] border border-[#dce4ed] bg-gradient-to-b from-white to-[#e8eff8] p-4 shadow-sm"><span className="text-[9px] font-bold tracking-[0.12em] text-[#5a6c84]">LIFT PASS</span><div className="mt-1 flex items-start justify-between gap-2"><h3 className="font-serif text-[16px] font-bold text-[#33445e]">{option.name}</h3><strong className="shrink-0 font-serif text-[19px] font-semibold text-[#486577]">{option.priceLabel || money(option.price)}</strong></div><p className="mt-1 text-[9px] text-[#8794a5]">2026 pricing</p><ul className="mt-3 space-y-1.5">{(expanded ? option.details : option.details.slice(0, 1)).map((detail) => <li key={detail} className="flex gap-2 text-[10px] leading-4 text-[#344a64]"><span className="text-[#5b8199]">✓</span><span>{detail}</span></li>)}</ul><div className="mt-3"><button onClick={() => setExpandedLiftPass(expanded ? '' : option.id)} className="text-[10px] font-medium text-[#5b8199]">{expanded ? 'Show less' : 'Learn more'} ↗</button></div></article>; })}</div></section>}{(filter === 'All' || filter === 'Summer') && <article className="overflow-hidden rounded-[22px] border border-[#dce4ed] bg-white shadow-sm"><div className="relative"><img src={resortPhotos.hiking} alt="Summer sightseeing at Cardrona" className="h-[180px] w-full object-cover"/><span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[11px] text-white">Sightseeing</span></div><div className="p-4"><h2 className="font-serif text-[20px] font-bold">Summer Sightseeing Pass</h2><p className="mt-1 text-[12px] leading-5 text-[#718096]">Enjoy alpine views and choose a scenic gondola uplift at McDougall’s Chondola.</p><div className="mt-3 flex items-center justify-between"><span><b className="font-serif text-[22px] font-normal text-[#5b8199]">NZ$35.00</b><small className="block text-[10px] text-[#718096]">Adult · includes 1 uplift</small></span><button onClick={() => navigate('/configure-pass?product=sightseeing')} className="flex h-10 items-center gap-2 rounded-full bg-[#5b8199] px-4 text-[12px] font-semibold text-white">Buy Now <ArrowRight className="h-4 w-4" /></button></div></div></article>}{(filter === 'All' || filter === 'Summer') && SUMMER_PRODUCTS.map((item) => <article key={item.id} className="overflow-hidden rounded-[18px] border border-[#dce4ed] bg-white shadow-sm"><img src={item.image} alt={`${item.name} at Cardrona`} className="h-[170px] w-full object-cover"/><div className="p-4"><span className="rounded-full bg-[#e3ebf4] px-2.5 py-1 text-[10px] text-[#526d8b]">Summer</span><h2 className="mt-3 font-serif text-[17px] font-bold text-[#344a64]">{item.name}</h2><p className="mt-1 text-[11px] leading-5 text-[#718096]">{item.description}</p><div className="mt-3 flex items-center justify-between"><b className="font-serif text-[17px] font-normal text-[#5b8199]">{item.price}</b><button onClick={() => navigate(item.to)} className="rounded-full bg-[#5b8199] px-3 py-2 text-[10px] font-semibold text-white">Buy Now <ArrowRight className="ml-1 inline h-3 w-3"/></button></div></div></article>)}{filter === 'Favorites' && !state.favorites.includes(pass.id) && <p className="py-12 text-center text-[#68717f]">No saved passes yet.</p>}</main>;

    if (path === '/bike-configure') return <BikePackageConfigurator cartTotal={cartTotal} onAdd={(item) => addToCart(item, item.quantity || 1, { detail: item.detail, variant: item.variant, visitDate: item.visitDate, ageBand: item.ageBand })} onCheckout={() => { setBookingStep(0); navigate('/checkout'); }} />;

    if (path === '/configure-pass') {
      if (productId === 'earlybird-multi-day') return <><Stepper current={0} lang={lang}/><EarlybirdMultiDayPassConfigurator image={WINTER_EARLYBIRD_MULTI_DAY.image} onAdd={(item) => { addToCart(item, item.quantity, { detail: item.detail, variant: item.variant, ageBand: item.ageBand }); navigate('/cart'); }} /></>;
      if (isSightseeing) return <><Stepper current={0} lang={lang}/><SightseeingConfigurator cartTotal={cartTotal} onAdd={(item) => addToCart(item, item.quantity || 1, { detail: item.detail, variant: item.variant, visitDate: item.visitDate, ageBand: item.ageBand })} onCheckout={() => { setBookingStep(0); navigate('/checkout'); }} /></>;
      if (productId) return <><Stepper current={0} lang={lang}/><SummerProductConfigurator productId={productId} cartTotal={cartTotal} onAdd={(item) => addToCart(item, item.quantity || 1, { detail: item.detail, variant: item.variant, visitDate: item.visitDate, ageBand: item.ageBand, replaceKey: item.replaceKey })} onCheckout={() => { setBookingStep(0); navigate('/checkout'); }} /></>;
      return <><Stepper current={0} lang={lang}/><WinterSeasonPassBooking onAdd={(item) => { addToCart(item, item.quantity || 1, { detail: item.detail, variant: item.variant, ageBand: item.ageBand }); navigate('/cart'); }} /></>;
    }

    if (path === '/checkout') return <><Stepper current={bookingStep + 2} lang={lang}/><main className="space-y-6 overflow-x-hidden px-4 pb-[160px] sm:px-8 sm:pb-[260px]"><section className="rounded-[22px] border border-[#e0e3e7] bg-white p-4 sm:p-7"><h2 className="font-serif text-[23px] font-bold sm:text-[32px]">Order summary</h2>{state.cart.length > 0 ? <div className="mt-4 space-y-3">{state.cart.map((item) => <div key={item.key} className="flex items-start justify-between gap-3 border-b border-[#e6edf4] pb-3 text-[13px]"><span className="min-w-0"><b className="block">{item.quantity} × {item.name}</b>{item.detail && <small className="mt-1 block text-[#718096]">{item.detail}</small>}</span><b className="shrink-0">{money(item.price * item.quantity)}</b></div>)}<p className="flex justify-between gap-3 pt-1 text-[14px] font-semibold"><span>Total due</span><span>{money(bookingTotal)}</span></p></div> : <p className="mt-3 text-[14px] text-[#68717f]">{passType} · {age} · {money(configuredPassTotal)} · {paymentPlan}</p>}</section>{bookingStep === 0 ? <><section><h3 className="flex items-center gap-2 text-[18px] font-semibold sm:text-[24px]"><CalendarDays className="h-5 w-5 text-[#5b8199] sm:h-7 sm:w-7"/>Visit details</h3>{state.cart.length > 0 ? <p className="mt-4 text-[13px] text-[#68717f]">{bookingDates.length ? (bookingDates.length === 1 ? 'Selected visit date: ' : 'Selected visit dates: ') : ''}{bookingDates.length ? bookingDates.join(', ') : 'No visit date is required for these items.'}</p> : <><div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4">{[['From', dateFrom, setDateFrom], ['To', dateTo, setDateTo]].map(([label, value, setValue]) => <label key={label} className="min-w-0 text-[13px] text-[#68717f] sm:text-[19px]">{label}<input type="date" value={value} min={dateFrom} onChange={(e) => setValue(e.target.value)} className="mt-2 h-14 min-w-0 w-full rounded-[17px] border border-[#dfe2e6] bg-white px-3 text-[14px] text-[#20242b] shadow-sm sm:mt-3 sm:h-[86px] sm:px-5 sm:text-[20px]" /></label>)}</div><p className="mt-2 text-[13px] text-[#68717f] sm:mt-3 sm:text-[18px]">{dateFrom} – {dateTo}</p></>}</section>{state.cart.length > 0 ? <section><h3 className="text-[18px] font-semibold sm:text-[24px]">Items in this order</h3><p className="mt-3 text-[13px] text-[#68717f]">{bookingQuantity} {bookingQuantity === 1 ? 'item' : 'items'} are included in the order.</p></section> : <section><h3 className="text-[18px] font-semibold sm:text-[24px]">Guests</h3><div className="mt-3 flex items-center gap-4 sm:mt-4 sm:gap-6"><button aria-label="Remove guest" onClick={() => changeBookingGuests(-1)} className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#dfe2e6] text-[#68717f] sm:h-20 sm:w-20"><Minus className="sm:h-7 sm:w-7"/></button><b className="min-w-8 text-center text-[20px] sm:min-w-10 sm:text-[27px]">{guests}</b><button aria-label="Add guest" onClick={() => changeBookingGuests(1)} className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#dfe2e6] text-[#68717f] sm:h-20 sm:w-20"><Plus className="sm:h-7 sm:w-7"/></button><span className="ml-auto text-right text-[13px] text-[#68717f] sm:text-[18px]">Order subtotal<br/>{money(bookingTotal)}</span></div></section>}<section className="rounded-[20px] border border-[#e0e3e7] bg-white p-4"><h3 className="font-serif text-[19px] font-bold sm:text-[23px]">Order details</h3><p className="mt-2 text-[14px] leading-6 text-[#68717f] sm:text-[17px]">Your selected products and options will be confirmed in the demo checkout.</p></section></> : bookingStep === 1 ? <section className="space-y-4 rounded-[22px] border border-[#dce4ed] bg-white p-4">
      <h3 className="font-serif text-[22px] font-bold">Guest details</h3>
      {Array.from({ length: checkoutGuestCount }, (_, i) => <div key={i} className="space-y-3 rounded-xl bg-[#f5f8fb] p-3.5">
        <b className="text-[13px]">Guest {i + 1}</b>
        <label className="block text-[11px] text-[#60738d]">Passport name (pinyin) *<input placeholder="e.g. CHEN WEI" className="mt-1.5 h-11 w-full rounded-xl border border-[#dce4ed] bg-white px-3 text-[13px]" /></label>
        <label className="block text-[11px] text-[#60738d]">Legal name (as on passport) *<input placeholder="e.g. Wei Chen" className="mt-1.5 h-11 w-full rounded-xl border border-[#dce4ed] bg-white px-3 text-[13px]" /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-[11px] text-[#60738d]">Date of birth *<input type="date" className="mt-1.5 h-11 w-full rounded-xl border border-[#dce4ed] bg-white px-2 text-[12px]" /></label>
          <label className="block text-[11px] text-[#60738d]">Nationality *<select className="mt-1.5 h-11 w-full rounded-xl border border-[#dce4ed] bg-white px-2 text-[12px]"><option>Select</option><option>New Zealand</option><option>China</option><option>Australia</option></select></label>
          <label className="block text-[11px] text-[#60738d]">Phone *<input type="tel" placeholder="+64 ..." className="mt-1.5 h-11 w-full rounded-xl border border-[#dce4ed] bg-white px-3 text-[12px]" /></label>
          <label className="block text-[11px] text-[#60738d]">Email *<input type="email" placeholder="For your e-ticket" className="mt-1.5 h-11 w-full rounded-xl border border-[#dce4ed] bg-white px-3 text-[12px]" /></label>
        </div>
      </div>)}
      <div className="rounded-xl border border-dashed border-[#cbd7e4] bg-[#fbfcfe] p-4 text-center text-[11px] text-[#718096]">Sign here <span className="mt-2 block text-[10px]">Signature demonstration area</span></div>
      <label className="flex items-start gap-2 text-[11px] leading-5 text-[#60738d]"><input type="checkbox" className="mt-1 accent-[#5b8199]" />I have read and agree to the terms that apply to the products in my order.</label>
      <p className="rounded-xl bg-[#f1f6fa] p-3 text-[10px] leading-4 text-[#718096]">Demo form only. Guest details and signatures are not saved or sent.</p>
    </section> : bookingStep === 2 ? <section className="space-y-4 rounded-[22px] border border-[#dce4ed] bg-white p-4">
      <div><h3 className="font-serif text-[22px] font-bold">Choose a payment method</h3><p className="mt-1 text-[11px] text-[#718096]">Tap one to select it. This is a demo checkout.</p></div>
      {[
        ['wechat', 'WeChat Pay', 'Scan or pay right inside WeChat', MessageSquare],
        ['card', 'Credit card / Visa / Mastercard', 'International cards, 3-D Secure supported', Ticket],
      ].map(([key, label, detail, Icon]) => <button key={key} type="button" onClick={() => setPayMethod(key)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${payMethod === key ? 'border-[#5b8199] bg-[#e7eef6]' : 'border-[#dce4ed] bg-[#f1f6fa]'}`}>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${payMethod === key ? 'bg-[#5b8199] text-white' : 'bg-[#e3ebf4] text-[#526d8b]'}`}><Icon className="h-4 w-4" /></span><span><b className="block text-[12px]">{label}</b><small className="text-[10px] text-[#718096]">{detail}</small></span><span className={`ml-auto h-4 w-4 rounded-full border ${payMethod === key ? 'border-[#5b8199] bg-[#5b8199] ring-2 ring-white' : 'border-[#bdc9d7]'}`} />
      </button>)}
      {payMethod === 'card' && <div className="space-y-2 rounded-xl border border-[#dce4ed] p-3"><div className="flex justify-between text-[11px]"><span>Card details</span><span className="text-[#718096]">3-D Secure</span></div><div className="rounded-lg border border-[#dce4ed] px-3 py-2 font-mono text-[12px] text-[#526d8b]">4242 4242 4242 4242</div><div className="grid grid-cols-2 gap-2"><div className="rounded-lg border border-[#dce4ed] px-3 py-2 text-[12px] text-[#718096]">MM/YY</div><div className="rounded-lg border border-[#dce4ed] px-3 py-2 text-[12px] text-[#718096]">CVC</div></div><p className="text-[10px] text-[#718096]">Sample card preview. Card information is not collected.</p></div>}
      <div className="rounded-xl bg-[#f1f6fa] p-3 text-[11px] text-[#60738d]"><ShieldCheck className="mr-1 inline h-4 w-4 text-emerald-600"/>Secure demo checkout. No payment will be taken.</div>
      <label className="flex items-center gap-2 text-[12px]"><input type="checkbox" defaultChecked className="accent-[#5b8199]"/>I accept the booking terms</label>
    </section> : <section className="space-y-4 py-3 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check className="h-8 w-8"/></span><h3 className="font-serif text-[24px] font-bold">Booking confirmed</h3><p className="text-[12px] text-[#68717f]">Your e-ticket is ready. Scan it at the lift gate.</p>
      <article className="overflow-hidden rounded-[18px] border border-[#dce4ed] bg-white text-left"><div className="bg-gradient-to-br from-[#45688c] to-[#17283f] px-4 py-3 text-white"><small>Order no.</small><b className="block font-mono text-[14px]">{confirmedOrder?.id || 'DEMO-ORDER'}</b></div><div className="space-y-2 p-4 text-[11px]"><div className="flex justify-between gap-2"><span className="text-[#718096]">Items</span><b className="text-right">{bookingName}</b></div><div className="flex justify-between"><span className="text-[#718096]">Visit date</span><b>{checkoutDate}</b></div><div className="flex justify-between"><span className="text-[#718096]">Payment method</span><b>{payMethod === 'wechat' ? 'WeChat Pay' : 'Credit card'}</b></div><div className="flex justify-between border-t border-dashed pt-2"><span className="text-[#718096]">Total (simulated)</span><b className="font-serif text-[18px] text-[#5b8199]">{money(bookingTotal)}</b></div></div></article>
      <div className="rounded-[18px] border border-[#dce4ed] bg-white p-4"><p className="mb-3 text-[11px] text-[#718096]">Ticket QR code (simulated)</p><div className="mx-auto w-fit rounded-xl border border-[#dce4ed] p-2"><QRCodeSVG value={confirmedOrder?.id || 'SKI-DEMO-ORDER'} size={148} fgColor="#344a64" /></div><p className="mt-2 font-mono text-[10px] tracking-wider text-[#60738d]">{confirmedOrder?.id || 'SKI-DEMO-ORDER'}</p></div>
      <p className="text-[10px] leading-4 text-[#718096]">Demo order only. No payment was taken and this QR code is not a valid product or lift ticket.</p><button onClick={() => navigate('/orders')} className="rounded-full bg-[#5b8199] px-6 py-3 text-[13px] font-semibold text-white">View my orders</button>
    </section>}</main>{bookingStep < 3 && actionBar(bookingStep === 2 ? 'Confirm demo booking' : 'Continue', () => { if (bookingStep === 2) { const order = { id: `DEMO-${Date.now().toString().slice(-6)}`, name: bookingName, date: bookingDates[0] || dateFrom, visit_dates: bookingDates, total: bookingTotal, payment_method: payMethod === 'wechat' ? 'WeChat Pay' : 'Credit card', status: 'Confirmed' }; setConfirmedOrder(order); setState((old) => ({ ...old, orders: [order, ...old.orders], cart: [] })); setBookingStep(3); } else setBookingStep((step) => step + 1); }, bookingTotal)}</>;

    if (path === '/cart') return <><Stepper current={1} lang={lang}/><main className="space-y-5 px-4 pb-6 pt-5 sm:px-8"><h2 className="font-serif text-[34px]">Cart</h2>{state.cart.length === 0 ? <section className="rounded-[22px] border bg-white px-5 py-10 text-center"><ShoppingBag className="mx-auto h-9 w-9 text-[#a1a6af]"/><p className="mt-3 text-[#68717f]">Your cart is empty.</p><Link to="/passes" className="mt-5 inline-flex rounded-full bg-[#5b8199] px-5 py-3 text-white">Explore passes</Link></section> : <>{state.cart.map((item) => <article key={item.key} className="overflow-hidden rounded-[22px] border border-[#e0e3e7] bg-white"><div className="bg-[#f1f1f3] px-4 py-3 text-[12px] font-semibold tracking-[0.15em] text-[#68717f]">UNASSIGNED</div><div className="p-4"><div className="flex items-start justify-between gap-3"><b className="text-[17px]">{item.name}</b><b className="shrink-0">{money(item.price * item.quantity)}</b></div>{item.detail && (item.id === 'summer-sightseeing-pass' ? <div className="mt-2 flex flex-wrap gap-1.5">{item.detail.split(' · ').map((detail) => <span key={detail} className="rounded-full bg-[#f0f1f3] px-3 py-1 text-[12px] text-[#68717f]">{detail}</span>)}</div> : <p className="mt-2 inline-block rounded-full bg-[#f0f1f3] px-3 py-1 text-[12px] text-[#68717f]">{item.detail}</p>)}<div className="mt-3 flex items-center gap-4 text-[13px]">{item.id === 'earlybird-summer' ? <button onClick={() => navigate('/configure-pass?product=earlybird-summer', { state: { editCartKey: item.key, ageBand: item.ageBand } })} className="text-[#68717f] underline">EDIT</button> : <button onClick={() => announce(`${item.name}: details`)} className="text-[#68717f] underline">SHOW DETAILS</button>}<button onClick={() => updateQuantity(item.key, -item.quantity)} className="text-[#68717f] underline">REMOVE</button>{item.id !== 'earlybird-summer' && <div className="ml-auto flex items-center gap-2"><button aria-label="Decrease" onClick={() => updateQuantity(item.key, -1)}><Minus className="h-4 w-4"/></button><span>{item.quantity}</span><button aria-label="Increase" onClick={() => updateQuantity(item.key, 1)}><Plus className="h-4 w-4"/></button></div>}</div></div></article>)}<section className="rounded-[22px] border border-[#e0e3e7] bg-[#f6f7f8] p-5"><h3 className="font-serif text-[23px] font-bold">Order Summary</h3><div className="mt-4 flex justify-between text-[15px] text-[#68717f]"><span>Sub-Total</span><span>{money(cartTotal)}</span></div><div className="mt-4 flex items-center justify-between gap-2 text-[17px] font-semibold"><span>Total (incl GST)</span><span className="font-serif text-[27px] text-[#5b8199]">{money(total)}</span></div><button onClick={() => setDiscountOpen(true)} className="mt-4 h-12 w-full rounded-full border border-[#e0e3e7] bg-white font-medium shadow-sm">Apply Discount Code</button><button onClick={() => { setBookingStep(0); navigate('/checkout'); }} className="mt-3 h-14 w-full rounded-full bg-[#5b8199] text-[18px] font-semibold text-white">Checkout</button><button type="button" onClick={() => { setFilter('All'); navigate('/passes'); }} className="mt-5 block w-full text-center text-[13px] text-[#68717f] underline">CONTINUE SHOPPING</button></section></>}</main></>;

    if (path === '/shop' || path === '/retail') {
      const categories = ['New arrivals', 'All', 'Men', 'Women', 'Accessories'];
      const shown = products.filter((item) => (filter === 'All' || filter === 'New arrivals' || item.category === filter) && (filter !== 'Favorites' || state.favorites.includes(item.id)));
      return <><main className="px-4 pb-[150px] pt-4 sm:px-8 sm:pb-[220px]"><div className="flex gap-2 overflow-x-auto pb-2">{categories.map((item) => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-full px-4 py-2.5 text-[13px] ${filter === item ? 'bg-[#5b8199] text-white' : 'bg-[#f0f1f3] text-[#68717f]'}`}>{item}</button>)}<button type="button" disabled aria-disabled="true" aria-label="Cart unavailable" className="ml-auto flex h-10 w-10 shrink-0 cursor-not-allowed items-center justify-center rounded-full border border-[#d5d9de] bg-[#e9edf1] text-[#aeb8c1]"><ShoppingBag className="h-5 w-5"/><span className="absolute ml-9 -mt-7 rounded-full bg-[#aeb8c1] px-1 text-[10px] text-white">{cartCount}</span></button></div><div className="mb-3 flex gap-2 overflow-x-auto">{['All brands', 'CARDRONA CORNER', 'ICEBREAKER', 'BURTON'].map((item, i) => <button key={item} onClick={() => i && announce(`${item} selected`)} className={`shrink-0 rounded-full border px-3 py-2 text-[12px] ${i === 0 ? 'border-[#5b8199] text-[#5b8199]' : 'border-[#e0e3e7] text-[#68717f]'}`}>{item}</button>)}</div><div className="grid grid-cols-2 gap-3">{shown.map((item) => <article key={item.id} className="overflow-hidden rounded-[20px] border border-[#e0e3e7] bg-white"><div className="relative"><img src={item.image} alt={item.name} className="h-[180px] w-full bg-[#eff0f1] object-cover"/><span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-[11px] text-white">{item.category}</span><button onClick={() => toggleFavorite(item.id)} className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white" aria-label="Toggle favorite"><Heart className={`h-5 w-5 ${state.favorites.includes(item.id) ? 'fill-[#5b8199] text-[#5b8199]' : ''}`}/></button>{item.tag && <span className="absolute bottom-3 left-3 rounded-full bg-[#5b8199] px-3 py-1 text-[11px] text-white">{item.tag}</span>}</div><div className="p-3"><small className="text-[10px] tracking-[0.1em] text-[#68717f]">CARDRONA CORNER</small><h2 className="mt-1 min-h-[42px] text-[14px] font-medium leading-5">{item.name}</h2><p className="mt-2 font-serif text-[20px] text-[#5b8199]">{money(item.price)}</p><button type="button" disabled aria-disabled="true" className="mt-2 flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-[#aeb8c1] text-[14px] font-semibold text-white"><ShoppingBag className="h-4 w-4"/>Add to cart</button></div></article>)}</div></main><div className="absolute inset-x-0 bottom-[76px] z-20 mx-auto max-w-[430px] border-t bg-white/95 px-4 py-3 backdrop-blur sm:bottom-[120px]"><button type="button" disabled aria-disabled="true" className="flex h-14 w-full cursor-not-allowed items-center justify-between rounded-full bg-[#aeb8c1] px-5 text-white"><span className="flex items-center gap-3"><ShoppingBag className="h-5 w-5"/>Cart · {cartCount} items</span><b>{money(cartTotal)} <ArrowRight className="ml-2 inline h-5 w-5"/></b></button></div></>;
    }

    if (path === '/orders') {
      const records = [...state.orders.map((order) => ({ ...order, guests: order.guests || 1, category: order.category || (/rental|bike|shop/i.test(order.name) ? 'Mountain store' : 'Ski passes') })), ...DEMO_ORDERS];
      const filteredOrders = records.filter((order) => {
        if (ordersCategory !== 'All' && order.category !== ordersCategory) return false;
        if (ordersPeriod === 'Cancelled') return order.status.toLowerCase().includes('cancel');
        if (ordersPeriod === 'Past') return order.status === 'Redeemed' || order.date < '2026-11-12';
        return order.status !== 'Redeemed' && !order.status.toLowerCase().includes('cancel');
      });
      return <main className="space-y-3 px-4 pb-6 pt-4">
        <section><div className="flex items-center justify-between text-[9px] uppercase tracking-[0.16em] text-[#718096]"><span>Everything for your visit</span><span>{filteredOrders.length} demo orders</span></div><h2 className="mt-2 font-serif text-[23px] font-bold text-[#344a64]">Your plans, all together.</h2><p className="mt-1 text-[11px] text-[#718096]">Tickets, confirmations and the details that matter.</p></section>
        <div className="grid grid-cols-3 rounded-full bg-[#e3ebf4] p-1">{['Upcoming', 'Past', 'Cancelled'].map((period) => <button key={period} onClick={() => { setOrdersPeriod(period); setVisibleOrders(3); }} className={`h-8 rounded-full text-[10px] ${ordersPeriod === period ? 'bg-white font-semibold text-[#344a64] shadow-sm' : 'text-[#718096]'}`}>{period}</button>)}</div>
        <div className="flex gap-2">{['All', 'Ski passes', 'Mountain store'].map((category) => <button key={category} onClick={() => { setOrdersCategory(category); setVisibleOrders(3); }} className={`rounded-full px-3 py-2 text-[10px] ${ordersCategory === category ? 'bg-[#5b8199] text-white' : 'bg-[#e3ebf4] text-[#718096]'}`}>{category}</button>)}</div>
        <div className="rounded-xl bg-[#e3ebf4] px-3 py-2 text-[9px] text-[#718096]">Includes eligible agent bookings made with discount codes</div>
        {filteredOrders.length ? <div className="space-y-2.5">{filteredOrders.slice(0, visibleOrders).map((order) => <article key={order.id} className="rounded-[17px] border border-[#dce4ed] bg-white p-3.5 shadow-sm"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="line-clamp-2 font-serif text-[13px] font-semibold text-[#344a64]">{order.name}</h3><p className="mt-1 font-mono text-[9px] text-[#718096]">{order.id}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[9px] ${order.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' : order.status === 'Redeemed' ? 'bg-[#e3ebf4] text-[#526d8b]' : 'bg-sky-50 text-sky-700'}`}>{order.status}</span></div><div className="mt-3 flex items-center justify-between text-[10px]"><span className="text-[#718096]">{order.date} · {order.guests} {order.guests === 1 ? 'guest' : 'guests'}</span><b className="font-serif text-[15px] font-normal text-[#5b8199]">{money(order.total)}</b></div><button onClick={() => announce(`E-ticket ${order.id} is ready in this demo`)} aria-label={`View ${order.id}`} className="mt-1 flex w-full justify-end text-[#718096]"><ChevronRight className="h-4 w-4"/></button></article>)}</div> : <p className="rounded-xl border border-[#dce4ed] bg-white p-8 text-center text-[12px] text-[#718096]">No orders in this view.</p>}
        {filteredOrders.length > visibleOrders && <button onClick={() => setVisibleOrders((count) => count + 5)} className="w-full rounded-full border border-[#dce4ed] bg-white py-2.5 text-[10px] text-[#526d8b]">Load more ({filteredOrders.length - visibleOrders} left)</button>}
      </main>;
    }

    if (path === '/account') {
      const isAgent = Boolean(state.agent);
      const signOutAgent = () => {
        setState((old) => { const next = { ...old }; delete next.agent; return next; });
        setAgentCentreOpen(false);
      };
      const loginAgent = (event) => {
        event.preventDefault();
        if (agentCode.trim().toUpperCase() !== 'AGENT-10') { setAgentError('That demo access code was not recognised.'); return; }
        setState((old) => ({ ...old, agent: { code: 'AGENT-10', name: '演示代理 Demo Agent', email: 'agent@cardrona.demo' } }));
        setAgentLoginOpen(false);
        setAgentCentreOpen(false);
      };
      const openAgentLogin = () => { setAgentCode(''); setAgentError(''); setAgentLoginOpen(true); };
      const accountRows = [['My bookings', 'Bookings and e-tickets', Ticket, '/orders'], ['Saved items', 'Saved passes and store items', Heart, '/shop'], ['Mountain info & help', 'Access, trails and FAQs', Headset, '/support']];
      return <>
        <main className="space-y-2.5 px-4 pb-8 pt-4 sm:px-8">
          <section className="rounded-[18px] border border-[#dce4ed] bg-white p-3.5">
            <div className="flex items-center gap-3">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border font-serif text-lg ${isAgent ? 'border-amber-300 bg-amber-100 text-amber-700' : 'border-transparent bg-[#e3ebf4] text-[#526d8b]'}`}>{isAgent ? '演' : 'G'}</span>
              <div className="min-w-0 flex-1"><b className="block truncate text-[13px] text-[#344a64]">{isAgent ? state.agent.name : 'Guest visitor'}</b><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] ${isAgent ? 'bg-amber-100 text-amber-800' : 'bg-[#e3ebf4] text-[#526d8b]'}`}>{isAgent ? '◉ Gold agent · 10% off' : 'Normal visitor'}</span></div>
              {isAgent && <button onClick={signOutAgent} className="rounded-full border border-[#dce4ed] px-2.5 py-1.5 text-[9px] text-[#718096]">Log out</button>}
            </div>
            {isAgent ? <p className="mt-2.5 truncate text-[9px] text-[#718096]">{state.agent.email} · {state.agent.code}</p> : <button onClick={openAgentLogin} className="mt-3 w-full border-t border-[#e6edf4] pt-3 text-center text-[11px] text-[#718096]">Already an agent? <span className="font-semibold text-[#5b8199]">Agent login</span></button>}
          </section>

          {isAgent && <section className="overflow-hidden rounded-[16px] border border-amber-300 bg-[#fffaf0]">
            <button onClick={() => setAgentCentreOpen((open) => !open)} aria-expanded={agentCentreOpen} className="flex w-full items-center gap-3 px-3.5 py-3 text-left"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><ShoppingBag className="h-4 w-4"/></span><span className="min-w-0 flex-1"><b className="block text-[12px] font-medium text-amber-900">Agent distribution centre</b><small className="mt-0.5 block text-[9px] text-amber-800/75">Commission, discount codes and booking links</small></span><ChevronRight className={`h-4 w-4 text-amber-700 transition-transform ${agentCentreOpen ? 'rotate-90' : ''}`}/></button>
            {agentCentreOpen && <div className="space-y-3 border-t border-amber-200 bg-[#fffdf8] p-3">
              <div className="rounded-[15px] border border-emerald-200 bg-emerald-50 p-3 text-[10px] text-emerald-900"><div className="flex items-start justify-between gap-2"><b>Gold Agent Applied · 10% discount active</b><button onClick={signOutAgent} className="shrink-0 rounded-full bg-white/80 px-2 py-1 text-[9px]">Sign out</button></div><p className="mt-1 text-[9px] text-emerald-800/70">{state.agent.name} · {state.agent.code}</p></div>
              <section className="rounded-[16px] border border-[#dce4ed] bg-white p-3.5"><span className="text-[8px] uppercase tracking-wide text-[#718096]">Total commission</span><b className="mt-0.5 block font-serif text-[25px] font-normal leading-none text-[#344a64]">NZ$0.00</b><div className="my-2.5 grid grid-cols-3 gap-1 border-t border-dashed border-[#dce4ed] pt-2.5 text-center"><div><small className="block text-[8px] text-[#718096]">Revenue from paid bookings</small><b className="mt-1 block text-[9px] font-normal text-[#344a64]">NZ$0.00</b></div><div><small className="block text-[8px] text-[#718096]">Paid bookings</small><b className="mt-1 block text-[9px] font-normal text-[#344a64]">0</b></div><div><small className="block text-[8px] text-[#718096]">Commission rate</small><b className="mt-1 block text-[9px] font-normal text-[#344a64]">8%</b></div></div><div className="flex items-center justify-between rounded-xl bg-[#e3ebf4] px-3 py-2 text-[9px] text-[#718096]"><span>Claimable</span><b className="font-serif text-[14px] font-normal text-[#344a64]">NZ$0.00</b></div><button disabled className="mt-2.5 flex h-9 w-full items-center justify-center gap-2 rounded-full bg-[#c9c9c9] text-[10px] font-semibold text-white disabled:cursor-not-allowed"><Ticket className="h-3.5 w-3.5"/>Claim commission</button><p className="mt-1.5 text-center text-[8px] text-[#718096]">Nothing to claim yet</p></section>
              <section><h3 className="font-serif text-[13px] text-[#344a64]">My discount codes</h3><div className="mt-1.5 rounded-[14px] border border-dashed border-[#dce4ed] bg-white/70 p-5 text-center text-[9px] text-[#718096]">No discount codes assigned yet</div></section>
              <section><h3 className="font-serif text-[13px] text-[#344a64]">Claim history</h3><div className="mt-1.5 rounded-[14px] border border-dashed border-[#dce4ed] bg-white/70 p-5 text-center text-[9px] text-[#718096]">No claims yet</div></section>
            </div>}
          </section>}

          <section className="overflow-hidden rounded-[16px] border border-[#dce4ed] bg-white text-[10px]"><div className="border-b border-[#e6edf4] px-3.5 py-3"><span className="block text-[#718096]">Email</span><span className="mt-0.5 block text-[11px] text-[#344a64]">{isAgent ? state.agent.email : 'Not signed in'}</span></div><div className="px-3.5 py-3"><span className="block text-[#718096]">Name</span><span className="mt-0.5 block text-[11px] text-[#344a64]">{isAgent ? state.agent.name : 'Browsing as guest'}</span></div></section>
          <section className="overflow-hidden rounded-[16px] border border-[#dce4ed] bg-white px-3.5">
            {accountRows.map(([label, detail, Icon, to]) => <button key={label} onClick={() => navigate(to)} className="flex w-full items-center gap-3 border-b border-[#e6edf4] py-3 text-left last:border-0"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#eaf0f6] text-[#5b8199]"><Icon className="h-3.5 w-3.5"/></span><span className="min-w-0"><b className="block text-[11px] font-medium text-[#344a64]">{label}</b><small className="mt-0.5 block text-[9px] text-[#718096]">{detail}</small></span><ChevronRight className="ml-auto h-4 w-4 shrink-0 text-[#718096]"/></button>)}
            {!isAgent && <button onClick={openAgentLogin} className="flex w-full items-center gap-3 border-b border-[#e6edf4] py-3 text-left"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#fff5d7] text-amber-700"><ShoppingBag className="h-3.5 w-3.5"/></span><span className="min-w-0"><b className="block text-[11px] font-medium text-[#344a64]">Agent distribution centre</b><small className="mt-0.5 block text-[9px] text-[#718096]">Commission, agent codes and booking links</small></span><ChevronRight className="ml-auto h-4 w-4 shrink-0 text-[#718096]"/></button>}
          </section>
          <p className="px-3 text-center text-[8px] leading-4 text-[#718096]">Demo build · payments and resort systems are simulated</p>
        </main>
        {agentLoginOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5"><form onSubmit={loginAgent} role="dialog" aria-modal="true" aria-labelledby="agent-login-title" className="w-full max-w-[360px] rounded-[18px] bg-[#f1f6fa] p-4 shadow-2xl"><div className="flex items-center justify-between"><h2 id="agent-login-title" className="font-serif text-[15px] font-bold text-[#344a64]">◎ Agent login</h2><button type="button" onClick={() => setAgentLoginOpen(false)} aria-label="Close agent login" className="text-[#718096]"><X className="h-4 w-4"/></button></div><p className="mt-2 text-[9px] text-[#718096]">Enter your agent access code to unlock agent net rates</p><input autoFocus value={agentCode} onChange={(event) => { setAgentCode(event.target.value); setAgentError(''); }} placeholder="E.g. AGENT-10" aria-label="Agent access code" className="mt-3 h-9 w-full rounded-[12px] border border-[#5d829a] bg-transparent px-3 font-mono text-[10px] text-[#344a64] outline-none focus:ring-2 focus:ring-[#5d829a]/20"/>{agentError && <p role="alert" className="mt-1.5 text-[9px] text-[#5b8199]">{agentError}</p>}<button type="submit" className="mt-2 h-9 w-full rounded-full bg-[#5b8199] text-[10px] font-semibold text-white">Sign in</button><p className="mt-2 text-center text-[8px] text-[#718096]">Demo code: AGENT-10</p></form></div>}
      </>;
    }

    if (path === '/account' || path === '/login' || path === '/register') return <main className="space-y-5 px-4 pb-8 pt-5 sm:px-8"><h2 className="font-serif text-[32px]">{path === '/register' ? 'Create your account' : path === '/login' ? 'Log in' : 'Welcome back'}</h2><section className="rounded-[22px] border bg-white p-5"><div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e7eef6] text-[#5b8199]"><UserRound className="h-7 w-7"/></span><div><b>Guest account</b><p className="text-[13px] text-[#68717f]">Sign in to manage bookings and passes</p></div></div><div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => announce('WeChat sign-in is a demo option')} className="h-12 rounded-xl border font-medium">Log in with WeChat</button><button onClick={() => navigate('/login')} className="h-12 rounded-xl border font-medium">Log in with number</button></div><label className="mt-5 block text-[14px]">Mobile number<input type="tel" placeholder="+64 21 000 0000" className="mt-2 h-12 w-full rounded-xl border px-3"/></label><button onClick={() => { setSmsSent(true); announce('Demo verification code: 123456'); }} className="mt-3 h-12 w-full rounded-xl bg-[#5b8199] font-semibold text-white">Send SMS code</button>{smsSent && <label className="mt-3 block text-[14px]">SMS verification code<input inputMode="numeric" maxLength={6} placeholder="Enter 123456 to continue" className="mt-2 h-12 w-full rounded-xl border px-3"/></label>}<Link to="/register" className="mt-4 block text-center text-[14px] text-[#5b8199]">Create an account</Link></section><section className="rounded-[20px] border bg-white p-4">{[['My bookings', Ticket], ['Saved items', Heart], ['Payment methods', ShoppingBag], ['Mountain help', Headset]].map(([label, Icon]) => <button key={label} onClick={() => label === 'Saved items' ? navigate('/shop') : label === 'My bookings' ? navigate('/orders') : navigate('/support')} className="flex w-full items-center gap-3 border-b py-4 text-left last:border-b-0"><Icon className="h-5 w-5 text-[#68717f]"/>{label}<ChevronRight className="ml-auto h-4 w-4 text-[#68717f]"/></button>)}</section></main>;

    if (path === '/lessons') return <main className="space-y-4 px-4 pb-8 pt-5 sm:px-8"><img src={lessonPhoto} alt="Ski lesson at Cardrona" className="h-52 w-full rounded-[22px] object-cover"/><h2 className="font-serif text-[30px]">Ski lessons</h2><p className="text-[#68717f]">Find your feet on snow with supportive instructors and small groups for every level.</p>{[['First-timer package', 249], ['Group lesson', 169], ['Private lesson', 529]].map(([name, price]) => <article key={name} className="flex items-center justify-between rounded-[20px] border bg-white p-4"><div><b>{name}</b><p className="mt-1 text-[13px] text-[#68717f]">Choose a date and session</p><strong className="mt-2 block font-serif text-xl text-[#5b8199]">{money(price)}</strong></div><button type="button" disabled aria-disabled="true" className="cursor-not-allowed rounded-full bg-[#aeb8c1] px-4 py-2.5 text-[13px] font-semibold text-white">Book</button></article>)}</main>;

    if (path === '/transport') return <TransportPlanner />;
    if (path === '/rentals') return <RentalsOverview />;

    if (path === '/ski') return <TrailMapExplorer />;
    if (path === '/snow-report') {
      const reportMountain = new URLSearchParams(location.search).get('mountainId') === 'treblecone' ? 'Treble Cone' : 'Cardrona';
      const requestedView = new URLSearchParams(location.search).get('view');
      const statusView = ['carparks', 'park', 'lifts', 'terrain'].includes(requestedView) ? requestedView : 'carparks';
      const statusLists = {
        carparks: { label: 'CARPARK', count: '0/6 Open', icon: House, items: ['Carpark A', 'Carpark B', 'Carpark C', 'The Yard', 'Valley View', 'The Pines'], note: 'Find out which carparks still have capacity.' },
        park: { label: 'PARK', count: '0/9 Open', icon: Bike, items: ['Baby Bucks', 'Little Bucks', 'Antlers Alley', 'Stag Lane', 'Big Bucks', 'Peoples Pipe', 'Olympic Pipe', 'Big Air', 'Gravity Cross'], note: 'Terrain park status for today.' },
        lifts: { label: 'LIFT', count: '0/10 Open', icon: Mountain, items: ['Kindy Conveyor', 'Learner Conveyors', 'McDougall’s Chondola', 'Whitestar Express', 'Valley View', 'Captains Express', 'T-Bar', 'Soho Express', 'Willow’s Quad', 'Wells Pipe Platter'], note: 'Lift status is shown for today.' },
        terrain: { label: 'TERRAIN', count: '0/9 Open', icon: Map, items: ['Learners Slope', 'Valley View', 'Captains', 'Soho', 'Willows', 'Ski Touring Access', 'Mt Cardrona', 'Arcadia Chutes', 'Summit'], note: 'Find an open terrain area.' },
      };
      const carparkGroup = ['carparks', 'park'].includes(statusView);
      const statusPage = carparkGroup ? 'carparks' : 'lifts';
      const selectedStatus = statusLists[statusView];
      const StatusIcon = selectedStatus.icon;
      const statusUrl = (view) => `/snow-report?mountainId=${reportMountain === 'Treble Cone' ? 'treblecone' : 'cardrona'}&view=${view}`;
      const pageStatuses = carparkGroup ? [['carparks', statusLists.carparks], ['park', statusLists.park]] : [['lifts', statusLists.lifts], ['terrain', statusLists.terrain]];
      return <main className="space-y-3 px-4 pb-8 pt-4 sm:px-8">
        <section><p className="text-[9px] tracking-[0.2em] text-[#718096]">{reportMountain.toUpperCase()}</p><h2 className="mt-1 font-serif text-[20px] font-bold text-[#344a64]">Mountain status</h2><p className="mt-1 text-[10px] leading-4 text-[#718096]">{carparkGroup ? 'Car parks and park status.' : 'Lift and terrain status.'}</p></section>
        <div className="grid grid-cols-2 gap-2">{pageStatuses.map(([view, status]) => <Link key={view} to={statusUrl(view)} aria-current={statusView === view ? 'page' : undefined} className={`rounded-[14px] border px-3 py-2.5 ${statusView === view ? 'border-[#5b8199] bg-white' : 'border-[#dce4ed] bg-white/70'}`}><span className="block text-[8px] tracking-[0.16em] text-[#718096]">{status.label}</span><b className={`mt-1 block text-[17px] ${['PARK', 'TERRAIN'].includes(status.label) ? 'text-emerald-600' : 'text-amber-600'}`}>{status.count.replace(' Open', '')}</b><span className="text-[9px] text-[#526d8b]">{statusView === view ? 'Selected' : 'View status'}</span></Link>)}</div>
        <section className="flex flex-col rounded-[18px] border border-[#dce4ed] bg-gradient-to-b from-white to-[#e8eef7] p-3.5 shadow-sm"><div className="flex items-center justify-between border-b border-[#dce4ed] pb-3"><div className="flex items-center gap-2"><StatusIcon className="h-4 w-4 text-[#718096]"/><h3 className="text-[12px] font-bold tracking-[0.12em] text-[#415a6d]">{selectedStatus.label}</h3></div><span className="text-[11px] text-[#344a64]">{selectedStatus.count}</span></div><div className="divide-y divide-[#dce4ed]/70">{selectedStatus.items.map((item) => <div key={item} className="flex min-h-[38px] items-center justify-between gap-3 text-[11px] text-[#415a6d]"><span>{item}</span><span className="rounded-full bg-[#b20e19] px-3 py-1 text-[9px] font-semibold text-white">Closed</span></div>)}</div><p className="pt-4 text-[9px] text-[#526d8b]">{selectedStatus.note}</p></section>
        <a href={`https://cardrona-treblecone.com/snow-report?mountainId=${reportMountain === 'Treble Cone' ? 'treblecone' : 'cardrona'}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-medium text-[#5b8199]">Open official snow report <ArrowUpRight className="h-3 w-3"/></a><p className="text-[9px] leading-4 text-[#718096]">Demo statuses. Confirm current openings on the official report.</p>
      </main>;
    }
    if (path === '/support') {
      const tabs = ['Mountain', 'Getting here', 'FAQs', 'Policies'];
      const faqs = [
        ['How far in advance should I book?', 'Pre-book paid guest buses; bus places are limited. The free mountain road shuttles do not require booking. Popular lift-pass dates can sell out.'],
        ['Do I need a lesson on my first time on snow?', 'A lesson is a great way to build confidence and learn the basics safely. First-timer packages include beginner-friendly options.'],
        ['How do I get to the mountain from Queenstown or Wānaka?', 'You can drive or book a shuttle. Check the Getting here tab for approximate travel times and transport options.'],
        ['Which payment methods are accepted, and can I get a refund?', 'Payment methods appear at checkout. Refund and change rules depend on the product; see Policies for the official terms.'],
        ['How do I use a travel agent discount code?', 'Enter your agent code during checkout. If it does not apply, contact your travel agent or mountain support.'],
      ];
      const tabClass = (tab) => `shrink-0 rounded-full px-3.5 py-2 text-[10px] ${helpTab === tab ? 'bg-[#5b8199] text-white' : 'bg-[#e5ecf4] text-[#61738a]'}`;
      return <main className="pb-8">
        <div className="sticky top-0 z-10 flex gap-1.5 overflow-x-auto border-b border-[#dce4ed] bg-[#f1f5f9] px-4 py-2.5 [scrollbar-width:none]">{tabs.map((tab) => <button key={tab} type="button" onClick={() => setHelpTab(tab)} aria-pressed={helpTab === tab} className={tabClass(tab)}>{tab}</button>)}</div>
        {helpTab === 'Mountain' && <section className="space-y-3 px-4 pt-4">
          <article className="rounded-[18px] border border-[#dce4ed] bg-white p-4"><h2 className="font-serif text-[17px] text-[#344a64]">Passes for both mountains</h2><p className="mt-2 text-[11px] leading-5 text-[#61738a]">The Unlimited Season Pass covers Cardrona and Treble Cone. The Saver Season Pass is Cardrona-only. Check each pass for its mountain access.</p><Link to="/passes" className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#5b8199]">Compare passes <ArrowUpRight className="h-3 w-3"/></Link></article>
          {[
            { name: 'Cardrona', location: 'Between Queenstown and Wānaka', stats: [['Base / lift high', '1,670 / 1,860 m'], ['Terrain', '47 groomable runs · 615 ha'], ['Vertical rise', '600 m']], season: '12 June – 10 October 2027 (tentative)', features: ['Five basins and five terrain parks', 'Beginner to advanced terrain', 'Nine on-mountain eateries'] },
            { name: 'Treble Cone', location: 'On the shore of Lake Wānaka', stats: [['Base / lift high', '1,260 / 1,960 m'], ['Terrain', '22 groomable trails · 550 ha'], ['Longest run', '4 km']], season: '26 June – 26 September 2027 (tentative)', features: ['Summit reaches 2,088 m; 700 m lift-serviced vertical', 'Beginner to expert terrain, mostly intermediate and advanced', 'Views across Lake Wānaka'] },
          ].map(({ name, location, stats, season, features }) => <article key={name} className="rounded-[18px] border border-[#dce4ed] bg-white p-4"><h3 className="font-serif text-[16px] text-[#344a64]">{name === 'Treble Cone' ? '三锥山 Treble Cone' : name}</h3><p className="mt-1 text-[10px] text-[#718096]">{location}</p><div className="mt-3 grid grid-cols-3 gap-1.5">{stats.map(([label, value]) => <div key={label} className="rounded-[12px] bg-[#eef3f8] p-2"><small className="block text-[8px] text-[#718096]">{label}</small><b className="mt-1 block text-[9px] font-medium text-[#344a64]">{value}</b></div>)}</div><p className="mt-3 flex items-center gap-1.5 text-[9px] text-[#718096]"><Clock3 className="h-3 w-3 text-[#5b8199]"/>Winter season: {season}</p><ul className="mt-2 space-y-1 text-[10px] leading-4 text-[#61738a]">{features.map((feature) => <li key={feature} className="flex gap-1.5"><span className="text-[#5b8199]">•</span>{feature}</li>)}</ul></article>)}
          <p className="flex gap-2 rounded-[14px] border border-dashed border-[#dce4ed] p-3 text-[9px] leading-4 text-[#718096]"><span className="text-[#5b8199]">ⓘ</span><span>Children under 6 ski or ride free, but still need a lift pass. On guest buses, children under 14 must travel with adult supervision. Check the live snow report for current conditions.</span></p>
        </section>}
        {helpTab === 'Getting here' && <section className="space-y-3 px-4 pt-4"><article className="rounded-[18px] border border-[#dce4ed] bg-white p-4"><h2 className="font-serif text-[17px] text-[#344a64]">Getting to the mountain</h2><p className="mt-2 text-[11px] leading-5 text-[#61738a]">Paid guest buses run from Queenstown and Wānaka. Free mountain road shuttles connect designated lower car parks with the mountains; no booking is required for these shuttles.</p></article><article className="overflow-hidden rounded-[18px] border border-[#dce4ed] bg-white">{[['Queenstown → Cardrona','59 km · about 1–1.5 hours by car; times vary with road conditions'],['Wānaka → Cardrona','35 km · about 40–45 minutes by car'],['Driving and parking','Cardrona’s 14 km mountain road is unsealed. Base parking is at Carparks A, B and C. Always carry chains and check road conditions.'],['Free mountain road shuttle','Cardrona pickup: The Pines carpark. Treble Cone pickup: car park at the bottom of the access road. Free, first-come, first-served; no booking required.'],['Paid guest buses','Services from Queenstown and Wānaka have multiple pickup points. Pre-booking is essential; check the official timetable for current times.'],['Where to stay','Cardrona has 15 on-mountain apartments. See the official accommodation information for details.']].map(([label,detail],index) => <div key={label} className={`flex gap-3 p-3.5 ${index ? 'border-t border-[#dce4ed]' : ''}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-[#e7eef6] text-[#5b8199]">{index < 2 || index === 4 ? <Bus className="h-4 w-4"/> : index === 2 || index === 3 ? <House className="h-4 w-4"/> : <BedDouble className="h-4 w-4"/>}</span><span><b className="block text-[11px] font-medium text-[#344a64]">{label}</b><small className="mt-1 block text-[9px] leading-4 text-[#718096]">{detail}</small></span></div>)}</article><Link to="/transport" className="flex items-center justify-between rounded-[16px] bg-[#5b8199] px-4 py-3 text-white"><span><b className="block text-[11px]">Book a shuttle or transfer</b><small className="mt-1 block text-[9px] text-white/85">Choose your mountain, pickup, date and passengers</small></span><Bus className="h-4 w-4"/></Link><p className="rounded-[14px] border border-dashed border-[#dce4ed] p-3 text-[9px] leading-4 text-[#718096]">Paid bus services must be pre-booked. Free mountain road shuttles are first-come, first-served and may change with weather, road conditions or capacity. Always check the official timetable and snow report before travelling.</p></section>}
        {helpTab === 'FAQs' && <section className="px-4 pt-4"><h2 className="mb-3 font-serif text-[17px] text-[#344a64]">Frequently asked questions</h2><div className="overflow-hidden rounded-[18px] border border-[#dce4ed] bg-white">{faqs.map(([question,answer]) => <div key={question} className="border-b border-[#dce4ed] last:border-b-0"><button type="button" onClick={() => setOpenFaq((current) => current === question ? '' : question)} aria-expanded={openFaq === question} className="flex w-full items-center justify-between gap-3 px-3.5 py-3.5 text-left text-[11px] font-medium text-[#344a64]"><span>{question}</span><ChevronRight className={`h-4 w-4 shrink-0 text-[#718096] transition-transform ${openFaq === question ? 'rotate-90' : ''}`}/></button>{openFaq === question && <p className="px-3.5 pb-3.5 text-[10px] leading-5 text-[#718096]">{answer}</p>}</div>)}</div></section>}
        {helpTab === 'Policies' && <section className="space-y-3 px-4 pt-4"><article className="rounded-[18px] border border-[#dce4ed] bg-white p-4"><h2 className="font-serif text-[17px] text-[#344a64]">Booking terms</h2><p className="mt-2 text-[10px] leading-4 text-[#718096]">Rules depend on the pass, lesson, accommodation or transport product. Check its terms before purchase.</p><a href="https://cardrona-treblecone.com/terms-conditions" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#5b8199]">Read official terms <ArrowUpRight className="h-3 w-3"/></a></article>
          {[[Ticket,'Lift passes and collection',['Digital lift passes are available on your phone. To collect a physical MyCard, scan the QR code in your booking confirmation at a lift-pass kiosk.','All lift users need a valid pass. Children under 6 ski or ride free, but still need their pass.']],[ArrowRight,'Changes and refunds',['Day passes can be rescheduled up to 7 days ahead, subject to availability; a price difference may apply.','Season-pass refunds and other booking changes depend on the product and official terms. There is no single refund window or fee for every booking.']],[Bus,'Transport bookings',['Pre-booking paid guest buses is essential.','Transport bookings can be changed or cancelled at no charge by calling at least 24 hours before departure. Changes or cancellations inside 24 hours are at Cardrona & Treble Cone’s discretion.','Children under 14 must travel on guest buses with adult supervision.']],[ShieldCheck,'Mountain and road safety',['Carry snow chains whenever driving on mountain access roads and check the latest snow report and road conditions before travelling.','Mountain roads are alpine roads; follow signs, speed limits, chain requirements and staff directions.']],[ShoppingBag,'Payment',['Check available payment methods at checkout. A 1.5% surcharge applies to in-person credit-card and PayWave payments; it does not apply to online purchases or retail purchases.','This local app is a demo and does not process real payments.']]].map(([Icon,heading,points]) => <article key={heading} className="rounded-[18px] border border-[#dce4ed] bg-white p-4"><h3 className="flex items-center gap-2 font-serif text-[14px] text-[#344a64]"><Icon className="h-4 w-4 text-[#5b8199]"/>{heading}</h3><ul className="mt-2 space-y-1.5 text-[10px] leading-4 text-[#718096]">{points.map((point) => <li key={point} className="flex gap-1.5"><span className="text-[#5b8199]">•</span>{point}</li>)}</ul></article>)}
          <p className="px-1 text-[9px] leading-4 text-[#718096]">Official conditions can change. Check the current product terms before booking.</p></section>}
      </main>;
    }
    return <main className="p-8 text-center text-[#68717f]">This demo page is not available.</main>;
  };

  const cafeItemCount = Object.values(cafeQuantities).reduce((sum, quantity) => sum + quantity, 0);
  const cafeTotal = (selectedCafe?.menu || []).reduce((sum, item, index) => sum + item.price * (cafeQuantities[index] || 0), 0);
  const chosenAccommodation = ACCOMMODATION_CARDS.find((stay) => Number(accommodationQuantities[stay.roomNumber] || 0) > 0) || null;
  const reservationNights = accommodationBooking ? Math.max(1, Math.ceil((new Date(`${accommodationBooking.checkOut}T00:00:00`).getTime() - new Date(`${accommodationBooking.checkIn}T00:00:00`).getTime()) / 86400000) || 1) : 1;
  const reservationTotal = accommodationBooking ? Number(accommodationBooking.nightlyRate || 0) * reservationNights : 0;
  const updateAccommodationBooking = (key, value) => {
    setAccommodationBooking((current) => ({ ...current, [key]: value }));
    if (key === 'status' && accommodationBooking) {
      setState((old) => ({ ...old, accommodationUnits: { ...old.accommodationUnits, [accommodationBooking.stay.roomNumber]: value } }));
    }
  };
  const confirmAccommodationBooking = () => {
    if (!accommodationBooking || accommodationBooking.status !== 'Available' || !accommodationBooking.guestName.trim()) return;
    addToCart({ id: `accommodation-${accommodationBooking.roomNumber}-${accommodationBooking.checkIn}`, name: `${accommodationBooking.unitType} · ${accommodationBooking.roomNumber}`, price: reservationTotal, image: accommodationBooking.stay.image }, 1, { detail: `${accommodationBooking.guestName} · ${accommodationBooking.checkIn} to ${accommodationBooking.checkOut} · ${reservationNights} ${reservationNights === 1 ? 'night' : 'nights'}`, variant: accommodationBooking.bookingReference, visitDate: accommodationBooking.checkIn });
    setAccommodationBooking(null);
    navigate('/cart');
  };
  return <LocalizeCustomerTree lang={lang}><div className="h-screen overflow-hidden bg-[#e8edf3] p-2 text-[#20242b] sm:px-4 sm:py-4"><div className={`relative mx-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden rounded-[14px] border border-[#d2d6db] bg-[#f1f5f9] shadow-[0_5px_14px_rgba(24,32,43,0.12)] sm:h-[calc(100vh-32px)] sm:rounded-[24px] ${isHome ? 'font-medium' : ''}`}><CustomerHeader title={title} home={isHome} onBack={goBack} lang={lang} setLang={setLang} mountain={mountain} setMountain={setMountain}/><div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto"><LocalizeCustomerTree lang={lang}>{content()}</LocalizeCustomerTree></div>{notice && <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#20242b] px-5 py-3 text-sm text-white shadow-lg">{notice}</div>}{selectedCafe && <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/80 sm:items-center sm:p-4"><section role="dialog" aria-modal="true" aria-labelledby="cafe-menu-title" className="flex max-h-[82vh] w-full max-w-[430px] flex-col rounded-t-[22px] bg-[#f1f6fa] p-4 shadow-2xl sm:rounded-[22px]"><div className="flex items-center justify-between"><span className="w-6"/><h2 id="cafe-menu-title" className="font-serif text-[16px] font-bold text-[#344a64]">{selectedCafe.name}</h2><button onClick={() => setSelectedCafe(null)} aria-label="Close menu" className="p-1 text-[#718096]"><X className="h-5 w-5"/></button></div><p className="mt-1 text-center text-[10px] text-[#718096]">Pick your dishes, edit quantities and taste notes at checkout</p><div className="mt-3 space-y-2 overflow-y-auto">{selectedCafe.menu.map((item, index) => <div key={item.name} className="flex items-center justify-between gap-3 rounded-[14px] border border-[#dce4ed] px-3 py-2.5"><span className="min-w-0"><b className="block text-[11px] font-medium text-[#344a64]">{item.name}</b><small className="mt-0.5 block text-[9px] text-[#718096]">{money(item.price)}</small></span><div className="flex shrink-0 items-center gap-2">{cafeQuantities[index] > 0 && <><button onClick={() => setCafeQuantities((old) => ({ ...old, [index]: Math.max(0, (old[index] || 0) - 1) }))} aria-label={`Remove ${item.name}`} className="flex h-7 w-7 items-center justify-center rounded-full border text-[#526d8b]">−</button><span className="w-3 text-center text-[10px]">{cafeQuantities[index]}</span></>}<button onClick={() => setCafeQuantities((old) => ({ ...old, [index]: (old[index] || 0) + 1 }))} aria-label={`Add ${item.name}`} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5b8199] text-white"><Plus className="h-3.5 w-3.5"/></button></div></div>)}</div><label className="mt-3 block text-[10px] text-[#526982]">Taste notes<textarea value={cafeNotes} onChange={(event) => setCafeNotes(event.target.value)} placeholder="Any preferences or allergies?" className="mt-1.5 min-h-14 w-full rounded-[12px] border border-[#dce4ed] bg-white/50 px-3 py-2 text-[10px] text-[#344a64]"/></label><div className="mt-3 flex items-center justify-between border-t border-dashed border-[#dce4ed] pt-3 text-[10px] text-[#718096]"><span>{cafeItemCount} {cafeItemCount === 1 ? 'item' : 'items'}</span><b className="font-serif text-[16px] font-normal text-[#5b8199]">{money(cafeTotal)}</b></div><button disabled={!cafeItemCount} onClick={() => { selectedCafe.menu.forEach((item, index) => { const quantity = cafeQuantities[index] || 0; if (quantity) addToCart({ id: `cafe-${selectedCafe.name.toLowerCase().replaceAll(' ', '-')}-${item.name.toLowerCase().replaceAll(' ', '-')}`, name: item.name, price: item.price }, quantity, { detail: cafeNotes.trim() ? `${selectedCafe.name} · ${cafeNotes.trim()}` : selectedCafe.name }); }); setSelectedCafe(null); setCafeQuantities({}); setCafeNotes(''); announce('Demo food order added to your cart'); navigate('/cart'); }} className="mt-3 h-11 rounded-full bg-[#5b8199] text-[12px] font-semibold text-white disabled:opacity-45">Checkout</button></section></div>}{discountOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5"><section className="w-full max-w-md rounded-[20px] bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Discount code</h2><button onClick={() => setDiscountOpen(false)} aria-label="Close"><X/></button></div><input value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="Enter code (try PEAK10)" className="mt-5 h-12 w-full rounded-xl border px-3"/><button onClick={() => { setDiscountOpen(false); announce(discount.toUpperCase() === 'PEAK10' ? '10% discount applied' : 'Code not recognized'); }} className="mt-3 h-12 w-full rounded-full bg-[#5b8199] font-semibold text-white">Apply code</button></section></div>}<BottomNav path={path} lang={lang} count={cartCount}/></div></div></LocalizeCustomerTree>;
}
