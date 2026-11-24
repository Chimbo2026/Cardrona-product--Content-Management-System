import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { SESSIONS } from '@/lib/lessonBooking';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LessonSchedule({ date, session, onDate, onSession }) {
  const { lang, bi } = useLanguage();
  const dateLabel = date
    ? format(date, lang === 'en' ? 'EEE, d MMM yyyy' : 'yyyy年M月d日')
    : bi('选择日期', 'Pick a date');

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <p className="mb-1.5 text-[11px] font-medium text-foreground/70">{bi('上课日期', 'Date')}</p>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-10 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 text-[12.5px] shadow-sm transition hover:bg-secondary/60"
            >
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className={date ? '' : 'text-muted-foreground'}>{dateLabel}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDate}
              disabled={{ before: new Date() }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-medium text-foreground/70">{bi('上课时段', 'Session time')}</p>
        <Select value={session} onValueChange={onSession}>
          <SelectTrigger className="h-10 text-[12.5px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SESSIONS.map((item) => (
              <SelectItem key={item.id} value={item.id} className="text-[12.5px]">
                {lang === 'en' ? item.en : item.zh}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}