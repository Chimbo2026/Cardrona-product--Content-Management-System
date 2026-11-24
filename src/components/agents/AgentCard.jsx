import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import StatusBadge from '@/components/common/StatusBadge';
import { useLang } from '@/lib/i18n';
import { NZD, num } from '@/lib/format';

export default function AgentCard({ agent, stats, canWrite, onEdit }) {
  const { t } = useLang();
  return (
    <article className="group overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_1px_2px_rgba(46,12,10,0.05)]">
      <div className="relative h-[132px] w-full overflow-hidden bg-forest-950">
        {agent.photo_url ? (
          <Image src={agent.photo_url} alt={agent.company_name} fittingType="fill" className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-forest-950">
            <span className="font-heading text-[26px] font-bold tracking-tight text-white/25">
              {(agent.company_name || '?').split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/25 to-transparent" />
        <div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-heading text-[14px] font-semibold text-white">{agent.company_name}</p>
            <p className="truncate text-[10.5px] text-white/75">{agent.market}</p>
          </div>
          <span className="shrink-0 rounded-full bg-ice-500 px-2 py-1 text-[10px] font-bold text-white">
            {t(`-${agent.discount_rate}%`, `-${agent.discount_rate}%`)}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="num text-[10.5px] font-semibold tracking-[0.08em] text-muted-foreground">{agent.agent_code}</span>
          <StatusBadge status={agent.status} />
        </div>

        <dl className="grid grid-cols-3 gap-2 border-y border-border/60 py-2.5">
          <div>
            <dt className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('订单', 'Orders')}</dt>
            <dd className="num text-[13px] font-semibold text-forest-950">{num(stats.orders)}</dd>
          </div>
          <div>
            <dt className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('交易额', 'Gross')}</dt>
            <dd className="num text-[13px] font-semibold text-forest-950">{NZD(stats.gross)}</dd>
          </div>
          <div>
            <dt className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('净额', 'Net')}</dt>
            <dd className="num text-[13px] font-semibold text-forest-950">{NZD(stats.net)}</dd>
          </div>
        </dl>

        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[11px] text-muted-foreground">
            {agent.contact_name} · {agent.phone || agent.email || '—'}
          </p>
          {canWrite && (
            <Button variant="ghost" size="sm" className="h-7 shrink-0 px-2 text-[11px]" onClick={onEdit}>
              <Pencil className="h-3 w-3" />
              <span className="sr-only">{t('编辑代理', 'Edit agent')}</span>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}