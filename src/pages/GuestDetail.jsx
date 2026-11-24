import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, StickyNote, UserCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import GuestCheckInPanel from '@/components/guests/GuestCheckInPanel';
import PreArrivalCheckInDialog from '@/components/guests/PreArrivalCheckInDialog';
import { useRole } from '@/lib/RoleContext';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { NZD, prettyDate } from '@/lib/format';

export default function GuestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const { can } = useRole();
  const canWrite = can('guests', 'write');
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [guest, setGuest] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [passes, setPasses] = useState([]);
  const [rentals, setRentals] = useState([]);

  const loadGuest = async () => {
    const g = await base44.entities.Guest.get(id);
    setGuest(g);
  };

  useEffect(() => {
    const load = async () => {
      const g = await base44.entities.Guest.get(id);
      setGuest(g);
      const [b, p, r] = await Promise.all([
        base44.entities.Booking.filter({ guest_id: id }, { sort: '-visit_date', limit: 100 }),
        base44.entities.LiftPass.filter({ guest_id: id }, { sort: '-valid_from', limit: 50 }),
        base44.entities.RentalOrder.filter({ guest_id: id }, { sort: '-date_out', limit: 50 }),
      ]);
      setBookings(b?.items || []);
      setPasses(p?.items || []);
      setRentals(r?.items || []);
    };
    load();
  }, [id]);

  // guest card status shown in the header: readiness for arrival takes priority
  const cardStatus = guest?.checkin_status === 'Ready for arrival' ? 'Ready for arrival' : guest?.email ? 'Active' : 'Unused';

  if (!guest) {
    return <div className="py-20 text-center text-[13px] text-muted-foreground">{t('正在加载宾客…', 'Loading guest…')}</div>;
  }

  const spend = bookings
    .filter((b) => b.booking_status !== 'Cancelled')
    .reduce((s, b) => s + (Number(b.amount) || 0) * (Number(b.guests_count) || 1), 0);
  const lastVisit = bookings[0]?.visit_date;

  return (
    <div>
      <button onClick={() => navigate('/guests')} className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-forest-900">
        <ArrowLeft className="h-3.5 w-3.5" /> {t('返回宾客列表', 'Back to guests')}
      </button>

      <PageHeader
        eyebrow={t('宾客档案', 'Guest history')}
        title={guest.full_name}
        description={`${guest.country || t('地区未知', 'Region unknown')} · ${t(`${bookings.length} 条演示预订记录`, `${bookings.length} demo bookings on record`)}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={cardStatus} dot={false} />
            {canWrite && (
              <Button size="sm" className="gap-1.5" onClick={() => setCheckInOpen(true)}>
                <UserCheck className="h-3.5 w-3.5" /> {t('预抵达登记', 'Pre-Arrival Check-In')}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <Panel title={t('联系方式', 'Contact')}>
            <ul className="space-y-2.5 text-[12.5px]">
              <li className="flex items-center gap-2 text-forest-900"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {guest.email || '—'}</li>
              <li className="flex items-center gap-2 text-forest-900"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {guest.phone || '—'}</li>
              <li className="flex items-center gap-2 text-forest-900"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {guest.country || '—'}</li>
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/70 pt-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('演示消费额', 'Demo spend')}</p>
                <p className="num text-[15px] font-semibold text-forest-950">{NZD(spend)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('上次到访', 'Last visit')}</p>
                <p className="text-[13px] font-medium text-forest-950">{prettyDate(lastVisit || guest.last_visit)}</p>
              </div>
            </div>
          </Panel>

          {canWrite && <GuestCheckInPanel guest={guest} onStart={() => setCheckInOpen(true)} />}

          <Panel title={t('宾客备注', 'Guest notes')}>
            {guest.notes ? (
              <p className="flex gap-2 text-[12.5px] leading-relaxed text-forest-900">
                <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" /> {guest.notes}
              </p>
            ) : (
              <p className="text-[12px] text-muted-foreground">{t('该宾客暂无备注。', 'No notes recorded for this guest.')}</p>
            )}
          </Panel>

          <Panel title={t('缆车票', 'Lift passes')}>
            {passes.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">{t('暂无已发放票券。', 'No passes issued.')}</p>
            ) : (
              <ul className="space-y-2.5">
                {passes.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2">
                    <span>
                      <span className="block text-[12.5px] font-medium text-forest-900">{tx(p.pass_type, lang)}</span>
                      <span className="text-[10.5px] text-muted-foreground">{prettyDate(p.valid_from)} → {prettyDate(p.valid_to)}</span>
                    </span>
                    <StatusBadge status={p.usage_status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-4 lg:col-span-3">
          <Panel title={t('预订历史', 'Booking history')} description={t('与该宾客关联的全部演示预订', 'All demonstration bookings linked to this guest')} bodyClassName="p-0">
            <DataTable
              compact
              columns={[
                { key: 'booking_ref', label: t('编号', 'Reference'), render: (b) => <span className="font-mono text-[11.5px]">{b.booking_ref}</span> },
                { key: 'visit_date', label: t('到访', 'Visit'), render: (b) => prettyDate(b.visit_date) },
                { key: 'activity', label: t('产品', 'Product'), render: (b) => tx(b.activity, lang) },
                { key: 'guests_count', label: t('人数', 'Guests'), align: 'right' },
                { key: 'amount', label: t('金额', 'Value'), align: 'right', render: (b) => <span className="num">{NZD(b.amount)}</span> },
                { key: 'payment_status', label: t('支付', 'Payment'), render: (b) => <StatusBadge status={b.payment_status} dot={false} /> },
                { key: 'booking_status', label: t('状态', 'Status'), render: (b) => <StatusBadge status={b.booking_status} /> },
              ]}
              rows={bookings}
              onRowClick={(b) => navigate(`/bookings/${b.id}`)}
              emptyTitle={t('暂无预订', 'No bookings yet')}
              emptyDescription={t('从预订模块创建预订，即可生成该宾客的历史记录。', 'Create a booking from the bookings module to build this guest\'s history.')}
              emptyAction={<Link to="/bookings" className="text-[12px] font-medium text-forest-700">{t('前往预订管理 →', 'Go to bookings →')}</Link>}
            />
          </Panel>

          <Panel title={t('租赁历史', 'Rental history')} bodyClassName="p-0">
            <DataTable
              compact
              columns={[
                { key: 'order_ref', label: t('订单', 'Order'), render: (r) => <span className="font-mono text-[11.5px]">{r.order_ref}</span> },
                { key: 'date_out', label: t('借出', 'Out'), render: (r) => prettyDate(r.date_out) },
                { key: 'date_due', label: t('到期', 'Due'), render: (r) => prettyDate(r.date_due) },
                { key: 'items_summary', label: t('装备', 'Equipment'), render: (r) => <span className="text-muted-foreground">{r.items_summary || '—'}</span> },
                { key: 'total', label: t('合计', 'Total'), align: 'right', render: (r) => <span className="num">{NZD(r.total)}</span> },
                { key: 'status', label: t('状态', 'Status'), render: (r) => <StatusBadge status={r.status} /> },
              ]}
              rows={rentals}
              emptyTitle={t('暂无租赁记录', 'No rentals on record')}
              emptyDescription={t('在租赁柜台创建的订单会显示在这里。', 'Rental orders raised at the rental desk will appear here.')}
            />
          </Panel>
        </div>
      </div>

      <PreArrivalCheckInDialog
        guest={guest}
        open={checkInOpen}
        onOpenChange={setCheckInOpen}
        onComplete={loadGuest}
      />
    </div>
  );
}