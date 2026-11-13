import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Panel from '@/components/common/Panel';
import EmptyState from '@/components/common/EmptyState';
import { useLang } from '@/lib/i18n';
import { NZD, num, prettyDateTime } from '@/lib/format';
import { salesByCategory, salesByProduct, salesTotals, withinDays } from '@/lib/retail';

const PERIODS = [7, 30, 90];

export default function SalesReport({ sales }) {
  const { t } = useLang();
  const [days, setDays] = useState(30);

  const scoped = useMemo(() => withinDays(sales, days), [sales, days]);
  const totals = salesTotals(scoped);
  const topProducts = salesByProduct(scoped).slice(0, 7);
  const categories = salesByCategory(scoped);
  const categoryTotal = categories.reduce((s, c) => s + c.revenue, 0) || 1;
  const recent = [...scoped]
    .sort((a, b) => new Date(b.sold_at || b.created_date) - new Date(a.sold_at || a.created_date))
    .slice(0, 6);

  const chartData = topProducts.map((p) => ({
    name: p.name.length > 18 ? `${p.name.slice(0, 17)}…` : p.name,
    revenue: Math.round(p.revenue),
  }));

  return (
    <div className="grid gap-3 xl:grid-cols-2">
      <Panel
        title={t('商品销售排行', 'Top selling products')}
        description={t('按零售营收排序', 'Ranked by store revenue')}
        action={
          <div className="flex gap-1 rounded-lg border border-border p-0.5">
            {PERIODS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  days === d ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-forest-900'
                }`}
              >
                {t(`${d} 天`, `${d}d`)}
              </button>
            ))}
          </div>
        }
      >
        <div className="mb-3 grid grid-cols-3 gap-2">
          {[
            [t('营收', 'Revenue'), NZD(totals.revenue)],
            [t('售出件数', 'Units sold'), num(totals.units)],
            [t('交易笔数', 'Transactions'), num(totals.orders)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-muted/50 px-2.5 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
              <p className="num mt-0.5 text-[14px] font-semibold text-forest-900">{value}</p>
            </div>
          ))}
        </div>

        {chartData.length ? (
          <div className="h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={10} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="name" width={132} tickLine={false} axisLine={false} fontSize={10} />
                <Tooltip
                  formatter={(value) => [NZD(value), t('营收', 'Revenue')]}
                  contentStyle={{ fontSize: 11, borderRadius: 8, borderColor: 'hsl(var(--border))' }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title={t('该时段暂无销售', 'No sales in this period')} description={t('记录第一笔零售销售即可看到排行。', 'Record a retail sale to see the ranking.')} />
        )}
      </Panel>

      <div className="grid gap-3">
        <Panel title={t('品类占比', 'Sales by category')} description={t(`近 ${days} 天`, `Last ${days} days`)}>
          {categories.length ? (
            <div className="space-y-2.5">
              {categories.slice(0, 6).map((c) => (
                <div key={c.name}>
                  <div className="flex items-baseline justify-between text-[11.5px]">
                    <span className="font-medium text-forest-900">{c.name}</span>
                    <span className="num text-muted-foreground">
                      {NZD(c.revenue)} · {Math.round((c.revenue / categoryTotal) * 100)}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-forest-600" style={{ width: `${(c.revenue / categoryTotal) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-muted-foreground">{t('暂无数据', 'No data yet')}</p>
          )}
        </Panel>

        <Panel title={t('最近交易', 'Recent transactions')} bodyClassName="p-0">
          {recent.length ? (
            <ul className="divide-y divide-border/70">
              {recent.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-[12px] font-medium text-forest-900">{s.product_name}</p>
                    <p className="text-[10.5px] text-muted-foreground">
                      {prettyDateTime(s.sold_at)} · {s.channel} · {s.payment_method}
                    </p>
                  </div>
                  <span className="num shrink-0 text-[12px] font-semibold text-forest-900">
                    {s.quantity > 1 ? `${s.quantity} × ` : ''}
                    {NZD(s.total)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-5 text-center text-[12px] text-muted-foreground">{t('暂无交易', 'No transactions yet')}</p>
          )}
        </Panel>
      </div>
    </div>
  );
}