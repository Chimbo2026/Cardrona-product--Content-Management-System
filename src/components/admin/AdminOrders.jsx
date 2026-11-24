import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Search, Check, Undo2, CalendarClock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StatusBadge from '@/components/StatusBadge';
import IntegrationNotice from '@/components/IntegrationNotice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PAYMENT_LABELS,
  PAYMENT_STATUS_LABELS,
  STATUS_META,
  SYNC_META,
  formatCNY,
} from '@/lib/booking';

export default function AdminOrders() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('全部');
  const [keyword, setKeyword] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = async () => {
    const page = await base44.entities.Booking.list({ sort: '-created_date', limit: 100 });
    setBookings(page.items || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateBooking = async (booking, patch) => {
    setBusyId(booking.id);
    const updated = await base44.entities.Booking.update(booking.id, patch);
    setBookings((prev) => prev.map((item) => (item.id === booking.id ? updated : item)));
    setBusyId('');
  };

  const filtered = bookings.filter((booking) => {
    const matchStatus = statusFilter === '全部' || booking.status === statusFilter;
    const text = `${booking.order_no} ${booking.product_name} ${booking.guest_name_pinyin || ''} ${booking.agent_name || ''}`;
    const matchKeyword = !keyword || text.toLowerCase().includes(keyword.toLowerCase());
    return matchStatus && matchKeyword;
  });

  const counts = bookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {['confirmed', 'reschedule_requested', 'refund_requested', 'used'].map((key) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] text-muted-foreground">{STATUS_META[key].label}</p>
            <p className="mt-1.5 font-heading text-[20px]">{counts[key] || 0}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索订单号 / 游客 / 代理"
            className="h-9 w-64 pl-8 text-[12px]"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {['全部', 'confirmed', 'reschedule_requested', 'refund_requested', 'refunded', 'used', 'pending_payment'].map(
            (key) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`rounded-full px-3 py-1.5 text-[11px] transition ${
                  statusFilter === key
                    ? 'bg-[#0d2536] text-white'
                    : 'bg-white text-muted-foreground hover:text-foreground'
                }`}
              >
                {key === '全部' ? '全部' : STATUS_META[key].label}
              </button>
            ),
          )}
        </div>
        <Button variant="outline" size="sm" className="ml-auto h-9 rounded-full text-[12px]" onClick={load}>
          <RefreshCw className="h-3.5 w-3.5" /> 刷新
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => {
            const sync = SYNC_META[booking.aspenware_sync_status] || SYNC_META.not_connected;
            return (
              <div key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-[220px] flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-muted-foreground">{booking.order_no}</span>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="mt-1.5 font-heading text-[14px]">{booking.product_name}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {booking.visit_date} · {booking.quantity} 人 · 游客 {booking.guest_name_pinyin || '—'}
                      {booking.guest_nationality ? `（${booking.guest_nationality}）` : ''}
                    </p>
                    {booking.agent_name && (
                      <p className="mt-1 text-[11px] text-accent-foreground">
                        代理 {booking.agent_name} · 折扣码 {booking.discount_code} · 优惠{' '}
                        {formatCNY(booking.discount_amount)}
                      </p>
                    )}
                  </div>

                  <div className="min-w-[150px] text-[11px] text-muted-foreground">
                    <p>支付：{PAYMENT_LABELS[booking.payment_method] || '—'}</p>
                    <p className="mt-0.5">{PAYMENT_STATUS_LABELS[booking.payment_status]}</p>
                    <p className="mt-0.5">来源：{booking.source || '—'}</p>
                    <p className="mt-0.5">
                      免责声明：{booking.waiver_signed ? '已签署' : '未签署'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-heading text-[17px]">{formatCNY(booking.total_amount)}</p>
                    <span className={`mt-1.5 inline-flex rounded-full border px-2 py-0.5 text-[10px] ${sync.tone}`}>
                      {sync.label}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  {booking.status === 'reschedule_requested' && (
                    <Button
                      size="sm"
                      className="h-8 rounded-full text-[11px]"
                      disabled={busyId === booking.id}
                      onClick={() => updateBooking(booking, { status: 'confirmed' })}
                    >
                      <CalendarClock className="h-3.5 w-3.5" /> 同意改期
                    </Button>
                  )}
                  {booking.status === 'refund_requested' && (
                    <Button
                      size="sm"
                      className="h-8 rounded-full text-[11px]"
                      disabled={busyId === booking.id}
                      onClick={() =>
                        updateBooking(booking, { status: 'refunded', payment_status: 'refunded' })
                      }
                    >
                      <Undo2 className="h-3.5 w-3.5" /> 确认退款
                    </Button>
                  )}
                  {booking.status === 'pending_payment' && (
                    <Button
                      size="sm"
                      className="h-8 rounded-full text-[11px]"
                      disabled={busyId === booking.id}
                      onClick={() => updateBooking(booking, { status: 'confirmed', payment_status: 'paid' })}
                    >
                      <Check className="h-3.5 w-3.5" /> 确认收款
                    </Button>
                  )}
                  {booking.status === 'confirmed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-full text-[11px]"
                      disabled={busyId === booking.id}
                      onClick={() => updateBooking(booking, { status: 'used' })}
                    >
                      <Check className="h-3.5 w-3.5" /> 标记已核销
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="h-8 rounded-full text-[11px]"
                    title="待 Aspenware 接口文档就绪后开放"
                  >
                    同步至 Aspenware（未接入）
                  </Button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-[12px] text-muted-foreground">
              没有符合条件的订单
            </p>
          )}
        </div>
      )}

      <IntegrationNotice type="aspenware" />
    </div>
  );
}