import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Ticket } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BookingOrderCard from '@/components/orders/BookingOrderCard';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AccountOrdersTab({ user, loadingUser }) {
  const { bi } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadingUser) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let active = true;
    base44.entities.Booking.filter(
      { created_by_id: user.id },
      { sort: '-created_date', limit: 5 },
    )
      .then((page) => {
        if (active) setBookings(page.items || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, loadingUser]);

  if (loadingUser || loading) {
    return (
      <div className="mt-8 flex h-40 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mt-3 px-4">
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <Ticket className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-3 text-[13px]">{bi('登录后查看你的订单', 'Sign in to see your bookings')}</p>
          <Button asChild className="mt-4 h-10 rounded-full px-5">
            <Link to="/login">{bi('去登录', 'Sign in')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="mt-3 px-4">
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <Ticket className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-3 text-[13px]">{bi('还没有订单', 'No bookings yet')}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {bi('选择雪票即可开始预订', 'Choose a pass to start booking')}
          </p>
          <Button asChild className="mt-4 h-10 rounded-full px-5">
            <Link to="/tickets">{bi('去选雪票', 'Browse passes')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3 px-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-semibold">{bi('最近订单', 'Recent bookings')}</h2>
        <Link to="/orders" className="text-[11px] font-medium text-primary">
          {bi('查看全部', 'View all')}
        </Link>
      </div>
      {bookings.map((booking) => (
        <BookingOrderCard key={booking.id} booking={booking} />
      ))}
      <Button asChild variant="outline" className="h-10 w-full rounded-full text-[12px]">
        <Link to="/orders">{bi('全部订单与电子票', 'All orders and e-tickets')}</Link>
      </Button>
    </div>
  );
}