import { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { LocalizeCustomerTree } from '@/lib/customerLocale';
import { useNavigate } from 'react-router-dom';
import { CableCar, Check } from 'lucide-react';
import DateAvailabilityCalendar from './DateAvailabilityCalendar';
import AgeFirstGuestCounts from './AgeFirstGuestCounts';
import ProductSummaryCard from './ProductSummaryCard';

const AGE_OPTIONS = [
  { label: 'Adult: 18 - 74', price: 35 },
  { label: 'Child: 6 - 17', price: 25 },
  { label: 'Under 6', price: 0 },
  { label: 'Over 75', price: 0 },
];
const SUMMER_START = '2026-12-12';
const SUMMER_END = '2027-02-28';

const money = (value) => `NZ$${Number(value).toFixed(2)}`;
const formatDate = (value) => value ? new Intl.DateTimeFormat('en-NZ', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) : 'No date selected';

export default function SightseeingConfigurator({ onAdd, onCheckout, cartTotal = 0 }) {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [ageStage, setAgeStage] = useState('counts');
  const [guestCounts, setGuestCounts] = useState({ [AGE_OPTIONS[0].label]: 1, [AGE_OPTIONS[1].label]: 1, [AGE_OPTIONS[2].label]: 0, [AGE_OPTIONS[3].label]: 0 });
  const [uplift, setUplift] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [itemAdded, setItemAdded] = useState(false);

  const ageEntries = AGE_OPTIONS.map((option) => ({ ...option, quantity: guestCounts[option.label] || 0 })).filter((option) => option.quantity > 0);
  const guestCount = ageEntries.reduce((sum, option) => sum + option.quantity, 0);
  const total = ageEntries.reduce((sum, option) => sum + Math.max(0, option.price + (uplift ? 0 : -20)) * option.quantity, 0);

  const addPass = () => ageEntries.forEach((entry) => {
    const selected = uplift ? "1 uplift - McDougall's Chondola" : 'Sightseeing pass only';
    onAdd({
      id: 'summer-sightseeing-pass',
      name: 'Summer Sightseeing Pass',
      price: Math.max(0, entry.price + (uplift ? 0 : -20)),
      quantity: entry.quantity,
      visitDate: startDate,
      ageBand: entry.label,
      detail: [startDate, entry.label.replace(': ', ' '), selected].join(' · '),
      variant: `${startDate}-${entry.label}-${uplift}`,
    });
  });

  return <LocalizeCustomerTree lang={lang}><main className="space-y-5 px-4 pb-[100px] pt-5 sm:px-8 sm:pb-[140px]">
    <section>
      <h2 className="font-serif text-[26px] font-bold text-[#20242b]">Summer Sightseeing Pass</h2>
      <div className="mt-3 border-y border-[#cbd7e4] py-4 text-[13px] leading-6 text-[#718096]">
        Enjoy the mountain views, explore alpine trails, or take a scenic gondola ride.
        {showMore && <span> This pass is valid on your selected summer date at Cardrona.</span>}
        <button type="button" className="ml-1 text-[#344a64] underline" onClick={() => setShowMore((value) => !value)}>{showMore ? 'See less' : 'See more'}</button>
      </div>
    </section>

    {ageStage === 'counts' ? <AgeFirstGuestCounts options={AGE_OPTIONS.map((option) => ({ value: option.label, label: option.label }))} counts={guestCounts} onChange={(label, count) => setGuestCounts((current) => ({ ...current, [label]: count }))} onContinue={() => setAgeStage('options')} continueLabel={`Continue with ${guestCount} ${guestCount === 1 ? 'guest' : 'guests'}`} /> : <section className="space-y-4">
      <button type="button" onClick={() => setAgeStage('counts')} className="text-[13px] text-[#5b8199] underline">Edit guest counts</button>
      <DateAvailabilityCalendar value={startDate} onChange={setStartDate} min={SUMMER_START} max={SUMMER_END} isUnavailable={(value) => {
        const weekday = new Date(`${value}T00:00:00Z`).getUTCDay();
        const peakSeason = value >= '2026-12-28' && value <= '2027-01-17';
        return value === '2026-12-25' || (!peakSeason && (weekday === 2 || weekday === 3));
      }} required />

      <fieldset>
        <legend className="mb-2 text-[13px] font-semibold text-[#344a64]">Gondola Ride</legend>
        <button type="button" aria-pressed={uplift} onClick={() => setUplift((selected) => !selected)} className={`flex min-h-12 w-full items-center gap-2 rounded-xl border px-3 text-left text-[13px] font-semibold ${uplift ? 'border-[#5b8199] bg-white text-[#344a64]' : 'border-[#cbd7e4] bg-white text-[#718096]'}`}>
          <CableCar className="h-5 w-5 text-[#5b8199]" />1 uplift - McDougall's Chondola
          {uplift && <Check className="ml-auto h-4 w-4 text-[#5b8199]" />}
        </button>
      </fieldset>
    </section>}

    <ProductSummaryCard title="Your pass" dateLabel={formatDate(startDate)} selection={`${ageEntries.map((entry) => `${entry.quantity > 1 ? `${entry.quantity} ` : ''}${entry.label.split(':')[0]}`).join(', ')} · Sightseeing${uplift ? ' · 1 uplift' : ''}`} total={money(total).replace('.00', '')} actionLabel="Add pass to cart" disabled={!startDate || !guestCount} onAdd={() => { addPass(); setItemAdded(true); }} />
    {itemAdded && <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/25 p-2 sm:items-center">
      <section role="dialog" aria-modal="true" aria-labelledby="item-added-title" className="w-full max-w-[430px] rounded-t-2xl border border-[#dce4ed] bg-white p-4 shadow-xl sm:rounded-2xl">
        <div className="flex items-center gap-2"><Check className="h-5 w-5 text-emerald-700"/><h2 id="item-added-title" className="text-[17px] font-bold">Item Added</h2><button type="button" onClick={() => setItemAdded(false)} aria-label="Close" className="ml-auto px-2 text-xl">×</button></div>
        <p className="mt-3 text-[13px] font-semibold">{formatDate(startDate)}</p>
        {ageEntries.map((entry) => <div key={entry.label} className="mt-3 flex justify-between gap-3 border-b border-[#dce4ed] pb-3 text-[12px]"><span>{entry.quantity} Summer Sightseeing Pass - {entry.label.replace(': ', ' ')}{uplift ? " - 1 Uplift To McDougall's Chondola" : ''}</span><b className="shrink-0">{money(entry.quantity * Math.max(0, entry.price + (uplift ? 0 : -20)))}</b></div>)}
        <div className="space-y-1 py-3 text-[12px]"><p className="flex justify-between"><span>Cart total</span><span>{money(cartTotal + total)}</span></p></div>
        <div className="mt-3 grid grid-cols-2 gap-3"><button type="button" onClick={() => navigate('/cart')} className="h-11 rounded-xl border border-[#344a64] text-[12px]">View Cart</button><button type="button" onClick={onCheckout} className="h-11 rounded-xl bg-[#5b8199] text-[12px] font-semibold text-white">Checkout</button></div>
      </section>
    </div>}
  </main></LocalizeCustomerTree>;
}
