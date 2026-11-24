import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Ticket, ShoppingBag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import RetailOrderCard from '@/components/orders/RetailOrderCard';
import BookingOrderCard from '@/components/orders/BookingOrderCard';
import OrderFilters, { matchStatus } from '@/components/orders/OrderFilters';
import { Button } from '@/components/ui/button';
import useCurrentUser from '@/hooks/useCurrentUser';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getDemoBookings } from '@/lib/demoBookings';

export default function Orders() {
  const { bi } = useLanguage();
  const { user } = useCurrentUser();
  const [bookings, setBookings] = useState([]);
  const [retailOrders, setRetailOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAgent, setIsAgent] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState('all');
  const [status, setStatus] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    if (!user) {
      setBookings(getDemoBookings());
      setLoading(false);
      setFailed(false);
      return undefined;
    }
    let active = true;

    const load = async () => {
      try {
        const own = await base44.entities.Booking.filter(
          { created_by_id: user.id },
          { sort: '-created_date', limit: 100 },
        );
        const map = new Map((own.items || []).map((item) => [item.id, item]));

        const agentRecords = await base44.entities.Agent.filter({ email: user.email });
        if (agentRecords.length > 0) {
          const referred = await base44.entities.Booking.filter(
            { agent_email: user.email },
            { sort: '-created_date', limit: 100 },
          );
          (referred.items || []).forEach((item) => map.set(item.id, item));
        }

        const shopOrders = await base44.entities.RetailOrder.filter(
          { created_by_id: user.id },
          { sort: '-created_date', limit: 100 },
        );

        const list = [...map.values()].sort(
          (a, b) => new Date(b.created_date) - new Date(a.created_date),
        );
        if (active) {
          const merged = new Map([...getDemoBookings(), ...list].map((item) => [item.id, item]));
          setBookings([...merged.values()].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
          setRetailOrders(shopOrders.items || []);
          setIsAgent(agentRecords.length > 0);
          setFailed(false);
        }
      } catch {
        if (active) {
          const local = getDemoBookings();
          setBookings(local);
          setFailed(local.length === 0);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [user, reloadKey]);

  // 订单变动或页面重新获得焦点时静默拉取最新数据
  useEffect(() => {
    if (!user) return;
    const refresh = () => setReloadKey((key) => key + 1);
    const unsubscribeBooking = base44.entities.Booking.subscribe(refresh);
    const unsubscribeRetail = base44.entities.RetailOrder.subscribe(refresh);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', refresh);
    return () => {
      unsubscribeBooking();
      unsubscribeRetail();
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', refresh);
    };
  }, [user]);

  const retry = () => {
    setFailed(false);
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  const clearFilters = () => {
    setTab('all');
    setStatus('all');
    setFrom('');
    setTo('');
  };

  if (failed) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="text-[13px]">{bi('订单加载失败', 'Could not load your orders')}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {bi('请检查网络后重试', 'Check your connection and try again')}
        </p>
        <Button className="mt-4 h-10 rounded-full px-5" onClick={retry}>
          {bi('重新加载', 'Reload')}
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  const inRange = (value) => {
    if (!from && !to) return true;
    const date = new Date(value);
    if (from && date < new Date(`${from}T00:00:00`)) return false;
    if (to && date > new Date(`${to}T23:59:59`)) return false;
    return true;
  };

  const total = bookings.length + retailOrders.length;
  const rows = [
    ...bookings.map((record) => ({ kind: 'ski', date: record.created_date, record })),
    ...retailOrders.map((record) => ({ kind: 'shop', date: record.created_date, record })),
  ]
    .filter(
      (row) =>
        (tab === 'all' || row.kind === tab) &&
        matchStatus(row.record.status, status) &&
        inRange(row.date),
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="px-4 pb-24 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-[17px]">{bi('我的订单', 'My orders')}</h1>
        <span className="text-[11px] text-muted-foreground">
          {bi(
            `共 ${rows.length} / ${total} 笔`,
            `${rows.length} of ${total} order${total === 1 ? '' : 's'}`,
          )}
        </span>
      </div>

      <OrderFilters
        type={tab}
        onType={setTab}
        status={status}
        onStatus={setStatus}
        from={from}
        to={to}
        onFrom={setFrom}
        onTo={setTo}
      />

      {isAgent && (
        <p className="mt-2 rounded-xl bg-accent/10 px-3 py-2 text-[11px] text-accent-foreground">
          {bi(
            '已包含通过你的专属折扣码成交的代理订单',
            'Includes agent bookings made with your discount codes',
          )}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center">
          {tab === 'shop' ? (
            <ShoppingBag className="mx-auto h-6 w-6 text-muted-foreground" />
          ) : (
            <Ticket className="mx-auto h-6 w-6 text-muted-foreground" />
          )}
          {total === 0 ? (
            <>
              <p className="mt-3 text-[13px]">{bi('还没有订单', 'No orders yet')}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {tab === 'shop'
                  ? bi('选购新品即可开始购物', 'Pick up something new to start shopping')
                  : bi('选择雪票即可开始预订', 'Choose a pass to start booking')}
              </p>
              <Button asChild className="mt-4 h-10 rounded-full px-5">
                <Link to={tab === 'shop' ? '/shop' : '/'}>
                  {tab === 'shop'
                    ? bi('去逛山地商店', 'Browse the store')
                    : bi('去选雪票', 'Browse passes')}
                </Link>
              </Button>
            </>
          ) : (
            <>
              <p className="mt-3 text-[13px]">
                {bi('没有符合筛选条件的订单', 'No orders match these filters')}
              </p>
              <Button variant="outline" className="mt-4 h-10 rounded-full px-5" onClick={clearFilters}>
                {bi('清除筛选', 'Clear filters')}
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {rows.map((row) =>
            row.kind === 'shop' ? (
              <RetailOrderCard key={`shop-${row.record.id}`} order={row.record} />
            ) : (
              <BookingOrderCard key={`ski-${row.record.id}`} booking={row.record} />
            ),
          )}
        </div>
      )}
    </div>
  );
}
