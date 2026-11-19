import { useMemo, useState } from 'react';
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

const LAYOUTS = [
  ['individual', 'Guest cards'],
  ['grouped', 'Grouped tickets'],
  ['age-first', 'Age first'],
];

const DONATIONS = [
  { id: 'karearea', name: 'The Kārearea Project', description: 'Help fund our scientific conservation of the magnificent and threatened NZ Falcon.' },
  { id: 'seed', name: 'Plant A Seed', description: 'Help us plant natives to regenerate our environment and offset your carbon emissions*.' },
  { id: 'tamariki', name: 'Ride Tamariki', description: 'Help us provide life changing experiences in the mountains for disadvantaged children/families.' },
  { id: 'all-in', name: 'All In', description: 'Creating an inclusive environment for all by supporting and representing all communities of the mountain.' },
];

const money = (amount) => `$${amount.toLocaleString('en-NZ')}`;
const newGuest = (id, age = 'Adult', days = 3) => ({ id, age, days });

export default function EarlybirdMultiDayPassConfigurator({ image, onAdd }) {
  const { lang } = useLang();
  const [layout, setLayout] = useState('individual');
  const [ageStage, setAgeStage] = useState('counts');
  const [guests, setGuests] = useState([newGuest(1, 'Adult', 3), newGuest(2, 'Child', 4)]);
  const [nextGuestId, setNextGuestId] = useState(3);
  const [foundation, setFoundation] = useState(false);
  const [donations, setDonations] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [individualEditing, setIndividualEditing] = useState(false);

  const groups = useMemo(() => {
    const grouped = new Map();
    guests.forEach((guest) => {
      const key = `${guest.age}-${guest.days}`;
      const current = grouped.get(key) || { age: guest.age, days: guest.days, guests: [] };
      current.guests.push(guest);
      grouped.set(key, current);
    });
    return [...grouped.values()];
  }, [guests]);
  const guestCount = guests.length;
  const donationPerGuest = foundation ? donations.length * 20 : 0;
  const total = guests.reduce((sum, guest) => sum + PRICES[guest.age][guest.days] + donationPerGuest, 0);
  const toggleDonation = (id) => setDonations((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const addGuest = (age = 'Adult', days = 3) => {
    setGuests((current) => [...current, newGuest(nextGuestId, age, days)]);
    setNextGuestId((current) => current + 1);
  };
  const removeGuest = (id) => setGuests((current) => current.filter((guest) => guest.id !== id));
  const updateGuest = (id, updates) => setGuests((current) => current.map((guest) => guest.id === id ? { ...guest, ...updates } : guest));
  const guestsForAge = (age) => guests.filter((guest) => guest.age === age);
  const setAgeCount = (age, count) => {
    const currentCount = guestsForAge(age).length;
    if (count > currentCount) addGuest(age, guestsForAge(age)[0]?.days ?? 3);
    else if (count < currentCount) removeGuest(guestsForAge(age).at(-1)?.id);
  };
  const setGroupDays = (age, days) => setGuests((current) => current.map((guest) => guest.age === age ? { ...guest, days } : guest));
  const groupedByAge = AGE_OPTIONS.map(([age]) => ({ age, guests: guestsForAge(age) })).filter((group) => group.guests.length);

  const addToCart = () => groups.forEach((group) => {
    const donationNames = donations.map((id) => DONATIONS.find((item) => item.id === id)?.name);
    onAdd({
      id: 'earlybird-multi-day-pass',
      name: `Earlybird Multi-Day Pass - ${group.age} - ${group.days} Days - Pay Now`,
      price: PRICES[group.age][group.days] + donationPerGuest,
      quantity: group.guests.length,
      image,
      ageBand: AGE_OPTIONS.find(([key]) => key === group.age)?.[1],
      variant: `${group.age}-${group.days}-Pay Now-${foundation}-${donations.join(',')}`,
      detail: [`${group.days} days · ${group.age}`, 'Pay Now', ...donationNames.map((name) => `${name} +$20`)].join(' · '),
    });
  });

  const optionClass = (selected) => `rounded-xl border px-4 py-3 text-left ${selected ? 'border-2 border-[#5b8199] font-bold' : 'border-[#a0a0a0]'}`;
  const dayOptions = (selectedDays, onSelect, compact = false) => <div className={`mt-2 flex flex-wrap gap-2 ${compact ? 'gap-1.5' : ''}`}>{[3, 4, 5, 6].map((days) => <button key={days} type="button" aria-pressed={selectedDays === days} onClick={() => onSelect(days)} className={`${optionClass(selectedDays === days)} min-h-10 px-3 py-2 text-[13px]`}>{days} Days</button>)}</div>;
  const donationCard = (option) => {
    const selected = donations.includes(option.id);
    return <button key={option.id} type="button" aria-pressed={selected} onClick={() => toggleDonation(option.id)} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left ${selected ? 'border-[#344a64]' : 'border-[#a0a0a0]'}`}>
      <span className="min-w-0 flex-1"><b className="block text-[14px]">{option.name}</b><span className="mt-2 block text-[12px] leading-4 text-[#777]">{option.description}</span><span className="mt-2 block text-[14px]">+ $20 per guest</span></span>
      <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${selected ? 'border-[#5b8199] bg-[#5b8199] text-white' : 'border-[#a0a7b0]'}`}>{selected && <Check className="h-4 w-4"/>}</span>
    </button>;
  };

  return <LocalizeCustomerTree lang={lang}><main className="grid grid-cols-1 items-start gap-6 px-4 pb-8 pt-5 sm:px-8">
    <section className="border-b border-[#cbd7e4] pb-5">
      <h1 className="font-serif text-[24px] font-bold text-[#344a64]">Earlybird Multi-Day Passes</h1>
      <p className="mt-4 text-[15px] leading-6 text-[#777]">Ski or ride at both mountains outside of our blackout period (5 - 16 July, 2027) and lock in a sweet deal. No need to book your days in advance, turn up when you want!</p>
      {showMore && <p className="mt-2 text-[14px] leading-6 text-[#777]">Valid at Cardrona and Treble Cone during Winter 2027, excluding the blackout period. Choose 3 to 6 days and use them whenever you like.</p>}
      <button type="button" onClick={() => setShowMore((value) => !value)} className="mt-2 text-[14px] underline">{showMore ? 'See less' : 'See more'}</button>
    </section>

    <nav aria-label="Choose a pass entry layout" className="rounded-xl bg-[#e8edf3] p-1">
      <div className="grid grid-cols-3 gap-1">{LAYOUTS.map(([id, label]) => <button key={id} type="button" aria-pressed={layout === id} onClick={() => { setLayout(id); setAgeStage('counts'); }} className={`rounded-lg px-2 py-2 text-[11px] font-semibold ${layout === id ? 'bg-white text-[#344a64] shadow-sm' : 'text-[#68717f]'}`}>{label}</button>)}</div>
    </nav>

    {layout === 'individual' && <section className="space-y-4">
      <div><h2 className="text-[17px] font-bold">Add each guest</h2><p className="mt-1 text-[13px] text-[#777]">Set age and pass days separately for each person.</p></div>
      {guests.map((guest, index) => <article key={guest.id} className="rounded-xl border border-[#dce4ed] bg-white p-4">
        <div className="flex items-center justify-between"><h3 className="font-serif text-[18px] font-bold text-[#344a64]">Guest {index + 1}</h3><button type="button" disabled={guestCount <= 1} onClick={() => removeGuest(guest.id)} className="text-[12px] text-[#5b8199] underline disabled:opacity-40">Remove</button></div>
        <label className="mt-3 block text-[12px] font-semibold">Age<select value={guest.age} onChange={(event) => updateGuest(guest.id, { age: event.target.value })} className="mt-1 h-11 w-full rounded-lg border border-[#dce4ed] bg-white px-3 text-[14px] font-normal">{AGE_OPTIONS.map(([age, label]) => <option key={age} value={age}>{label}</option>)}</select></label>
        <div className="mt-3 text-[12px] font-semibold">Pass days{dayOptions(guest.days, (days) => updateGuest(guest.id, { days }))}</div>
        <p className="mt-3 text-right font-semibold text-[#486577]">{money(PRICES[guest.age][guest.days])}</p>
      </article>)}
      <button type="button" onClick={() => addGuest()} className="w-full rounded-xl border border-[#5b8199] px-4 py-3 text-[14px] font-semibold text-[#5b8199]">+ Add another guest</button>
    </section>}

    {layout === 'grouped' && <section className="space-y-4">
      <div><h2 className="text-[17px] font-bold">Group matching passes</h2><p className="mt-1 text-[13px] text-[#777]">Set age and days once, then adjust how many passes you need.</p></div>
      {groups.map((group) => <article key={`${group.age}-${group.days}`} className="rounded-xl border border-[#dce4ed] bg-white p-4">
        <div className="flex items-center justify-between gap-2"><label className="min-w-0 flex-1 text-[12px] font-semibold">Age<select value={group.age} onChange={(event) => group.guests.forEach((guest) => updateGuest(guest.id, { age: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-[#dce4ed] bg-white px-2 text-[13px]">{AGE_OPTIONS.map(([age, label]) => <option key={age} value={age}>{label}</option>)}</select></label><div className="mt-5 flex h-10 items-center overflow-hidden rounded-lg border border-[#dce4ed]"><button type="button" onClick={() => removeGuest(group.guests[group.guests.length - 1].id)} disabled={guestCount <= 1} aria-label={`Remove one ${group.age} pass`} className="h-full px-2.5 disabled:opacity-40"><Minus className="h-4 w-4"/></button><span className="min-w-7 text-center text-[13px]">{group.guests.length}</span><button type="button" onClick={() => addGuest(group.age, group.days)} aria-label={`Add one ${group.age} pass`} className="h-full px-2.5"><Plus className="h-4 w-4"/></button></div></div>
        <div className="mt-3 text-[12px] font-semibold">Pass days{dayOptions(group.days, (days) => group.guests.forEach((guest) => updateGuest(guest.id, { days })), true)}</div>
        <p className="mt-3 text-right text-[13px] text-[#526982]">{group.guests.length} × {money(PRICES[group.age][group.days])} <b className="ml-2 text-[#344a64]">{money(group.guests.length * PRICES[group.age][group.days])}</b></p>
      </article>)}
      <button type="button" onClick={() => addGuest('Adult', 3)} className="w-full rounded-xl border border-[#5b8199] px-4 py-3 text-[14px] font-semibold text-[#5b8199]">+ Add another pass type</button>
    </section>}

    {layout === 'age-first' && <section className="space-y-4">
      {ageStage === 'counts' ? <>
        <div><h2 className="text-[17px] font-bold">Who are you buying for?</h2><p className="mt-1 text-[13px] text-[#777]">Choose a quantity for each age group. You can set pass days next.</p></div>
        {AGE_OPTIONS.map(([age, label]) => <div key={age} className="flex items-center justify-between gap-3 rounded-xl border border-[#dce4ed] bg-white p-3"><span className="min-w-0"><b className="block text-[14px]">{age}</b><small className="text-[11px] text-[#777]">{label.replace(`${age}: `, '')}</small></span><div className="flex h-10 items-center overflow-hidden rounded-lg border border-[#dce4ed]"><button type="button" aria-label={`Remove ${age}`} disabled={!guestsForAge(age).length} onClick={() => setAgeCount(age, guestsForAge(age).length - 1)} className="h-full px-3 disabled:opacity-40"><Minus className="h-4 w-4"/></button><span className="min-w-8 text-center text-[14px]">{guestsForAge(age).length}</span><button type="button" aria-label={`Add ${age}`} onClick={() => setAgeCount(age, guestsForAge(age).length + 1)} className="h-full px-3"><Plus className="h-4 w-4"/></button></div></div>)}
        <button type="button" disabled={!guestCount} onClick={() => setAgeStage('days')} className="w-full rounded-xl bg-[#5b8199] px-4 py-3 text-[14px] font-semibold text-white disabled:opacity-40">Choose pass days for {guestCount} {guestCount === 1 ? 'guest' : 'guests'}</button>
      </> : <>
        <div className="flex items-start justify-between gap-3"><div><h2 className="text-[17px] font-bold">Choose days by age group</h2><p className="mt-1 text-[13px] text-[#777]">Each group starts with the same days; adjust individual guests if needed.</p></div><button type="button" onClick={() => setAgeStage('counts')} className="shrink-0 text-[12px] text-[#5b8199] underline">Edit counts</button></div>
        {groupedByAge.map((group) => <article key={group.age} className="rounded-xl border border-[#dce4ed] bg-white p-4"><div className="flex items-center justify-between"><h3 className="font-semibold">{group.age} <span className="font-normal text-[#718096]">· {group.guests.length}</span></h3><span className="text-[13px] font-semibold">{money(group.guests.reduce((sum, guest) => sum + PRICES[group.age][guest.days], 0))}</span></div>{dayOptions(group.guests[0].days, (days) => setGroupDays(group.age, days))}{individualEditing && group.guests.map((guest, index) => <div key={guest.id} className="mt-4 border-t border-[#e6edf4] pt-3"><div className="text-[12px] font-semibold">{group.age} {index + 1} · {money(PRICES[group.age][guest.days])}</div>{dayOptions(guest.days, (days) => updateGuest(guest.id, { days }), true)}</div>)}</article>)}
        <button type="button" aria-pressed={individualEditing} onClick={() => setIndividualEditing((value) => !value)} className="w-full rounded-xl border border-[#5b8199] px-4 py-3 text-[13px] font-semibold text-[#5b8199]">{individualEditing ? 'Use days by age group' : 'Edit pass days per person'}</button>
        <button type="button" onClick={() => setAgeStage('counts')} className="text-[13px] text-[#5b8199] underline">Back to age counts</button>
      </>}
    </section>}

    <section>
      <h2 className="text-[16px] font-bold">Would you like to support the Cardrona Foundation?</h2>
      <p className="mt-1 text-[15px] leading-6 text-[#777]">Help us spread goodness, guardianship and conservation throughout our communities.</p>
      <button type="button" aria-pressed={foundation} onClick={() => { setFoundation((value) => !value); if (foundation) setDonations([]); }} className={`${optionClass(foundation)} mt-2 flex min-h-[62px] w-full items-center justify-between`}><b>Yes, I'd like to make a donation</b><span aria-hidden="true" className={`flex h-5 w-5 items-center justify-center rounded-sm border ${foundation ? 'border-[#5b8199] bg-[#5b8199] text-white' : 'border-[#a0a7b0]'}`}>{foundation && <Check className="h-4 w-4"/>}</span></button>
    </section>
    {foundation && DONATIONS.map((option) => <section key={option.id}><h2 className="mb-2 text-[16px] font-bold">{option.name}</h2>{donationCard(option)}</section>)}

    <aside className="rounded-[20px] border border-[#ddd] bg-white p-5 shadow-[0_8px_18px_rgba(0,0,0,0.10)]">
      <h2 className="font-serif text-[23px] font-bold">Item Summary</h2>
      <div className="mt-4 space-y-3 border-b border-[#cbd7e4] pb-4 text-[14px]">{groups.map((group) => <div key={`${group.age}-${group.days}`}><b className="block">({group.guests.length}) Earlybird Multi-Day Pass - {group.age} - {group.days} Days - Pay Now</b><span className="mt-1 block">{money(group.guests.length * PRICES[group.age][group.days])}</span></div>)}{donations.map((id) => <div key={id}><b className="block">({guestCount}) {DONATIONS.find((item) => item.id === id)?.name}</b><span className="mt-1 block">{money(20 * guestCount)}</span></div>)}</div>
      <div className="mt-4 flex justify-between text-[21px]"><span>Total</span><b>{money(total)}</b></div>
      <div className="mt-2 text-[12px] text-[#526982]">{guestCount} {guestCount === 1 ? 'guest' : 'guests'} · {guests.reduce((sum, guest) => sum + guest.days, 0)} pass days</div>
      <button type="button" disabled={!guestCount} onClick={addToCart} className="mt-4 h-11 w-full rounded-lg bg-[#5b8199] text-[15px] tracking-[0.08em] text-white disabled:opacity-40">Add {guestCount} {guestCount === 1 ? 'Pass' : 'Passes'} To Cart</button>
    </aside>
  </main></LocalizeCustomerTree>;
}
