import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AGE_GROUPS, SKILL_LEVELS } from '@/lib/lessonBooking';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LessonBasics({ age, level, onAge, onLevel }) {
  const { lang, bi } = useLanguage();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <p className="mb-1.5 text-[11px] font-medium text-foreground/70">{bi('年龄组', 'Age group')}</p>
        <div className="grid grid-cols-2 gap-2">
          {AGE_GROUPS.map((group) => {
            const active = age === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => onAge(group.id)}
                className={`rounded-xl border px-3 py-2 text-left transition ${
                  active
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <span className={`block text-[12px] font-semibold ${active ? 'text-primary' : ''}`}>
                  {lang === 'en' ? group.en : group.zh}
                </span>
                <span className="mt-0.5 block text-[10px] text-muted-foreground">
                  {lang === 'en' ? group.note_en : group.note_zh}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[11px] font-medium text-foreground/70">{bi('技能水平', 'Skill level')}</p>
        <Select value={level} onValueChange={onLevel}>
          <SelectTrigger className="h-10 text-[12.5px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SKILL_LEVELS.map((item) => (
              <SelectItem key={item.id} value={item.id} className="text-[12.5px]">
                {lang === 'en' ? item.en : item.zh}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}