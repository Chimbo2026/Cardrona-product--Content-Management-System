import { Clock, MapPin, Utensils, Snowflake, Flag } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const ICONS = [MapPin, Clock, Snowflake, Utensils, Flag];

export default function FirstTimerDayPlan() {
  const { bi } = useLanguage();

  const steps = [
    { time: '08:30', zh: '到山上报到，领取学习区雪票', en: 'Arrive on mountain and collect your learner pass' },
    { time: '09:00', zh: '前往租赁处试穿雪具与头盔', en: 'Get fitted with your gear at rentals' },
    { time: '10:30', zh: '雪上集合，上午小组课程开始', en: 'Meet on snow for the morning lesson' },
    { time: '13:00', zh: '午餐休息 45 分钟', en: '45 minute lunch break' },
    { time: '15:45', zh: '下午课程结束，可以在学习区自由练习', en: 'Afternoon coaching ends, free practice on the learner area' },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-2.5">
        <h2 className="text-[13px] font-semibold">{bi('首日流程', 'Your first day')}</h2>
      </div>
      <ol className="divide-y divide-border">
        {steps.map((step, index) => {
          const Icon = ICONS[index] || Clock;
          return (
            <li key={step.time} className="flex items-start gap-2.5 px-4 py-2.5">
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="w-9 shrink-0 text-[11px] font-semibold tabular-nums text-muted-foreground">
                {step.time}
              </span>
              <span className="text-[11.5px] leading-relaxed">{bi(step.zh, step.en)}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}