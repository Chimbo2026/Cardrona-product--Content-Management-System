import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bike, Check } from 'lucide-react';
import DateAvailabilityCalendar from './DateAvailabilityCalendar';

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
  const navigate = useNavigate();
  const { state: routeState } = useLocation();
  const product = PRODUCTS[productId] || PRODUCTS['summer-day-passes'];
  const isEarlybird = productId === 'earlybird-summer';
  const isPeakToPub = productId === 'peak-to-pub';
  const isCarting = productId === 'summer-carting';
  const isSummerDayPass = productId === 'summer-day-passes';
  const [date, setDate] = useState('');
  const [age, setAge] = useState(routeState?.ageBand || (isEarlybird ? AGE_BANDS[0].value : isCarting ? 'Adult: 18 +' : isSummerDayPass ? 'Adult: 18 - 74 yrs' : 'Adult'));
  const [option, setOption] = useState(product.options[0]);
  const [shuttleDeparture, setShuttleDeparture] = useState('Depart Cardrona Valley at 9.00am');
  const [quantity, setQuantity] = useState(1);
  const [cartingTime, setCartingTime] = useState('');
  const [cartSize, setCartSize] = useState('Large');
  const [cartingBuddy, setCartingBuddy] = useState(false);
  const [plan, setPlan] = useState('Pay Now');
  const [itemAdded, setItemAdded] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [selectedDonations, setSelectedDonations] = useState([]);

  const ageBand = AGE_BANDS.find((band) => band.value === age);
  const dayPassOptions = isSummerDayPass && age.includes('Under 6')
    ? ['Child Under 6']
    : isSummerDayPass && age.includes('Over 75')
      ? ['Senior']
      : product.options;
  const dayPassOption = product.optionDetails?.[option];
  const agePrice = isEarlybird
    ? product[ageBand?.priceKey || 'adult']
    : isCarting
      ? age === 'Child: 8 - 17 yrs' ? product.child : product.adult
    : isSummerDayPass && !dayPassOption
      ? 0
    : age.includes('Under 6') || age.includes('Over 75')
      ? 0
    : dayPassOption
      ? dayPassOption[age.startsWith('Child') ? 'child' : 'adult']
      : age === 'Child' ? product.child : product.adult;
  const price = agePrice + (isCarting && cartingBuddy ? 25 : 0);
  const earlybirdReferencePrice = age.includes('Under 6') ? product.child : product.adult;
  const earlybirdSavings = isEarlybird ? Math.max(0, earlybirdReferencePrice - price) : 0;
  const earlybirdDiscountPercent = earlybirdReferencePrice ? Math.round((earlybirdSavings / earlybirdReferencePrice) * 100) : 0;
  const allowsDonations = isEarlybird || productId === 'summer-day-passes';
  const donationTotal = allowsDonations ? selectedDonations.length * 20 : 0;
  const unitTotal = price + donationTotal;
  const total = unitTotal * (isPeakToPub ? quantity : 1);
  const canAdd = (!product.needsDate || Boolean(date)) && (!isCarting || Boolean(cartingTime)) && (!isSummerDayPass || Boolean(option));
  const isDateUnavailable = (value) => {
    if (summerDateUnavailable(value)) return true;
    if (isPeakToPub && shuttleDeparture.includes('5.00pm')) {
      return new Date(`${value}T00:00:00Z`).getUTCDay() !== 5;
    }
    return false;
  };
  const dayPassAgeLabel = age.includes('Over 75') ? 'Senior - Senior' : age.includes('Under 6') ? 'Child - Child Under 6' : age.startsWith('Child') ? 'Child' : 'Adult';
  const shuttleTime = shuttleDeparture.replace('Depart Cardrona Valley at ', '').replace('.00', '');
  const displayMoney = (value) => isPeakToPub || isCarting ? `$${Number(value).toFixed(0)}` : money(value);
  const cartingAgeLabel = age.startsWith('Child') ? 'Child' : 'Adult';
  const summaryName = isEarlybird ? `${product.name} - ${age}` : isCarting ? `${product.name} - ${cartingAgeLabel} - ${cartSize}` : isSummerDayPass ? `${product.name} - ${dayPassAgeLabel}${option ? ` - ${option}` : ''}` : isPeakToPub ? `Peak To Pub - Lift + ${shuttleTime} Shuttle - ${age}` : `${product.name} · ${option} · ${age}`;

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

  const changeAge = (value) => {
    setAge(value);
    if (isCarting && value.startsWith('Child')) setCartingBuddy(false);
    if (isSummerDayPass) setOption(value.includes('Under 6') ? 'Child Under 6' : value.includes('Over 75') ? 'Senior' : '1 Day Pass');
  };

  const addProduct = () => {
    const visitDate = product.needsDate ? date : '';
    const details = [visitDate, isCarting ? cartingTime : '', isCarting ? `Cart size: ${cartSize}` : '', isCarting && cartingBuddy ? 'Carting With Kids tandem add-on (+NZ$25)' : '', isCarting && cartingBuddy ? 'Child 6–8 yrs; max combined weight 110kg; child max height 100cm' : '', option, age, isPeakToPub ? shuttleDeparture : '', product.hasPlan ? plan : ''].filter(Boolean).join(' · ');
    onAdd({
      id: productId,
      name: isEarlybird ? `${product.name} - ${age}` : isSummerDayPass || isPeakToPub || isCarting ? summaryName : `${product.name} · ${age}`,
      price,
      quantity: isPeakToPub ? quantity : 1,
      visitDate,
      ageBand: age,
      detail: isEarlybird ? age : details,
      variant: `${visitDate}-${age}-${option}-${isPeakToPub ? shuttleDeparture : ''}-${isCarting ? `${cartingTime}-${cartSize}-${cartingBuddy}` : ''}-${plan}`,
      replaceKey: routeState?.editCartKey || '',
    });
    if (allowsDonations) {
      SUMMER_DONATIONS.filter((item) => selectedDonations.includes(item.id)).forEach((item) => onAdd({
        id: `summer-donation-${item.id}`,
        name: item.title,
        price: 20,
        detail: 'Optional conservation donation',
        variant: `${productId}-${item.id}`,
      }));
    }
    setItemAdded(true);
  };

  return <main className="space-y-5 px-4 pb-[150px] pt-5 sm:px-8 sm:pb-[220px]">
    <section><h2 className="font-serif text-[25px] font-bold text-[#202b3a]">{product.name}</h2><div className="mt-2 border-y border-[#cbd7e4] py-4 text-[12px] leading-5 text-[#718096]"><p>{product.description}</p>{(isEarlybird || isCarting) && <><button type="button" onClick={() => setExpandedDescription((expanded) => !expanded)} className="mt-2 text-[#202020] underline">{expandedDescription ? 'See less' : 'See more'}</button>{expandedDescription && <p className="mt-2">Enjoy a two-hour mountain carting experience with unlimited uplifts. Choose your age band, a cart size, and an available start time.</p>}</>}</div></section>
    {product.hasPlan && <fieldset className="space-y-2"><legend className="mb-2 text-[13px] font-semibold text-[#344a64]">Payment plan</legend>{['Pay Now', 'Buy Now, Pay Later'].map((item) => <button key={item} type="button" onClick={() => setPlan(item)} className={`flex min-h-12 w-full items-center justify-between rounded-xl border p-3 text-left text-[12px] ${plan === item ? 'border-[#5b8199] bg-white' : 'border-[#dce4ed] bg-white'}`}><span><b>{item}</b>{item === 'Buy Now, Pay Later' && <small className="mt-1 block text-[10px] text-[#718096]">$100 deposit now, balance in four instalments</small>}</span><span className={`h-4 w-4 rounded-full border ${plan === item ? 'border-[5px] border-[#5b8199]' : 'border-[#a0a7b0]'}`} /></button>)}</fieldset>}

    {product.needsDate && <DateAvailabilityCalendar value={date} onChange={selectCalendarDate} min={SUMMER_START} max={SUMMER_END} isUnavailable={isPeakToPub ? isDateUnavailable : summerDateUnavailable} required defaultOpen={isSummerDayPass} unavailableLabel={isSummerDayPass ? 'SOLD OUT · DEMO AVAILABILITY' : 'UNAVAILABLE'} />}

    {isSummerDayPass && <fieldset className="space-y-2"><legend className="mb-2 text-[13px] font-semibold text-[#344a64]">Number of days</legend>{dayPassOptions.map((item) => { const unavailable = item === 'TGIF Pass' && date && new Date(`${date}T00:00:00Z`).getUTCDay() !== 5; return <button key={item} type="button" disabled={unavailable} aria-pressed={option === item} onClick={() => setOption(item)} className={`flex min-h-[72px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${option === item ? 'border-[#5b8199] bg-white' : 'border-[#a0a0a0] bg-white'}`}><Bike className="h-6 w-6 shrink-0 text-[#344a64]"/><span className="min-w-0 flex-1"><b className="block">{item === 'Senior' ? 'Senior: Over 75' : item === 'Child Under 6' ? 'Child Under 6' : item}</b><small className="mt-1 block font-normal text-[#718096]">{unavailable ? 'Only available on Fridays' : product.optionDetails[item].description}</small></span><span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${option === item ? 'border-[#5b8199] bg-[#5b8199] text-white' : 'border-[#a0a7b0] bg-white'}`}>{option === item && <Check className="h-4 w-4"/>}</span></button>; })}</fieldset>}

    {isCarting && <label className="block text-[13px] font-semibold text-[#344a64]">Start Time {!cartingTime && <span className="text-[#5b8199]">(Required)</span>}<select value={cartingTime} onChange={(event) => setCartingTime(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#cbd7e4] bg-white px-3 text-[13px] font-normal text-[#344a64]"><option value="">Select a Time</option>{CARTING_TIMES.map((time, index) => <option key={time} value={time}>{time} • {index === 0 ? 23 : 30} left</option>)}</select></label>}

    {isPeakToPub ? <fieldset><legend className="mb-2 text-[13px] font-semibold text-[#344a64]">Age</legend><div className="flex gap-2">{['Adult', 'Child'].map((item) => <button key={item} type="button" aria-pressed={age === item} onClick={() => setAge(item)} className={`min-h-11 rounded-xl border px-4 text-[13px] ${age === item ? 'border-[#5b8199] font-semibold text-[#202b3a]' : 'border-[#cbd7e4] text-[#526d8b]'}`}>{item === 'Child' ? 'Child (6-17yrs)' : item}</button>)}</div></fieldset> : <label className="block text-[13px] font-semibold text-[#344a64]">{isEarlybird || isCarting || isSummerDayPass ? 'Age' : 'Adult or Child'}<select value={age} onChange={(event) => isSummerDayPass ? changeAge(event.target.value) : (setAge(event.target.value), isCarting && event.target.value.startsWith('Child') && setCartingBuddy(false))} className="mt-2 h-12 w-full rounded-xl border border-[#cbd7e4] bg-white px-3 text-[13px] font-normal text-[#344a64]">{(isEarlybird ? AGE_BANDS.map((band) => band.value) : isCarting ? ['Adult: 18 +', 'Child: 8 - 17'] : isSummerDayPass ? ['Adult: 18 - 74 yrs', 'Child: 6 - 17', 'Under 6yrs: Free of Charge', 'Over 75 yrs: Free of Charge'] : ['Adult', 'Child']).map((item) => <option key={item}>{item}</option>)}</select></label>}

    {isCarting && <>
      <section>
        <h3 className="text-[13px] font-semibold text-[#202b3a]">Equipment size</h3><p className="mt-1 text-[12px] text-[#718096]">Choose your equipment size:</p>
        <div className="mt-2 space-y-2">{CART_SIZES.map((size) => <button key={size.name} type="button" aria-pressed={cartSize === size.name} onClick={() => setCartSize(size.name)} className={`w-full rounded-xl border p-3 text-left ${cartSize === size.name ? 'border-2 border-[#5b8199]' : 'border-[#a0a0a0]'}`}><b className="block text-[13px]">{size.name}</b><span className="mt-1 block text-[10px] text-[#777]">{size.height}</span></button>)}</div>
      </section>
      {!age.startsWith('Child') && <section>
        <h3 className="text-[13px] font-semibold text-[#202b3a]">Mountain Carting Buddy Add On</h3>{!cartingBuddy && <p className="mt-1 text-[12px]">Select One (Optional)</p>}
        <label className={`mt-2 flex cursor-pointer gap-3 rounded-xl border p-4 ${cartingBuddy ? 'border-[#5b8199]' : 'border-[#a0a0a0]'}`}><span className="min-w-0 flex-1"><b className="text-[13px]">Carting With Kids</b><span className="mt-1 block text-[11px] leading-4 text-[#777]">Add a child between 6 and 8 yrs to ride tandem with an adult. Combined weight per cart must not exceed 110kg and the child must not exceed 100cm tall.</span><span className="mt-2 block text-[13px]">+ $25</span></span><input type="checkbox" checked={cartingBuddy} onChange={(event) => setCartingBuddy(event.target.checked)} className="mt-1 h-4 w-4 accent-[#5b8199]" /></label>
      </section>}
    </>}

    {isPeakToPub && <section>
      <h3 className="text-[13px] font-semibold text-[#202b3a]">Cardrona Valley Shuttle - up options</h3>
      <p className="mt-1 text-[12px] text-[#718096]">What time do you want to catch the shuttle?</p>
      <div className="mt-2 space-y-2">{[
        'Depart Cardrona Valley at 9.00am',
        'Depart Cardrona Valley at 11.00am',
        'Depart Cardrona Valley at 1.00pm',
        'Depart Cardrona Valley at 5.00pm (TGIF Fridays only)',
      ].map((departure) => <button key={departure} type="button" aria-pressed={shuttleDeparture === departure} onClick={() => selectShuttleDeparture(departure)} className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border p-3 text-left text-[12px] font-semibold ${shuttleDeparture === departure ? 'border-[#5b8199] bg-white' : 'border-[#cbd7e4] bg-white'}`}><span>{departure}</span><span className={`h-5 w-5 shrink-0 rounded-full border ${shuttleDeparture === departure ? 'border-[6px] border-[#5b8199]' : 'border-[#9ca3af]'}`} /></button>)}</div>
    </section>}

    {allowsDonations && <>
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

    <section className="rounded-[18px] border border-[#dce4ed] bg-white p-4 shadow-sm"><h3 className="font-serif text-[17px] font-bold text-[#202b3a]">Item Summary</h3><div className="mt-3 border-b border-[#cbd7e4] pb-3 text-[12px]">{product.needsDate && <><b className="block">Start Date</b><span className="mt-1 block text-[#718096]">{formatDate(date)}</span></>}{isCarting && cartingTime && <><b className="mt-3 block">Start Time</b><span className="mt-1 block text-[#718096]">{cartingTime}</span></>}{(!isSummerDayPass || option) && <><b className="mt-3 block">({isPeakToPub ? quantity : 1}) {summaryName}</b><span className="mt-1 block">{displayMoney((isCarting ? agePrice : price) * (isPeakToPub ? quantity : 1))}</span></>}{isSummerDayPass && !option && <span className="mt-3 block text-[#718096]">Choose a pass to see the price</span>}{isCarting && cartingBuddy && <div className="mt-3"><b className="block">(1) Add On - Mountain Carting Buddy</b><span className="mt-1 block">{displayMoney(25)}</span></div>}{allowsDonations && SUMMER_DONATIONS.filter((item) => selectedDonations.includes(item.id)).map((item) => <div key={item.id} className="mt-3"><b className="block">(1) {item.title}</b><span className="mt-1 block">{money(20)}</span></div>)}{product.hasPlan && <span className="mt-1 block text-[#718096]">{plan}</span>}</div><div className="mt-3 flex items-center justify-between text-[16px] font-semibold"><span>Total</span><span>{displayMoney(total)}</span></div><p className="mt-2 text-center text-[10px] text-[#718096]">Illustrative demo price · payment at checkout</p></section>

    <div className="fixed inset-x-0 bottom-[64px] z-20 mx-auto flex w-full max-w-[430px] items-center gap-2 border-t border-[#dce4ed] bg-white/95 px-4 py-3 backdrop-blur sm:bottom-[120px]"><span className="mr-auto"><small className="block text-[10px] text-[#718096]">Total</small><b className="font-serif text-[20px] text-[#5b8199]">{displayMoney(total)}</b></span>{isPeakToPub && <div className="flex h-9 items-center overflow-hidden rounded-md border border-[#cbd7e4] bg-[#f1f3f5]"><button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-full w-8 text-[#777] disabled:opacity-40">−</button><span className="flex h-full min-w-8 items-center justify-center border-x border-[#cbd7e4] bg-white text-[12px]">{quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)} className="h-full w-8 text-[#777]">+</button></div>}<button type="button" disabled={!canAdd} onClick={addProduct} className="h-11 flex-1 rounded-xl bg-[#5b8199] text-[13px] font-semibold tracking-wide text-white disabled:bg-[#c9c9c9]">{isSummerDayPass || isPeakToPub ? 'Add To Cart' : 'Add booking'}</button></div>

    {itemAdded && <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/25 p-2 sm:items-center"><section role="dialog" aria-modal="true" aria-labelledby="summer-item-added-title" className="w-full max-w-[430px] rounded-t-2xl border border-[#dce4ed] bg-white p-4 shadow-xl sm:rounded-2xl"><div className="flex items-center gap-2"><Check className="h-5 w-5 text-emerald-700"/><h2 id="summer-item-added-title" className="text-[17px] font-bold">Item Added</h2><button type="button" onClick={() => setItemAdded(false)} aria-label="Close" className="ml-auto px-2 text-xl">×</button></div>{isEarlybird && earlybirdSavings > 0 && <p className="mt-3 rounded-md bg-emerald-700 px-2 py-1 text-[11px] font-semibold text-white">Booking online saves you {earlybirdDiscountPercent}%</p>}<p className="mt-3 text-[13px] font-semibold">{product.needsDate ? formatDate(date) : isEarlybird ? 'Summer 2026/27 season' : 'Summer visit'}</p><div className="mt-3 flex justify-between gap-3 border-b border-[#dce4ed] pb-3 text-[12px]"><span>{isPeakToPub ? quantity : 1} {summaryName}</span><b className="flex shrink-0 items-center gap-2">{isEarlybird && earlybirdSavings > 0 && <del className="text-[#68717f]">{money(earlybirdReferencePrice)}</del>}{displayMoney((isCarting ? agePrice : price) * (isPeakToPub ? quantity : 1))}</b></div>{isEarlybird && earlybirdSavings > 0 && <div className="mt-2 flex items-center gap-2"><span className="rounded bg-emerald-700 px-2 py-1 text-[10px] font-bold text-white">{earlybirdDiscountPercent}% OFF</span><span className="text-[11px] text-[#68717f]">You save <b className="text-emerald-700">{money(earlybirdSavings)}</b></span></div>}{isCarting && <p className="border-b border-[#dce4ed] py-2 text-[11px] text-[#718096]">Start time: {cartingTime} · {cartSize} cart{cartingBuddy ? ' · Carting With Kids +NZ$25' : ''}</p>}{isPeakToPub && <p className="border-b border-[#dce4ed] py-2 text-[11px] text-[#718096]">{shuttleDeparture}</p>}{isCarting && cartingBuddy && <div className="flex justify-between gap-3 border-b border-[#dce4ed] py-2 text-[12px]"><span>(1) Add On - Mountain Carting Buddy</span><b className="shrink-0">{displayMoney(25)}</b></div>}{allowsDonations && SUMMER_DONATIONS.filter((item) => selectedDonations.includes(item.id)).map((item) => <div key={item.id} className="flex justify-between gap-3 border-b border-[#dce4ed] py-2 text-[12px]"><span>1 {item.title}</span><b className="shrink-0">{money(20)}</b></div>)}{isEarlybird && earlybirdSavings > 0 ? <div className="space-y-2 border-t border-[#dce4ed] py-3 text-[12px]"><p className="flex justify-between"><span>Per Item Subtotal</span><span>{money(earlybirdReferencePrice)}</span></p><p className="flex justify-between font-semibold"><span>Per Item Total</span><span>{money(price)}</span></p><p className="flex justify-between font-semibold"><span>Cart Total</span><span>{money(cartTotal + total)}</span></p><p className="bg-[#f7f8f9] px-2 py-3 text-center">You Save <b className="text-emerald-700">{money(earlybirdSavings)}</b><br/>Got a discount code? Apply it at checkout.</p></div> : <p className="flex justify-between py-3 text-[12px] font-semibold"><span>Cart total</span><span>{displayMoney(cartTotal + total)}</span></p>}<p className="bg-[#f7f8f9] px-2 py-3 text-center text-[11px]">Payment is available at checkout. No real charge is made.</p><div className="mt-3 grid grid-cols-2 gap-3"><button type="button" onClick={() => navigate('/cart')} className="h-11 rounded-xl border border-[#344a64] text-[12px]">View Cart</button><button type="button" onClick={onCheckout} className="h-11 rounded-xl bg-[#5b8199] text-[12px] font-semibold text-white">Checkout</button></div></section></div>}
  </main>;
}
