import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Panel from '@/components/common/Panel';
import Field from '@/components/common/Field';
import { useLang } from '@/lib/i18n';

const toForm = (booking) => ({
  visit_date: booking.visit_date || '',
  guests_count: String(booking.guests_count ?? 1),
  email: booking.email || '',
  phone: booking.phone || '',
  notes: booking.notes || '',
});

export default function AmendmentPanel({ booking, onSaved }) {
  const { t } = useLang();
  const { toast } = useToast();
  const [form, setForm] = useState(() => toForm(booking));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(toForm(booking));
    setErrors({});
  }, [booking.id, booking.updated_date]);

  const locked = booking.booking_status === 'Cancelled';
  const set = (key) => (e) => {
    const value = e && e.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.visit_date) next.visit_date = t('请选择新的到访日期。', 'Choose a new visit date.');
    const guests = Number(form.guests_count);
    if (!guests || guests < 1 || guests > 20) next.guests_count = t('人数需在 1 到 20 之间。', 'Guests must be between 1 and 20.');
    if (Object.keys(next).length) return setErrors(next);

    setSaving(true);
    try {
      await base44.entities.Booking.update(booking.id, {
        visit_date: form.visit_date,
        guests_count: guests,
        email: form.email,
        phone: form.phone,
        notes: form.notes,
      });
      toast({
        title: t('修改已提交', 'Amendment submitted'),
        description: t('宾客服务团队会确认最新安排。', 'Guest Services will confirm the updated details.'),
      });
      onSaved?.();
    } catch (error) {
      setErrors({ visit_date: error.message || t('提交失败，请重试。', 'Could not submit, please try again.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel title={t('修改预订', 'Amend booking')} description={t('可调整到访日期、人数与联系方式。', 'Change your visit date, party size or contact details.')}>
      {locked ? (
        <p className="rounded-lg bg-muted/40 px-3 py-2.5 text-[12px] text-muted-foreground">
          {t('该预订已取消，无法修改。如需帮助请联系宾客服务。', 'This booking is cancelled and can no longer be amended. Contact Guest Services for help.')}
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t('到访日期', 'Visit date')} required error={errors.visit_date}>
              <Input type="date" value={form.visit_date} onChange={set('visit_date')} />
            </Field>
            <Field label={t('人数', 'Guests')} required error={errors.guests_count}>
              <Input type="number" min="1" max="20" value={form.guests_count} onChange={set('guests_count')} />
            </Field>
            <Field label={t('邮箱', 'Email')}>
              <Input type="email" value={form.email} onChange={set('email')} placeholder="name@example.com" />
            </Field>
            <Field label={t('电话', 'Phone')}>
              <Input value={form.phone} onChange={set('phone')} placeholder="+64 …" />
            </Field>
          </div>
          <Field label={t('备注', 'Notes')} hint={t('例如：增加一名儿童、更改取票时间。', 'For example: adding a child, or a different pick-up time.')}>
            <Textarea rows={3} value={form.notes} onChange={set('notes')} />
          </Field>
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {t('日期或人数调整视供应情况而定。', 'Date and party-size changes are subject to availability.')}
            </p>
            <Button type="submit" disabled={saving} className="shrink-0 gap-1.5">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? t('保存中…', 'Saving…') : t('保存修改', 'Save changes')}
            </Button>
          </div>
        </form>
      )}
    </Panel>
  );
}