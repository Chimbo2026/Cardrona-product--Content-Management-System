import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { localizedField } from '@/lib/i18n/localize';

export default function FaqSection() {
  const { lang, t } = useLanguage();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let active = true;
    base44.entities.FAQ.filter({ status: 'active' }, { sort: 'sort_order', limit: 20 })
      .then((page) => {
        if (active) setFaqs(page.items || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return null;

  return (
    <section className="mt-6 px-4">
      <h2 className="font-heading text-[17px]">{t('home.faq')}</h2>
      {faqs.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-border p-6 text-center text-[12px] text-muted-foreground">
          {t('home.faq.empty')}
        </p>
      ) : (
        <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {faqs.map((faq) => {
            const open = openId === faq.id;
            return (
              <div key={faq.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : faq.id)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span className="flex-1 text-[12.5px] font-medium leading-snug">
                    {localizedField(faq, 'question', lang)}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {open && (
                  <p className="px-4 pb-4 text-[11.5px] leading-relaxed text-muted-foreground">
                    {localizedField(faq, 'answer', lang)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}