import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import StayBookingForm, { UNIT_STATUS } from './stay/StayBookingForm';
import StayReview from './stay/StayReview';
import { base44 } from '@/api/base44Client';
import { getEntrySource } from '@/lib/attribution';
import { formatNZD, generateOrderNo, todayKey, toDateKey } from '@/lib/booking';
import { STAYS } from '@/lib/resort';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const nightsBetween = (fromKey, toKey) => {
  if (!fromKey || !toKey) return 0;
  return Math.round((new Date(`${toKey}T00:00:00`) - new Date(`${fromKey}T00:00:00`)) / 86400000);
};

const tomorrowKey = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toDateKey(date);
};

export default function StaySheet({ stay, onClose }) {
  const { bi } = useLanguage();
  const [form, setForm] = useState({
    roomNo: '',
    unitId: stay.id,
    rate: String(stay.price),
    photoUrl: '',
    guestName: '',
    guests: '2',
    bookingRef: generateOrderNo(),
    status: 'available',
    checkIn: todayKey(),
    checkOut: tomorrowKey(),
    notes: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [reviewing, setReviewing] = useState(false);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const changeUnit = (unitId) => {
    const next = STAYS.find((item) => item.id === unitId) || stay;
    setForm((prev) => ({ ...prev, unitId, rate: String(next.price), photoUrl: '' }));
  };

  const unit = STAYS.find((item) => item.id === form.unitId) || stay;
  const nights = Math.max(1, nightsBetween(form.checkIn, form.checkOut));
  const rate = Number(form.rate) || 0;
  const total = nights * rate;

  const goReview = () => {
    if (nightsBetween(form.checkIn, form.checkOut) < 1) {
      setError(bi('退房日期需晚于入住日期', 'Check-out must be after check-in'));
      return;
    }
    if (!form.roomNo.trim()) {
      setError(bi('请填写房间号', 'Enter the room number'));
      return;
    }
    if (!form.guestName.trim()) {
      setError(bi('请填写入住人姓名', 'Enter the guest name'));
      return;
    }
    if (rate <= 0) {
      setError(bi('请填写每晚价格', 'Enter the nightly rate'));
      return;
    }
    setError('');
    setReviewing(true);
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const statusLabel = UNIT_STATUS.find((item) => item.key === form.status);
      const note = [
        `房间 ${form.roomNo.trim()}`,
        `${form.guests || 1} 位入住`,
        `${nights} 晚`,
        statusLabel ? statusLabel.label.zh : '',
        form.notes.trim() ? `备注：${form.notes.trim()}` : '',
        form.photoUrl ? `照片 ${form.photoUrl}` : '',
      ]
        .filter(Boolean)
        .join(' · ');
      const booking = await base44.entities.Booking.create({
        order_no: form.bookingRef.trim() || generateOrderNo(),
        product_id: `stay-${unit.id}`,
        product_name: `${unit.name.zh} · ${nights} 晚`,
        product_category: '住宿',
        visit_date: form.checkIn,
        visit_end_date: form.checkOut,
        quantity: nights,
        unit_price: rate,
        subtotal: total,
        discount_amount: 0,
        total_amount: total,
        currency: 'NZD',
        status: 'pending_payment',
        payment_method: 'wechat_pay',
        payment_status: 'unpaid',
        guest_legal_name: form.guestName.trim(),
        admin_note: note,
        source: getEntrySource('小程序码'),
      });
      setDone(booking);
    } catch {
      setError(bi('预订失败，请稍后重试', 'Could not book the room, please try again'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-[680px] overflow-y-auto">
        {done ? (
          <div className="py-2 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
            <DialogTitle className="mt-3 text-[16px]">{bi('预订成功', 'Booking placed')}</DialogTitle>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">{done.order_no}</p>
            <div className="mt-4 space-y-1.5 rounded-xl bg-secondary/60 p-3 text-left text-[11.5px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{bi('房型', 'Room')}</span>
                <span>{unit.name.zh}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{bi('房间号', 'Room number')}</span>
                <span>{form.roomNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{bi('入住', 'Stay')}</span>
                <span>
                  {done.visit_date} → {done.visit_end_date}
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
              <DialogTitle className="text-[17px]">
                {reviewing ? bi('确认预订信息', 'Confirm your booking') : bi('预订住宿单元', 'Book accommodation unit')}
              </DialogTitle>
              <DialogDescription className="text-[11px]">
                {reviewing
                  ? bi('请核对以下预订信息，确认后提交订单。', 'Check the details below, then confirm to submit.')
                  : bi('演示住宿预订记录，提交后可在「我的订单」查看。', 'Demonstration accommodation booking.')}
              </DialogDescription>
            </DialogHeader>

            {reviewing ? (
              <StayReview
                unit={unit}
                form={form}
                nights={nights}
                total={total}
                error={error}
                submitting={submitting}
                onBack={() => {
                  setError('');
                  setReviewing(false);
                }}
                onConfirm={submit}
              />
            ) : (
              <StayBookingForm
                form={form}
                update={update}
                onUnitType={changeUnit}
                units={STAYS}
                unit={unit}
                nights={nights}
                total={total}
                error={error}
                submitting={submitting}
                onCancel={onClose}
                onSubmit={goReview}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}