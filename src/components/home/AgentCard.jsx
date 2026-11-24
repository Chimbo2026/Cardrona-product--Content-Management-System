import { Link } from 'react-router-dom';
import { ArrowRight, Tag } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AgentCard() {
  const { t } = useLanguage();

  return (
    <section className="mt-6 px-4">
      <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-accent-foreground" />
          <h2 className="font-heading text-[15px]">{t('home.agent.title')}</h2>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
          {t('home.agent.body')}
        </p>
        <Link
          to="/agent"
          className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-primary"
        >
          {t('home.agent.cta')} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}