import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { formatNZD } from '@/lib/booking';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const Row = ({ label, value, strong }) => (
  <div className="flex items-start justify-between gap-4 py-1.5">
    <span className="shrink-0 text-muted-foreground">{label}</span>
    <span className={strong ? 'text-right font-medium' : 'text-right'}>{value}</span>
  </div>
);

export default function StayReview({ unit, form, nights, total, error, submitting, onBack, onConfirm }) {
  const { lang, bi } = useLanguage();
  const photo = form.photoUrl || unit.image;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 rounded-xl border border-border p-3">
        {photo && (
          <Image
            src={photo}
            alt={unit.name[lang] || unit.name.zh}
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
        )}
        <div className="min-w-0">
          <p className="text-[13px] font-medium">{unit.name[lang] || unit.name.zh}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {bi(`房间 ${form.roomNo || '—'}`, `Room ${form.roomNo || '—'}`)}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {form.checkIn} → {form.checkOut} · {bi(`${nights} 晚`, `${nights} nights`)}
          </p>
        </div>
      </div>

      <div className="divide-y divide-border rounded-xl bg-secondary/50 px-3 py-1 text-[11.5px]">
        <Row label={bi('入住人数', 'Guests')} value={bi(`${form.guests || 1} 位`, `${form.guests || 1}`)} />
        <Row label={bi('住客姓名', 'Guest name')} value={form.guestName || '—'} />
        <Row label={bi('每晚价格', 'Nightly rate')} value={formatNZD(Number(form.rate) || 0)} />
        <Row label={bi('订单编号', 'Booking reference')} value={form.bookingRef || '—'} />
        {form.notes?.trim() && <Row label={bi('备注', 'Notes')} value={form.notes.trim()} />}
        <Row label={bi('合计', 'Total')} value={formatNZD(total)} strong />
      </div>

      {error && <p className="text-[11px] text-destructive">{error}</p>}

      <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="h-9 flex-1 rounded-lg sm:flex-none"
          onClick={onBack}
          disabled={submitting}
        >
          {bi('返回修改', 'Back to edit')}
        </Button>
        <Button
          type="button"
          className="h-9 flex-1 rounded-lg sm:flex-none"
          onClick={onConfirm}
          disabled={submitting}
        >
          {submitting ? bi('提交中…', 'Saving…') : bi('确认预订', 'Confirm booking')}
        </Button>
      </div>
    </div>
  );
}