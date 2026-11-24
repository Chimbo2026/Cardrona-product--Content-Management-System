import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import LanguageToggle from '@/components/LanguageToggle';
import LessonTypeCards from '@/components/lessons/book/LessonTypeCards';
import LessonBasics from '@/components/lessons/book/LessonBasics';
import LessonSchedule from '@/components/lessons/book/LessonSchedule';
import BookSummary from '@/components/lessons/book/BookSummary';
import { toDateKey } from '@/lib/booking';
import { lessonPrice } from '@/lib/lessonBooking';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const tomorrow = () => new Date(Date.now() + 86400000);

const Step = ({ index, title, children }) => (
  <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
    <h2 className="mb-3 flex items-center gap-2 text-[12.5px] font-semibold">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10.5px] font-semibold text-primary">
        {index}
      </span>
      {title}
    </h2>
    {children}
  </section>
);

export default function BookLesson() {
  const { bi } = useLanguage();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);

  // 从支付确认页返回时保留已选内容
  const [typeId, setTypeId] = useState(params.get('type') || 'group-ski');
  const [age, setAge] = useState(params.get('age') || 'adult');
  const [level, setLevel] = useState(params.get('level') || 'first_timer');
  const [session, setSession] = useState(params.get('session') || 'morning');
  const [date, setDate] = useState(() => {
    const raw = params.get('date');
    return raw ? new Date(`${raw}T00:00:00`) : tomorrow();
  });

  const price = lessonPrice(typeId, age);
  const dateKey = toDateKey(date);
  const summaryProps = {
    typeId,
    age,
    level,
    session,
    date: dateKey,
    price,
    onBook: () =>
      navigate(
        `/lessons/checkout?type=${typeId}&age=${age}&level=${level}&session=${session}&date=${dateKey}`,
      ),
  };

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-10">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4">
          <button
            type="button"
            onClick={() => navigate('/lessons')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 transition hover:bg-secondary"
            aria-label={bi('返回', 'Back')}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-0 flex-1 truncate font-heading text-[15px] font-semibold">
            {bi('预订课程', 'Book a Lesson')}
          </span>
          <LanguageToggle />
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_336px] lg:items-start">
        <div className="space-y-4">
          <div>
            <h1 className="font-heading text-[20px] leading-tight">
              {bi('选择你的滑雪课程', 'Choose your lesson')}
            </h1>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
              {bi(
                '四步完成预订：选择课程、水平与年龄、日期与时段，右侧即时显示价格。',
                'Four quick steps: choose your lesson, level and age, then a date and session. Your price updates as you go.',
              )}
            </p>
          </div>

          <Step index={1} title={bi('选择课程类型', 'Choose the lesson & discipline')}>
            <LessonTypeCards value={typeId} onChange={setTypeId} />
          </Step>

          <Step index={2} title={bi('水平与年龄', 'Skill level & age')}>
            <LessonBasics age={age} level={level} onAge={setAge} onLevel={setLevel} />
          </Step>

          <Step index={3} title={bi('日期与时段', 'Date & session time')}>
            <LessonSchedule date={date} session={session} onDate={setDate} onSession={setSession} />
          </Step>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <BookSummary {...summaryProps} />
          </div>
        </aside>
      </div>

      <BookSummary {...summaryProps} variant="bar" />
    </div>
  );
}