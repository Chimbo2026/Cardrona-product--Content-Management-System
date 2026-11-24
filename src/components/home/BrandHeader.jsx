import LanguageToggle from '@/components/LanguageToggle';
import ModeSwitch from '@/components/home/ModeSwitch';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Mountain } from 'lucide-react';

const MOUNTAINS = [
  { key: 'cardrona', labelKey: 'home.mountain.cardrona' },
  { key: 'treble', labelKey: 'home.mountain.treble' },
];

export default function BrandHeader({ mountain, onMountain }) {
  const { t, bi } = useLanguage();

  return (
    <header className="sticky top-0 z-20 border-b border-[#d7e1ed] bg-background/95 backdrop-blur">
      <div className="flex items-center gap-2 bg-[#111a2e] px-4 py-2.5 text-white">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
          <Mountain className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[12px] font-bold tracking-[0.12em]">CARDRONA</p>
          <p className="text-[8px] tracking-[0.22em] text-white/55">TREBLE CONE</p>
        </div>
        <LanguageToggle tone="dark" />
        <span className="rounded-full border border-white/25 px-2.5 py-1 text-[8px] font-semibold tracking-[0.14em] text-white/85">WINTER 26</span>
      </div>

      <div role="group" className="flex gap-1 px-4 pb-2 pt-2.5">
        <div className="flex flex-1 gap-1 rounded-full bg-secondary p-1">
          {MOUNTAINS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onMountain(item.key)}
              className={`flex-1 rounded-full py-1.5 text-[11.5px] font-medium transition ${
                mountain === item.key
                  ? 'bg-[#111a2e] text-white shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              {t(item.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <ModeSwitch />
    </header>
  );
}
