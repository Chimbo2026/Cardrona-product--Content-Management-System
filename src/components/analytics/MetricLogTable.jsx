import DataTable from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { sourceLabel } from '@/lib/marketing';
import { NZD, num, pct, prettyDate } from '@/lib/format';

export default function MetricLogTable({ rows, loading, canWrite, onEdit }) {
  const { lang, t } = useLang();

  const columns = [
    {
      key: 'metric_date',
      label: t('日期', 'Date'),
      render: (r) => <span className="num">{prettyDate(r.metric_date)}</span>,
    },
    {
      key: 'campaign',
      label: t('活动', 'Campaign'),
      render: (r) => (
        <div>
          <p className="font-medium">{r.campaign}</p>
          <p className="text-[10.5px] text-muted-foreground">{sourceLabel(r.source, lang)}</p>
        </div>
      ),
    },
    { key: 'sessions', label: t('访问量', 'Sessions'), align: 'right', render: (r) => <span className="num">{num(r.sessions)}</span> },
    { key: 'conversions', label: t('转化', 'Conversions'), align: 'right', render: (r) => <span className="num">{num(r.conversions)}</span> },
    {
      key: 'bounce_rate',
      label: t('跳出率', 'Bounce rate'),
      align: 'right',
      render: (r) => (
        <span className={`num ${Number(r.bounce_rate) > 55 ? 'text-rose-600' : 'text-forest-900'}`}>{pct(r.bounce_rate, 1)}</span>
      ),
    },
    { key: 'revenue', label: t('营收', 'Revenue'), align: 'right', render: (r) => <span className="num">{NZD(r.revenue)}</span> },
    { key: 'logged_by', label: t('记录人', 'Logged by'), render: (r) => r.logged_by || '—' },
    ...(canWrite
      ? [{
          key: 'actions',
          label: '',
          align: 'right',
          render: (r) => (
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11.5px]" onClick={() => onEdit(r)}>
              <Pencil className="h-3 w-3" /> {t('编辑', 'Edit')}
            </Button>
          ),
        }]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      loading={loading}
      compact
      emptyTitle={t('暂无营销记录', 'No marketing metrics yet')}
      emptyDescription={t('添加记录后即可查看渠道来源、流量与跳出率分析。', 'Log a metric to start tracking sources, traffic and bounce rate.')}
    />
  );
}