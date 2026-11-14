import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bike, CalendarDays, Check, ShieldCheck } from 'lucide-react';
import DateAvailabilityCalendar from './DateAvailabilityCalendar';

const BIKE_TYPES = ['Enduro', 'Downhill', 'Full Suspension'];
const SIZES = {
  Enduro: ['Small · Rider height 155 - 165cm', 'Medium · Rider height 165 - 177cm', 'Large · Rider height 177 - 188cm', 'X-Large · Rider height 188 - 195cm'],
  Downhill: ['Medium · Rider height 168 - 178cm', 'Large · Rider height 178 - 188cm', 'X-Large · Rider height 188cm+'],
  'Full Suspension': ['Youth 24" · Rider height 125 - 145cm', 'Small · Rider height 145 - 165cm', 'Medium · Rider height 165 - 177cm', 'Large · Rider height 177 - 188cm'],
};
const SUMMER_START = '2026-12-12';
const SUMMER_END = '2027-02-28';
const PRICES = {
  Enduro: { Adult: 219, Child: 159 },
  Downhill: { Adult: 219, Child: 179 },
  'Full Suspension': { Adult: 219, Child: 159 },
};
const RENTAL_PRICES = { Enduro: { Adult: 174, Child: 89 }, Downhill: { Adult: 194, Child: 99 }, 'Full Suspension': { Adult: 174, Child: 99 } };
const money = (value) => `NZ$${Number(value).toFixed(2)}`;
const formatDate = (value) => value ? new Intl.DateTimeFormat('en-NZ', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) : 'No date selected';
const defaultSize = (type, age) => type === 'Full Suspension' && age === 'Child' ? SIZES[type][0] : SIZES[type][SIZES[type].length - 1];

