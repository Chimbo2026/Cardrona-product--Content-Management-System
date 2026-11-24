import { useEffect, useState } from 'react';
import { Clock, MapPin, Ticket, Wallet } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Panel from '@/components/common/Panel';
import StatusBadge from '@/components/common/StatusBadge';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { prettyDate } from '@/lib/format';

export default function CollectionPanel({ booking }) {
  const { lang, t } = useLang();
  const [passes, setPasses] = useState([]);

  useEffect(() => {
    let alive = true;
    const query = booking.guest_id
      ? { guest_id: booking.guest_id }
      : { guest_name: booking.guest_name };
    base44.entities.LiftPass.filter(query, { limit: 20 }).then((res) => {
      if (alive) setPasses(res?.items || (Array.isArray(res) ? res : []));
    });
    return () => {
      alive = false;
    };
  }, [booking.id, booking.guest_id, booking.guest_name]);

  const steps = [
    {
      icon: MapPin,
      label: t('取票地点', 'Pick-up point'),
      value: t('基地大厅票务柜台（Cardrona base area Ticket Office）', 'Cardrona base area Ticket Office'),
    },
    {
      icon: Clock,
      label: t('开放时间', 'Opening hours'),
      value: t('每日 8:00–17:00（雪季）', 'Daily 8:00–17:00 during snow season'),
    },
    {
      icon: Wallet,
      label: t('需携带', 'Bring with you'),
      value: t('预订编号、护照或身份证件、已签署的免责声明', 'Your booking reference, photo ID and signed waiver'),
    },
  ];

  return (
    <Panel
      title={t('门票与取票指引', 'Tickets & collection instructions')}
      description={t('到访当天凭预订编号领取门票。', 'Collect your tickets with your booking reference on arrival.')}
    >
      <div className="space-y-2">
        {passes.length === 0 ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/70 px-3 py-2">
            <Ticket className="h-4 w-4 shrink-0 text-forest-600" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-forest-900">
                {(booking.pass_type ? tx(booking.pass_type, lang) : tx(booking.activity, lang))} × {booking.guests_count || 1}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {t('到访当天取票', 'Collect on')} · {prettyDate(booking.visit_date)}
              </p>
            </div>
            <StatusBadge status={booking.payment_status === 'Paid' ? 'Issued' : 'Pending'} dot={false} />
          </div>
        ) : (
          passes.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border/70 px-3 py-2">
              <Ticket className="h-4 w-4 shrink-0 text-forest-600" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-forest-900">
                  {tx(p.pass_type, lang) || t('缆车票', 'Lift pass')}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {p.pass_number} · {prettyDate(p.valid_from)} – {prettyDate(p.valid_to)}
                </p>
              </div>
              <StatusBadge status={p.usage_status || p.issue_status} dot={false} />
            </div>
          ))
        )}
      </div>

      <ul className="mt-3 space-y-2.5 border-t border-border/60 pt-3">
        {steps.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-700">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-forest-900">{value}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
        {t(
          '也可使用自助取票机：扫描确认单上的二维码或输入预订编号即可取票。',
          'Self-service kiosks are also available: scan the QR code on your confirmation or enter your booking reference.'
        )}
      </p>
    </Panel>
  );
}