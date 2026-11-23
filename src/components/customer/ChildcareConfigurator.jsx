import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Minus, Plus, Snowflake } from 'lucide-react';
import ProductSummaryCard from './ProductSummaryCard';

const AGE_OPTIONS = ['3-4yrs', '2yrs', '1yr', '3mths - 11mths'];
const GROUP_LEVELS = ['Never Skied', 'Learning to Stop', 'Learning to Turn', 'Riding the Chair', 'All Mountain'];
const PRIVATE_TIMES = {
  '1hr private': ['SKI 1hr 9AM Private', 'SKI 1hr 1.30PM Private', 'SKI 1hr 2.30PM Private', 'SNOWBOARD 1hr 9AM Private'],
  '2hr private': ['SKI 2hr 1.30PM Private'],
};
const LESSONS = [
  { id: '1hr private', label: 'Add on a 1hr private lesson', total: 235, icon: '🎿' },
  { id: '2hr private', label: 'Add on a 2hr private lesson', total: 305, icon: '🎿' },
  { id: 'group', label: 'Add on a 3 hour group lesson', total: 249, icon: '⛷️', detail: '10:00am - 1:00pm' },
];
const BASE_PRICE = 165;
const monthLabel = (year, month) => new Intl.DateTimeFormat('en-NZ', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month, 1)));
const formatDate = (value) => value ? new Intl.DateTimeFormat('en-NZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) : 'No date selected';
const money = (value) => `$${Number(value).toLocaleString('en-NZ', { maximumFractionDigits: 0 })}`;
const dateValue = (year, month, day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export default function ChildcareConfigurator({ onAdd }) {
  const [age, setAge] = useState('3-4yrs');
  const [lesson, setLesson] = useState('');
  const [lessonTime, setLessonTime] = useState('');
  const [ability, setAbility] = useState(GROUP_LEVELS[0]);
  const [startDate, setStartDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [calendarMonth, setCalendarMonth] = useState({ year: 2027, month: 5 });

  const privateAllowed = age === '2yrs' || age === '3-4yrs';
  const groupAllowed = age === '3-4yrs';
  const availableLessons = LESSONS.filter((option) => (option.id === 'group' ? groupAllowed : privateAllowed));
  const selectedLesson = LESSONS.find((option) => option.id === lesson);
  const total = selectedLesson?.total || BASE_PRICE;
  const needsTime = Boolean(lesson && lesson !== 'group');
  const canAdd = Boolean(startDate && (!needsTime || lessonTime));

  const monthDays = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return [
      ...Array.from({ length: firstWeekday }, (_, index) => ({ key: `blank-${index}` })),
      ...Array.from({ length: days }, (_, index) => ({ key: dateValue(year, month, index + 1), day: index + 1 })),
    ];
  }, [calendarMonth]);

  const chooseLesson = (id) => {
    if (lesson === id) {
      setLesson('');
      setLessonTime('');
      return;
    }
    setLesson(id);
    setLessonTime(id === '1hr private' ? PRIVATE_TIMES[id][0] : id === '2hr private' ? PRIVATE_TIMES[id][0] : '');
  };

  return <main className="space-y-5 px-4 pb-10 pt-4">
    <header>
      <h1 className="font-serif text-[22px] font-bold text-[#20242b]">Cardrona Childcare Centre</h1>
      <p className="mt-1 text-[14px] leading-6 text-[#60738d]">Choose your child’s age, care options, and start date.</p>
      <label className="mt-4 block text-[14px] font-semibold text-[#344a64]">Child&apos;s age
        <select value={age} onChange={(event) => { setAge(event.target.value); setLesson(''); setLessonTime(''); }} className="mt-1 h-12 w-full rounded-xl border border-[#cbd7e4] bg-white px-3 text-[14px] text-[#344a64] focus:border-[#5b8199]">
          {AGE_OPTIONS.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
    </header>

    {availableLessons.length > 0 && <section className="space-y-3">
      <div><h2 className="text-[17px] font-bold text-[#202b3a]">Add a lesson</h2><p className="mt-1 text-[13px] text-[#60738d]">Optional · choose one lesson</p></div>
      <div className="grid grid-cols-2 gap-2">
        {availableLessons.map((option) => <button type="button" key={option.id} aria-pressed={lesson === option.id} onClick={() => chooseLesson(option.id)} className={`flex min-h-[76px] w-full items-start gap-2 rounded-xl border p-3 text-left ${lesson === option.id ? 'border-[#5b8199] bg-[#eaf1f6] ring-1 ring-[#5b8199]' : 'border-[#cbd7e4] bg-white'}`}>
          <span className="mt-0.5 text-[17px]" aria-hidden="true">{option.icon}</span><span className="min-w-0 flex-1"><b className="block text-[14px] leading-5 text-[#263345]">{option.label.replace('Add on a ', '').replace(' lesson', '')}</b>{option.detail && <small className="mt-1 block text-[12px] text-[#60738d]">{option.detail}</small>}</span><span className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${lesson === option.id ? 'border-[#5b8199] bg-[#5b8199] text-white' : 'border-[#9ca3af]'}`}>{lesson === option.id ? '✓' : ''}</span>
        </button>)}
      </div>
    </section>}

    {needsTime && <section>
      <h2 className="text-[17px] font-bold text-[#202b3a]">Lesson time</h2><p className="mt-1 text-[13px] text-[#60738d]">Choose a private lesson start time.</p>
      <div className="mt-2 grid grid-cols-2 gap-2">{PRIVATE_TIMES[lesson].map((time) => <button key={time} type="button" aria-pressed={lessonTime === time} onClick={() => setLessonTime(time)} className={`min-h-[68px] rounded-xl border px-3 py-2 text-left text-[13px] ${lessonTime === time ? 'border-[#5b8199] bg-[#eaf1f6] ring-1 ring-[#5b8199] font-semibold text-[#263345]' : 'border-[#cbd7e4] text-[#555]'}`}><span className="mb-1 block text-center text-[15px]" aria-hidden="true">⛷️</span>{time}</button>)}</div>
    </section>}

    {lesson === 'group' && <label className="block text-[13px] font-bold text-[#263345]">Select your child&apos;s ability level
      <select value={ability} onChange={(event) => setAbility(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#cbd7e4] bg-white px-3 text-[13px] font-normal text-[#344a64]">{GROUP_LEVELS.map((level) => <option key={level}>{level}</option>)}</select>
    </label>}

    <section>
      <h2 className="text-[17px] font-bold text-[#202b3a]">Choose your start date</h2>{!startDate && <p className="mt-1 text-[13px] text-[#b42318]">Select a date to continue.</p>}
      <div className="mt-3 rounded-xl border border-[#a0a0a0] p-2.5">
        <div className="mb-2 flex items-center justify-between"><button type="button" aria-label="Previous month" onClick={() => setCalendarMonth(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 })} className="grid h-8 w-8 place-items-center text-[#777]"><ChevronLeft className="h-4 w-4"/></button><b className="flex items-center gap-1 text-[14px] text-[#333]">{monthLabel(calendarMonth.year, calendarMonth.month)}<span className="text-[10px]">▼</span></b><button type="button" aria-label="Next month" onClick={() => setCalendarMonth(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 })} className="grid h-8 w-8 place-items-center text-[#777]"><ChevronRight className="h-4 w-4"/></button></div>
        <div className="grid grid-cols-7 text-center">{['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((day) => <span key={day} className="py-2 text-[10px] font-bold text-[#333]">{day}</span>)}
          {monthDays.map(({ key, day }) => {
            if (!day) return <span key={key} className="h-11"/>;
            const date = dateValue(calendarMonth.year, calendarMonth.month, day);
            const beforeSeason = date < '2027-06-12';
            const soldOut = date === '2027-06-18' || date === '2027-06-27';
            const spots = 1 + ((day + (lesson ? 1 : 2)) % 4);
            const lowAvailability = !beforeSeason && !soldOut && (spots <= 3 || (lesson && spots <= 4));
            const disabled = beforeSeason || soldOut;
            return <button type="button" key={key} disabled={disabled} aria-pressed={startDate === date} aria-label={`${day} ${monthLabel(calendarMonth.year, calendarMonth.month)}${soldOut ? ', sold out' : ''}${lowAvailability ? `, ${spots} spots left` : ''}`} onClick={() => setStartDate(date)} className={`relative h-11 border text-[13px] ${disabled ? 'border-[#ddd] bg-[#e2e2e2] text-[#aaa]' : startDate === date ? 'z-10 border-2 border-[#5b8199] bg-[#eaf1f6] font-bold text-[#20242b]' : lowAvailability ? 'border-[#e7ca43] bg-[#f6d640] text-[#20242b]' : 'border-[#cbd7e4] bg-white text-[#333] hover:bg-[#f2f6f9]'}`}>{day}</button>;
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#344a64]"><span className="flex items-center gap-1"><span className="h-3 w-3 bg-[#f6d640]"/>LOW AVAILABILITY</span><span className="flex items-center gap-1"><span className="h-3 w-3 bg-[#dedede]"/>SOLD OUT</span></div>
      </div>
      {startDate && <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#a13232]"><CalendarDays className="h-3.5 w-3.5"/>{formatDate(startDate)} · {1 + ((Number(startDate.slice(-2)) + (lesson ? 1 : 2)) % 4)} spots left on this date</p>}
      {lesson === 'group' && <p className="mt-2 flex items-center gap-1 text-[10px] text-[#718096]"><Snowflake className="h-3.5 w-3.5"/>Group lesson availability and ability levels are demo selections.</p>}
    </section>

    <section className="flex items-center justify-between rounded-xl border border-[#d6e0ea] bg-white px-4 py-3">
      <span className="text-[13px] font-semibold text-[#344a64]">Number of children</span>
      <div className="flex h-11 items-center overflow-hidden rounded-lg border border-[#cbd7e4]"><button type="button" aria-label="Remove one child" disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="h-full px-3 text-[#526982] disabled:opacity-35"><Minus className="h-4 w-4"/></button><b className="min-w-8 text-center text-[14px] font-normal">{quantity}</b><button type="button" aria-label="Add one child" onClick={() => setQuantity((current) => Math.min(10, current + 1))} className="h-full px-3 text-[#526982]"><Plus className="h-4 w-4"/></button></div>
    </section>
    <ProductSummaryCard title="Your pass" dateLabel={formatDate(startDate)} selection={`${quantity} ${quantity === 1 ? 'child' : 'children'} · ${age}${lesson ? ` · ${lesson === 'group' ? `Group lesson · ${ability}` : `${lesson} · ${lessonTime}`}` : ''}`} total={money(total * quantity).replace('.00', '')} actionLabel="Add to cart" disabled={!canAdd} onAdd={() => onAdd({ id: 'cardrona-childcare', name: 'Cardrona Childcare', price: total, quantity, detail: `${age}${lesson ? ` · ${lesson === 'group' ? `3 hour group lesson · ${ability}` : `${lesson} · ${lessonTime}`}` : ''}`, variant: `${startDate}:${age}:${lesson}:${lessonTime}:${ability}`, visitDate: startDate, ageBand: age })} />
  </main>;
}
