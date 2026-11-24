import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ModuleHeader from '@/components/common/ModuleHeader';
import Panel from '@/components/common/Panel';
import { SelectNative, DemoChip } from '@/components/common/Controls';
import MarketingCharts from '@/components/analytics/MarketingCharts';
import MetricLogTable from '@/components/analytics/MetricLogTable';
import MetricDialog from '@/components/analytics/MetricDialog';
import useList from '@/hooks/useList';
import { useRole } from '@/lib/RoleContext';
import { useLang } from '@/lib/i18n';
import { MARKETING_SOURCES, sourceLabel } from '@/lib/marketing';
import { NZD, addDaysISO, num, prettyDate, todayISO } from '@/lib/format';

const HERO = 'https://images.ctfassets.net/2atbvuhykqrn/7Hu2v7zuUle1o9fQEaIq43/5d434b9b7fe77db068e60d8d9c7738e7/W24-Mountains_TC_Hero_Desktop.webp?w=1600&fm=webp&q=75';

export default function Analytics() {
  const { can } = useRole();
  const { lang, t } = useLang();
  const canWrite = can('analytics', 'write');

  const { items: metrics, loading, reload } = useList('MarketingMetric', {}, { sort: '-metric_date', limit: 600 });

  const [start, setStart] = useState(addDaysISO(-60));
  const [end, setEnd] = useState(todayISO());
  const [source, setSource] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(
    () => metrics.filter((m) => {
      if (m.metric_date && (m.metric_date < start || m.metric_date > end)) return false;
      if (source !== 'All' && m.source !== source) return false;
      return true;
    }),
    [metrics, start, end, source]
  );

  const totals = useMemo(() => {
    const sessions = rows.reduce((s, m) => s + (Number(m.sessions) || 0), 0);
    const visitors = rows.reduce((s, m) => s + (Number(m.new_visitors) || 0), 0);
    const conversions = rows.reduce((s, m) => s + (Number(m.conversions) || 0), 0);
    const revenue = rows.reduce((s, m) => s + (Number(m.revenue) || 0), 0);
    const bounceSum = rows.reduce((s, m) => s + (Number(m.sessions) || 0) * (Number(m.bounce_rate) || 0), 0);
    return {
      sessions,
      visitors,
      conversions,
      revenue,
      bounce: sessions ? bounceSum / sessions : 0,
      cvr: sessions ? (conversions / sessions) * 100 : 0,
    };
  }, [rows]);

  const sourceRows = useMemo(() => {
    const map = {};
    rows.forEach((m) => {
      const key = m.source || 'Other';
      const entry = map[key] || { name: key, sessions: 0, conversions: 0, bounceSum: 0 };
      entry.sessions += Number(m.sessions) || 0;
      entry.conversions += Number(m.conversions) || 0;
      entry.bounceSum += (Number(m.sessions) || 0) * (Number(m.bounce_rate) || 0);
      map[key] = entry;
    });
    return Object.values(map)
      .map((e) => ({
        label: sourceLabel(e.name, lang),
        sessions: e.sessions,
        conversions: e.conversions,
        bounce: e.sessions ? Math.round(e.bounceSum / e.sessions) : 0,
      }))
      .sort((a, b) => b.sessions - a.sessions);
  }, [rows, lang]);

  const trend = useMemo(() => {
    const map = {};
    rows.forEach((m) => {
      if (!m.metric_date) return;
      map[m.metric_date] = (map[m.metric_date] || 0) + (Number(m.sessions) || 0);
    });
    return Object.keys(map)
      .sort()
      .map((k) => ({ date: k.slice(5), sessions: map[k] }))
      .slice(-16);
  }, [rows]);

  const bounceRows = useMemo(() => [...sourceRows].sort((a, b) => b.bounce - a.bounce), [sourceRows]);

  const cards = [
    { label: t('访问量', 'Sessions'), value: num(totals.sessions), sub: t(`${num(totals.visitors)} 位新访客`, `${num(totals.visitors)} new visitors`) },
    { label: t('转化率', 'Conversion rate'), value: `${totals.cvr.toFixed(1)}%`, sub: t(`${num(totals.conversions)} 次转化`, `${num(totals.conversions)} conversions`) },
    { label: t('平均跳出率', 'Avg. bounce rate'), value: `${totals.bounce.toFixed(1)}%`, sub: t('按访问量加权', 'Weighted by sessions'), warn: totals.bounce > 55 },
    { label: t('营销营收', 'Attributed revenue'), value: NZD(totals.revenue), sub: t('归因至营销活动', 'Attributed to campaigns') },
  ];

  const openAdd = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (row) => { setEditing(row); setDialogOpen(true); };

  return (
    <div>
      <ModuleHeader
        image={HERO}
        eyebrow={t('营销分析', 'Marketing analytics')}
        title={t('营销分析', 'Analytics')}
        description={t('追踪活动来源、流量与跳出率，并由市场团队记录每周营销指标。', 'Track campaign sources, traffic and bounce rates, with weekly marketing metrics logged by the team.')}
        actions={canWrite ? (
          <Button size="sm" className="gap-1.5 bg-white text-forest-900 hover:bg-white/90" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5" /> {t('新增记录', 'Log metric')}
          </Button>
        ) : null}
      />

      <Panel className="mb-4" bodyClassName="p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('开始日期', 'Start date')}</p>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="h-9 w-[150px] text-[12px]" />
          </div>
          <div>
            <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('结束日期', 'End date')}</p>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="h-9 w-[150px] text-[12px]" />
          </div>
          <SelectNative
            ariaLabel={t('渠道来源', 'Campaign source')}
            value={source}
            onChange={setSource}
            includeAll
            allLabel={t('全部来源', 'All sources')}
            options={MARKETING_SOURCES.map((v) => ({ value: v, label: sourceLabel(v, lang) }))}
            className="h-9"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-[11.5px]"
            onClick={() => { setStart(addDaysISO(-60)); setEnd(todayISO()); setSource('All'); }}
          >
            {t('重置', 'Reset')}
          </Button>
          <span className="ml-auto"><DemoChip>{t('演示流量数据', 'Demo traffic data')}</DemoChip></span>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {t(`显示 ${prettyDate(start)} – ${prettyDate(end)} · ${rows.length} 条营销记录`, `Showing ${prettyDate(start)} – ${prettyDate(end)} · ${rows.length} marketing records`)}
        </p>
      </Panel>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border/80 bg-card px-4 py-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{c.label}</p>
            <p className={`num mt-1 text-[20px] font-semibold ${c.warn ? 'text-rose-600' : 'text-forest-950'}`}>{c.value}</p>
            <p className="mt-0.5 text-[10.5px] text-muted-foreground">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <MarketingCharts sourceRows={sourceRows} trend={trend} bounceRows={bounceRows} totalSessions={totals.sessions} />
      </div>

      <Panel
        title={t('营销指标记录', 'Marketing metrics log')}
        description={t('市场团队记录的渠道、流量与跳出率数据', 'Channel, traffic and bounce-rate figures logged by the marketing team')}
        bodyClassName="p-0"
        action={canWrite ? (
          <Button size="sm" variant="outline" className="h-8 gap-1 text-[11.5px]" onClick={openAdd}>
            <Plus className="h-3 w-3" /> {t('添加', 'Add')}
          </Button>
        ) : null}
      >
        <MetricLogTable rows={rows} loading={loading} canWrite={canWrite} onEdit={openEdit} />
      </Panel>

      <MetricDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        metric={editing}
        onSaved={reload}
      />
    </div>
  );
}