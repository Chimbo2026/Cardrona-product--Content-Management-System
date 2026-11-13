import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft, ArrowRight, Bike, Bus, CalendarDays, Check, ChevronRight,
  GraduationCap, Headset, Heart, House, Map, MessageSquare, Mountain, Package,
  ShoppingBag, Ticket, UserRound, X, Minus, Plus, Sparkles, Utensils,
  BedDouble, Clock3, ShieldCheck, ArrowUpRight,
} from 'lucide-react';
import { useLang } from '@/lib/i18n';
import MountainReport from '@/components/customer/MountainReport';
import SightseeingConfigurator from '@/components/customer/SightseeingConfigurator';
import WinterDonationOptions from '@/components/customer/WinterDonationOptions';
import BikePackageConfigurator from '@/components/customer/BikePackageConfigurator';
import SummerProductConfigurator from '@/components/customer/SummerProductConfigurator';

const STORAGE = 'peak-guest-demo-v1';
const heroPhoto = 'https://assets.simpleviewinc.com/simpleview/image/upload/c_fill%2Cf_jpg%2Cg_xy_center%2Ch_852%2Cq_65%2Cw_640%2Cx_1530%2Cy_1210/v1/clients/queenstownnz/Do_not_use_before_Winter_2025_Family_Ski_Cardrona_93772c40-e340-4b4a-bcd2-7c72598f67a7.jpg';
const cafePhoto = 'https://1.cloudcdn.nz/media/2025/12/Cardrona-Resort-Fero.jpg?br_px=5335%2C4741&tl_px=2017%2C1423';
const lessonPhoto = 'https://images.ctfassets.net/2atbvuhykqrn/5RrCqABuhzQpBcP36dm72M/10282138357bf27782ae8935391b4f21/W24-Mountains_Blog_1600x900_01GrouLesson.webp';
const products = [
  { id: 'beanie', name: 'Cardrona Limited Beanie', category: 'Accessories', price: 45, image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=900&q=85', tag: 'New' },
  { id: 'hoodie', name: 'Cardrona 2027 Hoodie', category: 'Men', price: 129, image: 'https://www.rossignol.com/dw/image/v2/BJJZ_PRD/on/demandware.static/-/Sites-rossignol-catalog/default/dwbf6d6018/images/large/RLLWS01_100_RGB72DPI_00.jpg?sh=1200&sw=1200', tag: 'New' },
  { id: 'jacket', name: 'Alpine Shell Jacket', category: 'Men', price: 389, image: 'https://cdn.aboutstatic.com/file/images/2446415369aed9ffc31ad6b5fed947d5.jpg?brightness=0.96&expand=1&height=630&quality=75&trim=1&width=1200' },
  { id: 'tee', name: 'Mountain Graphic Tee', category: 'Women', price: 69, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85' },
];
const HOME_FEATURES = [
  { tag: 'Lift passes', title: 'Find your mountain pass', detail: 'Day passes and season access', image: heroPhoto, to: '/passes' },
  { tag: 'Lessons', title: 'Your first turns start here', detail: 'Private, group and kids lessons', image: lessonPhoto, to: '/lessons' },
  { tag: 'Equipment Hire', title: 'Bike package from NZ$219', detail: 'Lift pass and bike rental', image: heroPhoto, to: '/passes' },
  { tag: 'Mountain shop', title: 'Gear for the mountain', detail: 'New arrivals and essentials', image: products[2].image, to: '/shop' },
];
const DEMO_ORDERS = [
  { id: 'SKI-20261112-JXUV', name: '2-Day Consecutive Ticket · Both Mountains', date: '2026-11-13', guests: 1, total: 210.6, status: 'Confirmed', category: 'Ski passes' },
  { id: 'SKI-20261111-Z6S1', name: '2-Day Consecutive Ticket · Both Mountains', date: '2026-11-18', guests: 2, total: 0, status: 'Reschedule requested', category: 'Ski passes' },
  { id: 'RENT-20261110-1016', name: 'Ski equipment rental package', date: '2026-11-13', guests: 1, total: 110, status: 'Confirmed', category: 'Mountain store' },
  { id: 'SKI-20260821-1021', name: 'Single day lift ticket', date: '2026-08-21', guests: 2, total: 418, status: 'Redeemed', category: 'Ski passes' },
  { id: 'RENT-20260706-1018', name: 'Mountain bike rental', date: '2026-07-06', guests: 1, total: 179, status: 'Cancelled', category: 'Mountain store' },
];
const SUMMER_PRODUCTS = [
  { id: 'earlybird-summer', name: 'Earlybird Summer Season Pass', description: 'Unlimited summer mountain visits with an earlybird rate.', price: 'NZ$359 adult', to: '/configure-pass?product=earlybird-summer' },
  { id: 'summer-day-passes', name: 'Summer Day Passes', description: 'Full-day, afternoon and Friday evening bike park passes.', price: 'From NZ$65 adult', to: '/configure-pass?product=summer-day-passes' },
  { id: 'lift-bike', name: 'Lift Pass and Bike Rental', description: 'A full-day lift ticket and mountain bike rental.', price: 'From NZ$219 adult', to: '/bike-configure' },
  { id: 'bike-rental', name: 'Bike Rental', description: 'Enduro, downhill and full suspension options.', price: 'From NZ$174 adult', to: '/bike-configure?product=bike-rental' },
  { id: 'peak-to-pub', name: 'Peak to Pub · Lift Pass and Shuttle', description: 'Mountain access with return shuttle travel.', price: 'NZ$49 adult', to: '/configure-pass?product=peak-to-pub' },
  { id: 'summer-carting', name: 'Summer Mountain Carting', description: 'A two-hour downhill cart pass with unlimited uplifts.', price: 'NZ$175 adult', to: '/configure-pass?product=summer-carting' },
];
const pass = { id: 'winter-season-pass', name: 'Winter Season Pass', price: 1429, description: 'Ski or ride at both Cardrona and Treble Cone in Winter 27 with no blackout dates.', image: heroPhoto };
const CHARITY_LABELS = { seed: 'Plant a Seed', tamariki: 'Ride Tamariki', karearea: 'Kārearea Project', 'all-in': 'All In' };
const initial = { cart: [], favorites: [], orders: [], lang: 'en' };

function readStore() {
  try { return { ...initial, ...JSON.parse(localStorage.getItem(STORAGE) || '{}') }; }
  catch { return initial; }
}
function money(value) { return `NZ$${Number(value).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function words(lang, en, zh) { return lang === 'zh' ? zh : en; }

function ToggleLanguage({ lang, setLang }) {
  return <div className="flex shrink-0 rounded-full border border-[#e0e3e7] bg-[#f5f5f6] p-1 text-[13px] font-bold" role="group" aria-label="Language">
    {['zh', 'en'].map((code) => <button key={code} onClick={() => setLang(code)} aria-pressed={lang === code} className={`rounded-full px-3 py-1.5 ${lang === code ? 'bg-[#c8102e] text-white' : 'text-[#68717f]'}`}>{code === 'zh' ? '中文' : 'EN'}</button>)}
  </div>;
}

function CustomerHeader({ title, home, onBack, lang, setLang, mountain, setMountain }) {
  if (home) return <header className="sticky top-0 z-30 shrink-0">
    <div className="flex h-[64px] items-center gap-2 bg-[#101829] px-4 text-white">
      <Link to="/" aria-label="Cardrona home" className="flex min-w-0 items-center gap-2"><span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#d31328] text-center text-[8px] font-black leading-[8px] tracking-tight">CAR<br/>DRO<br/>NA</span><span className="min-w-0 leading-none"><b className="block text-[13px] tracking-[0.12em]">CARDRONA</b><small className="mt-1 block text-[8px] tracking-[0.28em] text-white/65">TREBLE CONE</small></span></Link><div className="ml-auto"><ToggleLanguage lang={lang} setLang={setLang}/></div><span className="rounded-full border border-white/30 px-2.5 py-1.5 text-[8px] font-bold tracking-[0.12em] text-white/85">SUMMER 26/27</span>
    </div>
    <div className="bg-[#e9eff6] px-4 py-2"><div className="grid h-[38px] grid-cols-2 rounded-full bg-[#dfe7f1] p-1">{['Cardrona', 'Treble Cone'].map((name) => <button key={name} onClick={() => setMountain(name)} aria-pressed={mountain === name} className={`rounded-full text-[11px] ${mountain === name ? 'bg-[#101829] font-medium text-white' : 'text-[#60738d]'}`}>{name}</button>)}</div></div>
  </header>;
  return <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center gap-3 border-b border-[#dce3eb] bg-[#f4f7fa]/95 px-4 backdrop-blur sm:h-[96px] sm:px-6"><button onClick={onBack} className="flex h-10 w-10 shrink-0 items-center justify-center text-[#455a74]" aria-label="Go back"><ArrowLeft className="h-6 w-6" /></button><h1 className="min-w-0 flex-1 truncate font-serif text-[21px] font-bold sm:text-[23px]">{title}</h1><div className="ml-auto"><ToggleLanguage lang={lang} setLang={setLang} /></div></header>;
}

function HomeFeatureCarousel() {
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

  return <section className="mx-4" aria-label="Featured mountain activities">
    <div ref={railRef} onScroll={updateActive} className="flex snap-x snap-mandatory overflow-x-auto rounded-[18px] [scrollbar-width:none]" style={{ scrollbarWidth: 'none' }}>
      {HOME_FEATURES.map((slide) => <Link key={slide.tag} to={slide.to} className="relative block h-[172px] w-full shrink-0 snap-center overflow-hidden bg-[#26364c] text-white">
        <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute inset-0 bg-gradient-to-r from-[#101829]/85 via-[#101829]/45 to-transparent" />
        <span className="absolute inset-0 p-4"><small className="inline-block rounded-full bg-white/20 px-2.5 py-1 text-[8px]">{slide.tag}</small><span className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#d31328] text-white"><ArrowUpRight className="h-4 w-4" /></span><b className="mt-3 block font-serif text-[17px]">{slide.title}</b><small className="mt-1 block text-[9px] text-white/80">{slide.detail}</small></span>
      </Link>)}
    </div>
    <div className="mt-2.5 flex justify-center gap-1.5" aria-label="Choose a featured slide">
      {HOME_FEATURES.map((slide, index) => <button key={slide.tag} type="button" onClick={() => goTo(index)} aria-label={`Show slide ${index + 1}: ${slide.tag}`} aria-current={activeIndex === index ? 'true' : undefined} className={`h-2 rounded-full transition-all ${activeIndex === index ? 'w-8 bg-[#d31328]' : 'w-2 bg-[#cbd4df]'}`} />)}
    </div>
  </section>;
}

function BottomNav({ path, lang, count }) {
  const links = [
    { label: words(lang, 'Home', '首页'), icon: House, to: '/' },
    { label: words(lang, 'Passes', '雪票'), icon: Mountain, to: '/passes' },
    { label: words(lang, 'Book', '预订'), icon: Ticket, to: '/book' },
    { label: words(lang, 'Account', '账户'), icon: UserRound, to: '/account' },
  ];
  return <nav className="sticky bottom-0 z-30 grid h-[64px] shrink-0 grid-cols-4 border-t border-[#d9e1ea] bg-[#f1f6fa]/95 px-1 backdrop-blur sm:h-[120px]" aria-label="Main navigation">
    {links.map(({ label, icon: Icon, to }) => {
      const bookingArea = ['/checkout', '/configure-pass', '/cart', '/bike-configure'].includes(path);
      const active = to === '/' ? path === '/' : to === '/book' ? path === '/book' || bookingArea : path === to || (to === '/shop' && path === '/retail');
      return <Link key={to} to={to} className={`relative flex flex-col items-center justify-center gap-1 text-[11px] sm:text-[16px] ${active ? 'font-semibold text-[#c8102e]' : 'text-[#68717f]'}`}><Icon className="h-5 w-5 sm:h-7 sm:w-7" strokeWidth={active ? 2.2 : 1.8} />{label}{to === '/account' && <span className="absolute right-[calc(50%-18px)] top-[4px] flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c8102e] px-1 text-[11px] font-bold text-white">3</span>}</Link>;
    })}
  </nav>;
}

function Stepper({ current, lang }) {
  const labels = [
    words(lang, 'Pass', '雪票'),
    words(lang, 'Cart', '购物车'),
    words(lang, 'Review', '订单'),
    words(lang, 'Details', '资料'),
    words(lang, 'Pay', '付款'),
    words(lang, 'Done', '完成'),
  ];
  return <div className="sticky top-0 z-20 grid grid-cols-6 border-b border-[#d9e1ea] bg-[#f1f6fa]/95 px-2 backdrop-blur">
    {labels.map((label, i) => <div key={label} className={`relative flex min-w-0 items-center justify-center gap-0.5 py-2.5 text-[10px] sm:text-[13px] ${i === current ? 'font-semibold text-[#c8102e]' : 'text-[#718096]'}`}>
      <span className="truncate">{label}</span>{i < current && <Check className="h-3 w-3 shrink-0" />}
      {i === current && <span className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-[#c8102e]" />}
    </div>)}
  </div>;
}

export default function CustomerExperience() {
  const { lang: appLang, setLang: setAppLang } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState(readStore);
  const [mountain, setMountain] = useState('Cardrona');
  const [filter, setFilter] = useState('All');
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
  const [winterFoundation, setWinterFoundation] = useState(true);
  const [winterDonations, setWinterDonations] = useState([]);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discount, setDiscount] = useState('');
  const [notice, setNotice] = useState('');
  const [ordersPeriod, setOrdersPeriod] = useState('Upcoming');
  const [ordersCategory, setOrdersCategory] = useState('All');
  const [visibleOrders, setVisibleOrders] = useState(3);
  const path = location.pathname;
  const productId = new URLSearchParams(location.search).get('product');
  const isSightseeing = productId === 'sightseeing';
  const isHome = path === '/';
  const [lang, setLang] = useState(state.lang || 'en');

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
  const selectedAgePrice = age.startsWith('Child') ? 399 : age.startsWith('Senior') ? 799 : age.includes('Free') ? 0 : winterAdultPrice;
  const configuredPassTotal = selectedAgePrice + winterDonations.length * 20;
  const bookingTotal = state.cart.length ? total : selectedAgePrice * guests;
  const bookingQuantity = state.cart.length ? state.cart.reduce((sum, item) => sum + (item.id.startsWith('summer-donation-') ? 0 : item.quantity), 0) : guests;
  const checkoutGuestCount = state.cart.length ? Math.max(1, state.cart.reduce((sum, item) => sum + (item.ageBand ? item.quantity : 0), 0)) : guests;
  const total = Math.max(0, cartTotal - (discount.toUpperCase() === 'PEAK10' ? cartTotal * 0.1 : 0));
  const addToCart = (item, quantity = 1, extra = {}) => setState((old) => {
    const key = `${item.id}:${extra.variant || ''}`;
    const existing = old.cart.find((line) => line.key === key);
    const line = { key, id: item.id, name: item.name, price: item.price, image: item.image || '', quantity, detail: extra.detail || '', variant: extra.variant || '', visitDate: extra.visitDate || '', ageBand: extra.ageBand || '' };
    return { ...old, cart: existing ? old.cart.map((x) => x.key === key ? { ...x, quantity: x.quantity + quantity } : x) : [...old.cart, line] };
  });
  const updateQuantity = (key, delta) => setState((old) => ({ ...old, cart: old.cart.map((x) => x.key === key ? { ...x, quantity: Math.max(0, x.quantity + delta) } : x).filter((x) => x.quantity > 0) }));
  const changeBookingGuests = (delta) => {
    setGuests((value) => Math.max(1, Math.min(10, value + delta)));
    if (state.cart.length === 1) updateQuantity(state.cart[0].key, delta);
  };
  const toggleFavorite = (id) => setState((old) => ({ ...old, favorites: old.favorites.includes(id) ? old.favorites.filter((x) => x !== id) : [...old.favorites, id] }));
  const goBack = () => navigate(-1);
  const announce = (message) => { setNotice(message); window.setTimeout(() => setNotice(''), 2200); };

  const title = ({ '/passes': 'Passes & packages', '/configure-pass': 'Configure pass', '/bike-configure': 'Bike package', '/book': 'Book', '/checkout': 'Book', '/cart': 'Cart', '/shop': 'New arrivals', '/retail': 'New arrivals', '/orders': 'Orders', '/account': 'Account', '/login': 'Log in', '/register': 'Create account', '/lessons': 'Ski lessons', '/transport': 'Mountain transport', '/ski': 'Trail map', '/support': 'Mountain help' })[path] || 'Peak';

  function actionBar(label, onClick, amount, disabled = false) {
    return <div className="absolute inset-x-0 bottom-[76px] z-20 mx-auto w-full max-w-[430px] border-t border-[#e2e5e9] bg-[#fafafb]/95 px-4 pb-3 pt-3 backdrop-blur sm:bottom-[120px] sm:px-8 sm:pb-6 sm:pt-5"><div className="mb-3 flex items-center justify-between text-[14px] text-[#68717f] sm:mb-5 sm:text-[20px]"><span>Total</span><span className="font-serif text-[23px] text-[#c8102e] sm:text-[34px]">{money(amount)}</span></div><button disabled={disabled} onClick={onClick} className="flex h-[54px] w-full items-center justify-center gap-3 rounded-full bg-[#c8102e] text-[17px] font-semibold text-white shadow-sm disabled:opacity-50 sm:h-[88px] sm:text-[26px]">{label}<ArrowRight className="h-5 w-5 sm:h-8 sm:w-8" /></button></div>;
  }

  const content = () => {
    if (isHome) return <main className="space-y-3 pb-5">
      <MountainReport mountain={mountain}/>
      <Link to="/passes" className="mx-4 flex h-[64px] items-center gap-3 rounded-[16px] bg-[#d31328] px-3.5 text-white shadow-sm"><span className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/50"><Ticket className="h-4 w-4"/></span><span className="min-w-0 flex-1"><b className="block text-[13px] leading-4">Book a ticket</b><small className="block text-[9px] text-white/85">Day passes, flexi and first timer packs</small></span><ArrowUpRight className="h-4 w-4"/></Link>
      <section className="mx-4 grid grid-cols-4 gap-x-1 gap-y-3 rounded-[16px] border border-[#e3e8ef] bg-white px-2 py-3">{[['Passes', Ticket, '/passes'], ['Season', CalendarDays, '/passes'], ['Shops', ShoppingBag, '/shop'], ['Rentals', Package, '/shop'], ['Lessons', GraduationCap, '/lessons'], ['Transport', Bus, '/transport'], ['Trail map', Map, '/ski'], ['More', Sparkles, '/support']].map(([label, Icon, to]) => <Link key={label} to={to} className="flex min-h-[60px] flex-col items-center gap-1.5 text-center text-[9px] text-[#66788e]"><span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#e7eef6] text-[#d31328]"><Icon className="h-5 w-5" strokeWidth={2}/></span>{label}</Link>)}</section>
      <section className="mx-4 pt-1"><div className="mb-2 flex items-center justify-between"><h2 className="font-serif text-[14px] font-bold text-[#344a64]">Eat, stay & play</h2><Link to="/support" className="inline-flex items-center text-[9px] text-[#718198]">All <ChevronRight className="h-3 w-3"/></Link></div><div className="grid grid-cols-3 gap-2">{[[cafePhoto, 'Cafés', Utensils], [lessonPhoto, 'Activities', Sparkles], [heroPhoto, 'Stay', BedDouble]].map(([image, label, Icon]) => <Link key={label} to="/support" className="overflow-hidden rounded-[12px] border border-[#dce4ed] bg-white text-center"><img src={image} alt="" className="h-[104px] w-full object-cover"/><span className="block py-1.5 text-[10px] text-[#344a64]">{label}</span></Link>)}</div></section>
      <HomeFeatureCarousel />
      <Link to="/support" aria-label="Mountain help" className="absolute bottom-[112px] right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#d31328] text-white shadow-lg"><Headset className="h-6 w-6"/></Link>
    </main>;

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
        <div className="mt-3 flex items-center justify-between text-[10px]"><span>◷ Ends in&nbsp; 18d 06:42:11</span><span className="rounded-full bg-white px-3 py-1.5 text-[#c8102e]">View passes →</span></div>
      </Link>

      <section className="grid grid-cols-2 gap-2">
        {[["Lessons", GraduationCap, "Private, group & kids", '/lessons'], ["Rentals", Package, "Skis, boards & gear", '/shop'], ["Transport", Bus, "Pickup & return travel", '/transport'], ["Stay", BedDouble, "On-mountain escapes", '/support']].map(([label, Icon, detail, to]) => <Link key={label} to={to} className="rounded-[16px] border border-[#dce4ed] bg-white p-3.5 text-[#344a64]"><div className="flex items-center justify-between"><Icon className="h-4 w-4 text-[#c8102e]"/><ArrowUpRight className="h-3.5 w-3.5 text-[#9aa8b8]"/></div><b className="mt-2 block text-[12px]">{label}</b><small className="mt-1 block text-[10px] text-[#718096]">{detail}</small></Link>)}
      </section>

      <Link to="/passes" className="flex items-center gap-3 rounded-[16px] border border-[#dce4ed] bg-[#eaf0f6] p-3 text-[#344a64]"><Bike className="h-5 w-5 text-[#526d8b]"/><span className="min-w-0 flex-1"><b className="block text-[11px]">Planning a summer visit?</b><small className="block text-[10px] text-[#718096]">Mountain biking, carting & sightseeing</small></span><ChevronRight className="h-4 w-4"/></Link>
      <div className="flex items-center justify-between px-1 text-[10px] text-[#718096]"><span>Just need a lift pass?</span><Link to="/passes" className="font-semibold text-[#c8102e]">Find your pass <ArrowRight className="ml-1 inline h-3 w-3"/></Link></div>
      <section className="grid grid-cols-2 gap-2">{[['Ski booking', Ticket, 'Passes · Lessons · Rentals', '/passes'], ['Mountain shop', ShoppingBag, 'New arrivals · Apparel accessories', '/shop']].map(([label, Icon, detail, to]) => <Link key={label} to={to} className="min-h-[150px] rounded-[16px] bg-gradient-to-br from-[#58778e] to-[#1d2b40] p-3.5 text-white"><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><Icon className="h-5 w-5"/></span><ArrowUpRight className="h-4 w-4 text-white/60"/></div><b className="mt-4 block font-serif text-[16px]">{label}</b><small className="mt-1 block text-[10px] text-white/75">{detail}</small>{label === 'Ski booking' && <span className="mt-2 inline-block rounded-full bg-white/15 px-2.5 py-1 text-[9px]">Live inventory</span>}{label === 'Mountain shop' && <span className="mt-2 inline-block rounded-full bg-white/15 px-2.5 py-1 text-[9px]">Retail</span>}</Link>)}</section>
    </main>;

    if (path === '/passes') return <main className="space-y-4 px-4 pb-6 pt-5 sm:px-8"><div className="flex gap-2 overflow-x-auto pb-1">{['All', 'Lift pass', 'Packages', 'Summer', 'Sightseeing', 'Lessons', 'Rentals'].map((f) => <button onClick={() => setFilter(f)} key={f} className={`shrink-0 rounded-full px-4 py-2.5 text-[14px] ${filter === f ? 'bg-[#c8102e] text-white' : 'bg-[#f0f1f3] text-[#68717f]'}`}>{f}</button>)}<button className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0f1f3]" aria-label="Cart" onClick={() => navigate('/cart')}><ShoppingBag className="h-5 w-5" /><span className="sr-only">{cartCount}</span></button><button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0f1f3]" aria-label="Favorites" onClick={() => setFilter('Favorites')}><Heart className="h-5 w-5" /></button></div>{filter === 'All' || filter === 'Lift pass' || filter === 'Favorites' && state.favorites.includes(pass.id) ? <article className="overflow-hidden rounded-[25px] border border-[#e0e3e7] bg-white shadow-md"><div className="relative"><img src={pass.image} alt="Family skiing at Cardrona" className="h-[230px] w-full object-cover"/><span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-[12px] text-white">Packages</span><button onClick={() => toggleFavorite(pass.id)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white" aria-label="Save pass"><Heart className={`h-5 w-5 ${state.favorites.includes(pass.id) ? 'fill-[#c8102e] text-[#c8102e]' : ''}`} /></button></div><div className="p-5"><h2 className="font-serif text-[25px] font-bold">{pass.name}</h2><p className="mt-2 text-[15px] leading-6 text-[#68717f]">{pass.description} Prices starting from $1,029.</p><p className="mt-3 flex items-center gap-2 text-[14px] text-[#68717f]"><Clock3 className="h-4 w-4" />Winter 27 season</p></div><div className="flex items-center justify-between gap-3 border-t border-[#e3e5e8] p-5"><span><strong className="font-serif text-[25px] font-normal text-[#c8102e]">{money(1029)}</strong><small className="block text-[13px] text-[#68717f]">from / season pass</small></span><button onClick={() => navigate('/configure-pass')} className="flex h-12 items-center gap-3 rounded-full bg-[#c8102e] px-5 text-[14px] font-semibold text-white">Book now <ArrowRight className="h-5 w-5" /></button></div></article> : null}{(filter === 'All' || filter === 'Packages' || filter === 'Sightseeing') && <article className="overflow-hidden rounded-[22px] border border-[#dce4ed] bg-white shadow-sm"><div className="relative"><img src={heroPhoto} alt="Summer sightseeing at Cardrona" className="h-[180px] w-full object-cover"/><span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[11px] text-white">Sightseeing</span></div><div className="p-4"><h2 className="font-serif text-[20px] font-bold">Summer Sightseeing Pass</h2><p className="mt-1 text-[12px] leading-5 text-[#718096]">Enjoy alpine views and choose a scenic gondola uplift at McDougall’s Chondola.</p><div className="mt-3 flex items-center justify-between"><span><b className="font-serif text-[22px] font-normal text-[#c8102e]">NZ$35.00</b><small className="block text-[10px] text-[#718096]">Adult · includes 1 uplift</small></span><button onClick={() => navigate('/configure-pass?product=sightseeing')} className="flex h-10 items-center gap-2 rounded-full bg-[#5b8199] px-4 text-[12px] font-semibold text-white">Choose date <ArrowRight className="h-4 w-4" /></button></div></div></article>}{(filter === 'All' || filter === 'Packages' || filter === 'Summer') && SUMMER_PRODUCTS.map((item) => <article key={item.id} className="rounded-[18px] border border-[#dce4ed] bg-white p-4 shadow-sm"><span className="rounded-full bg-[#e3ebf4] px-2.5 py-1 text-[10px] text-[#526d8b]">Summer</span><h2 className="mt-3 font-serif text-[17px] font-bold text-[#344a64]">{item.name}</h2><p className="mt-1 text-[11px] leading-5 text-[#718096]">{item.description}</p><div className="mt-3 flex items-center justify-between"><b className="font-serif text-[17px] font-normal text-[#c8102e]">{item.price}</b><button onClick={() => navigate(item.to)} className="rounded-full bg-[#5b8199] px-3 py-2 text-[10px] font-semibold text-white">Choose options <ArrowRight className="ml-1 inline h-3 w-3"/></button></div></article>)}{filter === 'Lessons' && <article className="overflow-hidden rounded-[22px] border bg-white"><img src={lessonPhoto} alt="Ski lesson" className="h-48 w-full object-cover"/><div className="p-5"><h2 className="font-serif text-2xl">First timer lesson</h2><p className="mt-2 text-[#68717f]">Small-group coaching on the mountain.</p><Link to="/lessons" className="mt-4 inline-flex rounded-full bg-[#c8102e] px-5 py-3 text-white">Explore lessons <ArrowRight className="ml-2 h-5 w-5" /></Link></div></article>}{filter === 'Rentals' && <article className="overflow-hidden rounded-[22px] border bg-white"><img src="https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=1000&q=85" alt="Skis ready for rental" className="h-48 w-full object-cover"/><div className="p-5"><h2 className="font-serif text-2xl">Ski Package Rental</h2><p className="mt-2 text-[#68717f]">Choose your dates, gear level, and pickup point.</p><Link to="/shop" className="mt-4 inline-flex rounded-full bg-[#c8102e] px-5 py-3 text-white">View rentals <ArrowRight className="ml-2 h-5 w-5" /></Link></div></article>}{filter === 'Favorites' && !state.favorites.includes(pass.id) && <p className="py-12 text-center text-[#68717f]">No saved passes yet.</p>}</main>;

    if (path === '/bike-configure') return <BikePackageConfigurator cartTotal={cartTotal} onAdd={(item) => addToCart(item, 1, { detail: item.detail, variant: item.variant, visitDate: item.visitDate, ageBand: item.ageBand })} onCheckout={() => { setBookingStep(0); navigate('/checkout'); }} />;

    if (path === '/configure-pass') return isSightseeing ? <><Stepper current={0} lang={lang}/><SightseeingConfigurator cartTotal={cartTotal} onAdd={(item) => addToCart(item, 1, { detail: item.detail, variant: item.variant, visitDate: item.visitDate, ageBand: item.ageBand })} onCheckout={() => { setBookingStep(0); navigate('/checkout'); }} /></> : productId ? <><Stepper current={0} lang={lang}/><SummerProductConfigurator productId={productId} cartTotal={cartTotal} onAdd={(item) => addToCart(item, item.quantity || 1, { detail: item.detail, variant: item.variant, visitDate: item.visitDate, ageBand: item.ageBand })} onCheckout={() => { setBookingStep(0); navigate('/checkout'); }} /></> : <><Stepper current={0} lang={lang}/><main className="space-y-6 px-4 pb-[160px] pt-5 sm:px-8 sm:pb-[260px]"><div><h2 className="font-serif text-[28px] font-bold">{pass.name}</h2><p className="mt-2 text-[15px] leading-6 text-[#68717f]">{pass.description} Prices starting from $1,029.</p></div><section><h3 className="font-serif text-[23px] font-bold">Payment plan</h3><p className="mb-3 text-[14px] text-[#68717f]">Choose your Payment Option</p><div className="grid grid-cols-2 gap-3">{['Pay Now', 'Buy Now, Pay Later'].map((plan) => <button key={plan} onClick={() => setPaymentPlan(plan)} className={`min-h-[94px] rounded-[20px] border-2 p-4 text-left ${paymentPlan === plan ? 'border-[#c8102e] bg-white' : 'border-[#e0e3e7] bg-white'}`}><b>{plan}</b>{plan !== 'Pay Now' && <span className="mt-2 block text-[13px] leading-5 text-[#68717f]">$100 deposit now, balance in four instalments</span>}</button>)}</div></section><section><h3 className="mb-3 font-serif text-[23px] font-bold">Pass type</h3><div className="grid grid-cols-2 gap-3">{['Winter Saver Season Pass', 'Winter Unlimited Season Pass'].map((type) => <button key={type} onClick={() => setPassType(type)} className={`rounded-[19px] border-2 p-4 text-left font-semibold ${passType === type ? 'border-[#c8102e] bg-white' : 'border-[#e0e3e7] bg-white'}`}>{type}</button>)}</div><div className="mt-3 rounded-[20px] border border-[#e0e3e7] bg-[#f5f6f7] p-4"><b>{passType}</b><p className="mt-2 text-[14px] leading-6 text-[#68717f]">{winterPassDescription}</p><span className="mt-3 block text-[11px] tracking-[0.15em] text-[#68717f]">SELECT ONE (OPTIONAL)</span></div></section><WinterDonationOptions foundation={winterFoundation} onFoundationChange={setWinterFoundation} selected={winterDonations} onToggle={(id) => setWinterDonations((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} /><section><h3 className="mb-3 font-serif text-[23px] font-bold">Age</h3><div className="grid grid-cols-2 gap-3">{[['Adult: 18 - 64 yrs', winterAdultPrice], ['Child: 6 - 17 yrs', 399], ['Senior: 65 - 74 yrs', 799], ['Under 6 yrs: Free of Charge', 0], ['Over 75 yrs: Free of Charge', 0]].map(([label, price]) => <button key={label} onClick={() => setAge(label)} className={`min-h-[86px] rounded-[20px] border-2 p-4 text-left ${age === label ? 'border-[#c8102e] bg-white' : 'border-[#e0e3e7] bg-white'}`}><b className="block leading-5">{label}</b><span className="mt-2 block text-[14px] text-[#68717f]">{price ? money(price) : 'Free of Charge'}</span></button>)}</div></section><section className="rounded-[18px] border border-[#dce4ed] bg-white p-4"><p className="font-serif text-[11px] font-bold tracking-[0.15em] text-[#718096]">ITEM SUMMARY</p><div className="mt-3 flex justify-between gap-3 text-[13px]"><b>(1) {passType} · {age}</b><span className="shrink-0">{money(configuredPassTotal)}</span></div><p className="mt-1 text-[11px] text-[#718096]">{paymentPlan}{winterFoundation ? ' · Cardrona Foundation support' : ''}</p>{winterDonations.map((id) => <p key={id} className="mt-1 text-[10px] text-[#718096]">{CHARITY_LABELS[id]} · +NZ$20.00</p>)}<div className="mt-3 flex justify-between border-t border-[#e6edf4] pt-3 text-[14px] font-semibold"><span>Total</span><span className="font-serif text-[22px] font-normal text-[#c8102e]">{money(configuredPassTotal)}</span></div><p className="mt-2 text-center text-[10px] text-[#718096]">Demonstration cart · no real charge is made.</p></section></main>{actionBar('Add to cart', () => { addToCart({ id: 'winter-season-pass', name: `${passType} · ${age}`, price: configuredPassTotal, image: pass.image }, 1, { detail: [paymentPlan, winterFoundation ? 'Cardrona Foundation support' : '', ...winterDonations.map((id) => `${CHARITY_LABELS[id]} +NZ$20.00`)].filter(Boolean).join(' · '), variant: `${passType}-${age}-${paymentPlan}-${winterFoundation}-${winterDonations.join(',')}`, ageBand: age }); navigate('/cart'); }, configuredPassTotal)}</>;

    if (path === '/checkout') return <><Stepper current={bookingStep + 2} lang={lang}/><main className="space-y-6 overflow-x-hidden px-4 pb-[160px] sm:px-8 sm:pb-[260px]"><section className="rounded-[22px] border border-[#e0e3e7] bg-white p-4 sm:p-7"><h2 className="font-serif text-[23px] font-bold sm:text-[32px]">Order summary</h2>{state.cart.length > 0 ? <div className="mt-4 space-y-3">{state.cart.map((item) => <div key={item.key} className="flex items-start justify-between gap-3 border-b border-[#e6edf4] pb-3 text-[13px]"><span className="min-w-0"><b className="block">{item.quantity} × {item.name}</b>{item.detail && <small className="mt-1 block text-[#718096]">{item.detail}</small>}</span><b className="shrink-0">{money(item.price * item.quantity)}</b></div>)}<p className="flex justify-between gap-3 pt-1 text-[14px] font-semibold"><span>Total due</span><span>{money(bookingTotal)}</span></p></div> : <p className="mt-3 text-[14px] text-[#68717f]">{passType} · {age} · {money(configuredPassTotal)} · {paymentPlan}</p>}</section>{bookingStep === 0 ? <><section><h3 className="flex items-center gap-2 text-[18px] font-semibold sm:text-[24px]"><CalendarDays className="h-5 w-5 text-[#c8102e] sm:h-7 sm:w-7"/>Visit details</h3>{state.cart.length > 0 ? <p className="mt-4 text-[13px] text-[#68717f]">{bookingDates.length ? (bookingDates.length === 1 ? 'Selected visit date: ' : 'Selected visit dates: ') : ''}{bookingDates.length ? bookingDates.join(', ') : 'No visit date is required for these items.'}</p> : <><div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4">{[['From', dateFrom, setDateFrom], ['To', dateTo, setDateTo]].map(([label, value, setValue]) => <label key={label} className="min-w-0 text-[13px] text-[#68717f] sm:text-[19px]">{label}<input type="date" value={value} min={dateFrom} onChange={(e) => setValue(e.target.value)} className="mt-2 h-14 min-w-0 w-full rounded-[17px] border border-[#dfe2e6] bg-white px-3 text-[14px] text-[#20242b] shadow-sm sm:mt-3 sm:h-[86px] sm:px-5 sm:text-[20px]" /></label>)}</div><p className="mt-2 text-[13px] text-[#68717f] sm:mt-3 sm:text-[18px]">{dateFrom} – {dateTo}</p></>}</section>{state.cart.length > 0 ? <section><h3 className="text-[18px] font-semibold sm:text-[24px]">Items in this order</h3><p className="mt-3 text-[13px] text-[#68717f]">{bookingQuantity} {bookingQuantity === 1 ? 'item' : 'items'} are included in the order.</p></section> : <section><h3 className="text-[18px] font-semibold sm:text-[24px]">Guests</h3><div className="mt-3 flex items-center gap-4 sm:mt-4 sm:gap-6"><button aria-label="Remove guest" onClick={() => changeBookingGuests(-1)} className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#dfe2e6] text-[#68717f] sm:h-20 sm:w-20"><Minus className="sm:h-7 sm:w-7"/></button><b className="min-w-8 text-center text-[20px] sm:min-w-10 sm:text-[27px]">{guests}</b><button aria-label="Add guest" onClick={() => changeBookingGuests(1)} className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#dfe2e6] text-[#68717f] sm:h-20 sm:w-20"><Plus className="sm:h-7 sm:w-7"/></button><span className="ml-auto text-right text-[13px] text-[#68717f] sm:text-[18px]">Order subtotal<br/>{money(bookingTotal)}</span></div></section>}<section className="rounded-[20px] border border-[#e0e3e7] bg-white p-4"><h3 className="font-serif text-[19px] font-bold sm:text-[23px]">Order details</h3><p className="mt-2 text-[14px] leading-6 text-[#68717f] sm:text-[17px]">Your selected products and options will be confirmed in the demo checkout.</p></section></> : bookingStep === 1 ? <section className="space-y-4 rounded-[22px] border border-[#dce4ed] bg-white p-4">
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
      <label className="flex items-start gap-2 text-[11px] leading-5 text-[#60738d]"><input type="checkbox" className="mt-1 accent-[#c8102e]" />I have read and agree to the terms that apply to the products in my order.</label>
      <p className="rounded-xl bg-[#f1f6fa] p-3 text-[10px] leading-4 text-[#718096]">Demo form only. Guest details and signatures are not saved or sent.</p>
    </section> : bookingStep === 2 ? <section className="space-y-4 rounded-[22px] border border-[#dce4ed] bg-white p-4">
      <div><h3 className="font-serif text-[22px] font-bold">Choose a payment method</h3><p className="mt-1 text-[11px] text-[#718096]">Tap one to select it. This is a demo checkout.</p></div>
      {[
        ['wechat', 'WeChat Pay', 'Scan or pay right inside WeChat', MessageSquare],
        ['card', 'Credit card / Visa / Mastercard', 'International cards, 3-D Secure supported', Ticket],
      ].map(([key, label, detail, Icon]) => <button key={key} type="button" onClick={() => setPayMethod(key)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${payMethod === key ? 'border-[#c8102e] bg-[#fff8f8]' : 'border-[#dce4ed] bg-[#f1f6fa]'}`}>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${payMethod === key ? 'bg-[#c8102e] text-white' : 'bg-[#e3ebf4] text-[#526d8b]'}`}><Icon className="h-4 w-4" /></span><span><b className="block text-[12px]">{label}</b><small className="text-[10px] text-[#718096]">{detail}</small></span><span className={`ml-auto h-4 w-4 rounded-full border ${payMethod === key ? 'border-[#c8102e] bg-[#c8102e] ring-2 ring-white' : 'border-[#bdc9d7]'}`} />
      </button>)}
      {payMethod === 'card' && <div className="space-y-2 rounded-xl border border-[#dce4ed] p-3"><div className="flex justify-between text-[11px]"><span>Card details</span><span className="text-[#718096]">3-D Secure</span></div><div className="rounded-lg border border-[#dce4ed] px-3 py-2 font-mono text-[12px] text-[#526d8b]">4242 4242 4242 4242</div><div className="grid grid-cols-2 gap-2"><div className="rounded-lg border border-[#dce4ed] px-3 py-2 text-[12px] text-[#718096]">MM/YY</div><div className="rounded-lg border border-[#dce4ed] px-3 py-2 text-[12px] text-[#718096]">CVC</div></div><p className="text-[10px] text-[#718096]">Sample card preview. Card information is not collected.</p></div>}
      <div className="rounded-xl bg-[#f1f6fa] p-3 text-[11px] text-[#60738d]"><ShieldCheck className="mr-1 inline h-4 w-4 text-emerald-600"/>Secure demo checkout. No payment will be taken.</div>
      <label className="flex items-center gap-2 text-[12px]"><input type="checkbox" defaultChecked className="accent-[#c8102e]"/>I accept the booking terms</label>
    </section> : <section className="space-y-4 py-3 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check className="h-8 w-8"/></span><h3 className="font-serif text-[24px] font-bold">Booking confirmed</h3><p className="text-[12px] text-[#68717f]">Your e-ticket is ready. Scan it at the lift gate.</p>
      <article className="overflow-hidden rounded-[18px] border border-[#dce4ed] bg-white text-left"><div className="bg-gradient-to-br from-[#45688c] to-[#17283f] px-4 py-3 text-white"><small>Order no.</small><b className="block font-mono text-[14px]">{confirmedOrder?.id || 'DEMO-ORDER'}</b></div><div className="space-y-2 p-4 text-[11px]"><div className="flex justify-between gap-2"><span className="text-[#718096]">Items</span><b className="text-right">{bookingName}</b></div><div className="flex justify-between"><span className="text-[#718096]">Visit date</span><b>{checkoutDate}</b></div><div className="flex justify-between"><span className="text-[#718096]">Payment method</span><b>{payMethod === 'wechat' ? 'WeChat Pay' : 'Credit card'}</b></div><div className="flex justify-between border-t border-dashed pt-2"><span className="text-[#718096]">Total (simulated)</span><b className="font-serif text-[18px] text-[#c8102e]">{money(bookingTotal)}</b></div></div></article>
      <div className="rounded-[18px] border border-[#dce4ed] bg-white p-4"><p className="mb-3 text-[11px] text-[#718096]">Ticket QR code (simulated)</p><div className="mx-auto w-fit rounded-xl border border-[#dce4ed] p-2"><QRCodeSVG value={confirmedOrder?.id || 'SKI-DEMO-ORDER'} size={148} fgColor="#344a64" /></div><p className="mt-2 font-mono text-[10px] tracking-wider text-[#60738d]">{confirmedOrder?.id || 'SKI-DEMO-ORDER'}</p></div>
      <p className="text-[10px] leading-4 text-[#718096]">Demo order only. No payment was taken and this QR code is not a valid product or lift ticket.</p><button onClick={() => navigate('/orders')} className="rounded-full bg-[#c8102e] px-6 py-3 text-[13px] font-semibold text-white">View my orders</button>
    </section>}</main>{bookingStep < 3 && actionBar(bookingStep === 2 ? 'Confirm demo booking' : 'Continue', () => { if (bookingStep === 2) { const order = { id: `DEMO-${Date.now().toString().slice(-6)}`, name: bookingName, date: bookingDates[0] || dateFrom, visit_dates: bookingDates, total: bookingTotal, payment_method: payMethod === 'wechat' ? 'WeChat Pay' : 'Credit card', status: 'Confirmed' }; setConfirmedOrder(order); setState((old) => ({ ...old, orders: [order, ...old.orders], cart: [] })); setBookingStep(3); } else setBookingStep((step) => step + 1); }, bookingTotal)}</>;

    if (path === '/cart') return <><Stepper current={1} lang={lang}/><main className="space-y-5 px-4 pb-6 pt-5 sm:px-8"><h2 className="font-serif text-[34px]">Cart</h2>{state.cart.length === 0 ? <section className="rounded-[22px] border bg-white px-5 py-10 text-center"><ShoppingBag className="mx-auto h-9 w-9 text-[#a1a6af]"/><p className="mt-3 text-[#68717f]">Your cart is empty.</p><Link to="/passes" className="mt-5 inline-flex rounded-full bg-[#c8102e] px-5 py-3 text-white">Explore passes</Link></section> : <>{state.cart.map((item) => <article key={item.key} className="overflow-hidden rounded-[22px] border border-[#e0e3e7] bg-white"><div className="bg-[#f1f1f3] px-4 py-3 text-[12px] font-semibold tracking-[0.15em] text-[#68717f]">UNASSIGNED</div><div className="p-4"><div className="flex items-start justify-between gap-3"><b className="text-[17px]">{item.name}</b><b className="shrink-0">{money(item.price * item.quantity)}</b></div>{item.detail && <p className="mt-2 inline-block rounded-full bg-[#f0f1f3] px-3 py-1 text-[12px] text-[#68717f]">{item.detail}</p>}<div className="mt-3 flex items-center gap-4 text-[13px]"><button onClick={() => announce(`${item.name}: details`)} className="text-[#68717f] underline">SHOW DETAILS</button><button onClick={() => updateQuantity(item.key, -item.quantity)} className="text-[#68717f] underline">REMOVE</button><div className="ml-auto flex items-center gap-2"><button aria-label="Decrease" onClick={() => updateQuantity(item.key, -1)}><Minus className="h-4 w-4"/></button><span>{item.quantity}</span><button aria-label="Increase" onClick={() => updateQuantity(item.key, 1)}><Plus className="h-4 w-4"/></button></div></div></div></article>)}<section className="rounded-[22px] border border-[#e0e3e7] bg-[#f6f7f8] p-5"><h3 className="font-serif text-[23px] font-bold">Order Summary</h3><div className="mt-4 flex justify-between text-[15px] text-[#68717f]"><span>Sub-Total</span><span>{money(cartTotal)}</span></div><div className="mt-4 flex items-center justify-between gap-2 text-[17px] font-semibold"><span>Total (incl GST)</span><span className="font-serif text-[27px] text-[#c8102e]">{money(total)}</span></div><button onClick={() => setDiscountOpen(true)} className="mt-4 h-12 w-full rounded-full border border-[#e0e3e7] bg-white font-medium shadow-sm">Apply Discount Code</button><button onClick={() => { setBookingStep(0); navigate('/checkout'); }} className="mt-3 h-14 w-full rounded-full bg-[#c8102e] text-[18px] font-semibold text-white">Checkout</button><Link to="/shop" className="mt-5 block text-center text-[13px] text-[#68717f] underline">CONTINUE SHOPPING</Link></section></>}</main></>;

    if (path === '/shop' || path === '/retail') {
      const categories = ['New arrivals', 'All', 'Men', 'Women', 'Accessories'];
      const shown = products.filter((item) => (filter === 'All' || filter === 'New arrivals' || item.category === filter) && (filter !== 'Favorites' || state.favorites.includes(item.id)));
      return <><main className="px-4 pb-[150px] pt-4 sm:px-8 sm:pb-[220px]"><div className="flex gap-2 overflow-x-auto pb-2">{categories.map((item) => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-full px-4 py-2.5 text-[13px] ${filter === item ? 'bg-[#c8102e] text-white' : 'bg-[#f0f1f3] text-[#68717f]'}`}>{item}</button>)}<button onClick={() => navigate('/cart')} aria-label="Open cart" className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"><ShoppingBag className="h-5 w-5"/><span className="absolute ml-9 -mt-7 rounded-full bg-[#c8102e] px-1 text-[10px] text-white">{cartCount}</span></button></div><div className="mb-3 flex gap-2 overflow-x-auto">{['All brands', 'CARDRONA CORNER', 'ICEBREAKER', 'BURTON'].map((item, i) => <button key={item} onClick={() => i && announce(`${item} selected`)} className={`shrink-0 rounded-full border px-3 py-2 text-[12px] ${i === 0 ? 'border-[#c8102e] text-[#c8102e]' : 'border-[#e0e3e7] text-[#68717f]'}`}>{item}</button>)}</div><div className="grid grid-cols-2 gap-3">{shown.map((item) => <article key={item.id} className="overflow-hidden rounded-[20px] border border-[#e0e3e7] bg-white"><div className="relative"><img src={item.image} alt={item.name} className="h-[180px] w-full bg-[#eff0f1] object-cover"/><span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-[11px] text-white">{item.category}</span><button onClick={() => toggleFavorite(item.id)} className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white" aria-label="Toggle favorite"><Heart className={`h-5 w-5 ${state.favorites.includes(item.id) ? 'fill-[#c8102e] text-[#c8102e]' : ''}`}/></button>{item.tag && <span className="absolute bottom-3 left-3 rounded-full bg-[#c8102e] px-3 py-1 text-[11px] text-white">{item.tag}</span>}</div><div className="p-3"><small className="text-[10px] tracking-[0.1em] text-[#68717f]">CARDRONA CORNER</small><h2 className="mt-1 min-h-[42px] text-[14px] font-medium leading-5">{item.name}</h2><p className="mt-2 font-serif text-[20px] text-[#c8102e]">{money(item.price)}</p><button onClick={() => { addToCart(item); announce('Added to cart'); }} className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#c8102e] text-[14px] font-semibold text-white"><ShoppingBag className="h-4 w-4"/>Add to cart</button></div></article>)}</div></main>{cartCount > 0 && <div className="absolute inset-x-0 bottom-[76px] z-20 mx-auto max-w-[430px] border-t bg-white/95 px-4 py-3 backdrop-blur sm:bottom-[120px]"><button onClick={() => navigate('/cart')} className="flex h-14 w-full items-center justify-between rounded-full bg-[#c8102e] px-5 text-white"><span className="flex items-center gap-3"><ShoppingBag className="h-5 w-5"/>Cart · {cartCount} items</span><b>{money(cartTotal)} <ArrowRight className="ml-2 inline h-5 w-5"/></b></button></div>}</>;
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
        <div className="flex gap-2">{['All', 'Ski passes', 'Mountain store'].map((category) => <button key={category} onClick={() => { setOrdersCategory(category); setVisibleOrders(3); }} className={`rounded-full px-3 py-2 text-[10px] ${ordersCategory === category ? 'bg-[#d31328] text-white' : 'bg-[#e3ebf4] text-[#718096]'}`}>{category}</button>)}</div>
        <div className="rounded-xl bg-[#e3ebf4] px-3 py-2 text-[9px] text-[#718096]">Includes eligible agent bookings made with discount codes</div>
        {filteredOrders.length ? <div className="space-y-2.5">{filteredOrders.slice(0, visibleOrders).map((order) => <article key={order.id} className="rounded-[17px] border border-[#dce4ed] bg-white p-3.5 shadow-sm"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="line-clamp-2 font-serif text-[13px] font-semibold text-[#344a64]">{order.name}</h3><p className="mt-1 font-mono text-[9px] text-[#718096]">{order.id}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[9px] ${order.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' : order.status === 'Redeemed' ? 'bg-[#e3ebf4] text-[#526d8b]' : 'bg-sky-50 text-sky-700'}`}>{order.status}</span></div><div className="mt-3 flex items-center justify-between text-[10px]"><span className="text-[#718096]">{order.date} · {order.guests} {order.guests === 1 ? 'guest' : 'guests'}</span><b className="font-serif text-[15px] font-normal text-[#c8102e]">{money(order.total)}</b></div><button onClick={() => announce(`E-ticket ${order.id} is ready in this demo`)} aria-label={`View ${order.id}`} className="mt-1 flex w-full justify-end text-[#718096]"><ChevronRight className="h-4 w-4"/></button></article>)}</div> : <p className="rounded-xl border border-[#dce4ed] bg-white p-8 text-center text-[12px] text-[#718096]">No orders in this view.</p>}
        {filteredOrders.length > visibleOrders && <button onClick={() => setVisibleOrders((count) => count + 5)} className="w-full rounded-full border border-[#dce4ed] bg-white py-2.5 text-[10px] text-[#526d8b]">Load more ({filteredOrders.length - visibleOrders} left)</button>}
      </main>;
    }

    if (path === '/account') return <main className="space-y-3 px-4 pb-8 pt-4 sm:px-8">
      <section className="rounded-[18px] border border-[#dce4ed] bg-white p-4">
        <div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e3ebf4] font-serif text-lg text-[#526d8b]">G</span><div><b className="text-[14px]">Guest visitor</b><span className="mt-1 block w-fit rounded-full bg-[#e3ebf4] px-2.5 py-1 text-[10px] text-[#526d8b]">Normal visitor</span></div></div>
        <button onClick={() => announce('Agent sign-in is a demo option')} className="mt-3 w-full border-t border-[#e6edf4] pt-3 text-center text-[11px] text-[#718096]">Already an agent? <span className="font-semibold text-[#c8102e]">Agent login</span></button>
      </section>
      <section className="overflow-hidden rounded-[18px] border border-[#dce4ed] bg-white text-[11px]">
        <div className="border-b border-[#e6edf4] px-4 py-3"><span className="block text-[#718096]">Email</span><span className="mt-0.5 block text-[12px] text-[#344a64]">Add an email for booking updates</span></div>
        <div className="px-4 py-3"><span className="block text-[#718096]">Name</span><span className="mt-0.5 block text-[12px] text-[#344a64]">Guest visitor</span></div>
      </section>
      <section className="overflow-hidden rounded-[18px] border border-[#dce4ed] bg-white px-4">
        {[["My bookings", "Bookings and e-tickets", Ticket, '/orders'], ["Saved items", "Saved passes and store items", Heart, '/shop'], ["Agent distribution centre", "Commission, agent codes and share links", Sparkles, '/login'], ["Mountain info & help", "Access, trails and FAQs", Headset, '/support']].map(([label, detail, Icon, to]) => <button key={label} onClick={() => label === 'Agent distribution centre' ? announce('Agent sign-in is a demo option') : navigate(to)} className="flex w-full items-center gap-3 border-b border-[#e6edf4] py-3.5 text-left last:border-0"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf0f6] text-[#c8102e]"><Icon className="h-4 w-4" /></span><span className="min-w-0"><b className="block text-[12px] font-medium text-[#344a64]">{label}</b><small className="mt-0.5 block text-[10px] text-[#718096]">{detail}</small></span><ChevronRight className="ml-auto h-4 w-4 shrink-0 text-[#718096]" /></button>)}
      </section>
      <p className="px-3 text-center text-[9px] leading-4 text-[#718096]">Demo build · payments and resort systems are simulated</p>
    </main>;

    if (path === '/account' || path === '/login' || path === '/register') return <main className="space-y-5 px-4 pb-8 pt-5 sm:px-8"><h2 className="font-serif text-[32px]">{path === '/register' ? 'Create your account' : path === '/login' ? 'Log in' : 'Welcome back'}</h2><section className="rounded-[22px] border bg-white p-5"><div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-[#c8102e]"><UserRound className="h-7 w-7"/></span><div><b>Guest account</b><p className="text-[13px] text-[#68717f]">Sign in to manage bookings and passes</p></div></div><div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => announce('WeChat sign-in is a demo option')} className="h-12 rounded-xl border font-medium">Log in with WeChat</button><button onClick={() => navigate('/login')} className="h-12 rounded-xl border font-medium">Log in with number</button></div><label className="mt-5 block text-[14px]">Mobile number<input type="tel" placeholder="+64 21 000 0000" className="mt-2 h-12 w-full rounded-xl border px-3"/></label><button onClick={() => { setSmsSent(true); announce('Demo verification code: 123456'); }} className="mt-3 h-12 w-full rounded-xl bg-[#c8102e] font-semibold text-white">Send SMS code</button>{smsSent && <label className="mt-3 block text-[14px]">SMS verification code<input inputMode="numeric" maxLength={6} placeholder="Enter 123456 to continue" className="mt-2 h-12 w-full rounded-xl border px-3"/></label>}<Link to="/register" className="mt-4 block text-center text-[14px] text-[#c8102e]">Create an account</Link></section><section className="rounded-[20px] border bg-white p-4">{[['My bookings', Ticket], ['Saved items', Heart], ['Payment methods', ShoppingBag], ['Mountain help', Headset]].map(([label, Icon]) => <button key={label} onClick={() => label === 'Saved items' ? navigate('/shop') : label === 'My bookings' ? navigate('/orders') : navigate('/support')} className="flex w-full items-center gap-3 border-b py-4 text-left last:border-b-0"><Icon className="h-5 w-5 text-[#68717f]"/>{label}<ChevronRight className="ml-auto h-4 w-4 text-[#68717f]"/></button>)}</section></main>;

    if (path === '/lessons') return <main className="space-y-4 px-4 pb-8 pt-5 sm:px-8"><img src={lessonPhoto} alt="Ski lesson at Cardrona" className="h-52 w-full rounded-[22px] object-cover"/><h2 className="font-serif text-[30px]">Ski lessons</h2><p className="text-[#68717f]">Find your feet on snow with supportive instructors and small groups for every level.</p>{[['First-timer package', 249], ['Group lesson', 169], ['Private lesson', 529]].map(([name, price]) => <article key={name} className="flex items-center justify-between rounded-[20px] border bg-white p-4"><div><b>{name}</b><p className="mt-1 text-[13px] text-[#68717f]">Choose a date and session</p><strong className="mt-2 block font-serif text-xl text-[#c8102e]">{money(price)}</strong></div><button onClick={() => { addToCart({ id: `lesson-${name}`, name, price }); navigate('/cart'); }} className="rounded-full bg-[#c8102e] px-4 py-2.5 text-[13px] font-semibold text-white">Book</button></article>)}</main>;

    if (path === '/transport' || path === '/ski' || path === '/support') return <main className="space-y-4 px-4 pb-8 pt-5 sm:px-8"><section className="rounded-[22px] border bg-white p-5"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-[#c8102e]">{path === '/transport' ? <Bus/> : path === '/ski' ? <Map/> : <Headset/>}</span><h2 className="mt-4 font-serif text-[27px]">{title}</h2><p className="mt-2 text-[14px] leading-6 text-[#68717f]">{path === '/transport' ? 'Plan your mountain shuttle from Wanaka or Queenstown. Select a return transfer and travel date.' : path === '/ski' ? 'Check today’s trail and lift status across Cardrona and Treble Cone.' : 'Our mountain team is here to help with bookings, transport, rentals, and your day on the snow.'}</p>{path === '/ski' ? <div className="mt-5 grid grid-cols-2 gap-3">{[['Open trails', '68 / 78'], ['Lifts running', '5 / 8'], ['New snow', '12 cm'], ['Wind', '3 km/h']].map(([l, v]) => <div key={l} className="rounded-xl bg-[#f3f4f6] p-4"><span className="text-[12px] text-[#68717f]">{l}</span><b className="mt-1 block text-[19px]">{v}</b></div>)}</div> : <button onClick={() => path === '/transport' ? announce('Added mountain shuttle to your trip') : announce('Support request started')} className="mt-5 h-12 w-full rounded-full bg-[#c8102e] font-semibold text-white">{path === '/transport' ? 'Book transport' : 'Contact support'}</button>}</section></main>;
    return <main className="p-8 text-center text-[#68717f]">This demo page is not available.</main>;
  };

  return <div className="h-screen overflow-hidden bg-[#e8edf3] p-2 text-[#20242b] sm:px-4 sm:py-4"><div className="relative mx-auto flex h-full w-full max-w-[430px] flex-col overflow-hidden rounded-[14px] border border-[#d2d6db] bg-[#f1f5f9] shadow-[0_5px_14px_rgba(24,32,43,0.12)] sm:h-[calc(100vh-32px)] sm:rounded-[24px]"><CustomerHeader title={title} home={isHome} onBack={goBack} lang={lang} setLang={setLang} mountain={mountain} setMountain={setMountain}/><div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">{content()}</div>{notice && <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#20242b] px-5 py-3 text-sm text-white shadow-lg">{notice}</div>}{discountOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5"><section className="w-full max-w-md rounded-[20px] bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Discount code</h2><button onClick={() => setDiscountOpen(false)} aria-label="Close"><X/></button></div><input value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="Enter code (try PEAK10)" className="mt-5 h-12 w-full rounded-xl border px-3"/><button onClick={() => { setDiscountOpen(false); announce(discount.toUpperCase() === 'PEAK10' ? '10% discount applied' : 'Code not recognized'); }} className="mt-3 h-12 w-full rounded-full bg-[#c8102e] font-semibold text-white">Apply code</button></section></div>}<BottomNav path={path} lang={lang} count={cartCount}/></div></div>;
}
