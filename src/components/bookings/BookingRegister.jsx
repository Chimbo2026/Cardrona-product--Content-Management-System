import { useMemo, useState } from 'react';
import { ArrowDownUp, ArrowRight, Ban, ExternalLink, Pencil, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import Panel from '@/components/common/Panel';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { SelectNative, SearchInput, DemoChip } from '@/components/common/Controls';
import BookingDialog from '@/components/bookings/BookingDialog';
import useList from '@/hooks/useList';
import { useRole } from '@/lib/RoleContext';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { NZD, num, prettyDate, todayISO } from '@/lib/format';
import { syncLessonCounts } from '@/lib/lessonCapacity';
import { findQuickFilter } from '@/lib/bookingQuickFilters';
import { cn } from '@/lib/utils';

const ACTIVITIES = ['Lift Pass', 'Lesson', 'Rental', 'Accommodation', 'Event', 'Transport', 'Food & Beverage', 'Gift Voucher'];

export default function BookingRegister({ onOpen, quickFilter, onClearFilter }) {
  const { can } = useRole();
  const { lang, t } = useLang();
  const canWrite = can('bookings', 'write');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { items: bookings, loading, reload } = useList('Booking', {}, { sort: '-visit_date', limit: 400 });
  const { items: lessons } = useList('Lesson', {}, { limit: 400 });
  const { items: agents } = useList('Agent', {}, { limit: 100 });
  const { items: refunds } = useList('RefundRequest', {}, { limit: 400 });

  const [search, setSearch] = useState('');
  const [activity, setActivity] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const today = todayISO();
  const activeFilter = findQuickFilter(quickFilter);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const ctx = {
      today,
      refundBookingIds: new Set(refunds.map((r) => r.booking_id).filter(Boolean)),
    };
    return bookings
      .filter((b) => {
        if (q && !`${b.guest_name} ${b.booking_ref} ${b.email || ''}`.toLowerCase().includes(q)) return false;
        if (activity !== 'All' && b.activity !== activity) return false;
        if (statusFilter !== 'All' && b.booking_status !== statusFilter) return false;
        if (from && b.visit_date < from) return false;
        if (to && b.visit_date > to) return false;
        if (activeFilter && !activeFilter.test(b, ctx)) return false;
        return true;
      })
      .sort((a, b) =>
        sortAsc
          ? String(a.visit_date).localeCompare(b.visit_date)
          : String(b.visit_date).localeCompare(a.visit_date)
      );
  }, [bookings, refunds, search, activity, statusFilter, from, to, sortAsc, activeFilter, today]);

  const stats = useMemo(() => ({
    today: bookings.filter((b) => b.visit_date === today && b.booking_status !== 'Cancelled').length,
    month: bookings.filter((b) => b.visit_date >= today && b.booking_status !== 'Cancelled').length,
    unpaid: bookings.filter((b) => b.payment_status === 'Pending' && b.booking_status !== 'Cancelled').length,
    value: bookings
      .filter((b) => b.visit_date === today && b.booking_status !== 'Cancelled')
      .reduce((s, b) => s + (Number(b.amount) || 0), 0),
  }), [bookings, today]);

  const cancelBooking = async () => {
    const b = cancelTarget;
    await base44.entities.Booking.update(b.id, { booking_status: 'Cancelled' });
    if (b.lesson_id) {
      await base44.entities.LessonBooking.updateMany({ booking_id: b.id, status: 'Booked' }, { $set: { status: 'Cancelled' } });
      await syncLessonCounts(b.lesson_id);
    }
    toast({ title: t('预订已取消', 'Booking cancelled'), description: `${b.booking_ref} · ${t('名额已释放', 'seats released')}` });
    setCancelTarget(null);
    reload();
  };

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [t('今日预订', 'Bookings today'), num(stats.today)],
          [t('即将到访', 'Upcoming'), num(stats.month)],
          [t('待支付', 'Awaiting payment'), num(stats.unpaid)],
          [t('今日金额', "Today's value"), NZD(stats.value)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/80 bg-card px-4 py-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
            <p className="num mt-1 text-[19px] font-semibold text-forest-950">{value}</p>
          </div>
        ))}
      </div>

      <Panel
        title={t(`预订登记（${rows.length}）`, `Booking register (${rows.length})`)}
        description={t('搜索、筛选并更新宾客预订', 'Search, filter and update guest bookings')}
        action={
          <div className="flex items-center gap-2">
            <DemoChip>{t('演示宾客', 'Demo guests')}</DemoChip>
            {canWrite && (
              <Button size="sm" className="h-8 gap-1.5" onClick={() => { setEditing(null); setFormOpen(true); }}>
                <Plus className="h-3.5 w-3.5" /> {t('新增预订', 'Add booking')}
              </Button>
            )}
          </div>
        }
        bodyClassName="p-0"
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-4 py-3">
          {activeFilter && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-2.5 py-1 text-[11px] font-medium text-white">
              {lang === 'zh' ? activeFilter.label[0] : activeFilter.label[1]}
              <span className="num text-white/70">{rows.length}</span>
              <button
                type="button"
                onClick={onClearFilter}
                className="rounded-full p-0.5 transition-colors hover:bg-white/15"
                aria-label={t('清除快捷筛选', 'Clear quick filter')}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <SearchInput value={search} onChange={setSearch} placeholder={t('搜索宾客或编号…', 'Search guest or reference…')} className="w-full sm:w-64" />
          <SelectNative ariaLabel={t('类别', 'Activity')} value={activity} onChange={setActivity} includeAll allLabel={t('全部类别', 'All activities')} options={ACTIVITIES.map((v) => ({ value: v, label: tx(v, lang) }))} />
          <SelectNative ariaLabel={t('状态', 'Status')} value={statusFilter} onChange={setStatusFilter} includeAll allLabel={t('全部状态', 'All statuses')} options={['Confirmed', 'Pending', 'Completed', 'Cancelled', 'No-show'].map((v) => ({ value: v, label: tx(v, lang) }))} />
          <div className="flex items-center gap-1.5">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-[140px] text-[12px]" aria-label={t('开始日期', 'From date')} />
            <span className="text-[11px] text-muted-foreground">{t('至', 'to')}</span>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-[140px] text-[12px]" aria-label={t('结束日期', 'To date')} />
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-[11.5px]" onClick={() => setSortAsc((v) => !v)}>
            <ArrowDownUp className="h-3 w-3" /> {t(`日期（${sortAsc ? '升序' : '降序'}）`, `Date ${sortAsc ? 'asc' : 'desc'}`)}
          </Button>
          {(search || activity !== 'All' || statusFilter !== 'All' || from || to) && (
            <Button variant="ghost" size="sm" className="h-9 text-[11.5px]" onClick={() => { setSearch(''); setActivity('All'); setStatusFilter('All'); setFrom(''); setTo(''); }}>
              {t('清除', 'Clear')}
            </Button>
          )}
        </div>

        {loading && <p className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">{t('正在加载预订…', 'Loading bookings…')}</p>}
        {!loading && rows.length === 0 && (
          <div className="p-4"><EmptyState title={t('没有符合条件的预订', 'No bookings match these filters')} description={t('请调整日期范围或清除筛选条件。', 'Try a different date range or clear the filters.')} /></div>
        )}
        {!loading && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-border/80 text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
                  <th className="px-4 py-2.5 font-semibold">{t('编号', 'Reference')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('到访日期', 'Visit date')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('宾客', 'Guest')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('类别', 'Activity')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('人数', 'Guests')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('教练', 'Instructor')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('预订状态', 'Booking')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('支付状态', 'Payment')}</th>
                  <th className="px-4 py-2.5 text-right font-semibold">{t('操作', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 120).map((b) => (
                  <tr key={b.id} className={cn('border-b border-border/60', b.booking_status === 'Cancelled' && 'opacity-60')}>
                    <td className="num px-4 py-2.5 text-[11.5px] font-semibold text-forest-900">{b.booking_ref}</td>
                    <td className="num px-3 py-2.5 text-[12px] text-forest-900">{prettyDate(b.visit_date, 'd MMM yyyy')}</td>
                    <td className="px-3 py-2.5">
                      <p className="text-[12.5px] font-medium text-forest-900">{b.guest_name}</p>
                      <p className="truncate text-[10.5px] text-muted-foreground">{b.email || b.phone || '—'}</p>
                    </td>
                    <td className="px-3 py-2.5 text-[11.5px] text-forest-900">
                      {tx(b.activity, lang)}
                      {b.lesson_title && <p className="truncate text-[10px] text-muted-foreground">{b.lesson_title}</p>}
                    </td>
                    <td className="num px-3 py-2.5 text-[12px] text-forest-900">{b.guests_count}</td>
                    <td className="px-3 py-2.5 text-[11.5px] text-muted-foreground">{b.instructor_name || '—'}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={b.booking_status} /></td>
                    <td className="px-3 py-2.5"><StatusBadge status={b.payment_status} /></td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onOpen && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 px-2 text-[11px]"
                            onClick={() => onOpen(b)}
                          >
                            {t('管理', 'Manage')} <ArrowRight className="h-3 w-3" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={() => navigate(`/bookings/${b.id}`)}>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        {canWrite && (
                          <>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={() => { setEditing(b); setFormOpen(true); }}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            {b.booking_status !== 'Cancelled' && (
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-rose-600" onClick={() => setCancelTarget(b)}>
                                <Ban className="h-3 w-3" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 120 && (
              <p className="border-t border-border/60 px-4 py-2.5 text-[11px] text-muted-foreground">
                {t(`仅显示前 120 条（共 ${rows.length} 条）——请缩小筛选范围查看更多。`, `Showing the first 120 of ${rows.length} matching bookings — narrow the filters to see more.`)}
              </p>
            )}
          </div>
        )}
      </Panel>

      <BookingDialog open={formOpen} onOpenChange={setFormOpen} booking={editing} lessons={lessons} agents={agents} onSaved={reload} />

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(v) => !v && setCancelTarget(null)}
        title={t('确认取消该预订？', 'Cancel this booking?')}
        description={cancelTarget ? t(`${cancelTarget.booking_ref}（${cancelTarget.guest_name}）将被取消，关联课程名额同步释放。预订记录会保留用于报表。`, `${cancelTarget.booking_ref} for ${cancelTarget.guest_name} will be cancelled and any linked lesson seats released. The booking record is kept for reporting.`) : ''}
        confirmLabel={t('取消预订', 'Cancel booking')}
        onConfirm={cancelBooking}
      />
    </div>
  );
}