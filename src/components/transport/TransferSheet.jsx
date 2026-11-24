import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TRANSFERS } from '@/lib/transfer';
import { base44 } from '@/api/base44Client';
import { getEntrySource } from '@/lib/attribution';
import { formatNZD, generateOrderNo, todayKey } from '@/lib/booking';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function TransferSheet({ onClose }) {
  const { lang, bi } = useLanguage();
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({
    transfer_id: TRANSFERS[0].id,
    date: todayKey(),
    time: TRANSFERS[0].times[0],
    passengers: '2',
    guest_name: '',
    guest_phone: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  const transfer = TRANSFERS.find((item) => item.id === form.transfer_id) || TRANSFERS[0];
  const passengers = Math.max(1, Number(form.passengers));
  const total = transfer.price * passengers;

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const pickTransfer = (item) =>
    setForm((prev) => ({
      ...prev,
      transfer_id: item.id,
      time: item.times.includes(prev.time) ? prev.time : item.times[0],
    }));

  const submit = async () => {
    if (!form.guest_name.trim()) {
      setError(bi('请填写乘车人姓名', 'Enter the passenger name'));
      return;
    }
    if (form.guest_phone.trim().length < 6) {
      setError(bi('请填写手机号', 'Enter a phone number'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const booking = await base44.entities.Booking.create({
        order_no: generateOrderNo(),
        product_id: `transfer-${transfer.id}`,
        product_name: `${transfer.route.zh} ${form.time}`,
        product_category: '接送',
        visit_date: form.date,
        visit_end_date: form.date,
        quantity: passengers,
        unit_price: transfer.price,
        subtotal: total,
        discount_amount: 0,
        total_amount: total,
        currency: 'NZD',
        status: 'pending_payment',
        payment_method: 'wechat_pay',
        payment_status: 'unpaid',
        guest_legal_name: form.guest_name.trim(),
        guest_phone: form.guest_phone.trim(),
        admin_note: `${passengers} 位 · ${form.date} ${form.time} 出发`,
        source: getEntrySource('小程序码'),
      });
      setDone(booking);
      setStep('done');
    } catch {
      setError(bi('预订失败，请稍后重试', 'Could not book the transfer, please try again'));
    } finally {
      setSubmitting(false);
    }
  };

  const fields = (
    <div className="space-y-2.5">
      <div className="space-y-1.5">
        {TRANSFERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => pickTransfer(item)}
            className={`w-full rounded-xl border px-3 py-2 text-left transition ${
              item.id === form.transfer_id ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <p className="text-[12px] font-medium">{item.route[lang === 'en' ? 'en' : 'zh']}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {formatNZD(item.price)} · {bi('每人', 'per person')}
            </p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px]">{bi('出发日期', 'Travel date')}</Label>
          <Input
            type="date"
            value={form.date}
            onChange={(event) => update('date', event.target.value)}
            className="h-9 text-[12px]"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">{bi('出发时间', 'Departure')}</Label>
          <select
            value={form.time}
            onChange={(event) => update('time', event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-[12px] shadow-sm"
          >
            {transfer.times.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
        <p className="text-[11.5px] font-medium">{bi('乘车人数', 'Passengers')}</p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => update('passengers', String(Math.max(1, passengers - 1)))}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-[13px] leading-none text-muted-foreground"
            aria-label={bi('减少人数', 'Fewer passengers')}
          >
            −
          </button>
          <span className="w-4 text-center text-[11.5px]">{passengers}</span>
          <button
            type="button"
            onClick={() => update('passengers', String(passengers + 1))}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[13px] leading-none text-primary-foreground"
            aria-label={bi('增加人数', 'More passengers')}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-[380px] overflow-y-auto">
        {step === 'done' ? (
          <div className="py-2 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
            <DialogTitle className="mt-3 text-[16px]">{bi('预订成功', 'Booking placed')}</DialogTitle>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">{done.order_no}</p>
            <div className="mt-4 space-y-1.5 rounded-xl bg-secondary/60 p-3 text-left text-[11.5px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{bi('线路', 'Route')}</span>
                <span className="ml-2 text-right">{transfer.route[lang === 'en' ? 'en' : 'zh']}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{bi('出发', 'Departure')}</span>
                <span>
                  {done.visit_date} {form.time}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span>{bi('应付金额', 'Total')}</span>
                <span>{formatNZD(done.total_amount)}</span>
              </div>
            </div>
            <p className="mt-3 text-[10.5px] leading-relaxed text-muted-foreground">
              {bi(
                '订单已提交，可在「我的订单」查看进度。',
                'Your booking is submitted. Track it under My orders.',
              )}
            </p>
            <Button className="mt-4 h-10 w-full rounded-full" onClick={onClose}>
              {bi('完成', 'Done')}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-[16px]">{bi('预订接驳与接送', 'Book a shuttle or transfer')}</DialogTitle>
              <DialogDescription className="text-[11px]">
                {step === 'form'
                  ? bi('选择线路、日期与人数', 'Pick a route, date and passengers')
                  : bi('确认出行信息，线路与人数可在此修改', 'Confirm your trip, route and passengers can still be changed')}
              </DialogDescription>
            </DialogHeader>

            {fields}

            {step === 'confirm' && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px]">{bi('乘车人', 'Passenger')}</Label>
                  <Input
                    value={form.guest_name}
                    onChange={(event) => update('guest_name', event.target.value)}
                    placeholder={bi('与证件一致', 'As shown on your ID')}
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
            )}

            {error && <p className="text-[11px] text-destructive">{error}</p>}

            <div className="flex items-center justify-between border-t border-dashed border-border pt-3 text-[12px]">
              <span className="text-muted-foreground">
                {form.date} {form.time} · {bi(`${passengers} 人`, `${passengers} pax`)}
              </span>
              <span className="font-heading text-[18px] text-primary">{formatNZD(total)}</span>
            </div>

            {step === 'form' ? (
              <Button className="h-11 w-full rounded-full" onClick={() => setStep('confirm')}>
                {bi('去结算', 'Checkout')}
              </Button>
            ) : (
              <div className="space-y-1.5">
                <Button className="h-11 w-full rounded-full" disabled={submitting} onClick={submit}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : bi('提交预订', 'Place booking')}
                </Button>
                <Button
                  variant="ghost"
                  className="h-9 w-full rounded-full text-[11.5px]"
                  onClick={() => setStep('form')}
                >
                  {bi('返回修改', 'Back')}
                </Button>
                <p className="text-center text-[10px] text-muted-foreground">
                  {bi('演示环境：不会真实扣款', 'Demo build: nothing is really charged')}
                </p>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}