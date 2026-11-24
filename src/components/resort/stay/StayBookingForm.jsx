import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import StayField from './StayField';
import StayPhotoPicker from './StayPhotoPicker';
import { formatNZD } from '@/lib/booking';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export const UNIT_STATUS = [
  { key: 'available', label: { zh: '可预订', en: 'Available' } },
  { key: 'occupied', label: { zh: '已入住', en: 'Occupied' } },
  { key: 'maintenance', label: { zh: '维护中', en: 'Maintenance' } },
];

export default function StayBookingForm({
  form,
  update,
  onUnitType,
  units,
  unit,
  nights,
  total,
  error,
  submitting,
  onCancel,
  onSubmit,
  submitLabel,
}) {
  const { lang, bi } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <StayField label={bi('房间号', 'Room number')} required>
          <Input
            value={form.roomNo}
            onChange={(event) => update('roomNo', event.target.value)}
            placeholder="A-201"
            className="h-9 text-[12.5px]"
          />
        </StayField>

        <StayField label={bi('房型', 'Unit type')} required>
          <Select value={form.unitId} onValueChange={onUnitType}>
            <SelectTrigger className="h-9 text-[12.5px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((item) => (
                <SelectItem key={item.id} value={item.id} className="text-[12.5px]">
                  {item.name[lang] || item.name.zh}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </StayField>

        <StayField label={bi('每晚价格 (NZD)', 'Nightly rate (NZD)')} required>
          <Input
            type="number"
            min="0"
            value={form.rate}
            onChange={(event) => update('rate', event.target.value)}
            className="h-9 text-[12.5px]"
          />
        </StayField>

        <StayField label={bi('入住人数', 'Number of guests')} required>
          <Input
            type="number"
            min="1"
            value={form.guests}
            onChange={(event) => update('guests', event.target.value)}
            className="h-9 text-[12.5px]"
          />
        </StayField>

        <div className="sm:col-span-2">
          <StayPhotoPicker
            sampleUrl={unit.image}
            value={form.photoUrl}
            onChange={(url) => update('photoUrl', url)}
          />
        </div>

        <StayField label={bi('住客姓名', 'Guest name')}>
          <Input
            value={form.guestName}
            onChange={(event) => update('guestName', event.target.value)}
            placeholder={bi('与证件一致', 'As shown on your ID')}
            className="h-9 text-[12.5px]"
          />
        </StayField>

        <StayField label={bi('订单编号', 'Booking reference')}>
          <Input
            value={form.bookingRef}
            onChange={(event) => update('bookingRef', event.target.value)}
            className="h-9 font-mono text-[12px]"
          />
        </StayField>

        <StayField label={bi('入住', 'Check-in')}>
          <Input
            type="date"
            value={form.checkIn}
            onChange={(event) => update('checkIn', event.target.value)}
            className="h-9 text-[12.5px]"
          />
        </StayField>

        <StayField label={bi('退房', 'Check-out')}>
          <Input
            type="date"
            value={form.checkOut}
            onChange={(event) => update('checkOut', event.target.value)}
            className="h-9 text-[12.5px]"
          />
        </StayField>

        <StayField label={bi('单元状态', 'Status')} required className="sm:col-span-2">
          <Select value={form.status} onValueChange={(value) => update('status', value)}>
            <SelectTrigger className="h-9 text-[12.5px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNIT_STATUS.map((item) => (
                <SelectItem key={item.key} value={item.key} className="text-[12.5px]">
                  {item.label[lang] || item.label.zh}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </StayField>

        <StayField label={bi('备注', 'Notes')} className="sm:col-span-2">
          <Textarea
            value={form.notes}
            onChange={(event) => update('notes', event.target.value)}
            rows={3}
            placeholder={bi('可填写特殊需求，例如高楼层、提前入住', 'Anything we should know, e.g. high floor or early check-in')}
            className="text-[12.5px]"
          />
        </StayField>
      </div>

      {error && <p className="text-[11px] text-destructive">{error}</p>}

      <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11.5px] text-muted-foreground">
          {bi(`${nights} 晚 · ${formatNZD(total)}`, `${nights} nights · ${formatNZD(total)}`)}
        </p>
        <div className="flex gap-2 sm:justify-end">
          <Button type="button" variant="outline" className="h-9 flex-1 rounded-lg sm:flex-none" onClick={onCancel}>
            {bi('取消', 'Cancel')}
          </Button>
          <Button type="button" className="h-9 flex-1 rounded-lg sm:flex-none" disabled={submitting} onClick={onSubmit}>
            {submitting ? bi('处理中…', 'Working…') : submitLabel || bi('查看预订信息', 'Review booking')}
          </Button>
        </div>
      </div>
    </div>
  );
}