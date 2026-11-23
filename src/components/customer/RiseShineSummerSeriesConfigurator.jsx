import { useState } from 'react';
import { Check, Ticket } from 'lucide-react';
import ProductSummaryCard from './ProductSummaryCard';

export const RISE_SHINE_IMAGE = 'https://cardrona-treblecone.com/_next/image?q=75&url=https%3A%2F%2Fimages.ctfassets.net%2F2atbvuhykqrn%2F1E5Z9ayVth7RtH4djslw5N%2F367808bb89f90e243a4c6dc6cd68faa0%2Fimage.png&w=3840';

const entries = [
  { id: 'series', label: 'Full Series Entry', summary: 'Series Entry', price: 80, date: '2027-01-09', dateLabel: 'Saturday, 9 January 2027' },
  { id: 'cardrona', label: 'Cardrona 9th Jan', summary: 'Cardrona Entry 9th Jan', price: 50, date: '2027-01-09', dateLabel: 'Saturday, 9 January 2027' },
  { id: 'treble-cone', label: 'Treble Cone 16th Jan', summary: 'Treble Cone Entry 16th Jan', price: 50, date: '2027-01-16', dateLabel: 'Saturday, 16 January 2027' },
];

const money = (amount) => `NZ$${amount.toFixed(2)}`;

export default function RiseShineSummerSeriesConfigurator({ onAdd }) {
  const [entryId, setEntryId] = useState('');
  const [gender, setGender] = useState('');
  const [entryIncluded, setEntryIncluded] = useState(false);
  const selectedEntry = entries.find((entry) => entry.id === entryId);
  const ready = Boolean(selectedEntry && gender && entryIncluded);

  const addEntry = () => {
    if (!ready) return;
    const genderLabel = gender === 'male' ? 'Male' : 'Female';
    onAdd({
      id: 'rise-shine-summer-series',
      name: 'Rise & Shine Summer Series',
      price: selectedEntry.price,
      quantity: 1,
      detail: `${selectedEntry.summary} · ${genderLabel} · Entry`,
      variant: `${selectedEntry.id}-${gender}`,
      visitDate: selectedEntry.date,
    });
  };

  return <main className="space-y-5 px-4 pb-8 pt-5 sm:px-8">
    <header className="space-y-3">
      <img src={RISE_SHINE_IMAGE} alt="Rise & Shine alpine running race artwork" className="h-36 w-full rounded-[22px] bg-[#eaf1f8] object-cover object-center" />
      <div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#5b8199]">Cardrona · Treble Cone · January 2027</p><h1 className="mt-1 font-serif text-[25px] font-bold text-[#20242b]">Rise &amp; Shine Summer Series</h1><p className="mt-2 text-[12px] leading-5 text-[#68717f]">The Rise and Shine Mountain Running Series brings recreational and competitive runners together for a summer challenge in the mountains.</p></div>
    </header>

    <section className="space-y-2.5" aria-labelledby="entry-choice-title">
      <h2 id="entry-choice-title" className="text-[14px] font-semibold text-[#20242b]">Choose your entry</h2>
      <div className="flex flex-wrap gap-2">{entries.map((entry) => <button key={entry.id} type="button" aria-pressed={entryId === entry.id} onClick={() => setEntryId(entry.id)} className={`min-h-11 rounded-[14px] border px-3.5 py-2.5 text-left text-[12px] transition-colors ${entryId === entry.id ? 'border-2 border-[#5b8199] bg-white font-semibold text-[#20242b]' : 'border-[#c9ccd1] bg-white text-[#34383d]'}`}>{entry.label}</button>)}</div>
    </section>

    <label className="block text-[13px] font-semibold text-[#20242b]">Male or Female
      <span className="relative mt-2 block"><select value={gender} onChange={(event) => setGender(event.target.value)} className="h-14 w-full appearance-none rounded-[14px] border border-[#c9ccd1] bg-white px-4 pr-10 text-[13px] font-normal text-[#34383d] outline-none focus:border-[#5b8199]"><option value="">Select event category</option><option value="male">Open Male</option><option value="female">Open Female</option></select><span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7b838a]">⌄</span></span>
    </label>

    <section aria-labelledby="event-entry-title" className="space-y-2">
      <div><h2 id="event-entry-title" className="text-[14px] font-semibold text-[#20242b]">Event Entry</h2><p className="mt-1 text-[11px] text-[#c0392b]">Select one (required)</p></div>
      <button type="button" aria-pressed={entryIncluded} onClick={() => setEntryIncluded((checked) => !checked)} className={`flex min-h-[68px] w-full items-center gap-3 rounded-[14px] border bg-white px-4 text-left ${entryIncluded ? 'border-[#5b8199]' : 'border-[#c9ccd1]'}`}><Ticket className="h-7 w-7 shrink-0 text-[#20242b]" strokeWidth={1.6}/><span className="flex-1 text-[14px] font-semibold">Entry</span><span className={`flex h-6 w-6 items-center justify-center rounded border ${entryIncluded ? 'border-[#5b8199] bg-[#5b8199] text-white' : 'border-[#9ca0a5] bg-white'}`}>{entryIncluded && <Check className="h-4 w-4"/>}</span></button>
    </section>

    <ProductSummaryCard title="Your pass" dateLabel={selectedEntry?.dateLabel || 'Choose an event'} selection={selectedEntry ? `${selectedEntry.summary} · ${gender ? gender === 'male' ? 'Male' : 'Female' : 'Choose category'}` : 'Choose an event entry'} total={selectedEntry ? money(selectedEntry.price).replace('.00', '') : '—'} actionLabel="Add to cart" disabled={!ready} onAdd={addEntry} />
  </main>;
}
