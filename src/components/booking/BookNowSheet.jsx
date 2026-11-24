import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarRange } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { daysBetween, formatNZD, toDateKey, todayKey, unitPriceFor } from '@/lib/booking';
import { localizedField } from '@/lib/i18n/localize';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const readQuery = () => new URLSearchParams(window.location.search);
const defaultFrom = () => readQuery().get('date') || toDateKey(new Date(Date.now() + 86400000));
const defaultGuests = () => Math.min(Math.max(Number(readQuery().get('guests')) || 1, 1), 10);

export default function BookNowSheet({ product, open, onOpenChange, passLine = null }) {
  const { lang, bi } = useLanguage();
  const navigate = useNavigate();
  const [visitDate, setVisitDate] = useState(defaultFrom);
  const [endDate, setEndDate] = useState(() => readQuery().get('to') || defaultFrom());
  const [guests, setGuests] = useState(defaultGuests);
  const [optionKey, setOptionKey] = useState(() => product?.booking_options?.[0]?.key || '');
  const bookingOptions = product?.booking_options || [];

  // 每次打开都按当前筛选条件重置
  useEffect(() => {
    if (!open) return;
    const from = defaultFrom();
    setVisitDate(from);
    setEndDate(readQuery().get('to') || from);
    setGuests(defaultGuests());
    setOptionKey(product?.booking_options?.[0]?.key || '');
  }, [open, product]);

  const days = daysBetween(visitDate, endDate);
  const maxGuests = Math.min(Number(product?.capacity_per_day || 20), 10);
  // 季票继承了配置页选中的价格，其余产品按日期动态定价
  const selectedOption = bookingOptions.find((option) => option.key === optionKey) || bookingOptions[0];
  const unitPrice = passLine
    ? passLine.unitPrice
    : selectedOption
      ? Number(selectedOption.price)
      : unitPriceFor(product, visitDate);
  const subtotal = unitPrice * guests * days;

  const start = () => {
    onOpenChange(false);
    const query = new URLSearchParams({ date: visitDate, to: endDate, guests: String(guests) });
    if (passLine) {
      query.set('pass', passLine.passKey);
      query.set('age', passLine.ageKey);
      query.set('plan', passLine.plan);
    }
    if (selectedOption) query.set('option', selectedOption.key);
    navigate(`/booking/${product.id}?${query.toString()}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-[16px]">
            {bi('选择行程日期', 'Choose your dates')}
          </DialogTitle>
        </DialogHeader>

        <p className="-mt-1 text-[11.5px] text-muted-foreground">
          {passLine?.label || localizedField(product, 'name', lang)}
          {passLine?.subtitle ? ` · ${passLine.subtitle}` : ''}
        </p>

        {bookingOptions.length > 0 && (
          <div>
            <Label className="text-[12px]">{bi('选择票种', 'Choose a pass')}</Label>
            <Select value={optionKey} onValueChange={setOptionKey}>
              <SelectTrigger className="mt-2 h-10 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bookingOptions.map((option) => (
                  <SelectItem key={option.key} value={option.key} className="text-[12px]">
                    {(lang === 'en' ? option.label_en : option.label_zh)} · {formatNZD(option.price)}
                    {(option.detail_en || option.detail_zh) && ` · ${lang === 'en' ? option.detail_en : option.detail_zh}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="mt-1">
          <Label className="flex items-center gap-1 text-[12px]">
            <CalendarRange className="h-3.5 w-3.5 text-primary" /> {bi('开始 / 结束日期', 'From / To')}
          </Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={visitDate}
              min={todayKey()}
              onChange={(event) => {
                const next = event.target.value || toDateKey(new Date());
                setVisitDate(next);
                if (endDate < next) setEndDate(next);
              }}
              className="h-10 px-2 text-[12px]"
            />
            <Input
              type="date"
              value={endDate}
              min={visitDate}
              onChange={(event) => setEndDate(event.target.value || visitDate)}
              className="h-10 px-2 text-[12px]"
            />
          </div>
        </div>

        <div>
          <Label className="text-[12px]">{bi('人数', 'Guests')}</Label>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGuests((prev) => Math.max(1, prev - 1))}
              className="h-9 w-9 rounded-xl border border-border text-lg text-muted-foreground transition hover:bg-secondary"
            >
              −
            </button>
            <span className="w-8 text-center font-heading text-[16px]">{guests}</span>
            <button
              type="button"
              onClick={() => setGuests((prev) => Math.min(maxGuests, prev + 1))}
              className="h-9 w-9 rounded-xl border border-border text-lg text-muted-foreground transition hover:bg-secondary"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5 text-[12px]">
          <span className="text-muted-foreground">
            {bi(`${days} 天 × ${guests} 人 · 单价 ${formatNZD(unitPrice)}`, `${days} day${days === 1 ? '' : 's'} × ${guests} guest${guests === 1 ? '' : 's'} · ${formatNZD(unitPrice)} each`)}
          </span>
          <span className="font-heading text-[16px] text-primary">{formatNZD(subtotal)}</span>
        </div>

        <Button className="h-11 w-full rounded-full" onClick={start}>
          {bi('继续预订', 'Continue')} <ArrowRight className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
