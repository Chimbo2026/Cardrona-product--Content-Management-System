import { Info } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const TYPES = ['wechat_pay', 'card', 'aspenware', 'esign'];

export default function IntegrationNotice({ type, className = '' }) {
  const { t } = useLanguage();
  if (!TYPES.includes(type)) return null;

  return (
    <div
      className={`rounded-xl border border-dashed border-sky-200 bg-sky-50/70 p-3 text-[11px] leading-relaxed text-sky-900 ${className}`}
    >
      <div className="flex items-center gap-1.5 font-medium">
        <Info className="h-3.5 w-3.5" />
        {t(`notice.${type}.title`)}
      </div>
      <p className="mt-1.5 text-sky-900/80">{t(`notice.${type}.body`)}</p>
    </div>
  );
}