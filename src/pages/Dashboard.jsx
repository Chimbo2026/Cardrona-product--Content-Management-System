import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Ticket,
  GraduationCap,
  DollarSign,
  UserCheck,
  Star,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  Wind,
  Snowflake,
  CloudSun,
  CheckCircle2,
  CircleDot,
  ScanFace,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import StatCard from '@/components/common/StatCard';
import VoucherSnapshot from '@/components/dashboard/VoucherSnapshot';
import Panel from '@/components/common/Panel';
import StatusBadge from '@/components/common/StatusBadge';
import { SelectNative } from '@/components/common/Controls';
import { Image } from '@/components/ui/image';
import { NZD, prettyDate } from '@/lib/format';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import useDashboardData from '@/hooks/useDashboardData';

const HERO =
  'https://images.ctfassets.net/2atbvuhykqrn/3FT4UFBXcUc47rnNELbRo1/2ff42cfa0ff1e529e33c751b5508ffb4/S26-Web-Dual-Image-Desktop.webp?w=1600&fm=webp&q=75';

const demo = {
  kpis: {
    bookings: 148,
    bookingsDelta: 12.4,
    activePasses: 1284,
    lessons: 32,
    rentals: 76,
    revenue: 186420,
    revenueDelta: 8.2,
    staffOnDuty: 94,
    satisfaction: 4.6,
  },
  dailyBookings: [
    { date: 'Fri 10', bookings: 132 },
    { date: 'Sat 11', bookings: 186 },
    { date: 'Sun 12', bookings: 174 },
    { date: 'Mon 13', bookings: 121 },
    { date: 'Tue 14', bookings: 108 },
    { date: 'Wed 15', bookings: 117 },
    { date: 'Thu 16', bookings: 129 },
    { date: 'Fri 17', bookings: 141 },
    { date: 'Sat 18', bookings: 198 },
    { date: 'Sun 19', bookings: 191 },
    { date: 'Mon 20', bookings: 126 },
    { date: 'Tue 21', bookings: 112 },
    { date: 'Wed 22', bookings: 124 },
    { date: 'Thu 23', bookings: 148 },
  ],
  revenueTrend: [
    { week: 'Wk 36', revenue: 92100 },
    { week: 'Wk 37', revenue: 104300 },
    { week: 'Wk 38', revenue: 118900 },
    { week: 'Wk 39', revenue: 112400 },
    { week: 'Wk 40', revenue: 131800 },
    { week: 'Wk 41', revenue: 149600 },
    { week: 'Wk 42', revenue: 168200 },
    { week: 'Wk 43', revenue: 186420 },
  ],
  categories: [
    { name: 'Lift Passes', value: 78400 },
    { name: 'Lessons', value: 33600 },
    { name: 'Rentals', value: 27900 },
    { name: 'Accommodation', value: 22300 },
    { name: 'Food & Beverage', value: 14800 },
    { name: 'Events', value: 9400 },
  ],
  utilisation: [
    { name: 'Lift network', value: 78 },
    { name: 'Snow school', value: 91 },
    { name: 'Rental fleet', value: 64 },
    { name: 'Accommodation', value: 82 },
    { name: 'Mountain shuttles', value: 57 },
  ],
  ops: [
    { label: 'Lifts operating', value: '6 of 8', ok: true },
    { label: 'Trails open', value: '22 of 28', ok: true },
    { label: 'Snow base (upper)', value: '148 cm', ok: true },
    { label: 'Mountain road', value: 'Open · chains 2WD', ok: true },
    { label: 'Beginner zone', value: 'Open', ok: true },
    { label: 'Avalanche control', value: 'In Progress', ok: false },
  ],
  upcoming: [
    { time: '09:00', title: 'Ski school morning meet', meta: '32 lessons · 3 meeting areas', tag: 'Snow school' },
    { time: '10:30', title: 'Mountain carting session', meta: '18 of 24 booked · Summer base', tag: 'Activities' },
    { time: '12:00', title: 'Guest safety briefing', meta: 'Captain’s Basin · 40 guests', tag: 'Operations' },
    { time: '14:00', title: 'Wānaka shuttle departure', meta: '32 of 44 seats · Route B', tag: 'Transport' },
    { time: '16:00', title: 'Lift close down checklist', meta: 'All lifts · supervisors', tag: 'Operations' },
  ],
  urgent: [
    { id: 3, title: 'Instructor double booking', meta: 'Sofia Marsh · 11:00 & 11:15', severity: 'High', to: '/management/lessons' },
  ],
  activity: [
    { who: 'M. Tipler', action: 'closed Trail 12 for grooming', time: '8 min ago' },
    { who: 'Guest services', action: 'created booking CRD-2418 for 4 guests', time: '22 min ago' },
    { who: 'Rental desk', action: 'issued 6 ski sets on RO-1183', time: '41 min ago' },
    { who: 'Ops control', action: 'logged snow depth observation (148 cm)', time: '1 hr ago' },
    { who: 'Snow school', action: 'marked attendance for 9 group lessons', time: '2 hrs ago' },
  ],
  weather: { temp: '-2°C', condition: 'Light snow', base: '148 cm', newSnow: '12 cm', wind: '18 km/h NW' },
};

