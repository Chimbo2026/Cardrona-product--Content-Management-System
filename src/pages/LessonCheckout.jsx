import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import LanguageToggle from '@/components/LanguageToggle';
import StepPayment from '@/components/booking/StepPayment';
import BookingDone from '@/components/booking/BookingDone';
import { formatNZD, generateOrderNo, toDateKey } from '@/lib/booking';
import { AGE_GROUPS, SESSIONS, SKILL_LEVELS, lessonName, lessonPrice } from '@/lib/lessonBooking';
import { getEntrySource } from '@/lib/attribution';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LessonCheckout() {
  const { lang, bi } = useLanguage();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);

  const typeId = params.get('type') || 'group-ski';
  const age = params.get('age') || 'adult';
  const level = params.get('level') || 'first_timer';
  const session = params.get('session') || 'morning';
  const date = params.get('date') || toDateKey(new Date(Date.now() + 86400000));

  const price = lessonPrice(typeId, age);
  const ageLabel = AGE_GROUPS.find((item) => item.id === age);
  const levelLabel = SKILL_LEVELS.find((item) => item.id === level);
  const sessionItem = SESSIONS.find((item) => item.id === session);

  const [method, setMethod] = useState('wechat_pay');
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);

  const confirm = async () => {
    setSubmitting(true);
    try {
      const orderNo = generateOrderNo();
      const saved = await base44.entities.Booking.create({
        order_no: orderNo,
        product_id: `lesson-${typeId}`,
        product_name: lessonName(typeId, 'zh'),
        product_category: '课程',
        visit_date: date,
        visit_end_date: date,
        quantity: 1,
        unit_price: price,
        subtotal: price,
        total_amount: price,
        currency: 'NZD',
        status: 'confirmed',
        payment_method: method,
        payment_status: 'paid',
        payment_ref: `SIM-${orderNo.slice(-6)}`,
        source: getEntrySource(),
        admin_note: [sessionItem?.zh, ageLabel?.zh, levelLabel?.zh].filter(Boolean).join(' · '),
        aspenware_sync_status: 'not_connected',
      });
      setBooking(saved);
    } finally {
      setSubmitting(false);
    }
  };

  const back = () =>
    navigate(
      `/lessons/book?type=${typeId}&age=${age}&level=${level}&session=${session}&date=${date}`,
    );

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-4">
          <button
            type="button"
            onClick={back}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 transition hover:bg-secondary"
            aria-label={bi('返回', 'Back')}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-0 flex-1 truncate font-heading text-[15px] font-semibold">
            {bi('确认并支付', 'Confirm & pay')}
          </span>
          <LanguageToggle />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-5">
        {booking ? (
          <BookingDone booking={booking} />
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-3.5">
              <h1 className="font-heading text-[15px] leading-snug">{lessonName(typeId, lang)}</h1>
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                {date} · {lang === 'en' ? sessionItem?.en : sessionItem?.zh} ·{' '}
                {lang === 'en' ? ageLabel?.en : ageLabel?.zh} ·{' '}
                {lang === 'en' ? levelLabel?.en : levelLabel?.zh} · {bi('每位', 'each')} {formatNZD(price)}
              </p>
            </div>

            <StepPayment method={method} onMethod={setMethod} total={price} discountAmount={0} />
          </div>
        )}
      </div>

      {!booking && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <div className="min-w-0">
              <p className="text-[10.5px] text-muted-foreground">{bi('合计', 'Total')}</p>
              <p className="font-heading text-[20px] leading-tight text-primary">{formatNZD(price)}</p>
            </div>
            <Button
              type="button"
              className="h-11 flex-1 rounded-full text-[13.5px] font-semibold"
              onClick={confirm}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> {bi('处理中…', 'Processing…')}
                </>
              ) : (
                bi('确认并支付', 'Confirm payment')
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}