import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CableCar, Check, ChevronDown } from 'lucide-react';
import DateAvailabilityCalendar from './DateAvailabilityCalendar';

const AGE_OPTIONS = [
  { label: 'Adult: 18 - 74', price: 35 },
  { label: 'Child: 6 - 17', price: 25 },
  { label: 'Under 6', price: 0 },
  { label: 'Over 75', price: 0 },
];
const SUMMER_START = '2026-12-12';
const SUMMER_END = '2027-02-28';

const DONATIONS = [
  { id: 'seed', title: 'Plant a Seed', description: 'Help regenerate native plants and offset carbon emissions.' },
  { id: 'tamariki', title: 'Ride Tamariki', description: 'Help children and families experience the mountains.' },
  { id: 'karearea', title: 'Kārearea Project', description: 'Support conservation of the New Zealand falcon.' },
  { id: 'all-in', title: 'All In', description: 'Support an inclusive mountain community.' },
];

const money = (value) => `NZ$${Number(value).toFixed(2)}`;
const formatDate = (value) => value ? new Intl.DateTimeFormat('en-NZ', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) : 'No date selected';

export default function SightseeingConfigurator({ onAdd, onCheckout, cartTotal = 0 }) {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [age, setAge] = useState(AGE_OPTIONS[0].label);
  const [uplift, setUplift] = useState(true);
  const [foundation, setFoundation] = useState(false);
  const [foundationAmount, setFoundationAmount] = useState('');
  const [selectedDonations, setSelectedDonations] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [itemAdded, setItemAdded] = useState(false);

  const agePrice = AGE_OPTIONS.find((option) => option.label === age)?.price ?? 35;
  const addOnTotal = selectedDonations.length * 20;
  const donation = foundation ? Math.max(0, Number(foundationAmount) || 0) : 0;
  const total = agePrice + (uplift ? 0 : -20) + addOnTotal + donation;

  const toggleDonation = (id) => setSelectedDonations((current) =>
    current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
  );

  const addPass = () => {
    const selected = [
      uplift ? '1 uplift · McDougall’s Chondola' : 'Sightseeing pass only',
      ...DONATIONS.filter((item) => selectedDonations.includes(item.id)).map((item) => `${item.title} +$20`),
      ...(donation ? [`Cardrona Foundation donation ${money(donation)}`] : []),
    ];
    onAdd({
      id: 'summer-sightseeing-pass',
      name: `Summer Sightseeing Pass · ${age}`,
      price: total,
      visitDate: startDate,
      ageBand: age,
      detail: `${startDate} · ${selected.join(' · ')}`,
      variant: `${startDate}-${age}-${uplift}-${selectedDonations.join(',')}-${donation}`,
    });
  };

  return <main className="space-y-5 px-4 pb-[150px] pt-5 sm:px-8 sm:pb-[220px]">
    <section>
      <h2 className="font-serif text-[26px] font-bold text-[#202b3a]">Summer Sightseeing Pass</h2>
      <div className="mt-3 border-y border-[#cbd7e4] py-4 text-[13px] leading-6 text-[#718096]">
        Enjoy the mountain views, explore alpine trails, or take a scenic gondola ride.
        {showMore && <span> This pass is valid on your selected summer date at Cardrona.</span>}
        <button type="button" className="ml-1 text-[#344a64] underline" onClick={() => setShowMore((value) => !value)}>{showMore ? 'See less' : 'See more'}</button>
      </div>
    </section>

    <section className="space-y-4">
      <DateAvailabilityCalendar value={startDate} onChange={setStartDate} min={SUMMER_START} max={SUMMER_END} isUnavailable={(value) => {
        const weekday = new Date(`${value}T00:00:00Z`).getUTCDay();
        const peakSeason = value >= '2026-12-28' && value <= '2027-01-17';
        return value === '2026-12-25' || (!peakSeason && (weekday === 2 || weekday === 3));
      }} required />

      <label className="block text-[13px] font-semibold text-[#344a64]">Age
        <span className="relative mt-2 block">
          <select value={age} onChange={(event) => setAge(event.target.value)} className="h-12 w-full appearance-none rounded-xl border border-[#cbd7e4] bg-white px-3 pr-10 text-[13px] font-normal text-[#344a64] outline-none focus:border-[#5b8199]">
            {AGE_OPTIONS.map((option) => <option key={option.label}>{option.label}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-[#718096]" />
        </span>
      </label>

      <fieldset>
        <legend className="mb-2 text-[13px] font-semibold text-[#344a64]">Gondola ride</legend>
        <button type="button" aria-pressed={uplift} onClick={() => setUplift((selected) => !selected)} className={`flex min-h-12 w-full items-center gap-2 rounded-xl border px-3 text-left text-[13px] font-semibold ${uplift ? 'border-[#5b8199] bg-white text-[#344a64]' : 'border-[#cbd7e4] bg-white text-[#718096]'}`}>
          <CableCar className="h-5 w-5 text-[#5b8199]" />1 uplift · McDougall’s Chondola
          {uplift && <Check className="ml-auto h-4 w-4 text-[#5b8199]" />}
        </button>
      </fieldset>
    </section>

    <section className="space-y-3 border-t border-[#cbd7e4] pt-4">
      <div>
        <h3 className="text-[14px] font-semibold text-[#344a64]">Would you like to support the Cardrona Foundation?</h3>
        <p className="mt-1 text-[12px] leading-5 text-[#718096]">Help support conservation and our mountain communities.</p>
      </div>
      <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[#cbd7e4] bg-white px-3 text-[12px] font-semibold text-[#344a64]">
        <input type="checkbox" checked={foundation} onChange={(event) => setFoundation(event.target.checked)} className="h-4 w-4 accent-[#5b8199]" />
        Yes, I’d like to make a donation
      </label>
      {foundation && <label className="block text-[11px] text-[#718096]">Donation amount (NZD)
        <input type="number" min="0" step="1" value={foundationAmount} onChange={(event) => setFoundationAmount(event.target.value)} placeholder="Enter an amount" className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd7e4] px-3 text-[12px] text-[#344a64]" />
      </label>}
      <div className="space-y-3">
        {DONATIONS.map((item) => <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${selectedDonations.includes(item.id) ? 'border-[#5b8199] bg-[#f5f8fb]' : 'border-[#dce4ed] bg-white'}`}>
          <input type="checkbox" checked={selectedDonations.includes(item.id)} onChange={() => toggleDonation(item.id)} className="mt-1 h-4 w-4 shrink-0 accent-[#5b8199]" />
          <span><b className="block text-[12px] text-[#344a64]">{item.title}</b><small className="mt-1 block text-[10px] leading-4 text-[#718096]">{item.description}</small><span className="mt-1.5 block text-[11px] text-[#344a64]">+ NZ$20.00</span></span>
        </label>)}
      </div>
    </section>

    <section className="rounded-[18px] border border-[#dce4ed] bg-white p-4 shadow-sm">
      <h3 className="font-serif text-[17px] font-bold text-[#202b3a]">Item Summary</h3>
      <div className="mt-3 border-b border-[#cbd7e4] pb-3 text-[12px]">
        <b className="block">Start Date</b><span className="mt-1 block text-[#718096]">{formatDate(startDate)}</span>
        <b className="mt-3 block">(1) Summer Sightseeing Pass · {age}{uplift ? ' · 1 uplift to McDougall’s Chondola' : ''}</b>
        <span className="mt-1 block">{money(agePrice + (uplift ? 0 : -20))}</span>
        {selectedDonations.map((id) => <span key={id} className="mt-1 block text-[#718096]">{DONATIONS.find((item) => item.id === id)?.title} + NZ$20.00</span>)}
        {donation > 0 && <span className="mt-1 block text-[#718096]">Cardrona Foundation donation {money(donation)}</span>}
      </div>
      <div className="mt-3 flex items-center justify-between text-[16px] font-semibold"><span>Total</span><span>{money(total)}</span></div>
      <p className="mt-2 text-center text-[10px] text-[#718096]">Demo checkout · no real charge is made.</p>
    </section>

    <div className="fixed inset-x-0 bottom-[64px] z-20 mx-auto flex w-full max-w-[430px] items-center gap-3 border-t border-[#dce4ed] bg-white/95 px-4 py-3 backdrop-blur sm:bottom-[120px]">
      <span className="mr-auto"><small className="block text-[10px] text-[#718096]">Total</small><b className="font-serif text-[20px] text-[#c8102e]">{money(total)}</b></span>
      <button type="button" disabled={!startDate} onClick={() => { addPass(); setItemAdded(true); }} className="h-11 flex-1 rounded-xl bg-[#5b8199] text-[13px] font-semibold tracking-wide text-white disabled:cursor-not-allowed disabled:bg-[#c9c9c9]">Add to cart</button>
    </div>
    {itemAdded && <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/25 p-2 sm:items-center">
      <section role="dialog" aria-modal="true" aria-labelledby="item-added-title" className="w-full max-w-[430px] rounded-t-2xl border border-[#dce4ed] bg-white p-4 shadow-xl sm:rounded-2xl">
        <div className="flex items-center gap-2"><Check className="h-5 w-5 text-emerald-700"/><h2 id="item-added-title" className="text-[17px] font-bold">Item Added</h2><button type="button" onClick={() => setItemAdded(false)} aria-label="Close" className="ml-auto px-2 text-xl">×</button></div>
        <p className="mt-3 text-[13px] font-semibold">{formatDate(startDate)}</p>
        <div className="mt-3 flex justify-between gap-3 border-b border-[#dce4ed] pb-3 text-[12px]"><span>1 Summer Sightseeing Pass · {age}{uplift ? ' · 1 uplift to McDougall’s Chondola' : ''}</span><b className="shrink-0">{money(total)}</b></div>
        <div className="space-y-1 py-3 text-[12px]"><p className="flex justify-between"><span>Per item subtotal</span><span>{money(total)}</span></p><p className="flex justify-between font-semibold"><span>Per item total</span><span>{money(total)}</span></p><p className="flex justify-between font-semibold"><span>Cart total</span><span>{money(cartTotal + total)}</span></p></div>
        <p className="bg-[#f7f8f9] px-2 py-3 text-center text-[11px]">Got a discount code? Apply it at checkout.</p>
        <div className="mt-3 grid grid-cols-2 gap-3"><button type="button" onClick={() => navigate('/cart')} className="h-11 rounded-xl border border-[#344a64] text-[12px]">View Cart</button><button type="button" onClick={onCheckout} className="h-11 rounded-xl bg-[#5b8199] text-[12px] font-semibold text-white">Checkout</button></div>
      </section>
    </div>}
  </main>;
}
