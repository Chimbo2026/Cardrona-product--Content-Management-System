import { MessageCircle, CreditCard, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const SERVICES = [
  { icon: MessageCircle, titleKey: 'home.service.chat.title', descKey: 'home.service.chat.desc' },
  { icon: CreditCard, titleKey: 'home.service.pay.title', descKey: 'home.service.pay.desc' },
  { icon: ShieldCheck, titleKey: 'home.service.ticket.title', descKey: 'home.service.ticket.desc' },
];

export default function ServiceList() {
  const { t } = useLanguage();

  return (
    <section className="mt-6 px-4">
      <h2 className="font-heading text-[17px]">{t('home.services')}</h2>
      <div className="mt-3 space-y-2">
        {SERVICES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.titleKey}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[13px] font-medium">{t(item.titleKey)}</p>
                <p className="text-[11px] text-muted-foreground">{t(item.descKey)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}