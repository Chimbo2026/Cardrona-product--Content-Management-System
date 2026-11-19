import { useState } from 'react';
import { useLang } from '@/lib/i18n';
import { LocalizeCustomerTree } from '@/lib/customerLocale';
import { Check, Minus, Plus } from 'lucide-react';

const PRICES = {
  Adult: { 3: 449, 4: 499, 5: 580, 6: 630 },
  Child: { 3: 250, 4: 280, 5: 300, 6: 330 },
  Senior: { 3: 350, 4: 420, 5: 459, 6: 529 },
  Student: { 3: 350, 4: 420, 5: 459, 6: 529 },
};

const AGE_OPTIONS = [
  ['Adult', 'Adult: 18 - 64'],
  ['Child', 'Child: 6 - 17'],
  ['Senior', 'Senior: 65 - 74'],
  ['Student', 'Student: Tertiary ID required'],
];

const DONATIONS = [
  { id: 'karearea', name: 'The Kārearea Project', description: 'Help fund our scientific conservation of the magnificent and threatened NZ Falcon.' },
  { id: 'seed', name: 'Plant A Seed', description: 'Help us plant natives to regenerate our environment and offset your carbon emissions*.' },
  { id: 'tamariki', name: 'Ride Tamariki', description: 'Help us provide life changing experiences in the mountains for disadvantaged children/families.' },
  { id: 'all-in', name: 'All In', description: 'Creating an inclusive environment for all by supporting and representing all communities of the mountain.' },
];

const money = (amount) => `$${amount.toLocaleString('en-NZ')}`;

