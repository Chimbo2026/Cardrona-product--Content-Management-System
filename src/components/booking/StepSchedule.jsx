import { CalendarRange } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toDateKey, todayKey, formatCNY } from '@/lib/booking';
import { localizedField } from '@/lib/i18n/localize';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const WEEKDAYS = {
  zh: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

export default function StepSchedule({
  product,
  visitDate,
  onVisitDate,
  endDate,
  onEndDate,
  days,
  quantity,
  onQuantity,
  isPeak,
  unitPrice,
  subtotal,
}) {
  const { lang, bi } = useLanguage();
  const productName = localizedField(product, 'name', lang);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-3.5">
        <Label className="flex items-center gap-1 text-[12px]">
          <CalendarRange className="h-3.5 w-3.5 text-primary" /> {bi('行程日期', 'Travel dates')}
        </Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10.5px] text-muted-foreground">{bi('开始', 'From')}</span>
            <Input
              type="date"
              value={visitDate}
              min={todayKey()}
              onChange={(event) => {
                const next = event.target.value || toDateKey(new Date());
                onVisitDate(next);
                if (endDate < next) onEndDate(next);
              }}
              className="mt-1 h-10 bg-secondary/65 px-2 text-[12px]"
            />
          </div>
          <div>
            <span className="text-[10.5px] text-muted-foreground">{bi('结束', 'To')}</span>
            <Input
              type="date"
              value={endDate}
              min={visitDate}
              onChange={(event) => onEndDate(event.target.value || visitDate)}
              className="mt-1 h-10 bg-secondary/65 px-2 text-[12px]"
            />
          </div>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {visitDate} – {endDate} · {bi(`${days} 天`, `${days} day${days === 1 ? '' : 's'}`)} ·
          {WEEKDAYS[lang === 'en' ? 'en' : 'zh'][new Date(`${visitDate}T00:00:00`).getDay()]}
          {isPeak ? bi(' · 周末/旺季价格', ' · weekend / peak price') : bi(' · 平季价格', ' · regular price')}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-3.5">
        <Label className="text-[12px]">{bi('人数', 'Guests')}</Label>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onQuantity(Math.max(1, quantity - 1))}
            className="h-10 w-10 rounded-xl border border-border text-lg text-muted-foreground transition hover:bg-secondary"
          >
            −
          </button>
          <span className="w-10 text-center font-heading text-[17px]">{quantity}</span>
          <button
            type="button"
            onClick={() => onQuantity(Math.min(Number(product.capacity_per_day || 20), quantity + 1))}
            className="h-10 w-10 rounded-xl border border-border text-lg text-muted-foreground transition hover:bg-secondary"
          >
            +
          </button>
          <span className="text-[11px] text-muted-foreground">
            {bi('单价', 'each')} {formatCNY(unitPrice)} · {bi('小计', 'subtotal')} {formatCNY(subtotal)}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-[11px] leading-relaxed text-muted-foreground">
        {bi(
          `价格由园区动态定价规则计算：平季 ${formatCNY(product.price)}，周末与旺季 ${formatCNY(
            Number(product.price || 0) * Number(product.peak_multiplier || 1),
          )}，按 ${days} 天 × ${quantity} 人计价。正式环境将改为读取 Aspenware 定价接口。`,
          `${productName}: regular days ${formatCNY(product.price)}, weekends and peak days ${formatCNY(
            Number(product.price || 0) * Number(product.peak_multiplier || 1),
          )}, priced for ${days} day${days === 1 ? '' : 's'} × ${quantity} guest${quantity === 1 ? '' : 's'}. In production these prices come from the Aspenware pricing API.`,
        )}
      </div>
    </div>
  );
}
