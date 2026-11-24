import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import Panel from '@/components/common/Panel';
import { useLang } from '@/lib/i18n';
import { num } from '@/lib/format';

const COLORS = ['#8E2721', '#C94F45', '#B0342B', '#F6CBC5', '#C9A66B', '#8A7A62', '#DE7A70', '#EDA7A0'];

export default function MarketingCharts({ sourceRows, trend, bounceRows, totalSessions }) {
  const { t } = useLang();

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Panel title={t('活动来源', 'Campaign sources')} description={t('按来源统计的访问量占比', 'Share of sessions by campaign source')}>
        <div className="h-[168px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={sourceRows} dataKey="sessions" nameKey="label" innerRadius={42} outerRadius={66} paddingAngle={2} strokeWidth={0}>
                {sourceRows.map((e, i) => <Cell key={e.label} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => num(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-2 space-y-1">
          {sourceRows.slice(0, 5).map((s, i) => (
            <li key={s.label} className="flex items-center gap-2 text-[11px]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="flex-1 truncate text-muted-foreground">{s.label}</span>
              <span className="num font-medium text-forest-900">{num(s.sessions)}</span>
              <span className="num w-9 text-right text-muted-foreground">
                {totalSessions ? Math.round((s.sessions / totalSessions) * 100) : 0}%
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title={t('流量趋势', 'Traffic trend')} description={t('按记录日期的访问量', 'Sessions by logged date')}>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE4E1" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8A7573' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#8A7573' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip formatter={(v) => num(v)} />
              <Line type="monotone" dataKey="sessions" name={t('访问量', 'Sessions')} stroke="#C94F45" strokeWidth={2.5} dot={{ r: 2.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title={t('跳出率', 'Bounce rate')} description={t('按来源的加权跳出率', 'Weighted bounce rate by source')}>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bounceRows} layout="vertical" margin={{ top: 6, right: 14, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EFE4E1" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: '#8A7573' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" width={96} tick={{ fontSize: 9.5, fill: '#8A7573' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `${v}%`} cursor={{ fill: 'rgba(201,79,69,0.08)' }} />
              <Bar dataKey="bounce" name={t('跳出率', 'Bounce rate')} fill="#8E2721" radius={[0, 3, 3, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}