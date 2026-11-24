import { CableCar, GraduationCap, Snowflake, Package } from 'lucide-react';
import { CATEGORY_OPTIONS } from '@/lib/booking';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { categoryLabel } from '@/lib/i18n/localize';

const ICONS = {
  门票: CableCar,
  课程: GraduationCap,
  租赁: Snowflake,
  套餐: Package,
};

export default function CategoryBar({ category, onChange }) {
  const { lang, t } = useLanguage();

  const items = [
    { key: 'all', label: t('category.all'), icon: Snowflake },
    ...CATEGORY_OPTIONS.map((key) => ({ key, label: categoryLabel(key, lang), icon: ICONS[key] })),
  ];

  return (
    <section className="-mt-5 px-4">
      <div className="grid grid-cols-5 gap-1.5 rounded-2xl border border-border bg-card p-3 shadow-sm">
        {items.map((item) => {
          const Icon = item.icon;
          const active = category === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={`flex flex-col items-center gap-1.5 rounded-xl py-1 transition ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  active ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                }`}
              >
                <Icon className="h-[17px] w-[17px]" />
              </span>
              <span className="w-full truncate text-center text-[10px] leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}