import { useLanguage } from '@/lib/i18n/LanguageContext';

const LANGUAGES = [
  { key: 'zh-CN', label: '中文' },
  { key: 'en', label: 'EN' },
];

export default function LanguageToggle({ className = '', tone = 'light' }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t('lang.switchAria')}
      className={`flex shrink-0 items-center gap-0.5 rounded-full border p-0.5 ${tone === 'dark' ? 'border-white/20 bg-white/10' : 'border-border bg-secondary/70'} ${className}`}
    >
      {LANGUAGES.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => setLang(item.key)}
          className={`rounded-full px-2 py-[3px] text-[10px] font-semibold transition ${
            lang === item.key
              ? 'bg-primary text-primary-foreground shadow-sm'
              : tone === 'dark' ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {lang === 'zh-CN' && item.key === 'en' ? '英文' : item.label}
        </button>
      ))}
    </div>
  );
}
