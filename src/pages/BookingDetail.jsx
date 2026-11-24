import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, CheckCircle2, Mail, Phone, Receipt, ShieldCheck, Ticket, UserRound, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useRole } from '@/lib/RoleContext';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { NZD, prettyDate, prettyDateTime } from '@/lib/format';
import EmptyState from '@/components/common/EmptyState';
import StripePaymentPanel from '@/components/payments/StripePaymentPanel';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can } = useRole();
  const { lang, t } = useLang();
  const canWrite = can('bookings', 'write');

  const [booking, setBooking] = useState(null);
  const [txns, setTxns] = useState([]);
  const [passes, setPasses] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const load = async () => {
    const b = await base44.entities.Booking.get(id);
    setBooking(b);
    const [tr, p, rf] = await Promise.all([
      base44.entities.Transaction.filter({ booking_ref: b.booking_ref }, { limit: 20 }),
      b.guest_id ? base44.entities.LiftPass.filter({ guest_id: b.guest_id }, { limit: 10 }) : { items: [] },
      base44.entities.RefundRequest.filter({ booking_id: b.id }, { limit: 20 }),
    ]);
    setTxns(tr?.items || []);
    setPasses(p?.items || []);
    setRefunds(rf?.items || []);
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!booking) {
    return <div className="py-20 text-center text-[13px] text-muted-foreground">{t('正在加载预订…', 'Loading booking…')}</div>;
  }

  const update = async (patch, message) => {
    await base44.entities.Booking.update(booking.id, patch);
    toast({ title: message, description: booking.booking_ref });
    load();
  };

  const total = (Number(booking.amount) || 0) * (Number(booking.guests_count) || 1);

  return (
    <div>
      <button onClick={() => navigate('/bookings')} className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-forest-900">
        <ArrowLeft className="h-3.5 w-3.5" /> {t('返回预订列表', 'Back to bookings')}
      </button>

      <PageHeader
        eyebrow={`${t('预订', 'Booking')} · ${tx(booking.channel, lang) || '—'}`}
        title={booking.booking_ref}
        description={`${tx(booking.activity, lang)} · ${booking.guest_name} · ${prettyDate(booking.visit_date)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={booking.booking_status} />
            <StatusBadge status={booking.payment_status} dot={false} />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:grid-cols-1 lg:col-span-2">
          <Panel title={t('到访信息', 'Visit details')}>
            <dl className="grid gap-4 sm:grid-cols-3">
              {[
                [t('到访日期', 'Visit date'), prettyDate(booking.visit_date)],
                [t('人数', 'Guests'), booking.guests_count],
                [t('季节', 'Season'), booking.season ? tx(booking.season, lang) : '—'],
                [t('产品', 'Product'), tx(booking.activity, lang)],
                [t('缆车票类型', 'Lift pass type'), booking.pass_type ? tx(booking.pass_type, lang) : '—'],
                [t('课程类型', 'Lesson'), booking.lesson_type ? tx(booking.lesson_type, lang) : '—'],
                [t('租赁需求', 'Rental requirements'), booking.rental_notes || '—'],
                [t('预订渠道', 'Booking channel'), booking.channel ? tx(booking.channel, lang) : '—'],
                [t('支付方式', 'Payment method'), booking.payment_method ? tx(booking.payment_method, lang) : '—'],
                [t('渠道代理', 'Selling agent'), booking.agent_name ? `${booking.agent_name} · -${booking.agent_discount || 0}%` : '—'],
                [t('创建时间', 'Created'), prettyDateTime(booking.created_date)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</dt>
                  <dd className="mt-0.5 text-[13px] text-forest-900">{value}</dd>
                </div>
              ))}
            </dl>
            {booking.notes && (
              <div className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-[12.5px] text-forest-900">{booking.notes}</div>
            )}
          </Panel>

          <Panel title={t('支付概要', 'Payment summary')} description={t('以 NZD 计价，Stripe 结账时按所选货币换算', 'Priced in NZD, converted to the checkout currency')}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('单价', 'Unit value')}</p>
                <p className="num mt-0.5 text-[15px] font-semibold text-forest-950">{NZD(booking.amount)}</p>
              </div>
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('人数', 'Guests')}</p>
                <p className="num mt-0.5 text-[15px] font-semibold text-forest-950">× {booking.guests_count}</p>
              </div>
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('预订总额', 'Booking total')}</p>
                <p className="num mt-0.5 text-[15px] font-semibold text-forest-950">{NZD(total)}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('关联交易', 'Linked transactions')}</p>
              {txns.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-[12px] text-muted-foreground">
                  {t('该编号暂无演示交易记录。', 'No demo transaction recorded for this reference yet.')}
                </p>
              ) : (
                <ul className="divide-y divide-border/70">
                  {txns.map((tr) => (
                    <li key={tr.id} className="flex items-center justify-between py-2 text-[12.5px]">
                      <span className="flex items-center gap-2 text-forest-900">
                        <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                        {tr.reference} · {tx(tr.category, lang)}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground">{prettyDate(tr.date)}</span>
                        <span className="num font-medium">{NZD(tr.amount)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>

          <StripePaymentPanel booking={booking} canWrite={canWrite} onPaid={load} />

          {refunds.length > 0 && (
            <Panel title={t('退款记录', 'Refunds')} description={t('退款将原路退回并自动扣减营收', 'Returned to the original method and deducted from revenue')}>
              <ul className="divide-y divide-border/70">
                {refunds.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-[12.5px]">
                    <span className="num text-forest-900">
                      {r.request_ref} · {NZD(r.amount)} · {tx(r.method, lang)}
                    </span>
                    <StatusBadge status={r.status} dot={false} />
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {canWrite && (
            <Panel title={t('快捷操作', 'Quick actions')} description={t('仅更新此演示记录', 'Updates apply to this demonstration record only')}>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  disabled={booking.booking_status === 'Confirmed'}
                  onClick={() => update({ booking_status: 'Confirmed' }, t('预订已确认', 'Booking confirmed'))}
                >
                  <BadgeCheck className="h-3.5 w-3.5" /> {t('确认预订', 'Confirm booking')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  disabled={booking.payment_status === 'Paid'}
                  onClick={() => update({ payment_status: 'Paid' }, t('已标记收到付款', 'Payment marked as received'))}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> {t('标记为已支付', 'Mark as paid')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  disabled={booking.booking_status === 'Completed'}
                  onClick={() => update({ booking_status: 'Completed' }, t('预订已完成', 'Booking completed'))}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> {t('标记为已完成', 'Mark completed')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-rose-600 hover:text-rose-700"
                  disabled={booking.booking_status === 'Cancelled'}
                  onClick={() => setConfirmCancel(true)}
                >
                  <XCircle className="h-3.5 w-3.5" /> {t('取消预订', 'Cancel booking')}
                </Button>
              </div>
            </Panel>
          )}
        </div>

        <div className="space-y-4">
          <Panel title={t('宾客', 'Guest')}>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-100 text-forest-800">
                <UserRound className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-forest-900">{booking.guest_name}</p>
                <p className="flex items-center gap-1.5 truncate text-[11.5px] text-muted-foreground">
                  <Mail className="h-3 w-3" /> {booking.email || '—'}
                </p>
                <p className="flex items-center gap-1.5 truncate text-[11.5px] text-muted-foreground">
                  <Phone className="h-3 w-3" /> {booking.phone || '—'}
                </p>
              </div>
            </div>
            {booking.guest_id && (
              <Link
                to={`/guests/${booking.guest_id}`}
                className="mt-3 inline-block text-[11.5px] font-medium text-forest-700 hover:text-forest-900"
              >
                {t('查看宾客档案 →', 'Open guest history →')}
              </Link>
            )}
          </Panel>

          <Panel title={t('宾客信息与免责声明', 'Guest identity & waiver')} description={t('姓名需与护照一致', 'Name must match the passport')}>
            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('出生日期', 'Date of birth')}</dt>
                <dd className="num mt-0.5 text-[12.5px] text-forest-900">{booking.guest_dob ? prettyDate(booking.guest_dob) : '—'}</dd>
              </div>
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('国家 / 地区', 'Country')}</dt>
                <dd className="mt-0.5 text-[12.5px] text-forest-900">{booking.guest_country || '—'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('护照拼音姓名', 'Pinyin name')}</dt>
                <dd className="mt-0.5 text-[12.5px] font-medium text-forest-900">{booking.pinyin_name || '—'}</dd>
              </div>
            </dl>
            <div className={`mt-3 flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11.5px] font-medium ${booking.waiver_signed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              <ShieldCheck className="h-3.5 w-3.5" />
              {booking.waiver_signed
                ? t('电子免责声明已签署', 'Digital waiver signed')
                : t('电子免责声明待签署', 'Digital waiver outstanding')}
            </div>
          </Panel>

          <Panel title={t('关联缆车票', 'Linked lift passes')} description={t(`该宾客档案下有 ${passes.length} 张票`, `${passes.length} on this guest record`)}>
            {passes.length === 0 ? (
              <EmptyState icon={Ticket} title={t('暂无关联票券', 'No passes linked')} description={t('请从缆车票模块发放票券。', 'Issue a lift pass from the pass module.')} className="border-0 py-6" />
            ) : (
              <ul className="space-y-2.5">
                {passes.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2">
                    <span>
                      <span className="block text-[12.5px] font-medium text-forest-900">{tx(p.pass_type, lang)}</span>
                      <span className="font-mono text-[10.5px] text-muted-foreground">{p.pass_number}</span>
                    </span>
                    <StatusBadge status={p.usage_status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title={t('确认取消该预订？', 'Cancel this booking?')}
        description={t('预订将标记为已取消；若已支付，演示数据中的金额将标记为已退款。', 'The booking will be marked cancelled and any paid amount flagged as refunded in the demo data.')}
        confirmLabel={t('取消预订', 'Cancel booking')}
        onConfirm={async () => {
          setConfirmCancel(false);
          await update(
            { booking_status: 'Cancelled', payment_status: booking.payment_status === 'Paid' ? 'Refunded' : booking.payment_status },
            t('预订已取消', 'Booking cancelled')
          );
        }}
      />
    </div>
  );
}