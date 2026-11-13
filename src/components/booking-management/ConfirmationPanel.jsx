import Panel from '@/components/common/Panel';
import StatusBadge from '@/components/common/StatusBadge';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { NZD, prettyDate } from '@/lib/format';

export default function ConfirmationPanel({ booking }) {
  const { lang, t } = useLang();
  const total = (Number(booking.amount) || 0) * (Number(booking.guests_count) || 1);

  const details = [
    [t('宾客姓名', 'Guest'), booking.guest_name],
    [t('到访日期', 'Visit date'), prettyDate(booking.visit_date)],
    [t('人数', 'Guests'), booking.guests_count || 1],
    [t('产品', 'Product'), tx(booking.activity, lang)],
    [t('缆车票类型', 'Lift pass type'), booking.pass_type ? tx(booking.pass_type, lang) : '—'],
    [t('课程', 'Lesson'), booking.lesson_title || (booking.lesson_type ? tx(booking.lesson_type, lang) : '—')],
    [t('教练', 'Instructor'), booking.instructor_name || '—'],
    [t('预订渠道', 'Booking channel'), booking.channel ? tx(booking.channel, lang) : '—'],
    [
      t('付款条款', 'Payment terms'),
      `${tx(booking.payment_terms || 'Pay now', lang)}${booking.payment_due_date ? ` · ${prettyDate(booking.payment_due_date)}` : ''}`,
    ],
    ...(Number(booking.voucher_amount) > 0
      ? [[t('礼券抵扣', 'Gift voucher'), `${booking.voucher_code} · ${NZD(Number(booking.voucher_amount))}`]]
      : []),
  ];

  return (
    <Panel title={t('确认单', 'Confirmation')} description={t('到访前请核对以下信息。', 'Check these details before you arrive.')}>
      <div className="rounded-xl border border-dashed border-border bg-muted/25 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2.5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t('预订编号', 'Booking reference')}
            </p>
            <p className="font-mono text-[14px] font-semibold text-forest-950">{booking.booking_ref}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={booking.booking_status} />
            <StatusBadge status={booking.payment_status} dot={false} />
          </div>
        </div>

        <dl className="mt-3 grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 text-[12.5px] text-forest-900">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-2 border-t border-border/70 pt-2.5">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {t('支付方式', 'Payment method')}
            </p>
            <p className="mt-0.5 text-[12.5px] text-forest-900">
              {booking.payment_method ? tx(booking.payment_method, lang) : '—'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {t('预订总额', 'Booking total')}
            </p>
            <p className="num text-[16px] font-semibold text-forest-950">{NZD(total)}</p>
          </div>
        </div>
      </div>

      <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
        {t(
          '请保存此确认单，取票与入场时需出示预订编号。',
          'Keep this confirmation — your booking reference is required at collection and entry.'
        )}
      </p>
    </Panel>
  );
}