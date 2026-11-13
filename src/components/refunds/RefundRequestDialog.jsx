import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Field from '@/components/common/Field';
import { SelectNative } from '@/components/common/Controls';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { NZD } from '@/lib/format';
import { REFUND_METHODS, REFUND_REASONS, nextRefundRef, refundMethodForBooking } from '@/lib/refunds';

const bookingTotal = (b) => (Number(b?.amount) || 0) * (Number(b?.guests_count) || 1);

export default function RefundRequestDialog({ open, onOpenChange, bookings, onSaved }) {
  const { toast } = useToast();
  const { lang, t } = useLang();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const eligible = useMemo(
    () => bookings.filter((b) => b.booking_status !== 'Cancelled' && b.payment_status !== 'Refunded' && b.payment_status !== 'Pending'),
    [bookings]
  );

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm({
      booking_id: '',
      refund_type: 'Full',
      amount: '',
      reason: 'Change of plans',
      reason_detail: '',
      method: 'Visa/Mastercard',
      request_ref: '',
    });
    nextRefundRef().then((ref) => setForm((f) => (f ? { ...f, request_ref: ref } : f)));
  }, [open]);

  const booking = eligible.find((b) => b.id === form?.booking_id);
  const total = bookingTotal(booking);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const pickBooking = (id) => {
    const b = eligible.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      booking_id: id,
      method: refundMethodForBooking(b),
      amount: f.refund_type === 'Full' ? bookingTotal(b) : f.amount,
    }));
  };

  const pickType = (type) => {
    setForm((f) => ({ ...f, refund_type: type, amount: type === 'Full' ? total : '' }));
  };

  if (!form) return null;

  const submit = async () => {
    if (!booking) return setError(t('请选择需要退款的预订。', 'Choose the booking to refund.'));
    const amount = Number(form.amount) || 0;
    if (amount <= 0) return setError(t('退款金额必须大于 0。', 'The refund amount must be greater than zero.'));
    if (amount > total) return setError(t(`退款金额不能超过预订总额 ${NZD(total)}。`, `The refund cannot exceed the booking total of ${NZD(total)}.`));
    if (!form.reason) return setError(t('请选择退款原因。', 'Choose a refund reason.'));

    setSaving(true);
    setError('');
    try {
      await base44.entities.RefundRequest.create({
        request_ref: form.request_ref || `RF-${Date.now().toString().slice(-6)}`,
        booking_id: booking.id,
        booking_ref: booking.booking_ref,
        guest_name: booking.guest_name,
        guest_email: booking.email || '',
        booking_amount: total,
        refund_type: amount >= total ? 'Full' : 'Partial',
        amount,
        reason: form.reason,
        reason_detail: form.reason_detail || '',
        method: form.method,
        status: 'Pending',
        requested_at: new Date().toISOString(),
        released: false,
      });
      toast({ title: t('退款申请已提交', 'Refund request submitted'), description: `${booking.booking_ref} · ${NZD(amount)}` });
      onOpenChange(false);
      onSaved?.();
    } catch (e) {
      setError(e?.message || t('提交失败，请重试。', 'Could not submit the request. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('新增退款申请', 'New refund request')}</DialogTitle>
          <DialogDescription>{t('退款将以原支付渠道退回，批准后处理。', 'Refunds return to the original payment method after approval.')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('预订', 'Booking')} required className="sm:col-span-2">
            <SelectNative
              value={form.booking_id}
              onChange={pickBooking}
              options={[{ value: '', label: t('选择预订…', 'Select a booking…') }, ...eligible.map((b) => ({
                value: b.id,
                label: `${b.booking_ref} · ${b.guest_name} · ${NZD(bookingTotal(b))}`,
              }))]}
              className="w-full"
            />
          </Field>

          <Field label={t('退款方式', 'Refund type')}>
            <SelectNative
              value={form.refund_type}
              onChange={pickType}
              options={[{ value: 'Full', label: t('全额退款', 'Full refund') }, { value: 'Partial', label: t('部分退款', 'Partial refund') }]}
              className="w-full"
            />
          </Field>

          <Field label={t('退款金额 (NZD)', 'Refund amount (NZD)')} required hint={booking ? t(`预订总额 ${NZD(total)}`, `Booking total ${NZD(total)}`) : undefined}>
            <Input
              type="number"
              min={0}
              value={form.amount}
              onChange={(e) => set('amount')(e.target.value)}
              disabled={form.refund_type === 'Full'}
            />
          </Field>

          <Field label={t('退款原因', 'Reason')} required className="sm:col-span-2">
            <SelectNative
              value={form.reason}
              onChange={set('reason')}
              options={REFUND_REASONS.map((r) => ({ value: r, label: tx(r, lang) }))}
              className="w-full"
            />
          </Field>

          <Field label={t('退回渠道', 'Refund to')}>
            <SelectNative value={form.method} onChange={set('method')} options={REFUND_METHODS.map((m) => ({ value: m, label: tx(m, lang) }))} className="w-full" />
          </Field>

          <Field label={t('申请编号', 'Request reference')}>
            <Input value={form.request_ref} onChange={(e) => set('request_ref')(e.target.value)} />
          </Field>

          <Field label={t('说明', 'Notes')} className="sm:col-span-2">
            <Textarea rows={2} value={form.reason_detail} onChange={(e) => set('reason_detail')(e.target.value)} placeholder={t('补充说明，便于审批判断', 'Anything the approver should know')} />
          </Field>
        </div>

        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12px] font-medium text-rose-700">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>{t('取消', 'Cancel')}</Button>
          <Button onClick={submit} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t('提交申请', 'Submit request')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}