const PIE_COLORS = ['#4D1613', '#C94F45', '#8A7A62', '#FFB59F', '#F6CBC5', '#C9A66B'];

const UTIL_ZH = {
  'Lift network': '缆车网络',
  'Snow school': '滑雪学校',
  'Rental fleet': '租赁装备',
  Accommodation: '住宿',
  'Mountain shuttles': '山地接驳车',
};

function ChartTooltip({ active, payload, label, prefix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lg">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="num text-[13px] font-semibold text-forest-900">
        {prefix}
        {Number(payload[0].value).toLocaleString('en-NZ')}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [period, setPeriod] = useState('Last 14 days');
  const [season, setSeason] = useState('Winter');
  const [category, setCategory] = useState('All');
  const { lang, t } = useLang();
  const data = useDashboardData(demo, { period, season, category });
  const k = data.kpis;

  const periodLabels = {
    Today: t('今日', 'Today'),
    'Last 7 days': t('近 7 天', 'Last 7 days'),
    'Last 14 days': t('近 14 天', 'Last 14 days'),
    'Season to date': t('雪季迄今', 'Season to date'),
  };

  const bookingsSeries = (period === 'Today'
    ? data.dailyBookings.slice(-1)
    : period === 'Last 7 days'
    ? data.dailyBookings.slice(-7)
    : data.dailyBookings.slice(-14)
  ).map((d) => ({
    date: lang === 'zh' ? d.date.replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/, (m) => ({ Mon: '周一', Tue: '周二', Wed: '周三', Thu: '周四', Fri: '周五', Sat: '周六', Sun: '周日' }[m])).replace(' ', ' ') : d.date,
    bookings: d.bookings,
  }));
  const categories = (category === 'All' ? data.categories : data.categories.filter((c) => c.name === category)).map((c) => ({
    ...c,
    label: tx(c.name, lang),
  }));
  const revenueTrend = data.revenueTrend.map((r) => ({
    ...r,
    week: lang === 'zh' ? r.week.replace('Wk ', '第 ') + ' 周' : r.week,
  }));

  return (
    <div>
      {/* Hero */}
      <section className="relative mb-5 overflow-hidden rounded-2xl border border-forest-900/10">
        <Image src={HERO} alt="Cardrona alpine terrain at golden hour" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/92 via-forest-950/70 to-forest-900/25" />
        <div className="relative flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-ice-400/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ice-200 ring-1 ring-inset ring-ice-300/30">
                {lang === 'zh' ? `2026 ${tx(season, lang)}雪季 · 第 42 天` : `${season} season 2026 · Day 42`}
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 ring-1 ring-inset ring-white/15">
                {t('演示环境', 'Demo environment')}
              </span>
            </div>
            <h1 className="mt-3 font-heading text-[26px] font-semibold leading-tight text-white sm:text-[30px]">
              {t('下午好，运营团队', 'Good afternoon, operations team')}
            </h1>
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-forest-100/80">
              {prettyDate(new Date())} · {t('今日山地各项作业正有序推进——从首班缆车到末班接驳车。', 'Everything moving on the mountain today, from first lifts to the last shuttle.')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 lg:shrink-0">
            {[
              { icon: CloudSun, label: t('气温', 'Temp'), value: data.weather.temp },
              { icon: Snowflake, label: t('雪基厚度', 'Snow base'), value: data.weather.base },
              { icon: Snowflake, label: t('新增降雪', 'New snow'), value: data.weather.newSnow },
              { icon: Wind, label: t('风速', 'Wind'), value: data.weather.wind },
            ].map((w) => (
              <div key={w.label}>
                <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.1em] text-ice-200/70">
                  <w.icon className="h-3 w-3" /> {w.label}
                </p>
                <p className="num mt-0.5 text-[15px] font-semibold text-white">{w.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-border/80 bg-card px-3.5 py-3 sm:flex-row sm:items-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {t('驾驶舱筛选', 'Dashboard filters')}
        </p>
        <div className="flex flex-1 flex-wrap items-center gap-2 sm:justify-end">
          <SelectNative
            ariaLabel={t('时间段', 'Period')}
            value={period}
            onChange={setPeriod}
            options={Object.entries(periodLabels).map(([value, label]) => ({ value, label }))}
          />
          <SelectNative
            ariaLabel={t('季节', 'Season')}
            value={season}
            onChange={setSeason}
            options={[
              { value: 'Winter', label: t('冬季', 'Winter') },
              { value: 'Summer', label: t('夏季', 'Summer') },
            ]}
          />
          <SelectNative
            ariaLabel={t('活动类别', 'Activity category')}
            value={category}
            onChange={setCategory}
            includeAll
            allLabel={t('全部分类', 'All categories')}
            options={data.categories.map((c) => ({ value: c.name, label: tx(c.name, lang) }))}
          />
          <span className="hidden text-[11px] text-muted-foreground lg:block">
            {t('数值由演示记录实时计算', 'Figures recalculated from demo records')}
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('今日访客', 'Visitors today')} value={k.visitorsToday ?? 0} sub={t('今日完成人脸登记', 'face check-ins today')} icon={ScanFace} tone="ice" />
        <StatCard label={t('今日预订', "Today's bookings")} value={k.bookings} delta={k.bookingsDelta} sub={t('对比昨日', 'vs. yesterday')} icon={CalendarCheck} />
        <StatCard label={t('使用中缆车票', 'Active lift passes')} value={k.activePasses.toLocaleString('en-NZ')} sub={t('有效且已发放', 'valid and issued')} icon={Ticket} tone="ice" />
        <StatCard label={t('排期课程', 'Lessons scheduled')} value={k.lessons} sub={t('今日排期', 'scheduled today')} icon={GraduationCap} />
        <StatCard label={t('期间营收', 'Revenue · period')} value={NZD(k.revenue)} delta={k.revenueDelta} sub={t('演示交易', 'demo transactions')} icon={DollarSign} />
        <StatCard label={t('在岗员工', 'Staff on duty')} value={k.staffOnDuty} sub={t('覆盖所有部门', 'across all departments')} icon={UserCheck} tone="slate" />
        <StatCard label={t('宾客满意度', 'Guest satisfaction')} value={`${k.satisfaction}/5`} sub={t('到访后抽样评分', 'sampled post-visit score')} icon={Star} tone="amber" />
      </div>

      <VoucherSnapshot />

      {/* Charts */}
      <div className="mb-5 grid gap-3 xl:grid-cols-3">
        <Panel
          title={t('每日预订', 'Daily bookings')}
          description={t(`${periodLabels[period]} · 含已确认、待处理与已完成`, `${periodLabels[period]} · confirmed, pending and completed`.replace(periodLabels[period], periodLabels[period]))}
          className="xl:col-span-2"
          action={
            <Link to="/bookings" className="inline-flex items-center gap-1 text-[11.5px] font-medium text-forest-700 hover:text-forest-900">
              {t('预订管理', 'Bookings')} <ArrowUpRight className="h-3 w-3" />
            </Link>
          }
        >
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookingsSeries} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C94F45" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#C94F45" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE4E1" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8A7573' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8A7573' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="bookings" stroke="#B0342B" strokeWidth={2} fill="url(#bookingsFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title={t('预订构成', 'Booking mix')} description={t('各产品营收贡献', 'Revenue contribution by product')}>
          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="value" nameKey="label" innerRadius={44} outerRadius={68} paddingAngle={2} strokeWidth={0}>
                  {categories.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip prefix="$" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5">
            {categories.slice(0, 5).map((c, i) => (
              <li key={c.name} className="flex items-center gap-2 text-[11.5px]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="flex-1 truncate text-muted-foreground">{c.label}</span>
                <span className="num font-medium text-forest-900">{NZD(c.value)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mb-5 grid gap-3 xl:grid-cols-3">
        <Panel title={t('营收趋势', 'Revenue trend')} description={t('每周演示交易合计', 'Weekly demo transaction totals')} className="xl:col-span-2">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrend} margin={{ top: 6, right: 6, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE4E1" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#8A7573' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 11, fill: '#8A7573' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip prefix="$" />} cursor={{ fill: 'rgba(56,169,216,0.06)' }} />
                <Bar dataKey="revenue" fill="#4D1613" radius={[4, 4, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title={t('资源使用率', 'Resource utilisation')} description={t('今日与容量对比', 'Today vs. capacity')}>
          <ul className="space-y-3 pt-1">
            {data.utilisation.map((u) => (
              <li key={u.name}>
                <div className="mb-1 flex items-center justify-between text-[11.5px]">
                  <span className="text-muted-foreground">{UTIL_ZH[u.name] ? t(UTIL_ZH[u.name], u.name) : u.name}</span>
                  <span className="num font-semibold text-forest-900">{u.value}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-forest-50">
                  <div
                    className={`h-full rounded-full ${u.value >= 90 ? 'bg-amber-500' : 'bg-ice-500'}`}
                    style={{ width: `${u.value}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Bottom grid */}
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        <Panel title={t('每日运营摘要', 'Daily operations summary')} description={t('实时演示状态', 'Live demo status')}>
          <ul className="space-y-2.5">
            {data.ops.map((o) => (
              <li key={o.label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  {o.ok ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  {t(o.label, o.label)}
                </span>
                <span className="num text-[12px] font-medium text-forest-900">
                  {lang === 'zh'
                    ? o.value
                        .replace('6 of 8', '8 条中 6 条')
                        .replace('22 of 28', '28 条中 22 条')
                        .replace('Open · chains 2WD', '开放 · 两驱需防滑链')
                        .replace(/^Open$/, '开放')
                        .replace('In Progress', '进行中')
                    : o.value}
                </span>
              </li>
            ))}
          </ul>
          <Link to="/operations" className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-forest-700 hover:text-forest-900">
            {t('运行控制', 'Operations control')} <ArrowUpRight className="h-3 w-3" />
          </Link>
        </Panel>

        <Panel title={t('近期活动', 'Upcoming activities')} description={t('日程上的下一项', 'Next on the schedule')}>
          <ul className="space-y-3">
            {data.upcoming.map((u) => (
              <li key={u.title} className="flex gap-3">
                <span className="num w-10 shrink-0 pt-0.5 text-[11.5px] font-semibold text-forest-700">{u.time}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-medium text-forest-900">
                    {t(
                      {
                        'Ski school morning meet': '滑雪学校晨间集合',
                        'Mountain carting session': '山地滑车场次',
                        'Guest safety briefing': '宾客安全简报',
                        'Wānaka shuttle departure': '瓦纳卡接驳车发车',
                        'Lift close down checklist': '缆车收班检查清单',
                      }[u.title] || u.title,
                      u.title
                    )}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {lang === 'zh'
                      ? u.meta
                          .replace('32 lessons · 3 meeting areas', '32 节课 · 3 个集合区')
                          .replace('18 of 24 booked · Summer base', '24 个名额已订 18 · 夏季基地')
                          .replace('Captain’s Basin · 40 guests', 'Captain’s Basin · 40 位宾客')
                          .replace('32 of 44 seats · Route B', '44 个座位已订 32 · B 线')
                          .replace('All lifts · supervisors', '全部缆车 · 主管')
                      : u.meta}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={t('紧急事项', 'Urgent tasks')} description={t('今日需要关注', 'Needs attention today')}>
          <ul className="space-y-2.5">
            {data.urgent.map((u) => (
              <li key={u.id}>
                <Link to={u.to} className="flex items-start gap-2.5 rounded-lg border border-border/70 p-2.5 transition-colors hover:border-rose-200 hover:bg-rose-50/40">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                  <span className="min-w-0">
                    <span className="block text-[12px] font-medium leading-snug text-forest-900">
                      {t(
                        {
                          'Willow chair inspection overdue': 'Willow 吊椅检验逾期',
                          '4 rental returns overdue': '4 笔租赁归还逾期',
                          'Instructor double booking': '教练时段重复预订',
                        }[u.title] || u.title,
                        u.title
                      )}
                    </span>
                    <span className="mt-0.5 block text-[10.5px] text-muted-foreground">
                      {lang === 'zh'
                        ? u.meta
                            .replace('Critical · 2 days overdue', '紧急 · 逾期 2 天')
                            .replace('Fleet · due yesterday', '装备队 · 昨日到期')
                            .replace('Sofia Marsh · 11:00 & 11:15', 'Sofia Marsh · 11:00 与 11:15')
                        : u.meta}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={t('系统动态', 'Recent system activity')} description={t('演示操作记录', 'Demo audit trail')}>
          <ul className="space-y-2.5">
            {data.activity.map((a, i) => (
              <li key={i} className="flex gap-2.5">
                <CircleDot className="mt-1 h-3 w-3 shrink-0 text-ice-400" />
                <span className="min-w-0">
                  <span className="block text-[11.5px] leading-snug text-forest-900">
                    <span className="font-medium">{a.who}</span>{' '}
                    {t(
                      {
                        'closed Trail 12 for grooming': '关闭 12 号雪道进行压雪',
                        'created booking CRD-2418 for 4 guests': '创建预订 CRD-2418（4 位宾客）',
                        'issued 6 ski sets on RO-1183': '在 RO-1183 发放 6 套双板装备',
                        'logged snow depth observation (148 cm)': '记录雪深观测（148 cm）',
                        'marked attendance for 9 group lessons': '为 9 节团体课标记出勤',
                      }[a.action] || a.action,
                      a.action
                    )}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground">
                    {t(
                      {
                        '8 min ago': '8 分钟前',
                        '22 min ago': '22 分钟前',
                        '41 min ago': '41 分钟前',
                        '1 hr ago': '1 小时前',
                        '2 hrs ago': '2 小时前',
                      }[a.time] || a.time,
                      a.time
                    )}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-white/70 px-4 py-3">
        <StatusBadge status="Demo" dot={false} />
        <p className="text-[11.5px] text-muted-foreground">
          {t('所有数值均由虚构示例记录计算生成，仅用于演示。天气与雪情观测为模拟数据，未连接任何实时度假村系统。', 'All figures are generated from fictional sample records for demonstration. Weather and snow observations are simulated and not connected to any live resort system.')}
        </p>
      </div>
    </div>
  );
}
