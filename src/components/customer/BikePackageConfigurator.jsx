import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bike, CalendarDays, Check, ShieldCheck } from 'lucide-react';
import DateAvailabilityCalendar from './DateAvailabilityCalendar';
import { useLang } from '@/lib/i18n';
import { LocalizeCustomerTree } from '@/lib/customerLocale';
import AgeFirstGuestCounts from './AgeFirstGuestCounts';
import ProductSummaryCard from './ProductSummaryCard';
import ProductIntro from './ProductIntro';
import { cardronaImage } from '@/lib/cardronaImages';

const BIKE_TYPES = ['Enduro', 'Downhill', 'Full Suspension'];
const SIZES = {
  Enduro: ['Small · Rider height 155 - 165cm', 'Medium · Rider height 165 - 177cm', 'Large · Rider height 177 - 188cm', 'X-Large · Rider height 188 - 195cm'],
  Downhill: ['Medium · Rider height 168 - 178cm', 'Large · Rider height 178 - 188cm', 'X-Large · Rider height 188cm+'],
  'Full Suspension': ['Youth 24" · Rider height 125 - 145cm', 'Small · Rider height 145 - 165cm', 'Medium · Rider height 165 - 177cm', 'Large · Rider height 177 - 188cm'],
};
const RENTAL_SIZES = {
  Enduro: SIZES.Enduro,
  Downhill: ['Large · Rider height 174 - 188cm', 'Medium · Rider height 168 - 178cm', 'X-Large · Rider height 186cm+'],
  'Full Suspension': SIZES['Full Suspension'],
};
const SUMMER_START = '2026-12-12';
const SUMMER_END = '2027-02-28';
const PRICES = {
  fullDay: {
    Enduro: { Adult: 219, Child: 159 },
    Downhill: { Adult: 229, Child: 179 },
    'Full Suspension': { Adult: 219, Child: 159 },
  },
  halfDay: {
    Enduro: { Adult: 169, Child: 119 },
    'Full Suspension': { Adult: 169, Child: 119 },
  },
};
const RENTAL_PRICES = { Enduro: 149, Downhill: 169, 'Full Suspension': 169 };
const money = (value) => `NZ$${Number(value).toFixed(2)}`;
const formatDate = (value) => value ? new Intl.DateTimeFormat('en-NZ', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) : 'No date selected';
const defaultSize = (type, age) => type === 'Full Suspension' && age === 'Child' ? SIZES[type][0] : SIZES[type][SIZES[type].length - 1];

