import { Check } from 'lucide-react';
import { formatNZD } from '@/lib/booking';
import { localizedField, priceUnitOf } from '@/lib/i18n/localize';
import { useAgent, withAgentDiscount } from '@/lib/AgentContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const RESORT_LABELS = {
  卡德罗纳: { zh: '卡德罗纳', en: 'Cardrona' },
  三锥山: { zh: '三锥山', en: 'Treble Cone' },
  双雪场: { zh: '两地通用', en: 'Both mountains' },
};

const resortLabel = (value, lang) =>
  RESORT_LABELS[value]?.[lang === 'en' ? 'en' : 'zh'] || value || '';

export default function LessonsTable({ lessons, selectedId, onSelect }) {
  const { lang, bi } = useLanguage();
  const { agent } = useAgent();

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-secondary/70 text-[10.5px] tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-medium">{bi('课程', 'Lesson')}</th>
            <th className="px-2 py-2 font-medium">{bi('时长', 'Duration')}</th>
            <th className="px-3 py-2 text-right font-medium">{bi('价格 (NZD)', 'Price (NZD)')}</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson) => {
            const selected = lesson.id === selectedId;
            const price = withAgentDiscount(lesson.price, agent);
            const meta = [
              resortLabel(lesson.resort, lang),
              localizedField(lesson, 'audience', lang),
            ]
              .filter(Boolean)
              .join(' · ');
            return (
              <tr
                key={lesson.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(lesson)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(lesson);
                  }
                }}
                className={`cursor-pointer border-t border-border align-top transition ${
                  selected ? 'bg-primary/5' : 'hover:bg-secondary/50'
                }`}
              >
                <td
                  className={`px-3 py-3 ${
                    selected ? 'border-l-[3px] border-primary pl-[9px]' : 'border-l-[3px] border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/40'
                      }`}
                    >
                      {selected && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-medium leading-snug">
                        {localizedField(lesson, 'name', lang)}
                      </span>
                      <span className="mt-0.5 block text-[10.5px] leading-relaxed text-muted-foreground">
                        {meta}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="px-2 py-3 text-[11px] leading-relaxed text-muted-foreground">
                  {localizedField(lesson, 'duration', lang)}
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="block text-[13px] font-semibold">{formatNZD(price)}</span>
                  <span className="mt-0.5 block text-[10px] text-muted-foreground">
                    {priceUnitOf(lesson, lang)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}