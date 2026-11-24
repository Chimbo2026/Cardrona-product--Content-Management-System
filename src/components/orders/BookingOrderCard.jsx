import { Link } from 'react-router-dom';
import { ChevronRight, BadgePercent } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { formatNZD } from '@/lib/booking';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BookingOrderCard({ booking }) {
  const { bi } = useLanguage();
  const range =
    booking.visit_end_date && booking.visit_end_date !== booking.visit_date
      ? `${booking.visit_date} – ${booking.visit_end_date}`
      : booking.visit_date;

  return (
    <Link
      to={`/order/${booking.id}`}
      className="block rounded-2xl border border-border bg-card p-4 transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-heading text-[14px] leading-snug">{booking.product_name}</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">{booking.order_no}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {range} ·{' '}
          {bi(
            `${booking.quantity} 人`,
            `${booking.quantity} guest${booking.quantity === 1 ? '' : 's'}`,
          )}
        </span>
        <span className="font-heading text-[15px] text-primary">
          {formatNZD(booking.total_amount)}
        </span>
      </div>
      {booking.discount_code && (
        <p className="mt-2 flex items-center gap-1 text-[10px] text-accent-foreground">
          <BadgePercent className="h-3 w-3" /> {bi('折扣码', 'Code')} {booking.discount_code}
          {booking.agent_name ? ` · ${booking.agent_name}` : ''}
        </p>
      )}
      <ChevronRight className="ml-auto mt-1 h-4 w-4 text-muted-foreground" />
    </Link>
  );
}