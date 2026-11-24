import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { loadWithRetry } from '@/lib/safeQuery';
import { toDateKey } from '@/lib/booking';
import LessonsTable from '@/components/lessons/LessonsTable';
import LessonSummary from '@/components/lessons/LessonSummary';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const tomorrow = () => toDateKey(new Date(Date.now() + 86400000));

export default function Lessons() {
  const { bi } = useLanguage();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(tomorrow);

  useEffect(() => {
    let active = true;
    loadWithRetry(
      () => base44.entities.Product.filter({ category: '课程', status: 'active' }, { sort: 'sort_order', limit: 50 }),
      { items: [] },
    )
      .then((page) => {
        if (active) {
          setLessons((page.items || []).filter((item) => item.lesson_kind !== 'first_timer'));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

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
          <span>{bi('滑雪课程', 'Lessons')}</span>
        </nav>
        <h1 className="mt-2 font-heading text-[22px] leading-tight">
          {bi('滑雪与单板课程', 'Ski & snowboard lessons')}
        </h1>
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
          {bi(
            '从第一次上雪到技巧进阶，私教课、团体课与儿童启蒙课均由持证教练带队。下表列出各门课程的价格，选中一门即可查看订单摘要并预订。',
            'From your first day on snow to fine-tuning your technique, every private, group and kids lesson is led by certified instructors. Compare prices below, select a lesson to see your summary and book.',
          )}
        </p>
      </header>

      <section className="mt-4 px-4">
        <Link
          to="/lessons/book"
          className="mb-2 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
        >
          <span>
            <span className="block text-[12px] font-medium">
              {bi('预订课程', 'Book a lesson')}
            </span>
            <span className="mt-0.5 block text-[10.5px] text-muted-foreground">
              {bi('选课程 · 选水平 · 选时段，价格实时显示', 'Pick lesson, level and session with live pricing')}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
        </Link>
        <Link
          to="/lessons/first-timer"
          className="flex items-center justify-between rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3"
        >
          <span>
            <span className="block text-[12px] font-medium">
              {bi('第一次滑雪？', 'First time on snow?')}
            </span>
            <span className="mt-0.5 block text-[10.5px] text-muted-foreground">
              {bi('首日套餐：课程 + 雪票 + 装备一价全包', 'First Timer packages: lesson, pass and gear included')}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
        </Link>
      </section>

      <section className="mt-5 px-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-[13px] font-semibold">{bi('选择课程', 'Choose your lesson')}</h2>
          <span className="text-[10.5px] text-muted-foreground">
            {bi('每人价格', 'Per person')}
          </span>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center rounded-2xl border border-border bg-card">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : lessons.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card px-4 py-8 text-center text-[12px] text-muted-foreground">
            {bi('暂无可预订课程，请稍后再来看看。', 'No lessons available right now.')}
          </p>
        ) : (
          <LessonsTable lessons={lessons} selectedId={selected?.id} onSelect={setSelected} />
        )}
      </section>

      <section className="mt-5 px-4">
        <LessonSummary lesson={selected} date={date} onDateChange={setDate} onBook={book} />
      </section>
    </div>
  );
}