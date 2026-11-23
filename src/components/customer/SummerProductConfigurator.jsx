import { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { LocalizeCustomerTree } from '@/lib/customerLocale';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bike, Check } from 'lucide-react';
import DateAvailabilityCalendar from './DateAvailabilityCalendar';
import AgeFirstGuestCounts from './AgeFirstGuestCounts';
import ProductSummaryCard from './ProductSummaryCard';

const PRODUCTS = {
  'earlybird-summer': {
    name: 'Earlybird Summer Season pass',
    description: "Lock in your Summer Season Pass for the best price. Ride your bike all summer long at Cardrona, home to NZ's highest bike park.",
    adult: 359,
    child: 219,
    under6: 0,
    over75: 0,
    needsDate: false,
    options: ['Cardrona Summer Season Pass'],
  },
  'summer-day-passes': {
    name: 'Summer Day Passes',
    description: 'Choose a full-day, afternoon, or Friday evening Cardrona bike park pass.',
    adult: 99,
    child: 79,
    needsDate: true,
    options: ['1 Day Pass', 'Afternoon Pass', 'TGIF Pass'],
    optionDetails: {
      '1 Day Pass': { description: 'Full Day MTB Lift Pass', adult: 99, child: 62 },
      'Afternoon Pass': { description: 'Valid from 1pm until close', adult: 79, child: 79 },
      'TGIF Pass': { description: 'Valid from 4pm - 8pm on Fridays', adult: 65, child: 79 },
      'Child Under 6': { description: 'Free of Charge', adult: 0, child: 0 },
      Senior: { description: 'Free of Charge', adult: 0, child: 0 },
    },
  },
  'peak-to-pub': {
    name: 'Peak to Pub · Lift Pass and Shuttle',
    description: 'Pair mountain time with a return shuttle after your day out.',
    adult: 49,
    child: 35,
    needsDate: true,
    options: ['Lift pass + return shuttle'],
  },
  'summer-carting': {
    name: 'Summer Mountain Carting',
    description: 'Three wheels, three times the fun, and one summer activity for your bucket list. Cardrona is the only place in New Zealand where you can go mountain carting.',
    adult: 175,
    child: 95,
    needsDate: true,
    options: ['2 Hour Mountain Carting Pass'],
  },
};

const AGE_BANDS = [
  { value: 'Adult: 18 - 74 yrs', priceKey: 'adult' },
  { value: 'Child: 6 - 17 yrs', priceKey: 'child' },
  { value: 'Under 6 yrs: Free of Charge', priceKey: 'under6' },
  { value: 'Over 75 yrs: Free of Charge', priceKey: 'over75' },
];

const SUMMER_DONATIONS = [
  { id: 'plant-a-seed', title: 'Plant a Seed', description: 'Help us plant natives to regenerate our environment and offset your carbon emissions*.' },
  { id: 'karearea-project', title: 'The Kārearea Project', description: 'Help fund our scientific conservation of the magnificent and threatened NZ Falcon.' },
];

const money = (value) => `NZ$${Number(value).toFixed(2)}`;
const SUMMER_START = '2026-12-12';
const SUMMER_END = '2027-02-28';
const formatDate = (value) => value ? new Intl.DateTimeFormat('en-NZ', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) : 'No date selected';
const CART_SIZES = [
  { name: 'Large', height: 'Height - 170 - 195cm' },
  { name: 'Medium', height: 'Height - 155 - 180cm' },
  { name: 'Small', height: 'Height - 120 - 165cm' },
  { name: 'X-Large', height: 'Height - 180 - 210 cm' },
  { name: 'X-Small', height: 'Height - 100 -120cm' },
];
const CARTING_TIMES = ['10:00am', '11:00am', '12:00pm', '1:00pm', '2:00pm'];
const summerDateUnavailable = (value) => {
  const date = new Date(`${value}T00:00:00Z`);
  const weekday = date.getUTCDay();
  const peakSeason = value >= '2026-12-28' && value <= '2027-01-17';
  return value === '2026-12-25' || (!peakSeason && (weekday === 2 || weekday === 3));
};