export default function EarlybirdMultiDayPassConfigurator({ image, onAdd }) {
  const { lang } = useLang();
  const [days, setDays] = useState(3);
  const [age, setAge] = useState('Adult');
  const [quantity, setQuantity] = useState(1);
  const [foundation, setFoundation] = useState(false);
  const [donations, setDonations] = useState([]);
  const [showMore, setShowMore] = useState(false);

  const passPrice = PRICES[age][days];
  const donationTotal = foundation ? donations.length * 20 : 0;
  const total = (passPrice + donationTotal) * quantity;
  const toggleDonation = (id) => setDonations((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const addToCart = () => onAdd({
    id: 'earlybird-multi-day-pass',
    name: `Earlybird Multi-Day Pass - ${age} - ${days} Days - Pay Now`,
    price: passPrice + donationTotal,
    quantity,
    image,
    ageBand: AGE_OPTIONS.find(([key]) => key === age)?.[1],
    variant: `${age}-${days}-Pay Now-${foundation}-${donations.join(',')}`,
    detail: [
      `${days} days · ${age}`,
      'Pay Now',
      ...donations.map((id) => `${DONATIONS.find((item) => item.id === id)?.name} +$20`),
    ].join(' · '),
  });

  const optionClass = (selected) => `rounded-xl border px-4 py-3 text-left ${selected ? 'border-2 border-[#5b8199] font-bold' : 'border-[#a0a0a0]'}`;
  const donationCard = (option) => {
    const selected = donations.includes(option.id);
    return <button key={option.id} type="button" aria-pressed={selected} onClick={() => toggleDonation(option.id)} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left ${selected ? 'border-[#344a64]' : 'border-[#a0a0a0]'}`}>
      <span className="min-w-0 flex-1"><b className="block text-[14px]">{option.name}</b><span className="mt-2 block text-[12px] leading-4 text-[#777]">{option.description}</span><span className="mt-2 block text-[14px]">+ $20</span></span>
      <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${selected ? 'border-[#5b8199] bg-[#5b8199] text-white' : 'border-[#a0a7b0]'}`}>{selected && <Check className="h-4 w-4"/>}</span>
    </button>;
  };

  return <LocalizeCustomerTree lang={lang}><main className="grid grid-cols-1 items-start gap-6 px-4 pb-8 pt-5 sm:px-8">
    <div className="space-y-6">
      <section className="border-b border-[#cbd7e4] pb-5">
        <h1 className="font-serif text-[24px] font-bold text-[#344a64]">Earlybird Multi-Day Passes</h1>
        <p className="mt-4 text-[15px] leading-6 text-[#777]">Ski or ride at both mountains outside of our blackout period (5 - 16 July, 2027) and lock in a sweet deal. No need to book your days in advance, turn up when you want!</p>
        {showMore && <p className="mt-2 text-[14px] leading-6 text-[#777]">Valid at Cardrona and Treble Cone during Winter 2027, excluding the blackout period. Choose 3 to 6 days and use them whenever you like.</p>}
        <button type="button" onClick={() => setShowMore((value) => !value)} className="mt-2 text-[14px] underline">{showMore ? 'See less' : 'See more'}</button>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">Payment Plan</h2>
        <p className="mt-1 text-[15px] text-[#777]">Choose your Payment Option</p>
        <div className="mt-2 flex min-h-[66px] w-full items-center justify-between rounded-xl border-2 border-[#5b8199] px-4 py-3"><b>Pay Now</b><span aria-hidden="true" className="h-5 w-5 rounded-full border-[5px] border-[#5b8199]"/></div>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">Number of Days</h2>
        <div className="mt-2 flex flex-wrap gap-2">{[3, 4, 5, 6].map((number) => <button key={number} type="button" aria-pressed={days === number} onClick={() => setDays(number)} className={`${optionClass(days === number)} min-h-[54px]`}>{number} Days</button>)}</div>
      </section>

      <section>
        <label htmlFor="multi-day-pass-age" className="text-[16px] font-bold">Age</label>
        <select id="multi-day-pass-age" value={age} onChange={(event) => setAge(event.target.value)} className="mt-2 h-[64px] w-full rounded-xl border border-[#a0a0a0] bg-white px-4 text-[15px] text-[#555]">{AGE_OPTIONS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      </section>

      <section>
        <h2 className="text-[16px] font-bold">Would you like to support the Cardrona Foundation?</h2>
        <p className="mt-1 text-[15px] leading-6 text-[#777]">Help us spread goodness, guardianship and conservation throughout our communities.</p>
        <button type="button" aria-pressed={foundation} onClick={() => { setFoundation((value) => !value); if (foundation) setDonations([]); }} className={`${optionClass(foundation)} mt-2 flex min-h-[62px] w-full items-center justify-between`}><b>Yes, I'd like to make a donation</b><span aria-hidden="true" className={`flex h-5 w-5 items-center justify-center rounded-sm border ${foundation ? 'border-[#5b8199] bg-[#5b8199] text-white' : 'border-[#a0a7b0]'}`}>{foundation && <Check className="h-4 w-4"/>}</span></button>
      </section>

      {foundation && DONATIONS.map((option) => <section key={option.id}><h2 className="mb-2 text-[16px] font-bold">{option.name}</h2>{donationCard(option)}</section>)}
    </div>

    <aside className="rounded-[20px] border border-[#ddd] bg-white p-5 shadow-[0_8px_18px_rgba(0,0,0,0.10)]">
      <h2 className="font-serif text-[23px] font-bold">Item Summary</h2>
      <div className="mt-4 border-b border-[#cbd7e4] pb-4 text-[15px]"><b className="block">({quantity}) Earlybird Multi-Day Pass - {age} - {days} Days - Pay Now</b><span className="mt-2 block">{money(passPrice)}</span>{donations.map((id) => <div key={id} className="mt-4"><b className="block">({quantity}) {DONATIONS.find((item) => item.id === id)?.name}</b><span className="mt-2 block">{money(20 * quantity)}</span></div>)}</div>
      <div className="mt-4 flex justify-between text-[23px]"><span>Total</span><b>{money(total)}</b></div>
      <div className="mt-4 flex items-center justify-between text-[14px] text-[#526982]"><span>Quantity</span><div className="flex h-11 items-center overflow-hidden rounded-xl border border-[#dce4ed]"><button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="h-full px-3 disabled:opacity-40"><Minus className="h-4 w-4"/></button><span className="min-w-8 text-center">{quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)} className="h-full px-3"><Plus className="h-4 w-4"/></button></div></div>
      <button type="button" onClick={addToCart} className="mt-4 h-11 w-full rounded-lg bg-[#5b8199] text-[15px] tracking-[0.08em] text-white">Add To Cart</button>
    </aside>
  </main></LocalizeCustomerTree>;
}
