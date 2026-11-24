import { CalendarRange, Minus, Plus, Mountain, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { todayKey, toDateKey } from '@/lib/booking';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const RESORTS = [
  { value: '全部', zh: '全部雪场', en: 'All resorts' },
  { value: '卡德罗纳', zh: '卡德罗纳', en: 'Cardrona' },
  { value: '三锥山', zh: '三锥山', en: 'Treble Cone' },
];

export default function BookingSearchCard({
  resort,
  onResort,
  from,
  to,
  onFrom,
  onTo,
  guests,
  onGuests,
  days,
}) {
  const { bi } = useLanguage();

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground/85">
        <Mountain className="h-3.5 w-3.5 text-primary" />
        {bi('选择雪场、日期与人数', 'Choose resort, dates and guests')}
      </p>

      <div className="mt-3 flex gap-1.5">
        {RESORTS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onResort(option.value)}
            className={`flex-1 rounded-xl px-2 py-2 text-[11.5px] transition ${
              resort === option.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {bi(option.zh, option.en)}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <Label className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <CalendarRange className="h-3 w-3" /> {bi('开始日期', 'From')}
          </Label>
          <Input
            type="date"
            value={from}
            min={todayKey()}
            onChange={(event) => {
              const next = event.target.value || toDateKey(new Date());
              onFrom(next);
              if (to < next) onTo(next);
            }}
            className="mt-1.5 h-10 px-2 text-[12px]"
          />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground">{bi('结束日期', 'To')}</Label>
          <Input
            type="date"
            value={to}
            min={from}
            onChange={(event) => onTo(event.target.value || from)}
            className="mt-1.5 h-10 px-2 text-[12px]"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
        <span className="flex items-center gap-1.5 text-[12px] text-foreground/80">
          <Users className="h-3.5 w-3.5 text-primary" /> {bi('人数', 'Guests')}
        </span>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onGuests(Math.max(1, guests - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-secondary"
            aria-label={bi('减少人数', 'Fewer guests')}
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-5 text-center font-heading text-[15px]">{guests}</span>
          <button
            type="button"
            onClick={() => onGuests(Math.min(10, guests + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-secondary"
            aria-label={bi('增加人数', 'More guests')}
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      <p className="mt-2.5 text-[11px] text-muted-foreground">
        {bi(`共 ${days} 天 · ${guests} 位游客`, `${days} day${days === 1 ? '' : 's'} · ${guests} guest${guests === 1 ? '' : 's'}`)}
        {' · '}
        {resort === '全部' ? bi('全部雪场可选', 'all resorts') : bi(RESORTS.find((r) => r.value === resort).zh, RESORTS.find((r) => r.value === resort).en)}
      </p>
    </section>
  );
}