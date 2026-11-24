import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function FoodGuestForm({ form, update }) {
  const { bi } = useLanguage();

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px]">{bi('取餐人', 'Name')}</Label>
          <Input
            value={form.guest_name}
            onChange={(event) => update('guest_name', event.target.value)}
            placeholder={bi('称呼即可', 'How we call you')}
            className="h-9 text-[12px]"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">{bi('手机号', 'Phone')}</Label>
          <Input
            value={form.guest_phone}
            onChange={(event) => update('guest_phone', event.target.value)}
            placeholder="+86"
            className="h-9 text-[12px]"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[11px]">{bi('取餐时间', 'Pick-up time')}</Label>
        <Input
          value={form.pickup_time}
          onChange={(event) => update('pickup_time', event.target.value)}
          placeholder={bi('例如 12:30', 'e.g. 12:30')}
          className="h-9 text-[12px]"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-[11px]">{bi('整单备注（可选）', 'Order note (optional)')}</Label>
        <Input
          value={form.note}
          onChange={(event) => update('note', event.target.value)}
          placeholder={bi('如：分两袋装、需要餐具', 'e.g. two bags, cutlery needed')}
          className="h-9 text-[12px]"
        />
      </div>
    </div>
  );
}