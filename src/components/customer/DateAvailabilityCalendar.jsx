import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

const dateValue = (year, month, day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
const displayDate = (value) => value ? `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}` : 'dd/mm/yyyy';

export default function DateAvailabilityCalendar({ value, onChange, min, max, isUnavailable = () => false, required = false, label = 'Choose your start date', defaultOpen = false, unavailableLabel = 'UNAVAILABLE' }) {
  const [open, setOpen] = useState(defaultOpen);
  const [month, setMonth] = useState(() => {
    const initial = value || min || '2026-12-01';
    const [year, monthNumber] = initial.split('-').map(Number);
    return new Date(year, monthNumber - 1, 1);
  });

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const monthCells = [
    ...Array.from({ length: firstWeekday }, (_, index) => ({ key: `blank-${index}`, day: null })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({ key: dateValue(year, monthIndex, index + 1), day: index + 1 })),
  ];
  const previousMonth = new Date(year, monthIndex - 1, 1);
  const nextMonth = new Date(year, monthIndex + 1, 1);
  const previousMonthStart = dateValue(previousMonth.getFullYear(), previousMonth.getMonth(), 1);
  const nextMonthStart = dateValue(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
  const canGoPrevious = !min || previousMonthStart >= min.slice(0, 7) + '-01';
  const canGoNext = !max || nextMonthStart <= max.slice(0, 7) + '-01';

  return <div className="w-full">
    <div className="text-[13px] font-semibold text-[#344a64]">
      <span>{label} {required && <span className="text-[#5b8199]">(Required)</span>}</span>
      <button type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="mt-2 flex h-12 w-full items-center justify-between rounded-xl border border-[#cbd7e4] bg-white px-3 text-left text-[13px] font-normal text-[#344a64] outline-none focus:border-[#5b8199]">
        <span className={value ? '' : 'text-[#718096]'}>{displayDate(value)}</span>
        <CalendarDays className="h-4 w-4 text-[#718096]" />
      </button>
    </div>
    {open && <section role="dialog" aria-label="Choose a date" className="mt-1 rounded-xl border border-[#a0a0a0] bg-white p-3 text-[#262626] shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" aria-label="Previous month" disabled={!canGoPrevious} onClick={() => setMonth(new Date(year, monthIndex - 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-full text-[#777] hover:bg-[#f2f4f6] disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
        <b className="text-[14px]">{new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(month)}</b>
        <button type="button" aria-label="Next month" disabled={!canGoNext} onClick={() => setMonth(new Date(year, monthIndex + 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-full text-[#777] hover:bg-[#f2f4f6] disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-7 text-center">
        {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((day) => <span key={day} className="py-2 text-[10px] font-semibold">{day}</span>)}
        {monthCells.map(({ key, day }) => {
          if (!day) return <span key={key} className="h-11" />;
          const date = dateValue(year, monthIndex, day);
          const unavailable = (min && date < min) || (max && date > max) || isUnavailable(date);
          return <button key={key} type="button" disabled={unavailable} aria-pressed={value === date} aria-label={`${day} ${new Intl.DateTimeFormat('en', { month: 'long' }).format(month)}${unavailable ? ', unavailable' : ''}`} onClick={() => { onChange(date); setOpen(false); }} className={`h-11 border text-[12px] ${unavailable ? 'border-[#c6c6c6] bg-[#dedede] text-[#757575]' : value === date ? 'border-[#5b8199] bg-[#5b8199] text-white' : 'border-[#cbd7e4] bg-white text-[#333] hover:bg-[#f2f6f9]'}`}>{day}</button>;
        })}
      </div>
      <div className="mt-3 flex items-center gap-1.5 border-t border-dashed border-[#dce4ed] pt-2 text-[11px] text-[#444]"><span className="h-3 w-3 bg-[#dedede]" /> {unavailableLabel}</div>
    </section>}
  </div>;
}
