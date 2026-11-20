import { useState } from 'react';
import { CalendarDays, Minus, Plus } from 'lucide-react';

const START_DATE = '2026-12-12';
const END_DATE = '2027-02-28';
const DEPARTURES = [
  { value: '9:00am', label: 'Depart Cardrona Valley at 9.00am' },
  { value: '11:00am', label: 'Depart Cardrona Valley at 11.00am' },
  { value: '1:00pm', label: 'Depart Cardrona Valley at 1.00pm' },
  { value: '5:00pm', label: 'Depart Cardrona Valley at 5.00pm (TGIF Fridays only)', fridayOnly: true },
];
const RETURN_DEPARTURES = [
  { value: '12:30pm', label: 'Depart the mountain at 12.30pm' },
  { value: '4:15pm', label: 'Depart the mountain at 4.15pm' },
  { value: '8:15pm', label: 'Depart the mountain at 8.15pm (TGIF - Fridays only)' },
];
const formatDate = (value) => value ? new Intl.DateTimeFormat('en-NZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) : 'No date selected';
const money = (value) => `NZ$${Number(value).toFixed(2)}`;

export default function SummerShuttleConfigurator({ onAdd }) {
  const [departure, setDeparture] = useState('9:00am');
  const [startDate, setStartDate] = useState('');
  const [returnDeparture, setReturnDeparture] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showMore, setShowMore] = useState(false);
  const [dateError, setDateError] = useState('');
  const selectedDeparture = DEPARTURES.find((option) => option.value === departure);
  const selectedReturn = RETURN_DEPARTURES.find((option) => option.value === returnDeparture);
  const availableReturns = departure === '5:00pm' ? RETURN_DEPARTURES.filter((option) => option.value === '8:15pm') : RETURN_DEPARTURES.filter((option) => option.value !== '8:15pm');
  const returnPrice = selectedReturn ? 5 : 0;
  const unitTotal = 20 + returnPrice;
  const isFriday = startDate ? new Date(`${startDate}T00:00:00Z`).getUTCDay() === 5 : false;
  const canAdd = Boolean(startDate && selectedDeparture && (!selectedDeparture.fridayOnly || isFriday));

  const updateDate = (value) => {
    setStartDate(value);
    if (departure === '5:00pm' && new Date(`${value}T00:00:00Z`).getUTCDay() !== 5) {
      setDeparture('1:00pm');
      setDateError('The 5.00pm shuttle is available on Fridays only.');
    } else {
      setDateError('');
    }
  };

  return <main className="space-y-4 px-4 pb-36 pt-4">
    <section className="rounded-[17px] border border-[#dce4ed] bg-white p-4">
      <h1 className="font-serif text-[22px] font-bold text-[#263345]">Cardrona Valley Shuttle</h1>
      <div className="mt-3 border-y border-[#cbd7e4] py-3 text-[12px] leading-5 text-[#718096]">
        <p>Let us do the driving from Cardrona Valley to the top of the mountain. Then either ride back down via the Peak to Pub trail, or we can drive you back to your car!</p>
        {showMore && <p className="mt-2">Choose a shuttle departure, select your travel date, and optionally book a return shuttle from the mountain. Demo bookings do not reserve real seats.</p>}
        <button type="button" onClick={() => setShowMore((open) => !open)} className="mt-1 font-medium text-[#344a64] underline">{showMore ? 'See less' : 'See more'}</button>
      </div>

      <fieldset className="mt-4 space-y-2">
        <legend className="text-[13px] font-bold text-[#263345]">Cardrona Valley Shuttle Departure times</legend>
        <p className="text-[11px] text-[#718096]">What time do you want to catch the shuttle?</p>
        {DEPARTURES.map((option) => { const fridayUnavailable = option.fridayOnly && startDate && !isFriday; return <button type="button" key={option.value} disabled={Boolean(fridayUnavailable)} aria-pressed={departure === option.value} onClick={() => { setDeparture(option.value); setDateError(''); if (option.value === '11:00am') setReturnDeparture('4:15pm'); else if (option.value === '5:00pm') setReturnDeparture('8:15pm'); else if (returnDeparture === '8:15pm') setReturnDeparture(''); }} className={`flex min-h-[52px] w-full items-center gap-2 rounded-xl border px-3 text-left disabled:cursor-not-allowed disabled:opacity-45 ${departure === option.value ? 'border-[#5b8199] ring-1 ring-[#5b8199]' : 'border-[#b9b9c0]'}`}><b className="min-w-0 flex-1 text-[11px] leading-4 text-[#263345]">{option.label}</b><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${departure === option.value ? 'border-[#5b8199] bg-[#5b8199] text-white' : 'border-[#9a9da3]'}`}>{departure === option.value && <span className="h-1.5 w-1.5 rounded-full bg-white"/>}</span></button>; })}
      </fieldset>

      <section className="mt-4">
        <h2 className="text-[13px] font-bold text-[#263345]">Choose your start date</h2>
        <p className="mt-1 text-[11px] leading-4 text-[#858585]">Online bookings close the day prior to shuttle. Please call 0800 440 800 for availability.</p>
        {dateError && <p role="alert" className="mt-1 text-[11px] text-[#bd3434]">{dateError}</p>}
        <label className="relative mt-2 block"><span className="absolute left-3 top-2 text-[9px] text-[#858585]">Choose your start date</span><input type="date" min={START_DATE} max={END_DATE} value={startDate} onChange={(event) => updateDate(event.target.value)} className="h-[54px] w-full rounded-xl border border-[#b9b9c0] bg-white px-3 pt-4 text-[12px] text-[#333]"/><CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#858585]"/></label>
      </section>

      <section className="mt-5 space-y-2">
        <h2 className="text-[13px] font-bold text-[#263345]">Choose your return departure below</h2>
        <p className="pt-3 text-[11px] text-[#858585]">Book your ride down now &amp; save!!</p>
        {availableReturns.map((option) => <button type="button" key={option.value} aria-pressed={returnDeparture === option.value} onClick={() => setReturnDeparture((current) => current === option.value ? '' : option.value)} className={`flex min-h-[62px] w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border px-3 py-2 text-left ${returnDeparture === option.value ? 'border-[#5b8199] ring-1 ring-[#5b8199]' : 'border-[#b9b9c0]'}`}><b className="flex-1 text-[11px] text-[#263345]">{option.label}</b><span className={`grid h-5 w-5 place-items-center rounded border ${returnDeparture === option.value ? 'border-[#5b8199] bg-[#5b8199] text-white' : 'border-[#9a9da3]'}`}>{returnDeparture === option.value ? '✓' : ''}</span><span className="w-full text-[11px] text-[#555]">+ $5</span></button>)}
      </section>
    </section>

    <section className="rounded-[17px] border border-[#dce4ed] bg-white p-4 shadow-sm">
      <h2 className="font-serif text-[18px] font-bold text-[#202b3a]">Item Summary</h2>
      <div className="mt-3 space-y-3 border-b border-[#cbd7e4] pb-3 text-[12px]"><div><b className="block">Start Date</b><span className="mt-1 block text-[#718096]">{formatDate(startDate)}</span></div>{startDate && <><div><b className="block">({quantity}) Cardrona Valley Shuttle - {departure.replace(':00', '').replace('am', 'am').replace('pm', 'pm')} UP</b><span className="mt-1 block">{money(20 * quantity)}</span></div>{selectedReturn && <div><b className="block">({quantity}) Add On - Shuttle Departure At {selectedReturn.value}</b><span className="mt-1 block">{money(returnPrice * quantity)}</span></div>}</>}</div>
      <div className="mt-3 flex items-center justify-between text-[16px] font-semibold"><span>Total</span><span>{money(unitTotal * quantity)}</span></div>
      <div className="mt-3 flex items-center justify-between gap-3"><div className="flex h-10 shrink-0 items-center overflow-hidden rounded-lg border border-[#cbd7e4]"><button type="button" aria-label="Remove one shuttle seat" disabled={quantity <= 1} onClick={() => setQuantity((count) => Math.max(1, count - 1))} className="h-full px-2.5 text-[#526982] disabled:opacity-35"><Minus className="h-4 w-4"/></button><b className="min-w-8 text-center text-[13px] font-normal">{quantity}</b><button type="button" aria-label="Add one shuttle seat" onClick={() => setQuantity((count) => Math.min(10, count + 1))} className="h-full px-2.5 text-[#526982]"><Plus className="h-4 w-4"/></button></div><button type="button" disabled={!canAdd} onClick={() => onAdd({ id: 'cardrona-valley-shuttle', name: 'Cardrona Valley Shuttle', price: unitTotal, quantity, detail: `${departure} UP${selectedReturn ? ` · Return ${selectedReturn.value}` : ''}`, variant: `${startDate}:${departure}:${returnDeparture}`, visitDate: startDate })} className="h-10 flex-1 rounded-lg bg-[#5b8199] text-[12px] font-semibold tracking-wide text-white disabled:cursor-not-allowed disabled:bg-[#c9c9c9]">Add To Cart</button></div>
      <p className="mt-2 text-center text-[10px] text-[#718096]">Demo booking only · availability and fares are samples.</p>
    </section>
  </main>;
}
