import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const TABS = [
  { key: 'ski', path: '/booking', labelKey: 'home.tab.ski' },
  { key: 'shop', path: '/shop', labelKey: 'home.tab.shop' },
];

export default function ModeSwitch() {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const activeKey = pathname.startsWith('/shop') ? 'shop' : 'ski';

  return (
    <div role="tablist" className="flex items-stretch border-t border-[#d7e1ed] bg-white/95">
      {TABS.map((tab) => {
        const active = activeKey === tab.key;
        return (
          <Link
            key={tab.key}
            to={tab.path}
            role="tab"
            aria-selected={active}
            className={`relative flex-1 py-2.5 text-center text-[13px] transition ${
              active ? 'font-semibold text-foreground' : 'text-muted-foreground'
            }`}
          >
            {t(tab.labelKey)}
            <span
              className={`absolute bottom-0 left-1/2 h-[2.5px] w-7 -translate-x-1/2 rounded-full bg-primary transition-opacity ${
                active ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </Link>
        );
      })}
    </div>
  );
}
