import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ChevronRight, Sparkles, MessageSquare, Package, TrendingUp, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { loadWithRetry } from '@/lib/safeQuery';
import { toDateKey } from '@/lib/booking';
import LessonsTable from '@/components/lessons/LessonsTable';
import LessonSummary from '@/components/lessons/LessonSummary';
import FirstTimerDayPlan from '@/components/lessons/FirstTimerDayPlan';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const tomorrow = () => toDateKey(new Date(Date.now() + 86400000));
const ICONS = [Sparkles, MessageSquare, Package, TrendingUp];

export default function FirstTimerLessons() {
  const { bi } = useLanguage();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(tomorrow);

  useEffect(() => {
    let active = true;
    loadWithRetry(
      () =>
        base44.entities.Product.filter(
          { category: '课程', lesson_kind: 'first_timer', status: 'active' },
          { sort: 'sort_order', limit: 50 },
        ),
      { items: [] },
    )
      .then((page) => {
        if (!active) return;
        const items = page.items || [];
        setPackages(items);
        setSelected(items[0] || null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const highlights = [
    { zh: '专为初学者设计', en: 'Built for first timers', zhSub: '平缓坡道与专属学习区', enSub: 'Gentle terrain and learner areas' },
    { zh: '循序渐进的教学', en: 'Step-by-step coaching', zhSub: '教练手把手建立信心', enSub: 'Clear guidance that builds confidence' },
    { zh: '一价全包', en: 'Everything organised', zhSub: '课程、雪票与装备全含', enSub: 'Lesson, lift pass and rentals included' },
    { zh: '当天见成果', en: 'Progress in one day', zhSub: '一天之内学会连续转弯', enSub: 'Finish the day linking turns' },
  ];

  const book = () => {
    if (!selected) return;
    navigate(`/booking/${selected.id}?date=${date}&guests=1`);
  };

  return (
    <div className="pb-28">
      <header className="px-4 pt-4">
        <nav className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            {bi('首页', 'Home')}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/lessons" className="hover:text-foreground">
            {bi('滑雪课程', 'Lessons')}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span>{bi('初次滑雪', 'First timer')}</span>
        </nav>
        <p className="mt-2 text-[10.5px] font-medium tracking-wide text-primary">
          {bi('从零开始 · 首日滑雪', 'YOUR FIRST DAY ON SNOW')}
        </p>
        <h1 className="mt-1 font-heading text-[22px] leading-tight">
          {bi('首日初学者套餐', 'First Timer Packages')}
        </h1>
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
          {bi(
            '第一天上雪需要的所有东西，一次预订搞定：初学者小组课程、学习区雪票与租赁装备全部包含。教练会带你从零开始，在学习区里稳稳建立信心，当天就能连续转弯。',
            'Everything you need for your first day in one simple booking: a first timer lesson, learner lift access and rental gear included. Patient instructors and purpose-built beginner areas help you finish the day linking turns.',
          )}
        </p>
      </header>

      <section className="mt-4 grid grid-cols-2 gap-2 px-4">
        {highlights.map((item, index) => {
          const Icon = ICONS[index];
          return (
            <div key={item.en} className="rounded-xl border border-border bg-card px-3 py-2.5">
              <Icon className="h-4 w-4 text-primary" />
              <p className="mt-1.5 text-[11.5px] font-medium leading-snug">{bi(item.zh, item.en)}</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                {bi(item.zhSub, item.enSub)}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mt-5 px-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-[13px] font-semibold">{bi('选择套餐', 'Choose your package')}</h2>
          <span className="text-[10.5px] text-muted-foreground">
            {bi('每人价格', 'Per person')}
          </span>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center rounded-2xl border border-border bg-card">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : packages.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card px-4 py-8 text-center text-[12px] text-muted-foreground">
            {bi('首日套餐暂未开放，请稍后再来看看。', 'First timer packages are not available right now.')}
          </p>
        ) : (
          <LessonsTable lessons={packages} selectedId={selected?.id} onSelect={setSelected} />
        )}

        <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground">
          {bi(
            '核心套餐已包含租赁雪具、头盔与学习区雪票；升级套餐另含滑雪服与护目镜，可结账时选择。',
            'Core packages include rental gear, helmet and learner lift access. Complete packages add a jacket, pants and goggles.',
          )}
        </p>
      </section>

      <section className="mt-4 px-4">
        <LessonSummary lesson={selected} date={date} onDateChange={setDate} onBook={book} />
      </section>

      <section className="mt-4 px-4">
        <FirstTimerDayPlan />
      </section>

      <section className="mt-4 px-4">
        <div className="rounded-2xl border border-border bg-secondary/50 px-4 py-3">
          <p className="text-[11.5px] font-medium">
            {bi('已经有雪票和装备？', 'Already have your lift pass and gear?')}
          </p>
          <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">
            {bi(
              '只预订初学者课程请联系客服，我们会为你安排合适的教练与时段。',
              'Contact our team to book a lesson on its own and we will match you with the right instructor and time.',
            )}
          </p>
        </div>
        <Link
          to="/lessons"
          className="mt-3 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          {bi('返回全部课程', 'Back to all lessons')}
        </Link>
      </section>
    </div>
  );
}