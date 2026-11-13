import { useMemo, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Download, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import ModuleHeader from '@/components/common/ModuleHeader';
import Panel from '@/components/common/Panel';
import { SelectNative, DemoChip } from '@/components/common/Controls';
import useList from '@/hooks/useList';
import { useRole } from '@/lib/RoleContext';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { NZD, addDaysISO, num, prettyDate, todayISO } from '@/lib/format';
import { downloadCsv } from '@/lib/csv';
import { computeCoverage } from '@/lib/coverage';

const COLORS = ['#8E2721', '#C94F45', '#B0342B', '#F6CBC5', '#C9A66B', '#8A7A62'];
const ACTIVITIES = ['Lift Pass', 'Lesson', 'Rental', 'Accommodation', 'Event', 'Transport', 'Food & Beverage', 'Gift Voucher'];
const LESSON_TYPES = ['Group', 'Private', 'Kids'];

const ChartTip = ({ active, payload, label, money }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white px-2.5 py-1.5 shadow-md">
      <p className="text-[10.5px] font-semibold text-forest-900">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="num text-[11px] text-muted-foreground">
          {p.name}: {money ? NZD(p.value) : num(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
  const { can } = useRole();
  const { lang, t } = useLang();
  const { toast } = useToast();
  const { items: bookings } = useList('Booking', {}, { limit: 500 });
  const { items: txns } = useList('Transaction', {}, { limit: 1200 });
  const { items: lessons } = useList('Lesson', {}, { limit: 400 });
  const { items: shifts } = useList('Shift', {}, { limit: 900 });
  const { items: requirements } = useList('CoverageRequirement', {}, { limit: 100 });
  const { items: passes } = useList('LiftPass', {}, { limit: 400 });
  const { items: refunds } = useList('RefundRequest', {}, { limit: 500 });

  const [start, setStart] = useState(addDaysISO(-90));
  const [end, setEnd] = useState(todayISO());
  const [month, setMonth] = useState('All months');
  const [category, setCategory] = useState('All');
  const [lessonType, setLessonType] = useState('All');
  const [payment, setPayment] = useState('All');

  const monthOptions = useMemo(() => {
    const set = new Set();
    bookings.forEach((b) => b.visit_date && set.add(String(b.visit_date).slice(0, 7)));
    return [
      { value: 'All months', label: t('全部月份', 'All months') },
      ...[...set].sort().reverse().map((m) => ({ value: m, label: prettyDate(`${m}-01`, 'MMMM yyyy') })),
    ];
  }, [bookings, t]);

  const [from, to] = useMemo(() => {
    if (month === 'All months') return [start, end];
    return [`${month}-01`, `${month}-31`];
  }, [month, start, end]);

  const inRange = (d) => d && d >= from && d <= to;

  const cancelledRefs = useMemo(
    () => new Set(bookings.filter((b) => b.booking_status === 'Cancelled').map((b) => b.booking_ref)),
    [bookings]
  );

  const filteredBookings = useMemo(() => bookings.filter((b) => {
    if (!inRange(b.visit_date)) return false;
    if (category !== 'All' && b.activity !== category) return false;
    if (payment !== 'All' && b.payment_status !== payment) return false;
    if (lessonType !== 'All') {
      const lesson = lessons.find((l) => l.id === b.lesson_id);
      const lt = b.lesson_type || lesson?.lesson_category;
      if (lt !== lessonType) return false;
    }
    return true;
  }), [bookings, from, to, category, payment, lessonType, lessons]);

  const rangeTxns = useMemo(() => txns.filter((tr) => {
    if (tr.status !== 'Paid' || !inRange(tr.date)) return false;
    if (cancelledRefs.has(tr.booking_ref)) return false;
    if (category !== 'All' && tr.category !== category) return false;
    return true;
  }), [txns, from, to, category, cancelledRefs]);

  const rangeRefunds = useMemo(() => refunds.filter((r) => {
    if (r.status !== 'Processed') return false;
    const d = String(r.processed_at || r.requested_at || r.created_date || '').slice(0, 10);
    if (!inRange(d)) return false;
    if (category !== 'All') {
      const b = bookings.find((x) => x.id === r.booking_id);
      if (b?.activity !== category) return false;
    }
    return true;
  }), [refunds, from, to, category, bookings]);

  const grossRevenue = rangeTxns.reduce((s, tr) => s + (Number(tr.amount) || 0), 0);
  const refundTotal = rangeRefunds.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const revenue = grossRevenue - refundTotal;
  const activeBookings = filteredBookings.filter((b) => b.booking_status !== 'Cancelled');
  const cancellations = filteredBookings.filter((b) => b.booking_status === 'Cancelled').length;
  const cancelRate = filteredBookings.length ? (cancellations / filteredBookings.length) * 100 : 0;

  const rangeLessons = useMemo(() => lessons.filter((l) => inRange(l.date) && l.status !== 'Cancelled' && (lessonType === 'All' || l.lesson_category === lessonType)), [lessons, from, to, lessonType]);
  const lessonSeats = rangeLessons.reduce((s, l) => s + (Number(l.enrolled) || 0), 0);
  const lessonCap = rangeLessons.reduce((s, l) => s + (Number(l.capacity) || 0), 0);
  const lessonUtil = lessonCap ? (lessonSeats / lessonCap) * 100 : 0;

  const monthly = useMemo(() => {
    const map = {};
    rangeTxns.forEach((tr) => {
      const k = String(tr.date).slice(0, 7);
      map[k] = (map[k] || 0) + (Number(tr.amount) || 0);
    });
    return Object.keys(map).sort().map((k) => ({ month: prettyDate(`${k}-01`, 'MMM yy'), revenue: map[k] }));
  }, [rangeTxns]);

  const volume = useMemo(() => {
    const map = {};
    activeBookings.forEach((b) => {
      const k = String(b.visit_date).slice(0, 7);
      map[k] = (map[k] || 0) + 1;
    });
    return Object.keys(map).sort().map((k) => ({ month: prettyDate(`${k}-01`, 'MMM yy'), bookings: map[k] }));
  }, [activeBookings]);

  const weekday = useMemo(() => {
    const labels = lang === 'zh'
      ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    activeBookings.forEach((b) => {
      const d = new Date(b.visit_date);
      if (!Number.isNaN(d.getTime())) counts[d.getDay()] += 1;
    });
    return labels.map((l, i) => ({ day: l, bookings: counts[i] }));
  }, [activeBookings, lang]);

  const topPasses = useMemo(() => {
    const map = {};
    filteredBookings.filter((b) => b.activity === 'Lift Pass' && b.booking_status !== 'Cancelled').forEach((b) => {
      const key = b.pass_type || 'Lift Pass';
      map[key] = (map[key] || 0) + (Number(b.guests_count) || 1);
    });
    passes.forEach((p) => { if (!map[p.pass_type]) map[p.pass_type] = 0; });
    return Object.entries(map)
      .map(([name, sold]) => ({ name: tx(name, lang), sold }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 6);
  }, [filteredBookings, passes, lang]);

  const byCategory = useMemo(() => {
    const map = {};
    rangeTxns.forEach((tr) => { map[tr.category] = (map[tr.category] || 0) + (Number(tr.amount) || 0); });
    return Object.entries(map).map(([name, value]) => ({ name: tx(name, lang), value })).sort((a, b) => b.value - a.value);
  }, [rangeTxns, lang]);

  const utilisation = useMemo(() => LESSON_TYPES.map((lt) => {
    const rows = rangeLessons.filter((l) => l.lesson_category === lt);
    const seats = rows.reduce((s, l) => s + (Number(l.enrolled) || 0), 0);
    const cap = rows.reduce((s, l) => s + (Number(l.capacity) || 0), 0);
    return { name: tx(lt, lang), utilisation: cap ? Math.round((seats / cap) * 100) : 0 };
  }), [rangeLessons, lang]);

  const coverage = useMemo(() => computeCoverage(shifts, requirements, todayISO()), [shifts, requirements]);
  const coveredWindows = coverage.filter((c) => c.ok).length;
  const coveragePct = coverage.length ? Math.round((coveredWindows / coverage.length) * 100) : 0;

  const exportCsv = () => {
    const rows = filteredBookings.map((b) => ({
      [t('预订编号', 'Booking reference')]: b.booking_ref,
      [t('到访日期', 'Visit date')]: b.visit_date,
      [t('宾客', 'Guest')]: b.guest_name,
      [t('类别', 'Activity')]: tx(b.activity, lang),
      [t('课程', 'Lesson')]: b.lesson_title || '',
      [t('教练', 'Instructor')]: b.instructor_name || '',
      [t('人数', 'Guests')]: b.guests_count,
      [t('预订状态', 'Booking status')]: tx(b.booking_status, lang),
      [t('支付状态', 'Payment status')]: tx(b.payment_status, lang),
      [t('金额 (NZD)', 'Amount (NZD)')]: b.amount || 0,
    }));
    const ok = downloadCsv(`cardrona-report_${from}_to_${to}.csv`, rows);
    toast(ok
      ? { title: t('报表已导出', 'Report exported'), description: t(`${rows.length} 条预订 · ${from} 至 ${to}`, `${rows.length} bookings · ${from} to ${to}`) }
      : { title: t('无可导出的数据', 'Nothing to export'), description: t('当前筛选条件下没有预订记录', 'No bookings match the current filters') });
  };

  const kpis = [
    { label: t('净营收', 'Net revenue'), value: NZD(revenue), sub: t(`已退款 ${NZD(refundTotal)}`, `less refunds ${NZD(refundTotal)}`) },
    { label: t('退款', 'Refunds'), value: NZD(refundTotal), sub: t(`${rangeRefunds.length} 笔已退回`, `${rangeRefunds.length} processed in range`), tone: refundTotal > 0 ? 'rose' : 'default' },
    { label: t('预订量', 'Bookings'), value: num(activeBookings.length), sub: t(`${num(cancellations)} 笔已取消`, `${num(cancellations)} cancelled`) },
    { label: t('取消率', 'Cancellation rate'), value: `${cancelRate.toFixed(1)}%`, sub: t('占筛选后预订', 'of filtered bookings'), tone: cancelRate > 12 ? 'rose' : 'default' },
    { label: t('课程使用率', 'Lesson utilisation'), value: `${lessonUtil.toFixed(0)}%`, sub: t(`${num(lessonSeats)} / ${num(lessonCap)} 个名额`, `${num(lessonSeats)} of ${num(lessonCap)} seats`) },
    { label: t('排班覆盖率', 'Roster coverage'), value: `${coveragePct}%`, sub: t(`今日 ${coveredWindows}/${coverage.length} 个时段达标`, `${coveredWindows}/${coverage.length} windows today`) },
  ];

  return (
    <div>
      <ModuleHeader
        image="https://images.ctfassets.net/2atbvuhykqrn/4sRoYUu5li9l11BZFsIKAu/52d8b3d29f3361046c7191b40c841b20/W24-about-us_Imagery-Home_Page_Hero_Image_-_Desktop.webp?w=1600&fm=webp&q=75"
        eyebrow={t('管理分析', 'Management analytics')}
        title={t('财务报告', 'Financial Reporting')}
        description={t('基于演示记录实时计算营收、预订、滑雪学校使用率与排班覆盖率，货币单位为纽币（NZD）。', 'Revenue, bookings, Snow School utilisation and roster coverage calculated from live demo records in NZD.')}
        actions={<Button size="sm" className="gap-1.5 bg-white text-forest-900 hover:bg-white/90" onClick={exportCsv}>
          <Download className="h-3.5 w-3.5" /> {t('导出 CSV', 'Export CSV')}
        </Button>}
      />

      <Panel className="mb-4" bodyClassName="p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('开始日期', 'Start date')}</p>
            <Input type="date" value={from} onChange={(e) => { setMonth('All months'); setStart(e.target.value); }} className="h-9 w-[150px] text-[12px]" />
          </div>
          <div>
            <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{t('结束日期', 'End date')}</p>
            <Input type="date" value={to} onChange={(e) => { setMonth('All months'); setEnd(e.target.value); }} className="h-9 w-[150px] text-[12px]" />
          </div>
          <SelectNative ariaLabel={t('月份', 'Month')} value={month} onChange={setMonth} options={monthOptions} className="h-9" />
          <SelectNative ariaLabel={t('预订类别', 'Booking category')} value={category} onChange={setCategory} includeAll allLabel={t('全部分类', 'All categories')} options={ACTIVITIES.map((v) => ({ value: v, label: tx(v, lang) }))} />
          <SelectNative ariaLabel={t('课程类型', 'Lesson type')} value={lessonType} onChange={setLessonType} includeAll allLabel={t('全部课程类型', 'All lesson types')} options={LESSON_TYPES.map((v) => ({ value: v, label: tx(v, lang) }))} />
          <SelectNative ariaLabel={t('支付状态', 'Payment status')} value={payment} onChange={setPayment} includeAll allLabel={t('全部支付状态', 'All payment statuses')} options={['Paid', 'Pending', 'Partially Paid', 'Refunded'].map((v) => ({ value: v, label: tx(v, lang) }))} />
          <Button variant="ghost" size="sm" className="h-9 text-[11.5px]" onClick={() => { setStart(addDaysISO(-90)); setEnd(todayISO()); setMonth('All months'); setCategory('All'); setLessonType('All'); setPayment('All'); }}>
            {t('重置', 'Reset')}
          </Button>
          <span className="ml-auto"><DemoChip>{t('NZD · 示例数据', 'NZD · sample data')}</DemoChip></span>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {t(`显示 ${prettyDate(from)} – ${prettyDate(to)} · ${filteredBookings.length} 条预订 · 营收不含未支付与已取消预订。`, `Showing ${prettyDate(from)} – ${prettyDate(to)} · ${filteredBookings.length} bookings · revenue excludes unpaid and cancelled bookings.`)}
        </p>
      </Panel>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border/80 bg-card px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{k.label}</p>
            <p className={`num mt-1 text-[20px] font-semibold ${k.tone === 'rose' ? 'text-rose-600' : 'text-forest-950'}`}>{k.value}</p>
            <p className="mt-0.5 text-[10.5px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title={t('按月营收', 'Revenue by month')} description={t('已支付交易（未扣退款），不含已取消预订', 'Paid transactions before refunds, cancelled bookings excluded')} className="xl:col-span-2">
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 6, right: 6, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE4E1" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8A7573' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fontSize: 11, fill: '#8A7573' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip money />} cursor={{ fill: 'rgba(201,79,69,0.08)' }} />
                <Bar dataKey="revenue" name={t('营收', 'Revenue')} fill="#8E2721" radius={[4, 4, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title={t('按产品营收', 'Revenue by product')} description={t('已支付营收占比', 'Share of paid revenue')}>
          <div className="h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={44} outerRadius={68} paddingAngle={2} strokeWidth={0}>
                  {byCategory.map((e, i) => <Cell key={e.name} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<ChartTip money />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1">
            {byCategory.slice(0, 5).map((c, i) => (
              <li key={c.name} className="flex items-center gap-2 text-[11px]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="flex-1 truncate text-muted-foreground">{c.name}</span>
                <span className="num font-medium text-forest-900">{NZD(c.value)}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={t('月度预订量', 'Monthly booking volume')} description={t('含已确认、待处理与已完成', 'Confirmed, pending and completed')}>
          <div className="h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volume} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE4E1" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#8A7573' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8A7573' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTip />} />
                <Line type="monotone" dataKey="bookings" name={t('预订', 'Bookings')} stroke="#C94F45" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title={t('预订高峰日', 'Busiest booking days')} description={t('按星期统计预订量', 'Bookings by weekday')}>
          <div className="h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekday} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE4E1" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#8A7573' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8A7573' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(201,79,69,0.08)' }} />
                <Bar dataKey="bookings" name={t('预订', 'Bookings')} fill="#B0342B" radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title={t('热销缆车票', 'Top-selling lift passes')} description={t('按票种统计人数', 'Guests by pass type')}>
          <div className="h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPasses} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EFE4E1" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#8A7573' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={92} tick={{ fontSize: 9.5, fill: '#8A7573' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(201,79,69,0.08)' }} />
                <Bar dataKey="sold" name={t('人数', 'Guests')} fill="#C94F45" radius={[0, 3, 3, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title={t('课程使用率', 'Lesson utilisation')} description={t('各课程类型预订名额与容量对比', 'Booked seats vs. capacity by lesson type')}>
          <div className="h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilisation} margin={{ top: 6, right: 6, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFE4E1" />
                <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: '#8A7573' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: '#8A7573' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(201,79,69,0.08)' }} />
                <Bar dataKey="utilisation" name={t('使用率 %', 'Utilisation %')} fill="#C9A66B" radius={[3, 3, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
            {lessonUtil >= 75 ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> : <TrendingDown className="h-3.5 w-3.5 text-amber-600" />}
            {t(`全部 ${rangeLessons.length} 节课程中，滑雪学校名额售出 ${lessonUtil.toFixed(0)}%`, `${lessonUtil.toFixed(0)}% of Snow School seats sold across ${rangeLessons.length} lessons`)}
          </div>
        </Panel>
      </div>

      <Panel title={t('今日排班覆盖', 'Roster coverage today')} description={t('低于配置最低人数的部门', 'Departments below their configured minimum')} className="mt-4" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-border/80 text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
                <th className="px-4 py-2.5 font-semibold">{t('部门', 'Department')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('时段', 'Window')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('排班人数', 'Rostered')}</th>
                <th className="px-3 py-2.5 font-semibold">{t('目标', 'Target')}</th>
                <th className="px-4 py-2.5 font-semibold">{t('状态', 'Status')}</th>
              </tr>
            </thead>
            <tbody>
              {coverage.map((c) => (
                <tr key={c.key} className="border-b border-border/60">
                  <td className="px-4 py-2 text-[12px] font-medium text-forest-900">{tx(c.department, lang)}</td>
                  <td className="px-3 py-2 text-[11.5px] text-muted-foreground">{tx(c.shift_label, lang)} · {c.window}</td>
                  <td className="num px-3 py-2 text-[11.5px] text-forest-900">{c.scheduled}</td>
                  <td className="num px-3 py-2 text-[11.5px] text-muted-foreground">{c.target}</td>
                  <td className={`px-4 py-2 text-[11.5px] font-medium ${c.ok ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {c.ok ? t('已满足', 'Covered') : t(`缺 ${c.short} 人`, `Short ${c.short}`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}