export default function BikePackageConfigurator({ onAdd, onCheckout, cartTotal = 0 }) {
  const { lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const rentalOnly = new URLSearchParams(location.search).get('product') === 'bike-rental';
  const [date, setDate] = useState('');
  const ageOptions = [{ value: 'Adult', label: 'Adult: 18+' }, { value: 'Child', label: 'Child: 6 - 17 yrs' }];
  const [ageStage, setAgeStage] = useState('counts');
  const [guestCounts, setGuestCounts] = useState({ Adult: 1, Child: 0 });
  const ageEntries = ageOptions.map((option) => ({ ...option, quantity: guestCounts[option.value] || 0 })).filter((option) => option.quantity > 0);
  const guestCount = ageEntries.reduce((sum, option) => sum + option.quantity, 0);
  const age = ageEntries[0]?.value || 'Adult';
  const [bike, setBike] = useState('Enduro');
  const [size, setSize] = useState(defaultSize('Enduro', 'Adult'));
  const [halfDay, setHalfDay] = useState(false);
  const [halfDayType, setHalfDayType] = useState('weekday');
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [itemAdded, setItemAdded] = useState(false);

  const selectedDefaultSize = (type, riderAge) => !rentalOnly && type === 'Full Suspension'
    ? SIZES[type][0]
    : defaultSize(type, riderAge);

  const basePrice = rentalOnly ? RENTAL_PRICES[bike] : PRICES[halfDay ? 'halfDay' : 'fullDay'][bike][age];
  const packagePrice = rentalOnly ? basePrice : ageEntries.reduce((sum, entry) => sum + PRICES[halfDay ? 'halfDay' : 'fullDay'][bike][entry.value] * entry.quantity, 0);
  const insurancePrice = insuranceSelected ? 25 * (rentalOnly ? 1 : guestCount) : 0;
  const price = packagePrice + insurancePrice;
  const sizeName = size.split(' · ')[0];
  const productName = rentalOnly
    ? `Bike Rental - ${size ? `${sizeName} - ` : ''}${bike}`
    : `${halfDay ? halfDayType === 'friday' ? 'TGIF' : 'Afternoon' : '1 Day'} Lift + ${bike === 'Full Suspension' ? 'Full Suspension - 24"' : `${bike} Bike - ${sizeName}`} - ${age}`;
  const displayMoney = (value) => `$${Number(value).toFixed(0)}`;
  const bikeSizes = rentalOnly ? RENTAL_SIZES[bike] : bike === 'Full Suspension' ? [SIZES[bike][0]] : SIZES[bike];
  const needsRentalSize = rentalOnly && bike === 'Full Suspension';
  const hasRentalSelection = !needsRentalSize || Boolean(size);

  const selectDate = (value) => {
    setDate(value);
    if (!rentalOnly && halfDay) {
      setHalfDayType(new Date(`${value}T00:00:00Z`).getUTCDay() === 5 ? 'friday' : 'weekday');
    }
  };

  const selectHalfDayType = (type) => {
    setHalfDayType(type);
    if (date) {
      const isFriday = new Date(`${date}T00:00:00Z`).getUTCDay() === 5;
      if ((type === 'friday') !== isFriday) setDate('');
    }
  };

  const selectDuration = (isHalfDay) => {
    setHalfDay(isHalfDay);
    if (isHalfDay && bike === 'Downhill') {
      setBike('Enduro');
      setSize(defaultSize('Enduro', age));
    }
    if (isHalfDay && date) {
      setHalfDayType(new Date(`${date}T00:00:00Z`).getUTCDay() === 5 ? 'friday' : 'weekday');
    }
  };

  const addPackage = () => {
    if (rentalOnly) {
      onAdd({ id: 'bike-rental', name: productName, price, visitDate: date, detail: `${date} · Bike Rental · ${bike}${size ? ` · ${size}` : ''}${insuranceSelected ? ' · Bike Insurance · $25/day' : ''}`, variant: `${date}-${bike}-${size}-${insuranceSelected}` });
    } else ageEntries.forEach((entry) => onAdd({
      id: 'lift-bike-package',
      name: `${halfDay ? halfDayType === 'friday' ? 'TGIF' : 'Afternoon' : '1 Day'} Lift + ${bike === 'Full Suspension' ? 'Full Suspension - 24"' : `${bike} Bike - ${sizeName}`} - ${entry.value}`,
      price: PRICES[halfDay ? 'halfDay' : 'fullDay'][bike][entry.value] + (insuranceSelected ? 25 : 0),
      quantity: entry.quantity,
      visitDate: date,
      ageBand: entry.value,
      detail: `${date} · ${halfDay ? 'Half Day Package' : 'Full Day Package'} · ${bike} · ${size} · Lift included${insuranceSelected ? ' · Bike Insurance · NZ$25/day' : ''}`,
      variant: `${date}-${entry.value}-${bike}-${size}-${halfDay}-${insuranceSelected}`,
    }));
    setItemAdded(true);
  };

  return <LocalizeCustomerTree lang={lang}><main className="space-y-5 px-4 pb-8 pt-5 sm:px-8">
    <ProductIntro
      title={rentalOnly ? 'Bike Rental' : 'Lift Pass + Bike Rental'}
      season="Summer"
      image={cardronaImage(rentalOnly ? 'summer-bike-rental.webp' : 'summer-lift-bike-combo.webp')}
      imageAlt={rentalOnly ? 'Mountain bike rental at Cardrona' : 'Mountain biking at Cardrona'}
      description={rentalOnly ? 'Rent an enduro or downhill bike and hit the trails. Summer rentals include a helmet and safety pads.' : 'Get your lift pass and bike rental together in one easy booking at Cardrona Bike Park.'}
      details={rentalOnly ? 'Choose the bike style and size that best suits your day on the mountain.' : 'Choose each rider’s age group, visit date, bike style, and size. Full-day and half-day options are available.'}
    />

    <section className="space-y-4">
      {!rentalOnly && ageStage === 'counts' ? <AgeFirstGuestCounts options={ageOptions} counts={guestCounts} onChange={(value, count) => setGuestCounts((current) => ({ ...current, [value]: count }))} onContinue={() => setAgeStage('options')} continueLabel={`Continue with ${guestCount} ${guestCount === 1 ? 'guest' : 'guests'}`} /> : <>
      {!rentalOnly && <button type="button" onClick={() => setAgeStage('counts')} className="text-[13px] text-[#5b8199] underline">Edit guest counts</button>}
      {rentalOnly && <DateAvailabilityCalendar value={date} onChange={selectDate} min={SUMMER_START} max={SUMMER_END} isUnavailable={(value) => {
        const weekday = new Date(`${value}T00:00:00Z`).getUTCDay();
        const peakSeason = value >= '2026-12-28' && value <= '2027-01-17';
        return value === '2026-12-25' || (!peakSeason && (weekday === 2 || weekday === 3));
      }} required />}

      {!rentalOnly && <fieldset className="space-y-2">
        <legend className="mb-2 text-[13px] font-semibold text-[#344a64]">{rentalOnly ? 'Package' : 'Choose your Duration'}</legend>
        <button type="button" onClick={() => selectDuration(false)} aria-pressed={!halfDay} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${!halfDay ? 'border-[#5b8199] bg-white' : 'border-[#cbd7e4] bg-white'}`}>
          <CalendarDays className="h-5 w-5 text-[#526d8b]"/><span><b className="block text-[12px]">{rentalOnly ? '1 Day Package' : 'Full Day Package'}</b><small className="text-[10px] text-[#718096]">{rentalOnly ? 'Full day bike rental' : '1 Day'}</small></span><span className={`ml-auto h-5 w-5 rounded-full border ${!halfDay ? 'border-[6px] border-[#5b8199]' : 'border-[#9ca3af]'}`} />
        </button>
        <button type="button" onClick={() => selectDuration(true)} aria-pressed={halfDay} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${halfDay ? 'border-[#5b8199] bg-white' : 'border-[#cbd7e4] bg-white'}`}>
          <CalendarDays className="h-5 w-5 text-[#526d8b]"/><span><b className="block text-[12px]">Half Day Package</b><small className="text-[10px] text-[#718096]">{rentalOnly ? 'Sat–Thu from 1pm · Fri TGIF from 4pm' : 'Sat - Thurs (from 1pm) or Fri TGIF (from 4pm)'}</small></span><span className={`ml-auto h-5 w-5 rounded-full border ${halfDay ? 'border-[6px] border-[#5b8199]' : 'border-[#9ca3af]'}`} />
        </button>
      </fieldset>}

      {!rentalOnly && halfDay && <fieldset className="space-y-2">
        <legend className="mb-2 text-[13px] font-semibold text-[#344a64]">Choose your day</legend>
        {[
          { value: 'weekday', title: 'Saturday - Thursday', description: 'From 1pm to close' },
          { value: 'friday', title: 'Friday', description: 'TGIF - From 4pm to close' },
        ].map((option) => <button key={option.value} type="button" onClick={() => selectHalfDayType(option.value)} aria-pressed={halfDayType === option.value} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${halfDayType === option.value ? 'border-[#5b8199] bg-white' : 'border-[#cbd7e4] bg-white'}`}>
          <CalendarDays className="h-5 w-5 text-[#526d8b]"/><span><b className="block text-[12px]">{option.title}</b><small className="text-[10px] text-[#718096]">{option.description}</small></span><span className={`ml-auto h-5 w-5 rounded-full border ${halfDayType === option.value ? 'border-[6px] border-[#5b8199]' : 'border-[#9ca3af]'}`} />
        </button>)}
      </fieldset>}

      {!rentalOnly && <DateAvailabilityCalendar value={date} onChange={selectDate} min={SUMMER_START} max={SUMMER_END} isUnavailable={(value) => {
        const weekday = new Date(`${value}T00:00:00Z`).getUTCDay();
        const peakSeason = value >= '2026-12-28' && value <= '2027-01-17';
        const dayDoesNotMatch = !rentalOnly && halfDay && ((halfDayType === 'friday') !== (weekday === 5));
        return dayDoesNotMatch || value === '2026-12-25' || (!peakSeason && (weekday === 2 || weekday === 3));
      }} required />}

      <fieldset className="space-y-2">
        <legend className="mb-1 text-[13px] font-semibold text-[#344a64]">{rentalOnly ? 'Type of Bike' : 'Choose type of bike'}</legend>
        {rentalOnly && <p className="mb-2 text-[12px] font-normal text-[#777]">Choose either Enduro or Downhill bike</p>}
        {(rentalOnly ? ['Downhill', 'Enduro', 'Full Suspension'] : halfDay ? ['Enduro', 'Full Suspension'] : BIKE_TYPES).map((type) => <button key={type} type="button" onClick={() => { setBike(type); setSize(rentalOnly && type === 'Full Suspension' ? '' : selectedDefaultSize(type, age)); }} aria-pressed={bike === type} className={`flex h-12 w-full items-center gap-3 rounded-xl border px-3 text-left text-[13px] font-semibold ${bike === type ? 'border-[#5b8199] bg-white text-[#344a64]' : 'border-[#cbd7e4] bg-white text-[#344a64]'}`}><Bike className="h-5 w-5 text-[#526d8b]"/>{type}<span className={`ml-auto h-5 w-5 rounded-full border ${bike === type ? 'border-[6px] border-[#5b8199]' : 'border-[#9ca3af]'}`} /></button>)}
      </fieldset>

      <label className="block text-[13px] font-semibold text-[#344a64]">{rentalOnly ? `Bike Size - ${bike}` : 'Choose your size'}
        {rentalOnly && <span className="mt-1 block text-[12px] font-normal text-[#777]">{needsRentalSize ? 'Select One (Optional)' : 'Choose your bike size'}</span>}
        <select value={size} onChange={(event) => setSize(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#cbd7e4] bg-white px-3 text-[12px] font-normal text-[#344a64]">
          {needsRentalSize && <option value="">Bike Size - Full Suspension</option>}
          {bikeSizes.map((option) => <option key={option} value={option}>{rentalOnly ? option.replace(' · Rider height ', ' - Rider Height ') : option}</option>)}
        </select>
      </label>

      <section>
        <h3 className="text-[13px] font-semibold text-[#344a64]">{rentalOnly ? 'Add on Bike Insurance' : 'Bike Insurance Add On'}</h3>
        <p className="mt-1 text-[12px] leading-5 text-[#718096]">{rentalOnly ? 'We recommend adding insurance. If equipment is unreturned or damaged, Cardrona may charge your credit card.' : 'Add on Bike Insurance. We recommend adding insurance. If equipment is unreturned or damaged, Cardrona may charge your credit card.'}</p>
        <p className="mt-2 text-[12px]">Select One (Optional)</p>
        <label className={`mt-2 flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${insuranceSelected ? 'border-[#5b8199] bg-[#f5f8fb]' : 'border-[#a0a0a0] bg-white'}`}>
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#526d8b]"/>
          <span className="min-w-0 flex-1"><b className="block text-[13px] text-[#202b3a]">Bike Insurance</b><small className="mt-2 block text-[11px] text-[#777]">Per day</small><span className="mt-2 block text-[13px]">+ NZ$25.00</span></span>
          <input type="checkbox" checked={insuranceSelected} onChange={(event) => setInsuranceSelected(event.target.checked)} className="mt-1 h-4 w-4 accent-[#5b8199]"/>
        </label>
      </section>
      </>}
    </section>

    <ProductSummaryCard title="Your pass" dateLabel={formatDate(date)} selection={rentalOnly ? `${bike} bike · ${size || 'Choose size'}` : `${guestCount} ${guestCount === 1 ? 'guest' : 'guests'} · ${halfDay ? halfDayType === 'friday' ? 'Friday evening' : 'Afternoon' : 'Full day'} · ${bike} bike`} total={displayMoney(price)} actionLabel={rentalOnly ? 'Add to cart' : `Add ${guestCount} to cart`} disabled={!date || !hasRentalSelection || (!rentalOnly && !guestCount)} onAdd={addPackage} />

    {itemAdded && <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/25 p-2 sm:items-center"><section role="dialog" aria-modal="true" aria-labelledby="bike-item-added-title" className="w-full max-w-[430px] rounded-t-2xl border border-[#dce4ed] bg-white p-4 shadow-xl sm:rounded-2xl">
      <div className="flex items-center gap-2"><Check className="h-5 w-5 text-emerald-700"/><h2 id="bike-item-added-title" className="text-[17px] font-bold">Item Added</h2><button type="button" onClick={() => setItemAdded(false)} aria-label="Close" className="ml-auto px-2 text-xl">×</button></div>
      <p className="mt-3 text-[13px] font-semibold">{formatDate(date)}</p>{rentalOnly ? <div className="mt-3 flex justify-between gap-3 border-b border-[#dce4ed] pb-3 text-[12px]"><span>1 {productName}</span><b className="shrink-0">{displayMoney(packagePrice)}</b></div> : ageEntries.map((entry) => <div key={entry.value} className="mt-3 flex justify-between gap-3 border-b border-[#dce4ed] pb-3 text-[12px]"><span>{entry.quantity} {halfDay ? halfDayType === 'friday' ? 'TGIF' : 'Afternoon' : '1 Day'} Lift + {bike} Bike - {entry.value}</span><b className="shrink-0">{displayMoney((PRICES[halfDay ? 'halfDay' : 'fullDay'][bike][entry.value] + (insuranceSelected ? 25 : 0)) * entry.quantity)}</b></div>)}{insuranceSelected && rentalOnly && <div className="flex justify-between gap-3 border-b border-[#dce4ed] py-2 text-[12px]"><span>1 Add On - Bike Insurance</span><b className="shrink-0">{displayMoney(insurancePrice)}</b></div>}
      <div className="space-y-1 py-3 text-[12px]"><p className="flex justify-between font-semibold"><span>Cart total</span><span>{displayMoney(cartTotal + price)}</span></p></div>
      <p className="bg-[#f7f8f9] px-2 py-3 text-center text-[11px]">Payment is available at checkout. No real charge is made.</p>
      <div className="mt-3 grid grid-cols-2 gap-3"><button type="button" onClick={() => navigate('/cart')} className="h-11 rounded-xl border border-[#344a64] text-[12px]">View Cart</button><button type="button" onClick={onCheckout} className="h-11 rounded-xl bg-[#5b8199] text-[12px] font-semibold text-white">Checkout</button></div>
    </section></div>}
  </main></LocalizeCustomerTree>;
}
