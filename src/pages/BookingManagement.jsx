import { useState } from 'react';
import { ArrowLeft, UserRound } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import BookingManagementHeader from '@/components/booking-management/BookingManagementHeader';
import BookingSteps from '@/components/booking-management/BookingSteps';
import ConfirmationPanel from '@/components/booking-management/ConfirmationPanel';
import PaymentPanel from '@/components/booking-management/PaymentPanel';
import CollectionPanel from '@/components/booking-management/CollectionPanel';
import AmendmentPanel from '@/components/booking-management/AmendmentPanel';
import RefundPanel from '@/components/booking-management/RefundPanel';
import BookingRegister from '@/components/bookings/BookingRegister';
import useList from '@/hooks/useList';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { NZD, prettyDate } from '@/lib/format';

export default function BookingManagement() {
  const { lang, t } = useLang();
  const { items: bookings, loading, reload } = useList('Booking', {}, { sort: '-visit_date', limit: 400 });
  const [selectedId, setSelectedId] = useState(null);
  const [step, setStep] = useState('confirm');
  const [quickFilter, setQuickFilter] = useState(null);
  const booking = bookings.find((b) => b.id === selectedId) || null;

  const select = (b) => {
    setStep('confirm');
    setSelectedId(b.id);
  };

  return (
    <div>
      <BookingManagementHeader value={quickFilter} onChange={setQuickFilter} />

      {!booking ? (
        <BookingRegister
          onOpen={select}
          quickFilter={quickFilter}
          onClearFilter={() => setQuickFilter(null)}
        />
      ) : (
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-forest-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {t('返回预订列表', 'Back to bookings')}
          </button>

          <section className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-border/80 bg-card px-4 py-3.5 shadow-[0_1px_2px_rgba(15,42,34,0.04)]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-50 text-forest-700">
                <UserRound className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-forest-950">{booking.guest_name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{booking.booking_ref}</p>
              </div>
            </div>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t('到访日期', 'Visit date')}
              </p>
              <p className="text-[12.5px] text-forest-900">{prettyDate(booking.visit_date)}</p>
            </div>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t('产品', 'Product')}
              </p>
              <p className="text-[12.5px] text-forest-900">{tx(booking.activity, lang)}</p>
            </div>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t('预订总额', 'Booking total')}
              </p>
              <p className="num text-[12.5px] font-semibold text-forest-950">
                {NZD((Number(booking.amount) || 0) * (Number(booking.guests_count) || 1))}
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <StatusBadge status={booking.booking_status} />
              <StatusBadge status={booking.payment_status} dot={false} />
            </div>
          </section>

          <div className="space-y-4">
            <BookingSteps value={step} onChange={setStep} />
            {step === 'confirm' && <ConfirmationPanel booking={booking} />}
            {step === 'pay' && <PaymentPanel key={booking.id} booking={booking} onChanged={reload} />}
            {step === 'collect' && <CollectionPanel booking={booking} />}
            {step === 'amend' && <AmendmentPanel booking={booking} onSaved={reload} />}
            {step === 'refund' && <RefundPanel booking={booking} onSaved={reload} />}
          </div>
        </div>
      )}
    </div>
  );
}