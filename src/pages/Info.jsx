import { useSearchParams } from 'react-router-dom';
import MountainInfo from '@/components/info/MountainInfo';
import TransportGuide from '@/components/info/TransportGuide';
import PolicyContent from '@/components/info/PolicyContent';
import FaqSection from '@/components/home/FaqSection';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const SECTIONS = [
  { key: 'mountain', label: { zh: '山地信息', en: 'Mountain' } },
  { key: 'transport', label: { zh: '交通指引', en: 'Getting here' } },
  { key: 'faq', label: { zh: '常见问题', en: 'FAQs' } },
  { key: 'policy', label: { zh: '政策条款', en: 'Policies' } },
];

export default function Info() {
  const { lang } = useLanguage();
  const [params, setParams] = useSearchParams();
  const requested = params.get('section');
  const active = SECTIONS.some((item) => item.key === requested) ? requested : 'mountain';

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-10 flex gap-1.5 overflow-x-auto border-b border-border/70 bg-background/95 px-4 py-2.5 backdrop-blur scrollbar-none">
        {SECTIONS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setParams({ section: item.key })}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11.5px] transition ${
              active === item.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {item.label[lang === 'en' ? 'en' : 'zh']}
          </button>
        ))}
      </div>

      {active === 'mountain' && <MountainInfo />}
      {active === 'transport' && <TransportGuide />}
      {active === 'faq' && <FaqSection />}
      {active === 'policy' && <PolicyContent />}
    </div>
  );
}