export default function SummerProductConfigurator({ productId, onAdd, onCheckout, cartTotal = 0 }) {
  const { lang } = useLang();
  const navigate = useNavigate();
  const { state: routeState } = useLocation();
  const product = PRODUCTS[productId] || PRODUCTS['summer-day-passes'];
  const isEarlybird = productId === 'earlybird-summer';
  const isPeakToPub = productId === 'peak-to-pub';
  const isCarting = productId === 'summer-carting';
  const isSummerDayPass = productId === 'summer-day-passes';
  const [date, setDate] = useState('');
  const ageOptions = isEarlybird
    ? AGE_BANDS.map((band) => ({ value: band.value, label: band.value }))
    : isCarting
      ? [{ value: 'Adult: 18 +', label: 'Adult: 18 +' }, { value: 'Child: 8 - 17', label: 'Child: 8 - 17' }]
      : isSummerDayPass
        ? [{ value: 'Adult: 18 - 74 yrs', label: 'Adult: 18 - 74 yrs' }, { value: 'Child: 6 - 17', label: 'Child: 6 - 17' }, { value: 'Under 6yrs: Free of Charge', label: 'Under 6 yrs: Free of Charge' }, { value: 'Over 75 yrs: Free of Charge', label: 'Over 75 yrs: Free of Charge' }]
        : [{ value: 'Adult', label: 'Adult' }, { value: 'Child', label: 'Child: 6 - 17 yrs' }];
  const initialAge = ageOptions.find((item) => item.value === routeState?.ageBand)?.value || ageOptions[0].value;
  const [ageStage, setAgeStage] = useState('counts');
  const [guestCounts, setGuestCounts] = useState(() => Object.fromEntries(ageOptions.map((item) => [item.value, item.value === initialAge ? 1 : 0])));
  const [option, setOption] = useState(product.options[0]);
  const [shuttleDeparture, setShuttleDeparture] = useState('Depart Cardrona Valley at 9.00am');
  const [cartingTime, setCartingTime] = useState('');
  const [cartSize, setCartSize] = useState('Large');
  const [cartingBuddy, setCartingBuddy] = useState(false);
  const [plan, setPlan] = useState('Pay Now');
  const [itemAdded, setItemAdded] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [selectedDonations, setSelectedDonations] = useState([]);

  const ageEntries = ageOptions.map((item) => ({ ...item, quantity: guestCounts[item.value] || 0 })).filter((item) => item.quantity > 0);
  const guestCount = ageEntries.reduce((sum, item) => sum + item.quantity, 0);
  const age = ageEntries[0]?.value || initialAge;
  const dayPassOptions = isSummerDayPass && age.includes('Under 6')
    ? ['Child Under 6']
    : isSummerDayPass && age.includes('Over 75')
      ? ['Senior']
      : product.options;
  const dayPassOption = product.optionDetails?.[option];
  const priceForAge = (ageValue) => {
    const band = AGE_BANDS.find((item) => item.value === ageValue);
    if (isEarlybird) return product[band?.priceKey || 'adult'];
    if (isCarting) return ageValue.startsWith('Child') ? product.child : product.adult;
    if (isSummerDayPass && (ageValue.includes('Under 6') || ageValue.includes('Over 75'))) return 0;
    if (isSummerDayPass) return dayPassOption?.[ageValue.startsWith('Child') ? 'child' : 'adult'] || 0;
    return ageValue === 'Child' ? product.child : product.adult;
  };
  const allowsDonations = isEarlybird;
  const total = ageEntries.reduce((sum, entry) => sum + (priceForAge(entry.value) + (isCarting && cartingBuddy && entry.value.startsWith('Adult') ? 25 : 0) + selectedDonations.length * (allowsDonations ? 20 : 0)) * entry.quantity, 0);
  const canAdd = (!product.needsDate || Boolean(date)) && (!isCarting || Boolean(cartingTime)) && (!isSummerDayPass || Boolean(option));
  const isDateUnavailable = (value) => {
    if (summerDateUnavailable(value)) return true;
    if (isPeakToPub && shuttleDeparture.includes('5.00pm')) {
      return new Date(`${value}T00:00:00Z`).getUTCDay() !== 5;
    }
    return false;
  };
  const shuttleTime = shuttleDeparture.replace('Depart Cardrona Valley at ', '').replace('.00', '');
  const displayMoney = (value) => isPeakToPub || isCarting ? `$${Number(value).toFixed(0)}` : money(value);

  const selectCalendarDate = (value) => {
    setDate(value);
    setCartingTime('');
    const weekday = new Date(`${value}T00:00:00Z`).getUTCDay();
    if (isSummerDayPass && option === 'TGIF Pass' && weekday !== 5) setOption('1 Day Pass');
  };

  const selectShuttleDeparture = (departure) => {
    setShuttleDeparture(departure);
    const isFriday = date && new Date(`${date}T00:00:00Z`).getUTCDay() === 5;
    if (departure.includes('5.00pm') && date && !isFriday) setDate('');
  };

  const addProduct = () => {
    const visitDate = product.needsDate ? date : '';
    ageEntries.forEach((entry, index) => {
      const entryPrice = priceForAge(entry.value) + (isCarting && cartingBuddy && entry.value.startsWith('Adult') ? 25 : 0);
      const entryName = isEarlybird ? `${product.name} - ${entry.value}` : isSummerDayPass ? `${product.name} - ${entry.value.includes('Under 6') ? 'Child - Child Under 6' : entry.value.includes('Over 75') ? 'Senior - Senior' : entry.value.startsWith('Child') ? 'Child' : 'Adult'} - ${option}` : isCarting ? `${product.name} - ${entry.value.startsWith('Child') ? 'Child' : 'Adult'} - ${cartSize}` : `Peak To Pub - Lift + ${shuttleTime} Shuttle - ${entry.value}`;
      const details = [visitDate, isCarting ? cartingTime : '', isCarting ? `Cart size: ${cartSize}` : '', isCarting && cartingBuddy && entry.value.startsWith('Adult') ? 'Carting With Kids tandem add-on (+NZ$25)' : '', isCarting && cartingBuddy && entry.value.startsWith('Adult') ? 'Child 6–8 yrs; max combined weight 110kg; child max height 100cm' : '', option, entry.value, isPeakToPub ? shuttleDeparture : '', product.hasPlan ? plan : ''].filter(Boolean).join(' · ');
      onAdd({
        id: productId,
        name: entryName,
        price: entryPrice,
        quantity: entry.quantity,
        visitDate,
        ageBand: entry.value,
        detail: isEarlybird ? entry.value : details,
        variant: `${visitDate}-${entry.value}-${option}-${isPeakToPub ? shuttleDeparture : ''}-${isCarting ? `${cartingTime}-${cartSize}-${cartingBuddy}` : ''}-${plan}`,
        replaceKey: index === 0 ? routeState?.editCartKey || '' : '',
      });
    });
    if (allowsDonations) {
      SUMMER_DONATIONS.filter((item) => selectedDonations.includes(item.id)).forEach((item) => onAdd({
        id: `summer-donation-${item.id}`,
        name: item.title,
        price: 20,
        quantity: guestCount,
        detail: 'Optional conservation donation',
        variant: `${productId}-${item.id}`,
      }));
    }
    setItemAdded(true);
  };

  const summarySelection = isSummerDayPass
    ? `${ageEntries.map((entry) => `${entry.quantity > 1 ? `${entry.quantity} ` : ''}${entry.value.startsWith('Child') ? 'Child' : entry.value.includes('Under 6') ? 'Child under 6' : entry.value.includes('Over 75') ? 'Senior' : 'Adult'}`).join(', ')} · ${option === '1 Day Pass' ? 'Full day' : option === 'TGIF Pass' ? 'Friday evening' : option === 'Afternoon Pass' ? 'Afternoon' : option}`
    : isPeakToPub ? `${age} · ${shuttleTime} shuttle${shuttleDeparture.includes('11.00am') ? ' · 4:15 pm return' : ''}`
      : isCarting ? `${age} · ${cartSize}${cartingTime ? ` · ${cartingTime}` : ''}`
        : `${guestCount} ${guestCount === 1 ? 'guest' : 'guests'} · Season pass`;
  return <LocalizeCustomerTree lang={lang}><main className="space-y-5 px-4 pb-[100px] pt-5 sm:px-8 sm:pb-[140px]">
    {!isSummerDayPass && <section><h2 className="font-serif text-[25px] font-bold text-[#20242b]">{product.name}</h2><div className="mt-2 border-y border-[#cbd7e4] py-4 text-[12px] leading-5 text-[#718096]"><p>{product.description}</p>{(isEarlybird || isCarting) && <><button type="button" onClick={() => setExpandedDescription((expanded) => !expanded)} className="mt-2 text-[#202020] underline">{expandedDescription ? 'See less' : 'See more'}</button>{expandedDescription && <p className="mt-2">Enjoy a two-hour mountain carting experience with unlimited uplifts. Choose your age band, a cart size, and an available start time.</p>}</>}</div></section>}
    {ageStage === 'counts' ? <AgeFirstGuestCounts options={ageOptions} counts={guestCounts} onChange={(value, count) => setGuestCounts((current) => ({ ...current, [value]: count }))} onContinue={() => { if (isSummerDayPass && age.includes('Under 6')) setOption('Child Under 6'); else if (isSummerDayPass && age.includes('Over 75')) setOption('Senior'); else if (isSummerDayPass && (option === 'Child Under 6' || option === 'Senior')) setOption('1 Day Pass'); setAgeStage('options'); }} continueLabel={`Continue with ${guestCount} ${guestCount === 1 ? 'guest' : 'guests'}`} /> : <section className="space-y-4">
    <button type="button" onClick={() => setAgeStage('counts')} className="text-[13px] text-[#5b8199] underline">Edit guest counts</button>
    {product.hasPlan && <fieldset className="space-y-2"><legend className="mb-2 text-[13px] font-semibold text-[#344a64]">Payment plan</legend>{['Pay Now', 'Buy Now, Pay Later'].map((item) => <button key={item} type="button" onClick={() => setPlan(item)} className={`flex min-h-12 w-full items-center justify-between rounded-xl border p-3 text-left text-[12px] ${plan === item ? 'border-[#5b8199] bg-white' : 'border-[#dce4ed] bg-white'}`}><span><b>{item}</b>{item === 'Buy Now, Pay Later' && <small className="mt-1 block text-[10px] text-[#718096]">$100 deposit now, balance in four instalments</small>}</span><span className={`h-4 w-4 rounded-full border ${plan === item ? 'border-[5px] border-[#5b8199]' : 'border-[#a0a7b0]'}`} /></button>)}</fieldset>}

    {isSummerDayPass && <fieldset className="space-y-2.5"><legend className="mb-2 text-[15px] font-bold text-[#26384a]">Pass type</legend>{dayPassOptions.map((item) => { const unavailable = item === 'TGIF Pass' && date && new Date(`${date}T00:00:00Z`).getUTCDay() !== 5; const prices = product.optionDetails[item]; const mixedAges = ageEntries.some((entry) => entry.value.startsWith('Child')) && ageEntries.some((entry) => entry.value.startsWith('Adult')); const priceLabel = item === 'Senior' || item === 'Child Under 6' ? 'FREE' : prices ? `${mixedAges ? 'From ' : ''}${displayMoney(mixedAges ? Math.min(prices.adult, prices.child) : priceForAge(age))}` : ''; return <button key={item} type="button" disabled={unavailable} aria-pressed={option === item} onClick={() => setOption(item)} className={`flex min-h-[72px] w-full items-center gap-3 rounded-[14px] border px-3.5 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${option === item ? 'border-2 border-[#5b8199] bg-[#eaf1f6]' : 'border-[#d6e0ea] bg-white hover:border-[#9bb2c3]'}`}><span aria-hidden="true" className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${option === item ? 'border-[6px] border-[#5b8199] bg-white' : 'border-[#aab7c3] bg-white'}`} /><span className="min-w-0 flex-1"><b className="block text-[14px] font-bold text-[#20242b]">{item === 'Senior' ? 'Senior · over 75' : item === 'Child Under 6' ? 'Child under 6' : item === '1 Day Pass' ? 'Full day' : item === 'TGIF Pass' ? 'Friday evening' : 'Afternoon'}</b><small className="mt-1 block text-[12px] font-medium text-[#5c7086]">{unavailable ? 'Only available on Fridays' : item === '1 Day Pass' ? 'Full day lift access' : item === 'TGIF Pass' ? 'Valid 4 pm–8 pm on Fridays' : item === 'Afternoon Pass' ? 'Valid from 1 pm until close' : prices?.description}</small></span><span className="shrink-0 text-[13px] font-bold text-[#3e6379]">{priceLabel}</span></button>; })}</fieldset>}

    {product.needsDate && <DateAvailabilityCalendar value={date} onChange={selectCalendarDate} min={SUMMER_START} max={SUMMER_END} isUnavailable={isPeakToPub ? isDateUnavailable : summerDateUnavailable} required defaultOpen={isSummerDayPass} unavailableLabel={isSummerDayPass ? 'SOLD OUT · DEMO AVAILABILITY' : 'UNAVAILABLE'} />}

    {isCarting && <label className="block text-[13px] font-semibold text-[#344a64]">Start Time {!cartingTime && <span className="text-[#5b8199]">(Required)</span>}<select value={cartingTime} onChange={(event) => setCartingTime(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#cbd7e4] bg-white px-3 text-[13px] font-normal text-[#344a64]"><option value="">Select a Time</option>{CARTING_TIMES.map((time, index) => <option key={time} value={time}>{time} • {index === 0 ? 23 : 30} left</option>)}</select></label>}

    {isEarlybird && <div className="rounded-xl bg-[#f5f8fb] p-3 text-[12px] text-[#718096]">Selected age groups: {ageEntries.map((entry) => `${entry.quantity} × ${entry.value}`).join(' · ')}</div>}

    {isCarting && <>
      <section>
        <h3 className="text-[13px] font-semibold text-[#202b3a]">Equipment size</h3><p className="mt-1 text-[12px] text-[#718096]">Choose your equipment size:</p>
        <div className="mt-2 space-y-2">{CART_SIZES.map((size) => <button key={size.name} type="button" aria-pressed={cartSize === size.name} onClick={() => setCartSize(size.name)} className={`w-full rounded-xl border p-3 text-left ${cartSize === size.name ? 'border-2 border-[#5b8199]' : 'border-[#a0a0a0]'}`}><b className="block text-[13px]">{size.name}</b><span className="mt-1 block text-[10px] text-[#777]">{size.height}</span></button>)}</div>
      </section>
      {guestCounts[ageOptions[0].value] > 0 && <section>
        <h3 className="text-[13px] font-semibold text-[#202b3a]">Mountain Carting Buddy Add On</h3>{!cartingBuddy && <p className="mt-1 text-[12px]">Select One (Optional)</p>}
        <label className={`mt-2 flex cursor-pointer gap-3 rounded-xl border p-4 ${cartingBuddy ? 'border-[#5b8199]' : 'border-[#a0a0a0]'}`}><span className="min-w-0 flex-1"><b className="text-[13px]">Carting With Kids</b><span className="mt-1 block text-[11px] leading-4 text-[#777]">Add a child between 6 and 8 yrs to ride tandem with an adult. Combined weight per cart must not exceed 110kg and the child must not exceed 100cm tall.</span><span className="mt-2 block text-[13px]">+ $25 per adult</span></span><input type="checkbox" checked={cartingBuddy} onChange={(event) => setCartingBuddy(event.target.checked)} className="mt-1 h-4 w-4 accent-[#5b8199]" /></label>
      </section>}
    </>}

    {isPeakToPub && <section className="rounded-[18px] border border-[#dce4ed] bg-white p-4 shadow-sm">
      <h3 className="text-[17px] font-bold text-[#202b3a]">Choose your shuttle up</h3>
      <p className="mt-1 text-[13px] leading-5 text-[#718096]">Select a Cardrona Valley departure. Friday service runs on Fridays only.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">{[
        'Depart Cardrona Valley at 9.00am',
        'Depart Cardrona Valley at 11.00am',
        'Depart Cardrona Valley at 1.00pm',
        'Depart Cardrona Valley at 5.00pm (TGIF Fridays only)',
      ].map((departure) => { const selected = shuttleDeparture === departure; const time = departure.replace('Depart Cardrona Valley at ', '').replace(' (TGIF Fridays only)', ''); return <button key={departure} type="button" aria-pressed={selected} onClick={() => selectShuttleDeparture(departure)} className={`flex min-h-[70px] items-center justify-between gap-2 rounded-xl border p-3 text-left ${selected ? 'border-2 border-[#5b8199] bg-[#eaf1f6]' : 'border-[#cbd7e4] bg-white'}`}><span><b className="block text-[14px] text-[#263345]">{time}</b>{departure.includes('Fridays') && <small className="mt-1 block text-[11px] text-[#718096]">Fridays only</small>}</span><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${selected ? 'border-[#5b8199] bg-[#5b8199] text-white' : 'border-[#9ca3af]'}`}>{selected && <Check className="h-3.5 w-3.5"/>}</span></button>; })}</div>
      {shuttleDeparture.includes('11.00am') && <p className="mt-3 rounded-xl bg-[#eaf1f6] px-3 py-2.5 text-[13px] font-semibold text-[#344a64]">Return shuttle from the mountain: 4:15 pm</p>}
    </section>}

    {allowsDonations && !isSummerDayPass && <>
      <section>
        <h3 className="text-[13px] font-semibold text-[#344a64]">Plant a Seed</h3>
        <p className="mt-1 text-[12px]">Select One (Optional)</p>
        {SUMMER_DONATIONS.filter((item) => item.id === 'plant-a-seed').map((item) => <label key={item.id} className={`mt-2 flex cursor-pointer gap-3 rounded-xl border p-4 ${selectedDonations.includes(item.id) ? 'border-[#343434]' : 'border-[#a0a0a0]'}`}>
          <span className="min-w-0 flex-1"><b className="text-[13px]">{item.title}</b><span className="mt-2 block text-[11px] leading-4 text-[#777]">{item.description}</span><span className="mt-2 block text-[13px]">+ NZ$20</span></span>
          <input type="checkbox" checked={selectedDonations.includes(item.id)} onChange={() => setSelectedDonations((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} className="mt-1 h-4 w-4 accent-[#5b8199]" />
        </label>)}
      </section>
      <section>
        <h3 className="text-[13px] font-semibold text-[#344a64]">The Kārearea Project</h3>
        <p className="mt-1 text-[12px]">Select One (Optional)</p>
        {SUMMER_DONATIONS.filter((item) => item.id === 'karearea-project').map((item) => <label key={item.id} className={`mt-2 flex cursor-pointer gap-3 rounded-xl border p-4 ${selectedDonations.includes(item.id) ? 'border-[#343434]' : 'border-[#a0a0a0]'}`}>
          <span className="min-w-0 flex-1"><b className="text-[13px]">{item.title}</b><span className="mt-2 block text-[11px] leading-4 text-[#777]">{item.description}</span><span className="mt-2 block text-[13px]">+ NZ$20</span></span>
          <input type="checkbox" checked={selectedDonations.includes(item.id)} onChange={() => setSelectedDonations((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} className="mt-1 h-4 w-4 accent-[#5b8199]" />
        </label>)}
      </section>
    </>}

    {product.options.length > 1 && !isSummerDayPass && <fieldset className="space-y-2"><legend className="mb-2 text-[13px] font-semibold text-[#344a64]">Choose your option</legend>{product.options.map((item) => <button key={item} type="button" onClick={() => setOption(item)} className={`flex min-h-12 w-full items-center justify-between rounded-xl border p-3 text-left text-[12px] font-semibold ${option === item ? 'border-[#5b8199] bg-white' : 'border-[#dce4ed] bg-white'}`}><span><b className="block">{item}</b>{product.optionDetails?.[item] && <small className="mt-1 block font-normal text-[#718096]">{product.optionDetails[item].description}</small>}</span><span className={`h-4 w-4 shrink-0 rounded-full border ${option === item ? 'border-[5px] border-[#5b8199]' : 'border-[#a0a7b0]'}`} /></button>)}</fieldset>}
    </section>}

    <ProductSummaryCard title="Your pass" dateLabel={product.needsDate ? (date ? new Intl.DateTimeFormat('en-NZ', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)) : 'Choose a date') : 'Summer 2026/27 season'} selection={summarySelection} total={displayMoney(total)} actionLabel={isSummerDayPass ? 'Add pass to cart' : isPeakToPub ? `Add ${guestCount} to cart` : `Add ${guestCount} booking${guestCount === 1 ? '' : 's'} to cart`} disabled={!canAdd || !guestCount} onAdd={addProduct} />
    {itemAdded && <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/25 p-2 sm:items-center"><section role="dialog" aria-modal="true" aria-labelledby="summer-item-added-title" className="w-full max-w-[430px] rounded-t-2xl border border-[#dce4ed] bg-white p-4 shadow-xl sm:rounded-2xl"><div className="flex items-center gap-2"><Check className="h-5 w-5 text-emerald-700"/><h2 id="summer-item-added-title" className="text-[17px] font-bold">Items Added</h2><button type="button" onClick={() => setItemAdded(false)} aria-label="Close" className="ml-auto px-2 text-xl">×</button></div><p className="mt-3 text-[13px] font-semibold">{product.needsDate ? formatDate(date) : isEarlybird ? 'Summer 2026/27 season' : 'Summer visit'}</p>{ageEntries.map((entry) => { const entryPrice = priceForAge(entry.value) + (isCarting && cartingBuddy && entry.value.startsWith('Adult') ? 25 : 0); const entryName = isEarlybird ? `${product.name} - ${entry.value}` : isSummerDayPass ? `${product.name} - ${entry.value.startsWith('Child') ? 'Child' : entry.value.includes('Under 6') ? 'Child Under 6' : entry.value.includes('Over 75') ? 'Senior' : 'Adult'} - ${option}` : isCarting ? `${product.name} - ${entry.value.startsWith('Child') ? 'Child' : 'Adult'} - ${cartSize}` : `Peak To Pub - Lift + ${shuttleTime} Shuttle - ${entry.value}`; return <div key={entry.value} className="mt-3 flex justify-between gap-3 border-b border-[#dce4ed] pb-3 text-[12px]"><span>({entry.quantity}) {entryName}</span><b className="shrink-0">{displayMoney(entryPrice * entry.quantity)}</b></div>; })}{isCarting && cartingTime && <p className="border-b border-[#dce4ed] py-2 text-[11px] text-[#718096]">Start time: {cartingTime} · {cartSize} cart{cartingBuddy ? ' · Carting With Kids +NZ$25 per adult' : ''}</p>}{isPeakToPub && <p className="border-b border-[#dce4ed] py-2 text-[11px] text-[#718096]">{shuttleDeparture}</p>}{allowsDonations && SUMMER_DONATIONS.filter((item) => selectedDonations.includes(item.id)).map((item) => <div key={item.id} className="flex justify-between gap-3 border-b border-[#dce4ed] py-2 text-[12px]"><span>{guestCount} × {item.title}</span><b className="shrink-0">{money(20 * guestCount)}</b></div>)}<p className="flex justify-between py-3 text-[12px] font-semibold"><span>Cart total</span><span>{displayMoney(cartTotal + total)}</span></p><p className="bg-[#f7f8f9] px-2 py-3 text-center text-[11px]">Payment is available at checkout. No real charge is made.</p><div className="mt-3 grid grid-cols-2 gap-3"><button type="button" onClick={() => navigate('/cart')} className="h-11 rounded-xl border border-[#344a64] text-[12px]">View Cart</button><button type="button" onClick={onCheckout} className="h-11 rounded-xl bg-[#5b8199] text-[12px] font-semibold text-white">Checkout</button></div></section></div>}
  </main></LocalizeCustomerTree>;
}
