import { Users, UserRound } from 'lucide-react';
import { LESSON_TYPES } from '@/lib/lessonBooking';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LessonTypeCards({ value, onChange }) {
  const { lang, bi } = useLanguage();

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {LESSON_TYPES.map((type) => {
        const active = value === type.id;
        const Icon = type.id.startsWith('private') ? UserRound : Users;
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            className={`rounded-xl border p-3 text-left transition ${
              active
                ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30'
                : 'border-border bg-card hover:border-primary/40'
            }`}
          >
            <span className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-[12.5px] font-semibold">
                {lang === 'en' ? type.en : type.zh}
              </span>
            </span>
            <span className="mt-1 block text-[10.5px] leading-relaxed text-muted-foreground">
              {lang === 'en' ? type.desc_en : type.desc_zh}
            </span>
            <span className="mt-1.5 block text-[11px] font-medium text-primary">
              ${type.prices.adult} {bi('起', 'from')}
            </span>
          </button>
        );
      })}
    </div>
  );
}