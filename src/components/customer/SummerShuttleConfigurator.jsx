import { useState } from 'react';
import { CalendarDays, Minus, Plus } from 'lucide-react';
import ProductSummaryCard from './ProductSummaryCard';
import ProductIntro from './ProductIntro';
import { cardronaImage } from '@/lib/cardronaImages';

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

  return <main className="space-y-5 px-4 pb-10 pt-4">
    <section className="space-y-4">
      <ProductIntro
        title="Cardrona Valley Shuttle"
        season="Summer"
        image={cardronaImage('summer-peak-to-pub.webp')}
        imageAlt="Summer mountain biking at Cardrona"
        description="Ride from Cardrona Valley Road to the mountain, then choose an optional shuttle back down."
        details="Choose an available travel date and an uphill departure. Return seats are optional and cost NZ$5 per passenger. Online bookings close the day before travel; call 0800 440 800 for availability."
      />

      <fieldset className="mt-4 grid grid-cols-2 gap-2">
        <legend className="col-span-2 text-[17px] font-bold text-[#202b3a]">Departure from Cardrona Valley</legend>
        <p className="col-span-2 text-[13px] text-[#60738d]">Choose when you want to ride up.</p>
        {DEPARTURES.map((option) => { const fridayUnavailable = option.fridayOnly && startDate && !isFriday; return <button type="button" key={option.value} disabled={Boolean(fridayUnavailable)} aria-pressed={departure === option.value} onClick={() => { setDeparture(option.value); setDateError(''); if (option.value === '11:00am') setReturnDeparture('4:15pm'); else if (option.value === '5:00pm') setReturnDeparture('8:15pm'); else if (returnDeparture === '8:15pm') setReturnDeparture(''); }} className={`flex min-h-[64px] w-full items-center gap-3 rounded-xl border px-3 py-3 text-left disabled:cursor-not-allowed disabled:opacity-45 ${departure === option.value ? 'border-[#5b8199] bg-[#eaf1f6] ring-1 ring-[#5b8199]' : 'border-[#b9b9c0] bg-white'}`}><b className="min-w-0 flex-1 text-[14px] leading-5 text-[#263345]">{option.label.replace('Depart Cardrona Valley at ', '')}</b><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${departure === option.value ? 'border-[#5b8199] bg-[#5b8199] text-white' : 'border-[#9a9da3]'}`}>{departure === option.value && <span className="h-1.5 w-1.5 rounded-full bg-white"/>}</span></button>; })}
      </fieldset>

      <section className="mt-4">
        <h2 className="text-[17px] font-bold text-[#202b3a]">Travel date</h2>
        <p className="mt-1 text-[13px] leading-5 text-[#60738d]">Online bookings close the day prior to the shuttle. Call 0800 440 800 for availability.</p>
        {dateError && <p role="alert" className="mt-1 text-[11px] text-[#bd3434]">{dateError}</p>}
        <label className="relative mt-2 block"><span className="absolute left-3 top-2 text-[10px] font-medium text-[#60738d]">Choose your start date</span><input type="date" min={START_DATE} max={END_DATE} value={startDate} onChange={(event) => updateDate(event.target.value)} className="h-[58px] w-full rounded-xl border border-[#b9b9c0] bg-white px-3 pt-4 text-[14px] font-medium text-[#263345]"/><CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#60738d]"/></label>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-2">
        <h2 className="text-[17px] font-bold text-[#202b3a]">Return shuttle <span className="font-normal text-[#60738d]">(optional)</span></h2>
        <p className="col-span-2 pt-1 text-[13px] text-[#60738d]">Choose a ride down, or leave this unselected.</p>
        {availableReturns.map((option) => <button type="button" key={option.value} aria-pressed={returnDeparture === option.value} onClick={() => setReturnDeparture((current) => current === option.value ? '' : option.value)} className={`flex min-h-[70px] w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border px-3 py-3 text-left ${returnDeparture === option.value ? 'border-[#5b8199] bg-[#eaf1f6] ring-1 ring-[#5b8199]' : 'border-[#b9b9c0] bg-white'}`}><b className="flex-1 text-[14px] leading-5 text-[#263345]">{option.label.replace('Depart the mountain at ', '')}</b><span className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${returnDeparture === option.value ? 'border-[#5b8199] bg-[#5b8199] text-white' : 'border-[#9a9da3]'}`}>{returnDeparture === option.value ? '✓' : ''}</span><span className="w-full text-[13px] text-[#526982]">+ NZ$5.00</span></button>)}
      </section>
    </section>

    <section className="flex items-center justify-between rounded-xl border border-[#d6e0ea] bg-white px-4 py-3">
      <span className="text-[13px] font-semibold text-[#344a64]">Passengers</span>
      <div className="flex h-11 items-center overflow-hidden rounded-lg border border-[#cbd7e4]"><button type="button" aria-label="Remove one shuttle seat" disabled={quantity <= 1} onClick={() => setQuantity((count) => Math.max(1, count - 1))} className="h-full px-3 text-[#526982] disabled:opacity-35"><Minus className="h-4 w-4"/></button><b className="min-w-8 text-center text-[14px] font-normal">{quantity}</b><button type="button" aria-label="Add one shuttle seat" onClick={() => setQuantity((count) => Math.min(10, count + 1))} className="h-full px-3 text-[#526982]"><Plus className="h-4 w-4"/></button></div>
    </section>
    <ProductSummaryCard title="Your pass" dateLabel={formatDate(startDate)} selection={`${quantity} ${quantity === 1 ? 'passenger' : 'passengers'} · ${departure}${selectedReturn ? ` · Return ${selectedReturn.value}` : ''}`} total={money(unitTotal * quantity).replace('.00', '')} actionLabel="Add to cart" disabled={!canAdd} onAdd={() => onAdd({ id: 'cardrona-valley-shuttle', name: 'Cardrona Valley Shuttle', price: unitTotal, quantity, detail: `${departure} UP${selectedReturn ? ` · Return ${selectedReturn.value}` : ''}`, variant: `${startDate}:${departure}:${returnDeparture}`, visitDate: startDate })} />
  </main>;
}