export default function BikePackageConfigurator({ onAdd, onCheckout, cartTotal = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const rentalOnly = new URLSearchParams(location.search).get('product') === 'bike-rental';
  const [date, setDate] = useState('');
  const [age, setAge] = useState('Adult');
  const [bike, setBike] = useState('Enduro');
  const [size, setSize] = useState(defaultSize('Enduro', 'Adult'));
  const [halfDay, setHalfDay] = useState(false);
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [itemAdded, setItemAdded] = useState(false);

  const basePrice = (rentalOnly ? RENTAL_PRICES : PRICES)[bike][age];
  const packagePrice = Math.max(0, basePrice - (halfDay ? (age === 'Adult' ? 30 : 20) : 0));
  const insurancePrice = insuranceSelected ? 25 : 0;
  const price = packagePrice + insurancePrice;
  const productName = `${halfDay ? 'Half Day' : '1 Day'} ${rentalOnly ? '' : 'Lift + '}${bike} Bike - ${size.split(' · ')[0]} - ${age}`;

  const addPackage = () => {
    onAdd({
      id: rentalOnly ? 'bike-rental' : 'lift-bike-package',
      name: productName,
      price,
      visitDate: date,
      ageBand: age,
      detail: `${date} · ${halfDay ? 'Half Day Package' : 'Full Day Package'} · ${bike} · ${size}${rentalOnly ? ' · Rental only' : ' · Lift included'}${insuranceSelected ? ' · Bike Insurance · NZ$25/day' : ''}`,
      variant: `${date}-${age}-${bike}-${size}-${halfDay}-${rentalOnly}-${insuranceSelected}`,
    });
    setItemAdded(true);
  };

  return <main className="space-y-5 px-4 pb-[150px] pt-5 sm:px-8 sm:pb-[220px]">
    <section>
      <h2 className="font-serif text-[25px] font-bold text-[#202b3a]">{rentalOnly ? 'Bike Rental' : 'Lift Pass + Bike Rental'}</h2>
      <p className="mt-2 text-[12px] leading-5 text-[#718096]">{rentalOnly ? 'Choose your mountain bike, size and rental date.' : 'Choose a lift and bike package for your mountain day.'}</p>
    </section>

    <section className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="mb-2 text-[13px] font-semibold text-[#344a64]">Package</legend>
        <button type="button" onClick={() => setHalfDay(false)} aria-pressed={!halfDay} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${!halfDay ? 'border-[#5b8199] bg-white' : 'border-[#cbd7e4] bg-white'}`}>
          <CalendarDays className="h-5 w-5 text-[#526d8b]"/><span><b className="block text-[12px]">1 Day Package</b><small className="text-[10px] text-[#718096]">{rentalOnly ? 'Full day bike rental' : 'Full day lift access and bike rental'}</small></span><span className={`ml-auto h-5 w-5 rounded-full border ${!halfDay ? 'border-[6px] border-[#5b8199]' : 'border-[#9ca3af]'}`} />
        </button>
        <button type="button" onClick={() => setHalfDay(true)} aria-pressed={halfDay} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${halfDay ? 'border-[#5b8199] bg-white' : 'border-[#cbd7e4] bg-white'}`}>
          <CalendarDays className="h-5 w-5 text-[#526d8b]"/><span><b className="block text-[12px]">Half Day Package</b><small className="text-[10px] text-[#718096]">Sat–Thu from 1pm · Fri TGIF from 4pm</small></span><span className={`ml-auto h-5 w-5 rounded-full border ${halfDay ? 'border-[6px] border-[#5b8199]' : 'border-[#9ca3af]'}`} />
        </button>
      </fieldset>

      <DateAvailabilityCalendar value={date} onChange={setDate} min={SUMMER_START} max={SUMMER_END} isUnavailable={(value) => {
        const weekday = new Date(`${value}T00:00:00Z`).getUTCDay();
        const peakSeason = value >= '2026-12-28' && value <= '2027-01-17';
        return value === '2026-12-25' || (!peakSeason && (weekday === 2 || weekday === 3));
      }} required />

      <label className="block text-[13px] font-semibold text-[#344a64]">Adult or Child
        <select value={age} onChange={(event) => { setAge(event.target.value); setSize(defaultSize(bike, event.target.value)); }} className="mt-2 h-12 w-full rounded-xl border border-[#cbd7e4] bg-white px-3 text-[13px] font-normal text-[#344a64]"><option>Adult</option><option>Child</option></select>
      </label>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-[13px] font-semibold text-[#344a64]">Choose type of bike</legend>
        {BIKE_TYPES.map((type) => <button key={type} type="button" onClick={() => { setBike(type); setSize(defaultSize(type, age)); }} aria-pressed={bike === type} className={`flex h-12 w-full items-center gap-3 rounded-xl border px-3 text-left text-[13px] font-semibold ${bike === type ? 'border-[#5b8199] bg-white text-[#344a64]' : 'border-[#cbd7e4] bg-white text-[#344a64]'}`}><Bike className="h-5 w-5 text-[#526d8b]"/>{type}<span className={`ml-auto h-5 w-5 rounded-full border ${bike === type ? 'border-[6px] border-[#5b8199]' : 'border-[#9ca3af]'}`} /></button>)}
      </fieldset>

      <label className="block text-[13px] font-semibold text-[#344a64]">Choose your size
        <select value={size} onChange={(event) => setSize(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#cbd7e4] bg-white px-3 text-[12px] font-normal text-[#344a64]">{SIZES[bike].map((option) => <option key={option}>{option}</option>)}</select>
      </label>

      <section>
        <h3 className="text-[13px] font-semibold text-[#344a64]">Bike Insurance Add On</h3>
        <p className="mt-1 text-[12px] leading-5 text-[#718096]">Add on Bike Insurance. We recommend adding insurance. If equipment is unreturned or damaged, Cardrona may charge your credit card.</p>
        <p className="mt-2 text-[12px]">Select One (Optional)</p>
        <label className={`mt-2 flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${insuranceSelected ? 'border-[#5b8199] bg-[#f5f8fb]' : 'border-[#a0a0a0] bg-white'}`}>
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#526d8b]"/>
          <span className="min-w-0 flex-1"><b className="block text-[13px] text-[#202b3a]">Bike Insurance</b><small className="mt-2 block text-[11px] text-[#777]">Per day</small><span className="mt-2 block text-[13px]">+ NZ$25.00</span></span>
          <input type="checkbox" checked={insuranceSelected} onChange={(event) => setInsuranceSelected(event.target.checked)} className="mt-1 h-4 w-4 accent-[#5b8199]"/>
        </label>
      </section>
    </section>

    <section className="rounded-[18px] border border-[#dce4ed] bg-white p-4 shadow-sm">
      <h3 className="font-serif text-[17px] font-bold text-[#202b3a]">Item Summary</h3>
      <div className="mt-3 border-b border-[#cbd7e4] pb-3 text-[12px]"><b className="block">Start Date</b><span className="mt-1 block text-[#718096]">{formatDate(date)}</span><b className="mt-3 block">(1) {productName}</b><span className="mt-1 block">{money(packagePrice)}</span>{insuranceSelected && <div className="mt-3"><b className="block">(1) Bike Insurance</b><span className="mt-1 block">{money(insurancePrice)} · per day</span></div>}</div>
      <div className="mt-3 flex items-center justify-between text-[16px] font-semibold"><span>Total</span><span>{money(price)}</span></div>
    </section>

    <div className="fixed inset-x-0 bottom-[64px] z-20 mx-auto flex w-full max-w-[430px] items-center gap-3 border-t border-[#dce4ed] bg-white/95 px-4 py-3 backdrop-blur sm:bottom-[120px]">
      <span className="mr-auto"><small className="block text-[10px] text-[#718096]">Total</small><b className="font-serif text-[20px] text-[#c8102e]">{money(price)}</b></span>
      <button type="button" disabled={!date} onClick={addPackage} className="h-11 flex-1 rounded-xl bg-[#5b8199] text-[13px] font-semibold tracking-wide text-white disabled:cursor-not-allowed disabled:bg-[#c9c9c9]">Add to cart</button>
    </div>

    {itemAdded && <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/25 p-2 sm:items-center"><section role="dialog" aria-modal="true" aria-labelledby="bike-item-added-title" className="w-full max-w-[430px] rounded-t-2xl border border-[#dce4ed] bg-white p-4 shadow-xl sm:rounded-2xl">
      <div className="flex items-center gap-2"><Check className="h-5 w-5 text-emerald-700"/><h2 id="bike-item-added-title" className="text-[17px] font-bold">Item Added</h2><button type="button" onClick={() => setItemAdded(false)} aria-label="Close" className="ml-auto px-2 text-xl">×</button></div>
      <p className="mt-3 text-[13px] font-semibold">{formatDate(date)}</p><div className="mt-3 flex justify-between gap-3 border-b border-[#dce4ed] pb-3 text-[12px]"><span>1 {productName}</span><b className="shrink-0">{money(packagePrice)}</b></div>{insuranceSelected && <div className="flex justify-between gap-3 border-b border-[#dce4ed] py-2 text-[12px]"><span>1 Bike Insurance · per day</span><b className="shrink-0">{money(insurancePrice)}</b></div>}
      <div className="space-y-1 py-3 text-[12px]"><p className="flex justify-between"><span>Per item total</span><span>{money(price)}</span></p><p className="flex justify-between font-semibold"><span>Cart total</span><span>{money(cartTotal + price)}</span></p></div>
      <p className="bg-[#f7f8f9] px-2 py-3 text-center text-[11px]">Payment is available at checkout. No real charge is made.</p>
      <div className="mt-3 grid grid-cols-2 gap-3"><button type="button" onClick={() => navigate('/cart')} className="h-11 rounded-xl border border-[#344a64] text-[12px]">View Cart</button><button type="button" onClick={onCheckout} className="h-11 rounded-xl bg-[#5b8199] text-[12px] font-semibold text-white">Checkout</button></div>
    </section></div>}
  </main>;
}
